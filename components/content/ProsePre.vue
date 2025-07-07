<template>
    <div class="prose-pre-wrapper">
        <!-- Custom C# handler -->
        <div v-if="language === 'csharp' || language === 'c#'" class="code-block">
            <div class="header">
                <div class="file-name">
                    <img width="18"
                        src="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%3e%3cpath%20fill='%23239120'%20d='M1.5%2010.5h3v3h-3zm3%203h3v3h-3zm3-3h3v3h-3zm3%200h3v3h-3zm3-3h3v3h-3zm0%206h3v3h-3zm3-9h3v3h-3zm0%203h3v3h-3z'/%3e%3c/svg%3e"
                        alt="">
                    <span>{{ filename || 'C#' }}</span>
                </div>
                <div class="actions">
                    <button type="button" class="copy-button" @click="copyCode">
                        <svg fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" aria-hidden="true" class="copy-icon" viewBox="0 0 24 24">
                            <path
                                d="M13 10.75h-1.25a2 2 0 0 0-2 2v8.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-8.5a2 2 0 0 0-2-2H19">
                            </path>
                            <path
                                d="M18 12.25h-4a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1ZM13.75 16.25h4.5M13.75 19.25h4.5">
                            </path>
                        </svg>
                    </button>
                </div>
            </div>
            <pre
                class="language-csharp line-numbers"><code class="language-csharp" v-html="highlightedCodeWithLineNumbers"></code></pre>
        </div>

        <!-- Default vuejs-code-block for other languages -->
        <ClientOnly v-else>
            <CodeBlock :code="code || ''" :language="(language as any) || 'text'" theme="oceanicNext" :numbered="true"
                :show-header="true" :file-name="filename || undefined" />
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
// Refactored to use https://github.com/Hetari/vuejs-code-block
import { CodeBlock } from 'vuejs-code-block';
import { computed } from 'vue'

// Import Prism for C# support
import { ref } from 'vue'
const prismLoaded = ref(false)
let Prism: any = null

if (process.client) {
    import('prismjs').then(async (prismModule) => {
        Prism = prismModule.default
        await import('prismjs/components/prism-clike')
        await import('prismjs/components/prism-csharp')
        await import('prismjs/themes/prism-okaidia.css')
        prismLoaded.value = true
    })
}

const props = withDefaults(
    defineProps<{
        code?: string;
        language?: string | null;
        filename?: string | null;
        highlights?: Array<number>;
    }>(),
    { code: '', language: null, filename: null, highlights: [] }
);

const highlightedCodeWithLineNumbers = computed(() => {
    if ((props.language === 'csharp' || props.language === 'c#') && prismLoaded.value && Prism && Prism.languages.csharp) {
        const highlighted = Prism.highlight(props.code || '', Prism.languages.csharp, 'csharp')
        const lines = highlighted.split('\n').filter((line, index, arr) => {
            // Remove last empty line if it exists
            return !(index === arr.length - 1 && line.trim() === '')
        })
        return lines.map((line, index) => {
            const lineNumber = index + 1
            return `<span class="line-number">${lineNumber}</span><span class="line-content">${line}</span>`
        }).join('\n')
    }
    // Return plain text with line numbers if Prism not loaded yet
    if (props.language === 'csharp' || props.language === 'c#') {
        const lines = (props.code || '').split('\n').filter((line, index, arr) => {
            // Remove last empty line if it exists
            return !(index === arr.length - 1 && line.trim() === '')
        })
        return lines.map((line, index) => {
            const lineNumber = index + 1
            return `<span class="line-number">${lineNumber}</span><span class="line-content">${line}</span>`
        }).join('\n')
    }
    return props.code || ''
})

const copyCode = async () => {
    try {
        await navigator.clipboard.writeText(props.code || '')
        // Could add a toast notification here
    } catch (err) {
        console.error('Failed to copy code:', err)
    }
}
</script>

<style scoped>
.prose-pre-wrapper {
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
}

/* Custom C# code block styles */
.code-block {
    background: #272822;
    border: 1px solid #34495E;
    border-radius: 6px;
    overflow: hidden;
}

.code-block .header {
    background: #2C3E50;
    border-bottom: 1px solid #34495E;
    padding: 8px 12px;
    font-size: 14px;
    color: #ECF0F1;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.code-block .file-name {
    display: flex;
    align-items: center;
    gap: 6px;
}

.code-block .file-name img {
    width: 18px;
    height: 18px;
}

.code-block .actions {
    display: flex;
    align-items: center;
}

.code-block .copy-button {
    background: #34495E;
    border: 1px solid #5D6D7E;
    color: #ECF0F1;
    padding: 2px;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    width: 24px;
    height: 24px;
}

.code-block .copy-button:hover {
    background: #5D6D7E;
    border-color: #85929E;
}

.code-block .copy-icon {
    width: 20px;
    height: 20px;
}

.code-block pre {
    background: #272822 !important;
    color: #f8f8f2;
    padding: 0;
    margin: 0;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
    line-height: 1.5;
}

.code-block code {
    background: transparent;
    padding: 0;
    font-family: inherit;
    display: block;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* Line number styles */
.code-block :deep(.line-number) {
    display: inline-block;
    width: 40px;
    padding-right: 10px;
    text-align: right;
    color: #5D6D7E;
    background: #3c3836;
    border-right: 1px solid #34495E;
    margin-right: 10px;
    user-select: none;
    font-size: 12px;
    line-height: 1.5;
}

.code-block :deep(.line-content) {
    display: inline-block;
    padding-left: 8px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: calc(100% - 60px);
}

.code-block code {
    background: transparent;
    padding: 0;
    font-family: inherit;
    display: block;
    white-space: pre;
}

.code-block code::before {
    content: '';
    display: table;
}

.code-block code::after {
    content: '';
    display: table;
    clear: both;
}

/* Prism syntax highlighting for C# */
.code-block :deep(.token.keyword) {
    color: #66d9ef;
}

.code-block :deep(.token.string) {
    color: #e6db74;
}

.code-block :deep(.token.comment) {
    color: #75715e;
}

.code-block :deep(.token.number) {
    color: #ae81ff;
}

.code-block :deep(.token.operator) {
    color: #f92672;
}

.code-block :deep(.token.punctuation) {
    color: #f8f8f2;
}

.code-block :deep(.token.class-name) {
    color: #a6e22e;
}

.code-block :deep(.token.function) {
    color: #a6e22e;
}

.code-block :deep(.token.boolean) {
    color: #ae81ff;
}

.code-block :deep(.token.namespace) {
    color: #f92672;
}

.attribution {
    margin-top: 0.5rem;
    text-align: right;
}

/* Override glass-ui styles to make vuejs-code-block look standard */
.prose-pre-wrapper :deep(pre) {
    background: #1B2631 !important;
    /* Oceanic Next dark background */
    border: 1px solid #34495E !important;
    border-radius: 6px !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    margin: 0 !important;
}

/* Darker header */
.prose-pre-wrapper :deep(.header) {
    background: #2C3E50 !important;
    border-bottom: 1px solid #34495E !important;
    backdrop-filter: none !important;
    padding: 4px 8px !important;
    height: auto !important;
    min-height: 26px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
}

.prose-pre-wrapper :deep(.line) {
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

.prose-pre-wrapper :deep(.line-number) {
    padding: 0 8px !important;
    color: #5D6D7E !important;
    background: transparent !important;
    min-width: 40px !important;
}

.prose-pre-wrapper :deep(.code-line) {
    padding: 0 8px !important;
    background: transparent !important;
    line-height: 1.2 !important;
    height: auto !important;
    display: block !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    white-space: pre-wrap !important;
}

/* .prose-pre-wrapper :deep(.copy-button) {
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
} */

/* .prose-pre-wrapper :deep(.copy-button svg) {
    width: 12px !important;
    height: 12px !important;
} */

.prose-pre-wrapper :deep(.file-name) {
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    font-size: 14px !important;
}

.prose-pre-wrapper :deep(.file-name img) {
    width: 20px !important;
    height: 20px !important;
}

.prose-pre-wrapper :deep(.actions) {
    display: flex !important;
    align-items: center !important;
}

/* .prose-pre-wrapper :deep(.copy-icon) {
    width: 10px !important;
    height: 10px !important;
}

.prose-pre-wrapper :deep(.copy-button:hover) {
    background: #5D6D7E !important;
    border-color: #85929E !important;
} */

/* Remove glass effects from the container */
.prose-pre-wrapper :deep(.css-1uawpjz) {
    background: #1B2631 !important;
    border: 1px solid #34495E !important;
    border-radius: 6px !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    overflow: hidden !important;
}
</style>
