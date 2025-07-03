<template>
    <div class="prose-pre-wrapper">
        <!-- https://github.com/Hetari/vuejs-code-block -->
        <ClientOnly>
            <CodeBlock :code="code || ''" :language="(language as any) || 'text'" theme="oceanicNext" :numbered="true"
                :show-header="true" :file-name="filename || undefined" />
        </ClientOnly>
        <!-- <div class="attribution">
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Powered by <a href="https://github.com/Hetari/vuejs-code-block" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">vuejs-code-block</a> ⭐
            </p>
        </div> -->
    </div>
</template>

<script setup lang="ts">
// Refactored to use https://github.com/Hetari/vuejs-code-block
import { CodeBlock } from 'vuejs-code-block';

const props = withDefaults(
    defineProps<{
        code?: string;
        language?: string | null;
        filename?: string | null;
        highlights?: Array<number>;
    }>(),
    { code: '', language: null, filename: null, highlights: [] }
);
</script>

<style scoped>
.prose-pre-wrapper {
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
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
