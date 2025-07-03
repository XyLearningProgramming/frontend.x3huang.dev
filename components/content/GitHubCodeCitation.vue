<template>
  <ClientOnly>
    <div class="github-code-citation">
      <div class="citation-header">
        <div class="repo-info">
          <IconsGithub class="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <a :href="fullUrl || '#'" class="repo-link" target="_blank" rel="noopener noreferrer">
            {{ repoName || 'Loading...' }}/{{ filePath || '' }}
          </a>
          <span v-if="startLine" class="line-info">
            #L{{ startLine }}{{ endLine && endLine !== startLine ? `-L${endLine}` : '' }}
          </span>
        </div>
        <button @click="copyCode" class="copy-button" :disabled="isLoading || !!error">
          <IconsCheck v-if="copied" class="w-4 h-4" />
          <IconsCopy v-else class="w-4 h-4" />
        </button>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <span class="error-message">{{ error }}</span>
      </div>

      <div v-else-if="codeContent" class="code-container">
        <CodeBlock
          :code="codeContent"
          :language="(detectedLanguage as any)"
          theme="oceanicNext"
          :numbered="true"
          :show-header="false"
        />
        <div class="attribution">
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
            Powered by <a href="https://github.com/Hetari/vuejs-code-block" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">vuejs-code-block</a> ⭐
          </p>
        </div>
      </div>

      <div v-else class="error-state">
        <span class="error-message">No content available</span>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { CodeBlock } from 'vuejs-code-block'

interface Props {
  url: string
  contextBefore?: number
  contextAfter?: number
}

const props = withDefaults(defineProps<Props>(), {
  contextBefore: 3,
  contextAfter: 3
})

const { copy, copied } = useClipboard()

const isLoading = ref(true)
const error = ref<string | null>(null)
const codeContent = ref('')
// const highlightedCode = ref('') // Removed as we're using CodeBlock component
const detectedLanguage = ref('')
const repoName = ref('')
const filePath = ref('')
const repoUrl = ref('')
const fullUrl = ref('')
const startLine = ref<number | null>(null)
const endLine = ref<number | null>(null)
const totalLines = ref(0)
const citationInfo = ref<any>(null)
const showCitation = ref(false)

const parseGitHubUrl = (url: string) => {
  const match = url.match(/^https:\/\/github\.com\/([^\/]+\/[^\/]+)\/blob\/([^\/]+)\/(.+?)(?:#L(\d+)(?:-L(\d+))?)?$/)

  if (!match) {
    throw new Error('Invalid GitHub URL format')
  }

  const [, repo, branch, path, start, end] = match

  return {
    repo,
    branch,
    path,
    startLine: start ? parseInt(start) : null,
    endLine: end ? parseInt(end) : null
  }
}

const getFileExtension = (path: string) => {
  const ext = path.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'kt': 'kotlin',
    'swift': 'swift',
    'vue': 'vue',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'ps1': 'powershell',
    'sql': 'sql',
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'conf'
  }

  return langMap[ext || ''] || ext || 'text'
}

const fetchCodeContent = async () => {
  try {
    isLoading.value = true
    error.value = null

    const parsed = parseGitHubUrl(props.url)
    repoName.value = parsed.repo
    filePath.value = parsed.path
    repoUrl.value = `https://github.com/${parsed.repo}`
    fullUrl.value = props.url

    const rawUrl = `https://raw.githubusercontent.com/${parsed.repo}/${parsed.branch}/${parsed.path}`

    const response = await fetch(rawUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }

    const fullContent = await response.text()
    const lines = fullContent.split('\n')
    totalLines.value = lines.length

    let extractedLines: string[]
    let actualStartLine: number
    let actualEndLine: number

    if (parsed.startLine) {
      const specifiedStart = parsed.startLine
      const specifiedEnd = parsed.endLine || parsed.startLine

      actualStartLine = Math.max(1, specifiedStart - props.contextBefore)
      actualEndLine = Math.min(lines.length, specifiedEnd + props.contextAfter)

      extractedLines = lines.slice(actualStartLine - 1, actualEndLine)

      startLine.value = actualStartLine
      endLine.value = actualEndLine
    } else {
      extractedLines = lines
      actualStartLine = 1
      actualEndLine = lines.length
    }

    codeContent.value = extractedLines.join('\n')
    detectedLanguage.value = getFileExtension(parsed.path)

    // Fetch citation info in parallel
    fetchCitationInfo(parsed.repo, parsed.branch)

    // Code content is now handled by CodeBlock component
    // highlightedCode.value is no longer needed
  } catch (err) {
    console.error('GitHubCodeCitation error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load code'
  } finally {
    isLoading.value = false
  }
}

// escapeHtml function removed as CodeBlock component handles escaping

const copyCode = () => {
  copy(codeContent.value)
}

const fetchCitationInfo = async (repo: string, branch: string) => {
  try {
    const citationUrl = `https://raw.githubusercontent.com/${repo}/${branch}/CITATION.cff`
    const response = await fetch(citationUrl)
    
    if (response.ok) {
      const citationText = await response.text()
      citationInfo.value = parseCitationCff(citationText)
    } else {
      // Try alternative locations
      const altUrl = `https://raw.githubusercontent.com/${repo}/${branch}/.github/CITATION.cff`
      const altResponse = await fetch(altUrl)
      if (altResponse.ok) {
        const citationText = await altResponse.text()
        citationInfo.value = parseCitationCff(citationText)
      }
    }
  } catch (err) {
    console.log('No citation file found for repository')
  }
}

const parseCitationCff = (cffContent: string) => {
  const lines = cffContent.split('\n')
  const citation: any = {}
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('title:')) {
      citation.title = trimmed.replace('title:', '').trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('authors:')) {
      citation.authors = []
    } else if (trimmed.includes('family-names:')) {
      if (!citation.authors) citation.authors = []
      const familyName = trimmed.replace(/.*family-names:\s*/, '').replace(/['"]/g, '')
      citation.authors.push({ familyName })
    } else if (trimmed.includes('given-names:')) {
      if (citation.authors && citation.authors.length > 0) {
        const givenName = trimmed.replace(/.*given-names:\s*/, '').replace(/['"]/g, '')
        citation.authors[citation.authors.length - 1].givenName = givenName
      }
    } else if (trimmed.startsWith('doi:')) {
      citation.doi = trimmed.replace('doi:', '').trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('url:')) {
      citation.url = trimmed.replace('url:', '').trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('date-released:')) {
      citation.dateReleased = trimmed.replace('date-released:', '').trim().replace(/['"]/g, '')
    } else if (trimmed.startsWith('version:')) {
      citation.version = trimmed.replace('version:', '').trim().replace(/['"]/g, '')
    }
  }
  
  return citation
}

const formatCitation = (citation: any, repoName: string, repoUrl: string) => {
  if (!citation) return `Source: ${repoName}. Available at: ${repoUrl}`
  
  let formatted = ''
  
  if (citation.authors && citation.authors.length > 0) {
    const authorNames = citation.authors.map((author: any) => 
      `${author.familyName}${author.givenName ? ', ' + author.givenName.charAt(0) + '.' : ''}`
    ).join(', ')
    formatted += authorNames + '. '
  }
  
  if (citation.title) {
    formatted += `"${citation.title}". `
  }
  
  if (citation.version) {
    formatted += `Version ${citation.version}. `
  }
  
  if (citation.dateReleased) {
    formatted += `Released ${citation.dateReleased}. `
  }
  
  if (citation.doi) {
    formatted += `DOI: ${citation.doi}. `
  }
  
  formatted += `Available at: ${repoUrl}`
  
  return formatted
}

onMounted(() => {
  try {
    // Only fetch on client-side
    if (import.meta.client) {
      fetchCodeContent()
    }
  } catch (err) {
    console.error('GitHubCodeCitation mount error:', err)
    error.value = 'Failed to initialize component'
    isLoading.value = false
  }
})
</script>

<style scoped>
.github-code-citation {
  @apply my-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm;
}

.citation-header {
  @apply flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-600;
}

.repo-info {
  @apply flex items-center gap-2 text-sm font-mono;
}

.repo-link {
  @apply text-blue-600 dark:text-blue-400 hover:underline font-medium hover:text-blue-800 dark:hover:text-blue-300;
}

.line-info {
  @apply text-gray-500 dark:text-gray-400 text-xs;
}

.copy-button {
  @apply p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.loading-state {
  @apply flex items-center justify-center p-6 text-gray-600 dark:text-gray-300;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin mr-2;
}

.error-state {
  @apply p-4 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20;
}

.code-container {
  @apply relative;
}

.code-block {
  @apply p-0 m-0 bg-white dark:bg-gray-800 font-mono text-sm overflow-x-auto text-gray-900 dark:text-gray-100;
}

:deep(.line) {
  @apply flex items-start min-h-[1.5rem] px-4 py-0.5;
}

:deep(.line.highlighted) {
  @apply bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500;
}

:deep(.line-number) {
  @apply inline-block w-12 text-right pr-4 text-gray-400 dark:text-gray-500 select-none text-xs;
}

:deep(.line-content) {
  @apply flex-1 whitespace-pre-wrap text-gray-900 dark:text-gray-100;
}

.attribution {
  @apply mt-2 px-4 pb-2;
}

/* Override glass-ui styles to make vuejs-code-block look standard */
.github-code-citation :deep(pre) {
  background: #1B2631 !important; /* Oceanic Next dark background */
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  margin: 0 !important;
}

.github-code-citation :deep(.header) {
  background: #2C3E50 !important; /* Darker header */
  border-bottom: 1px solid #34495E !important;
  backdrop-filter: none !important;
  padding: 8px 12px !important;
}

.github-code-citation :deep(.line) {
  padding: 0 !important; /* Remove all padding */
  min-height: 1.2em !important; /* Very compact line height */
  height: 1.2em !important; /* Force exact height */
  line-height: 1.2 !important; /* Force line height */
  background: transparent !important;
  display: flex !important;
  align-items: center !important;
}

.github-code-citation :deep(.line-number) {
  padding: 0 8px !important;
  color: #5D6D7E !important;
  background: transparent !important;
  min-width: 40px !important;
}

.github-code-citation :deep(.code-line) {
  padding: 0 8px !important;
  background: transparent !important;
  line-height: 1.2 !important;
  height: 1.2em !important;
  display: flex !important;
  align-items: center !important;
}

.github-code-citation :deep(.copy-button) {
  background: #34495E !important;
  border: 1px solid #5D6D7E !important;
  color: #ECF0F1 !important;
  padding: 2px !important;
  border-radius: 3px !important;
  width: 20px !important;
  height: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.github-code-citation :deep(.copy-button svg) {
  width: 10px !important;
  height: 10px !important;
}

.github-code-citation :deep(.copy-button svg path) {
  stroke-width: 1.5 !important;
}

.github-code-citation :deep(.file-name) {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 12px !important;
}

.github-code-citation :deep(.file-name img) {
  width: 12px !important;
  height: 12px !important;
}

.github-code-citation :deep(.actions) {
  display: flex !important;
  align-items: center !important;
}

.github-code-citation :deep(.copy-icon) {
  width: 10px !important;
  height: 10px !important;
}

/* Target any SVG inside copy button more specifically */
.github-code-citation :deep(.copy-button > svg) {
  width: 10px !important;
  height: 10px !important;
  max-width: 10px !important;
  max-height: 10px !important;
}

.github-code-citation :deep(.copy-button:hover) {
  background: #5D6D7E !important;
  border-color: #85929E !important;
}

/* Remove glass effects from the container */
.github-code-citation :deep(.css-1uawpjz) {
  background: #1B2631 !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
}
</style>