/**
 * NEXUS 3D // Main Application Controller
 * Handles 3D Card Parallax, Gyroscope, Mascot States, Validation,
 * Sound Effects, Form Flipping, and Modal Transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. INITIALIZE CONTROLLERS ---
  const mascot = new Mascot3DController('mascot-canvas');
  window.mascotInstance = mascot;

  // --- 2. DOM ELEMENT REFERENCES ---
  const chassis = document.getElementById('card-chassis');
  const rig = document.getElementById('card-rig');
  const stage = document.getElementById('viewport-stage');
  const flipper = document.getElementById('card-flipper');

  // Form Faces & Switches
  const faceSignin = document.getElementById('face-signin');
  const faceSignup = document.getElementById('face-signup');
  const btnSwitchToSignup = document.getElementById('switch-to-signup');
  const btnSwitchToSignin = document.getElementById('switch-to-signin');

  // Forms
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const forgotForm = document.getElementById('forgot-form');

  // Modals
  const forgotModal = document.getElementById('forgot-modal');
  const successModal = document.getElementById('success-modal');
  const btnForgotPass = document.getElementById('btn-forgot-pass');
  const btnForgotClose = document.getElementById('forgot-close-btn');
  const btnContinueDash = document.getElementById('btn-continue-dash');

  // Navigation & Theme
  const themeBtn = document.getElementById('theme-btn');
  const themeMenu = document.getElementById('theme-menu');
  const audioToggle = document.getElementById('audio-toggle');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');

  // Signup Password Meter
  const signupPassInput = document.getElementById('signup-password');
  const meterFill = document.getElementById('meter-fill');
  const meterLevelText = document.getElementById('meter-level-text');
  const critLen = document.getElementById('crit-len');
  const critUpper = document.getElementById('crit-upper');
  const critNum = document.getElementById('crit-num');

  // --- 3. 3D SPATIAL CARD TILT & PARALLAX ---
  let tiltX = 0;
  let tiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let isHoveringCard = false;

  const maxTilt = 14; // Degrees of tilt

  function updateCardTilt() {
    if (isHoveringCard) {
      tiltX += (targetTiltX - tiltX) * 0.12;
      tiltY += (targetTiltY - tiltY) * 0.12;
    } else {
      // Smooth return to center
      tiltX += (0 - tiltX) * 0.08;
      tiltY += (0 - tiltY) * 0.08;
    }

    if (chassis) {
      chassis.style.setProperty('--tilt-x', (-tiltY).toFixed(2));
      chassis.style.setProperty('--tilt-y', (tiltX).toFixed(2));
    }

    requestAnimationFrame(updateCardTilt);
  }
  requestAnimationFrame(updateCardTilt);

  // Mouse Move on Stage
  stage.addEventListener('mousemove', (e) => {
    isHoveringCard = true;
    const rect = chassis.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const mouseXRel = e.clientX - cardCenterX;
    const mouseYRel = e.clientY - cardCenterY;

    targetTiltX = (mouseXRel / (rect.width / 2)) * maxTilt;
    targetTiltY = (mouseYRel / (rect.height / 2)) * maxTilt;

    // Specular Glare & Coordinates
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;

    chassis.style.setProperty('--mouse-x', `${glareX.toFixed(1)}%`);
    chassis.style.setProperty('--mouse-y', `${glareY.toFixed(1)}%`);
    chassis.style.setProperty('--glare-opacity', '1');
  });

  stage.addEventListener('mouseleave', () => {
    isHoveringCard = false;
    chassis.style.setProperty('--glare-opacity', '0');
  });

  // Mobile Device Orientation Gyroscope Tilt
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma !== null && e.beta !== null) {
      isHoveringCard = true;
      targetTiltX = Math.max(-maxTilt, Math.min(maxTilt, e.gamma * 0.6));
      targetTiltY = Math.max(-maxTilt, Math.min(maxTilt, (e.beta - 40) * 0.6));
    }
  });

  // --- 4. 3D CARD FLIP (SIGN IN <-> SIGN UP) ---
  function flipToSignup() {
    chassis.classList.add('is-flipped');
    window.soundFx.playFlip();
    mascot.say('Join the continuum! 🚀');
    signupForm.reset();
    resetValidation(signupForm);
    updatePasswordStrength('');
  }

  function flipToSignin() {
    chassis.classList.remove('is-flipped');
    window.soundFx.playFlip();
    mascot.say('Welcome back! 🔐');
    signinForm.reset();
    resetValidation(signinForm);
  }

  btnSwitchToSignup.addEventListener('click', flipToSignup);
  btnSwitchToSignin.addEventListener('click', flipToSignin);

  // --- 5. PASSWORD VISIBILITY TOGGLE WITH MASCOT PEEK ---
  document.querySelectorAll('.btn-toggle-eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeShow = btn.querySelector('.eye-show');
      const eyeHide = btn.querySelector('.eye-hide');

      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      eyeShow.classList.toggle('hidden', isPassword);
      eyeHide.classList.toggle('hidden', !isPassword);

      window.soundFx.playHover();

      // Mascot reaction: Peek through one eye if made visible!
      if (isPassword) {
        mascot.setState('peek');
      } else {
        mascot.setState('password');
      }
    });
  });

  // --- 6. MASCOT STATE BINDINGS ON FORM FIELDS ---
  // Emails
  const emailInputs = [document.getElementById('signin-email'), document.getElementById('signup-email')];
  emailInputs.forEach((input) => {
    if (!input) return;
    input.addEventListener('focus', () => mascot.setState('email'));
    input.addEventListener('blur', () => {
      if (!isAnyPasswordFocused()) mascot.setState('idle');
    });
    input.addEventListener('input', () => window.soundFx.playTyping());
  });

  // Passwords
  const passwordInputs = [document.getElementById('signin-password'), document.getElementById('signup-password')];
  passwordInputs.forEach((input) => {
    if (!input) return;
    input.addEventListener('focus', () => {
      const isVisible = input.type === 'text';
      mascot.setState(isVisible ? 'peek' : 'password');
    });
    input.addEventListener('blur', () => {
      mascot.setState('idle');
    });
    input.addEventListener('input', () => window.soundFx.playTyping());
  });

  // Other inputs (Name, etc.)
  const nameInput = document.getElementById('signup-name');
  if (nameInput) {
    nameInput.addEventListener('focus', () => mascot.setState('email'));
    nameInput.addEventListener('blur', () => mascot.setState('idle'));
    nameInput.addEventListener('input', () => window.soundFx.playTyping());
  }

  function isAnyPasswordFocused() {
    return passwordInputs.some((el) => el === document.activeElement);
  }

  // --- 7. PASSWORD STRENGTH METER ENGINE ---
  if (signupPassInput) {
    signupPassInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }

  function updatePasswordStrength(val) {
    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);

    // Update criteria bullets
    critLen.classList.toggle('passed', hasLength);
    critUpper.classList.toggle('passed', hasUpper);
    critNum.classList.toggle('passed', hasNumber && hasSpecial);

    let score = 0;
    if (val.length > 0) score += 1;
    if (hasLength) score += 1;
    if (hasUpper) score += 1;
    if (hasNumber && hasSpecial) score += 1;

    meterFill.className = 'meter-bar-fill';

    if (val.length === 0) {
      meterFill.style.width = '0%';
      meterLevelText.textContent = 'Enter password';
      meterLevelText.style.color = 'var(--text-muted)';
    } else if (score <= 1) {
      meterFill.classList.add('weak');
      meterLevelText.textContent = 'Weak';
      meterLevelText.style.color = 'var(--status-err)';
    } else if (score === 2) {
      meterFill.classList.add('fair');
      meterLevelText.textContent = 'Fair';
      meterLevelText.style.color = 'var(--status-warn)';
    } else if (score === 3) {
      meterFill.classList.add('good');
      meterLevelText.textContent = 'Good';
      meterLevelText.style.color = '#38bdf8';
    } else {
      meterFill.classList.add('strong');
      meterLevelText.textContent = 'Indomitable';
      meterLevelText.style.color = 'var(--status-ok)';
    }
  }

  // --- 8. VALIDATION HELPERS ---
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setFieldError(fieldId, errId, message) {
    const field = document.getElementById(fieldId);
    const group = field ? field.closest('.input-group') : null;
    const errEl = document.getElementById(errId);

    if (group) group.classList.add('has-error');
    if (errEl) errEl.textContent = message;
  }

  function clearFieldError(fieldId, errId) {
    const field = document.getElementById(fieldId);
    const group = field ? field.closest('.input-group') : null;
    const errEl = document.getElementById(errId);

    if (group) group.classList.remove('has-error');
    if (errEl) errEl.textContent = '';
  }

  function resetValidation(form) {
    form.querySelectorAll('.input-group').forEach((g) => g.classList.remove('has-error'));
    form.querySelectorAll('.input-error-msg').forEach((e) => (e.textContent = ''));
  }

  // Real-time clear error on typing
  document.querySelectorAll('.auth-input').forEach((input) => {
    input.addEventListener('input', () => {
      const group = input.closest('.input-group');
      if (group) {
        group.classList.remove('has-error');
        const err = group.querySelector('.input-error-msg');
        if (err) err.textContent = '';
      }
    });
  });

  // --- 9. FORM SUBMISSION HANDLERS ---
  // Sign In Form
  signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resetValidation(signinForm);

    const email = document.getElementById('signin-email').value.trim();
    const pass = document.getElementById('signin-password').value;
    let isValid = true;

    if (!email) {
      setFieldError('signin-email', 'signin-email-err', 'Email address is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setFieldError('signin-email', 'signin-email-err', 'Please provide a valid email format.');
      isValid = false;
    }

    if (!pass) {
      setFieldError('signin-password', 'signin-password-err', 'Password cannot be blank.');
      isValid = false;
    } else if (pass.length < 6) {
      setFieldError('signin-password', 'signin-password-err', 'Password must be at least 6 characters.');
      isValid = false;
    }

    if (!isValid) {
      window.soundFx.playError();
      mascot.setState('error');
      return;
    }

    // Submit Animation
    const submitBtn = document.getElementById('signin-submit-btn');
    submitBtn.classList.add('is-loading');

    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      showSuccessModal(email, 'Sign in authorized. Welcome back, agent!');
    }, 1100);
  });

  // Sign Up Form
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resetValidation(signupForm);

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-password').value;
    const terms = document.getElementById('signup-terms').checked;
    let isValid = true;

    if (!name) {
      setFieldError('signup-name', 'signup-name-err', 'Name is required to initialize.');
      isValid = false;
    }

    if (!email || !validateEmail(email)) {
      setFieldError('signup-email', 'signup-email-err', 'Valid email required for identity key.');
      isValid = false;
    }

    if (!pass || pass.length < 8) {
      setFieldError('signup-password', 'signup-password-err', 'Password must be at least 8 characters.');
      isValid = false;
    }

    if (!terms) {
      const termsErr = document.getElementById('signup-terms-err');
      if (termsErr) termsErr.textContent = 'You must accept the terms to proceed.';
      isValid = false;
    }

    if (!isValid) {
      window.soundFx.playError();
      mascot.setState('error');
      return;
    }

    const submitBtn = document.getElementById('signup-submit-btn');
    submitBtn.classList.add('is-loading');

    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      showSuccessModal(email, `Account initialized for ${name}! Node connected.`);
    }, 1200);
  });

  // --- 10. SUCCESS MODAL & CONFETTI CELEBRATION ---
  function showSuccessModal(email, bodyText) {
    window.soundFx.playSuccess();
    mascot.setState('success');

    const displayUser = document.getElementById('success-user-display');
    const displayBody = document.getElementById('success-body');

    if (displayUser) displayUser.textContent = email;
    if (displayBody) displayBody.textContent = bodyText;

    successModal.hidden = false;

    // Launch Confetti Burst if canvas-confetti library is available
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }

  btnContinueDash.addEventListener('click', () => {
    window.soundFx.playHover();
    successModal.hidden = true;
    mascot.setState('idle');
  });

  // --- 11. FORGOT PASSWORD MODAL ---
  btnForgotPass.addEventListener('click', () => {
    window.soundFx.playHover();
    forgotModal.hidden = false;
    const forgotEmail = document.getElementById('forgot-email');
    if (forgotEmail) {
      forgotEmail.value = document.getElementById('signin-email').value;
      setTimeout(() => forgotEmail.focus(), 100);
    }
  });

  btnForgotClose.addEventListener('click', () => {
    forgotModal.hidden = true;
  });

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) forgotModal.hidden = true;
  });

  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value.trim();
    const errEl = document.getElementById('forgot-email-err');
    const successBanner = document.getElementById('forgot-success-msg');
    const submitBtn = document.getElementById('forgot-submit-btn');

    errEl.textContent = '';
    if (!email || !validateEmail(email)) {
      errEl.textContent = 'Please provide a valid registered email address.';
      window.soundFx.playError();
      return;
    }

    submitBtn.classList.add('is-loading');

    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      successBanner.hidden = false;
      window.soundFx.playSuccess();

      setTimeout(() => {
        forgotModal.hidden = true;
        successBanner.hidden = true;
      }, 2500);
    }, 900);
  });

  // Close modals on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      forgotModal.hidden = true;
      themeMenu.hidden = true;
    }
  });

  // --- 12. THEME SELECTOR & PRESETS ---
  themeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.soundFx.playHover();
    themeMenu.hidden = !themeMenu.hidden;
  });

  document.addEventListener('click', (e) => {
    if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
      themeMenu.hidden = true;
    }
  });

  const themeOptions = document.querySelectorAll('.theme-opt');
  themeOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const theme = opt.getAttribute('data-set-theme');
      setTheme(theme);
      themeMenu.hidden = true;
      window.soundFx.playHover();
    });
  });

  function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('nexus_theme', themeName);

    themeOptions.forEach((o) => {
      o.classList.toggle('active', o.getAttribute('data-set-theme') === themeName);
    });

    // Notify 3D Three scene
    if (window.nexus3DScene && window.nexus3DScene.setTheme) {
      window.nexus3DScene.setTheme(themeName);
    }

    // Notify Mascot colors
    const colors = {
      cosmic: { accent: '#00dfd8', sec: '#7928ca' },
      cyber: { accent: '#34d399', sec: '#059669' },
      sunset: { accent: '#f97316', sec: '#e11d48' },
      dark: { accent: '#60a5fa', sec: '#2563eb' }
    };
    const c = colors[themeName] || colors.cosmic;
    mascot.setTheme(c.accent, c.sec);
  }

  // Restore saved theme
  const savedTheme = localStorage.getItem('nexus_theme');
  if (savedTheme) {
    setTheme(savedTheme);
  }

  // --- 13. SOUND TOGGLE BUTTON ---
  function updateSoundIcon(isMuted) {
    soundIconOn.classList.toggle('hidden', isMuted);
    soundIconOff.classList.toggle('hidden', !isMuted);
  }

  updateSoundIcon(window.soundFx.isMuted);

  audioToggle.addEventListener('click', () => {
    const isNowActive = window.soundFx.toggleMute();
    updateSoundIcon(!isNowActive);
    if (isNowActive) window.soundFx.playHover();
  });

  // Social button click sound
  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.soundFx.playHover();
      const provider = btn.getAttribute('data-provider');
      mascot.say(`Connecting to ${provider}...`);
    });
  });
});
