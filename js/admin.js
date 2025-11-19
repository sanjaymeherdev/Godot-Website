// Supabase Configuration
const SUPABASE_URL = 'https://usooclimfkregwrtmdki.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzb29jbGltZmtyZWd3cnRtZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Nzg2MTEsImV4cCI6MjA3OTA1NDYxMX0.43Wy4GS_DSx4IWXmFKg5wz0YwmV7lsadWcm0ysCcfe0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.courses = [];
        this.students = [];
        this.chapters = [];
        this.currentCourseId = null;
        this.init();
    }

    async init() {
        await this.checkAdminAuth();
        this.setupEventListeners();
        await this.loadDashboardData();
        this.setActiveNav('dashboard');
    }

    async checkAdminAuth() {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
            this.currentUser = session.user;
            
            // Simple admin check - only specific emails
            const adminEmails = ['graphicyin@gmail.com'];
            if (!adminEmails.includes(this.currentUser.email.toLowerCase())) {
                this.redirectToLogin('Admin access required');
                return;
            }
            
            document.getElementById('adminEmail').textContent = this.currentUser.email;
            
        } else {
            this.redirectToLogin('Please login to access admin panel');
        }
    }

    redirectToLogin(message = '') {
        if (message) {
            localStorage.setItem('adminLoginMessage', message);
        }
        window.location.href = 'admin-login.html';
    }

    setupEventListeners() {
        document.getElementById('adminLogoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('courseForm').addEventListener('submit', (e) => this.handleCourseSubmit(e));
        document.getElementById('chapterForm').addEventListener('submit', (e) => this.handleChapterSubmit(e));
    }

    async loadDashboardData() {
        await this.loadCourses();
        await this.loadStudents();
        this.updateStats();
    }

    async loadCourses() {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            this.courses = data || [];
            this.renderCourses();
            
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showMessage('Error loading courses: ' + error.message, 'error');
        }
    }

    async loadStudents() {
        try {
            // Get all users from auth
            const { data: { users }, error } = await supabase.auth.admin.listUsers();
            if (error) throw error;

            // Get user profiles
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('*');

            if (profileError) throw profileError;

            // Combine data
            this.students = users.map(user => {
                const profile = profiles.find(p => p.id === user.id) || {};
                return {
                    id: user.id,
                    email: user.email,
                    created_at: user.created_at,
                    last_sign_in_at: user.last_sign_in_at,
                    subscription_tier: profile.subscription_tier || 'free',
                    profile_updated: profile.updated_at
                };
            });

            this.renderStudents();
            
        } catch (error) {
            console.error('Error loading students:', error);
            this.showMessage('Error loading students: ' + error.message, 'error');
        }
    }

    updateStats() {
        document.getElementById('totalStudents').textContent = this.students.length;
        document.getElementById('totalCourses').textContent = this.courses.length;
        document.getElementById('activeCourses').textContent = this.courses.filter(c => c.is_active).length;
    }

    renderCourses() {
        const container = document.getElementById('adminCoursesList');
        if (!container) return;

        if (this.courses.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <p>No courses found. Click "Add New Course" to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.courses.map(course => `
            <div class="course-item">
                <div class="course-header">
                    <div class="course-info">
                        <h3>${course.title}</h3>
                        <div class="course-meta">
                            <span class="course-tier ${course.required_tier}">${course.required_tier.toUpperCase()}</span>
                            <span class="course-price">₹${course.price}</span>
                            <span class="course-status ${course.is_active ? 'active' : 'inactive'}">
                                ${course.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="btn-small" onclick="adminPanel.editCourse('${course.id}')">Edit</button>
                        <button class="btn-small btn-secondary" onclick="adminPanel.toggleCourseStatus('${course.id}')">
                            ${course.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn-small btn-danger" onclick="adminPanel.deleteCourse('${course.id}')">Delete</button>
                        <button class="btn-small" onclick="adminPanel.manageChapters('${course.id}')">Chapters</button>
                    </div>
                </div>
                <div class="course-description">
                    <p>${course.description}</p>
                </div>
                <div class="course-dates">
                    <small>Created: ${new Date(course.created_at).toLocaleDateString()} | Updated: ${new Date(course.updated_at).toLocaleDateString()}</small>
                </div>
            </div>
        `).join('');
    }

    renderStudents() {
        const container = document.getElementById('studentsList');
        if (!container) return;

        if (this.students.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <p>No students found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.students.map(student => {
            const signInDate = student.last_sign_in_at ? new Date(student.last_sign_in_at).toLocaleDateString() : 'Never';
            
            return `
                <div class="student-item">
                    <div class="student-info">
                        <h3>${student.email}</h3>
                        <div class="student-meta">
                            <span class="tier-badge ${student.subscription_tier}">${student.subscription_tier.toUpperCase()}</span>
                            <span>Joined: ${new Date(student.created_at).toLocaleDateString()}</span>
                            <span>Last Login: ${signInDate}</span>
                        </div>
                    </div>
                    <div class="student-actions">
                        <select onchange="adminPanel.changeStudentTier('${student.id}', this.value)" class="tier-select">
                            <option value="free" ${student.subscription_tier === 'free' ? 'selected' : ''}>Free</option>
                            <option value="basic" ${student.subscription_tier === 'basic' ? 'selected' : ''}>Basic</option>
                            <option value="premium" ${student.subscription_tier === 'premium' ? 'selected' : ''}>Premium</option>
                        </select>
                        <button class="btn-small" onclick="adminPanel.viewStudentDetails('${student.id}')">Details</button>
                        <button class="btn-small btn-danger" onclick="adminPanel.deleteStudent('${student.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async handleCourseSubmit(e) {
        e.preventDefault();
        
        const courseId = document.getElementById('courseId').value;
        const courseData = {
            title: document.getElementById('courseTitle').value,
            description: document.getElementById('courseDescription').value,
            required_tier: document.getElementById('courseTier').value,
            price: parseInt(document.getElementById('coursePrice').value),
            is_active: document.getElementById('courseActive').checked,
            updated_at: new Date().toISOString()
        };

        try {
            if (courseId) {
                // Update existing course
                const { error } = await supabase
                    .from('courses')
                    .update(courseData)
                    .eq('id', courseId);

                if (error) throw error;
                this.showMessage('Course updated successfully!', 'success');
            } else {
                // Create new course
                const { error } = await supabase
                    .from('courses')
                    .insert([courseData]);

                if (error) throw error;
                this.showMessage('Course created successfully!', 'success');
            }

            await this.loadCourses();
            this.updateStats();
            closeCourseModal();
            
        } catch (error) {
            console.error('Error saving course:', error);
            this.showMessage('Error saving course: ' + error.message, 'error');
        }
    }

    editCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        document.getElementById('courseModalTitle').textContent = 'Edit Course';
        document.getElementById('courseId').value = course.id;
        document.getElementById('courseTitle').value = course.title;
        document.getElementById('courseDescription').value = course.description;
        document.getElementById('courseTier').value = course.required_tier;
        document.getElementById('coursePrice').value = course.price;
        document.getElementById('courseActive').checked = course.is_active;

        openCourseModal();
    }

    async toggleCourseStatus(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        try {
            const { error } = await supabase
                .from('courses')
                .update({ 
                    is_active: !course.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', courseId);

            if (error) throw error;

            await this.loadCourses();
            this.updateStats();
            this.showMessage(`Course ${!course.is_active ? 'activated' : 'deactivated'} successfully!`, 'success');
            
        } catch (error) {
            console.error('Error toggling course status:', error);
            this.showMessage('Error updating course: ' + error.message, 'error');
        }
    }

    async deleteCourse(courseId) {
        if (!confirm('Are you sure you want to delete this course? This will also delete all chapters and downloads.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

            if (error) throw error;

            await this.loadCourses();
            this.updateStats();
            this.showMessage('Course deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting course:', error);
            this.showMessage('Error deleting course: ' + error.message, 'error');
        }
    }

    async manageChapters(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        this.currentCourseId = courseId;
        document.getElementById('currentCourseTitle').textContent = course.title;
        
        await this.loadChapters(courseId);
        this.openChapterModal();
    }

    async loadChapters(courseId) {
        try {
            const { data, error } = await supabase
                .from('course_modules')
                .select('*')
                .eq('course_id', courseId)
                .order('module_order', { ascending: true });

            if (error) throw error;
            this.chapters = data || [];
            this.renderChapters();
            
        } catch (error) {
            console.error('Error loading chapters:', error);
            this.showMessage('Error loading chapters: ' + error.message, 'error');
        }
    }

    renderChapters() {
        const container = document.getElementById('chaptersList');
        if (!container) return;

        if (this.chapters.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <p>No chapters yet. Add your first chapter below.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.chapters.map(chapter => `
            <div class="chapter-item">
                <div class="chapter-header">
                    <div class="chapter-info">
                        <h4>${chapter.module_order}. ${chapter.title}</h4>
                        <div class="chapter-meta">
                            <span class="chapter-duration">${chapter.duration || 'No duration'}</span>
                            <span class="chapter-premium ${chapter.is_premium ? 'premium' : 'free'}">
                                ${chapter.is_premium ? '🔒 Premium' : '🔓 Free'}
                            </span>
                        </div>
                    </div>
                    <div class="chapter-actions">
                        <button class="btn-small" onclick="adminPanel.editChapter('${chapter.id}')">Edit</button>
                        <button class="btn-small btn-danger" onclick="adminPanel.deleteChapter('${chapter.id}')">Delete</button>
                    </div>
                </div>
                ${chapter.description ? `<p class="chapter-description">${chapter.description}</p>` : ''}
                ${chapter.video_url ? `<small class="chapter-video">Video: ${chapter.video_url}</small>` : ''}
            </div>
        `).join('');
    }

    openChapterModal() {
        document.getElementById('chapterModal').classList.add('active');
        this.resetChapterForm();
    }

    closeChapterModal() {
        document.getElementById('chapterModal').classList.remove('active');
    }

    resetChapterForm() {
        document.getElementById('chapterForm').reset();
        document.getElementById('chapterId').value = '';
        document.getElementById('chapterCourseId').value = this.currentCourseId;
        
        // Set next chapter order
        const nextOrder = this.chapters.length > 0 ? 
            Math.max(...this.chapters.map(c => c.module_order)) + 1 : 1;
        document.getElementById('chapterOrder').value = nextOrder;
    }

    async handleChapterSubmit(e) {
        e.preventDefault();
        
        const chapterId = document.getElementById('chapterId').value;
        const chapterData = {
            course_id: this.currentCourseId,
            title: document.getElementById('chapterTitle').value,
            description: document.getElementById('chapterDescription').value,
            module_order: parseInt(document.getElementById('chapterOrder').value),
            duration: document.getElementById('chapterDuration').value,
            video_url: document.getElementById('chapterVideoUrl').value,
            is_premium: document.getElementById('chapterIsPremium').checked,
            updated_at: new Date().toISOString()
        };

        try {
            if (chapterId) {
                // Update existing chapter
                const { error } = await supabase
                    .from('course_modules')
                    .update(chapterData)
                    .eq('id', chapterId);

                if (error) throw error;
                this.showMessage('Chapter updated successfully!', 'success');
            } else {
                // Create new chapter
                const { error } = await supabase
                    .from('course_modules')
                    .insert([chapterData]);

                if (error) throw error;
                this.showMessage('Chapter created successfully!', 'success');
            }

            await this.loadChapters(this.currentCourseId);
            this.resetChapterForm();
            
        } catch (error) {
            console.error('Error saving chapter:', error);
            this.showMessage('Error saving chapter: ' + error.message, 'error');
        }
    }

    editChapter(chapterId) {
        const chapter = this.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        document.getElementById('chapterId').value = chapter.id;
        document.getElementById('chapterTitle').value = chapter.title;
        document.getElementById('chapterDescription').value = chapter.description || '';
        document.getElementById('chapterOrder').value = chapter.module_order;
        document.getElementById('chapterDuration').value = chapter.duration || '';
        document.getElementById('chapterVideoUrl').value = chapter.video_url || '';
        document.getElementById('chapterIsPremium').checked = chapter.is_premium;
    }

    async deleteChapter(chapterId) {
        if (!confirm('Are you sure you want to delete this chapter?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('course_modules')
                .delete()
                .eq('id', chapterId);

            if (error) throw error;

            await this.loadChapters(this.currentCourseId);
            this.showMessage('Chapter deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting chapter:', error);
            this.showMessage('Error deleting chapter: ' + error.message, 'error');
        }
    }

    async changeStudentTier(studentId, newTier) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    subscription_tier: newTier,
                    updated_at: new Date().toISOString()
                })
                .eq('id', studentId);

            if (error) throw error;

            // Reload students to reflect changes
            await this.loadStudents();
            this.showMessage(`Student tier updated to ${newTier}`, 'success');
            
        } catch (error) {
            console.error('Error updating student tier:', error);
            this.showMessage('Error updating student tier: ' + error.message, 'error');
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase.auth.admin.deleteUser(studentId);
            if (error) throw error;

            await this.loadStudents();
            this.updateStats();
            this.showMessage('Student deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showMessage('Error deleting student: ' + error.message, 'error');
        }
    }

    viewStudentDetails(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const details = document.getElementById('studentDetails');
        details.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${student.email}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">User ID:</div>
                <div class="detail-value">${student.id}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Subscription Tier:</div>
                <div class="detail-value">
                    <span class="tier-badge ${student.subscription_tier}">${student.subscription_tier.toUpperCase()}</span>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Account Created:</div>
                <div class="detail-value">${new Date(student.created_at).toLocaleString()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Last Sign In:</div>
                <div class="detail-value">${student.last_sign_in_at ? new Date(student.last_sign_in_at).toLocaleString() : 'Never'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Profile Updated:</div>
                <div class="detail-value">${student.profile_updated ? new Date(student.profile_updated).toLocaleString() : 'Never'}</div>
            </div>
        `;

        document.getElementById('studentModal').classList.add('active');
    }

    searchStudents(query) {
        const filteredStudents = this.students.filter(student => 
            student.email.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredStudents(filteredStudents);
    }

    renderFilteredStudents(students) {
        const container = document.getElementById('studentsList');
        if (!container) return;

        if (students.length === 0) {
            container.innerHTML = `
                <div class="placeholder-message">
                    <p>No students found matching your search.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = students.map(student => {
            const signInDate = student.last_sign_in_at ? new Date(student.last_sign_in_at).toLocaleDateString() : 'Never';
            
            return `
                <div class="student-item">
                    <div class="student-info">
                        <h3>${student.email}</h3>
                        <div class="student-meta">
                            <span class="tier-badge ${student.subscription_tier}">${student.subscription_tier.toUpperCase()}</span>
                            <span>Joined: ${new Date(student.created_at).toLocaleDateString()}</span>
                            <span>Last Login: ${signInDate}</span>
                        </div>
                    </div>
                    <div class="student-actions">
                        <select onchange="adminPanel.changeStudentTier('${student.id}', this.value)" class="tier-select">
                            <option value="free" ${student.subscription_tier === 'free' ? 'selected' : ''}>Free</option>
                            <option value="basic" ${student.subscription_tier === 'basic' ? 'selected' : ''}>Basic</option>
                            <option value="premium" ${student.subscription_tier === 'premium' ? 'selected' : ''}>Premium</option>
                        </select>
                        <button class="btn-small" onclick="adminPanel.viewStudentDetails('${student.id}')">Details</button>
                        <button class="btn-small btn-danger" onclick="adminPanel.deleteStudent('${student.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setActiveNav(activeSection) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-links a[href="#${activeSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Logout failed: ' + error.message, 'error');
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('adminMessage');
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
        messageEl.style.display = 'block';
        
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Global functions
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    // Set active navigation
    window.adminPanel.setActiveNav(sectionId);
    
    // Update URL hash
    window.location.hash = sectionId;
}

function openCourseModal() {
    document.getElementById('courseModalTitle').textContent = 'Add New Course';
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('courseModal').classList.add('active');
}

function closeCourseModal() {
    document.getElementById('courseModal').classList.remove('active');
}

function closeChapterModal() {
    document.getElementById('chapterModal').classList.remove('active');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
}

function resetChapterForm() {
    if (window.adminPanel) {
        window.adminPanel.resetChapterForm();
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});
