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
      <a v-if="githubUrl" :href="githubUrl" target="_blank" class="github-view-button">
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
    <div class="code-block-container" :style="{ '--max-height': (maxHeight || 500) + 'px' }">
      <ClientOnly>
        <CodeBlock :code="code || 'Loading...'" :language="(detectedLanguage as any) || 'text'" theme="oceanicNext"
          :numbered="true" :show-header="false" :file-name="displayFilename" :scroll-to-line="scrollToLine" />
      </ClientOnly>
    </div>

    <!-- Attribution footer -->
    <div class="github-attribution">
      <div class="attribution-content">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          <span v-if="scrollToLine">Line {{ scrollToLine }} • </span>
          <!-- <span>{{ repoInfo.owner }}/{{ repoInfo.name }}</span> -->
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          Fetched from GitHub
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CodeBlock } from 'vuejs-code-block'

const props = defineProps<{
  /** Raw URL to a GitHub file (e.g. 'https://raw.githubusercontent.com/...') */
  rawUrl?: string
  /** GitHub URL to the original file for linking */
  githubUrl?: string
  /** Line number to scroll to when loading */
  scrollToLine?: number
  /** Custom filename to display */
  filename?: string
  /** Custom language for syntax highlighting */
  language?: string
  /** Maximum height in pixels (default: 500px) */
  maxHeight?: number
}>()

const code = ref<string>('')
const isLoading = ref(true)

const detectedLanguage = computed(() => {
  if (props.language) return props.language
  if (!props.rawUrl) return 'text'

  // Extract file extension from URL
  const urlParts = props.rawUrl.split('/')
  const filename = urlParts[urlParts.length - 1]
  const extension = filename.split('.').pop()?.toLowerCase()

  // Map common extensions to languages
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'sh': 'bash',
    'bash': 'bash',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'md': 'markdown',
    'sql': 'sql',
    'dockerfile': 'dockerfile',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'ini',
    'gitignore': 'gitignore',
    'vue': 'vue',
    'svelte': 'svelte'
  }

  return languageMap[extension || ''] || 'text'
})

const displayFilename = computed(() => {
  if (props.filename) return props.filename
  if (!props.rawUrl) return 'Unknown file'

  const urlParts = props.rawUrl.split('/')
  return urlParts[urlParts.length - 1]
})

const repoInfo = computed(() => {
  if (!props.rawUrl) return { owner: '', name: '', path: '' }

  // Extract repository information from raw URL
  // Format: https://raw.githubusercontent.com/owner/repo/branch/path/to/file
  const urlParts = props.rawUrl.replace('https://raw.githubusercontent.com/', '').split('/')
  if (urlParts.length < 3) return { owner: '', name: '', path: '' }

  const owner = urlParts[0]
  const name = urlParts[1]
  const branch = urlParts[2]
  const path = urlParts.slice(3).join('/')

  return { owner, name, path, branch }
})

const githubUrl = computed(() => {
  if (props.githubUrl) return props.githubUrl
  if (!props.rawUrl) return null

  // Convert raw URL to GitHub URL
  let url = props.rawUrl
    .replace('https://raw.githubusercontent.com/', 'https://github.com/')
    .replace('/main/', '/blob/main/')
    .replace('/master/', '/blob/master/')

  // Add line anchor if scrollToLine is specified
  if (props.scrollToLine) {
    url += `#L${props.scrollToLine}`
  }

  return url
})

const fetchCode = async () => {
  if (!props.rawUrl) {
    code.value = 'No rawUrl provided'
    isLoading.value = false
    return
  }

  try {
    const response = await fetch(props.rawUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    code.value = await response.text()
  } catch (error) {
    code.value = `Failed to load: ${error}`
  } finally {
    isLoading.value = false
  }
}

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

/* Attribution footer */
.github-attribution {
  background: #161b22;
  border-top: 1px solid #30363d;
  padding: 8px 16px;
}

.attribution-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
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
  /* Remove all padding */
  min-height: 1.2em !important;
  /* Very compact line height */
  height: auto !important;
  /* Allow natural height for wrapped content */
  line-height: 1.2 !important;
  /* Force line height */
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

.prose-github-wrapper :deep(.file-name) {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 14px !important;
}

.prose-github-wrapper :deep(.file-name img) {
  width: 20px !important;
  height: 20px !important;
}

.prose-github-wrapper :deep(.actions) {
  display: flex !important;
  align-items: center !important;
}

/* This rule is now handled above with scrolling */

/* Highlight the scrolled-to line */
.prose-github-wrapper :deep(.line.highlighted) {
  background: rgba(255, 255, 0, 0.1) !important;
}

/* Style the code block container */
.prose-github-wrapper :deep(.code-block-container) {
  background: #0d1117 !important;
  border: none !important;
  border-radius: 0 !important;
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
.prose-github-wrapper :deep(.css-1uawpjz)::-webkit-scrollbar {
  width: 12px;
}

.prose-github-wrapper :deep(.css-1uawpjz)::-webkit-scrollbar-track {
  background: #161b22;
  border-radius: 6px;
  border: 1px solid #30363d;
}

.prose-github-wrapper :deep(.css-1uawpjz)::-webkit-scrollbar-thumb {
  background: #484f58;
  border-radius: 6px;
  border: 2px solid #161b22;
}

.prose-github-wrapper :deep(.css-1uawpjz)::-webkit-scrollbar-thumb:hover {
  background: #6e7681;
}

.prose-github-wrapper :deep(.css-1uawpjz)::-webkit-scrollbar-thumb:active {
  background: #8b949e;
}

/* Firefox scrollbar styling */
.prose-github-wrapper :deep(.css-1uawpjz) {
  scrollbar-width: thin;
  scrollbar-color: #484f58 #161b22;
}
</style>
