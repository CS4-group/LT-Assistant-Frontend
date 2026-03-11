# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LT Assistant Frontend — a course planning and rating system for high school students. Pure vanilla HTML/CSS/JavaScript SPA with zero dependencies (converted from React/TypeScript).

## Development Commands

```bash
# Start dev server (requires Python 3)
python -m http.server 8000

# Alternative with Node.js
npx http-server . -p 8000
```

No build step, no bundling, no linting configured. Just serve static files and refresh the browser.

The app expects a backend API at `http://localhost:3000` (configured in `main.js` line 6). It degrades gracefully without one.

## Architecture

**Three-file SPA:** `index.html` (templates) + `styles.css` (all styles) + `main.js` (all logic).

### Routing

Hash-based SPA routing (`/#/login`, `/#/`, `/#/rating`, `/#/planner`, `/#/onboarding`). The `handleRouting()` method in the `App` class maps hashes to page templates.

### Page Rendering Pattern

HTML `<template>` elements in `index.html` are cloned into `<div id="app">`. After cloning, `setupPageHandlers(pageName)` dispatches to page-specific setup methods (e.g., `setupRatingHandlers()`, `setupPlannerHandlers()`).

### State Management

Single `App` class instance at `window.app`. State lives as instance properties with localStorage persistence for auth, theme, course planner data, and onboarding status. API responses are cached in instance properties (`courseDetails`, `clubDetails`, `teacherDetails`).

### API Layer

All API calls use `fetch()` with try-catch, hitting endpoints under `this.apiBaseUrl` (e.g., `/api/courses/names`, `/api/reviews`, `/api/planner`). The `plannerRequest()` method is a generic HTTP wrapper for planner endpoints.

### Adding a New Page

1. Add a `<template>` in `index.html`
2. Add a route case in `handleRouting()`
3. Add a setup function in `setupPageHandlers()`
4. Add styles in `styles.css`

## Styling

- CSS custom properties in `:root` for theming (primary color: `#c42525`)
- Dark mode via `[data-theme="dark"]` on `<html>`
- Glassmorphic design using `backdrop-filter: blur()`
- Responsive breakpoints at 768px and 1024px
- Animations use native CSS keyframes (slide, fade, bounce, spin)

## Key Features by Page

- **Rating** (`/#/rating`): Tabbed browsing of courses/clubs/teachers, review system with star ratings, search and filter
- **Planner** (`/#/planner`): 4-year course schedule with drag-and-drop, year tabs with slide animations, integrated chatbot
- **Onboarding** (`/#/onboarding`): 5-step profile setup form
- **Auth**: Google Sign-In + bypass/demo login option
