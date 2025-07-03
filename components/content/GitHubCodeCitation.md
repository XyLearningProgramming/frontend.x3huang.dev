# GitHub Code Citation Component

A Vue component for embedding GitHub code snippets with customizable context lines and proper attribution.

## Features

- **Automatic Code Fetching**: Fetches code directly from GitHub's raw API
- **Context Lines**: Configurable number of lines before and after the target lines
- **Syntax Highlighting**: Automatically detects language from file extension
- **Line Number Display**: Shows actual line numbers from the original file
- **Highlighted Lines**: Visually highlights the specific lines referenced in the URL
- **Copy Functionality**: One-click copy of the entire code snippet
- **Responsive Design**: Works well on mobile and desktop
- **Error Handling**: Graceful error handling for invalid URLs or network issues

## Usage

### Basic Usage

```vue
<GitHubCodeCitation 
  url="https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/traefik/values.yaml.gotmpl#L115" 
/>
```

### With Custom Context Lines

```vue
<GitHubCodeCitation 
  url="https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/traefik/values.yaml.gotmpl#L115"
  :context-before="5"
  :context-after="5"
/>
```

### Single Line Reference

```vue
<GitHubCodeCitation 
  url="https://github.com/owner/repo/blob/main/src/file.js#L42"
  :context-before="2"
  :context-after="2"
/>
```

### Line Range Reference

```vue
<GitHubCodeCitation 
  url="https://github.com/owner/repo/blob/main/src/file.js#L42-L45"
  :context-before="3"
  :context-after="3"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | **required** | GitHub URL pointing to a specific file or line range |
| `contextBefore` | `number` | `3` | Number of lines to show before the target lines |
| `contextAfter` | `number` | `3` | Number of lines to show after the target lines |

## URL Format

The component accepts GitHub URLs in the following formats:

- **Full file**: `https://github.com/owner/repo/blob/branch/path/to/file.ext`
- **Single line**: `https://github.com/owner/repo/blob/branch/path/to/file.ext#L123`
- **Line range**: `https://github.com/owner/repo/blob/branch/path/to/file.ext#L123-L456`

## Supported Languages

The component automatically detects the programming language based on file extension:

- JavaScript (`.js`)
- TypeScript (`.ts`)
- Python (`.py`)
- Java (`.java`)
- C++ (`.cpp`)
- C (`.c`)
- C# (`.cs`)
- PHP (`.php`)
- Ruby (`.rb`)
- Go (`.go`)
- Rust (`.rs`)
- Kotlin (`.kt`)
- Swift (`.swift`)
- Vue (`.vue`)
- HTML (`.html`)
- CSS (`.css`)
- SCSS (`.scss`)
- JSON (`.json`)
- XML (`.xml`)
- YAML (`.yaml`, `.yml`)
- Markdown (`.md`)
- Bash (`.sh`, `.bash`)
- PowerShell (`.ps1`)
- SQL (`.sql`)
- Dockerfile
- Makefile
- TOML (`.toml`)
- INI (`.ini`)
- Config (`.conf`)

## Styling

The component uses Tailwind CSS classes and is designed to work with both light and dark themes. It includes:

- Responsive design that adapts to different screen sizes
- Dark mode support
- Hover effects for interactive elements
- Loading states and error handling
- Highlighted lines for referenced code sections

## Error Handling

The component handles various error scenarios:

- Invalid GitHub URL format
- Network connectivity issues
- File not found (404 errors)
- Invalid line ranges
- Private repositories (403 errors)

## Dependencies

- Vue 3
- VueUse (for clipboard functionality)
- Tailwind CSS
- Icons components (Check, Copy, GitHub)

## Technical Notes

- Fetches code using GitHub's raw content API
- Performs client-side line extraction and highlighting
- Escapes HTML content to prevent XSS attacks
- Uses semantic HTML for accessibility
- Implements proper ARIA attributes for screen readers

## Examples in Markdown

You can use this component in Nuxt Content markdown files:

```markdown
Here's how the Traefik values are configured:

<GitHubCodeCitation 
  url="https://github.com/XyLearningProgramming/helm.x3huang.dev/blob/main/traefik/values.yaml.gotmpl#L115"
  :context-before="5"
  :context-after="5"
/>

This configuration sets up the ingress routing for our application.
```