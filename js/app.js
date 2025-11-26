// Main App Logic - Enhanced Version
const API_BASE_URL = 'https://web-production-3f4dc.up.railway.app';

// API Configuration
const API_CONFIG = {
    timeout: 60000, // 60 seconds timeout
    retries: 2
};

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('career:theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcon();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('career:theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('career:theme', 'dark');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    const iconSVG = isDark 
        ? '<svg class="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>'
        : '<svg class="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>';
    
    themeToggle.innerHTML = iconSVG;
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    const icon = icons[type] || icons.info;
    toast.innerHTML = `
        <span class="text-xl font-bold">${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading Overlay
function showLoading(message = 'Processing...') {
    // Remove existing overlay if any
    hideLoading();
    
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner mx-auto mb-4"></div>
            <p class="text-gray-700 dark:text-gray-200 font-medium">${message}</p>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">This may take a moment...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.remove();
}

// Enhanced API call with retry logic
async function fetchWithRetry(url, options, retries = API_CONFIG.retries) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
    } catch (error) {
        if (retries > 0 && error.name !== 'AbortError') {
            console.log(`Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

// API Calls
async function callPredictAPI(data) {
    try {
        showLoading('Analyzing your profile...');
        
        const response = await fetchWithRetry(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        hideLoading();
        
        if (!response.ok) {
            let errorMessage = 'Failed to get prediction';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `Server error: ${response.status}`;
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        localStorage.setItem('career:lastPredict', JSON.stringify(result));
        showToast('Prediction successful! 🎯', 'success');
        
        console.log('Prediction result:', result); // Debug log
        return result;
        
    } catch (error) {
        hideLoading();
        
        let userMessage = error.message;
        if (error.name === 'AbortError') {
            userMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
            userMessage = 'Cannot connect to server. Please check your internet connection.';
        }
        
        showToast(userMessage, 'error');
        throw error;
    }
}

async function callExplainAPI(data) {
    try {
        showLoading('Generating detailed analysis...');
        
        const response = await fetchWithRetry(`${API_BASE_URL}/explain`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        hideLoading();
        
        if (!response.ok) {
            let errorMessage = 'Failed to get explanation';
            try {
                const errorData = await response.json();
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch (e) {
                errorMessage = `Server error: ${response.status}`;
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        localStorage.setItem('career:lastExplain', JSON.stringify(result));
        showToast('Analysis complete! 📊', 'success');
        
        console.log('Explanation result:', result); // Debug log
        return result;
        
    } catch (error) {
        hideLoading();
        
        let userMessage = error.message;
        if (error.name === 'AbortError') {
            userMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
            userMessage = 'Cannot connect to server. Please check your internet connection.';
        }
        
        showToast(userMessage, 'error');
        throw error;
    }
}

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
        localStorage.removeItem('career:lastInput');
        localStorage.removeItem('career:lastPredict');
        localStorage.removeItem('career:lastExplain');
        showToast('All data cleared successfully ✨', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Debug mode helper
function enableDebugMode() {
    localStorage.setItem('career:debug', 'true');
    console.log('Debug mode enabled');
    showToast('Debug mode enabled - Check console for logs', 'info');
}

function disableDebugMode() {
    localStorage.removeItem('career:debug');
    console.log('Debug mode disabled');
    showToast('Debug mode disabled', 'info');
}

function isDebugMode() {
    return localStorage.getItem('career:debug') === 'true';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Clear data button
    const clearDataBtn = document.getElementById('clearData');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
    
    // Check API health on homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        checkAPIHealth().then(healthy => {
            if (!healthy && isDebugMode()) {
                console.warn('API health check failed');
            }
        });
    }
    
    // Debug mode keyboard shortcut (Ctrl+Shift+D)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            if (isDebugMode()) {
                disableDebugMode();
            } else {
                enableDebugMode();
            }
        }
    });
});

// Export functions for use in other scripts
window.CareerApp = {
    callPredictAPI,
    callExplainAPI,
    checkAPIHealth,
    showToast,
    showLoading,
    hideLoading,
    initTheme,
    toggleTheme,
    clearAllData,
    enableDebugMode,
    disableDebugMode,
    isDebugMode,
    API_BASE_URL
};

// Log version info
console.log('%cCareer AI Platform v2.0', 'color: #4f46e5; font-size: 16px; font-weight: bold;');
console.log('%cAPI Endpoint: ' + API_BASE_URL, 'color: #6b7280;');
console.log('%cPress Ctrl+Shift+D to toggle debug mode', 'color: #6b7280; font-style: italic;');