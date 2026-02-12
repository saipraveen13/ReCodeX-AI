// ReCodeX AI - Frontend Application Logic

// Configuration
const API_BASE_URL = 'http://localhost:8000';

// Ensure body starts hidden for fade-in effect
document.body.classList.add('opacity-0');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadUserProfile();
    initializeApp();

    // Fade in body and hide loader
    document.body.classList.remove('opacity-0');
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
});

// Check if user is authenticated
function checkAuthentication() {
    const isAuthenticated = localStorage.getItem('recodex_authenticated');

    if (!isAuthenticated || isAuthenticated !== 'true') {
        // In Guest Mode: Add class to body instead of redirecting
        document.body.classList.add('is-guest');
        return false;
    }

    document.body.classList.remove('is-guest');
    return true;
}

// Load user profile
function loadUserProfile() {
    const userStr = localStorage.getItem('recodex_user');

    if (userStr) {
        try {
            const user = JSON.parse(userStr);

            // Update UI with user info
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');

            if (userName) userName.textContent = user.name || 'User';
            if (userEmail) userEmail.textContent = user.email || '';
            if (userAvatar) {
                const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
                userAvatar.textContent = initial;
            }
        } catch (e) {
            console.error('Error loading user profile:', e);
        }
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Clear session
        localStorage.removeItem('recodex_user');
        localStorage.removeItem('recodex_authenticated');

        // Redirect to home page
        window.location.href = 'home.html';
    });
}

// Initialize app
function initializeApp() {
    hljs.configure({
        languages: ['python', 'javascript', 'typescript', 'xml', 'css', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'objectivec', 'scala', 'dart', 'lua', 'r', 'perl', 'haskell', 'json', 'yaml', 'markdown', 'shell', 'sql']
    });
}

// DOM Elements
const codeInput = document.getElementById('codeInput');
const languageSelect = document.getElementById('languageSelect');
const analyzeBtn = document.getElementById('analyzeBtn');
const rewriteBtn = document.getElementById('rewriteBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingMessage = document.getElementById('loadingMessage');

// Tab elements
const analysisTab = document.getElementById('analysisTab');
const comparisonTab = document.getElementById('comparisonTab');
const analysisContent = document.getElementById('analysisContent');
const comparisonContent = document.getElementById('comparisonContent');

// Dashboard Elements
const dashboardModal = document.getElementById('dashboardModal');
const dashboardOpenBtn = document.getElementById('dashboardOpenBtn');
const dashboardCloseBtn = document.getElementById('dashboardCloseBtn');
const updateProfileForm = document.getElementById('updateProfileForm');

// Code Execution Elements
const runCodeBtn = document.getElementById('runCodeBtn');
const consoleSection = document.getElementById('consoleSection');
const consoleOutput = document.getElementById('consoleOutput');
const executionTime = document.getElementById('executionTime');

// Run Code Functionality
async function runCode() {
    const code = codeInput.value.trim();
    const language = languageSelect.value;

    if (!code) {
        showToast('Please enter some code to run', 'error');
        return;
    }

    // Show loading state
    runCodeBtn.disabled = true;
    runCodeBtn.innerHTML = `
        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Running...</span>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/api/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, language })
        });

        const data = await response.json();

        if (data.success || data.output || data.error) {
            // Show console
            consoleSection.classList.remove('hidden');
            consoleSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            // Set output
            const output = data.output || '';
            const error = data.error || '';

            consoleOutput.textContent = output + (error ? `\n\nERROR:\n${error}` : '');

            // Set style based on error
            if (error && !output) {
                consoleOutput.classList.add('text-red-400');
                consoleOutput.classList.remove('text-slate-300');
            } else {
                consoleOutput.classList.remove('text-red-400');
                consoleOutput.classList.add('text-slate-300');
            }

            executionTime.textContent = `Executed in ${data.execution_time}s`;

            if (!data.success && data.error) {
                showToast('Execution failed', 'error');
            } else {
                showToast('Code executed successfully', 'success');
            }
        } else {
            showToast(data.detail || 'Failed to execute code', 'error');
        }
    } catch (err) {
        console.error('Run Error:', err);
        showToast('Network error or server is offline', 'error');
    } finally {
        runCodeBtn.disabled = false;
        runCodeBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
            </svg>
            <span>Run Code</span>
        `;
    }
}

// Event Listeners
if (runCodeBtn) {
    runCodeBtn.addEventListener('click', runCode);
}
const editUserName = document.getElementById('editUserName');
const displayUserEmail = document.getElementById('displayUserEmail');
const historyEntries = document.getElementById('historyEntries');
const historyCount = document.getElementById('historyCount');
const historyLoader = document.getElementById('historyLoader');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const joinDate = document.getElementById('joinDate');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// Chat elements
const chatWidget = document.getElementById('chatWidget');
const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatWindow = document.getElementById('chatWindow');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const applyUpdatedCode = document.getElementById('applyUpdatedCode');
const applyCodeBtn = document.getElementById('applyCodeBtn');

let chatHistory = [];
let lastSuggestedCode = null;


// Results elements
const summaryCards = document.getElementById('summaryCards');
const issuesList = document.getElementById('issuesList');
const originalCode = document.getElementById('originalCode');
const rewrittenCode = document.getElementById('rewrittenCode');
const improvementsSection = document.getElementById('improvementsSection');
const copyCodeBtn = document.getElementById('copyCodeBtn');

// State
let currentAnalysis = null;
let currentRewrite = null;
let userHistory = [];

// Toast Notification System
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ?
        '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
        type === 'error' ?
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>' :
            '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${icon}</div>
            <div class="toast-text">
                <h5>${title}</h5>
                <p>${message}</p>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Event Listeners
analyzeBtn.addEventListener('click', handleAnalyze);
rewriteBtn.addEventListener('click', handleRewrite);
analysisTab.addEventListener('click', () => switchTab('analysis'));
comparisonTab.addEventListener('click', () => switchTab('comparison'));
copyCodeBtn.addEventListener('click', handleCopyCode);

// Dashboard Interaction
if (dashboardOpenBtn) dashboardOpenBtn.addEventListener('click', openDashboard);
if (dashboardCloseBtn) dashboardCloseBtn.addEventListener('click', closeDashboard);
if (refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', loadUserHistory);
if (updateProfileForm) updateProfileForm.addEventListener('submit', handleUpdateProfile);
if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', handleClearHistory);
if (deleteAccountBtn) deleteAccountBtn.addEventListener('click', handleDeleteAccount);

// Chat listeners
if (chatToggleBtn) chatToggleBtn.addEventListener('click', toggleChat);
if (closeChatBtn) closeChatBtn.addEventListener('click', toggleChat);
if (chatForm) chatForm.addEventListener('submit', handleChatSubmit);
if (applyCodeBtn) applyCodeBtn.addEventListener('click', applySuggestedCode);


// Close modal on outside click
if (dashboardModal) {
    dashboardModal.addEventListener('click', (e) => {
        if (e.target === dashboardModal) closeDashboard();
    });
}

function openDashboard(e) {
    if (e) e.preventDefault();
    const userStr = localStorage.getItem('recodex_user');
    if (userStr) {
        const user = JSON.parse(userStr);
        editUserName.value = user.name || '';
        displayUserEmail.value = user.email || '';
        joinDate.textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent';
    }

    dashboardModal.classList.remove('hidden');
    loadUserHistory();
}

function closeDashboard() {
    dashboardModal.classList.add('hidden');
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    const name = editUserName.value.trim();
    if (!name) return;

    const token = localStorage.getItem('recodex_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            const updatedUser = await response.json();
            // Update local storage
            const currentSession = JSON.parse(localStorage.getItem('recodex_user'));
            currentSession.name = updatedUser.name;
            localStorage.setItem('recodex_user', JSON.stringify(currentSession));

            // Refresh UI
            loadUserProfile();
            showToast('Success', 'Profile updated successfully!', 'success');
        } else {
            showToast('Error', 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showToast('Error', 'An error occurred while updating profile', 'error');
    }
}

async function handleClearHistory() {
    if (!confirm('Are you sure you want to clear your entire search history? This cannot be undone.')) {
        return;
    }

    const token = localStorage.getItem('recodex_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Success', 'History cleared successfully!', 'success');
            loadUserHistory();
        } else {
            showToast('Error', 'Failed to clear history', 'error');
        }
    } catch (error) {
        console.error('Clear history error:', error);
        showToast('Error', 'An error occurred while clearing history', 'error');
    }
}

async function handleDeleteAccount() {
    const confirmation = confirm('DANGER: This will permanently delete your account and all your data. Are you sure you want to proceed?');
    if (!confirmation) return;

    // Double confirmation for account deletion
    const secondConfirmation = prompt('Type "DELETE" to confirm permanent account removal:');
    if (secondConfirmation !== 'DELETE') {
        alert('Deletion cancelled.');
        return;
    }

    const token = localStorage.getItem('recodex_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/account`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Success', 'Your account has been deleted.', 'success');
            // Clear session and logout
            localStorage.removeItem('recodex_user');
            localStorage.removeItem('recodex_authenticated');
            localStorage.removeItem('recodex_token');
            setTimeout(() => window.location.href = 'home.html', 2000);
        } else {
            showToast('Error', 'Failed to delete account', 'error');
        }
    } catch (error) {
        console.error('Delete account error:', error);
        showToast('Error', 'An error occurred while deleting your account', 'error');
    }
}


async function loadUserHistory() {
    const token = localStorage.getItem('recodex_token');
    if (!token) return;

    historyLoader.classList.remove('hidden');
    historyEntries.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            userHistory = data.history;
            renderHistory(data.history);
            historyCount.textContent = data.count;
        }
    } catch (error) {
        console.error('Fetch history error:', error);
    } finally {
        historyLoader.classList.add('hidden');
    }
}

function renderHistory(history) {
    if (!history || history.length === 0) {
        historyEntries.innerHTML = `
            <div class="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
                <p class="text-slate-400">No recent activity found. Start analyzing code!</p>
            </div>`;
        return;
    }

    historyEntries.innerHTML = history.map((entry, index) => `
        <div class="history-item p-5 rounded-2xl flex items-center justify-between animate-enter" style="animation-delay: ${index * 0.05}s">
            <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center ${entry.type === 'analyze' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${entry.type === 'analyze' ?
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>' :
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>'}
                    </svg>
                </div>
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="history-type-badge ${entry.type === 'analyze' ? 'type-analyze' : 'type-rewrite'}">${entry.type}</span>
                        <span class="text-xs font-mono text-slate-400 uppercase">${entry.language}</span>
                    </div>
                    <p class="text-sm font-bold text-slate-800 mt-1 truncate max-w-[200px]">${entry.original_code.split('\n')[0].substring(0, 40) || 'Unnamed entry'}</p>
                </div>
            </div>
            <div class="text-right flex items-center space-x-4">
                <div class="hidden sm:block">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${new Date(entry.timestamp).toLocaleDateString()}</p>
                    <p class="text-[10px] text-slate-400 font-medium">${new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onclick="restoreHistoryEntry('${entry._id}')" class="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors group">
                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

window.restoreHistoryEntry = function (id) {
    const entry = userHistory.find(e => e._id === id);
    if (!entry) return;

    // Set code and language
    codeInput.value = entry.original_code;
    languageSelect.value = entry.language;

    // Close dashboard and scroll to editor
    closeDashboard();
    document.getElementById('editorSection').scrollIntoView({ behavior: 'smooth' });

    // Display results
    if (entry.type === 'analyze') {
        currentAnalysis = entry.result;
        displayAnalysisResults(entry.result);
        resultsSection.classList.remove('hidden');
        switchTab('analysis');
    } else {
        currentRewrite = entry.result;
        displayRewriteResults(entry.result, entry.language);
        resultsSection.classList.remove('hidden');
        switchTab('comparison');
    }
};

// Tab switching
function switchTab(tab) {
    if (tab === 'analysis') {
        analysisTab.classList.add('active');
        comparisonTab.classList.remove('active');
        analysisContent.classList.remove('hidden');
        comparisonContent.classList.add('hidden');
    } else {
        comparisonTab.classList.add('active');
        analysisTab.classList.remove('active');
        comparisonContent.classList.remove('hidden');
        analysisContent.classList.add('hidden');
    }
}

// Show/hide loading overlay
function showLoading(message = 'Processing...') {
    loadingMessage.textContent = message;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Handle code analysis
async function handleAnalyze() {
    // Auth Check for Guests
    if (document.body.classList.contains('is-guest')) {
        window.location.href = 'login.html';
        return;
    }

    const code = codeInput.value.trim();
    const language = languageSelect.value;

    if (!code) {
        showToast('Input Required', 'Please enter some code to analyze', 'info');
        return;
    }

    showLoading('Analyzing your code with AI...');

    const token = localStorage.getItem('recodex_token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Analysis failed');
        }

        const data = await response.json();
        currentAnalysis = data;

        displayAnalysisResults(data);
        resultsSection.classList.remove('hidden');
        switchTab('analysis');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Analysis error:', error);
        showToast('Analysis Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Handle code rewrite
async function handleRewrite() {
    // Auth Check for Guests
    if (document.body.classList.contains('is-guest')) {
        window.location.href = 'login.html';
        return;
    }

    const code = codeInput.value.trim();
    const language = languageSelect.value;

    if (!code) {
        showToast('Input Required', 'Please enter some code to rewrite', 'info');
        return;
    }

    showLoading('Rewriting and optimizing your code...');

    const token = localStorage.getItem('recodex_token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/rewrite`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Rewrite failed');
        }

        const data = await response.json();
        currentRewrite = data;

        displayRewriteResults(data, language);
        resultsSection.classList.remove('hidden');
        switchTab('comparison');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        console.error('Rewrite error:', error);
        showToast('Rewrite Error', error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Display analysis results
function displayAnalysisResults(data) {
    // Display summary cards
    summaryCards.innerHTML = `
        <div class="summary-card glass-card p-4 text-center border-slate-200">
            <div class="text-3xl font-bold text-slate-800">${data.total_issues}</div>
            <div class="text-sm text-slate-500 mt-1">Total Issues</div>
        </div>
        <div class="summary-card glass-card p-4 text-center border-red-100 bg-red-50/30">
            <div class="text-3xl font-bold text-red-600">${data.critical_count}</div>
            <div class="text-sm text-red-500/70 mt-1 uppercase text-[10px] font-bold tracking-wider">Critical</div>
        </div>
        <div class="summary-card glass-card p-4 text-center border-orange-100 bg-orange-50/30">
            <div class="text-3xl font-bold text-orange-600">${data.high_count}</div>
            <div class="text-sm text-orange-500/70 mt-1 uppercase text-[10px] font-bold tracking-wider">High</div>
        </div>
        <div class="summary-card glass-card p-4 text-center border-yellow-100 bg-yellow-50/30">
            <div class="text-3xl font-bold text-yellow-600">${data.medium_count}</div>
            <div class="text-sm text-yellow-600/70 mt-1 uppercase text-[10px] font-bold tracking-wider">Medium</div>
        </div>
        <div class="summary-card glass-card p-4 text-center border-blue-100 bg-blue-50/30">
            <div class="text-3xl font-bold text-blue-600">${data.low_count}</div>
            <div class="text-sm text-blue-500/70 mt-1 uppercase text-[10px] font-bold tracking-wider">Low</div>
        </div>
    `;

    // Display summary
    const summaryHtml = `
        <div class="glass-card p-6 mb-6 border-slate-200 bg-white/80">
            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center">
                <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Analysis Summary
            </h3>
            <div class="text-slate-600 markdown-content">${marked.parse(data.summary)}</div>
            ${data.complexity ? `
            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-6">
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time Complexity</span>
                    <span class="complexity-badge">${data.complexity.time}</span>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Space Complexity</span>
                    <span class="complexity-badge">${data.complexity.space}</span>
                </div>
            </div>` : ''}
        </div>
    `;

    // Display issues
    let issuesHtml = summaryHtml;

    if (data.issues.length === 0) {
        issuesHtml += `
            <div class="glass-card p-10 text-center border-green-100 bg-green-50/20">
                <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-2xl font-black font-heading text-green-700 mb-2">Clean Code!</h3>
                <p class="text-slate-600">No issues were detected by our AI analysis.</p>
            </div>
        `;
    } else {
        data.issues.forEach((issue, index) => {
            const severityClass = `severity-${issue.severity.toLowerCase()}`;
            issuesHtml += `
                <div class="issue-card" style="animation-delay: ${index * 0.05}s">
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center space-x-3">
                            <span class="severity-badge ${severityClass}">${issue.severity}</span>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">${issue.category}</span>
                        </div>
                        ${issue.line ? `<span class="text-xs font-mono text-slate-400">Line ${issue.line}</span>` : ''}
                    </div>
                    <h4 class="text-slate-800 font-bold text-lg mb-2">${escapeHtml(issue.description)}</h4>
                    <div class="bg-slate-50/80 rounded-xl p-4 mt-4 border border-slate-100">
                        <p class="text-xs text-primary font-bold uppercase tracking-wider mb-2 flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.828 5.485a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM13.464 7.607a1 1 0 011.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM5 11a1 1 0 100-2H4a1 1 0 100 2h1zM11 11a1 1 0 100-2v-1a1 1 0 10-2 0v1a1 1 0 100 2h1zM11 15a1 1 0 10-2 0v1a1 1 0 102 0v-1zM4.707 14.293a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM16.293 14.293a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414l.707.707z"></path>
                            </svg>
                            AI Suggestion
                        </p>
                        <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(issue.suggestion)}</p>
                    </div>
                </div>
            `;
        });
    }

    issuesList.innerHTML = issuesHtml;

    // Also populate comparison tab with original code placeholder
    const currentCode = codeInput.value;
    const language = languageSelect.value;

    if (originalCode) {
        originalCode.textContent = currentCode;
        originalCode.className = `language-${language}`;
        hljs.highlightElement(originalCode);
    }

    if (rewrittenCode) {
        rewrittenCode.textContent = "// Click 'Auto Fix & Rewrite' to see optimized code here...";
        rewrittenCode.className = "language-javascript"; // Default for placeholder
        hljs.highlightElement(rewrittenCode);
    }

    if (improvementsSection) {
        improvementsSection.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
                <h3 class="text-slate-800 font-bold mb-2">No Optimizations Yet</h3>
                <p class="text-slate-500 text-sm">Use the 'Auto Fix & Rewrite' button to generate an optimized version of your code.</p>
            </div>
        `;
    }
}

// Display rewrite results
function displayRewriteResults(data, language) {
    // Display complexity comparison
    let complexityImpact = '';
    if (data.original_complexity && data.rewritten_complexity) {
        complexityImpact = `
            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="complexity-card bg-slate-50 border-slate-100">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Baseline Performance</div>
                    <div class="flex items-center space-x-4">
                        <div>
                            <p class="text-[9px] text-slate-400 font-bold uppercase mb-1">Time</p>
                            <span class="text-xs font-mono font-bold text-slate-600">${data.original_complexity.time}</span>
                        </div>
                        <div>
                            <p class="text-[9px] text-slate-400 font-bold uppercase mb-1">Space</p>
                            <span class="text-xs font-mono font-bold text-slate-600">${data.original_complexity.space}</span>
                        </div>
                    </div>
                </div>
                <div class="complexity-card bg-primary/5 border-primary/10">
                    <div class="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3">Optimized Performance</div>
                    <div class="flex items-center space-x-4">
                        <div>
                            <p class="text-[9px] text-primary/40 font-bold uppercase mb-1">Time</p>
                            <span class="text-xs font-mono font-bold text-primary">${data.rewritten_complexity.time}</span>
                        </div>
                        <div>
                            <p class="text-[9px] text-primary/40 font-bold uppercase mb-1">Space</p>
                            <span class="text-xs font-mono font-bold text-primary">${data.rewritten_complexity.space}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Display original code
    originalCode.textContent = data.original_code;
    originalCode.className = `language-${language}`;
    hljs.highlightElement(originalCode);

    // Display rewritten code
    rewrittenCode.textContent = data.rewritten_code;
    rewrittenCode.className = `language-${language}`;
    hljs.highlightElement(rewrittenCode);

    // Display improvements
    let improvementsHtml = `
        <h3 class="text-xl font-black font-heading text-slate-800 mb-6 flex items-center">
            <div class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            Improvements Made
        </h3>
        <div class="markdown-content text-slate-600 mb-8 bg-white/40 p-6 rounded-2xl border border-white/60">
            ${marked.parse(data.explanation)}
        </div>
        <div class="grid md:grid-cols-2 gap-4">
    `;

    data.improvements.forEach(improvement => {
        improvementsHtml += `
            <div class="flex items-start space-x-3 p-4 bg-white/60 rounded-xl border border-white/80 shadow-sm">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-sm font-medium text-slate-700">${escapeHtml(improvement)}</span>
            </div>
        `;
    });

    improvementsHtml += '</div>';
    improvementsSection.innerHTML = complexityImpact + improvementsHtml;
}

// Interactive Chat Logic
function toggleChat() {
    if (!chatWindow) return;
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        chatInput.focus();
    }
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    // Add user message to UI
    appendChatMessage('user', query);
    chatInput.value = '';

    // Show typing
    typingIndicator.classList.remove('hidden');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const token = localStorage.getItem('recodex_token');
    const code = codeInput.value;
    const language = document.getElementById('languageSelect').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({
                messages: [...chatHistory, { role: 'user', content: query }],
                code: code,
                language: language
            })
        });

        const data = await response.json();
        typingIndicator.classList.add('hidden');

        if (data.success) {
            appendChatMessage('assistant', data.reply);
            chatHistory.push({ role: 'user', content: query });
            chatHistory.push({ role: 'assistant', content: data.reply });

            if (data.new_code) {
                lastSuggestedCode = data.new_code;
                applyUpdatedCode.classList.remove('hidden');
            } else {
                applyUpdatedCode.classList.add('hidden');
            }
        } else {
            appendChatMessage('assistant', 'Sorry, I encountered an error processing your request.');
        }

    } catch (error) {
        console.error('Chat error:', error);
        typingIndicator.classList.add('hidden');
        appendChatMessage('assistant', 'An error occurred. Please try again later.');
    }
}

function appendChatMessage(role, content) {
    const bubble = document.createElement('div');
    bubble.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;

    const inner = document.createElement('div');
    inner.className = `${role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} px-4 py-3 text-sm markdown-content`;
    inner.innerHTML = marked.parse(content);

    bubble.appendChild(inner);
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function applySuggestedCode() {
    if (lastSuggestedCode) {
        codeInput.value = lastSuggestedCode;
        applyUpdatedCode.classList.add('hidden');
        showToast('Success', 'AI suggestion applied to the editor!', 'success');
    }
}

// Copy code to clipboard
async function handleCopyCode() {
    if (!currentRewrite) return;

    try {
        await navigator.clipboard.writeText(currentRewrite.rewritten_code);

        // Visual feedback
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = '✓ Copied!';
        copyCodeBtn.classList.add('copy-success');

        setTimeout(() => {
            copyCodeBtn.textContent = originalText;
            copyCodeBtn.classList.remove('copy-success');
        }, 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Copy Error', 'Failed to copy code to clipboard', 'error');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
