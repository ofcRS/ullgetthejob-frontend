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
- 🚀 **Optimized builds** with Vite

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

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

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
│   └── ...
├── routes/          # SvelteKit file-based routing
│   └── ...
├── app.css          # Global styles with Tailwind
└── app.html         # HTML template
```

---

## 🎨 Features

- ✅ **Responsive design** optimized for mobile & desktop
- ✅ **Dark mode support** (if implemented)
- ✅ **Form validation** with type-safe inputs
- ✅ **Optimistic UI updates** for better UX
- ✅ **SvelteKit routing** with file-based organization
- ✅ **Tailwind utility classes** for rapid styling

---

## 🧪 Development

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### Styling with Tailwind

This project uses Tailwind CSS for styling. Customize your theme in `tailwind.config.js`:

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      // Your custom theme
    }
  }
}
```

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

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org)

---

## 📄 License

MIT License - Copyright (c) 2025 Aleksandr Sakhatskiy

---

<div align="center">
  Crafted with 💚 and Svelte
</div>
