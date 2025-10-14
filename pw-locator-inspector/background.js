/**
 * Background Service Worker for PW Locator Inspector
 */

// Installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('PW Locator Inspector installed successfully!');

    // Set default settings
    chrome.storage.sync.set({
      language: 'java',
      theme: 'dark',
      testIdAttribute: 'data-testid'
    });
  } else if (details.reason === 'update') {
    console.log('PW Locator Inspector updated to version', chrome.runtime.getManifest().version);
  }

  // Create context menu items
  chrome.contextMenus.create({
    id: 'pw-inspector-generate',
    title: '🎯 Generate Locator',
    contexts: ['all']
  });

  chrome.contextMenus.create({
    id: 'pw-inspector-validate',
    title: '✓ Validate Locator',
    contexts: ['all']
  });
});

// Message handler - forwards messages from DevTools panel to content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request, 'from:', sender);

  // Handle activate action
  if (request.action === 'activate') {
    const targetTabId = request.tabId || (sender.tab && sender.tab.id);
    if (!targetTabId) {
      sendResponse({ success: false, error: 'Missing tabId' });
      return true;
    }

    console.log('[Background] Forwarding activate to tab:', targetTabId);
    chrome.tabs.sendMessage(targetTabId, { action: 'activate' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[Background] Activate sent successfully');
        sendResponse(response || { success: true });
      }
    });
    return true;
  }

  // Handle deactivate action
  if (request.action === 'deactivate') {
    const targetTabId = request.tabId || (sender.tab && sender.tab.id);
    if (!targetTabId) {
      sendResponse({ success: false, error: 'Missing tabId' });
      return true;
    }

    console.log('[Background] Forwarding deactivate to tab:', targetTabId);
    chrome.tabs.sendMessage(targetTabId, { action: 'deactivate' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[Background] Deactivate sent successfully');
        sendResponse(response || { success: true });
      }
    });
    return true;
  }

  // Handle setLanguage action
  if (request.action === 'setLanguage') {
    const targetTabId = request.tabId || (sender.tab && sender.tab.id);
    if (!targetTabId) {
      sendResponse({ success: false, error: 'Missing tabId' });
      return true;
    }

    chrome.tabs.sendMessage(targetTabId, { action: 'setLanguage', language: request.language }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response || { success: true });
      }
    });
    return true;
  }

  // Handle getStatus action
  if (request.action === 'getStatus') {
    const targetTabId = request.tabId || (sender.tab && sender.tab.id);
    if (!targetTabId) {
      sendResponse({ success: false, error: 'Missing tabId' });
      return true;
    }

    chrome.tabs.sendMessage(targetTabId, { action: 'getStatus' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response || { success: true });
      }
    });
    return true;
  }

  // Handle validateLocator action
  if (request.action === 'validateLocator') {
    const targetTabId = request.tabId || (sender.tab && sender.tab.id);
    if (!targetTabId) {
      sendResponse({ success: false, error: 'Missing tabId' });
      return true;
    }

    console.log('[Background] Forwarding validateLocator to tab:', targetTabId);
    chrome.tabs.sendMessage(targetTabId, {
      action: 'validateLocator',
      code: request.code,
      language: request.language
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Error:', chrome.runtime.lastError.message);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse(response || { success: false, error: 'No response' });
      }
    });
    return true;
  }

  // Handle any background tasks here
  if (request.action === 'openOptions') {
    chrome.runtime.openOptionsPage();
  }

  sendResponse({ success: true });
  return true;
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pw-inspector-generate') {
    chrome.tabs.sendMessage(tab.id, { action: 'startGenerate' });
  } else if (info.menuItemId === 'pw-inspector-validate') {
    chrome.tabs.sendMessage(tab.id, { action: 'startValidate' });
  }
});