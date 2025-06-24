// Global state management
const AppState = {
  user: null,
  token: localStorage.getItem('token'),
  currentSection: 'hero',
  scanHistory: [],
  isLoading: false
};

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Utility Functions
const showLoading = (show = true) => {
  const overlay = document.getElementById('loadingOverlay');
  if (show) {
    overlay.classList.remove('hidden');
    AppState.isLoading = true;
  } else {
    overlay.classList.add('hidden');
    AppState.isLoading = false;
  }
};

const showToast = (message, type = 'info', title = '') => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="toast-icon ${icons[type]}"></i>
    <div class="toast-content">
      ${title ? `<div class="toast-title">${title}</div>` : ''}
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
};

// API Functions
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(AppState.token && { Authorization: `Bearer ${AppState.token}` })
    },
    ...options
  };
  
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication Functions
const login = async (email, password) => {
  try {
    showLoading(true);
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    AppState.token = response.token;
    AppState.user = response.user;
    localStorage.setItem('token', response.token);
    
    showToast('Login successful!', 'success', 'Welcome back');
    closeAuthModal();
    updateUIForLoggedInUser();
    showSection('scanner');
    
  } catch (error) {
    showToast(error.message, 'error', 'Login Failed');
  } finally {
    showLoading(false);
  }
};

const register = async (name, email, password, role) => {
  try {
    showLoading(true);
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: { name, email, password, role }
    });
    
    AppState.token = response.token;
    AppState.user = response.user;
    localStorage.setItem('token', response.token);
    
    showToast('Account created successfully!', 'success', 'Welcome');
    closeAuthModal();
    updateUIForLoggedInUser();
    showSection('scanner');
    
  } catch (error) {
    showToast(error.message, 'error', 'Registration Failed');
  } finally {
    showLoading(false);
  }
};

const logout = () => {
  AppState.token = null;
  AppState.user = null;
  localStorage.removeItem('token');
  
  updateUIForLoggedOutUser();
  showSection('hero');
  showToast('Logged out successfully', 'info');
};

const getCurrentUser = async () => {
  if (!AppState.token) return null;
  
  try {
    const response = await apiCall('/auth/me');
    AppState.user = response.user;
    return response.user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    logout();
    return null;
  }
};

// UI Update Functions
const updateUIForLoggedInUser = () => {
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const developerMenu = document.getElementById('developerMenu');
  
  navAuth.classList.add('hidden');
  navUser.classList.remove('hidden');
  
  if (AppState.user) {
    userName.textContent = AppState.user.name;
    userAvatar.src = AppState.user.avatarUrl;
    
    if (AppState.user.role === 'Developer') {
      developerMenu.classList.remove('hidden');
    }
  }
};

const updateUIForLoggedOutUser = () => {
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const developerMenu = document.getElementById('developerMenu');
  
  navAuth.classList.remove('hidden');
  navUser.classList.add('hidden');
  developerMenu.classList.add('hidden');
};

// Section Management
const showSection = (sectionName) => {
  // Hide all sections
  const sections = ['heroSection', 'scannerSection', 'profileSection', 'historySection', 'analyticsSection'];
  sections.forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  
  // Show requested section
  const targetSection = document.getElementById(sectionName + 'Section');
  if (targetSection) {
    targetSection.classList.remove('hidden');
    AppState.currentSection = sectionName;
  }
  
  // Load section-specific data
  switch (sectionName) {
    case 'profile':
      loadProfile();
      break;
    case 'history':
      loadScanHistory();
      break;
    case 'analytics':
      if (AppState.user?.role === 'Developer') {
        loadAnalytics();
      }
      break;
  }
};

// Modal Functions
const showAuthModal = (mode = 'login') => {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authModalTitle');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const switchText = document.getElementById('authSwitchText');
  const switchLink = document.getElementById('authSwitchLink');
  
  if (mode === 'login') {
    title.textContent = 'Login';
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    switchText.innerHTML = 'Don\'t have an account? ';
    switchLink.textContent = 'Sign up';
  } else {
    title.textContent = 'Create Account';
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    switchText.innerHTML = 'Already have an account? ';
    switchLink.textContent = 'Login';
  }
  
  modal.classList.add('show');
};

const closeAuthModal = () => {
  document.getElementById('authModal').classList.remove('show');
};

const switchAuthMode = () => {
  const title = document.getElementById('authModalTitle');
  const isLogin = title.textContent === 'Login';
  showAuthModal(isLogin ? 'register' : 'login');
};

const toggleUserMenu = () => {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
};

const toggleMobileMenu = () => {
  const navMenu = document.getElementById('navMenu');
  navMenu.classList.toggle('show');
};

// Profile Functions
const showProfile = () => {
  showSection('profile');
  toggleUserMenu();
};

const loadProfile = async () => {
  if (!AppState.user) return;
  
  try {
    // Update profile display
    document.getElementById('profileName').textContent = AppState.user.name;
    document.getElementById('profileRole').textContent = AppState.user.role;
    document.getElementById('profileEmail').textContent = AppState.user.email;
    document.getElementById('profileAvatar').src = AppState.user.avatarUrl;
    
    // Load user statistics
    const historyResponse = await apiCall('/scan/history?limit=1000');
    const scans = historyResponse.data.scans;
    
    document.getElementById('totalScans').textContent = scans.length;
    
    const completedScans = scans.filter(scan => scan.status === 'Completed');
    const avgScore = completedScans.length > 0 
      ? Math.round(completedScans.reduce((sum, scan) => sum + scan.securityScore, 0) / completedScans.length)
      : 0;
    document.getElementById('avgScore').textContent = avgScore;
    
    const memberSince = new Date(AppState.user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
    document.getElementById('memberSince').textContent = memberSince;
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    showToast('Failed to load profile data', 'error');
  }
};

const editProfile = () => {
  const modal = document.getElementById('profileModal');
  document.getElementById('editName').value = AppState.user.name;
  document.getElementById('editEmail').value = AppState.user.email;
  modal.classList.add('show');
};

const closeProfileModal = () => {
  document.getElementById('profileModal').classList.remove('show');
};

const updateProfile = async (name, email) => {
  try {
    showLoading(true);
    const response = await apiCall('/auth/profile', {
      method: 'PUT',
      body: { name, email }
    });
    
    AppState.user = response.user;
    updateUIForLoggedInUser();
    loadProfile();
    closeProfileModal();
    showToast('Profile updated successfully!', 'success');
    
  } catch (error) {
    showToast(error.message, 'error', 'Update Failed');
  } finally {
    showLoading(false);
  }
};

// Scan Functions
const startScan = async () => {
  const urlInput = document.getElementById('urlInput');
  const scanBtn = document.getElementById('scanBtn');
  const progress = document.getElementById('scanProgress');
  const results = document.getElementById('results');
  
  const rawUrl = urlInput.value.trim();
  if (!rawUrl) {
    showToast('Please enter a domain name', 'warning');
    return;
  }
  
  // Sanitize URL
  const sanitizedUrl = rawUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/^http?:\/\//, '');
  
  if (!sanitizedUrl.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    showToast('Please enter a valid domain name', 'error');
    return;
  }
  
  try {
    // Update UI for scanning state
    scanBtn.disabled = true;
    scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Scanning...</span>';
    progress.classList.remove('hidden');
    results.innerHTML = '';
    
    const response = await apiCall('/scan', {
      method: 'POST',
      body: { url: sanitizedUrl }
    });
    
    displayResults(response.data);
    showToast('Scan completed successfully!', 'success');
    
  } catch (error) {
    console.error('Scan failed:', error);
    showToast(error.message, 'error', 'Scan Failed');
    results.innerHTML = `
      <div class="card alert">
        <h2>❌ Scan Failed</h2>
        <p>Unable to scan ${sanitizedUrl}. Please check the domain and try again.</p>
        <p><strong>Error:</strong> ${error.message}</p>
      </div>
    `;
  } finally {
    // Reset UI
    scanBtn.disabled = false;
    scanBtn.innerHTML = '<i class="fas fa-search"></i> <span>Scan Website</span>';
    progress.classList.add('hidden');
  }
};

const displayResults = (data) => {
  const resultsDiv = document.getElementById('results');
  const { url, ssl, headers, ports, vulnerabilities, securityScore, riskLevel, scanDuration } = data;
  
  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };
  
  const getRiskClass = (risk) => {
    return `risk-${risk.toLowerCase()}`;
  };
  
  resultsDiv.innerHTML = `
    <div class="card">
      <h2>📊 Scan Summary</h2>
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div class="security-score ${getScoreClass(securityScore)}">
          <i class="fas fa-shield-alt"></i>
          Security Score: ${securityScore}/100
        </div>
        <div class="security-score ${getRiskClass(riskLevel)}">
          <i class="fas fa-exclamation-triangle"></i>
          Risk Level: ${riskLevel}
        </div>
      </div>
      <p><strong>Domain:</strong> ${url}</p>
      <p><strong>Scan Duration:</strong> ${formatDuration(scanDuration)}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    </div>

    ${ssl ? `
      <div class="card">
        <h2>🔐 SSL/TLS Certificate</h2>
        <ul>
          <li><strong>Protocol:</strong> ${ssl.protocol}</li>
          <li><strong>Valid From:</strong> ${new Date(ssl.valid_from).toLocaleDateString()}</li>
          <li><strong>Valid To:</strong> ${new Date(ssl.valid_to).toLocaleDateString()}</li>
          <li><strong>Issued By:</strong> ${ssl.issuer?.CN || 'Unknown'}</li>
          <li><strong>Subject:</strong> ${ssl.subject?.CN || 'Unknown'}</li>
        </ul>
      </div>
    ` : `
      <div class="card alert">
        <h2>❌ SSL Certificate</h2>
        <p>No valid SSL certificate found or connection failed.</p>
      </div>
    `}

    <div class="card">
      <h2>📦 HTTP Security Headers</h2>
      ${Object.keys(headers).length > 0 ? `
        <ul>
          ${Object.entries(headers)
            .slice(0, 10)
            .map(([key, value]) => `
              <li><strong>${key}:</strong> ${typeof value === 'string' && value.length > 100 
                ? value.substring(0, 100) + '...' 
                : value}
              </li>
            `).join('')}
          ${Object.keys(headers).length > 10 ? `<li><em>... and ${Object.keys(headers).length - 10} more headers</em></li>` : ''}
        </ul>
      ` : '<p>No security headers detected.</p>'}
    </div>

    <div class="card">
      <h2>🌐 Open Ports</h2>
      ${ports && ports.length > 0 ? `
        <p><strong>Detected Ports:</strong> ${ports.join(', ')}</p>
        <p><em>Total: ${ports.length} open ports found</em></p>
      ` : '<p>No open ports detected in common port range.</p>'}
    </div>

    <div class="card ${vulnerabilities && vulnerabilities.length > 0 ? 'alert' : 'safe'}">
      <h2>${vulnerabilities && vulnerabilities.length > 0 ? '⚠️ Security Issues Found' : '✅ Security Assessment'}</h2>
      ${vulnerabilities && vulnerabilities.length > 0 ? `
        <ul>
          ${vulnerabilities.map(vuln => `<li>${vuln}</li>`).join('')}
        </ul>
        <p><strong>Recommendation:</strong> Address these security issues to improve your website's security posture.</p>
      ` : `
        <p>✅ No critical security vulnerabilities detected!</p>
        <p>Your website appears to have good security configuration.</p>
      `}
    </div>
  `;
  
  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// History Functions
const showHistory = () => {
  showSection('history');
  toggleUserMenu();
};

const loadScanHistory = async (page = 1) => {
  const historyList = document.getElementById('historyList');
  
  try {
    historyList.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading scan history...</p>
      </div>
    `;
    
    const response = await apiCall(`/scan/history?page=${page}&limit=10`);
    const { scans, pagination } = response.data;
    
    if (scans.length === 0) {
      historyList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--secondary-600);">
          <i class="fas fa-history" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>No scan history yet</h3>
          <p>Start scanning websites to see your history here.</p>
        </div>
      `;
      return;
    }
    
    historyList.innerHTML = scans.map(scan => `
      <div class="history-item">
        <div class="history-info">
          <h3>${scan.url}</h3>
          <div class="history-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(scan.createdAt)}</span>
            ${scan.scanDuration ? `<span><i class="fas fa-clock"></i> ${formatDuration(scan.scanDuration)}</span>` : ''}
            ${scan.securityScore ? `<span><i class="fas fa-shield-alt"></i> Score: ${scan.securityScore}/100</span>` : ''}
          </div>
        </div>
        <div class="history-actions">
          <span class="status-badge status-${scan.status.toLowerCase()}">${scan.status}</span>
          ${scan.riskLevel ? `<span class="risk-badge risk-${scan.riskLevel.toLowerCase()}">${scan.riskLevel}</span>` : ''}
          <button class="btn btn-outline btn-sm" onclick="viewScanDetails('${scan._id}')">
            <i class="fas fa-eye"></i> View
          </button>
        </div>
      </div>
    `).join('');
    
    // Update pagination
    updatePagination(pagination);
    
  } catch (error) {
    console.error('Failed to load scan history:', error);
    historyList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--error-500);">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <h3>Failed to load history</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="loadScanHistory()">Try Again</button>
      </div>
    `;
  }
};

const updatePagination = (pagination) => {
  const container = document.getElementById('historyPagination');
  if (!pagination || pagination.pages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  const { current, pages, hasPrev, hasNext } = pagination;
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button ${!hasPrev ? 'disabled' : ''} onclick="loadScanHistory(${current - 1})">
      <i class="fas fa-chevron-left"></i> Previous
    </button>
  `;
  
  // Page numbers
  for (let i = Math.max(1, current - 2); i <= Math.min(pages, current + 2); i++) {
    paginationHTML += `
      <button class="${i === current ? 'active' : ''}" onclick="loadScanHistory(${i})">
        ${i}
      </button>
    `;
  }
  
  // Next button
  paginationHTML += `
    <button ${!hasNext ? 'disabled' : ''} onclick="loadScanHistory(${current + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  container.innerHTML = paginationHTML;
};

const refreshHistory = () => {
  loadScanHistory(1);
};

const viewScanDetails = async (scanId) => {
  try {
    showLoading(true);
    const response = await apiCall(`/scan/${scanId}`);
    const scan = response.data;
    
    // Display scan details in results section
    showSection('scanner');
    displayResults({
      url: scan.url,
      ssl: scan.results.ssl,
      headers: scan.results.headers,
      ports: scan.results.ports,
      vulnerabilities: scan.results.vulnerabilities,
      securityScore: scan.securityScore,
      riskLevel: scan.riskLevel,
      scanDuration: scan.scanDuration
    });
    
  } catch (error) {
    showToast(error.message, 'error', 'Failed to load scan details');
  } finally {
    showLoading(false);
  }
};

// Analytics Functions (Developer only)
const showAnalytics = () => {
  if (AppState.user?.role !== 'Developer') {
    showToast('Access denied. Developer role required.', 'error');
    return;
  }
  showSection('analytics');
  toggleUserMenu();
};

const loadAnalytics = async () => {
  if (AppState.user?.role !== 'Developer') return;
  
  try {
    const response = await apiCall('/scan/analytics/overview');
    const data = response.data;
    
    // Update analytics cards
    document.getElementById('analyticsTotal').textContent = data.totalScans;
    document.getElementById('analyticsSuccess').textContent = 
      data.totalScans > 0 ? Math.round((data.completedScans / data.totalScans) * 100) + '%' : '0%';
    document.getElementById('analyticsAvgScore').textContent = data.avgSecurityScore;
    
    const highRiskCount = data.riskLevelStats
      .filter(stat => ['High', 'Critical'].includes(stat._id))
      .reduce((sum, stat) => sum + stat.count, 0);
    document.getElementById('analyticsHighRisk').textContent = highRiskCount;
    
    // Update recent scans
    const recentList = document.getElementById('recentScansList');
    if (data.recentScans && data.recentScans.length > 0) {
      recentList.innerHTML = data.recentScans.slice(0, 5).map(scan => `
        <div class="recent-item">
          <h4>${scan.url}</h4>
          <p>by ${scan.user?.name || 'Unknown'} • ${formatDate(scan.createdAt)}</p>
          <p>Score: ${scan.securityScore || 'N/A'} • Risk: ${scan.riskLevel || 'Unknown'}</p>
        </div>
      `).join('');
    } else {
      recentList.innerHTML = '<p>No recent scans available.</p>';
    }
    
  } catch (error) {
    console.error('Failed to load analytics:', error);
    showToast('Failed to load analytics data', 'error');
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already logged in
  if (AppState.token) {
    const user = await getCurrentUser();
    if (user) {
      updateUIForLoggedInUser();
      showSection('scanner');
    } else {
      showSection('hero');
    }
  } else {
    showSection('hero');
  }
  
  // Form event listeners
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    await login(email, password);
  });
  
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    await register(name, email, password, role);
  });
  
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('editName').value;
    const email = document.getElementById('editEmail').value;
    await updateProfile(name, email);
  });
  
  // URL input enter key support
  document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      startScan();
    }
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const userDropdown = document.getElementById('userDropdown');
    const userBtn = document.querySelector('.user-btn');
    
    if (!userBtn?.contains(e.target)) {
      userDropdown?.classList.remove('show');
    }
  });
  
  // Close modals when clicking outside
  document.addEventListener('click', (e) => {
    const authModal = document.getElementById('authModal');
    const profileModal = document.getElementById('profileModal');
    
    if (e.target === authModal) {
      closeAuthModal();
    }
    if (e.target === profileModal) {
      closeProfileModal();
    }
  });
});

// Global functions for HTML onclick handlers
window.showAuthModal = showAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthMode = switchAuthMode;
window.toggleUserMenu = toggleUserMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.showProfile = showProfile;
window.showHistory = showHistory;
window.showAnalytics = showAnalytics;
window.logout = logout;
window.startScan = startScan;
window.editProfile = editProfile;
window.closeProfileModal = closeProfileModal;
window.refreshHistory = refreshHistory;
window.viewScanDetails = viewScanDetails;
window.loadScanHistory = loadScanHistory;