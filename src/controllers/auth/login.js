import { NavigationService } from '../../services/navigation/navigation.js';

export class Auth {
    constructor() {
        this.form = document.getElementById('login-form');
        this.navigation = new NavigationService();
        this.init();
    }

    init() {
        // Add event listener to the login form
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        try {
            // Get users from sessionStorage (loaded by index.html)
            const appData = JSON.parse(sessionStorage.getItem('appData') || '{"users":[],"pendingUsers":[]}');
            console.log('Login attempt with:', { username, appData }); // Debug log
            
            // Check if user exists
            const user = appData.users.find(
                (user) => user.username === username && user.password === password
            );

            if (user) {
                console.log('User found:', user); // Debug log
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userRole', user.role);
                sessionStorage.setItem('username', user.username);

                // Redirect based on role with strict role-based access
                switch (user.role) {
                    case 'Genesis Admin':
                        // Genesis Admin can only create other admins
                        this.navigation.navigateTo('/genesisAdmin');
                        break;
                    case 'Platform Admin':
                        // Platform Admin can only create teams
                        this.navigation.navigateTo('/adminDashboard');
                        break;
                    case 'User Admin':
                        // User Admin can only create users
                        this.navigation.navigateTo('/adminDashboard');
                        break;
                    default:
                        this.showError('Invalid user role');
                        sessionStorage.clear();
                }
            } else {
                console.log('User not found'); // Debug log
                this.showError('Invalid username or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
            this.showError('An error occurred. Please try again later.');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        this.form.insertBefore(errorDiv, this.form.firstChild);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }
}