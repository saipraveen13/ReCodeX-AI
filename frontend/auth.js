// Authentication Logic for ReCodeX AI

// DOM Elements
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Tab Switching
if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('bg-gradient-to-r', 'from-primary', 'to-secondary', 'text-white');
        loginTab.classList.remove('text-gray-400');
        signupTab.classList.remove('bg-gradient-to-r', 'from-primary', 'to-secondary', 'text-white');
        signupTab.classList.add('text-gray-400');

        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('bg-gradient-to-r', 'from-primary', 'to-secondary', 'text-white');
        signupTab.classList.remove('text-gray-400');
        loginTab.classList.remove('bg-gradient-to-r', 'from-primary', 'to-secondary', 'text-white');
        loginTab.classList.add('text-gray-400');

        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// Check for pending email from Hero section
function prefillPendingEmail() {
    console.log('Checking for pending email...');
    const pendingEmail = localStorage.getItem('pending_email');
    console.log('Pending email found:', pendingEmail);

    if (pendingEmail) {
        const loginEmail = document.getElementById('loginEmail');
        const signupEmail = document.getElementById('signupEmail');

        console.log('Found inputs:', { loginEmail: !!loginEmail, signupEmail: !!signupEmail });

        if (loginEmail) loginEmail.value = pendingEmail;
        if (signupEmail) signupEmail.value = pendingEmail;

        // Clear it so it doesn't persist forever
        localStorage.removeItem('pending_email');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prefillPendingEmail);
} else {
    prefillPendingEmail();
}

// Login Form Submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simple validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            // Call backend API
            const response = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            // Store JWT token and user data
            localStorage.setItem('recodex_token', data.access_token);
            localStorage.setItem('recodex_user', JSON.stringify(data.user));
            localStorage.setItem('recodex_authenticated', 'true');

            showNotification('Login successful!', 'success');

            // Show welcome overlay
            showWelcomeOverlay(data.user.name);

        } catch (error) {
            console.error('Login error:', error);
            showNotification(error.message || 'Login failed', 'error');
        }
    });
}

// Signup Form Submission
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            // Call backend API
            const response = await fetch('http://localhost:8000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Registration failed');
            }

            // Store JWT token and user data
            localStorage.setItem('recodex_token', data.access_token);
            localStorage.setItem('recodex_user', JSON.stringify(data.user));
            localStorage.setItem('recodex_authenticated', 'true');

            showNotification('Account created successfully!', 'success');

            // Show welcome overlay
            showWelcomeOverlay(data.user.name);

        } catch (error) {
            console.error('Signup error:', error);
            showNotification(error.message || 'Registration failed', 'error');
        }
    });
}

// Show Welcome Overlay
function showWelcomeOverlay(name) {
    const overlay = document.getElementById('welcomeOverlay');
    const nameData = document.getElementById('welcomeName');

    if (overlay && nameData) {
        nameData.textContent = name;
        overlay.classList.remove('pointer-events-none', 'opacity-0');

        // Redirect after animation
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        // Fallback if overlay not found
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-0';

    if (type === 'success') {
        notification.classList.add('bg-green-600', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-600', 'text-white');
    } else {
        notification.classList.add('bg-blue-600', 'text-white');
    }

    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            ${type === 'success' ? `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ` : type === 'error' ? `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ` : `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `}
            <span class="font-semibold">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
