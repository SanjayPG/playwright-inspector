/**
 * DevTools Panel Initialization
 * Creates the Playwright Locator Pro panel in Chrome DevTools
 */

chrome.devtools.panels.create(
  'Playwright', // Panel title
  'icons/icon48.png', // Icon path
  'devtools/panel.html', // Panel HTML
  function(panel) {
    console.log('Playwright Locator Pro DevTools panel created');
  }
);
