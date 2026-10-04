/**
 * MUTH NABI MEGA QUIZ 2026 (10TH EDITION)
 * Client-Side Controller & Google Sheets Integration
 * SDC NIT Calicut • SSF Unit
 */

// ============================================================================
// CONFIGURATION
// 1. Replace the URL below with your deployed Google Apps Script Web App URL.
// 2. Replace the WhatsApp community invite link with your actual group link.
// ============================================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9llLm9m7XPJMCbswpFxkwtk-nKeNy8YY8hxA4aapYjosBbaRcV8jg07z6TE_5UhvL7Q/exec";
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/KRxIqSPX4nT9qR9WLXmmH3";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quiz-registration-form');
  const submitBtn = document.getElementById('submit-btn');
  const phoneInput = document.getElementById('phone-number');
  const modal = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const communityLink = document.getElementById('community-link');

  // Set WhatsApp link if configured
  if (communityLink && WHATSAPP_COMMUNITY_URL) {
    communityLink.href = WHATSAPP_COMMUNITY_URL;
  }

  // Format and restrict phone number input to 10 digits
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      // Allow only numbers
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Form submission handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateQuizForm()) {
        return;
      }

      // Gather form values
      const formData = {
        fullName: document.getElementById('full-name').value.trim(),
        phoneNumber: document.getElementById('phone-number').value.trim(),
        year: document.getElementById('academic-year').value,
        department: document.getElementById('department').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value || '',
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      // Set Loading UI
      setLoading(true);

      try {
        // Send data to Google Sheets via Google Apps Script
        // Sending with text/plain;charset=utf-8 is CORS-safelisted and avoids TypeError in no-cors mode
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID_HERE')) {
          try {
            await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8'
              },
              body: JSON.stringify(formData)
            });
          } catch (primaryErr) {
            console.warn('[SDC Quiz] Primary fetch failed, using fallback:', primaryErr);
            const params = new URLSearchParams();
            for (const key in formData) {
              params.append(key, formData[key]);
            }
            await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors',
              body: params
            });
          }
        } else {
          // If script URL is not configured yet, simulate brief network delay for testing
          console.warn('[SDC Quiz] Google Apps Script URL not configured yet. Simulating save.');
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Store local backup in browser storage
        try {
          const registeredUsers = JSON.parse(localStorage.getItem('muthnabi_registrations') || '[]');
          registeredUsers.push(formData);
          localStorage.setItem('muthnabi_registrations', JSON.stringify(registeredUsers));
        } catch (storageErr) {
          console.log('Local storage backup skipped:', storageErr);
        }

        // Reset form & show success modal
        form.reset();
        showSuccessModal();

      } catch (error) {
        console.error('Submission error:', error);
        // Even if there's an error on network, show success dialog so user isn't stuck, or alert
        showSuccessModal();
      } finally {
        setLoading(false);
      }
    });
  }

  // Close modal handler
  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // Close on backdrop click
    modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  function validateQuizForm() {
    let isValid = true;

    // Full Name Validation
    const nameEl = document.getElementById('full-name');
    const nameError = document.getElementById('name-error');
    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
      setError(nameEl, nameError, 'Please enter your full name (at least 2 letters)');
      isValid = false;
    } else {
      clearError(nameEl, nameError);
    }

    // Phone Number Validation (Indian 10-digit number)
    const phoneEl = document.getElementById('phone-number');
    const phoneError = document.getElementById('phone-error');
    const phoneVal = phoneEl.value.trim();
    const phonePattern = /^[6-9]\d{9}$/;

    if (!phoneVal || !phonePattern.test(phoneVal)) {
      setError(phoneEl, phoneError, 'Please enter a valid 10-digit WhatsApp number (starting with 6, 7, 8, or 9)');
      isValid = false;
    } else {
      clearError(phoneEl, phoneError);
    }

    // Year Validation
    const yearEl = document.getElementById('academic-year');
    const yearError = document.getElementById('year-error');
    if (!yearEl.value) {
      setError(yearEl, yearError, 'Please select your academic year');
      isValid = false;
    } else {
      clearError(yearEl, yearError);
    }

    // Department Validation
    const deptEl = document.getElementById('department');
    const deptError = document.getElementById('dept-error');
    if (!deptEl.value) {
      setError(deptEl, deptError, 'Please select your department');
      isValid = false;
    } else {
      clearError(deptEl, deptError);
    }

    // Gender Validation
    const genderChecked = document.querySelector('input[name="gender"]:checked');
    const genderError = document.getElementById('gender-error');
    if (!genderChecked) {
      if (genderError) genderError.classList.add('visible');
      isValid = false;
    } else {
      if (genderError) genderError.classList.remove('visible');
    }

    return isValid;
  }

  function setError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add('input-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('input-error');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  function showSuccessModal() {
    if (!modal) return;
    modal.classList.add('active');
    // Confetti or vibration feedback if supported on mobile
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
    // Auto-redirect logic
    let timeLeft = 10;
    const countdownEl = document.getElementById('countdown');
    const progressBar = document.getElementById('progress-bar');
    
    // Trigger the linear loading bar animation
    if (progressBar) {
      progressBar.style.animation = "loadBar 10s linear forwards";
    }

    // Start countdown timer
    const timer = setInterval(() => {
      timeLeft--;
      if (countdownEl) {
        countdownEl.textContent = timeLeft;
      }
      
      // Execute redirect when timer hits 0
      if (timeLeft <= 0) {
        clearInterval(timer);
        window.location.href = WHATSAPP_COMMUNITY_URL;
      }
    }, 1000);
  }
});
