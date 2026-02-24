<template>
  <div class="min-h-screen py-16 px-4" style="background: var(--color-dali-void);">
    <div class="container mx-auto max-w-screen-xl">
      <!-- Back navigation -->
      <div class="mb-6">
        <button @click="$router.push('/tools')"
          class="dali-btn inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold">
          <IconsArrowLeft class="w-4 h-4" />
          Back to Tools
        </button>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h1 class="font-bold mb-2 text-dali-white" style="transform: rotate(-1deg);">JSON Editor</h1>
        <p class="text-lg text-dali-muted max-w-2xl leading-relaxed">
          Edit, format, and validate JSON data with a powerful online editor.
        </p>
      </div>

      <!-- JSON Editor -->
      <div>
        <div class="dali-card p-4 relative h-[calc(100vh-280px)]" style="border-color: var(--color-dali-muted);">
          <div class="h-full flex">
            <!-- Left panel -->
            <div class="flex-1 flex flex-col">
              <div ref="leftEditorContainer" class="flex-1 border-2 border-dali-muted/30"></div>
            </div>

            <!-- Action buttons between panels -->
            <div class="flex flex-col justify-center items-center gap-4 px-4">
              <button @click="comparePanels"
                class="dali-btn px-3 py-2 bg-dali-red text-dali-white text-sm font-bold"
                title="Compare JSON data">
                ≈
              </button>
              <button @click="copyLeftToRight"
                class="dali-btn px-3 py-2 text-sm font-bold"
                style="border-color: var(--color-dali-muted);"
                title="Copy from left to right">
                →
              </button>
              <button @click="copyRightToLeft"
                class="dali-btn px-3 py-2 text-sm font-bold"
                style="border-color: var(--color-dali-muted);"
                title="Copy from right to left">
                ←
              </button>
            </div>

            <!-- Right panel -->
            <div class="flex-1 flex flex-col">
              <div ref="rightEditorContainer" class="flex-1 border-2 border-dali-muted/30"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error display -->
      <div v-if="errorMessage" class="mt-4">
        <div class="p-4 border-2 border-dali-red bg-dali-red/10 text-dali-white font-bold">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Attribution -->
      <div class="fixed bottom-4 right-4 z-10">
        <a href="https://github.com/josdejong/svelte-jsoneditor" target="_blank" rel="noopener noreferrer"
          class="text-xs text-dali-muted/40 hover:text-dali-muted/70 transition-colors" title="Powered by svelte-jsoneditor">
          Powered by svelte-jsoneditor
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createJSONEditor } from 'vanilla-jsoneditor'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const leftEditorContainer = ref<HTMLElement>()
const rightEditorContainer = ref<HTMLElement>()
const errorMessage = ref('')
let leftEditor: any = null
let rightEditor: any = null

const STORAGE_KEYS = {
  LEFT_CONTENT: 'json-editor-left-content',
  RIGHT_CONTENT: 'json-editor-right-content',
  LEFT_MODE: 'json-editor-left-mode',
  RIGHT_MODE: 'json-editor-right-mode'
}

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

const saveContent = (key: string, content: any) => {
  if (process.client) {
    try {
      localStorage.setItem(key, JSON.stringify(content))
    } catch (error) {
      console.warn('Failed to save content:', error)
    }
  }
}

const saveMode = (key: string, mode: string) => {
  if (process.client) {
    try {
      localStorage.setItem(key, mode)
    } catch (error) {
      console.warn('Failed to save mode:', error)
    }
  }
}

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
      rightEditor.update(leftContent)
      saveContent(STORAGE_KEYS.RIGHT_CONTENT, leftContent)
      errorMessage.value = 'Copied from left to right (Ctrl+Z to undo)'
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
      leftEditor.update(rightContent)
      saveContent(STORAGE_KEYS.LEFT_CONTENT, rightContent)
      errorMessage.value = 'Copied from right to left (Ctrl+Z to undo)'
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
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      } else {
        enableDiffHighlighting()
        errorMessage.value = '✗ ONLY IN TREE VIEW: JSON data differs between panels - differences highlighted'

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
  if (!document.getElementById('json-diff-highlighting')) {
    const style = document.createElement('style')
    style.id = 'json-diff-highlighting'
    style.textContent = `
      .jse-contents .jse-value.jse-diff-added {
        background-color: rgba(168, 230, 207, 0.3) !important;
        border-left: 3px solid var(--color-neo-green, #A8E6CF) !important;
        padding-left: 4px !important;
      }
      .jse-contents .jse-value.jse-diff-removed {
        background-color: rgba(255, 107, 107, 0.3) !important;
        border-left: 3px solid var(--color-neo-red, #FF6B6B) !important;
        padding-left: 4px !important;
      }
      .jse-contents .jse-value.jse-diff-changed {
        background-color: rgba(255, 215, 0, 0.3) !important;
        border-left: 3px solid var(--color-neo-yellow, #FFD700) !important;
        padding-left: 4px !important;
      }
    `
    document.head.appendChild(style)
  }

  setTimeout(() => {
    const leftContainer = leftEditorContainer.value
    const rightContainer = rightEditorContainer.value

    if (leftContainer && rightContainer) {
      const leftElements = leftContainer.querySelectorAll('.jse-value')
      const rightElements = rightContainer.querySelectorAll('.jse-value')

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
            saveContent(STORAGE_KEYS.LEFT_CONTENT, updatedContent)
          } catch (error) {
            errorMessage.value = 'Invalid JSON in left panel: ' + (error as Error).message
          }
        },
        onChangeMode: (mode: string) => {
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
            saveContent(STORAGE_KEYS.RIGHT_CONTENT, updatedContent)
          } catch (error) {
            errorMessage.value = 'Invalid JSON in right panel: ' + (error as Error).message
          }
        },
        onChangeMode: (mode: string) => {
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
