/**
 * Playwright Locator Pro - DevTools Panel Logic
 * Main controller for the DevTools panel interface
 */

// State Management
const State = {
  language: 'java',
  currentMode: 'generate',
  inspectorActive: false,
  currentElement: null,
  currentStrategies: null,
  history: []
};

// Initialize panel on load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[DevTools Panel] DOMContentLoaded - Initializing panel...');
  console.log('[DevTools Panel] Tab ID:', chrome.devtools.inspectedWindow.tabId);
  initializePanel();
  loadHistory();
  console.log('[DevTools Panel] Panel initialization complete');

  // Test connection to content script
  setTimeout(() => {
    console.log('[DevTools Panel] Testing connection to content script...');
    sendMessageToContentScript({ action: 'getStatus' });
  }, 1000);
});

/**
 * Initialize the DevTools panel
 */
function initializePanel() {
  // Mode switching
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Language selector
  document.getElementById('language-selector').addEventListener('change', (e) => {
    State.language = e.target.value;
    sendMessageToContentScript({ action: 'setLanguage', language: State.language });
    if (State.currentStrategies) {
      renderLocators(State.currentStrategies);
    }
  });

  // Inspector controls
  document.getElementById('start-inspector').addEventListener('click', toggleInspector);
  document.getElementById('clear-element').addEventListener('click', clearElement);

  // Validate controls
  document.getElementById('validate-btn').addEventListener('click', validateLocator);

  // History controls
  document.getElementById('clear-history').addEventListener('click', clearHistory);

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(handleContentMessage);

  // Set initial language in content script
  sendMessageToContentScript({ action: 'setLanguage', language: State.language });
}

/**
 * Switch between different modes (Generate, Validate, History)
 */
function switchMode(mode) {
  State.currentMode = mode;

  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Update content panels
  document.querySelectorAll('.panel-content').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(`${mode}-panel`).classList.add('active');

  // Stop inspector if switching away from generate mode
  if (mode !== 'generate' && State.inspectorActive) {
    toggleInspector();
  }
}

/**
 * Toggle element inspector on/off
 */
function toggleInspector() {
  console.log('[DevTools Panel] toggleInspector called, current state:', State.inspectorActive);
  State.inspectorActive = !State.inspectorActive;

  const btn = document.getElementById('start-inspector');
  const status = document.getElementById('inspector-status');

  if (State.inspectorActive) {
    console.log('[DevTools Panel] Activating inspector...');
    btn.textContent = 'Stop Picker';
    btn.classList.add('active');
    status.classList.add('active');
    status.classList.remove('inactive');
    status.querySelector('.status-text').textContent = 'Inspecting...';

    // Activate inspector in content script via message passing
    sendMessageToContentScript({ action: 'activate' });

    showToast('Element picker activated. Click any element on the page.', 'info');
  } else {
    console.log('[DevTools Panel] Deactivating inspector...');
    btn.textContent = 'Start Element Picker';
    btn.classList.remove('active');
    status.classList.remove('active');
    status.classList.add('inactive');
    status.querySelector('.status-text').textContent = 'Ready';

    // Deactivate inspector in content script via message passing
    sendMessageToContentScript({ action: 'deactivate' });
  }
}

/**
 * Handle messages from content script
 */
function handleContentMessage(message, sender, sendResponse) {
  if (message.action === 'elementSelected') {
    handleElementSelected(message.element, message.strategies);
  } else if (message.action === 'inspectorStopped') {
    if (State.inspectorActive) {
      toggleInspector();
    }
  }
}

/**
 * Handle element selection from inspector
 */
function handleElementSelected(elementInfo, strategies) {
  State.currentElement = elementInfo;
  State.currentStrategies = strategies;

  // Show element card
  document.getElementById('element-card').style.display = 'block';
  document.getElementById('element-tag').textContent = elementInfo.tagName || '-';
  document.getElementById('element-classes').textContent = elementInfo.className || '-';
  document.getElementById('element-id').textContent = elementInfo.id || '-';

  // Render locators
  renderLocators(strategies);

  // Add to history
  if (strategies && strategies.strategies && strategies.strategies.length > 0) {
    const best = strategies.strategies[0];
    const code = formatLocator(best, State.language);
    addToHistory({
      code,
      type: best.type,
      element: elementInfo.tagName,
      timestamp: Date.now()
    });
  }

  // Auto-stop inspector after selection
  if (State.inspectorActive) {
    toggleInspector();
  }

  showToast('Element analyzed successfully!', 'success');
}

/**
 * Render locator strategies
 */
function renderLocators(strategiesData) {
  const container = document.getElementById('locators-container');

  if (!strategiesData || !strategiesData.strategies || strategiesData.strategies.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4M12 16h.01"></path>
        </svg>
        <h3>No Locators Found</h3>
        <p>Could not generate locators for this element</p>
      </div>
    `;
    return;
  }

  const { strategies, totalTime } = strategiesData;

  container.innerHTML = strategies.map((strategy, index) => {
    const code = formatLocator(strategy, State.language);
    const isRecommended = index === 0 && strategy.isUnique;

    let statusBadge = '';
    if (strategy.isUnique) {
      statusBadge = '<span class="status-badge unique">✓ UNIQUE</span>';
    } else if (strategy.isValid) {
      statusBadge = `<span class="status-badge multiple">⚠ ${strategy.matchCount} MATCHES</span>`;
    } else {
      statusBadge = '<span class="status-badge invalid">✕ NO MATCH</span>';
    }

    return `
      <div class="locator-card ${isRecommended ? 'recommended' : ''}">
        <div class="locator-header">
          <div class="locator-info">
            <div class="locator-type">
              <span class="type-label">${strategy.description}</span>
              ${isRecommended ? '<span class="recommended-badge">⭐ Recommended</span>' : ''}
            </div>
            <div class="locator-description">Priority ${strategy.priority}</div>
          </div>
          <div class="locator-badges">
            ${statusBadge}
          </div>
        </div>
        <div class="locator-body">
          <div class="code-block">${escapeHtml(code)}</div>
          <div class="locator-actions">
            <button class="action-btn primary" onclick="copyToClipboard('${escapeForAttr(code)}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </button>
            <button class="action-btn" onclick="testLocator(${index})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Test (${strategy.matchCount})
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Format locator for specific language
 */
function formatLocator(strategy, language) {
  const formatters = {
    java: formatJava,
    python: formatPython,
    javascript: formatJavaScript,
    typescript: formatJavaScript,
    csharp: formatCSharp
  };

  const formatter = formatters[language] || formatters.java;
  return formatter(strategy);
}

function formatJava(strategy) {
  switch (strategy.type) {
    case 'role':
      const roleUpper = strategy.role.toUpperCase();
      if (strategy.options && strategy.options.name) {
        return `page.getByRole(AriaRole.${roleUpper}, new Page.GetByRoleOptions().setName("${escapeString(strategy.options.name)}"))`;
      }
      return `page.getByRole(AriaRole.${roleUpper})`;
    case 'label': return `page.getByLabel("${escapeString(strategy.text)}")`;
    case 'placeholder': return `page.getByPlaceholder("${escapeString(strategy.text)}")`;
    case 'text': return `page.getByText("${escapeString(strategy.text)}")`;
    case 'altText': return `page.getByAltText("${escapeString(strategy.text)}")`;
    case 'title': return `page.getByTitle("${escapeString(strategy.text)}")`;
    case 'testId': return `page.getByTestId("${escapeString(strategy.testId)}")`;
    case 'css': return `page.locator("${escapeString(strategy.selector)}")`;
    default: return 'page.locator("unknown")';
  }
}

function formatPython(strategy) {
  switch (strategy.type) {
    case 'role':
      if (strategy.options && strategy.options.name) {
        return `page.get_by_role("${strategy.role}", name="${escapeString(strategy.options.name)}")`;
      }
      return `page.get_by_role("${strategy.role}")`;
    case 'label': return `page.get_by_label("${escapeString(strategy.text)}")`;
    case 'placeholder': return `page.get_by_placeholder("${escapeString(strategy.text)}")`;
    case 'text': return `page.get_by_text("${escapeString(strategy.text)}")`;
    case 'altText': return `page.get_by_alt_text("${escapeString(strategy.text)}")`;
    case 'title': return `page.get_by_title("${escapeString(strategy.text)}")`;
    case 'testId': return `page.get_by_test_id("${escapeString(strategy.testId)}")`;
    case 'css': return `page.locator("${escapeString(strategy.selector)}")`;
    default: return 'page.locator("unknown")';
  }
}

function formatJavaScript(strategy) {
  switch (strategy.type) {
    case 'role':
      if (strategy.options && strategy.options.name) {
        return `page.getByRole('${strategy.role}', { name: '${escapeString(strategy.options.name)}' })`;
      }
      return `page.getByRole('${strategy.role}')`;
    case 'label': return `page.getByLabel('${escapeString(strategy.text)}')`;
    case 'placeholder': return `page.getByPlaceholder('${escapeString(strategy.text)}')`;
    case 'text': return `page.getByText('${escapeString(strategy.text)}')`;
    case 'altText': return `page.getByAltText('${escapeString(strategy.text)}')`;
    case 'title': return `page.getByTitle('${escapeString(strategy.text)}')`;
    case 'testId': return `page.getByTestId('${escapeString(strategy.testId)}')`;
    case 'css': return `page.locator('${escapeString(strategy.selector)}')`;
    default: return "page.locator('unknown')";
  }
}

function formatCSharp(strategy) {
  switch (strategy.type) {
    case 'role':
      const roleCapital = strategy.role.charAt(0).toUpperCase() + strategy.role.slice(1);
      if (strategy.options && strategy.options.name) {
        return `page.GetByRole(AriaRole.${roleCapital}, new() { Name = "${escapeString(strategy.options.name)}" })`;
      }
      return `page.GetByRole(AriaRole.${roleCapital})`;
    case 'label': return `page.GetByLabel("${escapeString(strategy.text)}")`;
    case 'placeholder': return `page.GetByPlaceholder("${escapeString(strategy.text)}")`;
    case 'text': return `page.GetByText("${escapeString(strategy.text)}")`;
    case 'altText': return `page.GetByAltText("${escapeString(strategy.text)}")`;
    case 'title': return `page.GetByTitle("${escapeString(strategy.text)}")`;
    case 'testId': return `page.GetByTestId("${escapeString(strategy.testId)}")`;
    case 'css': return `page.Locator("${escapeString(strategy.selector)}")`;
    default: return 'page.Locator("unknown")';
  }
}

/**
 * Copy to clipboard
 */
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(err => {
    showToast('Failed to copy', 'error');
  });
};

/**
 * Test locator
 */
window.testLocator = function(index) {
  if (!State.currentStrategies || !State.currentStrategies.strategies[index]) return;

  const strategy = State.currentStrategies.strategies[index];
  showToast(`Found ${strategy.matchCount} element(s)`, strategy.matchCount === 1 ? 'success' : 'warning');

  // Highlight elements in the page
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      if (typeof Validator !== 'undefined') {
        const strategy = ${JSON.stringify(strategy)};
        const result = Validator.test(strategy);
        if (typeof Highlighter !== 'undefined') {
          Highlighter.highlightElements(result.elements, '#4ec9b0');
        }
      }
    })();
  `);
};

/**
 * Clear selected element
 */
function clearElement() {
  State.currentElement = null;
  State.currentStrategies = null;
  document.getElementById('element-card').style.display = 'none';
  document.getElementById('locators-container').innerHTML = `
    <div class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <h3>Click "Start Element Picker"</h3>
      <p>Then click any element on the page to generate Playwright locators</p>
    </div>
  `;
}

/**
 * Validate locator
 */
function validateLocator() {
  const input = document.getElementById('validate-input').value.trim();
  const results = document.getElementById('validate-results');

  if (!input) {
    showToast('Please enter a locator to validate', 'warning');
    return;
  }

  // Send to content script for validation via message passing
  const tabId = chrome.devtools.inspectedWindow.tabId;

  chrome.runtime.sendMessage({
    action: 'validateLocator',
    tabId: tabId,
    code: input,
    language: State.language
  }, (result) => {
    if (chrome.runtime.lastError || !result) {
      results.innerHTML = `
        <div class="result-card error">
          <div class="result-header">
            <div class="result-icon">❌</div>
            <div class="result-content">
              <h4>Validation Failed</h4>
              <p>Unable to reach content script. Try refreshing the page.</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (result.error) {
      results.innerHTML = `
        <div class="result-card error">
          <div class="result-header">
            <div class="result-icon">❌</div>
            <div class="result-content">
              <h4>Invalid Locator</h4>
              <p>${escapeHtml(result.error)}</p>
            </div>
          </div>
        </div>
      `;
      showToast('Invalid locator syntax', 'error');
      return;
    }

    const status = result.count === 0 ? 'error' : result.count === 1 ? 'success' : 'warning';
    const icons = { error: '❌', success: '✅', warning: '⚠️' };
    const titles = {
      error: 'No Elements Found',
      success: 'Perfect! Unique Match',
      warning: `Multiple Matches Found (${result.count})`
    };
    const messages = {
      error: 'This locator doesn\'t match any elements on the page.',
      success: 'This locator uniquely identifies one element. Perfect for automation!',
      warning: `This locator matches ${result.count} elements. Consider making it more specific.`
    };

    results.innerHTML = `
      <div class="result-card ${status}">
        <div class="result-header">
          <div class="result-icon">${icons[status]}</div>
          <div class="result-content">
            <h4>${titles[status]}</h4>
            <p>${messages[status]}</p>
          </div>
        </div>
        <div class="result-stats">
          <div class="stat-item"><strong>Execution Time:</strong> ${result.timing}ms</div>
          ${result.count > 0 ? `<div class="stat-item"><strong>Elements:</strong> ${result.count} found</div>` : ''}
        </div>
      </div>
    `;

    showToast(`Found ${result.count} element(s)`, status);

    // Elements are already highlighted by the content script
  });
}

/**
 * History management
 */
function addToHistory(entry) {
  State.history.unshift(entry);
  State.history = State.history.slice(0, 50); // Keep last 50
  saveHistory();
  if (State.currentMode === 'history') {
    renderHistory();
  }
}

function loadHistory() {
  chrome.storage.local.get(['history'], (result) => {
    if (result.history) {
      State.history = result.history;
      if (State.currentMode === 'history') {
        renderHistory();
      }
    }
  });
}

function saveHistory() {
  chrome.storage.local.set({ history: State.history });
}

function clearHistory() {
  State.history = [];
  saveHistory();
  renderHistory();
  showToast('History cleared', 'success');
}

function renderHistory() {
  const container = document.getElementById('history-list');

  if (State.history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <h3>No History Yet</h3>
        <p>Generate some locators to see them here</p>
      </div>
    `;
    return;
  }

  container.innerHTML = State.history.map(entry => `
    <div class="history-item">
      <div class="history-header">
        <div class="history-time">${formatTimestamp(entry.timestamp)}</div>
        <button class="icon-btn-small" onclick="copyToClipboard('${escapeForAttr(entry.code)}')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      <div class="history-code">${escapeHtml(entry.code)}</div>
    </div>
  `).join('');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-message">${escapeHtml(message)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Utility functions
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeString(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function escapeForAttr(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function formatTimestamp(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Send message to content script via background page
 */
function sendMessageToContentScript(message) {
  // DevTools panel sends message with tabId included
  const tabId = chrome.devtools.inspectedWindow.tabId;

  console.log('[DevTools Panel] Sending message:', message, 'for tab:', tabId);

  chrome.runtime.sendMessage({
    ...message,
    tabId: tabId
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[DevTools Panel] Error sending message:', chrome.runtime.lastError);
    } else {
      console.log('[DevTools Panel] Message sent successfully, response:', response);
    }
  });
}
