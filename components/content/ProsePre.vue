<template>
    <div class="container group">
        <span v-if="filename" class="filename-text">
            {{ filename }}
        </span>
        <span v-if="languageText" class="language-text">
            {{ languageText }}
        </span>
        <slot />
        <div class="bottom-container opacity-100 group-hover:md:opacity-100 md:opacity-0 transition-opacity duration-150">
            <div class="copy-container">
                <button
                    @click="copy(code)"
                    class="p-1 text-white border rounded-md border-gray-600 hover:border-light-accent hover:bg-light-accent dark:hover:border-dark-accent dark:hover:bg-dark-accent hover:text-white"
                >
                    <IconsCheck v-if="copied" class="w-5 h-5" width="20" height="20" />
                    <IconsCopy v-else class="w-5 h-5" width="20" height="20" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// https://mokkapps.de/blog/how-to-create-a-custom-code-block-with-nuxt-content-v2/
import { useClipboard } from '@vueuse/core';

const { copy, copied, text } = useClipboard();

const props = withDefaults(
    defineProps<{
        code?: string;
        language?: string | null;
        filename?: string | null;
        highlights?: Array<number>;
    }>(),
    { code: '', language: null, filename: null, highlights: [] }
);

const languageMap: Record<string, { text: string }> = {
    java: {
        text: 'Java'
    },
    javascript: {
        text: 'JavaScript'
    },
    python: {
        text: 'Python'
    }
};

const languageText = computed(() => (props.language ? languageMap[props.language]?.text : null));
</script>

<style scoped>
.container {
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    padding-top: 1.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    position: relative;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

:slotted(pre) {
    overflow-x: auto;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    line-height: 1.625;
    counter-reset: lines;
    white-space: pre;
    background-color: transparent !important;
}

@screen md {
    :slotted(pre) {
        font-size: 1rem;
    }
}

:slotted(pre code) {
    width: 100%;
    white-space: pre;
    display: block;
    background-color: transparent !important;
    border: none !important;
    padding: 0 !important;
    color: rgba(255, 255, 255, 0.85);
}

.container pre > code .line {
    word-wrap: break-word;
}

.bottom-container {
    position: absolute;
    right: 0;
    bottom: 1rem;
    padding-right: 0.5rem;
    padding-bottom: 0.5rem;
}

@screen md {
    .bottom-container {
        top: 2.5rem;
    }
}

.copy-container {
    display: flex;
}

.filename-text {
    position: absolute;
    top: 0;
    left: 1rem;
    padding: 0.25rem 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.75);
}

@screen md {
    .filename-text {
        font-size: 0.875rem;
    }
}

.language-text {
    position: absolute;
    right: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
    padding: 0.25rem 0.5rem;
    border-bottom-left-radius: 0.375rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: none;
    border-right: none;
}

:deep(.line) {
    display: block !important;
    min-height: 1rem;
    white-space: pre-wrap;
}

:slotted(pre code .line) {
    display: block !important;
    min-height: 1rem;
    white-space: pre-wrap;
}

:slotted(pre code .line::before) {
    margin-right: 1.5rem;
    display: inline-block;
    text-align: right;
    counter-increment: lines;
    content: counter(lines);
    color: rgba(115, 138, 148, 0.4);
    min-width: 2rem;
}

:slotted(pre code .line:empty::before),
:slotted(pre code .line:not(:has(span))::before) {
    display: none !important;
    counter-increment: none;
}

:slotted(pre code .highlight) {
    display: block;
    margin-left: -1.25rem;
    margin-right: -1.25rem;
    padding-right: 1.25rem;
    padding-left: 1rem;
    border-left: 4px solid rgba(255, 255, 255, 0.2);
    content: '';
    background-color: rgba(255, 255, 255, 0.05);
}
</style>
