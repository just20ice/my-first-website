// Currency Exchange Rates (Base rates - in production, these would come from an API)
const EXCHANGE_RATES = {
    RUB_TO_NGN: 12.5, // Base rate: 1 RUB = 12.5 NGN
    NGN_TO_RUB: 0.08  // Base rate: 1 NGN = 0.08 RUB
};

// Fee Structure
const FEE_STRUCTURE = {
    EXCHANGE_MARKUP: 0.005,  // 0.5%
    SERVICE_FEE: 0.015,      // 1.5%
    TOTAL_FEE: 0.02          // 2.0%
};

// Simulated real-time rate updates (in production, this would be an API call)
let currentRate = EXCHANGE_RATES.RUB_TO_NGN;
let rateUpdateInterval;

// DOM Elements
const fromAmountInput = document.getElementById('fromAmount');
const toAmountInput = document.getElementById('toAmount');
const fromCurrencySelect = document.getElementById('fromCurrency');
const toCurrencySelect = document.getElementById('toCurrency');
const swapBtn = document.getElementById('swapBtn');
const rateValue = document.getElementById('rateValue');
const rateDisplay = document.getElementById('rateDisplay');
const exchangeRateDisplay = document.getElementById('exchangeRate');
const serviceFeeDisplay = document.getElementById('serviceFee');
const totalFeeDisplay = document.getElementById('totalFee');
const converterSpinner = document.getElementById('converterSpinner');
const sendMoneyBtn = document.getElementById('sendMoneyBtn');
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const signupModal = document.getElementById('signupModal');
const loginModal = document.getElementById('loginModal');
const closeSignupModal = document.getElementById('closeSignupModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeCurrencyConverter();
    initializeNavigation();
    initializeModals();
    initializeSignupForm();
    initializeLoginForm();
    startRateUpdates();
    initializeSmoothScroll();
});

// Currency Converter Functions
function initializeCurrencyConverter() {
    // Set initial rate display
    updateRateDisplay();
    
    // Event listeners
    fromAmountInput.addEventListener('input', handleAmountChange);
    fromCurrencySelect.addEventListener('change', handleCurrencyChange);
    toCurrencySelect.addEventListener('change', handleCurrencyChange);
    swapBtn.addEventListener('click', swapCurrencies);
    sendMoneyBtn.addEventListener('click', handleSendMoney);
    
    // Prevent negative numbers
    fromAmountInput.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
            e.preventDefault();
        }
    });
}

function updateRateDisplay() {
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    if (fromCurrency === 'RUB' && toCurrency === 'NGN') {
        rateValue.textContent = `1 RUB = ${currentRate.toFixed(2)} NGN`;
    } else if (fromCurrency === 'NGN' && toCurrency === 'RUB') {
        rateValue.textContent = `1 NGN = ${(1 / currentRate).toFixed(4)} RUB`;
    }
}

function handleAmountChange() {
    const amount = parseFloat(fromAmountInput.value) || 0;
    
    if (amount > 0) {
        showLoading();
        // Simulate API delay
        setTimeout(() => {
            calculateConversion();
            hideLoading();
        }, 300);
    } else {
        toAmountInput.value = '';
        clearFeeBreakdown();
    }
}

function calculateConversion() {
    const amount = parseFloat(fromAmountInput.value) || 0;
    if (amount <= 0) return;
    
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    // Calculate base conversion
    let baseRate;
    if (fromCurrency === 'RUB' && toCurrency === 'NGN') {
        baseRate = currentRate;
    } else {
        baseRate = 1 / currentRate;
    }
    
    // Apply exchange rate markup (0.5%)
    const adjustedRate = baseRate * (1 - FEE_STRUCTURE.EXCHANGE_MARKUP);
    
    // Calculate base converted amount
    const baseConvertedAmount = amount * adjustedRate;
    
    // Calculate service fee (1.5% of original amount)
    const serviceFee = amount * FEE_STRUCTURE.SERVICE_FEE;
    
    // Calculate total fee
    const totalFee = amount * FEE_STRUCTURE.TOTAL_FEE;
    
    // Final amount after all fees
    const finalAmount = baseConvertedAmount - (serviceFee * adjustedRate);
    
    // Update UI
    toAmountInput.value = finalAmount.toFixed(2);
    
    // Update fee breakdown
    updateFeeBreakdown(amount, baseRate, adjustedRate, serviceFee, totalFee, fromCurrency, toCurrency);
}

function updateFeeBreakdown(amount, baseRate, adjustedRate, serviceFee, totalFee, fromCurrency, toCurrency) {
    // Exchange rate display
    if (fromCurrency === 'RUB' && toCurrency === 'NGN') {
        exchangeRateDisplay.textContent = `1 RUB = ${adjustedRate.toFixed(2)} NGN`;
    } else {
        exchangeRateDisplay.textContent = `1 NGN = ${(1 / adjustedRate).toFixed(4)} RUB`;
    }
    
    // Service fee
    serviceFeeDisplay.textContent = `${serviceFee.toFixed(2)} ${fromCurrency}`;
    
    // Total fee
    totalFeeDisplay.textContent = `${totalFee.toFixed(2)} ${fromCurrency}`;
}

function clearFeeBreakdown() {
    exchangeRateDisplay.textContent = '-';
    serviceFeeDisplay.textContent = '-';
    totalFeeDisplay.textContent = '-';
}

function handleCurrencyChange() {
    // Ensure currencies are different
    if (fromCurrencySelect.value === toCurrencySelect.value) {
        if (fromCurrencySelect.value === 'RUB') {
            toCurrencySelect.value = 'NGN';
        } else {
            toCurrencySelect.value = 'RUB';
        }
    }
    
    updateRateDisplay();
    if (fromAmountInput.value) {
        calculateConversion();
    } else {
        clearFeeBreakdown();
    }
}

function swapCurrencies() {
    const tempCurrency = fromCurrencySelect.value;
    const tempAmount = fromAmountInput.value;
    
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempCurrency;
    fromAmountInput.value = toAmountInput.value;
    toAmountInput.value = tempAmount;
    
    updateRateDisplay();
    if (fromAmountInput.value) {
        calculateConversion();
    }
}

function handleSendMoney() {
    const amount = parseFloat(fromAmountInput.value);
    
    if (!amount || amount <= 0) {
        showError(fromAmountInput, 'Please enter a valid amount');
        return;
    }
    
    // Show signup modal if user is not logged in
    // In production, this would check authentication status
    signupModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showLoading() {
    converterSpinner.style.display = 'flex';
    sendMoneyBtn.disabled = true;
}

function hideLoading() {
    converterSpinner.style.display = 'none';
    sendMoneyBtn.disabled = false;
}

// Real-time Rate Updates
function startRateUpdates() {
    // Simulate real-time rate fluctuations
    rateUpdateInterval = setInterval(() => {
        // Simulate small rate changes (±0.5%)
        const change = (Math.random() - 0.5) * 0.01;
        currentRate = EXCHANGE_RATES.RUB_TO_NGN * (1 + change);
        
        // Update display if converter is active
        if (fromAmountInput.value) {
            updateRateDisplay();
            calculateConversion();
        } else {
            updateRateDisplay();
        }
    }, 10000); // Update every 10 seconds
}

// Navigation Functions
function initializeNavigation() {
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking on nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 968) {
                closeMobileMenu();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
    
    // Add mobile CTA buttons to nav
    if (nav.classList.contains('active')) {
        const headerCta = document.querySelector('.header-cta');
        if (headerCta && !nav.querySelector('.header-cta')) {
            const mobileCta = headerCta.cloneNode(true);
            mobileCta.classList.add('mobile');
            nav.appendChild(mobileCta);
            
            // Add event listeners to cloned buttons
            const signupBtnClone = mobileCta.querySelector('#signupBtn');
            const loginBtnClone = mobileCta.querySelector('#loginBtn');
            if (signupBtnClone) signupBtnClone.addEventListener('click', () => {
                openSignupModal();
                closeMobileMenu();
            });
            if (loginBtnClone) loginBtnClone.addEventListener('click', () => {
                openLoginModal();
                closeMobileMenu();
            });
        }
    }
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
}

// Modal Functions
function initializeModals() {
    // Signup modal
    signupBtn.addEventListener('click', openSignupModal);
    closeSignupModal.addEventListener('click', closeSignupModalFunc);
    signupModal.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            closeSignupModalFunc();
        }
    });
    
    // Login modal
    loginBtn.addEventListener('click', openLoginModal);
    closeLoginModal.addEventListener('click', closeLoginModalFunc);
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeLoginModalFunc();
        }
    });
    
    // Switch between modals
    const switchToSignup = document.getElementById('switchToSignup');
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeLoginModalFunc();
            setTimeout(openSignupModal, 300);
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSignupModalFunc();
            closeLoginModalFunc();
        }
    });
}

function openSignupModal() {
    signupModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeMobileMenu();
}

function closeSignupModalFunc() {
    signupModal.classList.remove('active');
    document.body.style.overflow = '';
    resetSignupForm();
}

function openLoginModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeMobileMenu();
}

function closeLoginModalFunc() {
    loginModal.classList.remove('active');
    document.body.style.overflow = '';
    loginForm.reset();
    clearFormErrors(loginForm);
}

// Signup Form Functions
function initializeSignupForm() {
    const cancelSignup = document.getElementById('cancelSignup');
    const nextStep1 = document.getElementById('nextStep1');
    const prevStep2 = document.getElementById('prevStep2');
    const nextStep2 = document.getElementById('nextStep2');
    const closeSignupSuccess = document.getElementById('closeSignupSuccess');
    
    if (cancelSignup) {
        cancelSignup.addEventListener('click', closeSignupModalFunc);
    }
    
    if (nextStep1) {
        nextStep1.addEventListener('click', () => validateAndGoToStep(1, 2));
    }
    
    if (prevStep2) {
        prevStep2.addEventListener('click', () => goToStep(2, 1));
    }
    
    if (nextStep2) {
        nextStep2.addEventListener('click', () => validateAndGoToStep(2, 3));
    }
    
    if (closeSignupSuccess) {
        closeSignupSuccess.addEventListener('click', closeSignupModalFunc);
    }
    
    // Real-time validation
    const inputs = signupForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function validateAndGoToStep(currentStep, nextStep) {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Special validation for step 2
    if (currentStep === 2) {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const terms = document.getElementById('terms');
        
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            isValid = false;
        }
        
        if (!terms.checked) {
            showError(terms, 'You must agree to the terms');
            isValid = false;
        }
    }
    
    if (isValid) {
        goToStep(currentStep, nextStep);
    }
}

function goToStep(fromStep, toStep) {
    const fromStepElement = document.querySelector(`.form-step[data-step="${fromStep}"]`);
    const toStepElement = document.querySelector(`.form-step[data-step="${toStep}"]`);
    const fromProgressStep = document.querySelector(`.progress-step[data-step="${fromStep}"]`);
    const toProgressStep = document.querySelector(`.progress-step[data-step="${toStep}"]`);
    
    fromStepElement.classList.remove('active');
    toStepElement.classList.add('active');
    
    fromProgressStep.classList.remove('active');
    toProgressStep.classList.add('active');
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    clearFieldError(field);
    
    // Required field check
    if (field.hasAttribute('required') && !value) {
        showError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (fieldType === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 10) {
            showError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // Password validation
    if (fieldType === 'password' && value) {
        if (value.length < 8) {
            showError(field, 'Password must be at least 8 characters');
            return false;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            showError(field, 'Password must contain uppercase, lowercase, and number');
            return false;
        }
    }
    
    return true;
}

function showError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearFormErrors(form) {
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
    });
}

function resetSignupForm() {
    signupForm.reset();
    clearFormErrors(signupForm);
    
    // Reset to step 1
    const allSteps = document.querySelectorAll('.form-step');
    const allProgressSteps = document.querySelectorAll('.progress-step');
    
    allSteps.forEach(step => step.classList.remove('active'));
    allProgressSteps.forEach(step => step.classList.remove('active'));
    
    document.querySelector('.form-step[data-step="1"]').classList.add('active');
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
}

// Login Form Functions
function initializeLoginForm() {
    loginForm.addEventListener('submit', handleLogin);
    
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    
    let isValid = true;
    
    if (!validateField(email)) isValid = false;
    if (!validateField(password)) isValid = false;
    
    if (isValid) {
        // Simulate login process
        sendMoneyBtn.textContent = 'Logging in...';
        sendMoneyBtn.disabled = true;
        
        setTimeout(() => {
            alert('Login successful! (This is a demo)');
            closeLoginModalFunc();
            sendMoneyBtn.textContent = 'Send Money Now';
            sendMoneyBtn.disabled = false;
        }, 1000);
    }
}

// Smooth Scroll
function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href !== '#' && href !== '') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Performance Optimization: Lazy loading for images (if added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (rateUpdateInterval) {
        clearInterval(rateUpdateInterval);
    }
});
