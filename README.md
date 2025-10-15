# 💼 UllGetTheJob Frontend

> **Beautiful, reactive job application assistant built with SvelteKit**  
> Modern UI for CV customization, job search, and AI-powered application generation

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0-FF3E00?logo=svelte)](https://kit.svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Overview

The **UllGetTheJob Frontend** is a sleek, type-safe web application that makes job hunting effortless. Built with SvelteKit and Tailwind CSS, it provides:

- 📤 **CV Upload** - Parse PDF/DOCX with AI, or import from HH.ru
- 🔍 **Smart Job Search** - Context-aware search with CV integration
- ✨ **AI Customization** - Real-time CV optimization with diff highlighting
- ✍️ **Cover Letter Editor** - Editable, AI-generated letters
- 📊 **Skill Matching** - Visual comparison between CV and job requirements
- 🔄 **Real-time Updates** - WebSocket job notifications
- 📱 **Responsive Design** - Mobile-first, works on all devices

---

## 🎨 Design Features

### UI Highlights

- **Progress Stepper**: Visual workflow with 4 steps
- **Three-Column Customize View**: Original CV | Job Description | Customized CV
- **Diff Highlighting**: Green for additions, amber for changes
- **Skill Match Calculator**: Real-time percentage match
- **Sticky Columns**: Independent scrolling for better UX
- **Loading States**: Smooth transitions and feedback
- **CV History**: View and select previously uploaded CVs

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **pnpm** (recommended) or npm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open browser at http://localhost:5173
```

### Build for Production
```bash
# Create optimized build
pnpm run build

# Preview production build
pnpm run preview
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:
```bash
# API Endpoints
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3000/ws"
VITE_CORE_URL="http://localhost:4000"

# Optional: Enable debug mode
VITE_DEBUG="true"
```

### Vite Configuration
```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy API requests during dev
      '/api': 'http://localhost:3000'
    }
  }
})
```

---

## 📁 Project Structure
```
src/
├── routes/                     # SvelteKit file-based routing
│   ├── +page.svelte           # Landing page
│   ├── +layout.svelte         # Global layout with stepper
│   ├── upload/
│   │   ├── +page.svelte       # Step 1: CV upload
│   │   └── +page.ts           # Load AI models
│   ├── search/
│   │   └── +page.svelte       # Step 2: Job search
│   ├── jobs/
│   │   ├── +page.svelte       # Step 3: Customize (3-col)
│   │   └── [id]/+page.svelte  # Job details (deprecated)
│   ├── application/
│   │   └── [id]/+page.svelte  # Step 4: Submit
│   └── cv/
│       ├── +page.svelte       # CV viewer
│       └── [id]/+page.svelte  # CV by ID
├── lib/
│   ├── components/
│   │   ├── StepIndicator.svelte     # Progress stepper
│   │   ├── CVDisplay.svelte         # CV renderer
│   │   ├── CVDiff.svelte            # Change highlighter
│   │   ├── CoverLetterEditor.svelte # Textarea with counter
│   │   ├── JobCard.svelte           # Job listing card
│   │   ├── SkillChip.svelte         # Skill badge
│   │   └── Loader.svelte            # Loading spinner
│   ├── stores/
│   │   ├── cv.store.ts              # Uploaded/customized CV state
│   │   ├── jobs.store.ts            # Job search state
│   │   ├── ws.store.ts              # WebSocket connection
│   │   └── app.store.ts             # Global app state
│   ├── api/
│   │   ├── cv.api.ts                # CV API calls
│   │   ├── jobs.api.ts              # Job search API
│   │   └── models.api.ts            # AI model catalog
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── app.css                     # Global styles (Tailwind)
├── app.html                    # HTML template
└── hooks.server.ts             # Server hooks (if needed)
```

---

## 🎨 Styling

### Tailwind Configuration
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        accent: '#10B981'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
```

### Custom CSS Classes
```css
/* app.css */
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.column-card {
  @apply card sticky top-24 max-h-[calc(100vh-200px)] overflow-y-auto;
}

.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500;
}
```

---

## 🧩 Key Components

### Progress Stepper
```svelte
<!-- StepIndicator.svelte -->
<script lang="ts">
  export let currentStep: number
  
  const steps = [
    { number: 1, label: 'Upload CV', path: '/upload' },
    { number: 2, label: 'Search Jobs', path: '/search' },
    { number: 3, label: 'Customize', path: '/jobs' },
    { number: 4, label: 'Apply', path: '/application' }
  ]
</script>

<nav class="flex justify-center mb-8">
  {#each steps as step, i}
    <a href={step.path} class="flex items-center">
      <span class="
        w-10 h-10 rounded-full flex items-center justify-center
        {currentStep === step.number ? 'bg-blue-600 text-white' : 'bg-gray-200'}
      ">
        {step.number}
      </span>
      <span class="ml-2">{step.label}</span>
    </a>
  {/each}
</nav>
```

### CV Display with Diff
```svelte
<!-- CVDiff.svelte -->
<script lang="ts">
  import type { ParsedCV } from '$lib/types'
  export let original: ParsedCV
  export let customized: ParsedCV

  $: skillsAdded = customized.skills?.filter(
    s => !original.skills?.includes(s)
  ) || []
</script>

<div class="diff-summary">
  <h4>Changes Made</h4>
  
  {#if skillsAdded.length}
    <div class="mt-2">
      <p class="text-sm font-semibold">Added Skills:</p>
      <div class="flex flex-wrap gap-2">
        {#each skillsAdded as skill}
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            + {skill}
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>
```

---

## 🔌 State Management

### Stores (Svelte Stores with SessionStorage)
```typescript
// cv.store.ts
import { writable } from 'svelte/store'
import type { ParsedCV } from '$lib/types'

function persisted<T>(key: string, initial: T) {
  const store = writable<T>(initial)
  
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(key)
    if (stored) store.set(JSON.parse(stored))
    
    store.subscribe(val => {
      sessionStorage.setItem(key, JSON.stringify(val))
    })
  }
  
  return store
}

export const uploadedCv = persisted<ParsedCV | null>('uploadedCv', null)
export const customizedCv = persisted<CustomizedCV | null>('customizedCv', null)
export const coverLetter = persisted<string>('coverLetter', '')
export const selectedModel = persisted<string>('selectedModel', 'anthropic/claude-3.5-sonnet')
```

---

## 🔄 Real-time Features

### WebSocket Integration
```typescript
// ws.store.ts
import { writable } from 'svelte/store'

export const wsConnection = writable<WebSocket | null>(null)
export const wsStatus = writable<'disconnected' | 'connecting' | 'connected'>('disconnected')

export function connectWebSocket(url: string, clientId: string) {
  wsStatus.set('connecting')
  
  const ws = new WebSocket(url)
  wsConnection.set(ws)
  
  ws.onopen = () => {
    wsStatus.set('connected')
    ws.send(JSON.stringify({ type: 'register', clientId }))
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    // Handle messages (cv_progress, new_jobs, etc.)
  }
  
  ws.onclose = () => wsStatus.set('disconnected')
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile first */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops (enable 3-col grid) */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

### Example Grid
```svelte
<!-- Three-column layout (stacks on mobile) -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <div class="lg:col-span-4"><!-- Original CV --></div>
  <div class="lg:col-span-4"><!-- Job Description --></div>
  <div class="lg:col-span-4"><!-- Customized CV --></div>
</div>
```

---

## 🧪 Testing
```bash
# Type checking
pnpm run check

# Watch mode
pnpm run check:watch

# Build test
pnpm run build
```

### Type Safety
```typescript
// types/index.ts
export interface ParsedCV {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  title?: string
  summary?: string
  experience?: string
  education?: string
  skills?: string[]
  projects?: string
  fullText: string
}

export interface CustomizedCV extends ParsedCV {
  matchedSkills?: string[]
  addedKeywords?: string[]
}

export interface JobItem {
  id: string
  hh_vacancy_id?: string
  title: string
  company: string
  salary?: string
  area?: string
  description: string
  url?: string
  skills?: string[]
  has_test?: boolean
}
```

---

## 🎯 User Flows

### 1. Upload CV Flow
```
┌─────────────┐
│   Landing   │
│   Page      │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Upload File     ┌──────────────┐
│   Upload    ├──────────────────► │ API: Parse   │
│   Page      │◄─────────────────┤ │ CV with AI   │
└──────┬──────┘    Return CV      └──────────────┘
       │
       ▼
┌─────────────┐
│  CV Preview │
│  (Optional) │
└──────┬──────┘
       │
       ▼ Auto-navigate
┌─────────────┐
│   Search    │
│   Page      │
└─────────────┘
```

### 2. Customize Flow
```
┌─────────────┐
│   Search    │
│   Jobs      │
└──────┬──────┘
       │ Click job
       ▼
┌─────────────────────────────────────────┐
│           Customize Screen              │
├─────────────┬─────────────┬─────────────┤
│  Original   │     Job     │ Customized  │
│     CV      │ Description │     CV      │
└─────────────┴─────────────┴─────────────┘
       │
       │ Click "Generate"
       ▼
┌─────────────────────────────────────────┐
│  AI Customizes CV + Generates Letter    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Diff View: Highlights Changes          │
│  • Added skills: green badges           │
│  • Modified experience: highlights      │
│  • Skill match percentage               │
└──────────────┬──────────────────────────┘
               │
               ▼ Continue
┌─────────────┐
│   Apply     │
│   Page      │
└─────────────┘
```

---

## 🚀 Deployment

### Static Adapter
```bash
# Install adapter
pnpm add -D @sveltejs/adapter-static

# svelte.config.js
import adapter from '@sveltejs/adapter-static'

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: true
    })
  }
}
```

### Vercel
```bash
# Install Vercel adapter
pnpm add -D @sveltejs/adapter-vercel

# Deploy
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build
EXPOSE 5173
CMD ["pnpm", "run", "preview", "--host", "0.0.0.0"]
```

---

## 🎨 Design System

### Colors
```css
/* Primary palette */
--color-primary: #2563EB;    /* Blue-600 */
--color-accent: #10B981;     /* Emerald-500 */
--color-success: #10B981;    /* Emerald-500 */
--color-warning: #F59E0B;    /* Amber-500 */
--color-error: #EF4444;      /* Red-500 */

/* Neutrals */
--color-gray-50: #F9FAFB;
--color-gray-900: #111827;
```

### Typography
```css
/* Font scale (1.250 - Major Third) */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.25rem;    /* 20px */
--text-xl: 1.563rem;   /* 25px */
--text-2xl: 1.953rem;  /* 31px */
--text-3xl: 2.441rem;  /* 39px */
```

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/awesome-feature`
2. Make changes and test locally
3. Run type checking: `pnpm run check`
4. Commit: `git commit -m "Add awesome feature"`
5. Push: `git push origin feature/awesome-feature`
6. Create Pull Request

### Code Style

- Use TypeScript for type safety
- Follow SvelteKit conventions
- Use Tailwind utility classes
- Keep components small and focused
- Write self-documenting code

---

## 📖 Additional Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Tutorial](https://learn.svelte.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📄 License

MIT License © 2025 Aleksandr Sakhatskii

---

<div align="center">
  <strong>Crafted with 💚 and Svelte</strong>
  <br>
  <sub>Making job applications delightful</sub>
</div>