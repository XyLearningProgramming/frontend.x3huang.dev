export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  thinking: string[]
  toolCalls: ToolCallInfo[]
  error: ChatError | null
  isStreaming: boolean
  statusText: string
}

export interface ToolCallInfo {
  name: string
  status: 'started' | 'completed' | 'error'
  arguments?: Record<string, unknown>
  result?: string
}

export interface ChatError {
  message: string
  code: string
}

interface PersistedState {
  conversationId: string | null
  messages: ChatMessage[]
}

const STORAGE_KEY = 'chatty-conversation'
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function loadPersistedState(): PersistedState {
  if (!import.meta.client) return { conversationId: null, messages: [] }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { conversationId: null, messages: [] }
    const parsed = JSON.parse(raw) as PersistedState
    if (parsed.messages) {
      parsed.messages = parsed.messages.map(m => ({ ...m, isStreaming: false, statusText: '' }))
    }
    return parsed
  } catch {
    return { conversationId: null, messages: [] }
  }
}

function persistState(state: PersistedState): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded — silently ignore */ }
}

export const useChatty = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.chattyApiUrl as string

  const persisted = loadPersistedState()
  const messages = ref<ChatMessage[]>(persisted.messages)
  const conversationId = ref<string | null>(persisted.conversationId)
  const isStreaming = ref(false)

  let abortController: AbortController | null = null
  let requestGeneration = 0

  function save() {
    persistState({
      conversationId: conversationId.value,
      messages: messages.value,
    })
  }

  function clearConversation() {
    abortController?.abort()
    abortController = null
    messages.value = []
    conversationId.value = null
    isStreaming.value = false
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  function cancelStreaming() {
    abortController?.abort()
  }

  async function retryLast(): Promise<void> {
    if (isStreaming.value) return
    const len = messages.value.length
    if (len < 2) return
    const lastAi = messages.value[len - 1]
    const lastUser = messages.value[len - 2]
    if (lastAi.role !== 'ai' || !lastAi.error || lastUser.role !== 'user') return
    const query = lastUser.content
    messages.value.splice(len - 2, 2)
    save()
    await sendMessage(query)
  }

  function abortCurrentStream() {
    if (!abortController) return
    abortController.abort()
    abortController = null
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg?.role === 'ai' && lastMsg.isStreaming) {
      lastMsg.isStreaming = false
      lastMsg.statusText = ''
    }
    isStreaming.value = false
  }

  async function sendMessage(query: string): Promise<void> {
    if (!query.trim()) return
    if (isStreaming.value) abortCurrentStream()

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: query,
      thinking: [],
      toolCalls: [],
      error: null,
      isStreaming: false,
      statusText: '',
    }
    messages.value.push(userMsg)

    messages.value.push({
      id: generateId(),
      role: 'ai',
      content: '',
      thinking: [],
      toolCalls: [],
      error: null,
      isStreaming: true,
      statusText: 'Connecting...',
    })
    const aiMsg = messages.value[messages.value.length - 1]
    isStreaming.value = true
    save()

    const generation = ++requestGeneration
    abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController?.abort(), REQUEST_TIMEOUT_MS)

    try {
      const payload: Record<string, string> = { query }
      if (conversationId.value) payload.conversation_id = conversationId.value

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/plain' },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      })

      if (response.status === 429) {
        console.warn('[chatty] Rate limited (429)')
        aiMsg.error = { message: 'Too many requests. Please try again later.', code: 'RATE_LIMIT' }
        return
      }

      if (response.status === 503 || response.status === 502) {
        console.warn(`[chatty] Service unavailable (${response.status})`)
        aiMsg.error = { message: 'Chat service is temporarily unavailable. Please try again later.', code: 'SERVICE_UNAVAILABLE' }
        return
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        console.error(`[chatty] HTTP ${response.status}:`, errorText)
        aiMsg.error = { message: 'Something went wrong. Please try again.', code: 'HTTP_ERROR' }
        return
      }

      aiMsg.statusText = 'Connected, generating response...'

      const convHeader = response.headers.get('X-Chatty-Conversation')
      if (convHeader) conversationId.value = convHeader

      if (!response.body) {
        console.error('[chatty] Empty response body')
        aiMsg.error = { message: 'Something went wrong. Please try again.', code: 'EMPTY_RESPONSE' }
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        while (buffer.includes('\n\n')) {
          const idx = buffer.indexOf('\n\n')
          const eventBlock = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 2)

          for (const line of eventBlock.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const dataStr = trimmed.slice(6)
            try {
              const event = JSON.parse(dataStr)
              handleEvent(aiMsg, event)
            } catch { /* malformed JSON line — skip */ }
          }
        }
      }
    } catch (err: unknown) {
      if (generation !== requestGeneration) return
      console.error('[chatty] Request failed:', err)
      if (err instanceof DOMException && err.name === 'AbortError') {
        if (!aiMsg.error) {
          aiMsg.error = { message: 'Request timed out. Please try again.', code: 'TIMEOUT' }
        }
      } else if (err instanceof TypeError) {
        aiMsg.error = { message: 'Could not connect to chat service.', code: 'CONNECTION_ERROR' }
      } else {
        aiMsg.error = { message: 'Something went wrong. Please try again.', code: 'UNEXPECTED_ERROR' }
      }
    } finally {
      clearTimeout(timeoutId)
      if (generation === requestGeneration) {
        abortController = null
        isStreaming.value = false
      }
      aiMsg.isStreaming = false
      aiMsg.statusText = ''
      save()
    }
  }

  function handleEvent(aiMsg: ChatMessage, event: Record<string, unknown>): void {
    const type = event.type as string

    switch (type) {
      case '_metadata': {
        const cid = event.conversation_id as string | undefined
        if (cid) conversationId.value = cid
        break
      }
      case 'queued': {
        const position = event.position ?? '?'
        aiMsg.statusText = `Queued (position ${position})...`
        break
      }
      case 'thinking':
        if (typeof event.content === 'string' && event.content) {
          aiMsg.statusText = ''
          aiMsg.thinking.push(event.content)
        }
        break
      case 'content':
        if (typeof event.content === 'string') {
          aiMsg.statusText = ''
          aiMsg.content += event.content
        }
        break
      case 'tool_call': {
        const name = (event.name as string) || 'unknown'
        const status = (event.status as ToolCallInfo['status']) || 'started'
        const existing = aiMsg.toolCalls.find(t => t.name === name && t.status === 'started')
        if (existing && status !== 'started') {
          existing.status = status
          if (typeof event.result === 'string') existing.result = event.result
        } else {
          aiMsg.toolCalls.push({
            name,
            status,
            arguments: event.arguments as Record<string, unknown> | undefined,
            result: typeof event.result === 'string' ? event.result : undefined,
          })
        }
        break
      }
      case 'error': {
        const serverMsg = (event.message as string) || ''
        const serverCode = (event.code as string) || 'UNKNOWN'
        console.error('[chatty] Server error event:', serverCode, serverMsg)
        aiMsg.error = {
          message: 'Something went wrong. Please try again.',
          code: serverCode,
        }
        break
      }
    }
  }

  return {
    messages: readonly(messages),
    conversationId: readonly(conversationId),
    isStreaming: readonly(isStreaming),
    sendMessage,
    retryLast,
    clearConversation,
    cancelStreaming,
  }
}
