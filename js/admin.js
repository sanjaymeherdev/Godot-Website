// Admin Panel Main JavaScript
class AdminPanel {
    constructor() {
        this.currentStudentId = null;
        this.students = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.showNotification('Admin panel loaded successfully!', 'success');
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Student management buttons
        document.getElementById('refresh-students').addEventListener('click', () => {
            this.loadStudentsData();
        });

        document.getElementById('select-all-students').addEventListener('change', (e) => {
            this.toggleSelectAllStudents(e.target.checked);
        });

        document.getElementById('bulk-update').addEventListener('click', () => {
            this.bulkUpdateStudents();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportStudentsCSV();
        });

        // Tier modal events
        document.getElementById('cancel-tier-update').addEventListener('click', () => {
            this.hideTierModal();
        });

        document.getElementById('confirm-tier-update').addEventListener('click', () => {
            this.confirmTierUpdate();
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('hidden', content.id !== `${tabName}-tab`);
        });

        // Load data if switching to students tab
        if (tabName === 'students') {
            this.loadStudentsData();
        }
    }

    async loadDashboardData() {
        try {
            // Simulate API call - replace with your actual endpoint
            const response = await fetch('/api/admin/dashboard');
            const data = await response.json();

            if (data.success) {
                this.updateDashboardStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadStudentsData() {
        try {
            this.showStudentsLoading(true);
            
            // Replace with your actual API endpoint
            const response = await fetch('/api/admin/students');
            const data = await response.json();

            if (data.success) {
                this.students = data.students;
                this.displayStudents();
                this.updateStudentStats();
            } else {
                this.showError('Failed to load students data');
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.showError('Network error loading students');
        } finally {
            this.showStudentsLoading(false);
        }
    }

    displayStudents() {
        const tableBody = document.getElementById('students-table-body');
        
        if (this.students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                        No students found in profiles table.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.students.map(student => `
            <tr class="hover:bg-gray-50 transition" data-student-id="${student.id}">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="student-checkbox w-4 h-4" value="${student.id}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-blue-600 font-bold text-sm">${student.email?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div class="text-sm font-medium text-gray-900">${student.email}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="plan-badge ${student.subscription_type}">
                        ${this.formatPlanName(student.subscription_type)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDate(student.created_time)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDate(student.updated_time)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="adminPanel.updateTier('${student.id}')" 
                                class="text-blue-600 hover:text-blue-900 transition">
                            ✏️ Change Tier
                        </button>
                        <button onclick="adminPanel.removeStudent('${student.id}')" 
                                class="text-red-600 hover:text-red-900 transition">
                            🗑️ Remove
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async updateTier(studentId) {
        this.currentStudentId = studentId;
        const student = this.students.find(s => s.id === studentId);
        
        if (student) {
            document.getElementById('tier-select').value = student.subscription_type;
            this.showTierModal();
        }
    }

    async confirmTierUpdate() {
        if (!this.currentStudentId) return;

        const newTier = document.getElementById('tier-select').value;
        
        try {
            const response = await fetch('/api/admin/update-tier', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: this.currentStudentId,
                    tier: newTier
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Tier updated successfully!', 'success');
                this.hideTierModal();
                this.loadStudentsData(); // Refresh the list
            } else {
                this.showError(data.error || 'Failed to update tier');
            }
        } catch (error) {
            console.error('Error updating tier:', error);
            this.showError('Network error updating tier');
        }
    }

    async removeStudent(studentId) {
        if (!confirm('Are you sure you want to remove this student? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('/api/admin/remove-student', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Student removed successfully!', 'success');
                this.loadStudentsData(); // Refresh the list
            } else {
                this.showError(data.error || 'Failed to remove student');
            }
        } catch (error) {
            console.error('Error removing student:', error);
            this.showError('Network error removing student');
        }
    }

    toggleSelectAllStudents(checked) {
        document.querySelectorAll('.student-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    bulkUpdateStudents() {
        const selectedIds = this.getSelectedStudentIds();
        if (selectedIds.length === 0) {
            this.showError('Please select at least one student');
            return;
        }

        // Implement bulk update logic here
        this.showNotification(`Bulk update for ${selectedIds.length} students`, 'info');
    }

    exportStudentsCSV() {
        if (this.students.length === 0) {
            this.showError('No students data to export');
            return;
        }

        // Simple CSV export
        const headers = ['Email', 'Subscription', 'Signup Date', 'Last Updated'];
        const csvData = this.students.map(student => [
            student.email,
            student.subscription_type,
            this.formatDate(student.created_time),
            this.formatDate(student.updated_time)
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('CSV exported successfully!', 'success');
    }

    // Utility Methods
    showStudentsLoading(show) {
        const loadingElement = document.getElementById('students-loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'table-row' : 'none';
        }
    }

    showTierModal() {
        document.getElementById('tier-modal').classList.remove('hidden');
    }

    hideTierModal() {
        document.getElementById('tier-modal').classList.add('hidden');
        this.currentStudentId = null;
    }

    getSelectedStudentIds() {
        const checkboxes = document.querySelectorAll('.student-checkbox:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    updateDashboardStats(stats) {
        // Update dashboard statistics
        this.updateElementText('total-users', stats?.totalUsers || 0);
        this.updateElementText('active-users', stats?.activeToday || 0);
        this.updateElementText('premium-count', stats?.premiumUsers || 0);
        this.updateElementText('revenue', stats?.revenue || 0);
    }

    updateStudentStats() {
        const stats = {
            total: this.students.length,
            premium: this.students.filter(s => s.subscription_type === 'premium').length,
            basic: this.students.filter(s => s.subscription_type === 'basic').length,
            free: this.students.filter(s => s.subscription_type === 'free').length
        };

        this.updateElementText('total-students', stats.total);
        this.updateElementText('premium-students', stats.premium);
        this.updateElementText('basic-students', stats.basic);
        this.updateElementText('free-students', stats.free);
    }

    updateElementText(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    formatPlanName(plan) {
        const planNames = {
            'premium': 'Premium',
            'basic': 'Basic', 
            'free': 'Free'
        };
        return planNames[plan] || plan || 'Unknown';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 text-white ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});
