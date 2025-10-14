# 💼 UllGetTheJob Frontend

> **Beautiful SvelteKit job application tracker** 🎨  
> Modern, reactive UI for managing your job hunt with style!

---

## ✨ What's This?

**UllGetTheJob Frontend** is a sleek, modern web application built with SvelteKit. Track your job applications with:

- 🎨 **Beautiful UI** with Tailwind CSS
- ⚡ **Lightning-fast** SvelteKit performance
- 🔄 **Real-time updates** and reactive state management
- 📱 **Responsive design** for all devices
- 🎯 **Type-safe** with TypeScript
- 🧭 **Auto-navigation** and progress-aware flow

---

## 🛠️ Tech Stack

- **SvelteKit 2.0** - Modern meta-framework for Svelte
- **Svelte 4.2** - Reactive UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 3** - Utility-first CSS framework
- **Vite** - Next-generation build tool
- **PostCSS** - CSS transformations

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Or build for production
pnpm run build

# Preview production build
pnpm run preview
```

Visit [`localhost:5173`](http://localhost:5173) to see your app! 🎉

---

## 📚 Available Scripts

```bash
# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Type-check with svelte-check
pnpm run check

# Watch mode for type-checking
pnpm run check:watch

# Install dependencies
pnpm install
```

---

## 🏗️ Project Structure

```
src/
├── lib/             # Shared components & utilities
│   ├── components/  # CVDisplay, CVDiff, etc
│   ├── stores/      # app, cv, jobs stores
│   └── ...
├── routes/          # SvelteKit file-based routing
│   ├── upload/      # CV upload + history + preview
│   ├── search/      # Job search + CV context bar
│   └── jobs/        # Three-column customize view
├── app.css          # Global styles with Tailwind
└── app.html         # HTML template
```

---

## 🎨 Features

- ✅ **Three-column customize layout** (CV | Job | Customized)
- ✅ **Sticky columns** and responsive grid
- ✅ **Diff highlighting** for customized CV changes
- ✅ **Auto-navigation** after key actions
- ✅ **CV history and live preview on upload**
- ✅ **CV context bar on search**

Env vars:
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws
VITE_ORCHESTRATOR_URL=http://localhost:4000
```

---

## 🔗 HH.ru Connect (MVP)

- A "Connect HH.ru" flow is being integrated via API → Core OAuth
- Proxy endpoint: `GET /api/auth/hh/login` returns `{ url, state }`
- Frontend should redirect user to the provided `url`

---

## 🚀 Building for Production

```bash
# Create optimized production build
pnpm run build

# Preview the build locally
pnpm run preview
```

The build output will be in the `build/` directory.

---

## 📖 Learn More

- SvelteKit Documentation
- Svelte Tutorial
- Tailwind CSS
- TypeScript

---

## 📄 License

MIT License © 2025 Aleksandr Sakhatskiy

---

<div align="center">
  Crafted with 💚 and Svelte
</div>
