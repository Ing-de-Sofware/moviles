// Chatbox functionality
const chatButton = document.getElementById('chatButton');
const chatBox = document.getElementById('chatBox');
const closeChat = document.getElementById('closeChat');

if (chatButton && chatBox && closeChat) {
    chatButton.addEventListener('click', () => {
        chatBox.classList.toggle('show');
        chatButton.setAttribute('aria-expanded', chatBox.classList.contains('show'));
    });

    closeChat.addEventListener('click', () => {
        chatBox.classList.remove('show');
        chatButton.setAttribute('aria-expanded', 'false');
    });
}

// Language Switcher Functionality
const languageSwitcherButton = document.getElementById("languageSwitcher");
const supportedLanguages = ["en_US", "es_419"];
let currentLanguage = localStorage.getItem("language") || "en_US";

async function loadLanguage(lang) {
    if (!supportedLanguages.includes(lang)) {
        console.error(`Unsupported language: ${lang}`);
        return;
    }
    try {
        const response = await fetch(`i18n/${lang}.json`);
        if (!response.ok) {
            console.error(`Failed to load translation file for ${lang}: ${response.statusText}`);
            return;
        }
        const translations = await response.json();

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.getAttribute("data-i18n");
            const translation = translations[key];

            if (translation !== undefined) { // Check if translation exists
                // Preserve interactive elements or icons within the translated element
                let interactiveElements = [];
                if (element.children.length > 0) {
                    // Specifically look for Materialize icons (<i> tags)
                    const icons = element.querySelectorAll("i.material-icons");
                    icons.forEach(icon => interactiveElements.push(icon.cloneNode(true)));
                }

                if (interactiveElements.length > 0 && element.childNodes.length > interactiveElements.length) {
                     // If there's text along with icons, translate carefully
                    let textContent = "";
                    element.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            textContent += node.textContent.trim() + " ";
                        }
                    });
                    // Attempt to find a key for the text content if it's simple
                    // This part might need refinement based on actual content structure
                    if (translations[key]) {
                         element.textContent = translations[key]; // Basic replacement
                         interactiveElements.forEach(icon => element.prepend(icon)); // Prepend icons back
                    } else {
                        // Fallback if specific text key isn't found, or handle more complex structures
                        element.innerHTML = translations[key] || element.innerHTML; // Default to key or keep original
                        interactiveElements.forEach(icon => { // Ensure icons are not lost
                            if (!element.contains(icon)) element.prepend(icon);
                        });
                    }
                } else if (element.children.length === 0 || (interactiveElements.length > 0 && element.childNodes.length === interactiveElements.length) ) {
                    // Element has no children or only icon children
                    element.textContent = translation;
                     interactiveElements.forEach(icon => element.prepend(icon)); // Prepend icons back
                } else {
                     // Element has other children, do not translate directly to avoid breaking HTML structure
                    console.warn(`⚠️ Content for [data-i18n="${key}"] not translated directly due to complex child elements. Ensure all translatable text is in its own element or handled separately.`);
                }

            } else if (key) { // Key exists but no translation
                console.warn(`Missing translation for key: ${key} in ${lang}.json`);
            }
        });

        document.documentElement.lang = lang.replace("_", "-"); // Update HTML lang attribute

        if (languageSwitcherButton) {
            if (lang === "en_US") {
                languageSwitcherButton.textContent = "Español (Latinoamérica)";
                languageSwitcherButton.setAttribute("aria-label", "Switch language to Spanish (Latin America)");
            } else {
                languageSwitcherButton.textContent = "English (US)";
                languageSwitcherButton.setAttribute("aria-label", "Switch language to English (US)");
            }
        }
        localStorage.setItem("language", lang);
    } catch (error) {
        console.error(`❌ Error loading translation for ${lang}:`, error);
    }
}

if (languageSwitcherButton) {
    languageSwitcherButton.addEventListener("click", () => {
        currentLanguage = currentLanguage === "en_US" ? "es_419" : "en_US";
        loadLanguage(currentLanguage);
    });
}

// Initialize Materialize components and load language
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Sidenav
    const sidenavElems = document.querySelectorAll(".sidenav");
    const sidenavInstances = M.Sidenav.init(sidenavElems);

    // Manage ARIA attributes for sidenav trigger
    const sidenavTrigger = document.querySelector(".sidenav-trigger");
    if (sidenavTrigger && sidenavInstances.length > 0) {
        const mainSidenavInstance = sidenavInstances[0]; // Assuming one main sidenav

        // Function to update aria-expanded based on sidenav state
        const updateSidenavAria = () => {
            sidenavTrigger.setAttribute('aria-expanded', mainSidenavInstance.isOpen);
        };

        // Override open and close methods to update ARIA
        const originalOpen = mainSidenavInstance.open;
        mainSidenavInstance.open = function() {
            originalOpen.call(this);
            updateSidenavAria();
        };

        const originalClose = mainSidenavInstance.close;
        mainSidenavInstance.close = function() {
            originalClose.call(this);
            updateSidenavAria();
        };

        // Initial state
        updateSidenavAria();
    }

    // Load initial language
    loadLanguage(currentLanguage);

    // Language selector in the header
    const headerLanguageSelector = document.getElementById('headerLanguageSelector');
    if (headerLanguageSelector) {
        headerLanguageSelector.value = currentLanguage; // Set initial value based on loaded language
        headerLanguageSelector.addEventListener('change', (event) => {
            currentLanguage = event.target.value;
            loadLanguage(currentLanguage);
            // If navbar language switcher exists, update its text (optional, as loadLanguage handles main button)
             if (languageSwitcherButton) {
                if (currentLanguage === "en_US") {
                    languageSwitcherButton.textContent = "Español (Latinoamérica)";
                } else {
                    languageSwitcherButton.textContent = "English (US)";
                }
            }
        });
    }

    // Update header selector when navbar button is clicked
    if (languageSwitcherButton && headerLanguageSelector) {
        const observer = new MutationObserver(() => {
            // currentLanguage is updated by the loadLanguage function called by the button
            if (headerLanguageSelector.value !== currentLanguage) {
                headerLanguageSelector.value = currentLanguage;
            }
        });
        observer.observe(languageSwitcherButton, { childList: true, characterData: true, subtree: true });
    }


    // Dark Mode Toggle Functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Function to apply theme
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
                darkModeToggle.setAttribute('aria-pressed', 'true');
            }
        } else {
            body.classList.remove('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.checked = false;
                darkModeToggle.setAttribute('aria-pressed', 'false');
            }
        }
    };

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    currentLanguage = localStorage.getItem("language") || "en_US"; // Ensure currentLanguage is also loaded

    // Event listener for the navbar toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            const newTheme = darkModeToggle.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Sync header toggle if it exists
            if (headerDarkModeToggle) headerDarkModeToggle.checked = darkModeToggle.checked;
        });
    }

    // Event listener for the header toggle
    const headerDarkModeToggle = document.getElementById('headerDarkModeToggle');
    if (headerDarkModeToggle) {
        // Sync with navbar toggle initial state
        if (darkModeToggle) headerDarkModeToggle.checked = darkModeToggle.checked;

        headerDarkModeToggle.addEventListener('change', () => {
            const newTheme = headerDarkModeToggle.checked ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            // Sync navbar toggle if it exists
            if (darkModeToggle) darkModeToggle.checked = headerDarkModeToggle.checked;
        });
    }
});
