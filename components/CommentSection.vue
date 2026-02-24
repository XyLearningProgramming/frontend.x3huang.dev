<template>
  <div class="comment-section w-full max-w-4xl mx-auto mt-8 mb-8">
    <section id="isso-thread" :data-title="props.title">
      <noscript>
        <div class="neo-border bg-neo-bg p-6">
          <p class="text-neo-black text-center m-0">Comments require JavaScript to be enabled.</p>
        </div>
      </noscript>
    </section>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  threadId?: string
  formTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  threadId: '',
  formTitle: 'Share your thoughts'
})

const route = useRoute()
const threadId = computed(() => props.threadId || route.path)

onMounted(() => {
  const issoThread = document.getElementById('isso-thread')
  if (issoThread) {
    issoThread.setAttribute('data-title', props.title || document.title || '')
    issoThread.setAttribute('data-isso-id', threadId.value)
  }

  if (!document.querySelector('script[src*="isso"]')) {
    const script = document.createElement('script')
    script.src = '/isso/js/embed.min.js'
    script.setAttribute('data-isso', '/isso/')
    script.async = true
    document.head.appendChild(script)
  }
})
</script>

<style scoped>
/* Neobrutalism styling for Isso comments */

:deep(.isso-thread-heading) {
  color: var(--color-neo-black);
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-neo-heading);
  margin-bottom: 16px;
  text-align: left;
}

:deep(.isso-postbox) {
  background: transparent;
  border: none;
  padding: 0;
  margin-bottom: 24px;
}

:deep(.isso-form-wrapper) {
  display: block;
}

:deep(.isso-textarea-wrapper) {
  margin-bottom: 16px;
}

:deep(.isso-textarea) {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: var(--color-neo-bg);
  border: 2px solid var(--color-neo-black);
  border-radius: 0;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  color: var(--color-neo-black);
  box-shadow: 4px 4px 0px 0px var(--color-neo-black);
}

:deep(.isso-textarea:focus) {
  box-shadow: 2px 2px 0px 0px var(--color-neo-black);
  transform: translate(2px, 2px);
}

:deep(.isso-textarea::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}

/* Preview styling */
:deep(.isso-preview) {
  margin-top: 12px;
  padding: 12px;
  background: var(--color-neo-bg);
  border: 2px solid var(--color-neo-black);
  border-radius: 0;
}

:deep(.isso-preview .isso-comment) {
  margin-bottom: 0;
}

:deep(.isso-preview .isso-text-wrapper) {
  color: var(--color-neo-black);
}

:deep(.isso-preview .isso-text p) {
  margin: 0;
  color: var(--color-neo-black);
}

:deep(.isso-auth-section) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

:deep(.isso-input-wrapper) {
  margin: 0;
  flex: 1;
  min-width: 200px;
}

:deep(.isso-input-wrapper label) {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-neo-black);
}

:deep(.isso-input-wrapper input) {
  width: 100%;
  padding: 8px 12px;
  background: var(--color-neo-bg);
  border: 2px solid var(--color-neo-black);
  border-radius: 0;
  outline: none;
  transition: all 0.2s;
  color: var(--color-neo-black);
  box-shadow: 2px 2px 0px 0px var(--color-neo-black);
}

:deep(.isso-input-wrapper input:focus) {
  box-shadow: 1px 1px 0px 0px var(--color-neo-black);
  transform: translate(1px, 1px);
}

:deep(.isso-input-wrapper input::placeholder) {
  color: rgba(0, 0, 0, 0.4);
}

:deep(.isso-post-action) {
  margin: 0;
}

:deep(.isso-post-action input) {
  padding: 8px 16px;
  background: var(--color-neo-yellow);
  border: 2px solid var(--color-neo-black);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-neo-black);
  font-weight: 700;
  box-shadow: 4px 4px 0px 0px var(--color-neo-black);
}

:deep(.isso-post-action input:hover:not(:disabled)) {
  background: var(--color-neo-orange);
  box-shadow: 2px 2px 0px 0px var(--color-neo-black);
  transform: translate(2px, 2px);
}

:deep(.isso-post-action input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Comments layout */
:deep(#isso-root) {
  margin-top: 16px;
}

:deep(.isso-comment-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

:deep(.isso-author) {
  font-weight: 700;
  color: var(--color-neo-black);
}

:deep(.isso-spacer) {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}

:deep(.isso-permalink) {
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
  color: rgba(0, 0, 0, 0.5);
}

:deep(.isso-permalink:hover) {
  color: var(--color-neo-black);
  text-decoration: underline;
}

:deep(.isso-text) {
  margin-bottom: 12px;
  line-height: 1.6;
  color: var(--color-neo-black);
}

:deep(.isso-text p) {
  margin-bottom: 12px;
}

:deep(.isso-text p:last-child) {
  margin-bottom: 0;
}

:deep(.isso-text strong) {
  color: var(--color-neo-black);
  font-weight: 700;
}

:deep(.isso-text code) {
  background: var(--color-neo-black);
  color: var(--color-neo-bg);
  padding: 2px 6px;
  border-radius: 0;
  font-size: 14px;
}

:deep(.isso-text pre) {
  background: var(--color-neo-black);
  color: var(--color-neo-bg);
  border: 2px solid var(--color-neo-black);
  border-radius: 0;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  box-shadow: 4px 4px 0px 0px var(--color-neo-black);
}

:deep(.isso-text pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: var(--color-neo-bg);
}

:deep(.isso-comment-footer) {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

:deep(.isso-votes) {
  font-weight: 700;
  color: var(--color-neo-black);
}

:deep(.isso-upvote),
:deep(.isso-downvote) {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 0;
  text-decoration: none;
  transition: all 0.2s;
}

:deep(.isso-upvote:hover) {
  background: rgba(168, 230, 207, 0.3);
}

:deep(.isso-downvote:hover) {
  background: rgba(255, 107, 107, 0.3);
}

:deep(.isso-upvote.isso-upvoted) {
  background: rgba(168, 230, 207, 0.3);
}

:deep(.isso-downvote.isso-downvoted) {
  background: rgba(255, 107, 107, 0.3);
}

:deep(.isso-reply) {
  text-decoration: none;
  transition: color 0.2s;
  color: rgba(0, 0, 0, 0.5);
}

:deep(.isso-reply:hover) {
  color: var(--color-neo-black);
  text-decoration: underline;
}

:deep(.isso-follow-up) {
  grid-area: follow-up;
  margin-top: 12px;
}

/* No JS fallback */
.no-js-message {
  text-align: center;
}

/* Mobile responsive */
@media (max-width: 640px) {
  :deep(.isso-comment) {
    column-gap: 8px;
    margin-bottom: 16px;
  }

  :deep(.isso-avatar svg) {
    width: 40px;
    height: 40px;
  }

  :deep(.isso-follow-up) {
    margin-top: 12px;
  }

  :deep(.isso-auth-section) {
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.isso-input-wrapper) {
    min-width: auto;
  }
}
</style>
