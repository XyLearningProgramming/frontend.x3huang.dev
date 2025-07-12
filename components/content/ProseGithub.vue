<template>
  <div class="prose-github-wrapper">
    <!-- GitHub-style header -->
    <div class="github-header">
      <div class="github-header-content">
        <svg class="github-icon" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <div class="github-repo-info">
          <span class="github-repo-name">{{ repoInfo.owner }}/{{ repoInfo.name }}</span>
          <span class="github-file-path">{{ repoInfo.path }}</span>
        </div>
      </div>
      <a v-if="githubLink" :href="githubLink" target="_blank" class="github-view-button">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z" />
          <path
            d="M6.22 8.22a.75.75 0 001.06 1.06L10.94 6.72a.25.25 0 00-.22-.47H8.25a.75.75 0 010-1.5h3.5c.966 0 1.75.784 1.75 1.75v3.5a.75.75 0 01-1.5 0V7.56a.25.25 0 00-.47-.22L8.28 10.78a.75.75 0 01-1.06-1.06z" />
        </svg>
        View on GitHub
      </a>
    </div>

    <!-- Code block -->
    <div ref="codeContainer" class="code-block-container" :style="{ '--max-height': (maxHeight || 500) + 'px' }">
      <div v-if="isLoading" class="loading-indicator">Loading code...</div>
      <ClientOnly v-if="!isLoading && code">
        <CodeBlock :code="code" :language="(detectedLanguage as any) || 'text'" theme="oceanicNext" :numbered="true"
          :show-header="false" :file-name="displayFilename" />
      </ClientOnly>
      <div v-if="!isLoading && !code" class="error-indicator">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { CodeBlock } from 'vuejs-code-block'

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
    owner: '',
    name: '',
    branch: '',
    path: '',
    filename: '',
    rawUrl: props.rawUrl,
    githubUrl: props.githubUrl,
    scrollToLine: props.scrollToLine,
  }

  const sourceUrl = props.githubUrl || props.rawUrl
  if (!sourceUrl) return info

  if (props.githubUrl) {
    try {
      const url = new URL(props.githubUrl)
      const lineMatch = url.hash.match(/L(\d+)/)
      if (lineMatch) {
        info.scrollToLine = parseInt(lineMatch[1], 10)
      }
      info.githubUrl = props.githubUrl.split('#')[0]

      const pathParts = url.pathname.split('/')
      if (url.hostname === 'github.com' && pathParts.length > 4 && pathParts[3] === 'blob') {
        info.owner = pathParts[1]
        info.name = pathParts[2]
        info.branch = pathParts[4]
        info.path = pathParts.slice(5).join('/')
        info.filename = pathParts[pathParts.length - 1]
        info.rawUrl = `https://raw.githubusercontent.com/${info.owner}/${info.name}/${info.branch}/${info.path}`
      }
    } catch (e) { /* Invalid URL */ }
  } else if (props.rawUrl) {
    try {
      const url = new URL(props.rawUrl)
      const pathParts = url.pathname.split('/')
      if (url.hostname === 'raw.githubusercontent.com' && pathParts.length >= 4) {
        info.owner = pathParts[1]
        info.name = pathParts[2]
        info.branch = pathParts[3]
        info.path = pathParts.slice(4).join('/')
        info.filename = pathParts[pathParts.length - 1]
        info.githubUrl = `https://github.com/${info.owner}/${info.name}/blob/${info.branch}/${info.path}`
      }
    } catch (e) { /* Invalid URL */ }
  }

  return info
})

const detectedLanguage = computed(() => {
  if (props.language) return props.language
  const filename = parsedInfo.value.filename
  if (!filename) return 'text'
  const extension = filename.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    'js': 'javascript', 'ts': 'typescript', 'jsx': 'javascript', 'tsx': 'typescript',
    'py': 'python', 'rb': 'ruby', 'php': 'php', 'java': 'java', 'c': 'c', 'cpp': 'cpp',
    'cs': 'csharp', 'go': 'go', 'rs': 'rust', 'sh': 'bash', 'bash': 'bash',
    'yml': 'yaml', 'yaml': 'yaml', 'json': 'json', 'xml': 'xml', 'html': 'html',
    'css': 'css', 'scss': 'scss', 'sass': 'sass', 'md': 'markdown', 'sql': 'sql',
    'dockerfile': 'dockerfile', 'toml': 'toml', 'ini': 'ini', 'conf': 'ini',
    'gitignore': 'gitignore', 'vue': 'vue', 'svelte': 'svelte'
  }
  return languageMap[extension || ''] || 'text'
})

const displayFilename = computed(() => props.filename || parsedInfo.value.filename || 'Loading...')
const repoInfo = computed(() => ({ owner: parsedInfo.value.owner, name: parsedInfo.value.name, path: parsedInfo.value.path }))
const githubLink = computed(() => parsedInfo.value.githubUrl)
const lineToScroll = computed(() => parsedInfo.value.scrollToLine)

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
    code.value = '' // Ensure code is empty on error
  } finally {
    isLoading.value = false
  }
}

watch(code, async (newCode) => {
  if (newCode && lineToScroll.value && codeContainer.value) {
    await nextTick();

    const scrollableElement = codeContainer.value.querySelector('pre');
    const lineElement = codeContainer.value.querySelector(`.line:nth-child(${lineToScroll.value})`) as HTMLElement;

    if (scrollableElement && lineElement) {
      // Calculate position relative to the scrollable parent
      const linePosition = lineElement.offsetTop - scrollableElement.offsetTop;
      // Scroll the line to the top of the scrollable area
      const offset = linePosition;

      scrollableElement.scrollTop = offset;

      // Add permanent highlight class
      lineElement.classList.add('highlighted');
    }
  }
}, { flush: 'post' });


onMounted(() => {
  fetchCode()
})
</script>

<style scoped>
.prose-github-wrapper {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  border: 1px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
  background: #0d1117;
}

.loading-indicator,
.error-indicator {
  padding: 16px;
  color: #8b949e;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  text-align: center;
}

/* GitHub-style header */
.github-header {
  background: #21262d;
  border-bottom: 1px solid #30363d;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.github-header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.github-icon {
  width: 16px;
  height: 16px;
  color: #8b949e;
}

.github-repo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.github-repo-name {
  font-size: 14px;
  font-weight: 600 !important;
  color: #f0f6fc;
}

.github-file-path {
  font-size: 12px;
  color: #8b949e;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.github-view-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #238636;
  color: #ffffff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500 !important;
  transition: background-color 0.2s;
}

.github-view-button:hover {
  background: #2ea043;
}

.github-view-button svg {
  width: 12px;
  height: 12px;
}

/* Code block container with scrolling */
.code-block-container {
  max-height: var(--max-height, 500px);
  overflow-y: auto;
  position: relative;
}

/* Ensure all text in code blocks uses normal font weight */
.prose-github-wrapper :deep(*) {
  font-weight: normal !important;
}

/* Specifically target the code text elements */
.prose-github-wrapper :deep(.line .code-line) {
  font-weight: normal !important;
}

.prose-github-wrapper :deep(.line .code-line div) {
  font-weight: normal !important;
}

.prose-github-wrapper :deep(.line .code-line *) {
  font-weight: normal !important;
}

/* Target the pre element content */
.prose-github-wrapper :deep(pre.css-1uawpjz) {
  font-weight: normal !important;
}

.prose-github-wrapper :deep(pre.css-1uawpjz *) {
  font-weight: normal !important;
}

/* Override glass-ui styles to integrate with GitHub theme */
.prose-github-wrapper :deep(pre) {
  background: #0d1117 !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  font-weight: normal !important;
}

/* Target the specific container class for scrolling */
.prose-github-wrapper :deep(.css-1uawpjz) {
  background: #0d1117 !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  max-height: var(--max-height, 500px) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

/* Hide the default header since we have our own */
.prose-github-wrapper :deep(.header) {
  display: none !important;
}

.prose-github-wrapper :deep(.line) {
  padding: 0 !important;
  min-height: 1.2em !important;
  height: auto !important;
  line-height: 1.2 !important;
  background: transparent !important;
  display: flex !important;
  align-items: flex-start !important;
}

.prose-github-wrapper :deep(.line-number) {
  padding: 0 8px !important;
  color: #5D6D7E !important;
  background: transparent !important;
  min-width: 40px !important;
}

.prose-github-wrapper :deep(.code-line) {
  padding: 0 8px !important;
  background: transparent !important;
  line-height: 1.2 !important;
  height: auto !important;
  display: block !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  white-space: pre-wrap !important;
  font-weight: normal !important;
}

/* Highlight the scrolled-to line */
.prose-github-wrapper :deep(.line.highlighted) {
  background: rgba(255, 255, 0, 0.1) !important;
}

/* Force all elements to use normal font-weight with highest specificity */
.prose-github-wrapper :deep(.line),
.prose-github-wrapper :deep(.line *),
.prose-github-wrapper :deep(.code-line),
.prose-github-wrapper :deep(.code-line *) {
  font-weight: normal !important;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important;
}

/* Custom scrollbar styling for GitHub theme */
.prose-github-wrapper :deep(.code-block-container)::-webkit-scrollbar {
  width: 12px;
}

.prose-github-wrapper :deep(.code-block-container)::-webkit-scrollbar-track {
  background: #161b22;
}

.prose-github-wrapper :deep(.code-block-container)::-webkit-scrollbar-thumb {
  background: #484f58;
  border-radius: 6px;
  border: 3px solid #161b22;
}

.prose-github-wrapper :deep(.code-block-container)::-webkit-scrollbar-thumb:hover {
  background: #6e7681;
}

/* Firefox scrollbar styling */
.prose-github-wrapper :deep(.code-block-container) {
  scrollbar-width: thin;
  scrollbar-color: #484f58 #161b22;
}
</style>