<template>
    <figure class="glass-figure">
        <div class="image-container">
            <img :src="refinedSrc" :alt="alt" :width="width" :height="height" class="glass-image"/>
        </div>
        <figcaption v-if="alt" class="glass-caption">{{ alt }}</figcaption>    
    </figure>
</template>

<script setup lang="ts">
import { withBase } from 'ufo';
import { useRuntimeConfig, computed } from '#imports';

const props = defineProps({
    src: {
        type: String,
        default: ''
    },
    alt: {
        type: String,
        default: ''
    },
    width: {
        type: [String, Number],
        default: undefined
    },
    height: {
        type: [String, Number],
        default: undefined
    }
});

const refinedSrc = computed(() => {
    if (props.src?.startsWith('/') && !props.src.startsWith('//')) {
        return withBase(props.src, useRuntimeConfig().app.baseURL);
    }
    return props.src;
});
</script>

<style scoped>
.glass-figure {
    margin: 1.5rem 0;
    text-align: center;
}

.image-container {
    position: relative;
    display: inline-block;
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 0.5rem;
}

.glass-image {
    display: block;
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.glass-caption {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: rgba(255, 255, 255, 0.75);
    font-style: italic;
    text-align: center;
}
</style>
