// Simple SPA Router and State Management
class App {
    constructor() {
        this.currentPage = '';
        this.isAuthenticated = false;
        this.apiBaseUrl = 'http://localhost:3000'; // Configure your API base URL here
        this.courseNames = []; // Cache for course names
        this.courseDetails = {}; // Cache for individual course details
        this.clubs = []; // Cache for clubs
        this.clubDetails = {}; // Cache for individual club details
        this.teachers = []; // Cache for teachers
        this.teacherDetails = {}; // Cache for individual teacher details
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

    async fetchClubs() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/clubs`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                this.clubs = result.data.map(club => ({
                    id: club.id,
                    title: club.name,
                    description: club.description,
                    meetingDay: club.meetingDay,
                    rating: club.rating
                }));
                return this.clubs;
            } else {
                throw new Error(result.message || 'Failed to fetch clubs');
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
            this.showToast('Failed to load clubs. Please try again.', 'error');
            return [];
        }
    }

    async fetchClubDetails(clubId) {
        // Check cache first
        if (this.clubDetails[clubId]) {
            return this.clubDetails[clubId];
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/clubs/${clubId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Club not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                // Cache the result
                const club = result.data;
                this.clubDetails[clubId] = {
                    id: club.id,
                    title: club.name,
                    description: club.description,
                    meetingDay: club.meetingDay,
                    rating: club.rating
                };
                return this.clubDetails[clubId];
            } else {
                throw new Error(result.message || 'Failed to fetch club details');
            }
        } catch (error) {
            console.error('Error fetching club details:', error);
            this.showToast(`Failed to load club details: ${error.message}`, 'error');
            return null;
        }
    }

    async fetchTeachers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/teachers`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                this.teachers = result.data.map(teacher => ({
                    id: teacher.id,
                    title: teacher.name,
                    description: teacher.department,
                    courses: teacher.courses,
                    rating: teacher.rating
                }));
                return this.teachers;
            } else {
                throw new Error(result.message || 'Failed to fetch teachers');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            this.showToast('Failed to load teachers. Please try again.', 'error');
            return [];
        }
    }

    async fetchTeacherDetails(teacherId) {
        // Check cache first
        if (this.teacherDetails[teacherId]) {
            return this.teacherDetails[teacherId];
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/teachers/${teacherId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Teacher not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                // Cache the result
                const teacher = result.data;
                this.teacherDetails[teacherId] = {
                    id: teacher.id,
                    title: teacher.name,
                    description: teacher.department,
                    courses: teacher.courses,
                    rating: teacher.rating
                };
                return this.teacherDetails[teacherId];
            } else {
                throw new Error(result.message || 'Failed to fetch teacher details');
            }
        } catch (error) {
            console.error('Error fetching teacher details:', error);
            this.showToast(`Failed to load teacher details: ${error.message}`, 'error');
            return null;
        }
    }

    async fetchReviews(entityType, entityId) {
        try {
            const url = `${this.apiBaseUrl}/api/reviews?entityType=${entityType}&entityId=${entityId}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    async createReview(entityType, entityId, rating, text) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entityType,
                    entityId,
                    rating,
                    text
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to create review');
            }
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
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
        this.reviewFilterRating = 'all';
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
        const loadingText = this.currentTab === 'courses' ? 'Loading courses...' :
            this.currentTab === 'clubs' ? 'Loading clubs...' :
                'Loading teachers...';
        itemsList.innerHTML = `<div class="loading-state">${loadingText}</div>`;

        if (this.currentTab === 'courses') {
            await this.fetchCourseNames();
        } else if (this.currentTab === 'clubs') {
            await this.fetchClubs();
        } else if (this.currentTab === 'teachers') {
            await this.fetchTeachers();
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

            // Remove add course button if exists
            const addCourseBtn = section.querySelector('.add-course-btn-expanded');
            if (addCourseBtn) {
                addCourseBtn.remove();
            }
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

                // Add "Add Course" button if it doesn't exist
                if (!section.querySelector('.add-course-btn-expanded')) {
                    const addCourseBtn = document.createElement('button');
                    addCourseBtn.className = 'btn add-course-btn-expanded';
                    addCourseBtn.textContent = '+ Add Course';
                    addCourseBtn.onclick = () => this.openAddCourseModal(year);
                    section.appendChild(addCourseBtn);
                }
            } else {
                section.style.display = 'none';
            }
        });

        // Change grid layout to single column
        plannerGrid.style.gridTemplateColumns = '1fr';

        // Add back button if it doesn't exist
        if (!document.querySelector('.back-to-grid-btn')) {
            const backButton = document.createElement('button');
            backButton.className = 'btn back-to-grid-btn';
            backButton.textContent = '← Back to All Years';
            backButton.onclick = () => this.toggleYearExpansion(year);

            const plannerHeader = document.querySelector('.planner-header .header-right');
            plannerHeader.insertBefore(backButton, plannerHeader.firstChild);
        }
    }

    async openAddCourseModal(year) {
        // Fetch courses if not already loaded
        if (!this.courseNames || this.courseNames.length === 0) {
            await this.fetchCourseNames();
        }

        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h2>Add Course to ${year} Year</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        `;

        // Modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        // Term selection
        const termSection = document.createElement('div');
        termSection.className = 'form-group';
        termSection.innerHTML = `
            <label class="form-label">Select Term</label>
            <select id="term-select" class="form-input">
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
            </select>
        `;

        // Course dropdown (Searchable)
        const courseSection = document.createElement('div');
        courseSection.className = 'form-group';
        courseSection.innerHTML = `<label class="form-label">Select Course</label>`;

        let selectedCourseId = '';

        // Prepare items for dropdown
        const courseItems = this.courseNames.map(c => ({
            value: c.id,
            label: c.title,
            data: c
        }));

        const dropdownContainer = document.createElement('div');
        courseSection.appendChild(dropdownContainer);

        // Course description display
        const descriptionSection = document.createElement('div');
        descriptionSection.className = 'form-group';
        descriptionSection.innerHTML = `
            <label class="form-label">Course Description</label>
            <div id="course-description" class="course-description-box">
                <p class="text-muted">Select a course to view its description</p>
            </div>
        `;

        // Initialize custom dropdown
        this.createSearchableDropdown(dropdownContainer, courseItems, 'Search for a course...', async (selectedValue) => {
            selectedCourseId = selectedValue;
            const descBox = document.getElementById('course-description');

            if (selectedValue) {
                descBox.innerHTML = '<p class="text-muted">Loading...</p>';
                const courseDetails = await this.fetchCourseDetails(selectedValue);

                if (courseDetails) {
                    descBox.innerHTML = `<p>${courseDetails.description}</p>`;
                } else {
                    descBox.innerHTML = '<p class="text-muted">Failed to load description</p>';
                }
            } else {
                descBox.innerHTML = '<p class="text-muted">Select a course to view its description</p>';
            }
        });

        modalBody.appendChild(termSection);
        modalBody.appendChild(courseSection);
        modalBody.appendChild(descriptionSection);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => modal.remove();

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-primary';
        addBtn.textContent = 'Add Course';
        addBtn.onclick = () => {
            const term = document.getElementById('term-select').value;

            if (!selectedCourseId) {
                this.showToast('Please select a course', 'error');
                return;
            }

            const selectedCourse = this.courseNames.find(c => String(c.id) === String(selectedCourseId));
            if (selectedCourse) {
                const result = this.addCourseFromChatbot(selectedCourse.title, year, term);
                if (result.success) {
                    modal.remove();
                } else {
                    this.showToast(result.message, 'error');
                }
            } else {
                this.showToast('Course not found. Please try again.', 'error');
            }
        };

        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(addBtn);

        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);

        // Add to page
        document.body.appendChild(modal);
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

        // Load data for the selected tab from API
        await this.loadInitialData();
    }

    updateItemsList() {
        const itemsList = document.getElementById('items-list');
        let data = [];

        // Use API data for all tabs
        if (this.currentTab === 'courses') {
            data = this.courseNames;
        } else if (this.currentTab === 'clubs') {
            data = this.clubs;
        } else if (this.currentTab === 'teachers') {
            data = this.teachers;
        }

        const filteredData = data.filter(item =>
            !this.searchQuery || item.title.toLowerCase().includes(this.searchQuery)
        );

        // Handle empty data
        if (filteredData.length === 0) {
            const emptyMessage = data.length === 0
                ? `No ${this.currentTab} available`
                : 'No items found';
            itemsList.innerHTML = `<div class="loading-state">${emptyMessage}</div>`;
            this.selectedItemId = null;
            this.updateItemDetails();
            return;
        }

        // All data from API uses 'id' field
        const getItemDescription = (item) => {
            if (this.currentTab === 'courses') {
                return 'Click to view details';
            } else if (this.currentTab === 'clubs') {
                return item.meetingDay ? `Meets: ${item.meetingDay}` : item.description;
            } else {
                return item.description; // Department for teachers
            }
        };

        itemsList.innerHTML = filteredData.map(item => {
            const isSelected = String(this.selectedItemId) === String(item.id);
            return `
                <div class="item-card ${isSelected ? 'selected' : ''}" 
                     onclick="window.app.selectItem('${item.id}')">
                    <div class="item-title">${item.title}</div>
                    <div class="item-description">${getItemDescription(item)}</div>
                </div>
            `;
        }).join('');

        // Auto-select first item if none selected
        if (!this.selectedItemId && filteredData.length > 0) {
            this.selectItem(filteredData[0].id);
        } else if (filteredData.length === 0) {
            this.selectedItemId = null;
            this.updateItemDetails();
        }
    }

    async selectItem(itemId) {
        this.selectedItemId = String(itemId); // Ensure consistent string storage
        this.updateItemsList(); // Refresh to show selection

        // Show loading state for item details
        const loadingText = this.currentTab === 'courses' ? 'Loading course details...' :
            this.currentTab === 'clubs' ? 'Loading club details...' :
                'Loading teacher details...';
        document.getElementById('item-details').innerHTML = `<div class="loading-state">${loadingText}</div>`;

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
        let entityType = '';

        // Fetch full details from API based on current tab
        if (this.currentTab === 'courses') {
            item = await this.fetchCourseDetails(this.selectedItemId);
            entityType = 'course';
            if (!item) {
                itemDetails.innerHTML = '<p>Failed to load course details.</p>';
                return;
            }
        } else if (this.currentTab === 'clubs') {
            item = await this.fetchClubDetails(this.selectedItemId);
            entityType = 'club';
            if (!item) {
                itemDetails.innerHTML = '<p>Failed to load club details.</p>';
                return;
            }
        } else if (this.currentTab === 'teachers') {
            item = await this.fetchTeacherDetails(this.selectedItemId);
            entityType = 'teacher';
            if (!item) {
                itemDetails.innerHTML = '<p>Failed to load teacher details.</p>';
                return;
            }
        }

        // Fetch reviews from backend API
        // Fetch reviews from backend API
        let reviews = await this.fetchReviews(entityType, this.selectedItemId);

        // Filter reviews based on current preference
        if (this.reviewFilterRating !== 'all') {
            const rating = parseInt(this.reviewFilterRating);
            reviews = reviews.filter(review => review.rating === rating);
        }

        // Always show newest first within the filtered set
        reviews.reverse();

        // Build additional info based on item type
        let additionalInfo = '';
        if (this.currentTab === 'clubs' && item.meetingDay) {
            additionalInfo = `<p><strong>Meeting Day:</strong> ${item.meetingDay}</p>`;
        } else if (this.currentTab === 'teachers' && item.courses && item.courses.length > 0) {
            additionalInfo = `<p><strong>Courses:</strong> ${item.courses.join(', ')}</p>`;
        }

        itemDetails.innerHTML = `
            <h2>${item.title}</h2>
            <h3>Description</h3>
            <p>${item.description}</p>
            ${additionalInfo}
            <div class="reviews-section">
                <div class="reviews-header">
                    <h3>Reviews for ${item.title}</h3>
                    <select onchange="window.app.handleFilterChange(this.value)" class="sort-select">
                        <option value="all" ${this.reviewFilterRating === 'all' ? 'selected' : ''}>All Ratings</option>
                        <option value="5" ${this.reviewFilterRating === '5' ? 'selected' : ''}>5 Stars</option>
                        <option value="4" ${this.reviewFilterRating === '4' ? 'selected' : ''}>4 Stars</option>
                        <option value="3" ${this.reviewFilterRating === '3' ? 'selected' : ''}>3 Stars</option>
                        <option value="2" ${this.reviewFilterRating === '2' ? 'selected' : ''}>2 Stars</option>
                        <option value="1" ${this.reviewFilterRating === '1' ? 'selected' : ''}>1 Star</option>
                    </select>
                </div>
                ${reviews.length > 0 ?
                reviews.map(review => `
                        <div class="review-card">
                            <div class="review-header">
                                <strong>Anonymous User</strong>
                                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                            </div>
                            ${review.text ? `<p>${review.text}</p>` : '<p><em>No comment provided</em></p>'}
                        </div>
                    `).join('') :
                (this.reviewFilterRating !== 'all' ? '<p>No reviews with this rating.</p>' : '<p>No reviews yet. Be the first to add one!</p>')
            }
            </div>
        `;
    }

    handleFilterChange(rating) {
        this.reviewFilterRating = rating;
        this.updateItemDetails();
    }

    async openAddReviewModal() {
        // Fetch appropriate data based on current tab
        let itemsList = [];
        let itemTypeSingular = '';
        let itemTypePlural = '';

        if (this.currentTab === 'courses') {
            if (!this.courseNames || this.courseNames.length === 0) {
                await this.fetchCourseNames();
            }
            itemsList = this.courseNames;
            itemTypeSingular = 'Course';
            itemTypePlural = 'course';
        } else if (this.currentTab === 'clubs') {
            if (!this.clubs || this.clubs.length === 0) {
                await this.fetchClubs();
            }
            itemsList = this.clubs;
            itemTypeSingular = 'Club';
            itemTypePlural = 'club';
        } else if (this.currentTab === 'teachers') {
            if (!this.teachers || this.teachers.length === 0) {
                await this.fetchTeachers();
            }
            itemsList = this.teachers;
            itemTypeSingular = 'Teacher';
            itemTypePlural = 'teacher';
        }

        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `
            <h2>Add Review</h2>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        `;

        // Modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        // Item dropdown section (Searchable)
        const itemSection = document.createElement('div');
        itemSection.className = 'form-group';
        itemSection.innerHTML = `<label class="form-label">Select ${itemTypeSingular}</label>`;

        let selectedItemIdFromDropdown = '';
        if (this.selectedItemId) {
            selectedItemIdFromDropdown = this.selectedItemId;
        }

        const dropdownContainer = document.createElement('div');
        itemSection.appendChild(dropdownContainer);

        // Prepare data for dropdown
        const dropdownItems = itemsList.map(item => ({
            value: item.id,
            label: item.title,
            data: item
        }));

        const initialPlaceholder = this.selectedItemId
            ? itemsList.find(i => String(i.id) === String(this.selectedItemId))?.title
            : `Choose a ${itemTypePlural}...`;

        this.createSearchableDropdown(dropdownContainer, dropdownItems, initialPlaceholder || 'Select...', (val) => {
            selectedItemIdFromDropdown = val;
        });

        const ratingSection = document.createElement('div');
        ratingSection.className = 'form-group rating-form-group';
        ratingSection.innerHTML = `
            <label class="form-label">Rating</label>
            <div id="star-rating" class="star-rating">
                <span class="star" data-rating="1">☆</span>
                <span class="star" data-rating="2">☆</span>
                <span class="star" data-rating="3">☆</span>
                <span class="star" data-rating="4">☆</span>
                <span class="star" data-rating="5">☆</span>
            </div>
        `;

        // Description section
        const descriptionSection = document.createElement('div');
        descriptionSection.className = 'form-group';
        descriptionSection.innerHTML = `
            <label class="form-label">Your Review</label>
            <textarea id="review-description" class="form-input review-textarea" 
                      placeholder="Share your experience with this ${itemTypePlural}..." rows="5"></textarea>
            <p id="filter-warning" class="filter-warning hidden">Please avoid using inappropriate language.</p>
        `;

        modalBody.appendChild(itemSection);
        modalBody.appendChild(ratingSection);
        modalBody.appendChild(descriptionSection);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => modal.remove();

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = 'Submit Review';

        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(submitBtn);

        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);

        // Add to page
        document.body.appendChild(modal);

        // Star rating logic
        let selectedRating = 0;
        const stars = modal.querySelectorAll('.star');

        const updateStarDisplay = (rating) => {
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.textContent = '★';
                    s.classList.add('filled');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('filled');
                }
            });
        };

        stars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                updateStarDisplay(index + 1);
            });

            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.rating);
                updateStarDisplay(selectedRating);
            });
        });

        modal.querySelector('.star-rating').addEventListener('mouseleave', () => {
            updateStarDisplay(selectedRating);
        });

        // Bad word filtering on textarea
        const textarea = document.getElementById('review-description');
        const filterWarning = document.getElementById('filter-warning');

        textarea.addEventListener('input', () => {
            const originalText = textarea.value;
            const filteredText = this.filterBadWords(originalText);

            if (originalText !== filteredText) {
                filterWarning.classList.remove('hidden');
                setTimeout(() => {
                    filterWarning.classList.add('hidden');
                }, 3000);
            }

            textarea.value = filteredText;
        });

        // Submit handler
        submitBtn.onclick = async () => {
            const itemId = selectedItemIdFromDropdown;
            const description = textarea.value.trim();

            if (!itemId) {
                this.showToast(`Please select a ${itemTypePlural}`, 'error');
                return;
            }

            if (selectedRating === 0) {
                this.showToast('Please select a rating', 'error');
                return;
            }

            if (!description) {
                this.showToast('Please write a review', 'error');
                return;
            }

            // Determine entity type based on current tab
            let entityType = '';
            if (this.currentTab === 'courses') {
                entityType = 'course';
            } else if (this.currentTab === 'clubs') {
                entityType = 'club';
            } else if (this.currentTab === 'teachers') {
                entityType = 'teacher';
            }

            try {
                // Disable submit button to prevent double submission
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';

                // Create review via API
                await this.createReview(entityType, parseInt(itemId), selectedRating, description);

                // If the review is for the currently selected item, refresh details
                if (String(itemId) === String(this.selectedItemId)) {
                    await this.updateItemDetails();
                }

                modal.remove();
                this.showToast('Review added successfully!', 'success');
            } catch (error) {
                this.showToast(error.message || 'Failed to add review', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';
            }
        };
    }

    filterBadWords(text) {
        // List of bad words to filter (you can expand this list)


        let filteredText = text;


        return filteredText;
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

    createSearchableDropdown(container, items, placeholder, onSelect) {
        // Create DOM structure
        container.className = 'custom-dropdown';

        const selectedDisplay = document.createElement('div');
        selectedDisplay.className = 'dropdown-selected';
        selectedDisplay.textContent = placeholder;

        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-container';

        const searchDiv = document.createElement('div');
        searchDiv.className = 'dropdown-search';
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Type to search...';
        searchDiv.appendChild(searchInput);

        const listDiv = document.createElement('div');
        listDiv.className = 'dropdown-list';

        dropdownContainer.appendChild(searchDiv);
        dropdownContainer.appendChild(listDiv);

        container.appendChild(selectedDisplay);
        container.appendChild(dropdownContainer);

        let isOpen = false;
        let selectedValue = null;

        // Render items function
        const renderItems = (filterText = '') => {
            listDiv.innerHTML = '';

            const filteredItems = items.filter(item =>
                item.label.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filteredItems.length === 0) {
                const noResult = document.createElement('div');
                noResult.className = 'dropdown-item no-results';
                noResult.textContent = 'No results found';
                listDiv.appendChild(noResult);
                return;
            }

            filteredItems.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = `dropdown-item ${item.value === selectedValue ? 'selected' : ''}`;
                itemDiv.textContent = item.label;
                itemDiv.onclick = (e) => {
                    e.stopPropagation();
                    selectItem(item);
                };
                listDiv.appendChild(itemDiv);
            });
        };

        const selectItem = (item) => {
            selectedValue = item.value;
            selectedDisplay.textContent = item.label;
            closeDropdown();
            if (onSelect) onSelect(item.value);
        };

        const openDropdown = () => {
            isOpen = true;
            dropdownContainer.classList.add('open');
            selectedDisplay.classList.add('open');
            searchInput.value = '';
            searchInput.focus();
            renderItems();

            // Close other dropdowns
            document.dispatchEvent(new CustomEvent('closeAllDropdowns', { detail: { except: container } }));
        };

        const closeDropdown = () => {
            isOpen = false;
            dropdownContainer.classList.remove('open');
            selectedDisplay.classList.remove('open');
        };

        // Event Listeners
        selectedDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen) closeDropdown();
            else openDropdown();
        });

        searchInput.addEventListener('input', (e) => {
            renderItems(e.target.value);
        });

        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                closeDropdown();
            }
        });

        // Handle custom event to close other dropdowns
        document.addEventListener('closeAllDropdowns', (e) => {
            if (e.detail.except !== container) {
                closeDropdown();
            }
        });
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
    reviews: [
        // Reviews can be associated with any item by itemId
        // For courses, clubs, and teachers, use the item ID from the API
    ]
};