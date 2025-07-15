<template>
  <div class="comment-section w-full max-w-4xl mx-auto mt-8 mb-8">
    <!-- Custom form title
    <h3 v-if="props.formTitle" class="form-title text-lg font-medium text-glass mb-4 text-left">
      {{ props.formTitle }}
    </h3> -->

    <section id="isso-thread" :data-title="props.title">
      <noscript>
        <div class="no-js-message p-6 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
          <p class="text-glass text-center m-0 text-shadow-light">Comments require JavaScript to be enabled.</p>
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

// Use current route as thread ID if not provided
const route = useRoute()
const threadId = computed(() => props.threadId || route.path)

onMounted(() => {
  // Set the data-title attribute for Isso
  const issoThread = document.getElementById('isso-thread')
  if (issoThread) {
    issoThread.setAttribute('data-title', props.title || document.title || '')
    issoThread.setAttribute('data-isso-id', threadId.value)
  }

  // Load Isso script if not already loaded
  if (!document.querySelector('script[src*="isso"]')) {
    const script = document.createElement('script')
    script.src = '/isso/js/embed.min.js'
    script.setAttribute('data-isso', '/isso/')
    script.async = true
    document.head.appendChild(script)
  }
})

// TODO: add comment count
// https://isso-comments.de/docs/guides/advanced-integration/#comment-counter
</script>

<style scoped>
/* Glass UI styling for Isso comments */

/* Thread heading styling */
:deep(.isso-thread-heading) {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: left;
}

/* Form styling */
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
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-textarea:focus) {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
}

:deep(.isso-textarea::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

/* Preview styling */
:deep(.isso-preview) {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

:deep(.isso-preview .isso-comment) {
  margin-bottom: 0;
}

:deep(.isso-preview .isso-text-wrapper) {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-preview .isso-text p) {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-input-wrapper input) {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-input-wrapper input:focus) {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
}

:deep(.isso-input-wrapper input::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.isso-post-action) {
  margin: 0;
}

:deep(.isso-post-action input) {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-post-action input:hover:not(:disabled)) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

:deep(.isso-post-action input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Comments layout */
:deep(#isso-root) {
  margin-top: 16px;
}

:deep(.isso-comment) {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

:deep(.isso-avatar) {
  flex-shrink: 0;
}

:deep(.isso-avatar svg) {
  width: 48px;
  height: 48px;
  display: block;
}

:deep(.isso-text-wrapper) {
  flex: 1;
  min-width: 0;
}

:deep(.isso-comment-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

:deep(.isso-author) {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-spacer) {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

:deep(.isso-permalink) {
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
  color: rgba(255, 255, 255, 0.6);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-permalink:hover) {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

:deep(.isso-text) {
  margin-bottom: 12px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-text p) {
  margin-bottom: 12px;
}

:deep(.isso-text p:last-child) {
  margin-bottom: 0;
}

:deep(.isso-text strong) {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-text code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

:deep(.isso-text pre) {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
}

:deep(.isso-text pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: rgba(255, 255, 255, 0.8);
}

:deep(.isso-comment-footer) {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

:deep(.isso-votes) {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-upvote),
:deep(.isso-downvote) {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s;
}

:deep(.isso-upvote:hover) {
  background: rgba(34, 197, 94, 0.2);
}

:deep(.isso-downvote:hover) {
  background: rgba(239, 68, 68, 0.2);
}

:deep(.isso-upvote.isso-upvoted) {
  background: rgba(34, 197, 94, 0.2);
}

:deep(.isso-downvote.isso-downvoted) {
  background: rgba(239, 68, 68, 0.2);
}

:deep(.isso-reply) {
  text-decoration: none;
  transition: color 0.2s;
  color: rgba(255, 255, 255, 0.6);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

:deep(.isso-reply:hover) {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

:deep(.isso-follow-up) {
  margin-left: 60px;
  margin-top: 12px;
}

/* Form title styling */
.form-title {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* No JS fallback */
.no-js-message {
  text-align: center;
}

/* Mobile responsive */
@media (max-width: 640px) {
  :deep(.isso-comment) {
    gap: 8px;
    margin-bottom: 16px;
  }

  :deep(.isso-avatar svg) {
    width: 40px;
    height: 40px;
  }

  :deep(.isso-follow-up) {
    margin-left: 48px;
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