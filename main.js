// Simple SPA Router and State Management
class App {
    constructor() {
        this.currentPage = '';
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check authentication status from localStorage
        this.isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
        
        // Set up initial routing
        this.handleRouting();
        
        // Listen for back/forward navigation
        window.addEventListener('popstate', () => this.handleRouting());
        
        // Set up form handlers
        this.setupEventListeners();
    }

    handleRouting() {
        const path = window.location.hash.slice(1) || '/';
        
        // Redirect to login if not authenticated
        if (!this.isAuthenticated && path !== '/login') {
            this.navigateTo('/login');
            return;
        }
        
        // Redirect to home if authenticated and on login page
        if (this.isAuthenticated && path === '/login') {
            this.navigateTo('/');
            return;
        }

        switch (path) {
            case '/login':
                this.renderPage('login');
                break;
            case '/':
                this.renderPage('home');
                break;
            case '/rating':
                this.renderPage('rating');
                break;
            case '/planner':
                this.renderPage('planner');
                break;
            default:
                this.navigateTo('/');
        }
    }

    renderPage(pageName) {
        const app = document.getElementById('app');
        const template = document.getElementById(`${pageName}-template`);
        
        if (!template) {
            console.error(`Template not found: ${pageName}-template`);
            return;
        }

        // Clear current content and add new page
        app.innerHTML = '';
        const pageContent = template.content.cloneNode(true);
        app.appendChild(pageContent);
        
        // Add fade-in animation
        app.firstElementChild?.classList.add('fade-in');
        
        this.currentPage = pageName;
        
        // Setup page-specific functionality
        this.setupPageHandlers(pageName);
    }

    setupPageHandlers(pageName) {
        switch (pageName) {
            case 'login':
                this.setupLoginHandlers();
                break;
            case 'home':
                this.setupHomeHandlers();
                break;
            case 'rating':
                this.setupRatingHandlers();
                break;
            case 'planner':
                this.setupPlannerHandlers();
                break;
        }
    }

    setupEventListeners() {
        // Global event delegation for navigation
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('[data-nav]');
            if (navLink) {
                e.preventDefault();
                this.navigateTo(navLink.dataset.nav);
            }
        });
    }

    setupLoginHandlers() {
        const form = document.getElementById('login-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });
    }

    setupHomeHandlers() {
        // Home page handlers are inline in the template
        // navigateTo and logout functions are global
    }

    setupRatingHandlers() {
        this.currentTab = 'courses';
        this.selectedItemId = null;
        this.searchQuery = '';
        
        // Setup tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Setup search
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.updateItemsList();
        });

        // Setup add review button (now in header)
        const addReviewBtn = document.getElementById('header-add-review-btn');
        addReviewBtn.addEventListener('click', () => {
            this.openAddReviewModal();
        });

        // Load initial data
        this.updateItemsList();
    }

    setupPlannerHandlers() {
        this.coursePlanner = {
            Freshman: { Fall: [], Spring: [] },
            Sophomore: { Fall: [], Spring: [] },
            Junior: { Fall: [], Spring: [] },
            Senior: { Fall: [], Spring: [] }
        };

        // Load saved planner data
        const saved = localStorage.getItem('coursePlanner');
        if (saved) {
            this.coursePlanner = JSON.parse(saved);
            this.renderPlannerGrid();
        }

        // Setup add course form
        const form = document.getElementById('add-course-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCourse(e);
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update search placeholder
        const searchInput = document.getElementById('search-input');
        searchInput.placeholder = `Search for a ${tabName.slice(0, -1)}...`;
        
        // Update sidebar title
        document.getElementById('sidebar-title').textContent = `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} List`;

        this.updateItemsList();
    }

    updateItemsList() {
        const itemsList = document.getElementById('items-list');
        const data = window.mockData[this.currentTab] || [];
        
        const filteredData = data.filter(item => 
            !this.searchQuery || item.title.toLowerCase().includes(this.searchQuery)
        );

        itemsList.innerHTML = filteredData.map(item => `
            <div class="item-card ${this.selectedItemId === item._id ? 'selected' : ''}" 
                 onclick="window.app.selectItem('${item._id}')">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description}</div>
            </div>
        `).join('');

        // Auto-select first item if none selected
        if (!this.selectedItemId && filteredData.length > 0) {
            this.selectItem(filteredData[0]._id);
        } else if (filteredData.length === 0) {
            this.selectedItemId = null;
            this.updateItemDetails();
        }
    }

    selectItem(itemId) {
        this.selectedItemId = itemId;
        this.updateItemsList(); // Refresh to show selection
        this.updateItemDetails();
        
        // Enable add review button
        document.getElementById('header-add-review-btn').disabled = false;
    }

    updateItemDetails() {
        const itemDetails = document.getElementById('item-details');
        
        if (!this.selectedItemId) {
            itemDetails.innerHTML = '<p>Select an item from the list to see reviews.</p>';
            return;
        }

        const data = window.mockData[this.currentTab] || [];
        const item = data.find(i => i._id === this.selectedItemId);
        
        if (!item) {
            itemDetails.innerHTML = '<p>Item not found.</p>';
            return;
        }

        const reviews = window.mockData.reviews.filter(r => r.itemId === this.selectedItemId);
        
        itemDetails.innerHTML = `
            <h2>Description</h2>
            <p>${item.description}</p>
            <div class="reviews-section">
                <h3>Reviews for ${item.title}</h3>
                ${reviews.length > 0 ? 
                    reviews.map(review => `
                        <div class="review-card">
                            <div class="review-header">
                                <strong>${review.user.name}</strong>
                                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                            </div>
                            <p>${review.comment}</p>
                        </div>
                    `).join('') :
                    '<p>No reviews yet. Be the first to add one!</p>'
                }
            </div>
        `;
    }

    openAddReviewModal() {
        const data = window.mockData[this.currentTab] || [];
        const item = data.find(i => i._id === this.selectedItemId);
        
        if (!item) return;

        const rating = prompt(`Rate ${item.title} (1-5 stars):`);
        const comment = prompt(`Add your comment about ${item.title}:`);
        
        if (rating && comment && rating >= 1 && rating <= 5) {
            const newReview = {
                id: `review-${this.selectedItemId}-${Date.now()}`,
                itemId: this.selectedItemId,
                user: { name: 'Current User', avatarUrl: 'https://i.pravatar.cc/150?u=currentUser' },
                rating: parseInt(rating),
                comment: comment
            };
            
            window.mockData.reviews.push(newReview);
            this.updateItemDetails();
            this.showToast('Review added successfully!', 'success');
        }
    }

    addCourse(e) {
        const formData = new FormData(e.target);
        const courseName = formData.get('course-name').trim();
        const year = formData.get('course-year');
        const term = formData.get('course-term');

        if (!courseName || !year || !term) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Check if course already exists
        const exists = Object.values(this.coursePlanner).some(yearData =>
            Object.values(yearData).some(termCourses =>
                termCourses.some(course => course.name.toLowerCase() === courseName.toLowerCase())
            )
        );

        if (exists) {
            this.showToast('Course already exists in your plan', 'error');
            return;
        }

        // Check if term is full (max 8 courses)
        if (this.coursePlanner[year][term].length >= 8) {
            this.showToast('This term is full (8 courses max)', 'error');
            return;
        }

        // Add course
        const newCourse = {
            id: `course-${Date.now()}`,
            name: courseName,
            description: `${courseName} — overview of topics, projects, and key outcomes.`
        };

        this.coursePlanner[year][term].push(newCourse);
        this.savePlannerData();
        this.renderPlannerGrid();
        
        // Clear form
        e.target.reset();
        this.showToast(`Added ${courseName} to ${year} ${term}`, 'success');
    }

    renderPlannerGrid() {
        Object.entries(this.coursePlanner).forEach(([year, yearData]) => {
            Object.entries(yearData).forEach(([term, courses]) => {
                const slot = document.querySelector(`[data-year="${year}"][data-term="${term}"]`);
                if (slot) {
                    slot.innerHTML = courses.map(course => `
                        <div class="course-item">
                            <span class="course-name">${course.name}</span>
                            <button class="remove-course" onclick="window.app.removeCourse('${course.id}', '${year}', '${term}')">×</button>
                        </div>
                    `).join('');
                }
            });
        });
    }

    removeCourse(courseId, year, term) {
        this.coursePlanner[year][term] = this.coursePlanner[year][term].filter(course => course.id !== courseId);
        this.savePlannerData();
        this.renderPlannerGrid();
        this.showToast('Course removed', 'success');
    }

    savePlannerData() {
        localStorage.setItem('coursePlanner', JSON.stringify(this.coursePlanner));
    }

    async handleLogin(e) {
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.disabled = true;

        setTimeout(() => {
            if (email && password) {
                this.isAuthenticated = true;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                this.navigateTo('/');
                this.showToast('Login successful!', 'success');
            } else {
                this.showToast('Please enter email and password', 'error');
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
                submitBtn.disabled = false;
            }
        }, 1000);
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        this.navigateTo('/login');
        this.showToast('Logged out successfully', 'success');
    }

    navigateTo(path) {
        if (window.location.hash.slice(1) !== path) {
            window.location.hash = path;
        } else {
            this.handleRouting();
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles if not already in CSS
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 6px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }
                .toast-success { background-color: #10b981; }
                .toast-error { background-color: #ef4444; }
                .toast-info { background-color: #3b82f6; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

function navigateTo(path) {
    window.app.navigateTo(path);
}

function logout() {
    window.app.logout();
}

function clearPlanner() {
    if (confirm('Are you sure you want to clear your entire course plan?')) {
        window.app.coursePlanner = {
            Freshman: { Fall: [], Spring: [] },
            Sophomore: { Fall: [], Spring: [] },
            Junior: { Fall: [], Spring: [] },
            Senior: { Fall: [], Spring: [] }
        };
        window.app.savePlannerData();
        window.app.renderPlannerGrid();
        window.app.showToast('Course plan cleared', 'success');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Add some mock data that was previously from API
window.mockData = {
    courses: [
        {
            _id: 'course-1',
            title: 'Tuffematics',
            description: 'How to be tuff'
        }
    ],
    clubs: [
        {
            _id: 'club-1',
            title: 'Tuff Club',
            description: 'tuffness incarnate'
        }
    ],
    teachers: [
        {
            _id: 'teacher-1',
            title: 'Mr. Tuff',
            description: 'tuffness embodied'
        }
    ],
    reviews: [
        {
            id: 'review-course-1-1',
            itemId: 'course-1',
            user: { name: 'Tuff Smith', avatarUrl: 'https://i.pravatar.cc/150?u=alex' },
            rating: 5,
            comment: 'I am very tuff now'
        }
    ]
};
