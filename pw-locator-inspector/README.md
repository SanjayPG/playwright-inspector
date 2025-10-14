# 🎭 Playwright Locator Pro - DevTools Edition

**Professional Playwright locator generation and validation directly in Chrome DevTools**

> Inspired by Selector Hub - Now with proven W3C-compliant logic!

## 🌟 Features

- **🔥 DevTools Integration** - Professional panel integrated into Chrome DevTools (like Selector Hub)
- **🎯 Element Picker** - Click any element to generate Playwright locators
- **✅ Multi-Language Support** - Java, Python, JavaScript, TypeScript, C#
- **🧪 Live Validation** - Test your locators and see matches highlighted in real-time
- **📊 Smart Ranking** - Locators ranked by Playwright best practices
- **📝 History Tracking** - Automatic history of last 50 generated locators
- **⚡ W3C Compliant** - Uses battle-tested accessible name calculation
- **🎨 Professional UI** - Modern dark theme matching DevTools aesthetics

## 🚀 Installation

### Step 1: Generate Icon Files

1. Open `icons/generate-icons.html` in your browser
2. Download all three icon files:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`
3. Save them in the `icons/` folder

### Step 2: Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `pw-locator-inspector` folder
5. ✅ Done!

## 📖 Usage

### Opening the Extension

1. **Open Chrome DevTools** (F12 or Right-click → Inspect)
2. **Click the "Playwright" tab** in DevTools
3. You'll see the professional locator panel!

### Generate Mode

1. **Select your programming language** (Java, Python, JavaScript, TypeScript, or C#)
2. **Click "Start Element Picker"**
3. **Click any element** on the webpage
4. **View ranked locator strategies** with quality badges
5. **Copy the recommended locator** with one click

### Validate Mode

1. **Switch to "Validate" tab**
2. **Paste your Playwright locator** code
3. **Click "Validate & Highlight"**
4. **See results**: Perfect match ✅, Multiple matches ⚠️, or No match ❌
5. Matching elements are **automatically highlighted** on the page

### History Mode

1. **Switch to "History" tab**
2. View your **last 50 generated locators**
3. **Copy any previous locator** with one click
4. **Clear history** when needed

## 🎯 Locator Priority (Playwright Best Practices)

The extension follows Playwright's official recommendations:

1. **⭐ getByRole()** - Best practice (accessibility-first)
2. **📝 getByLabel()** - Recommended for form inputs
3. **🔤 getByPlaceholder()** - For inputs with placeholder
4. **📄 getByText()** - For elements with visible text
5. **🖼️ getByAltText()** - For images with alt text
6. **🏷️ getByTitle()** - For elements with title attribute
7. **🧪 getByTestId()** - Stable but requires setup
8. **⚠️ CSS Selector** - Last resort (fragile)

## 💡 Examples

### Java
```java
page.getByLabel("Username")
page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Login"))
page.getByTestId("submit-btn")
```

### Python
```python
page.get_by_label("Username")
page.get_by_role("button", name="Login")
page.get_by_test_id("submit-btn")
```

### JavaScript/TypeScript
```javascript
page.getByLabel('Username')
page.getByRole('button', { name: 'Login' })
page.getByTestId('submit-btn')
```

### C#
```csharp
page.GetByLabel("Username")
page.GetByRole(AriaRole.Button, new() { Name = "Login" })
page.GetByTestId("submit-btn")
```

## 🔥 Why This Extension?

### ✅ Proven Logic
- Uses W3C-compliant accessible name calculation
- Extracted from battle-tested console scripts
- **Actually finds elements** (unlike custom implementations)

### ✅ Professional UI
- Integrated into Chrome DevTools (like Selector Hub)
- Dark theme matching DevTools aesthetics
- Clean, modern design with Visual Studio Code inspiration

### ✅ Quality Indicators
- **✓ UNIQUE** - Perfect! One exact match
- **⚠️ MULTIPLE MATCHES** - Needs refinement
- **✕ NO MATCH** - Invalid selector

### ✅ Multi-Language
- Supports 5 programming languages
- Proper syntax for each language binding
- Copy-ready code snippets

## 🛠️ Technical Details

### Architecture

```
pw-locator-inspector/
├── manifest.json                 # Extension configuration (DevTools mode)
├── devtools/
│   ├── devtools.html            # DevTools entry point
│   ├── devtools.js              # Panel initialization
│   ├── panel.html               # Main panel UI
│   ├── panel.css                # Professional styling
│   └── panel.js                 # Panel logic & communication
├── content-scripts/
│   ├── main.js                  # Core locator logic (W3C compliant)
│   └── style.css                # Page overlay styles
├── icons/
│   ├── icon16.png               # 16x16 toolbar icon
│   ├── icon48.png               # 48x48 extension icon
│   └── icon128.png              # 128x128 Chrome Web Store icon
└── background.js                # Service worker

```

### Key Modules (content-scripts/main.js)

1. **Utils** - W3C-compliant accessible name calculation
2. **LocatorEngine** - Find elements by various strategies
3. **StrategyGenerator** - Generate ranked locator strategies
4. **Validator** - Parse and test locators
5. **CodeFormatter** - Format for different languages
6. **Highlighter** - Visual feedback on page
7. **Inspector** - Element picker mode

## 🎨 UI Design

### Professional Features

- **Dark Theme** - Matches Chrome DevTools (#1e1e1e background)
- **Modern Typography** - System fonts for crisp rendering
- **Responsive Layout** - Works on all screen sizes
- **Smooth Animations** - Toast notifications with slide-in effects
- **Status Indicators** - Live connection status
- **Hover Effects** - Interactive feedback on all buttons

### Color Palette

- **Primary**: #007acc (DevTools blue)
- **Success**: #107c10 (Green - unique matches)
- **Warning**: #f59e0b (Amber - multiple matches)
- **Error**: #e81123 (Red - invalid locators)
- **Background**: #1e1e1e (DevTools dark)
- **Panel**: #252526 (Slightly lighter)

## 🐛 Troubleshooting

### Extension Not Showing in DevTools?

1. **Reload the extension** in `chrome://extensions/`
2. **Close and reopen** DevTools
3. **Refresh the webpage**
4. Check if **icon files exist** in `icons/` folder

### Element Picker Not Working?

1. **Refresh the webpage** after installing
2. Make sure you clicked **"Start Element Picker"** button
3. Check **browser console** (F12) for errors
4. Ensure you're not on a `chrome://` internal page

### Locators Not Finding Elements?

1. Use the **Validate tab** to test your locator
2. Check if locator shows **"✕ NO MATCH"** badge
3. Try **alternative locators** from the list
4. Ensure the element is **visible on the page**

## 📦 Version History

### Version 4.2.0 (Current) - DevTools Edition
- ✅ Converted to professional DevTools panel
- ✅ Selector Hub-inspired UI design
- ✅ Replaced core logic with proven W3C-compliant implementation
- ✅ Added getByAltText() and getByTitle() support
- ✅ Fixed getByLabel() to actually work correctly
- ✅ Modern dark theme matching DevTools

### Version 4.1.0
- UI redesign to modern professional look
- Improved color scheme and layout
- Better user experience

## 🤝 Contributing

Found a bug or have a suggestion? Please create an issue!

## 📄 License

MIT License - Free to use and modify

---

## 🎯 Pro Tips

### Best Practices

- ✅ Always use the **recommended locator** (marked with ⭐)
- ✅ Prefer **getByRole** and **getByLabel** for accessibility
- ✅ Test locators with **Validate tab** before using
- ✅ Look for **"✓ UNIQUE"** badge for reliable locators
- ❌ Avoid CSS selectors unless absolutely necessary

### Keyboard Shortcuts

- **F12** - Open/close DevTools
- **ESC** - Exit element picker mode
- **Ctrl+C** - Copy (when input focused)

### When to Use Each Locator

- **getByRole** - Any element with a semantic role (buttons, links, inputs)
- **getByLabel** - Form inputs with labels (username, password fields)
- **getByPlaceholder** - Inputs without labels but with placeholder text
- **getByText** - Elements with unique visible text (buttons, headings)
- **getByAltText** - Images with descriptive alt text
- **getByTitle** - Elements with title tooltips
- **getByTestId** - When you control the HTML and can add test IDs
- **CSS Selector** - Last resort when nothing else works

---

**Made with ❤️ for the Playwright testing community**

**Happy Testing! 🎭**
