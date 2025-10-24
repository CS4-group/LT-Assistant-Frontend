// Simple SPA Router and State Management
class App {
    constructor() {
        this.currentPage = '';
        this.isAuthenticated = false;
        this.apiBaseUrl = 'http://localhost:3000'; // Configure your API base URL here
        this.courseNames = []; // Cache for course names
        this.courseDetails = {}; // Cache for individual course details
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

    // API Helper Functions
    async fetchCourseNames() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/courses/names`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                this.courseNames = result.data;
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch course names');
            }
        } catch (error) {
            console.error('Error fetching course names:', error);
            this.showToast('Failed to load courses. Please try again.', 'error');
            return [];
        }
    }

    async fetchCourseDetails(courseId) {
        // Check cache first
        if (this.courseDetails[courseId]) {
            return this.courseDetails[courseId];
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/courses/${courseId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Course not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                // Cache the result
                this.courseDetails[courseId] = result.data;
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch course details');
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            this.showToast(`Failed to load course details: ${error.message}`, 'error');
            return null;
        }
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
        this.loadInitialData();
    }

    async loadInitialData() {
        // Show loading state
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = '<div class="loading-state">Loading courses...</div>';
        
        if (this.currentTab === 'courses') {
            await this.fetchCourseNames();
        }
        
        this.updateItemsList();
    }

    setupPlannerHandlers() {
        this.coursePlanner = {
            Freshman: { Fall: [], Spring: [] },
            Sophomore: { Fall: [], Spring: [] },
            Junior: { Fall: [], Spring: [] },
            Senior: { Fall: [], Spring: [] }
        };

        this.expandedYear = null; // Track which year is expanded

        // Load saved planner data
        const saved = localStorage.getItem('coursePlanner');
        if (saved) {
            this.coursePlanner = JSON.parse(saved);
            this.renderPlannerGrid();
        }

        // Setup year expansion click handlers
        this.setupYearExpansion();

        // Setup chatbot functionality
        this.setupChatbot();
    }

    setupYearExpansion() {
        const yearSections = document.querySelectorAll('.year-section');
        yearSections.forEach(section => {
            const yearTitle = section.querySelector('.year-title');
            if (yearTitle) {
                yearTitle.style.cursor = 'pointer';
                yearTitle.addEventListener('click', () => {
                    const year = section.dataset.year;
                    this.toggleYearExpansion(year);
                });
            }
        });
    }

    toggleYearExpansion(year) {
        if (this.expandedYear === year) {
            // Collapse back to grid view
            this.expandedYear = null;
            this.renderGridView();
        } else {
            // Expand this year
            this.expandedYear = year;
            this.renderExpandedView(year);
        }
    }

    renderGridView() {
        const plannerGrid = document.querySelector('.planner-grid');
        const yearSections = document.querySelectorAll('.year-section');
        
        // Show all year sections
        yearSections.forEach(section => {
            section.style.display = 'block';
            section.classList.remove('expanded');
        });
        
        // Reset grid layout
        plannerGrid.style.gridTemplateColumns = '1fr 1fr';
        
        // Remove back button if exists
        const backButton = document.querySelector('.back-to-grid-btn');
        if (backButton) {
            backButton.remove();
        }
    }

    renderExpandedView(year) {
        const plannerGrid = document.querySelector('.planner-grid');
        const yearSections = document.querySelectorAll('.year-section');
        
        // Hide all year sections except the selected one
        yearSections.forEach(section => {
            if (section.dataset.year === year) {
                section.style.display = 'block';
                section.classList.add('expanded');
            } else {
                section.style.display = 'none';
            }
        });
        
        // Change grid layout to single column
        plannerGrid.style.gridTemplateColumns = '1fr';
        
        // Add back button if it doesn't exist
        if (!document.querySelector('.back-to-grid-btn')) {
            const backButton = document.createElement('button');
            backButton.className = 'btn btn-outline back-to-grid-btn';
            backButton.textContent = '← Back to All Years';
            backButton.onclick = () => this.toggleYearExpansion(year);
            
            const plannerHeader = document.querySelector('.planner-header .header-right');
            plannerHeader.insertBefore(backButton, plannerHeader.firstChild);
        }
    }

    async switchTab(tabName) {
        this.currentTab = tabName;
        this.selectedItemId = null;
        
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

        // Clear main content
        document.getElementById('item-details').innerHTML = '<p>Select an item from the list to see reviews.</p>';
        
        // Disable add review button until item is selected
        document.getElementById('header-add-review-btn').disabled = true;

        // Load data for the selected tab
        if (tabName === 'courses') {
            await this.loadInitialData();
        } else {
            this.updateItemsList();
        }
    }

    updateItemsList() {
        const itemsList = document.getElementById('items-list');
        let data = [];
        
        // Use API data for courses, mock data for others
        if (this.currentTab === 'courses') {
            data = this.courseNames;
        } else {
            data = window.mockData[this.currentTab] || [];
        }
        
        const filteredData = data.filter(item => 
            !this.searchQuery || item.title.toLowerCase().includes(this.searchQuery)
        );

        // Handle empty data
        if (filteredData.length === 0) {
            itemsList.innerHTML = this.currentTab === 'courses' && this.courseNames.length === 0
                ? '<div class="loading-state">No courses available</div>'
                : '<div class="loading-state">No items found</div>';
            this.selectedItemId = null;
            this.updateItemDetails();
            return;
        }

        // Use appropriate ID field based on data source
        const getItemId = (item) => this.currentTab === 'courses' ? item.id : item._id;
        const getItemDescription = (item) => this.currentTab === 'courses' ? 'Click to view details' : item.description;

        itemsList.innerHTML = filteredData.map(item => {
            const itemId = getItemId(item);
            const isSelected = String(this.selectedItemId) === String(itemId);
            return `
                <div class="item-card ${isSelected ? 'selected' : ''}" 
                     onclick="window.app.selectItem('${itemId}')">
                    <div class="item-title">${item.title}</div>
                    <div class="item-description">${getItemDescription(item)}</div>
                </div>
            `;
        }).join('');

        // Auto-select first item if none selected
        if (!this.selectedItemId && filteredData.length > 0) {
            this.selectItem(getItemId(filteredData[0]));
        } else if (filteredData.length === 0) {
            this.selectedItemId = null;
            this.updateItemDetails();
        }
    }

    async selectItem(itemId) {
        this.selectedItemId = String(itemId); // Ensure consistent string storage
        this.updateItemsList(); // Refresh to show selection
        
        // Show loading state for course details
        if (this.currentTab === 'courses') {
            document.getElementById('item-details').innerHTML = '<div class="loading-state">Loading course details...</div>';
        }
        
        await this.updateItemDetails();
        
        // Enable add review button
        document.getElementById('header-add-review-btn').disabled = false;
    }

    async updateItemDetails() {
        const itemDetails = document.getElementById('item-details');
        
        if (!this.selectedItemId) {
            itemDetails.innerHTML = '<p>Select an item from the list to see reviews.</p>';
            return;
        }

        let item = null;
        
        // Handle courses vs other items differently
        if (this.currentTab === 'courses') {
            // Fetch full course details from API
            item = await this.fetchCourseDetails(this.selectedItemId);
            if (!item) {
                itemDetails.innerHTML = '<p>Failed to load course details.</p>';
                return;
            }
        } else {
            // Use mock data for other tabs
            const data = window.mockData[this.currentTab] || [];
            item = data.find(i => i._id === this.selectedItemId);
            if (!item) {
                itemDetails.innerHTML = '<p>Item not found.</p>';
                return;
            }
        }

        // Get reviews (still from mock data for now - this could be extended later)
        const reviews = window.mockData.reviews.filter(r => r.itemId === this.selectedItemId);
        
        itemDetails.innerHTML = `
            <h2>${item.title}</h2>
            <h3>Description</h3>
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

    async openAddReviewModal() {
        let item = null;
        
        // Get item details based on current tab
        if (this.currentTab === 'courses') {
            item = this.courseDetails[this.selectedItemId];
            if (!item) {
                // If not cached, fetch it
                item = await this.fetchCourseDetails(this.selectedItemId);
            }
        } else {
            const data = window.mockData[this.currentTab] || [];
            item = data.find(i => i._id === this.selectedItemId);
        }
        
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
            await this.updateItemDetails();
            this.showToast('Review added successfully!', 'success');
        }
    }

    setupChatbot() {
        const chatbotInput = document.getElementById('chatbot-input');
        const chatbotSend = document.getElementById('chatbot-send');

        const sendMessage = () => {
            const message = chatbotInput.value.trim();
            if (!message) return;

            // Add user message to chat
            this.addChatMessage(message, 'user');
            
            // Clear input
            chatbotInput.value = '';

            // Process the message
            this.processChatbotMessage(message);
        };

        chatbotSend.addEventListener('click', sendMessage);
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    addChatMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<p>${message}</p>`;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    processChatbotMessage(message) {
        // Parse the message to extract course information
        const courseInfo = this.parseCourseinfoFromMessage(message);
        
        if (courseInfo) {
            const { courseName, year, term } = courseInfo;
            
            // Check if we have all required information
            if (!courseName) {
                this.addChatMessage("I couldn't identify a course name in your message. Could you please specify which course you'd like to add?", 'bot');
                return;
            }

            if (!year || !term) {
                this.addChatMessage(`I understand you want to add "${courseName}", but I need to know which year and term. Please specify something like "Freshman Fall" or "Senior Spring".`, 'bot');
                return;
            }

            // Try to add the course
            const result = this.addCourseFromChatbot(courseName, year, term);
            
            if (result.success) {
                this.addChatMessage(`Great! I've added "${courseName}" to your ${year} ${term} schedule. 📚`, 'bot');
            } else {
                this.addChatMessage(result.message, 'bot');
            }
        } else {
            // Provide helpful suggestions
            this.addChatMessage(`I'd be happy to help you add courses! Try saying something like:
            <br><br>• "Add AP Biology to Junior Fall"
            <br>• "I want to take Spanish 2 in Sophomore Spring"  
            <br>• "Put Calculus in Senior Fall"
            <br><br>What course would you like to add to your schedule?`, 'bot');
        }
    }

    parseCourseinfoFromMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Extract course name patterns
        let courseName = null;
        
        // Pattern: "add [course] to [year] [term]"
        let match = lowerMessage.match(/(?:add|put)\s+([^to]+?)\s+to\s+(\w+)\s+(\w+)/i);
        if (match) {
            courseName = match[1].trim();
            const year = this.capitalizeFirst(match[2]);
            const term = this.capitalizeFirst(match[3]);
            return { courseName, year, term };
        }

        // Pattern: "I want to take [course] in [year] [term]"
        match = lowerMessage.match(/(?:i want to take|take)\s+([^in]+?)\s+in\s+(\w+)\s+(\w+)/i);
        if (match) {
            courseName = match[1].trim();
            const year = this.capitalizeFirst(match[2]);
            const term = this.capitalizeFirst(match[3]);
            return { courseName, year, term };
        }

        // Pattern: "[course] [year] [term]" (simple format)
        match = lowerMessage.match(/^([^]+?)\s+(freshman|sophomore|junior|senior)\s+(fall|spring)$/i);
        if (match) {
            courseName = match[1].trim();
            const year = this.capitalizeFirst(match[2]);
            const term = this.capitalizeFirst(match[3]);
            return { courseName, year, term };
        }

        // Extract just course name if mentioned but no year/term
        const addPatterns = [
            /(?:add|put|take)\s+([^]+?)(?:\s+(?:to|in)\s+|$)/i,
            /^([^]+?)(?:\s+(?:course|class))?$/i
        ];

        for (const pattern of addPatterns) {
            match = lowerMessage.match(pattern);
            if (match) {
                courseName = match[1].trim();
                break;
            }
        }

        return { courseName, year: null, term: null };
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    addCourseFromChatbot(courseName, year, term) {
        // Validate year and term
        const validYears = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
        const validTerms = ['Fall', 'Spring'];

        if (!validYears.includes(year)) {
            return { success: false, message: `"${year}" is not a valid year. Please use Freshman, Sophomore, Junior, or Senior.` };
        }

        if (!validTerms.includes(term)) {
            return { success: false, message: `"${term}" is not a valid term. Please use Fall or Spring.` };
        }

        // Check if course already exists
        const exists = Object.values(this.coursePlanner).some(yearData =>
            Object.values(yearData).some(termCourses =>
                termCourses.some(course => course.name.toLowerCase() === courseName.toLowerCase())
            )
        );

        if (exists) {
            return { success: false, message: `"${courseName}" already exists in your course plan.` };
        }

        // Check if term is full (max 8 courses)
        if (this.coursePlanner[year][term].length >= 8) {
            return { success: false, message: `Your ${year} ${term} term is already full (8 courses maximum).` };
        }

        // Add the course
        const newCourse = {
            id: `course-${Date.now()}`,
            name: courseName,
            description: `${courseName} — overview of topics, projects, and key outcomes.`
        };

        this.coursePlanner[year][term].push(newCourse);
        this.savePlannerData();
        this.renderPlannerGrid();
        
        this.showToast(`Added ${courseName} to ${year} ${term}`, 'success');
        return { success: true };
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

// Mock data for features not yet integrated with backend
window.mockData = {
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
        // Reviews can be associated with any item by itemId
        // For courses, use the course ID from the API
    ]
};
