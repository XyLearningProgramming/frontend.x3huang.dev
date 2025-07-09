<template>
  <BackgroundLayout container-width="full" overlay-intensity="heavy" blur-background>
    <!-- Back navigation -->
    <div class="mb-6">
      <button @click="$router.go(-1)" class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors">
        <IconsArrowLeft class="w-4 h-4" />
        Back
      </button>
    </div>

    <PageHeader title="JSON Editor" description="Edit, format, and validate JSON data with a powerful online editor."
      class="!mb-6" />
    <!-- JSON Editor -->
    <div>
      <GlassCard variant="primary" padding="lg" radius="lg" class="h-[calc(100vh-280px)]">
        <div class="h-full flex">
          <!-- Left panel -->
          <div class="flex-1 flex flex-col">
            <div ref="leftEditorContainer" class="flex-1 border border-white/10 rounded-lg"></div>
          </div>

          <!-- Action buttons between panels -->
          <div class="flex flex-col justify-center items-center gap-4 px-4">
            <button @click="comparePanels"
              class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm"
              title="Compare JSON data">
              ≈
            </button>
            <button @click="copyLeftToRight"
              class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm"
              title="Copy from left to right">
              →
            </button>
            <button @click="copyRightToLeft"
              class="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm"
              title="Copy from right to left">
              ←
            </button>
          </div>

          <!-- Right panel -->
          <div class="flex-1 flex flex-col">
            <div ref="rightEditorContainer" class="flex-1 border border-white/10 rounded-lg"></div>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Error display -->
    <div v-if="errorMessage" class="mt-4">
      <div class="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Attribution -->
    <div class="fixed bottom-4 right-4 z-10">
      <a href="https://github.com/josdejong/svelte-jsoneditor" target="_blank" rel="noopener noreferrer"
        class="text-xs text-white/50 hover:text-white/70 transition-colors"
        title="Powered by svelte-jsoneditor">
        Powered by svelte-jsoneditor
      </a>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import { createJSONEditor } from 'vanilla-jsoneditor'
import GlassCard from '~/components/ui/GlassCard.vue'
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const leftEditorContainer = ref<HTMLElement>()
const rightEditorContainer = ref<HTMLElement>()
const errorMessage = ref('')
let leftEditor: any = null
let rightEditor: any = null

// Storage keys for persistence
const STORAGE_KEYS = {
  LEFT_CONTENT: 'json-editor-left-content',
  RIGHT_CONTENT: 'json-editor-right-content',
  LEFT_MODE: 'json-editor-left-mode',
  RIGHT_MODE: 'json-editor-right-mode'
}

// Load content from localStorage or use defaults
const getStoredContent = (key: string, defaultContent: any) => {
  if (process.client) {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load stored content:', error)
    }
  }
  return defaultContent
}

const defaultLeftContent = {
  json: {
    "name": "JSON Editor",
    "version": "1.0.0",
    "description": "A powerful JSON editor for viewing and editing JSON data",
    "features": [
      "Syntax highlighting",
      "Error validation",
      "Tree view",
      "Text view"
    ],
    "settings": {
      "theme": "light",
      "autoFormat": true,
      "showLineNumbers": true
    }
  }
}

const defaultRightContent = {
  json: {
    "name": "JSON Editor Right",
    "version": "2.0.0",
    "description": "Right panel for comparison and transformation",
    "features": [
      "Dual panel editing",
      "Copy functionality",
      "Transform support",
      "Difference comparison"
    ],
    "settings": {
      "theme": "light",
      "autoFormat": true,
      "showLineNumbers": true
    }
  }
}

const initialLeftContent = getStoredContent(STORAGE_KEYS.LEFT_CONTENT, defaultLeftContent)
const initialRightContent = getStoredContent(STORAGE_KEYS.RIGHT_CONTENT, defaultRightContent)

// Save content to localStorage
const saveContent = (key: string, content: any) => {
  if (process.client) {
    try {
      localStorage.setItem(key, JSON.stringify(content))
    } catch (error) {
      console.warn('Failed to save content:', error)
    }
  }
}

// Save mode to localStorage
const saveMode = (key: string, mode: string) => {
  if (process.client) {
    try {
      localStorage.setItem(key, mode)
    } catch (error) {
      console.warn('Failed to save mode:', error)
    }
  }
}

// Get stored mode
const getStoredMode = (key: string, defaultMode: string = 'tree') => {
  if (process.client) {
    try {
      const stored = localStorage.getItem(key)
      return stored || defaultMode
    } catch (error) {
      console.warn('Failed to load stored mode:', error)
    }
  }
  return defaultMode
}

const copyLeftToRight = () => {
  if (leftEditor && rightEditor) {
    try {
      const leftContent = leftEditor.get()
      rightEditor.set(leftContent)
      saveContent(STORAGE_KEYS.RIGHT_CONTENT, leftContent)
      errorMessage.value = 'Copied from left to right'
      // Clear message after 2 seconds
      setTimeout(() => {
        errorMessage.value = ''
      }, 2000)
    } catch (error) {
      errorMessage.value = 'Error copying content: ' + (error as Error).message
    }
  }
}

const copyRightToLeft = () => {
  if (leftEditor && rightEditor) {
    try {
      const rightContent = rightEditor.get()
      leftEditor.set(rightContent)
      saveContent(STORAGE_KEYS.LEFT_CONTENT, rightContent)
      errorMessage.value = 'Copied from right to left'
      // Clear message after 2 seconds
      setTimeout(() => {
        errorMessage.value = ''
      }, 2000)
    } catch (error) {
      errorMessage.value = 'Error copying content: ' + (error as Error).message
    }
  }
}


const comparePanels = () => {
  try {
    if (leftEditor && rightEditor) {
      // Check if both editors are in tree mode for diff highlighting
      const leftContainer = leftEditorContainer.value
      const rightContainer = rightEditorContainer.value

      const leftIsTreeMode = leftContainer?.querySelector('.jse-contents') !== null
      const rightIsTreeMode = rightContainer?.querySelector('.jse-contents') !== null

      if (!leftIsTreeMode || !rightIsTreeMode) {
        errorMessage.value = '⚠️ Diff highlighting only works in tree view mode. Please switch both panels to tree view.'
        setTimeout(() => {
          errorMessage.value = ''
        }, 4000)
        return
      }

      const leftContent = leftEditor.get()
      const rightContent = rightEditor.get()

      // Handle both text and json content
      let leftData, rightData

      if (leftContent.json) {
        leftData = JSON.stringify(leftContent.json, null, 2)
      } else if (leftContent.text) {
        leftData = leftContent.text
      } else {
        leftData = ''
      }

      if (rightContent.json) {
        rightData = JSON.stringify(rightContent.json, null, 2)
      } else if (rightContent.text) {
        rightData = rightContent.text
      } else {
        rightData = ''
      }

      if (leftData === rightData) {
        errorMessage.value = '✓ JSON data is identical'
        clearDiffHighlighting()
        // Clear message after 3 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      } else {
        // Enable diff highlighting using vanilla-jsoneditor's built-in comparison
        enableDiffHighlighting()
        errorMessage.value = '✗ ONLY IN TREE VIEW: JSON data differs between panels - differences highlighted'

        // Clear message after 5 seconds
        setTimeout(() => {
          errorMessage.value = ''
        }, 5000)
      }
    }
  } catch (error) {
    errorMessage.value = 'Error comparing: ' + (error as Error).message
  }
}

const enableDiffHighlighting = () => {
  // Add diff highlighting CSS for vanilla-jsoneditor
  if (!document.getElementById('json-diff-highlighting')) {
    const style = document.createElement('style')
    style.id = 'json-diff-highlighting'
    style.textContent = `
      /* Diff highlighting for vanilla-jsoneditor */
      .jse-contents .jse-value.jse-diff-added {
        background-color: rgba(34, 197, 94, 0.2) !important;
        border-left: 3px solid #22c55e !important;
        padding-left: 4px !important;
      }
      .jse-contents .jse-value.jse-diff-removed {
        background-color: rgba(239, 68, 68, 0.2) !important;
        border-left: 3px solid #ef4444 !important;
        padding-left: 4px !important;
      }
      .jse-contents .jse-value.jse-diff-changed {
        background-color: rgba(251, 191, 36, 0.2) !important;
        border-left: 3px solid #fbbf24 !important;
        padding-left: 4px !important;
      }
      
      /* Text mode highlighting */
      .jse-text-mode .cm-line.jse-diff-added {
        background-color: rgba(34, 197, 94, 0.15) !important;
        border-left: 3px solid #22c55e !important;
      }
      .jse-text-mode .cm-line.jse-diff-removed {
        background-color: rgba(239, 68, 68, 0.15) !important;
        border-left: 3px solid #ef4444 !important;
      }
      .jse-text-mode .cm-line.jse-diff-changed {
        background-color: rgba(251, 191, 36, 0.15) !important;
        border-left: 3px solid #fbbf24 !important;
      }
      
      /* Enhanced visual indicators */
      .jse-contents .jse-key::after {
        content: "";
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      
      .jse-contents .jse-diff-added .jse-key::after {
        background-color: #22c55e;
      }
      .jse-contents .jse-diff-removed .jse-key::after {
        background-color: #ef4444;
      }
      .jse-contents .jse-diff-changed .jse-key::after {
        background-color: #fbbf24;
      }
    `
    document.head.appendChild(style)
  }

  // Add diff classes to elements (simplified approach)
  setTimeout(() => {
    const leftContainer = leftEditorContainer.value
    const rightContainer = rightEditorContainer.value

    if (leftContainer && rightContainer) {
      // Add visual diff indicators
      const leftElements = leftContainer.querySelectorAll('.jse-value')
      const rightElements = rightContainer.querySelectorAll('.jse-value')

      // Simple diff highlighting - this is a basic implementation
      // In a real scenario, you'd need more sophisticated diff logic
      leftElements.forEach((el, index) => {
        if (rightElements[index]) {
          const leftText = el.textContent
          const rightText = rightElements[index].textContent

          if (leftText !== rightText) {
            el.classList.add('jse-diff-changed')
            rightElements[index].classList.add('jse-diff-changed')
          }
        }
      })
    }
  }, 100)
}

const clearDiffHighlighting = () => {
  // Remove diff classes
  const allElements = document.querySelectorAll('.jse-diff-added, .jse-diff-removed, .jse-diff-changed')
  allElements.forEach(el => {
    el.classList.remove('jse-diff-added', 'jse-diff-removed', 'jse-diff-changed')
  })
}

onMounted(() => {
  if (leftEditorContainer.value) {
    leftEditor = createJSONEditor({
      target: leftEditorContainer.value,
      props: {
        content: initialLeftContent,
        mainMenuBar: true,
        statusBar: true,
        navigationBar: true,
        readOnly: false,
        mode: getStoredMode(STORAGE_KEYS.LEFT_MODE, 'tree'),
        onChange: (updatedContent: any) => {
          errorMessage.value = ''
          try {
            if (updatedContent.text && !updatedContent.json) {
              JSON.parse(updatedContent.text)
            }
            // Save content to localStorage on change
            saveContent(STORAGE_KEYS.LEFT_CONTENT, updatedContent)
          } catch (error) {
            errorMessage.value = 'Invalid JSON in left panel: ' + (error as Error).message
          }
        },
        onChangeMode: (mode: string) => {
          // Save mode to localStorage when changed
          saveMode(STORAGE_KEYS.LEFT_MODE, mode)
        },
        onError: (error: any) => {
          errorMessage.value = 'Left panel error: ' + error.toString()
        }
      }
    })
  }

  if (rightEditorContainer.value) {
    rightEditor = createJSONEditor({
      target: rightEditorContainer.value,
      props: {
        content: initialRightContent,
        mainMenuBar: true,
        statusBar: true,
        navigationBar: true,
        readOnly: false,
        mode: getStoredMode(STORAGE_KEYS.RIGHT_MODE, 'tree'),
        onChange: (updatedContent: any) => {
          errorMessage.value = ''
          try {
            if (updatedContent.text && !updatedContent.json) {
              JSON.parse(updatedContent.text)
            }
            // Save content to localStorage on change
            saveContent(STORAGE_KEYS.RIGHT_CONTENT, updatedContent)
          } catch (error) {
            errorMessage.value = 'Invalid JSON in right panel: ' + (error as Error).message
          }
        },
        onChangeMode: (mode: string) => {
          // Save mode to localStorage when changed
          saveMode(STORAGE_KEYS.RIGHT_MODE, mode)
        },
        onError: (error: any) => {
          errorMessage.value = 'Right panel error: ' + error.toString()
        }
      }
    })
  }
})

onUnmounted(() => {
  if (leftEditor) {
    leftEditor.destroy()
  }
  if (rightEditor) {
    rightEditor.destroy()
  }
})

useHead({
  title: 'JSON Editor - Tools - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Free online JSON editor with syntax highlighting, validation, and multiple view modes. Edit, format, and validate JSON data easily.' }
  ]
})
</script>

<style>
/* Custom styles for json-editor-vue to match the glass theme */
.jsoneditor {
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px) !important;
}

.jsoneditor-menu {
  background: rgba(255, 255, 255, 0.1) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.jsoneditor-menu>button {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.jsoneditor-menu>button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.jsoneditor-contextmenu {
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.jsoneditor-contextmenu .jsoneditor-menu li button {
  color: white !important;
}

.jsoneditor-contextmenu .jsoneditor-menu li button:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.jsoneditor-outer {
  background: transparent !important;
}

.jsoneditor-tree {
  background: rgba(255, 255, 255, 0.05) !important;
  color: white !important;
}

.jsoneditor-tree .jsoneditor-value {
  color: #e0e0e0 !important;
}

.jsoneditor-tree .jsoneditor-string {
  color: #a8e6cf !important;
}

.jsoneditor-tree .jsoneditor-number {
  color: #ffd93d !important;
}

.jsoneditor-tree .jsoneditor-boolean {
  color: #ff6b6b !important;
}

.jsoneditor-tree .jsoneditor-null {
  color: #888 !important;
}

.jsoneditor-tree .jsoneditor-key {
  color: #87ceeb !important;
}

.ace-jsoneditor {
  background: rgba(255, 255, 255, 0.05) !important;
  color: white !important;
}

.ace-jsoneditor .ace_gutter {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}

.ace-jsoneditor .ace_gutter-active-line {
  background: rgba(255, 255, 255, 0.1) !important;
}

.ace-jsoneditor .ace_marker-layer .ace_active-line {
  background: rgba(255, 255, 255, 0.1) !important;
}

.jsoneditor-statusbar {
  background: rgba(255, 255, 255, 0.1) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}
</style>