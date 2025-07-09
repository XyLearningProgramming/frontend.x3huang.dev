<template>
    <div class="flex flex-col gap-3">
        <template v-for="icon in icons" :key="icon.href">
            <a :href="icon.getHref()" target="_blank" rel="noopener noreferrer"
                class="text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent hover:scale-110 transition-all duration-200 flex items-center justify-center">
                <component :is="icon.icon" :alt="icon.alt" :aria-label="icon.alt" class="w-5 h-5" />
            </a>
        </template>
        
        <!-- Copy Link Button -->
        <button 
            @click="copyLink" 
            class="text-light-text dark:text-dark-text hover:text-light-accent dark:hover:text-dark-accent hover:scale-110 transition-all duration-200 flex items-center justify-center"
            :aria-label="copied ? 'Link copied!' : 'Copy link'"
            :title="copied ? 'Link copied!' : 'Copy link'"
        >
            <svg v-if="!copied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <svg v-else class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Twitter from '../icons/twitter.vue'
import Pinterest from '../icons/pinterest.vue'
import Linkedin from '../icons/linkedin.vue'
import Facebook from '../icons/facebook.vue'
import Gmail from '../icons/gmail.vue'

const props = defineProps({
    headline: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    }
})

const copied = ref(false)

// Get the current URL dynamically - use relative path to avoid hydration mismatch
const getCurrentUrl = () => {
    return props.path
}

const encodedUrl = computed(() => encodeURIComponent(getCurrentUrl()))

const getFullImageUrl = () => {
    if (!props.image) return ''
    if (props.image.startsWith('http')) return props.image
    return `${window.location.origin}${props.image}`
}

const copyLink = async () => {
    if (import.meta.client && navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(window.location.origin + props.path)
            copied.value = true
            setTimeout(() => {
                copied.value = false
            }, 2000)
        } catch (err) {
            console.error('Failed to copy link:', err)
        }
    }
}

const icons = [
    {
        icon: Linkedin,
        alt: 'LinkedIn profile.',
        getHref: () => {
            return `https://www.linkedin.com/sharing/share-offsite/?mini=true&url=${encodedUrl}&title=${encodeURI(
                props.headline
            )}&summary=${encodeURI(props.description)}`;
        }
    },
    {
        icon: Twitter,
        alt: 'Share this story on Twitter.',
        getHref: () => {
            return `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this article about ' + props.headline)}&url=${encodedUrl}`;
        }
    },
    {
        icon: Facebook,
        alt: 'Share this story on Facebook.',
        getHref: () => {
            return `https://facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        }
    },
    {
        icon: Gmail,
        alt: 'Share this story via email.',
        getHref: () => {
            return `mailto:?subject=${encodeURI(props.headline)}&body=Check%20out%20this%20article%20about%20${encodeURI(
                props.headline
            )},%20${encodedUrl}`;
        }
    },
    {
        icon: Pinterest,
        alt: 'Share this story on Pinterest.',
        getHref: () => {
            const imageUrl = getFullImageUrl()
            const baseUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodeURIComponent(props.headline)}`
            return imageUrl ? `${baseUrl}&media=${encodeURIComponent(imageUrl)}` : baseUrl
        }
    }
];
</script>
