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
    @apply w-full my-6 rounded-md bg-black border border-light-accent/50 dark:border-dark-accent/50 pt-8 relative overflow-hidden;
}
:slotted(pre) {
    @apply overflow-x-auto px-4 pb-4 text-sm;
    line-height: 1.625;
    counter-reset: lines;
    white-space: pre;
}
@screen md {
    :slotted(pre) {
        @apply text-base;
    }
}
.container pre > code .line {
    @apply break-words;
}
.bottom-container {
    @apply absolute right-0 bottom-4 pr-2 pb-2;
}
@screen md {
    .bottom-container {
        @apply top-10;
    }
}
.copy-container {
    @apply flex;
}
.filename-text {
    @apply absolute top-0 left-4 py-1 text-xs text-white/75;
}
@screen md {
    .filename-text {
        @apply text-sm;
    }
}
.language-text {
    @apply absolute right-0 top-0 bg-light-accent dark:bg-dark-accent text-white px-2 py-1 rounded-bl-md;
}
:slotted(pre code) {
    @apply w-full;
    white-space: pre;
    display: block;
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
    @apply mr-6 inline-block text-right;
    counter-increment: lines;
    content: counter(lines);
    color: rgba(115, 138, 148, 0.4);
    min-width: 2rem;
}
:slotted(pre code .highlight) {
    @apply block -mx-4 pr-4 pl-3 border-l-4 border-light-accent dark:border-dark-accent;
    content: '';
    background-color: #363b46;
}
</style>
