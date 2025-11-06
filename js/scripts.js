emailjs.init('uoBS30MteMBF0t60g');

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Mobile Menu Toggle Logic ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        // Find the actual hamburger element inside the toggle for optional animation
        const hamburger = menuToggle.querySelector('.hamburger'); 

        menuToggle.addEventListener('click', () => {
            // Toggle the 'open' class on the menu list (CSS to show/hide)
            navLinks.classList.toggle('open');
            // Toggle 'is-active' for the hamburger animation (CSS to transform bars)
            if (hamburger) {
                 hamburger.classList.toggle('is-active');
            }
        });
        
        // Close the menu if a link is clicked (for single-page navigation)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                if (hamburger) {
                    hamburger.classList.remove('is-active');
                }
            });
        });
    }

    // --- 2. Language Selector Logic ---
    const customSelect = document.querySelector('.custom-select');

    if (customSelect) { 
        const selectedOption = customSelect.querySelector('.selected-option');
        const options = customSelect.querySelector('.options');
        
        // Toggle the dropdown visibility
        selectedOption.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents document click listener from immediately closing it
            customSelect.classList.toggle('open');
        });

        // Close the dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!customSelect.contains(event.target)) {
                customSelect.classList.remove('open');
            }
        });

        // Handle option selection and translation
        if (options) { 
            options.addEventListener('click', (event) => {
                // Use closest to ensure the click on the li or its children works
                const option = event.target.closest('li'); 
                if (option) {
                    const lang = option.getAttribute('data-value');
                    const flagImg = option.querySelector('img');
                    const flagSrc = flagImg ? flagImg.src : '';
                    const langSpan = option.querySelector('span');
                    const langText = langSpan ? langSpan.textContent : '';

                    // Update the visible selected option
                    selectedOption.innerHTML = `
                        ${flagImg ? `<img src="${flagSrc}" alt="${langText} flag" class="flag-icon">` : ''}
                        <span>${langText}</span>
                    `;

                    customSelect.classList.remove('open'); // Close the dropdown

                    translatePage(lang); // Run translation function

                    localStorage.setItem('language', lang); // Save user preference
                }
            });
        }
        
        // Initialize the language setting on page load
        initializeLanguage(); 
    }

    // --- 3. Contact Form Logic (EmailJS) ---
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const submitButton = contactForm.querySelector('.button_1');
            const originalText = submitButton.textContent;
            
            // Disable button and show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());

            formObject.to_name = 'Massage Service'; // Example recipient name

            emailjs.send('service_bsid2os', 'template_kddkvie', formObject)
                .then(response => {
                    alert('Email sent successfully!');
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                })
                .catch(error => {
                    alert('Failed to send email. Please try again.');
                    console.error('EmailJS Error:', error);
                    submitButton.textContent = 'Failed!';
                    setTimeout(() => {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    }, 2000);
                });
        });
    } 
});

// --- Helper Functions ---

/**
 * Updates text content and placeholders based on the selected language.
 * Assumes elements have data-pl and data-en attributes.
 */
function translatePage(lang) {
    const elementsToTranslate = document.querySelectorAll('[data-pl][data-en]');
    elementsToTranslate.forEach(element => {
        const translation = element.getAttribute(`data-${lang}`);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            if (element.placeholder !== undefined) {
                element.placeholder = translation;
            }
        } else {
            element.innerHTML = translation;
        }
    });
    document.documentElement.lang = lang;
}

/**
 * Checks for a saved language preference in localStorage and applies it on load.
 */
function initializeLanguage() {
    // Default to 'pl' if no language is saved
    const savedLanguage = localStorage.getItem('language') || 'pl'; 
    
    // Find the corresponding option list item
    const option = document.querySelector(`.options li[data-value="${savedLanguage}"]`);
    const selectedOption = document.querySelector('.selected-option');
    
    if (option && selectedOption) {
        const flagImg = option.querySelector('img');
        const flagSrc = flagImg ? flagImg.src : '';
        const langSpan = option.querySelector('span');
        const langText = langSpan ? langSpan.textContent : '';
        
        // Update the visual appearance of the selected option
        selectedOption.innerHTML = `
            ${flagImg ? `<img src="${flagSrc}" alt="${langText} flag" class="flag-icon">` : ''}
            <span>${langText}</span>
        `;
    }
    
    // Run the initial translation
    translatePage(savedLanguage);
}

