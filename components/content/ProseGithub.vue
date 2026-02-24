<template>
  <div class="prose-github-wrapper">
    <!-- GitHub-style header -->
    <div class="github-header">
      <div class="github-header-content">
        <svg class="w-4 h-4 text-neo-text-muted" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <div class="github-repo-info">
          <span class="font-bold text-sm">{{ repoInfo.owner }}/{{ repoInfo.name }}</span>
          <span class="text-xs text-neo-text-muted font-mono">{{ repoInfo.path }}</span>
        </div>
      </div>
      <a
        v-if="githubLink"
        :href="githubLink"
        target="_blank"
        class="neo-btn bg-neo-green px-3 py-1 text-xs font-bold flex items-center gap-1"
      >
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z" />
          <path d="M6.22 8.22a.75.75 0 001.06 1.06L10.94 6.72a.25.25 0 00-.22-.47H8.25a.75.75 0 010-1.5h3.5c.966 0 1.75.784 1.75 1.75v3.5a.75.75 0 01-1.5 0V7.56a.25.25 0 00-.47-.22L8.28 10.78a.75.75 0 01-1.06-1.06z" />
        </svg>
        View on GitHub
      </a>
    </div>

    <!-- Code block -->
    <div ref="codeContainer" class="code-content" :style="{ maxHeight: (maxHeight || 500) + 'px' }">
      <div v-if="isLoading" class="p-4 text-center text-neo-text-muted font-mono text-sm">Loading code...</div>
      <pre v-else-if="code" class="code-pre"><code>{{ code }}</code></pre>
      <div v-else class="p-4 text-center text-neo-red font-mono text-sm">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  githubUrl?: string
  rawUrl?: string
  scrollToLine?: number
  filename?: string
  language?: string
  maxHeight?: number
}>()

const code = ref<string>('')
const isLoading = ref(true)
const errorMessage = ref('')
const codeContainer = ref<HTMLElement | null>(null)

const parsedInfo = computed(() => {
  const info = {
    owner: '', name: '', branch: '', path: '', filename: '',
    rawUrl: props.rawUrl, githubUrl: props.githubUrl, scrollToLine: props.scrollToLine,
  }
  const sourceUrl = props.githubUrl || props.rawUrl
  if (!sourceUrl) return info

  if (props.githubUrl) {
    try {
      const url = new URL(props.githubUrl)
      const lineMatch = url.hash.match(/L(\d+)/)
      if (lineMatch) info.scrollToLine = parseInt(lineMatch[1], 10)
      info.githubUrl = props.githubUrl.split('#')[0]
      const pathParts = url.pathname.split('/')
      if (url.hostname === 'github.com' && pathParts.length > 4 && pathParts[3] === 'blob') {
        info.owner = pathParts[1]; info.name = pathParts[2]; info.branch = pathParts[4]
        info.path = pathParts.slice(5).join('/'); info.filename = pathParts[pathParts.length - 1]
        info.rawUrl = `https://raw.githubusercontent.com/${info.owner}/${info.name}/${info.branch}/${info.path}`
      }
    } catch { /* Invalid URL */ }
  } else if (props.rawUrl) {
    try {
      const url = new URL(props.rawUrl)
      const pathParts = url.pathname.split('/')
      if (url.hostname === 'raw.githubusercontent.com' && pathParts.length >= 4) {
        info.owner = pathParts[1]; info.name = pathParts[2]; info.branch = pathParts[3]
        info.path = pathParts.slice(4).join('/'); info.filename = pathParts[pathParts.length - 1]
        info.githubUrl = `https://github.com/${info.owner}/${info.name}/blob/${info.branch}/${info.path}`
      }
    } catch { /* Invalid URL */ }
  }
  return info
})

const repoInfo = computed(() => ({ owner: parsedInfo.value.owner, name: parsedInfo.value.name, path: parsedInfo.value.path }))
const githubLink = computed(() => parsedInfo.value.githubUrl)

const fetchCode = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const urlToFetch = parsedInfo.value.rawUrl
  if (!urlToFetch) {
    errorMessage.value = 'Error: No valid githubUrl or rawUrl provided.'
    isLoading.value = false
    return
  }
  try {
    const response = await fetch(urlToFetch)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    code.value = await response.text()
  } catch (error) {
    errorMessage.value = `Failed to load code: ${error}`
    code.value = ''
  } finally {
    isLoading.value = false
  }
}

onMounted(() => { fetchCode() })
</script>

<style scoped>
.prose-github-wrapper {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  border: 2px solid var(--color-neo-black);
  box-shadow: var(--shadow-neo-sm);
  overflow: hidden;
  background: #1e1e2e;
}

.github-header {
  background: #181825;
  border-bottom: 2px solid var(--color-neo-black);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.github-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.github-repo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.code-content {
  overflow: auto;
}

.code-pre {
  margin: 0;
  padding: 1rem;
  background: #1e1e2e;
  color: #cdd6f4;
  font-family: var(--font-neo-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre;
  overflow-x: auto;
}

.code-pre code {
  font-family: inherit;
  background: transparent;
  border: none;
  padding: 0;
}
</style>
