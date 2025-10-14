# 🎭 Playwright Locator Pro - Chrome Extension

**Professional-grade Playwright locator generation and validation tool**

Version: 4.0.0  
Languages: Java | Python | JavaScript | TypeScript | C#

---

## 📦 Complete Folder Structure

```
playwright-locator-pro/
│
├── manifest.json                 # Extension configuration
├── background.js                 # Background service worker
├── README.md                     # This file
│
├── popup/
│   ├── popup.html               # Extension popup UI
│   ├── popup.js                 # Popup logic
│   └── popup.css                # Popup styles
│
├── content-scripts/
│   ├── main.js                  # Main orchestrator (300 lines)
│   ├── utils.js                 # Utility functions (400 lines)
│   ├── locator-engine.js        # Core locator finding (600 lines)
│   ├── strategy-generator.js    # Smart suggestions (500 lines)
│   ├── validator.js             # Live testing & parsing (600 lines)
│   ├── formatter.js             # Multi-language formatting (500 lines)
│   ├── highlighter.js           # Visual highlighting (400 lines)
│   ├── storage.js               # History & favorites (300 lines)
│   ├── ui-manager.js            # Panel creation (800 lines)
│   ├── modes.js                 # Generate & Validate modes (500 lines)
│   └── styles.css               # Injected styles
│
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

**Total: ~5,400 lines of code split across modules**

---

## 🚀 Installation

### Method 1: Load Unpacked (Development)

1. **Download/Clone** this folder to your computer

2. **Open Chrome** and navigate to:
   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode** (toggle in top-right corner)

4. **Click "Load unpacked"**

5. **Select** the `playwright-locator-pro` folder

6. **Done!** The extension icon should appear in your toolbar

### Method 2: Package as CRX (Distribution)

1. In `chrome://extensions/`, click **"Pack extension"**
2. Select the extension directory
3. Generate `.crx` file
4. Share with your team

---

## 💡 Usage

### Quick Start

1. **Click extension icon** in Chrome toolbar
2. **Choose language** (Java, Python, etc.)
3. **Select mode:**
   - 🎯 **GENERATE** - Click elements to get locators
   - ✓ **VALIDATE** - Test your locators live

### Generate Mode

1. Click **GENERATE** button
2. Page overlay appears
3. Click any element on the page
4. Get ranked locator strategies
5. Copy with one click
6. Star favorites

### Validate Mode

1. Click **VALIDATE** button
2. Panel opens with text editor
3. Type or paste your locator
4. Real-time validation as you type
5. Elements highlight automatically
6. See match count and timing

---

## ✨ Features

### Core Features
- ✅ **Dual Mode**: Generate & Validate
- ✅ **Multi-Language**: Java, Python, JavaScript, TypeScript, C#
- ✅ **Smart Ranking**: Prioritizes accessibility-first locators
- ✅ **Live Highlighting**: Numbered badges on matched elements
- ✅ **Performance Metrics**: Timing for each locator

### Data Management
- ✅ **History**: Last 50 locators (auto-saved)
- ✅ **Favorites**: Star and save best locators
- ✅ **Export**: Download as JSON
- ✅ **Persistent**: Uses Chrome storage

### UI/UX
- ✅ **Dark Theme**: Professional appearance
- ✅ **Keyboard Shortcuts**: Esc to close, etc.
- ✅ **Toast Notifications**: Visual feedback
- ✅ **Resizable Panels**: Drag to resize
- ✅ **Smooth Animations**: Polished interactions

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close current mode/panel |
| `Ctrl+C` | Copy selected locator |
| Click badge | Scroll to element |

---

## 🔧 Configuration

### Default Settings

Edit in extension popup or settings panel:

- **Language**: Java (default)
- **Theme**: Dark mode
- **Test ID Attribute**: `data-testid`
- **Auto-clear highlights**: 10 seconds

---

## 📁 File Descriptions

### Core Files

**manifest.json**
- Extension configuration
- Permissions and content scripts

**background.js**
- Service worker
- Message handling between popup and content scripts

### Popup Files

**popup.html**
- Extension popup interface
- Mode selector buttons

**popup.js**
- Handles button clicks
- Sends messages to content scripts

**popup.css**
- Beautiful gradient design
- Responsive layout

### Content Script Modules

**main.js**
- Orchestrates all modules
- Message listener
- API exposure

**utils.js**
- Helper functions
- Text normalization
- ARIA role detection
- Accessible name calculation

**locator-engine.js**
- Core finding logic
- getByRole, getByText, etc.
- XPath and CSS selector support

**strategy-generator.js**
- Generates multiple strategies
- Ranks by priority
- Tests uniqueness

**validator.js**
- Parses user input
- Detects language
- Tests locators live

**formatter.js**
- Multi-language code generation
- Java, Python, JS, TS, C# formatters

**highlighter.js**
- Visual element highlighting
- Numbered badges
- Click-to-scroll

**storage.js**
- Chrome storage API
- History management
- Favorites system
- Export functionality

**ui-manager.js**
- Creates panels
- Renders strategy cards
- Settings modal
- History/favorites UI

**modes.js**
- Generate mode logic
- Validate mode logic
- Event handlers

---

## 🐛 Troubleshooting

### Extension not working?

1. **Refresh the page** after installing extension
2. **Check permissions** in `chrome://extensions/`
3. **Open DevTools Console** and look for errors
4. **Disable other extensions** that might conflict

### Elements not highlighting?

- Check if page has CSP (Content Security Policy) restrictions
- Try on a different website
- Refresh the page

### Locators not found?

- Element might be in iframe (not supported yet)
- Dynamic content may need time to load
- Try different locator strategy

---

## 🚀 Advanced Usage

### For Developers

Access the API programmatically in console:

```javascript
// Check if loaded
window.PlaywrightLocatorPro

// Generate mode
PlaywrightLocatorPro.generate()

// Validate mode
PlaywrightLocatorPro.validate()

// Set language
PlaywrightLocatorPro.setLanguage('java')

// Stop
PlaywrightLocatorPro.stop()
```

---

## 📝 License

MIT License - Free to use and modify

---

## 🤝 Contributing

This is a professional tool for QA teams. Suggestions welcome!

---

## 📧 Support

For issues or questions, check console for error messages.

---

## 🎯 Next Steps

After installation:

1. ✅ Test on your application
2. ✅ Set your preferred language
3. ✅ Generate some locators
4. ✅ Save favorites for reuse
5. ✅ Export history for documentation

---

## 🔮 Future Features

- [ ] Shadow DOM support
- [ ] iframe support
- [ ] Regex pattern testing
- [ ] Batch export
- [ ] Custom templates
- [ ] Video tutorials

---

**Happy Testing! 🎭**