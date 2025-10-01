# LT Assistant - Vanilla HTML/CSS/JS Version

This is a barebones conversion of the React/TypeScript LT Assistant application to pure HTML, CSS, and vanilla JavaScript.

## 🚀 How to Run

Since this uses **NO node packages**, you can run it in several simple ways:

### Option 1: Simple HTTP Server
```bash
# If you have Python 3
python -m http.server 8000

# If you have Python 2
python -m SimpleHTTPServer 8000

# If you have Node.js (just for the server)
npx http-server . -p 8000
```

### Option 2: Live Server (VS Code Extension)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` 
3. Select "Open with Live Server"

### Option 3: Direct File Opening
You can even open `index.html` directly in your browser, though some features may work better with a local server.

## 📱 Features

### ✅ **Working Features:**
- **Authentication**: Demo login (any email/password works)
- **Routing**: SPA-style navigation between pages
- **Rating System**: 
  - Browse courses, clubs, and teachers
  - Search functionality
  - View and add reviews (simple prompt-based)
  - Tab switching between categories
- **Course Planner**: 
  - Add courses to any semester
  - Remove courses with click
  - Data persists in localStorage
  - Form-based course addition (simplified from drag & drop)
- **Responsive Design**: Works on desktop and mobile
- **Toast Notifications**: Success/error messages

### ❌ **Removed Features:**
- Complex drag & drop (replaced with simple forms)
- Natural language AI chat (simplified to basic form input)
- API calls (using mock data instead)
- Advanced animations and transitions
- All React/TypeScript tooling

## 🗂️ File Structure

```
/
├── index.html      # Main HTML with all page templates
├── styles.css      # Complete CSS styling (replaces Tailwind)
├── main.js         # All JavaScript functionality
└── public/         # Static assets (images)
    ├── logo.png
    ├── sift.png
    └── title-bg.jpg
```

## 💾 Data Storage

- **Authentication**: localStorage (`isLoggedIn`, `userEmail`)
- **Course Planner**: localStorage (`coursePlanner`)  
- **Reviews**: In-memory (resets on page refresh)
- **Mock Data**: Courses, clubs, teachers, and sample reviews

## 🔧 Customization

### Adding New Courses/Clubs/Teachers:
Edit the `window.mockData` object in `main.js`:

```javascript
window.mockData = {
    courses: [ /* add new courses here */ ],
    clubs: [ /* add new clubs here */ ],
    teachers: [ /* add new teachers here */ ]
}
```

### Styling:
- Edit CSS variables in `:root` for color scheme changes
- All styles are in `styles.css` - no external dependencies
- Responsive breakpoints at 768px and 1024px

### Adding New Pages:
1. Add a template in `index.html`
2. Add CSS styles in `styles.css` 
3. Add routing case in `handleRouting()`
4. Add setup function in `setupPageHandlers()`

## ⚡ Performance

- **Zero build step** - just refresh browser to see changes
- **No bundling** - all files load directly
- **Minimal dependencies** - only native web APIs
- **Small footprint** - ~400 lines of CSS, ~500 lines of JS
- **Fast loading** - no React runtime or node_modules

## 🐛 Known Limitations

- Reviews don't persist (would need a backend or more complex localStorage)
- Simple prompt() dialogs for review input (could be improved with custom modals)
- No TypeScript type checking
- No advanced state management patterns
- No automated testing framework

## 📊 Conversion Summary

**Conversion Time**: ~1 week (as estimated)
**Lines Reduced**: ~2000+ lines of React/TS → ~1000 lines vanilla
**Dependencies Removed**: 40+ npm packages → 0 packages
**Functionality Preserved**: ~90% (with simplifications)

---

**Note**: While this vanilla version is fully functional, the React/TypeScript version offers better developer experience, maintainability, and extensibility for future development.
