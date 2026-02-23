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
            case '/onboarding':
                this.renderPage('onboarding');
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
            case 'onboarding':
                this.setupOnboardingHandlers();
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
        // Re-initialize Google Sign-In button
        const googleButtonContainer = document.querySelector('.g_id_signin');
        
        if (googleButtonContainer && window.google) {
            // Clear any existing button
            googleButtonContainer.innerHTML = '';
            
            // Re-render the Google Sign-In button
            window.google.accounts.id.initialize({
                client_id: '1076207663943-9urdbi6g6fbnblt45kbdr6h3tn32p653.apps.googleusercontent.com',
                callback: handleGoogleSignIn
            });
            
            window.google.accounts.id.renderButton(
                googleButtonContainer,
                {
                    type: 'standard',
                    size: 'large',
                    theme: 'outline',
                    text: 'sign_in_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: 350
                }
            );
        }

        // Bypass login button
        const bypassBtn = document.getElementById('bypass-login-btn');
        if (bypassBtn) {
            bypassBtn.addEventListener('click', () => this.bypassLogin());
        }
    }

    bypassLogin() {
        this.isAuthenticated = true;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', 'Guest');
        localStorage.setItem('userEmail', '');
        localStorage.setItem('userPicture', '');
        this.navigateTo('/');
        this.showToast('Signed in as Guest', 'success');
    }

    setupOnboardingHandlers() {
        const TOTAL_STEPS = 5;
        let currentStep = 1;
        // answers: gradeLevel, careerPath, collegeGoals, academicInterests (array), gpaGoal
        const answers = { gradeLevel: null, careerPath: null, collegeGoals: null, academicInterests: [], gpaGoal: null };

        const progressFill = document.getElementById('onboarding-progress-fill');
        const progressLabel = document.getElementById('onboarding-progress-label');
        const backBtn = document.getElementById('onboarding-back-btn');
        const nextBtn = document.getElementById('onboarding-next-btn');

        const updateProgress = () => {
            const pct = ((currentStep - 1) / TOTAL_STEPS) * 100;
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (progressLabel) progressLabel.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
        };

        const isStepComplete = (step) => {
            switch (step) {
                case 1: return !!answers.gradeLevel;
                case 2: return !!answers.careerPath;
                case 3: return !!answers.collegeGoals;
                case 4: return answers.academicInterests.length > 0;
                case 5: return !!answers.gpaGoal;
                default: return false;
            }
        };

        const refreshNextBtn = () => {
            if (!nextBtn) return;
            const complete = isStepComplete(currentStep);
            nextBtn.disabled = !complete;
            nextBtn.textContent = currentStep === TOTAL_STEPS ? 'Finish' : 'Next';
        };

        const showStep = (step) => {
            document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
            const stepEl = document.querySelector(`.onboarding-step[data-step="${step}"]`);
            if (stepEl) stepEl.classList.add('active');
            if (backBtn) backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
            updateProgress();
            refreshNextBtn();
        };

        // Option card click handler (single-select and multi-select)
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const field = card.dataset.field;
                const value = card.dataset.value;
                const isMulti = card.classList.contains('multi-select');

                if (isMulti) {
                    // Toggle selection for academic interests
                    const idx = answers.academicInterests.indexOf(value);
                    if (idx === -1) {
                        answers.academicInterests.push(value);
                        card.classList.add('selected');
                    } else {
                        answers.academicInterests.splice(idx, 1);
                        card.classList.remove('selected');
                    }
                } else {
                    // Deselect siblings in same step
                    const stepEl = card.closest('.onboarding-step');
                    stepEl.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    answers[field] = value;
                }
                refreshNextBtn();
            });
        });

        // Back button
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
        }

        // Next / Finish button
        if (nextBtn) {
            nextBtn.addEventListener('click', async () => {
                if (!isStepComplete(currentStep)) return;

                if (currentStep < TOTAL_STEPS) {
                    currentStep++;
                    showStep(currentStep);
                } else {
                    await this.submitOnboarding(answers);
                }
            });
        }

        showStep(1);
    }

    async submitOnboarding(answers) {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch('http://localhost:3000/api/user/goals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(answers)
                });
            }
        } catch (err) {
            // Proceed even if backend is unavailable
            console.warn('Could not save goals to backend:', err);
        }

        // Persist locally and complete onboarding
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.setItem('userGoals', JSON.stringify(answers));
        this.navigateTo('/');
        const name = localStorage.getItem('userName') || 'there';
        this.showToast(`All set, ${name}! Your profile is ready.`, 'success');
    }

    setupHomeHandlers() {
        // Populate user profile
        const userName = localStorage.getItem('userName') || 'User';
        const userEmail = localStorage.getItem('userEmail') || '';
        const userPicture = localStorage.getItem('userPicture') || 'https://via.placeholder.com/40';

        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        const userAvatarEl = document.getElementById('user-avatar');

        if (userNameEl) userNameEl.textContent = userName;
        if (userEmailEl) userEmailEl.textContent = userEmail;
        if (userAvatarEl) userAvatarEl.src = userPicture;
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

    setupDragAndDrop() {
        const app = this;
        // Course items are dynamic, so we might need event delegation or re-attaching listeners
        // For simplicity with this current architecture, listeners are attached in renderPlannerGrid
    }

    handleDragStart(e, courseId, sourceYear, sourceTerm) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({
            courseId,
            sourceYear,
            sourceTerm
        }));
        e.target.classList.add('dragging');
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.course-slot.drag-over').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over');
        return false;
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e, targetYear, targetTerm) {
        if (e.stopPropagation) {
            e.stopPropagation(); // Stops some browsers from redirecting.
        }
        e.currentTarget.classList.remove('drag-over');

        const dataStr = e.dataTransfer.getData('text/plain');
        if (!dataStr) return false;

        const data = JSON.parse(dataStr);
        const { courseId, sourceYear, sourceTerm } = data;

        // Prevent dropping in the exact same spot effectively doing nothing
        if (sourceYear === targetYear && sourceTerm === targetTerm) {
            return false;
        }

        // Logic to move the course
        this.moveCourse(courseId, sourceYear, sourceTerm, targetYear, targetTerm);
        return false;
    }

    moveCourse(courseId, sourceYear, sourceTerm, targetYear, targetTerm) {
        // Find the course
        const sourceCourses = this.coursePlanner[sourceYear][sourceTerm];
        const courseIndex = sourceCourses.findIndex(c => c.id === courseId);

        if (courseIndex === -1) return;

        const course = sourceCourses[courseIndex];

        // Check if this is a full year course - prevent moving
        if (course.isFullYear) {
            this.showToast(`Cannot move ${course.name}. This is a full year course and must be removed from both Fall and Spring terms.`, 'error');
            return;
        }

        // Validate grade level against target year
        if (course.grade) {
            // Parse all grades (handles "9, 10" format)
            const gradeNums = course.grade.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g));
            
            const yearGradeMap = {
                'Freshman': 9,
                'Sophomore': 10,
                'Junior': 11,
                'Senior': 12
            };
            
            const targetGrade = yearGradeMap[targetYear];
            
            // Check if the target year matches ANY of the allowed grades
            if (gradeNums.length > 0 && !gradeNums.includes(targetGrade)) {
                const gradeYearMap = { 9: 'Freshman', 10: 'Sophomore', 11: 'Junior', 12: 'Senior' };
                const allowedYears = gradeNums.map(g => gradeYearMap[g] || `Grade ${g}`).join(' or ');
                this.showToast(`Cannot move ${course.name}. This course is for ${allowedYears}.`, 'error');
                return;
            }
        }

        // Check limits
        if (this.coursePlanner[targetYear][targetTerm].length >= 8) {
            this.showToast(`Cannot move ${course.name}. ${targetYear} ${targetTerm} is full.`, 'error');
            return;
        }

        // Remove from source
        this.coursePlanner[sourceYear][sourceTerm].splice(courseIndex, 1);

        // Add to target
        this.coursePlanner[targetYear][targetTerm].push(course);

        // Save and Render
        this.savePlannerData();
        this.renderPlannerGrid();
        this.showToast(`Moved ${course.name} to ${targetYear} ${targetTerm}`, 'success');
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
                <option value="Full Year">Full Year</option>
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

        // Course info display
        const infoSection = document.createElement('div');
        infoSection.className = 'form-group';
        infoSection.innerHTML = `
            <label class="form-label">Course Information</label>
            <div id="course-info" class="course-description-box">
                <p class="text-muted">Select a course to view its information</p>
            </div>
        `;

        // Course description display
        const descriptionSection = document.createElement('div');
        descriptionSection.className = 'form-group';
        descriptionSection.innerHTML = `
            <label class="form-label">Course Description</label>
            <div id="course-description" class="course-description-box">
                <p class="text-muted">Select a course to view its description</p>
            </div>
        `;

        let selectedCourseLength = '';
        let selectedCourseGrade = '';

        // Initialize custom dropdown
        this.createSearchableDropdown(dropdownContainer, courseItems, 'Search for a course...', async (selectedValue) => {
            selectedCourseId = selectedValue;
            const descBox = document.getElementById('course-description');
            const infoBox = document.getElementById('course-info');

            if (selectedValue) {
                descBox.innerHTML = '<p class="text-muted">Loading...</p>';
                infoBox.innerHTML = '<p class="text-muted">Loading...</p>';
                const courseDetails = await this.fetchCourseDetails(selectedValue);

                if (courseDetails) {
                    descBox.innerHTML = `<p>${courseDetails.description}</p>`;
                    selectedCourseLength = courseDetails.length || 'SM';
                    selectedCourseGrade = courseDetails.grade || '';
                    
                    // Auto-select "Full Year" if course is a year-long course
                    const termSelect = document.getElementById('term-select');
                    if (selectedCourseLength === 'YR' && termSelect) {
                        termSelect.value = 'Full Year';
                    } else if (selectedCourseLength === 'SM' && termSelect && termSelect.value === 'Full Year') {
                        // If it's a semester course and Full Year is selected, change to Fall
                        termSelect.value = 'Fall';
                    }
                    
                    const lengthText = selectedCourseLength === 'YR' ? 'Full Year' : 'Semester';
                    const gradeText = selectedCourseGrade ? `Grade: ${selectedCourseGrade}` : '';
                    
                    infoBox.innerHTML = `<p><strong>${lengthText}</strong>${gradeText ? ` | <strong>${gradeText}</strong>` : ''}</p>`;
                } else {
                    descBox.innerHTML = '<p class="text-muted">Failed to load description</p>';
                    infoBox.innerHTML = '<p class="text-muted">Failed to load information</p>';
                }
            } else {
                descBox.innerHTML = '<p class="text-muted">Select a course to view its description</p>';
                infoBox.innerHTML = '<p class="text-muted">Select a course to view its information</p>';
                selectedCourseLength = '';
                selectedCourseGrade = '';
            }
        });

        modalBody.appendChild(termSection);
        modalBody.appendChild(courseSection);
        modalBody.appendChild(infoSection);
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

            // Validate course length against selected term
            if (selectedCourseLength === 'YR' && (term === 'Fall' || term === 'Spring')) {
                this.showToast('This is a full year course and cannot be added to a single semester. Please select "Full Year".', 'error');
                return;
            }

            if (selectedCourseLength === 'SM' && term === 'Full Year') {
                this.showToast('This is a semester course and cannot be added as a full year course. Please select Fall or Spring.', 'error');
                return;
            }

            // Validate grade level against year
            if (selectedCourseGrade) {
                // Parse all grades (handles "9, 10" format)
                const gradeNums = selectedCourseGrade.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g));
                
                const yearGradeMap = {
                    'Freshman': 9,
                    'Sophomore': 10,
                    'Junior': 11,
                    'Senior': 12
                };
                
                const expectedGrade = yearGradeMap[year];
                
                // Check if the selected year matches ANY of the allowed grades
                if (gradeNums.length > 0 && !gradeNums.includes(expectedGrade)) {
                    const gradeYearMap = { 9: 'Freshman', 10: 'Sophomore', 11: 'Junior', 12: 'Senior' };
                    const allowedYears = gradeNums.map(g => gradeYearMap[g] || `Grade ${g}`).join(' or ');
                    this.showToast(`This course is for ${allowedYears}. Please add it to the correct year.`, 'error');
                    return;
                }
            }

            const selectedCourse = this.courseNames.find(c => String(c.id) === String(selectedCourseId));
            if (selectedCourse) {
                const result = this.addCourseFromChatbot(selectedCourse.title, year, term, selectedCourseLength, selectedCourseGrade);
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
        searchInput.value = '';
        this.searchQuery = '';
        searchInput.placeholder = `Search for a ${tabName.slice(0, -1)}...`;

        // Update sidebar title
        document.getElementById('sidebar-title').textContent = `${tabName.charAt(0).toUpperCase() + tabName.slice(1)} List`;

        // Clear main content with fade
        const details = document.getElementById('item-details');
        details.style.opacity = '0';
        details.style.transform = 'translateY(12px)';
        setTimeout(() => {
            details.innerHTML = '<p>Select an item from the list to see reviews.</p>';
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
            details.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 150);

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

        itemsList.innerHTML = filteredData.map((item, index) => {
            const isSelected = String(this.selectedItemId) === String(item.id);
            const delay = Math.min(index * 0.04, 0.8); // stagger up to 800ms
            return `
                <div class="item-card ${isSelected ? 'selected' : ''}" 
                     style="animation-delay: ${delay}s"
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
                reviews.map((review, idx) => `
                        <div class="review-card" style="animation-delay: ${Math.min(idx * 0.06, 0.6)}s">
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

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = sender === 'bot' ? '🤖' : '👤';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = message; // Use innerHTML directly as message might contain HTML tags

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message typing-message';
        messageDiv.id = 'typing-indicator-msg';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.textContent = '🤖';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-msg');
        if (indicator) {
            indicator.remove();
        }
    }

    async processChatbotMessage(message) {
        // Show typing indicator
        this.showTypingIndicator();

        // Ensure courses are loaded if not already
        if (this.courseNames.length === 0) {
            await this.fetchCourseNames();
        }

        try {
            // Call backend Gemini API endpoint
            const response = await fetch(`${this.apiBaseUrl}/api/chatbot`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    availableCourses: this.courseNames
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const result = await response.json();
            this.hideTypingIndicator();

            // Handle the new response format: { success, data: { response }, message }
            if (result.success && result.data && result.data.response) {
                // Display the AI counselor's natural response
                this.addChatMessage(result.data.response, 'bot');
            } else if (result.data && typeof result.data === 'string') {
                // Handle if data is a direct string
                this.addChatMessage(result.data, 'bot');
            } else if (result.response) {
                // Fallback for old format
                this.addChatMessage(result.response, 'bot');
            } else {
                // Display generic message if response format is unexpected
                this.addChatMessage('I received your message. How else can I help you with your course planning?', 'bot');
            }
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Chatbot API error:', error);
            
            // User-friendly error message
            this.addChatMessage('⚠️ Sorry, I encountered an error connecting to the AI assistant. Please try again in a moment.', 'bot');
        }
    }

    addCourseFromChatbot(courseName, year, term, courseLength = 'SM', courseGrade = '') {
        // Validate year and term
        const validYears = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
        const validTerms = ['Fall', 'Spring', 'Full Year'];

        if (!validYears.includes(year)) {
            return { success: false, message: `"${year}" is not a valid year. Please use Freshman, Sophomore, Junior, or Senior.` };
        }

        if (!validTerms.includes(term)) {
            return { success: false, message: `"${term}" is not a valid term. Please use Fall, Spring, or Full Year.` };
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

        // Handle Full Year courses
        if (term === 'Full Year') {
            // Check if both Fall and Spring have space
            if (this.coursePlanner[year]['Fall'].length >= 8) {
                return { success: false, message: `Your ${year} Fall term is already full (8 courses maximum).` };
            }
            if (this.coursePlanner[year]['Spring'].length >= 8) {
                return { success: false, message: `Your ${year} Spring term is already full (8 courses maximum).` };
            }

            // Add to both Fall and Spring
            const fallCourse = {
                id: `course-${Date.now()}-fall`,
                name: courseName,
                description: `${courseName} — overview of topics, projects, and key outcomes.`,
                length: courseLength,
                grade: courseGrade,
                isFullYear: true
            };

            const springCourse = {
                id: `course-${Date.now()}-spring`,
                name: courseName,
                description: `${courseName} — overview of topics, projects, and key outcomes.`,
                length: courseLength,
                grade: courseGrade,
                isFullYear: true
            };

            this.coursePlanner[year]['Fall'].push(fallCourse);
            this.coursePlanner[year]['Spring'].push(springCourse);
            this.savePlannerData();
            this.renderPlannerGrid();

            this.showToast(`Added ${courseName} to ${year} Fall and Spring`, 'success');
            return { success: true };
        }

        // Check if term is full (max 8 courses)
        if (this.coursePlanner[year][term].length >= 8) {
            return { success: false, message: `Your ${year} ${term} term is already full (8 courses maximum).` };
        }

        // Add the course (single semester)
        const newCourse = {
            id: `course-${Date.now()}`,
            name: courseName,
            description: `${courseName} — overview of topics, projects, and key outcomes.`,
            length: courseLength,
            grade: courseGrade,
            isFullYear: false
        };

        this.coursePlanner[year][term].push(newCourse);
        this.savePlannerData();
        this.renderPlannerGrid();

        this.showToast(`Added ${courseName} to ${year} ${term}`, 'success');
        return { success: true };
    }

    renderPlannerGrid() {
        const app = this; // Capture 'this' for event listeners

        Object.entries(this.coursePlanner).forEach(([year, yearData]) => {
            Object.entries(yearData).forEach(([term, courses]) => {
                const slot = document.querySelector(`[data-year="${year}"][data-term="${term}"]`);
                if (slot) {
                    // Update slot content
                    slot.innerHTML = courses.map(course => `
                        <div class="course-item${course.isFullYear ? ' full-year-course' : ''}" draggable="${!course.isFullYear}" id="${course.id}" 
                             data-year="${year}" data-term="${term}">
                            <span class="course-name">
                                ${course.name}
                                ${!course.isFullYear && course.length === 'SM' ? '<span class="semester-badge">Semester</span>' : ''}
                            </span>
                            <button class="remove-course" onclick="window.app.removeCourse('${course.id}', '${year}', '${term}')">×</button>
                        </div>
                    `).join('');

                    // Add Drop Listeners to Slot
                    slot.addEventListener('dragover', (e) => app.handleDragOver(e));
                    slot.addEventListener('dragleave', (e) => app.handleDragLeave(e));
                    slot.addEventListener('drop', (e) => app.handleDrop(e, year, term));

                    // Add Drag Listeners to Items (after they are in DOM)
                    slot.querySelectorAll('.course-item').forEach(item => {
                        item.addEventListener('dragstart', (e) => {
                            app.handleDragStart(e, item.id, year, term);
                        });
                        item.addEventListener('dragend', (e) => {
                            app.handleDragEnd(e);
                        });
                    });
                }
            });
        });
    }

    removeCourse(courseId, year, term) {
        // Find the course to check if it's a full year course
        const course = this.coursePlanner[year][term].find(c => c.id === courseId);
        
        if (course && course.isFullYear) {
            // Remove from both Fall and Spring
            const courseName = course.name;
            this.coursePlanner[year]['Fall'] = this.coursePlanner[year]['Fall'].filter(c => c.name !== courseName);
            this.coursePlanner[year]['Spring'] = this.coursePlanner[year]['Spring'].filter(c => c.name !== courseName);
            this.savePlannerData();
            this.renderPlannerGrid();
            this.showToast(`Removed full year course: ${courseName}`, 'success');
        } else {
            // Remove only from the specified term
            this.coursePlanner[year][term] = this.coursePlanner[year][term].filter(course => course.id !== courseId);
            this.savePlannerData();
            this.renderPlannerGrid();
            this.showToast('Course removed', 'success');
        }
    }

    savePlannerData() {
        localStorage.setItem('coursePlanner', JSON.stringify(this.coursePlanner));
    }

    async handleGoogleSignIn(googleUser) {
        const loadingEl = document.getElementById('signin-loading');
        const googleBtnContainer = document.querySelector('.google-signin-container');
        
        // Show loading state
        if (loadingEl && googleBtnContainer) {
            googleBtnContainer.classList.add('hidden');
            loadingEl.classList.remove('hidden');
        }

        try {
            // Get the ID token from Google
            const idToken = googleUser.credential;
            
            // TODO: Replace with your actual backend API endpoint
            const API_URL = 'http://localhost:3000/api/auth/google';
            
            // Send token to backend for verification
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken })
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            
            // Store authentication data
            this.isAuthenticated = true;
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('authToken', data.token); // JWT token from backend
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userPicture', data.user.picture || '');

            // Send new users through onboarding
            // data.isNewUser comes from backend; localStorage flag is a fallback for returning users on new devices
            const needsOnboarding = data.isNewUser || !localStorage.getItem('onboardingComplete');
            if (needsOnboarding) {
                this.navigateTo('/onboarding');
                this.showToast(`Welcome, ${data.user.name}! Let's set up your profile.`, 'success');
            } else {
                this.navigateTo('/');
                this.showToast(`Welcome back, ${data.user.name}!`, 'success');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed. Please try again.', 'error');
            
            // Reset UI
            if (loadingEl && googleBtnContainer) {
                loadingEl.classList.add('hidden');
                googleBtnContainer.classList.remove('hidden');
            }
        }
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userPicture');
        localStorage.removeItem('authToken');
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

// Google Sign-In callback (must be global for Google to call it)
function handleGoogleSignIn(googleUser) {
    if (window.app) {
        window.app.handleGoogleSignIn(googleUser);
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