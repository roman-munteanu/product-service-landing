// Translation system
let currentLocale = 'en-US';
let translations = {};

// DOM elements with data-i18n-key attribute will be translated
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with browser language or default
    const browserLang = navigator.language || navigator.userLanguage;
    const supportedLangs = ['en-US', 'ru-RU', 'ro-RO'];
    const defaultLang = supportedLangs.includes(browserLang) ? browserLang : 'en-US';
    
    // Initialize language switcher
    initLanguageSwitcher(defaultLang);
    
    // Load translations for default language
    setLocale(defaultLang);
});

// Initialize language switcher
function initLanguageSwitcher(defaultLang) {
    const langSwitcher = document.getElementById('languageSwitcher');
    if (langSwitcher) {
        langSwitcher.value = defaultLang;
        langSwitcher.addEventListener('change', (e) => {
            setLocale(e.target.value);
        });
    }
}

// Set locale and translate page
async function setLocale(newLocale) {
    if (newLocale === currentLocale) return;
    
    try {
        // Show loading state
        document.documentElement.classList.add('translating');
        
        // Load translations
        translations = await fetchTranslationsFor(newLocale);
        currentLocale = newLocale;
        
        // Update language switcher
        const langSwitcher = document.getElementById('languageSwitcher');
        if (langSwitcher) {
            langSwitcher.value = newLocale;
        }
        
        // Translate page
        translatePage();
        
        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', newLocale);
        
        // Save preference
        localStorage.setItem('preferred-locale', newLocale);
        
        // Handle RTL if needed (for future languages like Arabic)
        toggleRTL(newLocale);
    } catch (error) {
        console.error('Error loading translations:', error);
    } finally {
        document.documentElement.classList.remove('translating');
    }
}

// Fetch translations from JSON files
async function fetchTranslationsFor(locale) {
    const response = await fetch(`${locale}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
    }
    return await response.json();
}

// Translate the entire page
function translatePage() {
    // Translate all elements with data-i18n-key attribute
    document.querySelectorAll('[data-i18n-key]').forEach(translateElement);
    
    // Translate placeholder elements if any
    document.querySelectorAll('[data-i18n-ph]').forEach(element => {
        const key = element.getAttribute('data-i18n-ph');
        if (translations[key]) {
            element.setAttribute('placeholder', translations[key]);
        }
    });
    
    // Translate alt attributes if any
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (translations[key]) {
            element.setAttribute('alt', translations[key]);
        }
    });
}

// Translate a single element
function translateElement(element) {
    const key = element.getAttribute('data-i18n-key');
    if (!translations[key]) {
        console.warn(`Missing translation for key: ${key}`);
        return;
    }
    
    const translation = translations[key];
    
    // Handle different element types
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.value = translation;
    } else if (element.hasAttribute('data-i18n-html')) {
        element.innerHTML = translation;
    } else {
        element.textContent = translation;
    }
}

// Handle RTL languages if needed
function toggleRTL(locale) {
    if (locale === 'ar') { // Example for Arabic (not in current supported languages)
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.classList.add('rtl');
    } else {
        document.documentElement.removeAttribute('dir');
        document.documentElement.classList.remove('rtl');
    }
}

// Check for saved language preference
function checkSavedPreference() {
    const savedLocale = localStorage.getItem('preferred-locale');
    if (savedLocale && savedLocale !== currentLocale) {
        setLocale(savedLocale);
    }
}

// Initialize on load
window.addEventListener('load', checkSavedPreference);
