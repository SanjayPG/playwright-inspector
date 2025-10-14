// Popup script for Playwright Locator Pro extension

// Load saved language preference
chrome.storage.sync.get(['language'], (result) => {
  if (result.language) {
    document.getElementById('language-select').value = result.language;
  }
});

// Save language when changed
document.getElementById('language-select').addEventListener('change', (e) => {
  const language = e.target.value;
  chrome.storage.sync.set({ language });
  
  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'setLanguage',
      language: language
    });
  });
  
  showStatus(`Language set to ${language.toUpperCase()}`, 'success');
});

// Generate Mode Button
document.getElementById('btn-generate').addEventListener('click', () => {
  const language = document.getElementById('language-select').value;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'startGenerate',
      language: language
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Please refresh the page first', 'error');
      } else {
        showStatus('Generate mode activated', 'success');
        window.close();
      }
    });
  });
});

// Validate Mode Button
document.getElementById('btn-validate').addEventListener('click', () => {
  const language = document.getElementById('language-select').value;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'startValidate',
      language: language
    }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Please refresh the page first', 'error');
      } else {
        showStatus('Validate mode activated', 'success');
        window.close();
      }
    });
  });
});

// History Button
document.getElementById('btn-history').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showHistory'
    });
  });
  window.close();
});

// Favorites Button
document.getElementById('btn-favorites').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showFavorites'
    });
  });
  window.close();
});

// Settings Button
document.getElementById('btn-settings').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showSettings'
    });
  });
  window.close();
});

// Help Button
document.getElementById('btn-help').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'showHelp'
    });
  });
  window.close();
});

// Stop Button
document.getElementById('btn-stop').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'stop'
    });
  });
  showStatus('Stopped', 'success');
  setTimeout(() => window.close(), 500);
});

// Show status message
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  
  setTimeout(() => {
    statusEl.textContent = '';
    statusEl.className = 'status';
  }, 3000);
}

// Check if extension is active
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {
    action: 'getStatus'
  }, (response) => {
    if (response && response.active) {
      showStatus(`${response.mode} mode active`, 'success');
    }
  });
});