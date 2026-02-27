<template>
  <div class="comment-section w-full max-w-4xl mx-auto mt-8 mb-8">
    <section id="isso-thread" :data-title="props.title">
      <noscript>
        <div class="border-2 border-dali-white/15 bg-dali-white/5 p-6">
          <p class="text-dali-muted text-center m-0">Comments require JavaScript to be enabled.</p>
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
    issoThread.setAttribute('data-isso-id', threadId.value)
  }

  if (!import.meta.dev && !document.querySelector('script[src*="isso"]')) {
    const script = document.createElement('script')
    script.src = '/isso/js/embed.min.js'
    script.setAttribute('data-isso', '/isso/')
    script.async = true
    document.head.appendChild(script)
  } else if (import.meta.dev) {
    // Inject mock Isso DOM so :deep() styles render during dev
    injectMockIssoDOM()
  }
})

function injectMockIssoDOM() {
  const thread = document.getElementById('isso-thread')
  if (!thread) return
  thread.innerHTML = `
    <h4 class="isso-thread-heading">Comments</h4>
    <div class="isso-postbox">
      <div class="isso-form-wrapper">
        <div class="isso-textarea-wrapper">
          <textarea class="isso-textarea" placeholder="Type comment here (dev mock)"></textarea>
        </div>
        <div class="isso-auth-section">
          <div class="isso-input-wrapper"><label>Name</label><input placeholder="Name (optional)"></div>
          <div class="isso-input-wrapper"><label>E-mail</label><input placeholder="E-mail (optional)"></div>
          <div class="isso-post-action"><input type="submit" value="Submit"></div>
        </div>
      </div>
    </div>
    <div id="isso-root">
      <div class="isso-comment">
        <div class="isso-comment-header">
          <span class="isso-author">Dev User</span>
          <span class="isso-spacer">&bull;</span>
          <a class="isso-permalink" href="#">2 hours ago</a>
        </div>
        <div class="isso-text">
          <p>This is a <strong>mock comment</strong> with <code>inline code</code> for testing the Dalí theme.</p>
          <pre><code>console.log("hello isso")</code></pre>
        </div>
        <div class="isso-comment-footer">
          <span class="isso-votes">3</span>
          <a class="isso-upvote">&#9650;</a>
          <a class="isso-downvote">&#9660;</a>
          <a class="isso-reply">Reply</a>
        </div>
        <div class="isso-follow-up">
          <div class="isso-comment">
            <div class="isso-comment-header">
              <span class="isso-author">Reply Author</span>
              <span class="isso-spacer">&bull;</span>
              <a class="isso-permalink" href="#">1 hour ago</a>
            </div>
            <div class="isso-text"><p>A nested reply to test follow-up styling.</p></div>
            <div class="isso-comment-footer">
              <span class="isso-votes">1</span>
              <a class="isso-upvote isso-upvoted">&#9650;</a>
              <a class="isso-downvote">&#9660;</a>
              <a class="isso-reply">Reply</a>
            </div>
          </div>
        </div>
      </div>
      <div class="isso-comment">
        <div class="isso-comment-header">
          <span class="isso-author">Another Commenter</span>
          <span class="isso-spacer">&bull;</span>
          <a class="isso-permalink" href="#">30 minutes ago</a>
        </div>
        <div class="isso-text">
          <p>Testing <em>multiple</em> comments and <a href="#">link styling</a>.</p>
        </div>
        <div class="isso-comment-footer">
          <span class="isso-votes">0</span>
          <a class="isso-upvote">&#9650;</a>
          <a class="isso-downvote isso-downvoted">&#9660;</a>
          <a class="isso-reply">Reply</a>
        </div>
      </div>
    </div>
  `
}
</script>

<style scoped>
/* ============================================================
   Dalí-themed styling for Isso comments
   Dark surface compatible (dali-focus-surface)
   ============================================================ */

:deep(.isso-thread-heading) {
  color: var(--color-dali-white);
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-dali-heading);
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
  background: rgba(240, 237, 229, 0.05);
  border: 2px solid rgba(240, 237, 229, 0.15);
  border-radius: 0;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
  color: var(--color-dali-white);
  box-shadow: var(--shadow-dali-void-sm);
}

:deep(.isso-textarea:focus) {
  border-color: var(--color-dali-red);
  box-shadow: var(--shadow-dali-void-sm);
}

:deep(.isso-textarea::placeholder) {
  color: var(--color-dali-muted);
}

/* Preview styling */
:deep(.isso-preview) {
  margin-top: 12px;
  padding: 12px;
  background: rgba(240, 237, 229, 0.05);
  border: 2px solid rgba(240, 237, 229, 0.15);
  border-radius: 0;
}

:deep(.isso-preview .isso-comment) {
  margin-bottom: 0;
}

:deep(.isso-preview .isso-text-wrapper) {
  color: var(--color-dali-white);
}

:deep(.isso-preview .isso-text p) {
  margin: 0;
  color: rgba(240, 237, 229, 0.85);
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
  color: var(--color-dali-white);
}

:deep(.isso-input-wrapper input) {
  width: 100%;
  padding: 8px 12px;
  background: rgba(240, 237, 229, 0.05);
  border: 2px solid rgba(240, 237, 229, 0.15);
  border-radius: 0;
  outline: none;
  transition: all 0.2s;
  color: var(--color-dali-white);
  box-shadow: var(--shadow-dali-void-sm);
}

:deep(.isso-input-wrapper input:focus) {
  border-color: var(--color-dali-red);
  box-shadow: var(--shadow-dali-void-sm);
}

:deep(.isso-input-wrapper input::placeholder) {
  color: var(--color-dali-muted);
}

:deep(.isso-post-action) {
  margin: 0;
}

:deep(.isso-post-action input) {
  padding: 8px 16px;
  background: var(--color-dali-red);
  border: 2px solid var(--color-dali-red);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-dali-white);
  font-weight: 700;
  box-shadow: var(--shadow-dali-void-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.isso-post-action input:hover:not(:disabled)) {
  background: var(--color-dali-gold);
  border-color: var(--color-dali-gold);
  box-shadow: none;
  transform: translate(2px, 2px);
}

:deep(.isso-post-action input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Comments layout ── */
:deep(#isso-root) {
  margin-top: 16px;
}

:deep(.isso-comment) {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(240, 237, 229, 0.1);
  background: rgba(240, 237, 229, 0.03);
}

:deep(.isso-comment-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

:deep(.isso-author) {
  font-weight: 700;
  color: var(--color-dali-white);
}

:deep(.isso-spacer) {
  font-size: 12px;
  color: var(--color-dali-muted);
}

:deep(.isso-permalink) {
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
  color: var(--color-dali-muted);
}

:deep(.isso-permalink:hover) {
  color: var(--color-dali-gold);
  text-decoration: underline;
}

:deep(.isso-text) {
  margin-bottom: 12px;
  line-height: 1.6;
  color: rgba(240, 237, 229, 0.85);
}

:deep(.isso-text p) {
  margin-bottom: 12px;
}

:deep(.isso-text p:last-child) {
  margin-bottom: 0;
}

:deep(.isso-text strong) {
  color: var(--color-dali-white);
  font-weight: 700;
}

:deep(.isso-text code) {
  background: rgba(240, 237, 229, 0.1);
  color: var(--color-dali-gold);
  padding: 2px 6px;
  border-radius: 0;
  font-size: 14px;
}

:deep(.isso-text pre) {
  background: var(--color-dali-void);
  color: var(--color-dali-white);
  border: 1px solid rgba(240, 237, 229, 0.1);
  border-radius: 0;
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  box-shadow: var(--shadow-dali-void-sm);
}

:deep(.isso-text pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: var(--color-dali-white);
}

:deep(.isso-comment-footer) {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

:deep(.isso-votes) {
  font-weight: 700;
  color: var(--color-dali-white);
}

:deep(.isso-upvote),
:deep(.isso-downvote) {
  display: inline-flex;
  align-items: center;
  padding: 4px;
  border-radius: 0;
  text-decoration: none;
  transition: all 0.2s;
  color: var(--color-dali-muted);
}

:deep(.isso-upvote:hover) {
  background: rgba(46, 196, 182, 0.15);
  color: var(--color-dali-teal);
}

:deep(.isso-downvote:hover) {
  background: rgba(237, 28, 36, 0.15);
  color: var(--color-dali-red);
}

:deep(.isso-upvote.isso-upvoted) {
  background: rgba(46, 196, 182, 0.15);
  color: var(--color-dali-teal);
}

:deep(.isso-downvote.isso-downvoted) {
  background: rgba(237, 28, 36, 0.15);
  color: var(--color-dali-red);
}

:deep(.isso-reply) {
  text-decoration: none;
  transition: color 0.2s;
  color: var(--color-dali-muted);
}

:deep(.isso-reply:hover) {
  color: var(--color-dali-gold);
  text-decoration: underline;
}

:deep(.isso-follow-up) {
  grid-area: follow-up;
  margin-top: 12px;
}

/* ── Isso avatar SVG — blend with dark surface ── */
:deep(.isso-avatar svg) {
  border-radius: 0;
  border: 1px solid rgba(240, 237, 229, 0.1);
}

/* ── Mobile responsive ── */
@media (max-width: 640px) {
  :deep(.isso-comment) {
    column-gap: 8px;
    padding: 12px;
    margin-bottom: 12px;
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
