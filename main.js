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

        // Initialize Theme Mode
        this.initTheme();

        // Set up initial routing
        this.handleRouting();

        // Listen for back/forward navigation
        window.addEventListener('popstate', () => this.handleRouting());

        // Set up form handlers
        this.setupEventListeners();
    }

    // Theme Management
    initTheme() {
        const themeToggleBtn = document.getElementById('theme-toggle');

        // Check for saved user preference, else use system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

        if (initialTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                }
            });
        }
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
            const token = localStorage.getItem('authToken');
            const response = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
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
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${this.apiBaseUrl}/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

        this.activeYear = 'Freshman';
        this.plannerDragData = null;

        this.setupPlannerTabs();
        this.setupChatbot();
        this.loadPlannerFromBackend();
        this.initPlannerDragDrop();
    }

    setupPlannerTabs() {
        document.querySelectorAll('.planner-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.planner-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeYear = tab.dataset.year;
                this.renderYearView();
            });
        });
    }

    toSparseArray(denseArr) {
        const sparse = new Array(8).fill(null);
        denseArr.forEach((item, i) => { if (i < 8) sparse[i] = item || null; });
        return sparse;
    }

    countSlots(arr) {
        return arr.filter(Boolean).length;
    }

    setupDragAndDrop() {
        // Handled by initPlannerDragDrop via event delegation
    }

    initPlannerDragDrop() {
        const container = document.getElementById('planner-year-content');
        if (!container) return;

        container.addEventListener('dragstart', e => {
            const card = e.target.closest('.course-card[draggable="true"]');
            if (!card) return;
            this.plannerDragData = {
                id: card.dataset.courseId,
                year: card.dataset.year,
                term: card.dataset.term,
                periodIdx: parseInt(card.dataset.periodIdx)
            };
            requestAnimationFrame(() => card.classList.add('dragging'));
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(this.plannerDragData));
        });

        container.addEventListener('dragend', () => {
            container.querySelectorAll('.dragging, .drag-over').forEach(el =>
                el.classList.remove('dragging', 'drag-over')
            );
            this.plannerDragData = null;
        });

        container.addEventListener('dragover', e => {
            const slot = e.target.closest('.course-card, .empty-half, .empty-slot');
            if (!slot || !this.plannerDragData) return;
            e.preventDefault();
            container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            slot.classList.add('drag-over');
        });

        container.addEventListener('dragleave', e => {
            if (!container.contains(e.relatedTarget)) {
                container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            }
        });

        container.addEventListener('drop', e => {
            e.preventDefault();
            const slot = e.target.closest('.course-card, .empty-half, .empty-slot');
            if (!slot || !this.plannerDragData) return;

            container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

            const { id, year: srcYear, term: srcTerm, periodIdx: srcIdx } = this.plannerDragData;
            const tgtTerm = slot.dataset.term;
            const tgtIdx = parseInt(slot.dataset.periodIdx);

            if (!tgtTerm || isNaN(tgtIdx)) return;
            if (srcTerm === tgtTerm && srcIdx === tgtIdx) return;

            this.swapPeriodSlots(this.activeYear, srcTerm, srcIdx, tgtTerm, tgtIdx);
        });
    }

    swapPeriodSlots(year, fromTerm, fromIdx, toTerm, toIdx) {
        const fromArr = this.coursePlanner[year][fromTerm];
        while (fromArr.length < 8) fromArr.push(null);

        const fromCourse = fromArr[fromIdx] || null;
        if (!fromCourse) return;

        // Full-year courses live in Fall; if dropped on a Spring slot redirect to Fall
        const effectiveTgtTerm = fromCourse.isFullYear ? 'Fall' : toTerm;
        const toArr = this.coursePlanner[year][effectiveTgtTerm];
        while (toArr.length < 8) toArr.push(null);

        if (fromTerm === effectiveTgtTerm && fromIdx === toIdx) return;

        const toCourse = toArr[toIdx] || null;
        fromArr[fromIdx] = toCourse;
        toArr[toIdx] = fromCourse;

        this.savePlannerData();
        this.renderYearView();
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
        const sourceCourses = this.coursePlanner[sourceYear][sourceTerm];
        const courseIndex = sourceCourses.findIndex(c => c && c.id === courseId);

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
        if (this.countSlots(this.coursePlanner[targetYear][targetTerm]) >= 8) {
            this.showToast(`Cannot move ${course.name}. ${targetYear} ${targetTerm} is full.`, 'error');
            return;
        }

        // Optimistic local update — null source slot, place in first empty target slot
        const targetCourses = this.coursePlanner[targetYear][targetTerm];
        while (targetCourses.length < 8) targetCourses.push(null);
        sourceCourses[courseIndex] = null;
        const firstEmpty = targetCourses.findIndex(s => !s);
        if (firstEmpty !== -1) targetCourses[firstEmpty] = course;
        this.savePlannerData();
        this.renderPlannerGrid();
        this.showToast(`Moved ${course.name} to ${targetYear} ${targetTerm}`, 'success');

        // Sync with backend
        if (course.courseId != null) {
            this.plannerRequest('POST', '/move', {
                courseId: course.courseId,
                fromYear: sourceYear.toLowerCase(),
                fromSemester: sourceTerm.toLowerCase(),
                toYear: targetYear.toLowerCase(),
                toSemester: targetTerm.toLowerCase()
            }).then(() => this.loadPlannerFromBackend()).catch(err => {
                this.showToast(err.message || 'Failed to sync move with server.', 'error');
            });
        }
    }

    renderGridView() {
        this.renderYearView();
    }

    renderExpandedView(year) {
        this.activeYear = year;
        document.querySelectorAll('.planner-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.year === year);
        });
        this.renderYearView();
    }

    toggleYearExpansion(year) {
        this.renderExpandedView(year);
    }

    async openAddCourseModal(year, defaultTerm = 'Fall', periodIdx = null) {
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
                <option value="Fall"${defaultTerm === 'Fall' ? ' selected' : ''}>Fall</option>
                <option value="Spring"${defaultTerm === 'Spring' ? ' selected' : ''}>Spring</option>
                <option value="Full Year"${defaultTerm === 'Full Year' ? ' selected' : ''}>Full Year</option>
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
        addBtn.onclick = async () => {
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
                const result = await this.addCourseFromChatbot(selectedCourse.title, year, term, selectedCourseLength, selectedCourseGrade, periodIdx);
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

        // Fade out current content
        const details = document.getElementById('item-details');
        details.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        details.style.opacity = '0';
        details.style.transform = 'translateY(12px)';

        // Load data for the selected tab from API (auto-selects first item)
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
        const itemDetails = document.getElementById('item-details');
        const loadingText = this.currentTab === 'courses' ? 'Loading course details...' :
            this.currentTab === 'clubs' ? 'Loading club details...' :
                'Loading teacher details...';
        itemDetails.innerHTML = `<div class="loading-state">${loadingText}</div>`;

        await this.updateItemDetails();

        // Fade content back in
        itemDetails.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        itemDetails.style.opacity = '1';
        itemDetails.style.transform = 'translateY(0)';

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
                reviews.map((review, idx) => {
                    const likeCount = review.thumbsUp ?? 0;
                    const isLiked = review.userLiked ?? false;
                    const avatar = review.userPicture
                        ? `<img src="${review.userPicture}" class="review-avatar" alt="${review.userName}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                        : '';
                    const fallbackAvatar = `<div class="review-avatar-fallback" ${review.userPicture ? 'style="display:none"' : ''}>${(review.userName || 'A').charAt(0).toUpperCase()}</div>`;
                    const displayName = review.userName || 'Anonymous User';
                    const timeAgo = review.timestamp ? this.formatTimeAgo(review.timestamp) : '';
                    return `
                        <div class="review-card" style="animation-delay: ${Math.min(idx * 0.06, 0.6)}s" data-review-id="${review.id}">
                            <div class="review-header">
                                <div class="review-user">
                                    ${avatar}${fallbackAvatar}
                                    <div class="review-user-info">
                                        <strong>${displayName}</strong>
                                        ${timeAgo ? `<span class="review-timestamp">${timeAgo}</span>` : ''}
                                    </div>
                                </div>
                                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                            </div>
                            ${review.text ? `<p>${review.text}</p>` : '<p><em>No comment provided</em></p>'}
                            <div class="review-votes">
                                <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="window.app.likeReview('${review.id}', ${isLiked})">
                                    ${isLiked ? '❤️' : '🤍'} <span class="like-count">${likeCount}</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('') :
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

            if (this.containsBadWords(description)) {
                this.showToast('Your review contains inappropriate language. Please revise it.', 'error');
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
        const badWords = [
            'fuck', 'shit', 'ass', 'bitch', 'damn', 'bastard', 'dick', 'piss',
            'crap', 'hell', 'slut', 'whore', 'cunt', 'fag', 'nigger', 'nigga',
            'retard', 'moron', 'idiot', 'stupid', 'dumb', 'loser', 'suck',
            'stfu', 'wtf', 'lmfao', 'bullshit', 'asshole', 'douchebag',
            'motherfucker', 'fucker', 'dipshit', 'shitty', 'bitchy', 'dumbass'
        ];

        let filteredText = text;
        for (const word of badWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filteredText = filteredText.replace(regex, '*'.repeat(word.length));
        }
        return filteredText;
    }

    containsBadWords(text) {
        const badWords = [
            'fuck', 'shit', 'ass', 'bitch', 'damn', 'bastard', 'dick', 'piss',
            'crap', 'hell', 'slut', 'whore', 'cunt', 'fag', 'nigger', 'nigga',
            'retard', 'moron', 'idiot', 'stupid', 'dumb', 'loser', 'suck',
            'stfu', 'wtf', 'lmfao', 'bullshit', 'asshole', 'douchebag',
            'motherfucker', 'fucker', 'dipshit', 'shitty', 'bitchy', 'dumbass'
        ];

        const lower = text.toLowerCase();
        return badWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
    }

    formatTimeAgo(timestamp) {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        if (days < 30) return `${days}d ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        return `${Math.floor(months / 12)}y ago`;
    }

    async likeReview(reviewId, currentlyLiked) {
        const card = document.querySelector(`.review-card[data-review-id="${reviewId}"]`);
        if (!card) return;

        const btn = card.querySelector('.like-btn');
        const countEl = card.querySelector('.like-count');
        if (!btn || !countEl) return;

        const newLiked = !currentlyLiked;
        const delta = newLiked ? 1 : -1;
        const newCount = Math.max(0, parseInt(countEl.textContent) + delta);

        // Optimistic UI update
        btn.classList.toggle('liked', newLiked);
        btn.innerHTML = `${newLiked ? '❤️' : '🤍'} <span class="like-count">${newCount}</span>`;
        btn.setAttribute('onclick', `window.app.likeReview('${reviewId}', ${newLiked})`);

        // Sync with backend
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${this.apiBaseUrl}/api/reviews/${reviewId}/like`, {
                method: newLiked ? 'POST' : 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (err) {
            // Revert on failure
            btn.classList.toggle('liked', currentlyLiked);
            btn.innerHTML = `${currentlyLiked ? '❤️' : '🤍'} <span class="like-count">${Math.max(0, newCount - delta)}</span>`;
            btn.setAttribute('onclick', `window.app.likeReview('${reviewId}', ${currentlyLiked})`);
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

    async addCourseFromChatbot(courseName, year, term, courseLength = 'SM', courseGrade = '', periodIdx = null) {
        const validYears = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
        const validTerms = ['Fall', 'Spring', 'Full Year'];

        if (!validYears.includes(year)) {
            return { success: false, message: `"${year}" is not a valid year. Please use Freshman, Sophomore, Junior, or Senior.` };
        }
        if (!validTerms.includes(term)) {
            return { success: false, message: `"${term}" is not a valid term. Please use Fall, Spring, or Full Year.` };
        }

        const exists = Object.values(this.coursePlanner).some(yearData =>
            Object.values(yearData).some(termCourses =>
                termCourses.some(c => c && c.name.toLowerCase() === courseName.toLowerCase())
            )
        );
        if (exists) {
            return { success: false, message: `"${courseName}" already exists in your course plan.` };
        }

        if (term !== 'Full Year' && this.countSlots(this.coursePlanner[year][term]) >= 8) {
            return { success: false, message: `Your ${year} ${term} term is already full (8 courses maximum).` };
        }
        if (term === 'Full Year') {
            if (this.countSlots(this.coursePlanner[year]['Fall']) >= 8)
                return { success: false, message: `Your ${year} Fall term is already full (8 courses maximum).` };
            if (this.countSlots(this.coursePlanner[year]['Spring']) >= 8)
                return { success: false, message: `Your ${year} Spring term is already full (8 courses maximum).` };
        }

        // Look up backend courseId by name
        const courseData = this.courseNames.find(c => c.title.toLowerCase() === courseName.toLowerCase());
        const courseId = courseData?.id ?? null;
        const yearLower = year.toLowerCase();

        try {
            if (courseId !== null) {
                if (term === 'Full Year') {
                    await this.plannerRequest('POST', '/add', { courseId, year: yearLower, semester: 'fall' });
                    await this.plannerRequest('POST', '/add', { courseId, year: yearLower, semester: 'spring' });
                } else {
                    await this.plannerRequest('POST', '/add', { courseId, year: yearLower, semester: term.toLowerCase() });
                }
                await this.loadPlannerFromBackend();
            } else {
                // Fallback: local-only add when course not in backend catalogue
                const ts = Date.now();
                const placeInSparse = (arr, course, targetIdx = null) => {
                    while (arr.length < 8) arr.push(null);
                    if (targetIdx !== null && !arr[targetIdx]) {
                        arr[targetIdx] = course;
                    } else {
                        const slot = arr.findIndex(s => !s);
                        if (slot !== -1) arr[slot] = course;
                    }
                };
                if (term === 'Full Year') {
                    placeInSparse(this.coursePlanner[year]['Fall'], { id: `course-${ts}-fall`, name: courseName, description: '', length: courseLength, grade: courseGrade, isFullYear: true }, periodIdx);
                    placeInSparse(this.coursePlanner[year]['Spring'], { id: `course-${ts}-spring`, name: courseName, description: '', length: courseLength, grade: courseGrade, isFullYear: true }, periodIdx);
                } else {
                    placeInSparse(this.coursePlanner[year][term], { id: `course-${ts}`, name: courseName, description: '', length: courseLength, grade: courseGrade, isFullYear: false }, periodIdx);
                }
                this.savePlannerData();
                this.renderPlannerGrid();
            }

            const termLabel = term === 'Full Year' ? `${year} Fall and Spring` : `${year} ${term}`;
            this.showToast(`Added ${courseName} to ${termLabel}`, 'success');
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || 'Failed to add course.' };
        }
    }

    renderPlannerGrid() {
        this.renderYearView();
    }

    renderYearView() {
        const container = document.getElementById('planner-year-content');
        if (!container) return;

        const year = this.activeYear;
        const fallCourses = this.coursePlanner[year]?.Fall || [];
        const springCourses = this.coursePlanner[year]?.Spring || [];

        const addBtn = () => `<button class="add-period-btn" tabindex="-1">+</button>`;

        const rows = Array.from({ length: 8 }, (_, i) => {
            const period = i + 1;
            const fallCourse = fallCourses[i];
            const springCourse = springCourses[i];
            const isFullYear = fallCourse && fallCourse.isFullYear;

            // Full-year course — one wide bar
            if (isFullYear) {
                return `
                    <div class="period-row">
                        <span class="period-number">${period}</span>
                        <div class="period-courses">
                            <div class="course-card full-year"
                                 data-course-id="${fallCourse.id}" data-year="${year}"
                                 data-term="Fall" data-period-idx="${i}"
                                 draggable="true">
                                <span class="course-card-name">${fallCourse.name}</span>
                                <button class="remove-course" onclick="window.app.removeCourse('${fallCourse.id}', '${year}', 'Fall')">×</button>
                            </div>
                        </div>
                    </div>`;
            }

            // Both semester courses present — split 50/50
            if (fallCourse && springCourse) {
                return `
                    <div class="period-row">
                        <span class="period-number">${period}</span>
                        <div class="period-courses">
                            <div class="course-card semester fall-card"
                                    data-course-id="${fallCourse.id}" data-year="${year}"
                                    data-term="Fall" data-period-idx="${i}" draggable="true">
                                <span class="course-card-name">${fallCourse.name}</span>
                                <button class="remove-course" onclick="window.app.removeCourse('${fallCourse.id}', '${year}', 'Fall')">×</button>
                            </div>
                            <div class="course-card semester spring-card"
                                    data-course-id="${springCourse.id}" data-year="${year}"
                                    data-term="Spring" data-period-idx="${i}" draggable="true">
                                <span class="course-card-name">${springCourse.name}</span>
                                <button class="remove-course" onclick="window.app.removeCourse('${springCourse.id}', '${year}', 'Spring')">×</button>
                            </div>
                        </div>
                    </div>`;
            }

            // Only one semester course — show it full-width
            if (fallCourse || springCourse) {
                const course = fallCourse || springCourse;
                const term = fallCourse ? 'Fall' : 'Spring';
                const cls = fallCourse ? 'fall-card' : 'spring-card';
                return `
                    <div class="period-row">
                        <span class="period-number">${period}</span>
                        <div class="period-courses">
                            <div class="course-card ${cls}"
                                    data-course-id="${course.id}" data-year="${year}"
                                    data-term="${term}" data-period-idx="${i}" draggable="true">
                                <span class="course-card-name">${course.name}</span>
                                <button class="remove-course" onclick="window.app.removeCourse('${course.id}', '${year}', '${term}')">×</button>
                            </div>
                        </div>
                    </div>`;
            }

            // Empty period — single full-width slot with + button
            return `
                <div class="period-row">
                    <span class="period-number">${period}</span>
                    <div class="period-courses">
                        <div class="empty-slot" data-term="Fall" data-period-idx="${i}"
                             onclick="window.app.openAddCourseModal('${year}', 'Fall', ${i})">
                            ${addBtn()}
                        </div>
                    </div>
                </div>`;
        });

        container.innerHTML = rows.join('');
    }

    async removeCourse(courseId, year, term) {
        const course = this.coursePlanner[year][term].find(c => c && c.id === courseId);
        if (!course) return;

        const yearLower = year.toLowerCase();

        try {
            if (course.courseId != null) {
                if (course.isFullYear) {
                    await this.plannerRequest('DELETE', '/remove', { courseId: course.courseId, year: yearLower, semester: 'fall' });
                    await this.plannerRequest('DELETE', '/remove', { courseId: course.courseId, year: yearLower, semester: 'spring' });
                } else {
                    await this.plannerRequest('DELETE', '/remove', { courseId: course.courseId, year: yearLower, semester: term.toLowerCase() });
                }
                await this.loadPlannerFromBackend();
            } else {
                // Local-only fallback — null the slot to preserve sparse positions
                if (course.isFullYear) {
                    const name = course.name;
                    ['Fall', 'Spring'].forEach(t => {
                        const idx = this.coursePlanner[year][t].findIndex(c => c && c.name === name);
                        if (idx !== -1) this.coursePlanner[year][t][idx] = null;
                    });
                } else {
                    const idx = this.coursePlanner[year][term].findIndex(c => c && c.id === courseId);
                    if (idx !== -1) this.coursePlanner[year][term][idx] = null;
                }
                this.savePlannerData();
                this.renderPlannerGrid();
            }
            this.showToast(course.isFullYear ? `Removed full year course: ${course.name}` : 'Course removed', 'success');
        } catch (err) {
            this.showToast(err.message || 'Failed to remove course.', 'error');
        }
    }

    savePlannerData() {
        localStorage.setItem('coursePlanner', JSON.stringify(this.coursePlanner));
    }

    async plannerRequest(method, endpoint, body = null) {
        const token = localStorage.getItem('authToken');
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${this.apiBaseUrl}/api/planner${endpoint}`, options);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || `Planner request failed (${response.status})`);
        }
        return response.status === 204 ? null : response.json();
    }

    async loadPlannerFromBackend() {
        try {
            const result = await this.plannerRequest('GET', '');
            // Unwrap { success, data } envelope if present
            const data = (result && result.success !== undefined) ? result.data : result;
            const yearMap = { freshman: 'Freshman', sophomore: 'Sophomore', junior: 'Junior', senior: 'Senior' };
            const termMap = { fall: 'Fall', spring: 'Spring' };

            for (const [yearKey, yearData] of Object.entries(data)) {
                const year = yearMap[yearKey];
                if (!year || !this.coursePlanner[year]) continue;
                for (const [termKey, courses] of Object.entries(yearData)) {
                    const term = termMap[termKey];
                    if (!term) continue;
                    const dense = (courses || []).map(c => ({
                        id: `course-${c.id}`,
                        courseId: c.id,
                        name: c.title || c.name,
                        description: c.description || '',
                        length: c.length || 'SM',
                        grade: c.grade || '',
                        isFullYear: false
                    }));
                    this.coursePlanner[year][term] = this.toSparseArray(dense);
                }

                // Detect full-year courses: same courseId in both Fall and Spring
                const fallIds = new Set(this.coursePlanner[year].Fall.filter(Boolean).map(c => c.courseId));
                const springIds = new Set(this.coursePlanner[year].Spring.filter(Boolean).map(c => c.courseId));
                const fullYearIds = new Set([...fallIds].filter(id => springIds.has(id)));

                if (fullYearIds.size > 0) {
                    this.coursePlanner[year].Fall = this.coursePlanner[year].Fall.map(c =>
                        c && fullYearIds.has(c.courseId) ? { ...c, isFullYear: true } : c
                    );
                    this.coursePlanner[year].Spring = this.coursePlanner[year].Spring.map(c =>
                        c && fullYearIds.has(c.courseId) ? null : c
                    );
                }
            }
            this.savePlannerData();
        } catch (err) {
            console.warn('Could not load planner from backend, using local cache:', err);
            const saved = localStorage.getItem('coursePlanner');
            if (saved) {
                this.coursePlanner = JSON.parse(saved);
                // Normalize any legacy dense arrays to sparse length-8
                for (const yearData of Object.values(this.coursePlanner)) {
                    for (const termKey of ['Fall', 'Spring']) {
                        if (yearData[termKey] && yearData[termKey].length !== 8) {
                            yearData[termKey] = this.toSparseArray(yearData[termKey].filter(Boolean));
                        }
                    }
                }
            }
        }
        this.renderPlannerGrid();
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

async function clearPlanner() {
    if (confirm('Are you sure you want to clear your entire course plan?')) {
        const empty = {
            Freshman: { Fall: [], Spring: [] },
            Sophomore: { Fall: [], Spring: [] },
            Junior: { Fall: [], Spring: [] },
            Senior: { Fall: [], Spring: [] }
        };
        window.app.coursePlanner = empty;
        window.app.savePlannerData();
        window.app.renderPlannerGrid();
        window.app.showToast('Course plan cleared', 'success');

        try {
            await window.app.plannerRequest('DELETE', '/reset');
        } catch (err) {
            console.warn('Failed to reset planner on backend:', err);
        }
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