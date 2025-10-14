/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLAYWRIGHT LOCATOR INSPECTOR - COMPLETE CONTENT SCRIPTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * All modules combined into one file for easy deployment
 * Version: 4.0.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 1: CONFIG & UTILS
// ═══════════════════════════════════════════════════════════════════════════

const Config = {
  language: 'java',
  theme: 'dark',
  testIdAttribute: 'data-testid',
  autoHighlight: true,
  highlightDuration: 10000,
  maxHistory: 50,
  colors: {
    dark: {
      background: '#ffffff', panel: '#f9fafb', border: '#e5e7eb',
      text: '#111827', textDim: '#6b7280', primary: '#6366f1',
      success: '#10b981', warning: '#f59e0b', error: '#ef4444',
      highlight: '#6366f1', hover: '#8b5cf6', badge: '#6366f1'
    }
  }
};

const Utils = {
  getCurrentTheme() { return Config.colors[Config.theme]; },
  escapeString(str) { return String(str).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n'); },
  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; },
  normalizeText(text) { return String(text).replace(/\s+/g, ' ').trim(); },
  truncate(text, length = 50) { return text.length > length ? text.substring(0, length) + '...' : text; },
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      Notifications.show('Copied!', 'success');
      return true;
    } catch (err) {
      Notifications.show('Copy failed', 'error');
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  },
  downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  formatTimestamp(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  },
  getImplicitRole(element) {
    const tag = element.tagName.toLowerCase();
    const type = (element.getAttribute('type') || '').toLowerCase();
    const roleMap = {
      'a': element.href ? 'link' : null, 'button': 'button',
      'input': { 'button': 'button', 'checkbox': 'checkbox', 'radio': 'radio',
                 'text': 'textbox', 'email': 'textbox', 'password': 'textbox',
                 'search': 'searchbox', 'submit': 'button' }[type] || 'textbox',
      'textarea': 'textbox', 'select': 'combobox',
      'h1': 'heading', 'h2': 'heading', 'h3': 'heading',
      'img': 'img', 'ul': 'list', 'ol': 'list', 'li': 'listitem',
      'nav': 'navigation', 'main': 'main'
    };
    return roleMap[tag] || null;
  },
  getAccessibleName(element) {
    // W3C-compliant accessible name calculation (from proven console script)

    // Priority 1: aria-labelledby
    if (element.hasAttribute('aria-labelledby')) {
      const ids = element.getAttribute('aria-labelledby').split(/\s+/);
      const texts = ids.map(id => {
        const el = document.getElementById(id);
        return el ? el.textContent.trim() : '';
      }).filter(Boolean);
      if (texts.length > 0) return texts.join(' ');
    }

    // Priority 2: aria-label
    if (element.hasAttribute('aria-label')) {
      return element.getAttribute('aria-label').trim();
    }

    // Priority 3: associated label element
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return this.getTextContent(label, element);
    }

    // Priority 4: wrapped in label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return this.getTextContent(parentLabel, element);
    }

    // Priority 5: title attribute
    if (element.hasAttribute('title')) {
      return element.getAttribute('title').trim();
    }

    // Priority 6: alt attribute (images)
    if (element.hasAttribute('alt')) {
      return element.getAttribute('alt').trim();
    }

    // Priority 7: placeholder (not ideal but supported)
    if (element.hasAttribute('placeholder')) {
      return element.getAttribute('placeholder').trim();
    }

    // Priority 8: text content for certain elements
    if (['BUTTON', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
      return element.textContent.trim();
    }

    // Priority 9: value attribute
    if (element.tagName === 'INPUT' && element.value) {
      return element.value.trim();
    }

    return '';
  },

  // Get text content excluding nested inputs (from proven console script)
  getTextContent(container, exclude) {
    const clone = container.cloneNode(true);
    if (exclude && clone.contains(exclude)) {
      const excludeClone = clone.querySelector(exclude.tagName.toLowerCase());
      if (excludeClone) excludeClone.remove();
    }
    return clone.textContent.trim();
  },
  generateCSSSelector(element) {
    if (element.id && !/\s/.test(element.id)) {
      const id = CSS.escape(element.id);
      if (document.querySelectorAll(`#${id}`).length === 1) return `#${id}`;
    }
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(/\s+/).filter(Boolean);
        if (classes.length > 0) selector += '.' + classes.map(c => CSS.escape(c)).join('.');
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 2: LOCATOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const LocatorEngine = {
  // Find by role with improved logic from proven console script
  findByRole(role, options = {}) {
    const elements = [];

    // Find explicit roles
    const explicit = Array.from(document.querySelectorAll(`[role="${role}"]`));
    elements.push(...explicit);

    // Find implicit roles
    document.querySelectorAll('*').forEach(el => {
      const implicitRole = Utils.getImplicitRole(el);
      if (implicitRole === role && !elements.includes(el)) {
        elements.push(el);
      }
    });

    // Filter by name (accessible name)
    if (options.name !== undefined) {
      return elements.filter(el => {
        const accessibleName = Utils.getAccessibleName(el);
        const normalized = Utils.normalizeText(accessibleName);
        const searchText = Utils.normalizeText(options.name);

        if (options.exact) {
          return normalized === searchText;
        }
        return normalized.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    // Filter by level (for headings)
    if (options.level !== undefined && role === 'heading') {
      return elements.filter(el => {
        if (/^H[1-6]$/.test(el.tagName)) {
          return parseInt(el.tagName.substring(1)) === options.level;
        }
        return false;
      });
    }

    return elements;
  },

  // Find by label with improved logic from proven console script
  findByLabel(text, options = {}) {
    const elements = [];

    // Find via label elements
    document.querySelectorAll('label').forEach(label => {
      const labelText = Utils.normalizeText(label.textContent);
      const searchText = Utils.normalizeText(text);

      const matches = options.exact ?
        labelText === searchText :
        labelText.toLowerCase().includes(searchText.toLowerCase());

      if (matches) {
        // Check for label[for] association
        if (label.hasAttribute('for')) {
          const input = document.getElementById(label.getAttribute('for'));
          if (input && !elements.includes(input)) elements.push(input);
        }

        // Check for nested input
        const nested = label.querySelector('input, select, textarea, button');
        if (nested && !elements.includes(nested)) elements.push(nested);
      }
    });

    // Find via aria-label and aria-labelledby (comprehensive search)
    document.querySelectorAll('input, select, textarea, button').forEach(input => {
      const accessibleName = Utils.getAccessibleName(input);
      if (accessibleName) {
        const normalized = Utils.normalizeText(accessibleName);
        const searchText = Utils.normalizeText(text);

        const matches = options.exact ?
          normalized === searchText :
          normalized.toLowerCase().includes(searchText.toLowerCase());

        if (matches && !elements.includes(input)) {
          elements.push(input);
        }
      }
    });

    return elements;
  },

  // Find by text with improved logic from proven console script
  findByText(text, options = {}) {
    const elements = [];
    const searchText = Utils.normalizeText(text);

    document.querySelectorAll('*:not(script):not(style)').forEach(el => {
      // Check if element has direct text (not just from children)
      const hasDirectText = Array.from(el.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );

      if (hasDirectText) {
        const elText = Utils.normalizeText(el.textContent);

        const matches = options.exact ?
          elText === searchText :
          elText.toLowerCase().includes(searchText.toLowerCase());

        if (matches) elements.push(el);
      }
    });

    return elements;
  },

  // Find by placeholder
  findByPlaceholder(text, options = {}) {
    return Array.from(document.querySelectorAll('[placeholder]')).filter(el => {
      const placeholder = Utils.normalizeText(el.getAttribute('placeholder'));
      const searchText = Utils.normalizeText(text);

      return options.exact ?
        placeholder === searchText :
        placeholder.toLowerCase().includes(searchText.toLowerCase());
    });
  },

  // Find by alt text (from proven console script)
  findByAltText(text, options = {}) {
    return Array.from(document.querySelectorAll('[alt]')).filter(el => {
      const alt = Utils.normalizeText(el.getAttribute('alt'));
      const searchText = Utils.normalizeText(text);

      return options.exact ?
        alt === searchText :
        alt.toLowerCase().includes(searchText.toLowerCase());
    });
  },

  // Find by title (from proven console script)
  findByTitle(text, options = {}) {
    return Array.from(document.querySelectorAll('[title]')).filter(el => {
      const title = Utils.normalizeText(el.getAttribute('title'));
      const searchText = Utils.normalizeText(text);

      return options.exact ?
        title === searchText :
        title.toLowerCase().includes(searchText.toLowerCase());
    });
  },

  // Find by test ID
  findByTestId(testId) {
    const attr = Config.testIdAttribute;
    return Array.from(document.querySelectorAll(`[${attr}="${testId}"]`));
  },

  // Find by locator (CSS or XPath)
  findByLocator(selector) {
    try {
      // Handle XPath
      if (selector.startsWith('//') || selector.startsWith('(//')) {
        const result = document.evaluate(
          selector,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        const elements = [];
        for (let i = 0; i < result.snapshotLength; i++) {
          elements.push(result.snapshotItem(i));
        }
        return elements;
      }
      // Handle CSS
      return Array.from(document.querySelectorAll(selector));
    } catch (error) {
      return [];
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 3: STRATEGY GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

const StrategyGenerator = {
  generate(element) {
    const strategies = [];

    // Priority 1: getByRole (with name) - Playwright's top recommendation
    const role = element.getAttribute('role') || Utils.getImplicitRole(element);
    if (role) {
      const name = Utils.getAccessibleName(element);
      if (name) {
        // Only add getByRole if it has an accessible name
        strategies.push({
          type: 'role',
          role,
          options: { name },
          priority: 1,
          description: 'getByRole (Best Practice ⭐)'
        });
      }
    }

    // Priority 2: getByLabel - Recommended for form inputs
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      const labelText = Utils.getAccessibleName(element);
      if (labelText) {
        strategies.push({
          type: 'label',
          text: labelText,
          priority: 2,
          description: 'getByLabel (Recommended for Forms)'
        });
      }
    }

    // Priority 3: getByPlaceholder - For inputs with placeholder
    if (element.hasAttribute('placeholder')) {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) {
        strategies.push({
          type: 'placeholder',
          text: placeholder,
          priority: 3,
          description: 'getByPlaceholder'
        });
      }
    }

    // Priority 4: getByText - For elements with visible text
    const text = element.textContent.trim();
    if (text && text.length > 0 && text.length <= 50) {
      // Only add if element has direct text content
      const hasDirectText = Array.from(element.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      if (hasDirectText) {
        strategies.push({
          type: 'text',
          text,
          priority: 4,
          description: 'getByText'
        });
      }
    }

    // Priority 4: getByAltText - For images with alt text (from proven console script)
    if (element.hasAttribute('alt')) {
      const alt = element.getAttribute('alt');
      if (alt) {
        strategies.push({
          type: 'altText',
          text: alt,
          priority: 4,
          description: 'getByAltText (Image)'
        });
      }
    }

    // Priority 5: getByTitle - For elements with title attribute (from proven console script)
    if (element.hasAttribute('title')) {
      const title = element.getAttribute('title');
      if (title) {
        strategies.push({
          type: 'title',
          text: title,
          priority: 5,
          description: 'getByTitle'
        });
      }
    }

    // Priority 6: getByTestId - Stable but requires setup
    if (element.hasAttribute(Config.testIdAttribute)) {
      strategies.push({
        type: 'testId',
        testId: element.getAttribute(Config.testIdAttribute),
        priority: 6,
        description: 'getByTestId (Stable)'
      });
    }

    // Priority 9: CSS/XPath - Last resort (fragile)
    strategies.push({
      type: 'css',
      selector: Utils.generateCSSSelector(element),
      priority: 9,
      description: 'CSS Selector (Fragile ⚠️)'
    });

    return this.rankStrategies(strategies, element);
  },
  rankStrategies(strategies, targetElement) {
    const startTime = performance.now();
    const tested = strategies.map(strategy => {
      const result = this.testStrategy(strategy, targetElement);
      return {
        ...strategy,
        isUnique: result.count === 1 && result.elements[0] === targetElement,
        matchCount: result.count,
        elements: result.elements,
        isValid: result.elements.includes(targetElement),
        timing: result.timing
      };
    });
    tested.sort((a, b) => {
      if (a.isUnique && !b.isUnique) return -1;
      if (!a.isUnique && b.isUnique) return 1;
      if (a.isValid && !b.isValid) return -1;
      if (!a.isValid && b.isValid) return 1;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.matchCount - b.matchCount;
    });
    return { strategies: tested, totalTime: performance.now() - startTime };
  },
  testStrategy(strategy, targetElement) {
    const startTime = performance.now();
    let elements = [];
    try {
      switch (strategy.type) {
        case 'role': elements = LocatorEngine.findByRole(strategy.role, strategy.options); break;
        case 'label': elements = LocatorEngine.findByLabel(strategy.text, strategy.options || {}); break;
        case 'placeholder': elements = LocatorEngine.findByPlaceholder(strategy.text, strategy.options || {}); break;
        case 'text': elements = LocatorEngine.findByText(strategy.text, strategy.options || {}); break;
        case 'altText': elements = LocatorEngine.findByAltText(strategy.text, strategy.options || {}); break;
        case 'title': elements = LocatorEngine.findByTitle(strategy.text, strategy.options || {}); break;
        case 'testId': elements = LocatorEngine.findByTestId(strategy.testId); break;
        case 'css': elements = LocatorEngine.findByLocator(strategy.selector); break;
      }
    } catch (error) {}
    return { elements, count: elements.length, timing: (performance.now() - startTime).toFixed(2) };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 4: VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════

const Validator = {
  parse(code) {
    code = code.trim();
    const language = this.detectLanguage(code);
    try {
      switch (language) {
        case 'java': return this.parseJava(code);
        case 'python': return this.parsePython(code);
        case 'javascript': return this.parseJavaScript(code);
        case 'csharp': return this.parseCSharp(code);
        default: return { error: 'Could not detect language' };
      }
    } catch (error) {
      return { error: error.message };
    }
  },
  detectLanguage(code) {
    if (code.includes('GetByRole') || code.includes('GetByLabel') || code.includes('GetByText')) return 'csharp';
    if (code.includes('AriaRole.') || code.includes('new Page.')) return 'java';
    if (code.includes('get_by_')) return 'python';
    if (code.includes('getBy') || code.includes('{')) return 'javascript';
    return 'java';
  },
  parseJava(code) {
    let match = code.match(/getByRole\(AriaRole\.(\w+)(?:,\s*new\s+Page\.GetByRoleOptions\(\)\.setName\("([^"]*)"\))?\)/);
    if (match) return { type: 'role', role: match[1].toLowerCase(), options: match[2] ? { name: match[2] } : {} };
    match = code.match(/getByLabel\("([^"]*)"\)/);
    if (match) return { type: 'label', text: match[1] };
    match = code.match(/getByText\("([^"]*)"\)/);
    if (match) return { type: 'text', text: match[1] };
    match = code.match(/getByPlaceholder\("([^"]*)"\)/);
    if (match) return { type: 'placeholder', text: match[1] };
    match = code.match(/getByTestId\("([^"]*)"\)/);
    if (match) return { type: 'testId', testId: match[1] };
    match = code.match(/locator\("([^"]*)"\)/);
    if (match) return { type: 'css', selector: match[1] };
    throw new Error('Invalid Java syntax');
  },
  parsePython(code) {
    let match = code.match(/get_by_role\("(\w+)"(?:,\s*name="([^"]*)?")?/);
    if (match) return { type: 'role', role: match[1], options: match[2] ? { name: match[2] } : {} };
    match = code.match(/get_by_label\("([^"]*)"\)/);
    if (match) return { type: 'label', text: match[1] };
    match = code.match(/get_by_text\("([^"]*)"\)/);
    if (match) return { type: 'text', text: match[1] };
    match = code.match(/get_by_placeholder\("([^"]*)"\)/);
    if (match) return { type: 'placeholder', text: match[1] };
    match = code.match(/get_by_test_id\("([^"]*)"\)/);
    if (match) return { type: 'testId', testId: match[1] };
    match = code.match(/locator\("([^"]*)"\)/);
    if (match) return { type: 'css', selector: match[1] };
    throw new Error('Invalid Python syntax');
  },
  parseJavaScript(code) {
    let match = code.match(/getByRole\(['"]([\w]+)['"](?:,\s*\{\s*name:\s*['"]([^'"]*)['"]\s*\})?/);
    if (match) return { type: 'role', role: match[1], options: match[2] ? { name: match[2] } : {} };
    match = code.match(/getByLabel\(['"]([^'"]*)['"]\)/);
    if (match) return { type: 'label', text: match[1] };
    match = code.match(/getByText\(['"]([^'"]*)['"]\)/);
    if (match) return { type: 'text', text: match[1] };
    match = code.match(/getByPlaceholder\(['"]([^'"]*)['"]\)/);
    if (match) return { type: 'placeholder', text: match[1] };
    match = code.match(/getByTestId\(['"]([^'"]*)['"]\)/);
    if (match) return { type: 'testId', testId: match[1] };
    match = code.match(/locator\(['"]([^'"]*)['"]\)/);
    if (match) return { type: 'css', selector: match[1] };
    throw new Error('Invalid JavaScript syntax');
  },
  parseCSharp(code) {
    let match = code.match(/GetByRole\(AriaRole\.(\w+)(?:,\s*new\(\)\s*\{\s*Name\s*=\s*"([^"]*)"\s*\})?/);
    if (match) return { type: 'role', role: match[1].toLowerCase(), options: match[2] ? { name: match[2] } : {} };
    match = code.match(/GetByLabel\("([^"]*)"\)/);
    if (match) return { type: 'label', text: match[1] };
    match = code.match(/GetByText\("([^"]*)"\)/);
    if (match) return { type: 'text', text: match[1] };
    match = code.match(/GetByPlaceholder\("([^"]*)"\)/);
    if (match) return { type: 'placeholder', text: match[1] };
    match = code.match(/GetByTestId\("([^"]*)"\)/);
    if (match) return { type: 'testId', testId: match[1] };
    match = code.match(/Locator\("([^"]*)"\)/);
    if (match) return { type: 'css', selector: match[1] };
    throw new Error('Invalid C# syntax');
  },
  test(strategy) {
    const startTime = performance.now();
    let elements = [];
    try {
      switch (strategy.type) {
        case 'role': elements = LocatorEngine.findByRole(strategy.role, strategy.options); break;
        case 'label': elements = LocatorEngine.findByLabel(strategy.text, {}); break;
        case 'placeholder': elements = LocatorEngine.findByPlaceholder(strategy.text, {}); break;
        case 'text': elements = LocatorEngine.findByText(strategy.text, {}); break;
        case 'altText': elements = LocatorEngine.findByAltText(strategy.text, {}); break;
        case 'title': elements = LocatorEngine.findByTitle(strategy.text, {}); break;
        case 'testId': elements = LocatorEngine.findByTestId(strategy.testId); break;
        case 'css': elements = LocatorEngine.findByLocator(strategy.selector); break;
      }
    } catch (error) {
      return { error: error.message, elements: [], count: 0, timing: 0 };
    }
    return { elements, count: elements.length, timing: (performance.now() - startTime).toFixed(2), isUnique: elements.length === 1 };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 5: CODE FORMATTER
// ═══════════════════════════════════════════════════════════════════════════

const CodeFormatter = {
  format(strategy, language) {
    language = language || Config.language;
    switch (language.toLowerCase()) {
      case 'java': return this.formatJava(strategy);
      case 'python': return this.formatPython(strategy);
      case 'javascript': return this.formatJavaScript(strategy);
      case 'typescript': return this.formatJavaScript(strategy);
      case 'csharp': return this.formatCSharp(strategy);
      default: return this.formatJava(strategy);
    }
  },
  formatJava(strategy) {
    switch (strategy.type) {
      case 'role':
        const roleUpper = strategy.role.toUpperCase();
        if (strategy.options.name) {
          return `page.getByRole(AriaRole.${roleUpper}, new Page.GetByRoleOptions().setName("${Utils.escapeString(strategy.options.name)}"))`;
        }
        return `page.getByRole(AriaRole.${roleUpper})`;
      case 'label': return `page.getByLabel("${Utils.escapeString(strategy.text)}")`;
      case 'placeholder': return `page.getByPlaceholder("${Utils.escapeString(strategy.text)}")`;
      case 'text': return `page.getByText("${Utils.escapeString(strategy.text)}")`;
      case 'altText': return `page.getByAltText("${Utils.escapeString(strategy.text)}")`;
      case 'title': return `page.getByTitle("${Utils.escapeString(strategy.text)}")`;
      case 'testId': return `page.getByTestId("${Utils.escapeString(strategy.testId)}")`;
      case 'css': return `page.locator("${Utils.escapeString(strategy.selector)}")`;
      default: return 'page.locator("unknown")';
    }
  },
  formatPython(strategy) {
    switch (strategy.type) {
      case 'role':
        if (strategy.options.name) {
          return `page.get_by_role("${strategy.role}", name="${Utils.escapeString(strategy.options.name)}")`;
        }
        return `page.get_by_role("${strategy.role}")`;
      case 'label': return `page.get_by_label("${Utils.escapeString(strategy.text)}")`;
      case 'placeholder': return `page.get_by_placeholder("${Utils.escapeString(strategy.text)}")`;
      case 'text': return `page.get_by_text("${Utils.escapeString(strategy.text)}")`;
      case 'altText': return `page.get_by_alt_text("${Utils.escapeString(strategy.text)}")`;
      case 'title': return `page.get_by_title("${Utils.escapeString(strategy.text)}")`;
      case 'testId': return `page.get_by_test_id("${Utils.escapeString(strategy.testId)}")`;
      case 'css': return `page.locator("${Utils.escapeString(strategy.selector)}")`;
      default: return 'page.locator("unknown")';
    }
  },
  formatJavaScript(strategy) {
    switch (strategy.type) {
      case 'role':
        if (strategy.options.name) {
          return `page.getByRole('${strategy.role}', { name: '${Utils.escapeString(strategy.options.name)}' })`;
        }
        return `page.getByRole('${strategy.role}')`;
      case 'label': return `page.getByLabel('${Utils.escapeString(strategy.text)}')`;
      case 'placeholder': return `page.getByPlaceholder('${Utils.escapeString(strategy.text)}')`;
      case 'text': return `page.getByText('${Utils.escapeString(strategy.text)}')`;
      case 'altText': return `page.getByAltText('${Utils.escapeString(strategy.text)}')`;
      case 'title': return `page.getByTitle('${Utils.escapeString(strategy.text)}')`;
      case 'testId': return `page.getByTestId('${Utils.escapeString(strategy.testId)}')`;
      case 'css': return `page.locator('${Utils.escapeString(strategy.selector)}')`;
      default: return "page.locator('unknown')";
    }
  },
  formatCSharp(strategy) {
    switch (strategy.type) {
      case 'role':
        const roleCapital = strategy.role.charAt(0).toUpperCase() + strategy.role.slice(1);
        if (strategy.options.name) {
          return `page.GetByRole(AriaRole.${roleCapital}, new() { Name = "${Utils.escapeString(strategy.options.name)}" })`;
        }
        return `page.GetByRole(AriaRole.${roleCapital})`;
      case 'label': return `page.GetByLabel("${Utils.escapeString(strategy.text)}")`;
      case 'placeholder': return `page.GetByPlaceholder("${Utils.escapeString(strategy.text)}")`;
      case 'text': return `page.GetByText("${Utils.escapeString(strategy.text)}")`;
      case 'altText': return `page.GetByAltText("${Utils.escapeString(strategy.text)}")`;
      case 'title': return `page.GetByTitle("${Utils.escapeString(strategy.text)}")`;
      case 'testId': return `page.GetByTestId("${Utils.escapeString(strategy.testId)}")`;
      case 'css': return `page.Locator("${Utils.escapeString(strategy.selector)}")`;
      default: return 'page.Locator("unknown")';
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 6: HIGHLIGHTER
// ═══════════════════════════════════════════════════════════════════════════

const Highlighter = {
  highlights: new Map(),
  highlightElements(elements, color) {
    this.clearAll();
    elements.forEach((el, index) => this.highlightElement(el, color, index));
    if (Config.autoHighlight && Config.highlightDuration > 0) {
      setTimeout(() => this.clearAll(), Config.highlightDuration);
    }
  },
  highlightElement(element, color, index) {
    if (!element) return;
    const originalOutline = element.style.outline;
    element.style.outline = `3px solid ${color}`;
    element.style.outlineOffset = '2px';
    const badge = this.createBadge(element, index, color);
    this.highlights.set(element, { originalOutline, badge });
  },
  createBadge(element, index, color) {
    const badge = document.createElement('div');
    badge.className = 'pwlp-badge';
    badge.textContent = `[${index}]`;
    badge.style.cssText = `position:fixed;background:${color};color:#000;padding:4px 8px;font-size:11px;font-weight:700;font-family:monospace;z-index:2147483646;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer`;
    const rect = element.getBoundingClientRect();
    badge.style.top = `${rect.top + window.scrollY - 24}px`;
    badge.style.left = `${rect.left + window.scrollX}px`;
    badge.onclick = () => {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.flashElement(element);
    };
    document.body.appendChild(badge);
    return badge;
  },
  flashElement(element) {
    const original = element.style.outline;
    let count = 0;
    const interval = setInterval(() => {
      element.style.outline = count % 2 === 0 ? '5px solid #FFD700' : original;
      count++;
      if (count > 6) {
        clearInterval(interval);
        element.style.outline = original;
      }
    }, 200);
  },
  clearAll() {
    this.highlights.forEach((data, element) => {
      element.style.outline = data.originalOutline;
      if (data.badge && data.badge.parentNode) data.badge.remove();
    });
    this.highlights.clear();
    document.querySelectorAll('.pwlp-badge').forEach(badge => badge.remove());
  },
  hoverHighlight(element, color) {
    if (!element) return;
    element.style.outline = `3px solid ${color}`;
    element.setAttribute('data-pwlp-hover', 'true');
  },
  clearHover() {
    document.querySelectorAll('[data-pwlp-hover]').forEach(el => {
      el.style.outline = '';
      el.removeAttribute('data-pwlp-hover');
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 7: STORAGE MANAGER
// ═══════════════════════════════════════════════════════════════════════════

const Storage = {
  history: [],
  favorites: [],
  loadHistory() {
    chrome.storage.local.get(['history'], (result) => {
      if (result.history) this.history = result.history;
    });
  },
  saveHistory() {
    chrome.storage.local.set({ history: this.history.slice(0, Config.maxHistory) });
  },
  addToHistory(entry) {
    this.history.unshift({ ...entry, timestamp: Date.now() });
    this.history = this.history.slice(0, Config.maxHistory);
    this.saveHistory();
  },
  loadFavorites() {
    chrome.storage.local.get(['favorites'], (result) => {
      if (result.favorites) this.favorites = result.favorites;
    });
  },
  saveFavorites() {
    chrome.storage.local.set({ favorites: this.favorites });
  },
  addToFavorites(entry) {
    const exists = this.favorites.find(f => f.code === entry.code);
    if (!exists) {
      this.favorites.unshift({ ...entry, id: Date.now(), timestamp: Date.now() });
      this.saveFavorites();
      Notifications.show('Added to favorites', 'success');
    }
  },
  removeFromFavorites(id) {
    this.favorites = this.favorites.filter(f => f.id !== id);
    this.saveFavorites();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 8: NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

const Notifications = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'pwlp-notifications';
    this.container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:2147483647;pointer-events:none';
    document.body.appendChild(this.container);
  },
  show(message, type = 'info', duration = 3000) {
    this.init();
    const theme = Utils.getCurrentTheme();
    const colors = { success: theme.success, error: theme.error, warning: theme.warning, info: theme.primary };
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.style.cssText = `background:${colors[type]};color:#FFF;padding:12px 20px;border-radius:6px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-family:system-ui;font-size:14px;display:flex;align-items:center;gap:10px;pointer-events:all;animation:pwlpSlideIn 0.3s ease-out`;
    toast.innerHTML = `<span>${icons[type]}</span><span>${Utils.escapeHtml(message)}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'pwlpSlideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 9: UI PANEL
// ═══════════════════════════════════════════════════════════════════════════

const UIPanel = {
  panel: null,
  currentElement: null,
  currentStrategies: null,
  init() {
    if (this.panel) return;
    this.createPanel();
    this.attachEventListeners();
    this.injectStyles();
  },
  createPanel() {
    const theme = Utils.getCurrentTheme();
    this.panel = document.createElement('div');
    this.panel.id = 'pwlp-panel';
    this.panel.style.cssText = `position:fixed;top:20px;right:20px;width:480px;max-height:85vh;background:${theme.background};border:2px solid ${theme.border};border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.15);z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:${theme.text};overflow:hidden;display:none;flex-direction:column`;
    this.panel.innerHTML = `
      <div id="pwlp-header" style="padding:16px 20px;background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);border-bottom:none;display:flex;justify-content:space-between;align-items:center;cursor:move">
        <span style="font-weight:600;font-size:15px;color:#ffffff">🎭 Playwright Locator Pro</span>
        <button id="pwlp-close" style="background:rgba(255,255,255,0.2);border:none;color:#ffffff;cursor:pointer;font-size:20px;padding:4px;width:28px;height:28px;border-radius:6px;transition:all 0.2s">×</button>
      </div>
      <div id="pwlp-tabs" style="display:flex;background:${theme.background};border-bottom:2px solid ${theme.border};padding:0 12px">
        <button class="pwlp-tab active" data-tab="generate" style="flex:1;padding:14px 12px;background:none;border:none;color:${theme.primary};cursor:pointer;border-bottom:3px solid ${theme.primary};font-weight:600;margin-bottom:-2px;transition:all 0.2s">Generate</button>
        <button class="pwlp-tab" data-tab="validate" style="flex:1;padding:14px 12px;background:none;border:none;color:${theme.textDim};cursor:pointer;border-bottom:3px solid transparent;font-weight:600;margin-bottom:-2px;transition:all 0.2s">Validate</button>
        <button class="pwlp-tab" data-tab="history" style="flex:1;padding:14px 12px;background:none;border:none;color:${theme.textDim};cursor:pointer;border-bottom:3px solid transparent;font-weight:600;margin-bottom:-2px;transition:all 0.2s">History</button>
      </div>
      <div id="pwlp-content" style="flex:1;overflow-y:auto;padding:20px;background:${theme.panel}"></div>
    `;
    document.body.appendChild(this.panel);
    this.makeDraggable();
  },
  attachEventListeners() {
    this.panel.querySelector('#pwlp-close').addEventListener('click', () => this.hide());
    this.panel.querySelectorAll('.pwlp-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
  },
  makeDraggable() {
    const header = this.panel.querySelector('#pwlp-header');
    let isDragging = false, startX, startY, startLeft, startTop;
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      this.panel.style.left = `${startLeft + dx}px`;
      this.panel.style.top = `${startTop + dy}px`;
      this.panel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => isDragging = false);
  },
  show() {
    this.panel.style.display = 'flex';
  },
  hide() {
    this.panel.style.display = 'none';
    Highlighter.clearAll();
  },
  switchTab(tabName) {
    const theme = Utils.getCurrentTheme();
    this.panel.querySelectorAll('.pwlp-tab').forEach(tab => {
      const isActive = tab.dataset.tab === tabName;
      tab.classList.toggle('active', isActive);
      tab.style.borderBottomColor = isActive ? theme.primary : 'transparent';
      tab.style.color = isActive ? theme.primary : theme.textDim;
      tab.style.fontWeight = isActive ? '600' : '600';
    });
    switch (tabName) {
      case 'generate': this.renderGenerateTab(); break;
      case 'validate': this.renderValidateTab(); break;
      case 'history': this.renderHistoryTab(); break;
    }
  },
  renderGenerateTab() {
    const content = this.panel.querySelector('#pwlp-content');
    if (!this.currentStrategies) {
      content.innerHTML = `
        <div style="text-align:center;padding:60px 30px">
          <div style="font-size:48px;margin-bottom:16px">🎯</div>
          <div style="font-size:16px;font-weight:600;color:#374151;margin-bottom:8px">Ready to Generate Locators</div>
          <div style="font-size:13px;color:#6b7280;line-height:1.6;max-width:320px;margin:0 auto">
            Click on any element on the webpage to generate Playwright locators following best practices
          </div>
          <div style="margin-top:24px;padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:12px;color:#0369a1;text-align:left">
            <div style="font-weight:600;margin-bottom:4px">💡 Tip:</div>
            <div>Locators are ranked by Playwright recommendations:<br/>getByRole > getByLabel > getByPlaceholder > getByText</div>
          </div>
        </div>
      `;
      return;
    }
    const theme = Utils.getCurrentTheme();
    const { strategies, totalTime } = this.currentStrategies;
    const best = strategies[0];

    // Get element info
    const elementInfo = this.currentElement ? `<${this.currentElement.tagName.toLowerCase()}>` : 'Element';

    content.innerHTML = `
      <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:2px solid #bae6fd;border-radius:12px;padding:16px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:13px;font-weight:700;color:#0369a1;margin-bottom:4px">✨ Recommended Locator</div>
            <div style="font-size:11px;color:#0c4a6e">${best.description}</div>
          </div>
          ${this.renderStatusBadge(best)}
        </div>
        <code style="display:block;background:${theme.background};padding:12px;border-radius:8px;font-size:13px;word-break:break-all;margin-bottom:12px;border:1px solid #bae6fd;font-weight:500">${Utils.escapeHtml(CodeFormatter.format(best))}</code>
        <div style="display:flex;gap:8px">
          <button class="pwlp-copy-btn" data-code="${Utils.escapeHtml(CodeFormatter.format(best))}" style="flex:1;padding:10px;background:${theme.primary};color:#FFF;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s">📋 Copy</button>
          <button class="pwlp-test-btn" data-index="0" style="flex:1;padding:10px;background:${theme.background};color:${theme.text};border:2px solid ${theme.border};border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s">🧪 Test (${best.matchCount})</button>
        </div>
      </div>
      <div>
        <div style="font-weight:600;margin-bottom:12px;color:#374151;display:flex;justify-content:space-between;align-items:center">
          <span>Alternative Locators (${strategies.length - 1})</span>
          <span style="font-size:11px;color:${theme.textDim};font-weight:normal">Generated in ${totalTime.toFixed(2)}ms</span>
        </div>
        ${strategies.slice(1).map((s, i) => `
          <div style="background:${theme.background};border:1px solid ${theme.border};border-radius:6px;padding:10px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
              <span style="font-size:11px;color:${theme.textDim}">${s.description}</span>
              ${this.renderStatusBadge(s)}
            </div>
            <code style="display:block;background:${theme.panel};padding:6px;border-radius:4px;font-size:11px;word-break:break-all;margin-bottom:6px">${Utils.escapeHtml(CodeFormatter.format(s))}</code>
            <div style="display:flex;gap:6px">
              <button class="pwlp-copy-btn" data-code="${Utils.escapeHtml(CodeFormatter.format(s))}" style="flex:1;padding:4px;background:${theme.background};color:${theme.text};border:1px solid ${theme.border};border-radius:4px;cursor:pointer;font-size:11px">Copy</button>
              <button class="pwlp-test-btn" data-index="${i + 1}" style="flex:1;padding:4px;background:${theme.background};color:${theme.text};border:1px solid ${theme.border};border-radius:4px;cursor:pointer;font-size:11px">Test (${s.matchCount})</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    content.querySelectorAll('.pwlp-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => Utils.copyToClipboard(btn.dataset.code));
    });
    content.querySelectorAll('.pwlp-test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const strategy = strategies[parseInt(btn.dataset.index)];
        const result = Validator.test(strategy);
        Highlighter.highlightElements(result.elements, theme.success);
        Notifications.show(`Found ${result.count} element(s)`, result.count === 1 ? 'success' : 'warning');
      });
    });
  },
  renderValidateTab() {
    const content = this.panel.querySelector('#pwlp-content');
    const theme = Utils.getCurrentTheme();
    content.innerHTML = `
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <label style="font-weight:600;color:#374151">Paste Your Playwright Locator</label>
          <span style="font-size:11px;color:${theme.textDim}">All languages supported</span>
        </div>
        <textarea id="pwlp-validate-input" placeholder="Example:
page.getByLabel(&quot;Username&quot;)
page.getByRole(&quot;button&quot;, { name: &quot;Login&quot; })
page.get_by_placeholder(&quot;Email&quot;)
page.locator(&quot;#submit-btn&quot;)" style="width:100%;height:140px;background:${theme.background};border:2px solid ${theme.border};border-radius:8px;padding:14px;color:${theme.text};font-family:'Courier New', monospace;font-size:13px;resize:vertical;line-height:1.6;transition:all 0.2s" onfocus="this.style.borderColor='${theme.primary}';this.style.boxShadow='0 0 0 3px rgba(99, 102, 241, 0.1)'" onblur="this.style.borderColor='${theme.border}';this.style.boxShadow='none'"></textarea>
        <div style="margin-top:8px;font-size:11px;color:${theme.textDim}">
          💡 Tip: Supports Java, Python, JavaScript, TypeScript, and C#
        </div>
      </div>
      <button id="pwlp-validate-btn" style="width:100%;padding:14px;background:${theme.primary};color:#FFF;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;margin-bottom:20px;transition:all 0.2s;box-shadow:0 2px 8px rgba(99, 102, 241, 0.3)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 12px rgba(99, 102, 241, 0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 8px rgba(99, 102, 241, 0.3)'">🧪 Validate & Highlight</button>
      <div id="pwlp-validate-results"></div>
    `;
    const validateBtn = content.querySelector('#pwlp-validate-btn');
    const input = content.querySelector('#pwlp-validate-input');
    const results = content.querySelector('#pwlp-validate-results');
    validateBtn.addEventListener('click', () => {
      const code = input.value.trim();
      if (!code) {
        Notifications.show('Please enter code', 'warning');
        return;
      }
      const parsed = Validator.parse(code);
      if (parsed.error) {
        results.innerHTML = `<div style="background:${theme.error};color:#FFF;padding:12px;border-radius:6px">❌ ${parsed.error}</div>`;
        return;
      }
      const testResult = Validator.test(parsed);
      Highlighter.highlightElements(testResult.elements, theme.success);
      const status = testResult.count === 0 ? 'error' : testResult.count === 1 ? 'success' : 'warning';
      const statusColors = { error: '#fef2f2', success: '#f0fdf4', warning: '#fffbeb' };
      const textColors = { error: theme.error, success: theme.success, warning: theme.warning };
      const icons = { error: '❌', success: '✅', warning: '⚠️' };
      const titles = {
        error: 'No Elements Found',
        success: 'Perfect! Unique Match',
        warning: `Multiple Matches Found (${testResult.count})`
      };
      const messages = {
        error: 'This locator doesn\'t match any elements on the page. Check your selector or try a different strategy.',
        success: 'This locator uniquely identifies one element. Perfect for automation!',
        warning: `This locator matches ${testResult.count} elements. Consider making it more specific to avoid flaky tests.`
      };

      results.innerHTML = `
        <div style="background:${statusColors[status]};border:2px solid ${textColors[status]};padding:20px;border-radius:12px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="font-size:32px">${icons[status]}</div>
            <div style="flex:1">
              <div style="font-size:16px;font-weight:700;color:${textColors[status]};margin-bottom:4px">${titles[status]}</div>
              <div style="font-size:12px;color:#374151;line-height:1.5">${messages[status]}</div>
            </div>
          </div>
          <div style="display:flex;gap:12px;padding-top:12px;border-top:1px solid ${textColors[status]};opacity:0.6">
            <div style="font-size:11px;color:#374151">
              <span style="font-weight:600">Execution Time:</span> ${testResult.timing}ms
            </div>
            ${testResult.count > 0 ? `<div style="font-size:11px;color:#374151">
              <span style="font-weight:600">Elements:</span> ${testResult.count} found
            </div>` : ''}
          </div>
        </div>
      `;
      Notifications.show(`Found ${testResult.count} element(s)`, status);
    });
  },
  renderHistoryTab() {
    const content = this.panel.querySelector('#pwlp-content');
    const theme = Utils.getCurrentTheme();
    if (Storage.history.length === 0) {
      content.innerHTML = '<div style="text-align:center;color:#858585;padding:40px 20px">No history yet</div>';
      return;
    }
    content.innerHTML = `
      <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600">Recent Locators (${Storage.history.length})</span>
        <button id="pwlp-clear-history" style="padding:6px 12px;background:${theme.error};color:#FFF;border:none;border-radius:4px;cursor:pointer;font-size:11px">Clear All</button>
      </div>
      ${Storage.history.map((entry, i) => `
        <div style="background:${theme.background};border:1px solid ${theme.border};border-radius:6px;padding:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px">
            <span style="font-size:11px;color:${theme.textDim}">${Utils.formatTimestamp(entry.timestamp)}</span>
          </div>
          <code style="display:block;background:${theme.panel};padding:6px;border-radius:4px;font-size:11px;word-break:break-all;margin-bottom:6px">${Utils.escapeHtml(entry.code)}</code>
          <button class="pwlp-copy-btn" data-code="${Utils.escapeHtml(entry.code)}" style="width:100%;padding:4px;background:${theme.background};color:${theme.text};border:1px solid ${theme.border};border-radius:4px;cursor:pointer;font-size:11px">Copy</button>
        </div>
      `).join('')}
    `;
    content.querySelector('#pwlp-clear-history').addEventListener('click', () => {
      Storage.history = [];
      Storage.saveHistory();
      this.renderHistoryTab();
      Notifications.show('History cleared', 'success');
    });
    content.querySelectorAll('.pwlp-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => Utils.copyToClipboard(btn.dataset.code));
    });
  },
  renderStatusBadge(strategy) {
    const theme = Utils.getCurrentTheme();
    if (strategy.isUnique) {
      return `<span style="background:${theme.success};color:#FFF;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">✓ UNIQUE</span>`;
    }
    if (!strategy.isValid) {
      return `<span style="background:${theme.error};color:#FFF;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">✕ NO MATCH</span>`;
    }
    return `<span style="background:${theme.warning};color:#000;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600">${strategy.matchCount} MATCHES</span>`;
  },
  injectStyles() {
    if (document.getElementById('pwlp-styles')) return;
    const style = document.createElement('style');
    style.id = 'pwlp-styles';
    style.textContent = `
      @keyframes pwlpSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes pwlpSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      #pwlp-panel::-webkit-scrollbar { width: 8px; }
      #pwlp-panel::-webkit-scrollbar-track { background: #1E1E1E; }
      #pwlp-panel::-webkit-scrollbar-thumb { background: #3E3E42; border-radius: 4px; }
      #pwlp-panel::-webkit-scrollbar-thumb:hover { background: #4E4E52; }
      #pwlp-content::-webkit-scrollbar { width: 8px; }
      #pwlp-content::-webkit-scrollbar-track { background: #252526; }
      #pwlp-content::-webkit-scrollbar-thumb { background: #3E3E42; border-radius: 4px; }
      .pwlp-tab:hover { background: rgba(255,255,255,0.05); }
      button:hover { opacity: 0.9; }
    `;
    document.head.appendChild(style);
  },
  showForElement(element) {
    this.currentElement = element;
    const result = StrategyGenerator.generate(element);
    this.currentStrategies = result;
    const best = result.strategies[0];
    const code = CodeFormatter.format(best);
    Storage.addToHistory({ code, type: best.type, element: element.tagName });
    this.show();
    this.switchTab('generate');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 10: INSPECTOR MODE
// ═══════════════════════════════════════════════════════════════════════════

const Inspector = {
  isActive: false,
  overlay: null,
  init() {
    this.createOverlay();
    document.addEventListener('mouseover', this.handleMouseOver.bind(this));
    document.addEventListener('mouseout', this.handleMouseOut.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  },
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'pwlp-overlay';
    this.overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:2147483645;display:none;pointer-events:none';
    document.body.appendChild(this.overlay);
  },
  activate() {
    console.log('[Inspector] Activating inspector mode...');
    this.isActive = true;
    this.overlay.style.display = 'block';
    document.body.style.cursor = 'crosshair';
    Notifications.show('Inspector Mode Active (ESC to exit)', 'info');
    console.log('[Inspector] Inspector mode activated. Cursor should be crosshair now.');
  },
  deactivate() {
    this.isActive = false;
    this.overlay.style.display = 'none';
    document.body.style.cursor = '';
    Highlighter.clearHover();
  },
  handleMouseOver(e) {
    if (!this.isActive || e.target.closest('#pwlp-panel, #pwlp-notifications')) return;
    e.stopPropagation();
    Highlighter.hoverHighlight(e.target, Utils.getCurrentTheme().hover);
  },
  handleMouseOut(e) {
    if (!this.isActive) return;
    Highlighter.clearHover();
  },
  handleClick(e) {
    if (!this.isActive) return;
    if (e.target.closest('#pwlp-panel, #pwlp-notifications')) return;
    e.preventDefault();
    e.stopPropagation();
    const element = e.target;
    this.deactivate();
    Highlighter.clearHover();
    Highlighter.highlightElement(element, Utils.getCurrentTheme().highlight, 0);

    // Generate strategies for the element
    const result = StrategyGenerator.generate(element);

    // Send element data to DevTools panel
    chrome.runtime.sendMessage({
      action: 'elementSelected',
      element: {
        tagName: element.tagName,
        className: element.className || '',
        id: element.id || ''
      },
      strategies: result
    });

    // Don't show the content script UI panel when used from DevTools
    // UIPanel.showForElement(element);
  },
  handleKeyDown(e) {
    if (e.key === 'Escape' && this.isActive) {
      this.deactivate();
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 11: MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Content Script] Received message:', message, 'from:', sender);

  switch (message.action) {
    case 'activate':
      console.log('[Content Script] Activating inspector...');
      Inspector.activate();
      sendResponse({ success: true });
      break;
    case 'deactivate':
      console.log('[Content Script] Deactivating inspector...');
      Inspector.deactivate();
      sendResponse({ success: true });
      break;
    case 'getStatus':
      sendResponse({ isActive: Inspector.isActive, active: Inspector.isActive, mode: Inspector.isActive ? 'generate' : null });
      break;
    case 'startGenerate':
      if (message.language) Config.language = message.language;
      Inspector.activate();
      sendResponse({ success: true, active: true, mode: 'generate' });
      break;
    case 'startValidate':
      if (message.language) Config.language = message.language;
      UIPanel.show();
      UIPanel.switchTab('validate');
      sendResponse({ success: true, active: true, mode: 'validate' });
      break;
    case 'setLanguage':
      if (message.language) Config.language = message.language;
      sendResponse({ success: true });
      break;
    case 'validateLocator':
      console.log('[Content Script] Validating locator:', message.code);
      try {
        const parsed = Validator.parse(message.code);
        if (parsed.error) {
          sendResponse({ success: false, error: parsed.error });
          break;
        }
        const result = Validator.test(parsed);

        // Highlight elements
        if (result.elements && result.elements.length > 0) {
          Highlighter.highlightElements(result.elements, '#4ec9b0');
        }

        sendResponse({
          success: true,
          count: result.count,
          timing: result.timing,
          isUnique: result.isUnique
        });
      } catch (error) {
        console.error('[Content Script] Validation error:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;
    case 'showHistory':
      UIPanel.show();
      UIPanel.switchTab('history');
      sendResponse({ success: true });
      break;
    case 'showFavorites':
      UIPanel.show();
      UIPanel.switchTab('history');
      Notifications.show('Favorites feature coming soon', 'info');
      sendResponse({ success: true });
      break;
    case 'showSettings':
      UIPanel.show();
      Notifications.show('Settings feature coming soon', 'info');
      sendResponse({ success: true });
      break;
    case 'showHelp':
      UIPanel.show();
      Notifications.show('Press ESC to exit inspector mode. Click elements to generate locators.', 'info');
      sendResponse({ success: true });
      break;
    case 'stop':
      Inspector.deactivate();
      UIPanel.hide();
      sendResponse({ success: true });
      break;
  }
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

(() => {
  if (window.pwlpInitialized) return;
  window.pwlpInitialized = true;
  Storage.loadHistory();
  Storage.loadFavorites();
  UIPanel.init();
  Inspector.init();
  console.log('🎭 Playwright Locator Inspector initialized');
})();