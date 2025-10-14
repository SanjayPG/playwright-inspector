# 🎭 Playwright Locator Pro - User Guide

## Quick Start

### 1. **Install the Extension**
- Generate icon files using `icons/generate-icons.html`
- Load extension in Chrome via `chrome://extensions/`
- Enable "Developer mode" and click "Load unpacked"

### 2. **Open the Extension**
- Click the 🎭 icon in your Chrome toolbar
- Choose your programming language (Java, Python, JavaScript, TypeScript, C#)

### 3. **Generate Locators**
1. Click the **GENERATE** button
2. Click any element on the webpage
3. See ranked locator suggestions appear instantly
4. Copy the recommended locator with one click

### 4. **Validate Locators**
1. Click the **VALIDATE** button
2. Paste your Playwright locator code
3. Click "Validate & Highlight"
4. See matching elements highlighted on the page

---

## Understanding Locator Rankings

The extension follows **Playwright's official best practices**:

### 🌟 Priority 1: `getByRole()` - Best Practice ⭐
- **When to use**: For any element with a semantic role
- **Example**: `page.getByRole('button', { name: 'Login' })`
- **Why it's best**: Accessibility-first, resilient to UI changes

### 📝 Priority 2: `getByLabel()` - Recommended for Forms
- **When to use**: For form inputs with labels
- **Example**: `page.getByLabel('Username')`
- **Why it's good**: Semantic, user-focused

### 🎯 Priority 3: `getByPlaceholder()`
- **When to use**: For inputs with placeholder text
- **Example**: `page.getByPlaceholder('Enter email')`
- **Why**: Better than CSS but less robust than label

### 📄 Priority 4: `getByText()`
- **When to use**: For elements with unique visible text
- **Example**: `page.getByText('Sign In')`
- **Why**: Intuitive but can break with text changes

### 🔧 Priority 5: `getByTestId()`
- **When to use**: When you control the HTML
- **Example**: `page.getByTestId('login-button')`
- **Why**: Stable but requires code changes

### ⚠️ Priority 9: CSS Selector - Fragile (Last Resort)
- **When to use**: Only when nothing else works
- **Example**: `page.locator('#app > div.login > button')`
- **Why it's last**: Breaks easily with HTML changes

---

## Understanding Status Badges

- **✓ UNIQUE** (Green) - Perfect! This locator matches exactly one element
- **⚠️ MULTIPLE MATCHES** (Orange) - Matches several elements, may need refinement
- **✕ NO MATCH** (Red) - Doesn't find any elements, check your selector

---

## Common Issues & Solutions

### Issue: "Username" field generates wrong locator

**Problem**: The label might not be properly associated with the input.

**Solution**: The extension now checks multiple patterns:
1. `aria-label` attribute
2. `aria-labelledby` attribute
3. `<label for="id">` associations
4. Labels wrapping inputs
5. Nearby labels (previous siblings)
6. `name` attribute fallback

**Example**: On OrangeHRM demo site, it should now correctly detect:
```java
page.getByLabel("Username")
```

### Issue: Locator doesn't work in my tests

**Debugging steps**:
1. Use the **Validate** tab to test your locator
2. Check if it finds multiple elements (⚠️)
3. Try using the more specific locator from alternatives
4. Consider adding `{ exact: true }` for text-based locators

### Issue: Extension UI is jumbled

**Solution**:
1. Reload the extension in `chrome://extensions/`
2. Refresh the webpage
3. Clear browser cache if needed

---

## Tips for Best Results

### ✅ DO:
- Use the recommended locator (highlighted in blue)
- Test your locators using the Validate tab
- Copy locators using the Copy button (auto-formatted)
- Check for UNIQUE badge before using

### ❌ DON'T:
- Use CSS selectors unless absolutely necessary
- Ignore multiple matches warnings
- Forget to refresh page after changing code
- Use locators that depend on position/index

---

## Keyboard Shortcuts

- **ESC** - Exit inspector mode / Close panels
- **Click badge numbers** - Scroll to matched element
- **Ctrl+C** (in panel) - Copy selected locator

---

## Language-Specific Examples

### Java
```java
page.getByLabel("Username")
page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Login"))
```

### Python
```python
page.get_by_label("Username")
page.get_by_role("button", name="Login")
```

### JavaScript/TypeScript
```javascript
page.getByLabel('Username')
page.getByRole('button', { name: 'Login' })
```

### C#
```csharp
page.GetByLabel("Username")
page.GetByRole(AriaRole.Button, new() { Name = "Login" })
```

---

## Troubleshooting

### Extension not appearing?
- Check if it's enabled in `chrome://extensions/`
- Look for the 🎭 icon in your toolbar
- Pin the extension for easy access

### Generate mode not working?
- Refresh the webpage after installing extension
- Check browser console (F12) for errors
- Ensure you're not on a chrome:// page

### Locators not matching?
- Use Validate tab to test
- Check if element is in an iframe (not supported yet)
- Try alternative locators from the list

---

## Support

For issues:
1. Check browser console for errors (F12)
2. Verify all PNG icons exist in icons/ folder
3. Ensure you're on a regular webpage (not internal browser pages)
4. Try the extension on https://playwright.dev for testing

---

## Version Information

**Current Version**: 4.1.0
**Last Updated**: 2025
**Compatible With**: Chrome, Edge, Brave (Chromium browsers)

---

**Happy Testing! 🎭**
