<template>
    <div
        v-show="isVisible"
        class="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg p-3 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
        @click="scrollToTop"
        aria-label="Scroll to Top"
    >
        <div class="flex flex-col items-center text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent transition-colors">
            <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span class="text-xs font-medium">Top</span>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref(false)

const handleScroll = () => {
    if (import.meta.client) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        isVisible.value = scrollTop > 300
    }
}

const scrollToTop = () => {
    if (import.meta.client) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
}

onMounted(() => {
    if (import.meta.client) {
        window.addEventListener('scroll', handleScroll)
        handleScroll() // Initial check
    }
})

onUnmounted(() => {
    if (import.meta.client) {
        window.removeEventListener('scroll', handleScroll)
    }
})
</script>
