# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LT Assistant Frontend — a course planning and rating system for high school students. Built with React 19, Vite, Tailwind CSS 4, and React Router 7 (HashRouter).

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (localhost:8000)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`. In production, the API base URL is configured in `src/config.js` (defaults to `https://api.ltassistant.com`). Set the `VITE_API_BASE_URL` env var to override.

## Architecture

**React SPA** with hash-based routing (`/#/login`, `/#/dashboard`, `/#/rating`, `/#/planner`, `/#/onboarding`).

### Project Structure

```
src/
├── App.jsx              # Root component, route definitions
├── main.jsx             # Entry point, renders App into #root
├── config.js            # API base URL config
├── index.css            # Global styles (imports Tailwind)
├── components/
│   ├── home/            # Dashboard page
│   ├── landing/         # Landing/marketing page
│   ├── login/           # Login, Signup, Confirm pages
│   ├── onboarding/      # Onboarding flow
│   ├── planner/         # Course planner with drag-and-drop
│   ├── rating/          # Course/club/teacher ratings
│   └── ui/              # Shared UI (Modal, StarRating, ThemeToggle, etc.)
├── contexts/
│   ├── AuthContext.jsx   # Auth state + Google Sign-In
│   ├── PlannerContext.jsx
│   ├── ThemeContext.jsx  # Dark/light mode
│   └── ToastContext.jsx  # Toast notifications
├── hooks/               # Custom hooks (drag-and-drop, animations, parallax)
├── utils/               # API helpers, constants, bad word filter
└── assets/
```

### Routing

HashRouter with protected routes. Auth-required pages wrap in `<ProtectedRoute>`. Routes: `/`, `/login`, `/signup`, `/confirm/:token`, `/dashboard`, `/onboarding`, `/rating`, `/planner`.

### State Management

React Context for global state (auth, theme, planner, toasts). No external state library.

### Adding a New Page

1. Create component in `src/components/<page-name>/`
2. Add route in `src/App.jsx`
3. Wrap in `<ProtectedRoute>` if auth is required

## Styling

- Tailwind CSS 4 via `@tailwindcss/vite` plugin
- Custom theme in `tailwind.config.js`: primary color `#c42525`, Figtree/Syne fonts, glassmorphic shadows
- Dark mode via `[data-theme="dark"]` selector strategy
- Responsive design with Tailwind breakpoints

## Key Features by Page

- **Landing** (`/`): Marketing/intro page
- **Rating** (`/rating`): Tabbed browsing of courses/clubs/teachers, review system with star ratings, search and filter
- **Planner** (`/planner`): 4-year course schedule with drag-and-drop, integrated chatbot
- **Onboarding** (`/onboarding`): Profile setup flow
- **Auth**: Google Sign-In + email signup with confirmation flow

## Deployment

- **Vercel**: Configured via `vercel.json` (build command: `npm run build`, output: `dist/`)
- **AWS S3**: Run `npm run build`, upload `dist/` contents to S3 bucket with static website hosting
