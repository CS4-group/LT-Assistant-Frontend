// Simple SPA Router and State Management
class App {
    constructor() {
        this.currentPage = '';
        this.isAuthenticated = false;
        this.apiBaseUrl = CONFIG.API_BASE_URL;
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

        // Setup scroll animations for satisfying expand/contract effect
        this.initScrollAnimations();
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
                document.documentElement.classList.add('theme-transitioning');
                const currentTheme = document.documentElement.getAttribute('data-theme');
                if (currentTheme === 'dark') {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'light');
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('theme', 'dark');
                }
                setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 500);
            });
        }
    }

    // Initialize satisfying scroll animations (expand & contract)
    initScrollAnimations() {
        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const rect = entry.boundingClientRect;
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;

                // If native animation-timeline is supported, we skip observer class toggling
                if (CSS.supports('animation-timeline: view()')) {
                    return;
                }

                if (entry.isIntersecting) {
                    entry.target.classList.remove('scroll-leave-bottom');
                    entry.target.classList.add('scroll-visible');
                } else {
                    entry.target.classList.remove('scroll-visible');
                    // Only apply leave animation if leaving from the bottom
                    if (rect.top > windowHeight / 2) {
                        entry.target.classList.add('scroll-leave-bottom');
                    } else {
                        // Keep visible when scrolling past the top
                        entry.target.classList.add('scroll-visible');
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -20px 0px'
        });

        // Dynamically observe elements as they are added
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // ELEMENT_NODE
                            if (node.matches && node.matches('.item-card, .review-card, .course-card')) {
                                this.scrollObserver.observe(node);
                            }
                            const children = node.querySelectorAll('.item-card, .review-card, .course-card') || [];
                            children.forEach(child => this.scrollObserver.observe(child));
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Observe any existing elements immediately
        document.querySelectorAll('.item-card, .review-card, .course-card').forEach(el => this.scrollObserver.observe(el));

        // Setup the stretch rubber-banding effect globally for scrolling menus
        this.setupRubberBanding();
    }

    setupRubberBanding() {
        this.activeRubberBands = new Map();

        const tick = () => {
            let active = false;

            this.activeRubberBands.forEach((state, container) => {
                // Decay target stretch gentler so grooved scroll momentum has time to stack up
                state.target *= 0.92;
                if (Math.abs(state.target) < 0.5) state.target = 0;

                // Spring physics: move current towards target
                const diff = state.target - state.current;
                state.velocity += diff * 0.15; // lower stiffness
                state.velocity *= 0.8; // less friction to let sliding carry over between clicks
                state.current += state.velocity;

                if (Math.abs(state.current) > 0.1 || Math.abs(state.target) > 0.1 || Math.abs(state.velocity) > 0.1) {
                    active = true;

                    // Cap visual stretch
                    let visualStretch = state.current;
                    if (visualStretch > 45) visualStretch = 45;

                    const stretchScale = 1 + (visualStretch / 400);
                    const translateY = state.origin === 'top' ? visualStretch / 2.5 : -visualStretch / 2.5;

                    container.style.transition = 'none'; // Controlled purely by rAF
                    container.style.transformOrigin = state.origin === 'top' ? 'top center' : 'bottom center';
                    container.style.transform = `scaleY(${stretchScale}) translateY(${translateY}px)`;
                } else {
                    state.current = 0;
                    state.target = 0;
                    state.velocity = 0;
                    container.style.transition = '';
                    container.style.transform = '';
                    this.activeRubberBands.delete(container);
                }
            });

            if (active) {
                this.rubberBandFrame = requestAnimationFrame(tick);
            } else {
                this.rubberBandFrame = null;
            }
        };

        document.addEventListener('wheel', (e) => {
            // Find the closest scrollable container
            const getScrollable = (node) => {
                if (!node || node === document.body || node === document.documentElement) return null;
                const style = window.getComputedStyle(node);
                const overflowY = style.overflowY;
                const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
                if (isScrollable) return node;
                return getScrollable(node.parentNode);
            };

            const container = getScrollable(e.target);
            if (!container) return;

            // Only apply to main scrolling lists
            if (!container.matches('.items-list, .main-content, .planner-year-content')) return;

            const atTop = container.scrollTop <= 0;
            // Epsilon check for Chrome Float bounds
            const atBottom = Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight - 1;

            if (atTop && e.deltaY < 0) {
                // Scrolling up when at top
                e.preventDefault();
                this.applyStretchSpring(container, Math.abs(e.deltaY), 'top', tick);
            } else if (atBottom && e.deltaY > 0) {
                // Scrolling down when at bottom
                e.preventDefault();
                this.applyStretchSpring(container, Math.abs(e.deltaY), 'bottom', tick);
            }
        }, { passive: false });
    }

    applyStretchSpring(container, delta, origin, loopObj) {
        if (!this.activeRubberBands.has(container)) {
            this.activeRubberBands.set(container, { current: 0, target: 0, velocity: 0, origin: origin });
        }

        const state = this.activeRubberBands.get(container);
        state.origin = origin; // Update origin just in case

        // Normalize delta to handle high-res trackpads vs stepped mice perfectly
        const normalizedDelta = Math.min(Math.abs(delta), 60);
        state.target += normalizedDelta * 0.15;

        if (!this.rubberBandFrame) {
            this.rubberBandFrame = requestAnimationFrame(loopObj);
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
        const path = window.location.hash.slice(1) || '/landing';

        // Redirect to login if not authenticated
        if (!this.isAuthenticated && path !== '/login' && path !== '/landing') {
            this.navigateTo('/login');
            return;
        }

        // Redirect to home if authenticated and on login page
        if (this.isAuthenticated && path === '/login') {
            this.navigateTo('/');
            return;
        }

        switch (path) {
            case '/landing':
                this.renderPage('landing');
                break;
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
                this.navigateTo('/landing');
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

        // Show theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.style.display = '';

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
            case 'landing':
                this.setupLandingHandlers();
                break;
        }
    }

    initFluidCanvas(container, canvasSelector, opts = {}) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const canvas = container.querySelector(canvasSelector);
        if (!canvas) return;

        const hues = opts.hues || [0, 350, 355, 5, 345];
        const silverChance = opts.silverChance || 0.3;
        const speed = opts.speed || 1;
        const mouseRadius = opts.mouseRadius || 140;
        const mouseMode = opts.mouseMode || 'repel';
        const connectionDist = opts.connectionDist || 110;
        const densityDiv = opts.densityDiv || 9000;
        const sizeMin = opts.sizeMin || 0.5;
        const sizeMax = opts.sizeMax || 2.5;
        const particleAlpha = opts.particleAlpha || 0.6;
        const lineMaxAlpha = opts.lineMaxAlpha || 0.15;
        const heightMul = opts.heightMultiplier || 1.25;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null, radius: mouseRadius };

        const resize = () => {
            width = canvas.width = canvas.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.offsetHeight || (window.innerHeight * heightMul);
            initParticles();
        };
        window.addEventListener('resize', resize);

        container.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = (e.clientX - rect.left) * (width / rect.width);
            mouse.y = (e.clientY - rect.top) * (height / rect.height);
        });
        container.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * (sizeMax - sizeMin) + sizeMin;
                this.density = (Math.random() * 20) + 1;
                this.vx = (Math.random() - 0.5) * speed;
                this.vy = (Math.random() - 0.5) * speed;
                if (Math.random() < silverChance) {
                    this.hue = 0;
                    this.sat = 5;
                    this.light = 78 + Math.random() * 10;
                } else {
                    this.hue = hues[Math.floor(Math.random() * hues.length)];
                    this.sat = 70 + Math.random() * 15;
                    this.light = 60 + Math.random() * 15;
                }
            }
            draw() {
                this.drawX = this.x;
                this.drawY = this.y;
                ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${particleAlpha})`;
                ctx.beginPath();
                ctx.arc(this.drawX, this.drawY, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let maxDistance = mouse.radius;
                    if (distance < maxDistance && distance > 0) {
                        if (mouseMode === 'attract') {
                            let t = 1 - distance / maxDistance;
                            let force = t * t * t * 0.8;
                            let maxStep = 3.5;
                            let moveX = (dx / distance) * force * this.density;
                            let moveY = (dy / distance) * force * this.density;
                            let mag = Math.sqrt(moveX * moveX + moveY * moveY);
                            if (mag > maxStep) {
                                moveX = (moveX / mag) * maxStep;
                                moveY = (moveY / mag) * maxStep;
                            }
                            if (distance > 35) {
                                this.x += moveX;
                                this.y += moveY;
                            }
                        } else {
                            let force = (maxDistance - distance) / maxDistance;
                            this.x -= (dx / distance) * force * this.density;
                            this.y -= (dy / distance) * force * this.density;
                        }
                    }
                }
            }
        }

        const initParticles = () => {
            particles = [];
            let numberOfParticles = Math.floor((width * height) / densityDiv);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        width = canvas.width = canvas.offsetWidth || window.innerWidth;
        height = canvas.height = canvas.offsetHeight || (window.innerHeight * heightMul);
        initParticles();

        const animateNetwork = () => {
            if (!document.body.contains(canvas)) {
                window.removeEventListener('resize', resize);
                return;
            }
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }

            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].drawX - particles[j].drawX;
                    let dy = particles[i].drawY - particles[j].drawY;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDist) {
                        ctx.beginPath();
                        let avgHue = (particles[i].hue + particles[j].hue) / 2;
                        let avgSat = (particles[i].sat + particles[j].sat) / 2;
                        let avgLight = (particles[i].light + particles[j].light) / 2;
                        ctx.strokeStyle = `hsla(${avgHue}, ${avgSat}%, ${avgLight}%, ${lineMaxAlpha - distance / (connectionDist * 6.67)})`;
                        ctx.lineWidth = opts.lineWidth || 0.8;
                        ctx.moveTo(particles[i].drawX, particles[i].drawY);
                        ctx.lineTo(particles[j].drawX, particles[j].drawY);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
            requestAnimationFrame(animateNetwork);
        };
        animateNetwork();
    }

    setupLandingHandlers() {
        // Hide theme toggle on landing page
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) themeToggle.style.display = 'none';

        const landingPage = document.querySelector('.landing-page');
        if (!landingPage) return;

        // Scroll reveal observer — toggles on enter/leave so animations replay
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const delay = entry.target.dataset.revealDelay || 0;
                entry.target.style.setProperty('--reveal-delay', delay);
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        landingPage.querySelectorAll('.landing-reveal').forEach(el => {
            revealObserver.observe(el);
        });

        // Add 3D Tilt and Spotlight Hover to Bento Cards
        const bentoCards = landingPage.querySelectorAll('.landing-bento-card');
        bentoCards.forEach(card => {
            let targetX = 0, targetY = 0;
            let currX = 0, currY = 0;
            let isHovered = false;
            let scale = 1, ty = 0;
            let animFrame = null;

            const tick = () => {
                // Smoothly lerp towards targets
                currX += (targetX - currX) * 0.12;
                currY += (targetY - currY) * 0.12;

                const targetScale = isHovered ? 1.02 : 1;
                const targetTy = isHovered ? -8 : 0;
                scale += (targetScale - scale) * 0.15;
                ty += (targetTy - ty) * 0.15;

                // Render tight 3D transform without CSS fighting
                card.style.transform = `perspective(1000px) translateY(${ty}px) scale(${scale}) rotateX(${currY}deg) rotateY(${currX}deg)`;

                // Stop physics tick if returned to rest completely
                if (!isHovered && Math.abs(currX) < 0.01 && Math.abs(currY) < 0.01 && Math.abs(scale - 1) < 0.001) {
                    card.style.transform = '';
                    card.style.transition = ''; // Restore original CSS transitions
                    animFrame = null;
                    return;
                }

                animFrame = requestAnimationFrame(tick);
            };

            card.addEventListener('mouseenter', () => {
                isHovered = true;
                // Remove CSS transform transitions so JS can physics it tightly without lag/stutter
                card.style.transition = 'box-shadow 0.5s ease, border-color 0.4s ease, background-color 0.4s ease';
                if (!animFrame) animFrame = requestAnimationFrame(tick);
            });

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Spotlight coordinate variables
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);

                // 3D Parallax Tilt targets
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                targetY = ((y - centerY) / centerY) * -5; // Increased slightly for juicier feedback
                targetX = ((x - centerX) / centerX) * 5;
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                targetX = 0;
                targetY = 0;
            });
        });

        // Navbar appears on scroll (hidden when hero is visible)
        const nav = landingPage.querySelector('.landing-nav');
        const hero = landingPage.querySelector('.landing-hero');

        if (nav && hero) {
            const navObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        nav.classList.add('landing-nav--scrolled');
                    } else {
                        nav.classList.remove('landing-nav--scrolled');
                    }
                });
            }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
            navObserver.observe(hero);
        }

        // Icon animation triggers — toggles on enter/leave so animations replay
        const iconObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('landing-icon-animate');
                } else {
                    entry.target.classList.remove('landing-icon-animate');
                }
            });
        }, { threshold: 0.5 });

        landingPage.querySelectorAll('.landing-bento-icon').forEach(el => {
            iconObserver.observe(el);
        });

        // Hero parallax on scroll
        const heroContent = landingPage.querySelector('.landing-hero-content');
        const scrollIndicator = landingPage.querySelector('.landing-scroll-indicator');

        landingPage.addEventListener('scroll', () => {
            const scrollY = landingPage.scrollTop;
            if (scrollY < window.innerHeight && heroContent) {
                const progress = scrollY / window.innerHeight;
                heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
                heroContent.style.opacity = 1 - progress * 1.2;
            }
            if (scrollIndicator) {
                scrollIndicator.style.opacity = Math.max(0, 1 - (scrollY / 200));
            }
        });

        // Setup Fluid Particles Background
        this.initFluidCanvas(landingPage, '.fluid-canvas', {
            heightMultiplier: 1.25,
            hues: [0, 350, 355, 5, 345],
            silverChance: 0.3,
            speed: 1,
            mouseRadius: 140,
            mouseMode: 'repel',
            connectionDist: 130,
            densityDiv: 7000,
            sizeMin: 1.5,
            sizeMax: 4,
            particleAlpha: 0.75,
            lineMaxAlpha: 0.3,
            lineWidth: 2
        });
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

        // Setup fluid particles background
        const homePage = document.querySelector('.home-page');
        if (homePage) this.initFluidCanvas(homePage, '.fluid-canvas', {
            heightMultiplier: 1.0,
            hues: [0, 350, 355, 5, 345],
            silverChance: 0.35,
            speed: 0.5,
            mouseRadius: 200,
            mouseMode: 'attract',
            connectionDist: 140,
            densityDiv: 7000,
            sizeMin: 1.5,
            sizeMax: 4,
            particleAlpha: 0.7,
            lineMaxAlpha: 0.28,
            lineWidth: 2
        });
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
        const yearOrder = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
        this.isAnimatingPlanner = false;
        document.querySelectorAll('.planner-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (this.isAnimatingPlanner) return;
                const oldYear = this.activeYear;
                const newYear = tab.dataset.year;
                if (oldYear === newYear) return;

                const oldIndex = yearOrder.indexOf(oldYear);
                const newIndex = yearOrder.indexOf(newYear);
                this.slideDirection = newIndex > oldIndex ? 'right' : 'left';

                document.querySelectorAll('.planner-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeYear = newYear;

                const container = document.getElementById('planner-year-content');
                if (container) {
                    this.isAnimatingPlanner = true;
                    // Lock height to strictly prevent flashing geometry
                    const currentHeight = container.offsetHeight;
                    container.style.height = `${currentHeight}px`;
                    container.style.overflow = 'hidden';

                    // Force reflow
                    container.style.animation = 'none';
                    void container.offsetHeight;

                    if (this.slideDirection === 'right') {
                        container.style.animation = 'scheduleSlideOutLeft 0.2s cubic-bezier(0.32, 0, 0.67, 0) both';
                    } else {
                        container.style.animation = 'scheduleSlideOutRight 0.2s cubic-bezier(0.32, 0, 0.67, 0) both';
                    }

                    setTimeout(() => {
                        container.style.height = '';
                        container.style.overflow = '';
                        this.renderYearView();
                        this.isAnimatingPlanner = false;
                    }, 200);
                } else {
                    this.renderYearView();
                }
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
            const gradeNums = course.grade.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g));

            const yearGradeMap = {
                'Freshman': 9,
                'Sophomore': 10,
                'Junior': 11,
                'Senior': 12
            };

            const targetGrade = yearGradeMap[targetYear];

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

        const closeModal = () => {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
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
            <button class="modal-close">×</button>
        `;
        modalHeader.querySelector('.modal-close').onclick = closeModal;

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
        cancelBtn.onclick = closeModal;

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
                    closeModal();
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
                     data-id="${item.id}"
                     style="animation-delay: ${delay}s"
                     onclick="window.app.selectItem('${item.id}')">
                    <div class="selection-bg"></div>
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

        const list = document.getElementById('items-list');
        if (list) {
            list.querySelectorAll('.item-card').forEach(card => {
                if (card.dataset.id === String(itemId)) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            });
        }

        // Show loading state for item details
        const itemDetails = document.getElementById('item-details');
        const loadingText = this.currentTab === 'courses' ? 'Loading course details...' :
            this.currentTab === 'clubs' ? 'Loading club details...' :
                'Loading teacher details...';
        itemDetails.innerHTML = `<div class="loading-state">${loadingText}</div>`;

        await this.updateItemDetails();

        // Play loud entry animation for the right panel
        itemDetails.style.transition = 'none';
        itemDetails.style.animation = 'none';
        void itemDetails.offsetWidth; // Force a browser reflow to physically reset the animation
        itemDetails.style.animation = 'detailsPopIn 0.6s var(--ease-bouncy) forwards';

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
        const allReviews = await this.fetchReviews(entityType, this.selectedItemId);

        // Compute average rating from the full (unfiltered) set
        let avgRating = 0;
        let totalReviews = allReviews.length;
        if (totalReviews > 0) {
            avgRating = (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1);
        } else if (item.averageRating) {
            avgRating = parseFloat(item.averageRating).toFixed(1);
            totalReviews = item.reviewCount || 0;
        }

        // Apply filter on a copy so the unfiltered set stays intact
        let reviews = [...allReviews];

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

        let starDisplay = '';
        if (totalReviews > 0) {
            starDisplay = `<div class="rating-display-stars">☆☆☆☆☆</div>`;
        }

        itemDetails.innerHTML = `
            <h2>${item.title}</h2>
            <div class="rating-display-container">
                <div class="rating-number-wrapper">
                    <div class="rating-display-number"><span class="animated-rating" data-target="${avgRating}">${totalReviews > 0 ? '0.0' : '-.-'}</span></div>
                </div>
                <span class="rating-max"> / 5.0</span>
                ${starDisplay}
                <div class="rating-count">(${totalReviews} review${totalReviews !== 1 ? 's' : ''})</div>
            </div>
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

        // Animate the average rating counter and stars from 0.0 → target
        const ratingEl = itemDetails.querySelector('.animated-rating');
        const starsEl = itemDetails.querySelector('.rating-display-stars');

        if (ratingEl) {
            const target = parseFloat(ratingEl.getAttribute('data-target')) || 0;
            if (target > 0) {
                const duration = 1500; // ms
                let startTime = null;
                const animateCounter = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // ease-out curve
                    const eased = 1 - Math.pow(1 - progress, 4);
                    const currentRating = target * eased;

                    if (progress >= 1) {
                        ratingEl.textContent = target.toFixed(1);
                        if (starsEl) {
                            const rounded = Math.round(target);
                            starsEl.textContent = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
                        }
                    } else {
                        ratingEl.textContent = currentRating.toFixed(1);
                        if (starsEl) {
                            const rounded = Math.round(currentRating);
                            starsEl.textContent = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
                        }
                        requestAnimationFrame(animateCounter);
                    }
                };
                requestAnimationFrame(animateCounter);
            } else if (starsEl) {
                starsEl.textContent = '☆☆☆☆☆';
            }
        }
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

        const closeModal = () => {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
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
            <button class="modal-close">×</button>
        `;
        modalHeader.querySelector('.modal-close').onclick = closeModal;

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
        cancelBtn.onclick = closeModal;

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

                closeModal();
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

        // Force reflow to re-trigger CSS animation
        container.style.animation = 'none';
        void container.offsetHeight;

        if (this.slideDirection === 'left') {
            container.style.animation = 'scheduleSlideInLeft 0.25s cubic-bezier(0.33, 1, 0.68, 1) both';
        } else if (this.slideDirection === 'right') {
            container.style.animation = 'scheduleSlideInRight 0.25s cubic-bezier(0.33, 1, 0.68, 1) both';
        } else {
            container.style.animation = '';
        }

        // Clear it so dropping courses doesn't magically slide
        this.slideDirection = null;

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
