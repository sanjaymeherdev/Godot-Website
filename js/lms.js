class LMSManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.userCourses = [];
        this.courses = [];
        this.modules = [];
        this.userProgress = {};
        this.init();
    }

    async init() {
        await this.loadUserData();
        await this.loadCourses();
        await this.loadUserCourses();
        await this.loadUserProgress();
        this.setupEventListeners();
        this.renderCourses();
        this.updateProgress();
    }

    async loadUserData() {
        // Get current user from auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            this.currentUser = session.user;
            
            // Load user profile
            const profileResult = await authManager.getUserProfile(this.currentUser.id);
            if (profileResult.success) {
                this.userProfile = profileResult.data;
            }
        }
    }

    async loadCourses() {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .eq('is_active', true)
                .order('created_at');

            if (error) throw error;
            this.courses = data || [];
        } catch (error) {
            console.error('Error loading courses:', error);
            this.courses = [];
        }
    }

    async loadUserCourses() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('user_courses')
                .select(`
                    *,
                    courses (*)
                `)
                .eq('user_id', this.currentUser.id)
                .eq('payment_status', 'completed')
                .gte('access_expires_at', new Date().toISOString());

            if (error) throw error;
            this.userCourses = data || [];
        } catch (error) {
            console.error('Error loading user courses:', error);
            this.userCourses = [];
        }
    }

    async loadUserProgress() {
        if (!this.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('user_progress')
                .select(`
                    *,
                    course_modules (*)
                `)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;
            
            // Convert to a more usable format
            this.userProgress = {};
            data?.forEach(progress => {
                this.userProgress[progress.module_id] = progress;
            });
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.userProgress = {};
        }
    }

    async loadCourseModules(courseId) {
        try {
            const { data, error } = await supabase
                .from('course_modules')
                .select('*')
                .eq('course_id', courseId)
                .order('module_order');

            if (error) throw error;
            this.modules = data || [];
            
            // Check module access based on user's subscription
            this.updateModuleAccess();
            
        } catch (error) {
            console.error('Error loading modules:', error);
            this.modules = [];
        }
    }

    updateModuleAccess() {
        const userTier = this.userProfile?.subscription_tier || 'free';
        const userTierLevel = this.getTierLevel(userTier);

        this.modules.forEach(module => {
            const moduleTierLevel = this.getTierLevel(module.required_tier);
            module.unlocked = userTierLevel >= moduleTierLevel;
            
            // Also check if user has purchased the course
            const hasCourseAccess = this.userCourses.some(uc => uc.course_id === module.course_id);
            module.unlocked = module.unlocked && hasCourseAccess;
        });
    }

    getTierLevel(tier) {
        const tierOrder = { 
            'free': 0, 
            'basic': 1, 
            'pro': 2, 
            'premium': 3 
        };
        return tierOrder[tier] || 0;
    }

    // Check if user has access to a specific course
    hasCourseAccess(courseId) {
        return this.userCourses.some(uc => 
            uc.course_id === courseId && 
            uc.payment_status === 'completed' &&
            new Date(uc.access_expires_at) > new Date()
        );
    }

    // Check if user has access to a specific module
    hasModuleAccess(moduleId) {
        const module = this.modules.find(m => m.id === moduleId);
        if (!module) return false;

        const userTierLevel = this.getTierLevel(this.userProfile?.subscription_tier || 'free');
        const moduleTierLevel = this.getTierLevel(module.required_tier);
        
        const tierAccess = userTierLevel >= moduleTierLevel;
        const courseAccess = this.hasCourseAccess(module.course_id);
        
        return tierAccess && courseAccess;
    }

    renderCourses() {
        const coursesContainer = document.getElementById('coursesContainer');
        if (!coursesContainer) return;

        coursesContainer.innerHTML = this.courses.map(course => {
            const hasAccess = this.hasCourseAccess(course.id);
            const isPurchased = this.userCourses.some(uc => uc.course_id === course.id);
            
            return `
                <div class="course-card ${hasAccess ? 'unlocked' : 'locked'}">
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    <div class="course-meta">
                        <span class="course-tier">Tier: ${course.required_tier}</span>
                        <span class="course-price">$${course.price}</span>
                    </div>
                    <div class="course-actions">
                        ${hasAccess ? 
                            `<button class="cta-button" onclick="lmsManager.selectCourse('${course.id}')">
                                Start Learning
                            </button>` :
                            `<button class="cta-button ${isPurchased ? 'pending' : 'purchase'}" 
                                     onclick="lmsManager.purchaseCourse('${course.id}')">
                                ${isPurchased ? 'Payment Pending' : `Purchase - $${course.price}`}
                            </button>`
                        }
                    </div>
                    ${hasAccess ? '<div class="access-badge">✅ Access Granted</div>' : ''}
                </div>
            `;
        }).join('');
    }

    async selectCourse(courseId) {
        if (!this.hasCourseAccess(courseId)) {
            this.showPurchasePrompt(courseId);
            return;
        }

        await this.loadCourseModules(courseId);
        this.renderModules();
        
        // Update UI to show modules view
        document.getElementById('coursesView').style.display = 'none';
        document.getElementById('modulesView').style.display = 'block';
        document.getElementById('backToCourses').style.display = 'block';
    }

    renderModules() {
        const modulesList = document.getElementById('modulesList');
        if (!modulesList) return;

        modulesList.innerHTML = this.modules.map(module => {
            const progress = this.userProgress[module.id];
            const isCompleted = progress?.completed;
            
            return `
                <div class="module-item ${module.unlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}" 
                     data-module-id="${module.id}">
                    <div class="module-header">
                        <span class="module-number">${module.module_order.toString().padStart(2, '0')}</span>
                        <span class="module-title">${module.title}</span>
                        <span class="module-duration">${module.duration}</span>
                        <span class="module-status status-${module.unlocked ? (isCompleted ? 'completed' : 'unlocked') : 'locked'}">
                            ${module.unlocked ? (isCompleted ? '✅ Completed' : '▶ Available') : '🔒 Locked'}
                        </span>
                    </div>
                    ${module.unlocked ? `
                        <div class="module-preview">
                            <p>${module.description}</p>
                        </div>
                    ` : `
                        <div class="module-preview">
                            <p>🔒 Upgrade to ${module.required_tier} tier to access this module</p>
                        </div>
                    `}
                </div>
            `;
        }).join('');

        // Add event listeners
        this.modules.forEach(module => {
            if (module.unlocked) {
                const element = document.querySelector(`[data-module-id="${module.id}"]`);
                element?.addEventListener('click', () => this.selectModule(module));
            }
        });
    }

    async selectModule(module) {
        if (!this.hasModuleAccess(module.id)) {
            this.showUpgradeMessage(module.required_tier);
            return;
        }

        this.currentModule = module;
        
        // Update UI
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-module-id="${module.id}"]`)?.classList.add('active');

        // Load video
        this.loadVideo(module);

        // Update user progress
        await this.trackModuleAccess(module.id);
    }

    async trackModuleAccess(moduleId) {
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: this.currentUser.id,
                    module_id: moduleId,
                    last_accessed: new Date().toISOString()
                }, {
                    onConflict: 'user_id,module_id'
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error tracking module access:', error);
        }
    }

    async markModuleCompleted(moduleId) {
        try {
            const { data, error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: this.currentUser.id,
                    module_id: moduleId,
                    completed: true,
                    progress_percentage: 100,
                    completed_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,module_id'
                });

            if (error) throw error;
            
            // Update local state
            if (!this.userProgress[moduleId]) {
                this.userProgress[moduleId] = {};
            }
            this.userProgress[moduleId].completed = true;
            
            this.updateProgress();
            this.renderModules();
            
        } catch (error) {
            console.error('Error marking module completed:', error);
        }
    }

    async purchaseCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        // In a real implementation, this would integrate with Stripe
        // For now, we'll simulate a purchase
        try {
            const { data, error } = await supabase
                .from('user_courses')
                .upsert({
                    user_id: this.currentUser.id,
                    course_id: courseId,
                    payment_status: 'completed',
                    access_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
                }, {
                    onConflict: 'user_id,course_id'
                });

            if (error) throw error;

            // Reload user courses and refresh UI
            await this.loadUserCourses();
            this.renderCourses();
            
            alert('🎉 Course purchased successfully! You now have access.');
            
        } catch (error) {
            console.error('Error purchasing course:', error);
            alert('❌ Purchase failed: ' + error.message);
        }
    }

    showUpgradeMessage(requiredTier) {
        alert(`This content requires ${requiredTier} subscription. Please upgrade your account to access this module.`);
    }

    showPurchasePrompt(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (course) {
            alert(`Please purchase the "${course.title}" course to access its content. Price: $${course.price}`);
        }
    }

    updateProgress() {
        // Calculate overall progress
        const totalModules = this.modules.filter(m => m.unlocked).length;
        const completedModules = Object.values(this.userProgress).filter(p => p.completed).length;
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // Update UI elements
        const progressFill = document.getElementById('progressFill');
        const progressPercentageElement = document.getElementById('progressPercentage');
        
        if (progressFill) progressFill.style.width = `${progressPercentage}%`;
        if (progressPercentageElement) progressPercentageElement.textContent = `${progressPercentage}%`;
    }

    // Navigation back to courses
    backToCourses() {
        document.getElementById('coursesView').style.display = 'block';
        document.getElementById('modulesView').style.display = 'none';
        document.getElementById('backToCourses').style.display = 'none';
    }
}

// Initialize LMS Manager
if (window.location.pathname.includes('course.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        window.lmsManager = new LMSManager();
        
        // Add back button handler
        document.getElementById('backToCourses')?.addEventListener('click', () => {
            window.lmsManager.backToCourses();
        });
    });
}
