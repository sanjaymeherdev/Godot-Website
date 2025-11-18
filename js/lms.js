class LMSManager {
    constructor() {
        this.currentUser = null;
        this.modules = [];
        this.userProgress = {};
        this.init();
    }

    async init() {
        await this.loadCourseData();
        this.setupEventListeners();
        this.renderModules();
        this.updateProgress();
    }

    async loadCourseData() {
        // Course modules data
        this.modules = [
            {
                id: 1,
                title: "Introduction to Godot 4",
                description: "Get started with Godot 4 and understand the basics of 3D game development",
                videoId: "dQw4w9WgXcQ",
                duration: "15:30",
                order: 1,
                requiredTier: "basic",
                unlocked: true
            },
            {
                id: 2,
                title: "Multiplayer Networking Setup",
                description: "Learn how to set up client-server architecture and RPC calls",
                videoId: "abc123def456",
                duration: "22:45",
                order: 2,
                requiredTier: "basic",
                unlocked: true
            },
            {
                id: 3,
                title: "Character System & Animation",
                description: "Create and implement 3D character models with animations",
                videoId: "xyz789uvw000",
                duration: "28:15",
                order: 3,
                requiredTier: "pro",
                unlocked: false
            }
        ];

        // Load user progress from localStorage
        this.userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prevBtn')?.addEventListener('click', () => this.navigateModule(-1));
        document.getElementById('nextBtn')?.addEventListener('click', () => this.navigateModule(1));
        
        // Play/Pause button
        document.getElementById('playPause')?.addEventListener('click', () => this.togglePlayPause());
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterModules(e.target.dataset.filter);
            });
        });
    }

    renderModules() {
        const modulesList = document.getElementById('modulesList');
        if (!modulesList) return;

        modulesList.innerHTML = '';

        this.modules.forEach(module => {
            const moduleElement = this.createModuleElement(module);
            modulesList.appendChild(moduleElement);
        });
    }

    createModuleElement(module) {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = `module-item ${module.unlocked ? '' : 'locked'} ${this.userProgress[module.id]?.completed ? 'completed' : ''}`;
        moduleDiv.dataset.moduleId = module.id;

        const status = this.getModuleStatus(module);
        
        moduleDiv.innerHTML = `
            <div class="module-header">
                <span class="module-number">${module.order.toString().padStart(2, '0')}</span>
                <span class="module-title">${module.title}</span>
                <span class="module-duration">${module.duration}</span>
                <span class="module-status status-${status}">${this.getStatusText(status)}</span>
            </div>
        `;

        if (module.unlocked) {
            moduleDiv.addEventListener('click', () => this.selectModule(module));
        }

        return moduleDiv;
    }

    getModuleStatus(module) {
        if (!module.unlocked) return 'locked';
        if (this.userProgress[module.id]?.completed) return 'completed';
        return 'unlocked';
    }

    getStatusText(status) {
        const statusTexts = {
            locked: '🔒 Locked',
            unlocked: '▶ Available',
            completed: '✅ Completed'
        };
        return statusTexts[status] || 'Available';
    }

    selectModule(module) {
        if (!module.unlocked) {
            this.showUpgradeMessage(module.requiredTier);
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
        if (!this.userProgress[module.id]) {
            this.userProgress[module.id] = {
                started: true,
                completed: false,
                lastAccessed: new Date().toISOString(),
                timeSpent: 0
            };
            this.saveProgress();
        }

        this.updateProgress();
    }

    loadVideo(module) {
        const videoPlayer = document.getElementById('videoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        const videoDescription = document.getElementById('videoDescription');
        const videoDuration = document.getElementById('videoDuration');
        const videoStatus = document.getElementById('videoStatus');

        if (!videoPlayer || !videoTitle) return;

        // Update video info
        videoTitle.textContent = module.title;
        videoDescription.textContent = module.description;
        videoDuration.textContent = `Duration: ${module.duration}`;
        videoStatus.textContent = this.userProgress[module.id]?.completed ? 'Completed' : 'In Progress';

        // Create protected video embed
        videoPlayer.innerHTML = `
            <iframe 
                class="protected-video"
                src="https://www.youtube.com/embed/${module.videoId}?rel=0&modestbranding=1&showinfo=0&controls=1"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        `;

        // Enable controls
        const playPauseBtn = document.getElementById('playPause');
        if (playPauseBtn) {
            playPauseBtn.disabled = false;
        }

        // Track video start
        this.trackVideoStart(module);
    }

    trackVideoStart(module) {
        console.log(`Started watching: ${module.title}`);
        
        // Simulate progress tracking
        setTimeout(() => {
            if (!this.userProgress[module.id].completed) {
                this.userProgress[module.id].completed = true;
                this.userProgress[module.id].completedAt = new Date().toISOString();
                this.saveProgress();
                this.updateProgress();
                this.renderModules();
            }
        }, 5000);
    }

    navigateModule(direction) {
        if (!this.currentModule) return;

        const currentIndex = this.modules.findIndex(m => m.id === this.currentModule.id);
        const newIndex = currentIndex + direction;

        if (newIndex >= 0 && newIndex < this.modules.length) {
            const newModule = this.modules[newIndex];
            if (newModule.unlocked) {
                this.selectModule(newModule);
            }
        }
    }

    togglePlayPause() {
        const playPauseBtn = document.getElementById('playPause');
        if (!playPauseBtn) return;

        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');

        if (playIcon.style.display !== 'none') {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
            playPauseBtn.innerHTML = '<span class="pause-icon">⏸ Pause</span>';
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
            playPauseBtn.innerHTML = '<span class="play-icon">▶ Play</span>';
        }
    }

    filterModules(filter) {
        const modules = document.querySelectorAll('.module-item');
        
        modules.forEach(module => {
            switch (filter) {
                case 'unlocked':
                    module.style.display = module.classList.contains('locked') ? 'none' : 'block';
                    break;
                case 'completed':
                    module.style.display = module.classList.contains('completed') ? 'block' : 'none';
                    break;
                default:
                    module.style.display = 'block';
            }
        });
    }

    updateProgress() {
        const totalModules = this.modules.filter(m => m.unlocked).length;
        const completedModules = Object.values(this.userProgress).filter(p => p.completed).length;
        const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // Update progress bar
        const progressFill = document.getElementById('progressFill');
        const progressPercentageElement = document.getElementById('progressPercentage');
        
        if (progressFill) progressFill.style.width = `${progressPercentage}%`;
        if (progressPercentageElement) progressPercentageElement.textContent = `${progressPercentage}%`;

        // Update progress circle
        const circle = document.getElementById('completionCircle');
        const completionPercent = document.getElementById('completionPercent');
        
        if (circle && completionPercent) {
            const circumference = 339.292;
            const offset = circumference - (progressPercentage / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            completionPercent.textContent = `${progressPercentage}%`;
        }

        // Update time stats
        this.updateTimeStats();
        this.updateActivityList();
    }

    updateTimeStats() {
        const totalTime = Object.values(this.userProgress).reduce((total, progress) => total + (progress.timeSpent || 0), 0);
        const totalHours = Math.floor(totalTime / 3600);
        const totalMinutes = Math.floor((totalTime % 3600) / 60);
        
        const totalTimeElement = document.getElementById('totalTime');
        const weeklyTimeElement = document.getElementById('weeklyTime');
        
        if (totalTimeElement) totalTimeElement.textContent = `${totalHours}h ${totalMinutes}m`;
        if (weeklyTimeElement) weeklyTimeElement.textContent = `${Math.floor(totalHours * 0.3)}h ${Math.floor(totalMinutes * 0.3)}m`;
    }

    updateActivityList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [];

        // Get recent completed modules
        Object.entries(this.userProgress)
            .filter(([_, progress]) => progress.completed)
            .sort((a, b) => new Date(b[1].completedAt) - new Date(a[1].completedAt))
            .slice(0, 5)
            .forEach(([moduleId, progress]) => {
                const module = this.modules.find(m => m.id == moduleId);
                if (module) {
                    activities.push({
                        text: `Completed: ${module.title}`,
                        time: new Date(progress.completedAt).toLocaleDateString()
                    });
                }
            });

        // Add sample activities if none exist
        if (activities.length === 0) {
            activities.push(
                { text: 'Joined the course', time: new Date().toLocaleDateString() },
                { text: 'Started learning Godot 4', time: new Date().toLocaleDateString() }
            );
        }

        activityList.innerHTML = activities
            .map(activity => `
                <div class="activity-item">
                    <div>${activity.text}</div>
                    <small>${activity.time}</small>
                </div>
            `)
            .join('');
    }

    showUpgradeMessage(tier) {
        alert(`This module requires ${tier} subscription. Please upgrade to access this content.`);
    }

    saveProgress() {
        localStorage.setItem('userProgress', JSON.stringify(this.userProgress));
    }

    async loadUserData() {
        console.log('Loading user data...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.updateModuleAccess();
    }

    updateModuleAccess() {
        // In real implementation, check user's subscription tier from Supabase
        const userTier = 'basic';
        
        this.modules.forEach(module => {
            module.unlocked = this.checkModuleAccess(module, userTier);
        });
        
        this.renderModules();
    }

    checkModuleAccess(module, userTier) {
        const tierOrder = { 'basic': 1, 'pro': 2, 'premium': 3 };
        const userTierLevel = tierOrder[userTier] || 0;
        const moduleTierLevel = tierOrder[module.requiredTier] || 0;
        
        return userTierLevel >= moduleTierLevel;
    }
}

// Initialize LMS Manager when on course page
if (window.location.pathname.includes('course.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        window.lmsManager = new LMSManager();
        console.log('LMS Manager initialized with user data');
    });
}
