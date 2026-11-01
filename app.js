/* ==========================================================================
   app.js - IELTS Speaking Master Interactive Web Application (Yiğit Özel Sürüm)
   Complete Application Logic: Auth Gate, Navigation, Band Calculator, Tips,
   Fluency TTS, 50 Grammar Rules, 107 Idioms, Simulator & Voice Studio, Quiz,
   28-Day Study Plan, Global Fuzzy Search & Dark/Light Theme.
   Author: Antigravity Agentic Team
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTheme();
  initNavigation();
  initBandCalculator();
  initEssentialTips();
  initFluencyModule();
  initGrammarRules();
  initIdioms();
  initSimulator();
  initQuiz();
  initStudyPlan();
  initGlobalSearch();
});

/* ==========================================================================
   1. AUTHENTICATION & PASSWORD PROTECTION (Yigit0089)
   ========================================================================== */
const AUTH_PASSWORD_HASH = 'Yigit0089';
const AUTH_STORAGE_KEY = 'yigit_ielts_auth';

function checkAuth() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated';
}

function authenticate(password) {
  if (password === AUTH_PASSWORD_HASH) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated');
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  const overlay = document.getElementById('auth-overlay');
  const input = document.getElementById('auth-password-input');
  if (overlay) {
    overlay.classList.remove('hidden');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 300);
    }
  }
  showToast('Portal kilitlendi. Yeniden şifre giriniz.', '🔒');
}

function initAuth() {
  const overlay = document.getElementById('auth-overlay');
  const form = document.getElementById('auth-form');
  const input = document.getElementById('auth-password-input');
  const submitBtn = document.getElementById('btn-auth-submit');
  const togglePwdBtn = document.getElementById('btn-toggle-password');
  const errorMsg = document.getElementById('auth-error-msg');
  
  const lockSidebar = document.getElementById('btn-lock-sidebar');
  const lockTop = document.getElementById('btn-lock-top');
  const lockSheet = document.getElementById('btn-lock-sheet');

  if (checkAuth()) {
    if (overlay) overlay.classList.add('hidden');
  } else {
    if (overlay) overlay.classList.remove('hidden');
    if (input) setTimeout(() => input.focus(), 250);
  }

  function handleLogin() {
    const entered = (input ? input.value : '').trim();
    if (authenticate(entered)) {
      if (errorMsg) errorMsg.classList.remove('visible');
      if (overlay) overlay.classList.add('hidden');
      showToast('Hoş geldin Yiğit! Başarılar dileriz.', '🎓');
    } else {
      if (errorMsg) {
        errorMsg.classList.remove('visible');
        void errorMsg.offsetWidth; // trigger reflow for shake
        errorMsg.classList.add('visible');
      }
      if (input) {
        input.select();
        input.focus();
      }
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
      }
    });
  }

  if (togglePwdBtn && input) {
    togglePwdBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        togglePwdBtn.textContent = '🙈';
      } else {
        input.type = 'password';
        togglePwdBtn.textContent = '👁️';
      }
    });
  }

  // Logout / Lock listeners
  if (lockSidebar) lockSidebar.addEventListener('click', logout);
  if (lockTop) lockTop.addEventListener('click', logout);
  if (lockSheet) {
    lockSheet.addEventListener('click', () => {
      closeMoreSheet();
      logout();
    });
  }
}

/* ==========================================================================
   2. DARK / LIGHT THEME MANAGEMENT
   ========================================================================== */
const THEME_STORAGE_KEY = 'yigit_theme';

function initTheme() {
  const btnToggleTop = document.getElementById('btn-theme-toggle');
  const btnToggleSheet = document.getElementById('btn-theme-toggle-sheet');

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    showToast(`${next === 'dark' ? 'Gece Modu 🌙' : 'Gündüz Modu ☀️'} devrede.`, '🎨');
  }

  if (btnToggleTop) btnToggleTop.addEventListener('click', toggleTheme);
  if (btnToggleSheet) {
    btnToggleSheet.addEventListener('click', () => {
      toggleTheme();
      closeMoreSheet();
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);

  const btnToggleTop = document.getElementById('btn-theme-toggle');
  const icon = theme === 'dark' ? '☀️' : '🌙';
  if (btnToggleTop) btnToggleTop.textContent = icon;
}

/* ==========================================================================
   3. NAVIGATION & MOBILE BOTTOM SHEET
   ========================================================================== */
const ACTIVE_TAB_KEY = 'yigit_active_tab';

function initNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-target]');
  const sheetItems = document.querySelectorAll('.sheet-item[data-target]');
  const btnMobileMore = document.getElementById('btn-mobile-more');
  const backdrop = document.getElementById('more-sheet-backdrop');
  const btnCloseSheet = document.getElementById('btn-close-sheet');

  // Switch tab function
  window.switchTab = function(targetId, saveState = true) {
    if (!targetId) return;

    // Remove active state
    sidebarLinks.forEach(l => l.classList.remove('active'));
    bottomNavItems.forEach(b => b.classList.remove('active'));
    sheetItems.forEach(s => s.classList.remove('active'));

    const allSections = document.querySelectorAll('.view-section');
    allSections.forEach(sec => sec.classList.remove('active'));

    // Set active link in sidebar
    const activeSidebar = document.querySelector(`.sidebar .nav-link[data-target="${targetId}"]`);
    if (activeSidebar) activeSidebar.classList.add('active');

    // Set active link in bottom nav
    const activeBottom = document.querySelector(`.bottom-nav-item[data-target="${targetId}"]`);
    if (activeBottom) activeBottom.classList.add('active');

    // Set active in sheet
    const activeSheet = document.querySelector(`.sheet-item[data-target="${targetId}"]`);
    if (activeSheet) activeSheet.classList.add('active');

    // Show target section
    const targetSection = document.getElementById(`sec-${targetId}`);
    if (targetSection) {
      targetSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (saveState) {
      localStorage.setItem(ACTIVE_TAB_KEY, targetId);
    }

    closeMoreSheet();
  };

  // Attach click listeners to sidebar links
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      window.switchTab(target);
    });
  });

  // Attach click listeners to bottom nav
  bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      window.switchTab(target);
    });
  });

  // Attach click listeners to sheet items
  sheetItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      window.switchTab(target);
    });
  });

  // Mobile More sheet controls
  if (btnMobileMore) {
    btnMobileMore.addEventListener('click', () => {
      openMoreSheet();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMoreSheet();
    });
  }

  if (btnCloseSheet) {
    btnCloseSheet.addEventListener('click', () => {
      closeMoreSheet();
    });
  }

  // Restore saved active tab
  const savedTab = localStorage.getItem(ACTIVE_TAB_KEY) || 'band-calc';
  window.switchTab(savedTab, false);
}

function openMoreSheet() {
  const sheet = document.getElementById('more-sheet');
  const backdrop = document.getElementById('more-sheet-backdrop');
  if (sheet) sheet.classList.add('visible');
  if (backdrop) backdrop.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeMoreSheet() {
  const sheet = document.getElementById('more-sheet');
  const backdrop = document.getElementById('more-sheet-backdrop');
  if (sheet) sheet.classList.remove('visible');
  if (backdrop) backdrop.classList.remove('visible');
  document.body.style.overflow = '';
}

/* ==========================================================================
   4. BAND CALCULATOR MODULE
   ========================================================================== */
function initBandCalculator() {
  const sliderFC = document.getElementById('slider-fc');
  const sliderLR = document.getElementById('slider-lr');
  const sliderGRA = document.getElementById('slider-gra');
  const sliderPR = document.getElementById('slider-pr');

  const valFC = document.getElementById('val-fc');
  const valLR = document.getElementById('val-lr');
  const valGRA = document.getElementById('val-gra');
  const valPR = document.getElementById('val-pr');

  const calcScore = document.getElementById('calc-score');
  const calcStatus = document.getElementById('calc-status');
  const calcDetails = document.getElementById('calc-details');
  const scoreCircle = document.getElementById('calc-score-circle');

  const btnPresetTarget = document.getElementById('preset-target');
  const btnPresetSolid = document.getElementById('preset-solid');
  const btnPresetReset = document.getElementById('preset-reset');

  const SLIDERS_STORAGE_KEY = 'yigit_band_sliders';

  // Restore saved slider values
  try {
    const saved = JSON.parse(localStorage.getItem(SLIDERS_STORAGE_KEY));
    if (saved) {
      if (sliderFC && saved.fc) sliderFC.value = saved.fc;
      if (sliderLR && saved.lr) sliderLR.value = saved.lr;
      if (sliderGRA && saved.gra) sliderGRA.value = saved.gra;
      if (sliderPR && saved.pr) sliderPR.value = saved.pr;
    }
  } catch (err) {
    console.warn('Slider load error:', err);
  }

  function calculateBand() {
    const fc = parseFloat(sliderFC ? sliderFC.value : 8.5);
    const lr = parseFloat(sliderLR ? sliderLR.value : 8.5);
    const gra = parseFloat(sliderGRA ? sliderGRA.value : 8.5);
    const pr = parseFloat(sliderPR ? sliderPR.value : 8.5);

    if (valFC) valFC.textContent = fc.toFixed(1);
    if (valLR) valLR.textContent = lr.toFixed(1);
    if (valGRA) valGRA.textContent = gra.toFixed(1);
    if (valPR) valPR.textContent = pr.toFixed(1);

    const average = (fc + lr + gra + pr) / 4;
    const whole = Math.floor(average);
    const remainder = average - whole;

    let overallBand;
    if (remainder < 0.25) {
      overallBand = whole;
    } else if (remainder < 0.75) {
      overallBand = whole + 0.5;
    } else {
      overallBand = whole + 1.0;
    }

    if (calcScore) calcScore.textContent = overallBand.toFixed(1);

    // Save to localStorage
    localStorage.setItem(SLIDERS_STORAGE_KEY, JSON.stringify({
      fc, lr, gra, pr, overall: overallBand
    }));

    // Update Band Descriptor Description
    updateDescriptor(overallBand);

    // Visual score bounce
    if (scoreCircle) {
      scoreCircle.style.transform = 'scale(1.06)';
      setTimeout(() => { scoreCircle.style.transform = 'scale(1)'; }, 200);
    }
  }

  function updateDescriptor(band) {
    if (!calcStatus || !calcDetails) return;

    if (band >= 8.5) {
      calcStatus.textContent = '🌟 Band 8.5 - 9.0: Uzman & Kusursuz Konuşucu (Expert User)';
      calcDetails.textContent = 'Yiğitçiğim, bu seviyede dil kullanımı tamamen doğal ve akıcıdır. Nadir ve küçük dil sürçmeleri dışında kusursuz gramer ve zengin deyimsel hakimiyet sergilenir.';
    } else if (band >= 8.0) {
      calcStatus.textContent = '🎯 Band 8.0: Çok İyi Kullanıcı (Very Good User)';
      calcDetails.textContent = 'Akıcı, nadiren duraksayan, karmaşık cümle yapılarını ve deyimleri büyük oranda hatasız kullanan üstün seviye. Hedef bandın burası!';
    } else if (band >= 7.5) {
      calcStatus.textContent = '✨ Band 7.5: Güçlü ve Yetkin Konuşucu (Good User+)';
      calcDetails.textContent = 'Rahat ve detaylı konuşma, geniş kelime haznesi, ara sıra küçük edat/tanımlık hataları olsa da anlamı asla bozmayan akıcı performans.';
    } else if (band >= 7.0) {
      calcStatus.textContent = '👍 Band 7.0: İyi Kullanıcı (Good User)';
      calcDetails.textContent = 'Genellikle akıcı, karmaşık yapıları denemeye istekli fakat zaman zaman kelime arama veya hafif telaffuz tutukluğu yaşayan seviye.';
    } else if (band >= 6.0) {
      calcStatus.textContent = '⚠️ Band 6.0 - 6.5: Yetkin Kullanıcı (Competent User)';
      calcDetails.textContent = 'Temel konularda anlaşılır konuşabilen fakat karmaşık fikirlerde sık sık duraksayan, sınırlı bağlaç kullanan ve gramer hataları yapan seviye.';
    } else {
      calcStatus.textContent = '📚 Band 5.5 ve Altı: Geliştirilmesi Gereken Seviye';
      calcDetails.textContent = 'Sık tekrarlar, yavaş konuşma temposu, temel zaman ve edat hataları. 28 günlük plan ve 50 kuralı dikkatle çalış.';
    }
  }

  // Bind input listeners
  [sliderFC, sliderLR, sliderGRA, sliderPR].forEach(sl => {
    if (sl) sl.addEventListener('input', calculateBand);
  });

  // Presets
  if (btnPresetTarget) {
    btnPresetTarget.addEventListener('click', () => {
      if (sliderFC) sliderFC.value = 8.5;
      if (sliderLR) sliderLR.value = 8.5;
      if (sliderGRA) sliderGRA.value = 8.5;
      if (sliderPR) sliderPR.value = 8.5;
      calculateBand();
      showToast('Hedef Band 8.5 yüklendi.', '🎯');
    });
  }

  if (btnPresetSolid) {
    btnPresetSolid.addEventListener('click', () => {
      if (sliderFC) sliderFC.value = 7.5;
      if (sliderLR) sliderLR.value = 8.0;
      if (sliderGRA) sliderGRA.value = 7.5;
      if (sliderPR) sliderPR.value = 7.5;
      calculateBand();
      showToast('Güvenli Band 7.5 yüklendi.', '✨');
    });
  }

  if (btnPresetReset) {
    btnPresetReset.addEventListener('click', () => {
      if (sliderFC) sliderFC.value = 6.5;
      if (sliderLR) sliderLR.value = 6.5;
      if (sliderGRA) sliderGRA.value = 6.5;
      if (sliderPR) sliderPR.value = 6.5;
      calculateBand();
      showToast('Değerler sıfırlandı.', '🔄');
    });
  }

  // Initial calculation
  calculateBand();
}

/* ==========================================================================
   5. TEXT-TO-SPEECH (TTS) ENGINE FOR ENGLISH ONLY
   ========================================================================== */
function cleanEnglishForSpeech(raw) {
  if (!raw) return '';
  return raw
    // 1. Remove parenthesized Turkish translations, e.g. (Tercih ederdim)
    .replace(/\([^)]*\)/g, ' ')
    // 2. Remove square brackets [like this]
    .replace(/\[[^\]]*\]/g, ' ')
    // 3. Remove curly braces {like this}
    .replace(/\{[^}]*\}/g, ' ')
    // 4. Remove Turkish annotations after pipe '|'
    .split('|')[0]
    // 5. Remove quotes, bullet symbols
    .replace(/["“”«»👉•]/g, '')
    // 6. Clean multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

function speakText(text, triggerBtn = null) {
  if (!('speechSynthesis' in window)) {
    showToast('Tarayıcınız sesli telaffuzu (TTS) desteklemiyor.', '⚠️');
    return;
  }

  const clean = cleanEnglishForSpeech(text);
  if (!clean) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'en-GB';
  utterance.rate = 0.92; // Slightly natural pace for IELTS clarity
  utterance.pitch = 1.0;

  // Visual playing feedback on trigger button
  if (triggerBtn) {
    triggerBtn.classList.add('playing');
    utterance.onend = () => triggerBtn.classList.remove('playing');
    utterance.onerror = () => triggerBtn.classList.remove('playing');
  }

  // Attempt to select an authentic English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang === 'en-GB' || v.lang === 'en-US' || v.name.includes('English'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// Global click delegation for all .btn-speak elements
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-speak');
  if (btn) {
    const text = btn.getAttribute('data-speak');
    if (text) speakText(text, btn);
  }
});

/* ==========================================================================
   6. ESSENTIAL TIPS MODULE (PAGES 37 - 42)
   ========================================================================== */
function initEssentialTips() {
  const container = document.getElementById('tips-container');
  const filterChips = document.querySelectorAll('#tips-filter-bar .chip');

  if (!container || typeof ESSENTIAL_TIPS === 'undefined') return;

  function renderTips(filter = 'all') {
    let html = '';

    // PART 1 (Pages 37-38)
    if (filter === 'all' || filter === 'part1') {
      const p1 = ESSENTIAL_TIPS.part1;
      html += `
        <div class="tip-card" id="tip-card-part1">
          <div class="tip-card-header">
            <div class="rule-number-badge">P1</div>
            <div>
              <h3 class="tip-title">${p1.title}</h3>
              <span class="badge badge-primary">Kitap Sayfa 37 – 38</span>
            </div>
          </div>
          <p class="card-desc" style="margin-bottom: 14px;">${p1.desc}</p>
          
          <div style="background: var(--bg-subtle); padding: 14px; border-radius: var(--radius-md); margin-bottom: 14px;">
            <strong style="font-size: 13px; color: var(--brand-blue); display: block; margin-bottom: 8px;">Örnek Part 1 Başlangıç Soruları:</strong>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(p1.sampleQuestions || []).map(q => `
                <div style="font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
                  <span>${q}</span>
                  <button class="btn-speak" data-speak="${q}">🔊 Dinle</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Rules in Part 1 -->
          ${(p1.rules || []).map(r => `
            <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; background: var(--bg-card);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-purple">Kural ${r.num}</span>
                <strong style="font-size: 14px; color: var(--text-main);">${r.title}</strong>
              </div>

              ${r.dialogue ? `
                <div class="dialogue-box">
                  <div class="dialogue-row">
                    <span class="role-badge role-examiner">Examiner</span>
                    <span class="dialogue-text">${r.dialogue.examiner}</span>
                    <button class="btn-speak" data-speak="${r.dialogue.examiner}">🔊</button>
                  </div>
                  <div class="dialogue-row">
                    <span class="role-badge role-candidate">Yiğit</span>
                    <span class="dialogue-text">${r.dialogue.candidate}</span>
                    <button class="btn-speak" data-speak="${r.dialogue.candidate}">🔊</button>
                  </div>
                </div>
              ` : ''}

              ${r.dialogueNegative ? `
                <div class="dialogue-box">
                  <div class="dialogue-row">
                    <span class="role-badge role-examiner">Examiner</span>
                    <span class="dialogue-text">${r.dialogueNegative.examiner}</span>
                    <button class="btn-speak" data-speak="${r.dialogueNegative.examiner}">🔊</button>
                  </div>
                  <div class="dialogue-row">
                    <span class="role-badge role-candidate">Yiğit (Olumsuz Cevap)</span>
                    <span class="dialogue-text">${r.dialogueNegative.candidate}</span>
                    <button class="btn-speak" data-speak="${r.dialogueNegative.candidate}">🔊</button>
                  </div>
                </div>
              ` : ''}

              ${r.teacherTip ? `
                <div class="teacher-note">
                  <span class="teacher-avatar">👨‍🏫</span>
                  <div class="teacher-note-text">
                    <strong>Öğretmen Notu:</strong> ${r.teacherTip}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    // PART 2 (Pages 39-40)
    if (filter === 'all' || filter === 'part2') {
      const p2 = ESSENTIAL_TIPS.part2;
      html += `
        <div class="tip-card" id="tip-card-part2">
          <div class="tip-card-header">
            <div class="rule-number-badge" style="background: linear-gradient(135deg, #7c3aed, #a855f7);">P2</div>
            <div>
              <h3 class="tip-title">${p2.title}</h3>
              <span class="badge badge-purple">Kitap Sayfa 39 – 40</span>
            </div>
          </div>
          <p class="card-desc" style="margin-bottom: 14px;">${p2.desc}</p>

          <!-- Rules in Part 2 -->
          ${(p2.rules || []).map(r => `
            <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; background: var(--bg-card);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-warning">Kural ${r.num}</span>
                <strong style="font-size: 14px; color: var(--text-main);">${r.title}</strong>
              </div>

              ${r.content ? `<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.5;">${r.content}</p>` : ''}

              ${r.dialogue ? `
                <div class="dialogue-box">
                  <div class="dialogue-row">
                    <span class="role-badge role-candidate">Örnek Giriş Cümlesi</span>
                    <span class="dialogue-text">${r.dialogue.candidate}</span>
                    <button class="btn-speak" data-speak="${r.dialogue.candidate}">🔊 Dinle</button>
                  </div>
                </div>
              ` : ''}

              ${r.teacherTip ? `
                <div class="teacher-note">
                  <span class="teacher-avatar">👨‍🏫</span>
                  <div class="teacher-note-text">
                    <strong>Öğretmen Notu:</strong> ${r.teacherTip}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    // PART 3 (Pages 40-41)
    if (filter === 'all' || filter === 'part3') {
      const p3 = ESSENTIAL_TIPS.part3;
      html += `
        <div class="tip-card" id="tip-card-part3">
          <div class="tip-card-header">
            <div class="rule-number-badge" style="background: linear-gradient(135deg, #059669, #10b981);">P3</div>
            <div>
              <h3 class="tip-title">${p3.title}</h3>
              <span class="badge badge-success">Kitap Sayfa 40 – 41</span>
            </div>
          </div>
          <p class="card-desc" style="margin-bottom: 14px;">${p3.desc}</p>

          <!-- Rules in Part 3 -->
          ${(p3.rules || []).map(r => `
            <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; background: var(--bg-card);">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span class="badge badge-primary">Kural ${r.num}</span>
                <strong style="font-size: 14px; color: var(--text-main);">${r.title}</strong>
              </div>

              ${r.dialogue ? `
                <div class="dialogue-box">
                  <div class="dialogue-row">
                    <span class="role-badge role-examiner">Examiner</span>
                    <span class="dialogue-text">${r.dialogue.examiner}</span>
                    <button class="btn-speak" data-speak="${r.dialogue.examiner}">🔊</button>
                  </div>
                  <div class="dialogue-row">
                    <span class="role-badge role-candidate">Yiğit (Band 8+ Yanıt)</span>
                    <span class="dialogue-text">${r.dialogue.candidate}</span>
                    <button class="btn-speak" data-speak="${r.dialogue.candidate}">🔊</button>
                  </div>
                </div>
              ` : ''}

              ${r.recoveryQuestions ? `
                <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); margin-top: 10px;">
                  <strong style="font-size: 13px; color: var(--danger); display: block; margin-bottom: 6px;">İletişim Kurtarma Kalıpları (A, B, C):</strong>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${r.recoveryQuestions.map(q => `
                      <div style="font-size: 13px; display: flex; align-items: center; justify-content: space-between;">
                        <span>🔊 <em>"${q}"</em></span>
                        <button class="btn-speak" data-speak="${q}">Dinle</button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${r.teacherTip ? `
                <div class="teacher-note">
                  <span class="teacher-avatar">👨‍🏫</span>
                  <div class="teacher-note-text">
                    <strong>Öğretmen Notu:</strong> ${r.teacherTip}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    // GENERAL TIPS (Page 42)
    if (filter === 'all' || filter === 'general') {
      const gen = ESSENTIAL_TIPS.general;
      if (gen) {
        html += `
          <div class="tip-card" id="tip-card-general">
            <div class="tip-card-header">
              <div class="rule-number-badge" style="background: linear-gradient(135deg, #d97706, #f59e0b);">GEN</div>
              <div>
                <h3 class="tip-title">${gen.title || 'Genel Sınav Kuralları & Taktikler'}</h3>
                <span class="badge badge-warning">Kitap Sayfa 42</span>
              </div>
            </div>
            
            ${(gen.rules || []).map(r => `
              <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; background: var(--bg-card);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span class="badge badge-neutral">Kural ${r.num}</span>
                  <strong style="font-size: 14px; color: var(--text-main);">${r.title}</strong>
                </div>
                ${r.content ? `<p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 8px;">${r.content}</p>` : ''}
                ${r.teacherTip ? `
                  <div class="teacher-note">
                    <span class="teacher-avatar">👨‍🏫</span>
                    <div class="teacher-note-text">
                      <strong>Öğretmen Notu:</strong> ${r.teacherTip}
                    </div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }
    }

    container.innerHTML = html;
  }

  // Filter button handlers
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.getAttribute('data-tips-filter');
      renderTips(f);
    });
  });

  // Initial render
  renderTips('all');
}

/* ==========================================================================
   7. FLUENCY & COHERENCE PHRASES (10 FUNCTIONAL CATEGORIES)
   ========================================================================== */
const FLUENCY_CATEGORIES_DATA = [
  {
    id: 'preference',
    title: '1. Expressing Preference (Tercih Belirtme)',
    desc: 'Part 1 ve Part 3’te "hangisini tercih edersin?" sorularında sıradan "I like / I prefer" yerine Band 8+ yapılar:',
    badge: 'Part 1 & 3',
    phrases: [
      {
        en: "Given the choice between the two, I would almost always opt for the former.",
        tr: "(İkisi arasında bir seçim hakkım olsa, neredeyse her zaman ilkini tercih ederdim.)"
      },
      {
        en: "I'd much rather spend an evening reading at home than go out to a noisy venue.",
        tr: "(Gürültülü bir mekana gitmektense akşamımı evde kitap okuyarak geçirmeyi kat kat tercih ederim.)"
      },
      {
        en: "I have a distinct leaning towards modern architecture rather than classical styles.",
        tr: "(Klasik tarzlar yerine modern mimariye karşı bariz bir yatkınlığım var.)"
      },
      {
        en: "If it were entirely up to me, I would undoubtedly select the more flexible alternative.",
        tr: "(Tamamen bana kalmış olsaydı, şüphesiz daha esnek olan alternatifi seçerdim.)"
      }
    ],
    teacherTip: "Sınav görevlisine asla sadece 'I prefer tea' deme! 'Given the choice between tea and coffee, I would invariably opt for the latter' kalıbını kullan."
  },
  {
    id: 'narrating',
    title: '2. Narrating & Storytelling (Hikaye ve Olay Anlatma)',
    desc: 'Part 2 Cue Card konuşmalarında olay akışını canlı ve akıcı kılmak için zaman bağlaçları:',
    badge: 'Part 2 Cue Card',
    phrases: [
      {
        en: "The first thing that springs to mind when reflecting on that memorable trip is the breathtaking scenery.",
        tr: "(O unutulmaz geziyi düşündüğümde aklıma gelen ilk şey nefes kesici manzaraydı.)"
      },
      {
        en: "To cut a long story short, what started as a trivial issue ended up becoming a life-changing experience.",
        tr: "(Lafı fazla uzatmayayım, önemsiz bir mesele olarak başlayan şey sonunda hayatımı değiştiren bir deneyime dönüştü.)"
      },
      {
        en: "Little did I know at the time that this spontaneous decision would have such far-reaching consequences.",
        tr: "(O zamanlar, bu anlık kararın bu denli geniş çaplı sonuçları olacağından hiç haberim yoktu - Inversion yapısı!)"
      },
      {
        en: "Before I knew it, everything had snowballed into an extraordinary adventure.",
        tr: "(Ne olduğunu anlayamadan, her şey çığ gibi büyüyüp olağanüstü bir maceraya dönüştü.)"
      }
    ],
    teacherTip: "Part 2 açılışında 'I am going to talk about...' demek yerine 'The first thing that springs to mind...' kalıbıyla başla, sınav görevlisi anında dikkat kesilir!"
  },
  {
    id: 'comparing',
    title: '3. Comparing & Contrasting (Karşılaştırma Yapma)',
    desc: 'Part 3’te nesiller, ülkeler veya geçmiş ile günümüzü kıyaslarken kullanılacak üst düzey kalıplar:',
    badge: 'Part 3 Akademik',
    phrases: [
      {
        en: "There is a stark contrast between how the older generation communicated and how teenagers interact nowadays.",
        tr: "(Eski neslin iletişim kurma şekli ile günümüz gençlerinin etkileşim biçimi arasında bariz bir tezat var.)"
      },
      {
        en: "While traditional schooling offers structure, online platforms provide unparalleled flexibility.",
        tr: "(Geleneksel okul eğitimi düzen sunarken, çevrim içi platformlar eşi benzeri görülmemiş bir esneklik sağlar.)"
      },
      {
        en: "On the one hand, urbanization fuels economic growth; on the other hand, it puts immense strain on natural resources.",
        tr: "(Bir yandan kentleşme ekonomik büyümeyi körüklerken; diğer yandan doğal kaynaklar üzerinde muazzam bir baskı yaratır.)"
      },
      {
        en: "In sharp contrast to the past, remote working is now regarded as standard practice across multinational corporations.",
        tr: "(Geçmişin tam tersine, uzaktan çalışma artık çok uluslu şirketlerde standart bir uygulama olarak kabul ediliyor.)"
      }
    ],
    teacherTip: "Part 3 sorularında asla tek bir boyuttan bakma. 'On the one hand..., but when viewed from an alternative perspective...' şeklinde iki yönü de ele al."
  },
  {
    id: 'suggesting',
    title: '4. Suggesting & Recommending (Öneride Bulunma)',
    desc: 'Toplumsal veya bireysel problemlere çözüm sunarken otoriter ve doğal kalıplar:',
    badge: 'Part 3 Çözüm',
    phrases: [
      {
        en: "One viable solution that governments might consider implementing is investing heavily in public transport.",
        tr: "(Hükümetlerin hayata geçirmeyi düşünebileceği uygulanabilir bir çözüm, toplu taşımaya yoğun yatırım yapmaktır.)"
      },
      {
        en: "It would be tremendously beneficial if educational curricula incorporated practical financial literacy.",
        tr: "(Eğitim müfredatlarının pratik finansal okuryazarlığı içermesi muazzam derecede faydalı olurdu.)"
      },
      {
        en: "A sensible first step would be to raise public awareness through targeted social media campaigns.",
        tr: "(Mantıklı bir ilk adım, hedeflenmiş sosyal medya kampanyaları aracılığıyla halkın bilincini artırmak olacaktır.)"
      },
      {
        en: "Perhaps the most pragmatic way forward is encouraging public-private partnerships.",
        tr: "(Belki de ileriye dönük en pragmatik yol, kamu-özel ortaklıklarını teşvik etmektir.)"
      }
    ],
    teacherTip: "Sadece 'Governments should do this' deme. 'One viable solution that deserves serious consideration is...' şeklinde akademik öneri iskeleti kur."
  },
  {
    id: 'opinions',
    title: '5. Giving Opinions & Stances (Fikir Beyan Etme)',
    desc: 'Kişisel görüş belirtirken "I think" veya "In my opinion" yerine Band 8.5 varyasyonları:',
    badge: 'Tüm Partlar',
    phrases: [
      {
        en: "From my standpoint, technological literacy is no longer a luxury but an absolute prerequisite.",
        tr: "(Benim bakış açıma göre, teknoloji okuryazarlığı artık bir lüks değil, mutlak bir ön koşuldur.)"
      },
      {
        en: "I am firmly convinced that early childhood experiences shape our cognitive resilience later in life.",
        tr: "(Erken çocukluk deneyimlerinin yaşamın ilerleyen dönemlerinde bilişsel dayanıklılığımızı şekillendirdiğine yürekten inanıyorum.)"
      },
      {
        en: "As far as I can tell, people are becoming increasingly conscious of sustainable consumption.",
        tr: "(Görebildiğim kadarıyla insanlar sürdürülebilir tüketim konusunda giderek daha bilinçli hale geliyorlar.)"
      },
      {
        en: "I subscribe to the view that artificial intelligence will complement rather than replace human creativity.",
        tr: "(Yapay zekanın insan yaratıcılığının yerini almaktan ziyade onu tamamlayacağı görüşünü benimsiyorum.)"
      }
    ],
    teacherTip: "'I think' kelimesini sınav boyunca en fazla 1 kez kullan! Yerine 'From my standpoint' veya 'I am firmly convinced that' kalıplarını koy."
  },
  {
    id: 'speculating',
    title: '6. Speculating & Hypothesizing (Tahmin & İhtimaller)',
    desc: 'Gelecek hakkında veya emin olmadığın konularda konuşurken kullanılan spekülatif kalıplar:',
    badge: 'Part 3 Gelecek',
    phrases: [
      {
        en: "Hypothetically speaking, if automated vehicles became ubiquitous, road accidents would plummet drastically.",
        tr: "(Varsayımsal olarak konuşursak, otonom araçlar yaygınlaşırsa trafik kazaları ciddi oranda düşüşe geçer.)"
      },
      {
        en: "It is widely anticipated that renewable energy will overtake fossil fuels within the next two decades.",
        tr: "(Önümüzdeki yirmi yıl içinde yenilenebilir enerjinin fosil yakıtları geride bırakacağı yaygın şekilde tahmin edilmektedir.)"
      },
      {
        en: "I wouldn't be surprised in the slightest if traditional retail shops gradually morphed into experiential showrooms.",
        tr: "(Geleneksel perakende mağazalarının giderek deneyimsel sergi salonlarına dönüşmesi beni zerre kadar şaşırtmaz.)"
      },
      {
        en: "There is every likelihood that telecommunication advances will render physical commuting virtually obsolete.",
        tr: "(Telekomünikasyondaki ilerlemelerin işe fiziksel gidip gelmeyi neredeyse gereksiz kılma olasılığı oldukça yüksektir.)"
      }
    ],
    teacherTip: "Part 3'te 'What will happen in 20 years?' sorusuna 'I think people will...' deme. 'There is every likelihood that...' ile başla!"
  },
  {
    id: 'analyzing',
    title: '7. Analyzing & Deconstructing (Derinlemesine Analiz)',
    desc: 'Bir sorunun arkasındaki temel sebepleri ve mekanizmaları parça parça açıklarken:',
    badge: 'Part 3 Neden-Sonuç',
    phrases: [
      {
        en: "If we examine the root cause of this trend, it primarily stems from the relentless pace of urban life.",
        tr: "(Bu eğilimin temel nedenini incelersek, öncelikli olarak şehir hayatının amansız temposundan kaynaklanmaktadır.)"
      },
      {
        en: "This phenomenon can be attributed to a confluence of socio-economic factors.",
        tr: "(Bu olgu, sosyo-ekonomik faktörlerin bir araya gelmesine bağlanabilir.)"
      },
      {
        en: "To analyze this objectively, we need to distinguish between short-term hype and enduring behavioral change.",
        tr: "(Bunu objektif olarak analiz etmek gerekirse, kısa vadeli popülerlik ile kalıcı davranışsal değişim arasında ayrım yapmalıyız.)"
      },
      {
        en: "The underlying driving force behind this shift is undoubtedly consumer demand for instant gratification.",
        tr: "(Bu değişimin arkasındaki temel itici güç, şüphesiz tüketicilerin anlık tatmin arzusudur.)"
      }
    ],
    teacherTip: "'Because of money' gibi basit cevaplar yerine 'This can be largely attributed to socio-economic pressures' cümlesi Band 8 kapısını açar."
  },
  {
    id: 'summarizing',
    title: '8. Summarizing & Concluding (Özetleme & Bağlama)',
    desc: 'Uzun bir cevabı toparlarken ve sonuca bağlarken akıcı kapanış ifadeleri:',
    badge: 'Part 2 & 3 Kapanış',
    phrases: [
      {
        en: "All things considered, it remains an indispensable milestone in both my personal and professional development.",
        tr: "(Her şey hesaba katıldığında, hem kişisel hem de mesleki gelişimimde vazgeçilmez bir mihenk taşı olmaya devam ediyor.)"
      },
      {
        en: "To encapsulate my main point, striking a balance between ambition and well-being is paramount.",
        tr: "(Ana fikrimi özetlemek gerekirse, hırs ile esenlik arasında bir denge kurmak her şeyden önemlidir.)"
      },
      {
        en: "When all is said and done, genuine human connection far outweighs any material accomplishment.",
        tr: "(Son tahlilde her şey konuşulup bittiğinde, samimi insan ilişkisi her türlü maddi başarıdan kat kat üstündür.)"
      },
      {
        en: "Ultimately, the benefits of this transition substantially outweigh the initial teething troubles.",
        tr: "(Nihayetinde, bu geçişin faydaları başlangıçtaki alışma sancılarından çok daha ağır basmaktadır.)"
      }
    ],
    teacherTip: "Part 2'de 2 dakikan dolmak üzereyken havada kalma. 'All things considered, ...' diyerek cevabını profesyonelce tamamla."
  },
  {
    id: 'repair',
    title: '9. Conversation Repair (İletişim Kurtarma & Açıklık İsteme)',
    desc: 'Soruyu tam anlamadığında ya da kelimeyi hatırlayamadığında puan kaybetmeden kontrolü alma:',
    badge: 'Kitap Sayfa 41 Kurtarma',
    phrases: [
      {
        en: "Could you elaborate on what you mean by that, please?",
        tr: "(Bununla neyi kastettiğinizi biraz daha açabilir misiniz lütfen? - Kural 9 Kalıp A)"
      },
      {
        en: "Could you clarify what the term 'metropolitan sprawl' implies in this context?",
        tr: "(Bu bağlamda 'metropolitan sprawl' teriminin ne anlama geldiğini açıklayabilir misiniz? - Kural 9 Kalıp B)"
      },
      {
        en: "Would you mind repeating the question once more, please?",
        tr: "(Soruyu bir kez daha tekrarlayabilir misiniz lütfen? - Kural 9 Kalıp C)"
      },
      {
        en: "What I'm trying to get at is that the digital divide is exacerbating existing social inequalities.",
        tr: "(Varmaya çalıştığım nokta şu ki, dijital uçurum var olan toplumsal eşitsizlikleri daha da derinleştiriyor.)"
      }
    ],
    teacherTip: "Kitap Sayfa 41'deki kural: Anlamadığında 'What?' veya 'Pardon?' demek yasak! 'Could you explain what you mean by that, please?' dersen sınav görevlisi FC puanını kesmez."
  },
  {
    id: 'fillers',
    title: '10. Fillers & Stalling (Düşünme Payı Kazanma)',
    desc: 'Zor veya soyut bir soru geldiğinde sessiz kalıp FC puanını düşürmemek için zaman kazanma şablonları:',
    badge: 'Sıfır Duraksama',
    phrases: [
      {
        en: "That's an intriguing question. To be completely honest, I haven't given it much thought before, but...",
        tr: "(Oldukça merak uyandırıcı bir soru. Tamamen dürüst olmak gerekirse daha önce üzerinde pek düşünmemiştim fakat...)"
      },
      {
        en: "Well, looking at it from an objective perspective, I'd say that...",
        tr: "(Şöyle objektif bir açıdan bakacak olursak, diyebilirim ki...)"
      },
      {
        en: "That's a rather multifaceted issue with no straightforward answer, but if I had to pinpoint the main reason...",
        tr: "(Bu, tek ve basit bir yanıtı olmayan hayli çok boyutlu bir mesele; fakat ana nedeni işaret etmem gerekirse...)"
      },
      {
        en: "That is certainly an interesting angle to consider. Off the top of my head, I suppose...",
        tr: "(Bu kesinlikle dikkate değer ilginç bir bakış açısı. Aklıma ilk gelen şeyle söyleyecek olursam sanırım...)"
      }
    ],
    teacherTip: "Bu kalıbı söylerken sınav görevlisinin gözlerinin içine bakarak konuş. Beynin cevabı hazırlarken ağzın duraksamadan aktığı için FC kriterin 8.5 kalır!"
  }
];

function initFluencyModule() {
  const container = document.getElementById('fluency-container');
  const filterChips = document.querySelectorAll('#fluency-filter-bar .chip');

  if (!container) return;

  function renderFluency(filter = 'all') {
    const list = filter === 'all'
      ? FLUENCY_CATEGORIES_DATA
      : FLUENCY_CATEGORIES_DATA.filter(c => c.id === filter);

    container.innerHTML = list.map(cat => `
      <div class="fluency-category-card" id="fluency-cat-${cat.id}">
        <div class="fluency-header">
          <div class="fluency-cat-title">
            <span>🗣️</span>
            <span>${cat.title}</span>
          </div>
          <span class="badge badge-purple">${cat.badge}</span>
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 14px;">${cat.desc}</p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${cat.phrases.map((p, idx) => `
            <div class="phrase-item">
              <div class="phrase-en">"${p.en}"</div>
              <div class="phrase-tr">${p.tr}</div>
              <div class="phrase-actions">
                <button class="btn-copy-phrase" data-copy="${p.en}">📋 Kopyala</button>
                <button class="btn-speak" data-speak="${p.en}">🔊 Dinle</button>
              </div>
            </div>
          `).join('')}
        </div>

        ${cat.teacherTip ? `
          <div class="teacher-note">
            <span class="teacher-avatar">👨‍🏫</span>
            <div class="teacher-note-text">
              <strong>Öğretmen Notu:</strong> ${cat.teacherTip}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Filter chips listeners
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const targetCat = chip.getAttribute('data-fluency-filter');
      renderFluency(targetCat);
    });
  });

  // Copy phrase button delegation
  container.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-phrase');
    if (copyBtn) {
      const textToCopy = copyBtn.getAttribute('data-copy');
      if (textToCopy && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Kalıp panoya kopyalandı!', '📋');
        }).catch(() => {
          showToast('Kopyalanamadı, izin verin.', '⚠️');
        });
      }
    }
  });

  // Initial render
  renderFluency('all');
}

/* ==========================================================================
   8. 50 GRAMMAR RULES MODULE & FLASHCARD VIEW
   ========================================================================== */
const GRAMMAR_STORAGE_KEY = 'yigit_grammar_mastered';
const GRAMMAR_VIEW_MODE_KEY = 'yigit_grammar_flashcard_mode';

function initGrammarRules() {
  const container = document.getElementById('grammar-list-container');
  const flashcardWrapper = document.getElementById('grammar-flashcard-view');
  const btnToggleFlashcard = document.getElementById('btn-toggle-flashcard-mode');
  const btnReset = document.getElementById('btn-reset-grammar');
  const searchInput = document.getElementById('grammar-search-input');
  const categoryChips = document.querySelectorAll('#grammar-category-filters .chip');
  const progressText = document.getElementById('grammar-progress-text');
  const progressFill = document.getElementById('grammar-progress-fill');

  // Flashcard elements
  const flashcardCard = document.getElementById('active-flashcard');
  const flashcardFront = document.getElementById('flashcard-front');
  const flashcardBack = document.getElementById('flashcard-back');
  const btnPrevFlashcard = document.getElementById('btn-prev-flashcard');
  const btnFlipFlashcard = document.getElementById('btn-flip-flashcard');
  const btnNextFlashcard = document.getElementById('btn-next-flashcard');

  if (!container || typeof GRAMMAR_POINTS === 'undefined') return;

  let activeCategory = 'all';
  let searchTerm = '';
  let isFlashcardMode = localStorage.getItem(GRAMMAR_VIEW_MODE_KEY) === 'true';
  let activeFlashcardIdx = 0;

  function getMasteredSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem(GRAMMAR_STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveMasteredSet(set) {
    localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(Array.from(set)));
    updateProgressBar();
  }

  function updateProgressBar() {
    const mastered = getMasteredSet();
    const count = mastered.size;
    const total = GRAMMAR_POINTS.length;
    const pct = Math.round((count / total) * 100);

    if (progressText) progressText.textContent = `${count} / ${total} Kural Öğrenildi (%${pct})`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  function getFilteredRules() {
    return GRAMMAR_POINTS.filter(item => {
      // Category match
      let matchCat = true;
      if (activeCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        matchCat = itemCat.includes(activeCategory.toLowerCase());
      }

      // Search match
      let matchSearch = true;
      if (searchTerm) {
        const norm = (s) => (s || '').toLowerCase();
        const q = searchTerm.toLowerCase();
        const hay = norm(item.title) + ' ' + norm(item.rule) + ' ' + norm(item.tip) + ' ' +
                    (item.correct || []).join(' ').toLowerCase() + ' ' +
                    (item.incorrect || []).join(' ').toLowerCase();
        matchSearch = hay.includes(q);
      }

      return matchCat && matchSearch;
    });
  }

  function renderList() {
    const list = getFilteredRules();
    const mastered = getMasteredSet();

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <span style="font-size: 36px; display: block; margin-bottom: 8px;">🔍</span>
          <strong style="font-size: 15px; color: var(--text-main);">Aramanızla eşleşen gramer kuralı bulunamadı.</strong>
          <p style="font-size: 13px; margin-top: 4px;">Filtreleri sıfırlamayı veya farklı bir arama kelimesi denemeyi düşünün.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const isMastered = mastered.has(item.id);
      return `
        <div class="grammar-card ${isMastered ? 'mastered' : ''}" id="grammar-card-${item.id}">
          <div class="grammar-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-primary">Kural ${item.id}</span>
              <span class="badge badge-neutral">${item.category || 'Gramer'}</span>
            </div>
            <label class="checkbox-label" title="Bu kuralı öğrendim olarak işaretle">
              <input type="checkbox" class="grammar-check-input" data-id="${item.id}" ${isMastered ? 'checked' : ''} style="display: none;">
              <span class="checkbox-custom">${isMastered ? '✓' : ''}</span>
              <span>Öğrenildi</span>
            </label>
          </div>

          <h3 class="grammar-title">${item.title}</h3>
          <p class="grammar-rule-text">${item.rule}</p>

          <div class="grammar-examples">
            ${(item.incorrect || []).map(inc => `
              <div class="example-box example-incorrect">
                <span style="font-weight: 800; font-size: 15px; flex-shrink: 0;">✕</span>
                <div style="flex: 1;">
                  <strong>Yanlış (Sınav Tuzağı):</strong> <em>"${inc}"</em>
                </div>
              </div>
            `).join('')}

            ${(item.correct || []).map(cor => `
              <div class="example-box example-correct">
                <span style="font-weight: 800; font-size: 15px; flex-shrink: 0;">✓</span>
                <div style="flex: 1;">
                  <strong>Doğru (Band 8+):</strong> <em>"${cor}"</em>
                </div>
                <button class="btn-speak" data-speak="${cor}" title="Doğru telaffuzu dinle">🔊 Dinle</button>
              </div>
            `).join('')}
          </div>

          ${item.tip ? `
            <div class="teacher-note">
              <span class="teacher-avatar">👨‍🏫</span>
              <div class="teacher-note-text">
                <strong>Öğretmen İpucu:</strong> ${item.tip}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  function renderFlashcard() {
    const list = getFilteredRules();
    if (list.length === 0) {
      if (flashcardFront) flashcardFront.innerHTML = '<p>Seçili filtrede kural yok.</p>';
      return;
    }

    if (activeFlashcardIdx >= list.length) activeFlashcardIdx = 0;
    if (activeFlashcardIdx < 0) activeFlashcardIdx = list.length - 1;

    const current = list[activeFlashcardIdx];
    if (flashcardCard) flashcardCard.classList.remove('flipped');

    if (flashcardFront) {
      flashcardFront.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="badge badge-primary">Kural ${current.id} / ${list.length}</span>
            <span class="badge badge-neutral">${current.category || 'Gramer'}</span>
          </div>
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 14px; color: var(--text-main);">${current.title}</h3>
          <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6;">${current.rule}</p>
        </div>
        <div style="text-align: center; color: var(--brand-blue); font-size: 13px; font-weight: 700;">
          💡 Örnekleri ve Öğretmen İpucunu görmek için tıkla / çevir
        </div>
      `;
    }

    if (flashcardBack) {
      flashcardBack.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="badge badge-success">Doğru & Yanlış Kullanım</span>
            <button class="btn-speak" data-speak="${(current.correct || [])[0] || ''}">🔊 Doğruyu Dinle</button>
          </div>
          
          <div style="margin-bottom: 8px;">
            <div style="font-size: 12.5px; color: var(--danger); font-weight: 700;">✕ Sınavda Yanlış:</div>
            <div style="font-size: 13px; background: var(--danger-soft); color: var(--danger); padding: 8px 12px; border-radius: 6px; margin-top: 4px;">
              "${(current.incorrect || [])[0] || ''}"
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="font-size: 12.5px; color: var(--success); font-weight: 700;">✓ Doğru Band 8+ Yapı:</div>
            <div style="font-size: 13px; background: var(--success-soft); color: var(--success); padding: 8px 12px; border-radius: 6px; margin-top: 4px;">
              "${(current.correct || [])[0] || ''}"
            </div>
          </div>

          ${current.tip ? `
            <div style="font-size: 12.5px; color: var(--text-muted); background: var(--bg-subtle); padding: 8px 12px; border-radius: 6px;">
              👨‍🏫 <strong>Yiğit'e Not:</strong> ${current.tip}
            </div>
          ` : ''}
        </div>
        <div style="text-align: center; color: var(--text-light); font-size: 12px;">
          🔄 Ön yüze dönmek için tıkla
        </div>
      `;
    }
  }

  function toggleMode(flashcard) {
    isFlashcardMode = flashcard;
    localStorage.setItem(GRAMMAR_VIEW_MODE_KEY, String(flashcard));

    if (isFlashcardMode) {
      if (btnToggleFlashcard) btnToggleFlashcard.textContent = '📋 Liste Görünümü';
      if (flashcardWrapper) flashcardWrapper.style.display = 'block';
      if (container) container.style.display = 'none';
      renderFlashcard();
    } else {
      if (btnToggleFlashcard) btnToggleFlashcard.textContent = '🎴 Flashcard Modu';
      if (flashcardWrapper) flashcardWrapper.style.display = 'none';
      if (container) container.style.display = 'block';
      renderList();
    }
  }

  // Checkbox state toggle
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('grammar-check-input')) {
      const id = parseInt(e.target.getAttribute('data-id'), 10);
      const mastered = getMasteredSet();
      const card = document.getElementById(`grammar-card-${id}`);

      if (e.target.checked) {
        mastered.add(id);
        if (card) card.classList.add('mastered');
      } else {
        mastered.delete(id);
        if (card) card.classList.remove('mastered');
      }

      saveMasteredSet(mastered);
      renderList();
    }
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      if (isFlashcardMode) renderFlashcard();
      else renderList();
    });
  }

  // Category chips
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-category');
      activeFlashcardIdx = 0;
      if (isFlashcardMode) renderFlashcard();
      else renderList();
    });
  });

  // Flashcard controls
  if (btnToggleFlashcard) {
    btnToggleFlashcard.addEventListener('click', () => {
      toggleMode(!isFlashcardMode);
    });
  }

  if (flashcardCard) {
    flashcardCard.addEventListener('click', () => {
      flashcardCard.classList.toggle('flipped');
    });
  }

  if (btnFlipFlashcard) {
    btnFlipFlashcard.addEventListener('click', () => {
      if (flashcardCard) flashcardCard.classList.toggle('flipped');
    });
  }

  if (btnPrevFlashcard) {
    btnPrevFlashcard.addEventListener('click', () => {
      activeFlashcardIdx--;
      renderFlashcard();
    });
  }

  if (btnNextFlashcard) {
    btnNextFlashcard.addEventListener('click', () => {
      activeFlashcardIdx++;
      renderFlashcard();
    });
  }

  // Reset mastered progress
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Tüm gramer ilerlemen sıfırlansın mı?')) {
        localStorage.removeItem(GRAMMAR_STORAGE_KEY);
        updateProgressBar();
        renderList();
        showToast('Gramer ilerlemesi sıfırlandı.', '🔄');
      }
    });
  }

  // Initial state setup
  updateProgressBar();
  toggleMode(isFlashcardMode);
}

/* ==========================================================================
   9. 107 IDIOMS DICTIONARY MODULE
   ========================================================================== */
const FAVORITES_STORAGE_KEY = 'yigit_favorite_idioms';

function initIdioms() {
  const container = document.getElementById('idioms-list-container');
  const searchInput = document.getElementById('idioms-search-input');
  const setSelect = document.getElementById('idioms-set-select');
  const partChips = document.querySelectorAll('#idioms-part-filters .chip');
  const favCountSpan = document.getElementById('fav-count');
  const idiomsCountBadge = document.getElementById('idioms-count-badge');

  if (!container || typeof IDIOMS_DATA === 'undefined') return;

  let activePart = 'all';
  let activeSet = 'all';
  let searchTerm = '';

  function getFavorites() {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveFavorites(set) {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(set)));
    updateFavBadge();
  }

  function updateFavBadge() {
    const favs = getFavorites();
    if (favCountSpan) favCountSpan.textContent = favs.size;
  }

  function getFilteredIdioms() {
    const favs = getFavorites();
    return IDIOMS_DATA.filter(item => {
      // Favorites filter
      if (activePart === 'favorites') {
        if (!favs.has(item.id)) return false;
      } else if (activePart !== 'all') {
        if (item.part !== activePart) return false;
      }

      // Set filter
      if (activeSet !== 'all') {
        if (item.set !== activeSet) return false;
      }

      // Search match
      if (searchTerm) {
        const norm = (s) => (s || '').toLowerCase();
        const q = searchTerm.toLowerCase();
        const hay = norm(item.phrase) + ' ' + norm(item.meaning) + ' ' + norm(item.example) + ' ' + norm(item.tip);
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  function renderIdioms() {
    const list = getFilteredIdioms();
    const favs = getFavorites();

    if (idiomsCountBadge) idiomsCountBadge.textContent = `${list.length} Deyim Listeleniyor`;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <span style="font-size: 36px; display: block; margin-bottom: 8px;">📖</span>
          <strong style="font-size: 15px; color: var(--text-main);">Eşleşen deyim bulunamadı.</strong>
          <p style="font-size: 13px; margin-top: 4px;">Farklı bir arama kelimesi veya set seçin.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(item => {
      const isFav = favs.has(item.id);
      return `
        <div class="idiom-card" id="idiom-card-${item.id}">
          <div class="idiom-header">
            <div>
              <span class="badge badge-purple" style="margin-bottom: 6px;">${item.set || 'Deyim'}</span>
              <span class="badge badge-primary">${item.part || 'IELTS'}</span>
              <h3 class="idiom-phrase" style="margin-top: 4px;">"${item.phrase}"</h3>
            </div>
            <button class="btn-star-idiom ${isFav ? 'starred' : ''}" data-id="${item.id}" title="${isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}">
              ${isFav ? '★' : '☆'}
            </button>
          </div>

          <div class="idiom-meaning">
            <strong>Türkçe Anlamı:</strong> ${item.meaning}
          </div>

          <div class="idiom-example-box">
            <strong>Örnek Cümle:</strong> <em>"${item.example}"</em>
          </div>

          <div class="idiom-footer">
            <span style="font-size: 12px; color: var(--text-muted);">
              👨‍🏫 <strong>İpucu:</strong> ${item.tip}
            </span>
            <button class="btn-speak" data-speak="${item.phrase}. ${item.example}" title="Deyimi ve cümleyi dinle">
              🔊 Dinle
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Favorite toggle listener
  container.addEventListener('click', (e) => {
    const starBtn = e.target.closest('.btn-star-idiom');
    if (starBtn) {
      const id = parseInt(starBtn.getAttribute('data-id'), 10);
      const favs = getFavorites();
      if (favs.has(id)) {
        favs.delete(id);
        starBtn.classList.remove('starred');
        starBtn.textContent = '☆';
        showToast('Favorilerden çıkarıldı.', '⭐');
      } else {
        favs.add(id);
        starBtn.classList.add('starred');
        starBtn.textContent = '★';
        showToast('Deyim favorilere eklendi!', '⭐');
      }
      saveFavorites(favs);
      if (activePart === 'favorites') renderIdioms();
    }
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderIdioms();
    });
  }

  // Set dropdown
  if (setSelect) {
    setSelect.addEventListener('change', (e) => {
      activeSet = e.target.value;
      renderIdioms();
    });
  }

  // Part filter chips
  partChips.forEach(chip => {
    chip.addEventListener('click', () => {
      partChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activePart = chip.getAttribute('data-part');
      renderIdioms();
    });
  });

  // Initial render
  updateFavBadge();
  renderIdioms();
}

/* ==========================================================================
   10. EXAM SIMULATOR & VOICE RECORDING STUDIO (MEDIARECORDER API)
   ========================================================================== */
function initSimulator() {
  const btnMode1 = document.getElementById('sim-mode-part1');
  const btnMode2 = document.getElementById('sim-mode-part2');
  const btnMode3 = document.getElementById('sim-mode-part3');
  const badgePart = document.getElementById('sim-part-badge');
  const promptContainer = document.getElementById('sim-prompt-content');
  const btnNextPrompt = document.getElementById('btn-next-prompt');

  // Part 2 Timers
  const part2Timers = document.getElementById('part2-timer-section');
  const prepDisplay = document.getElementById('timer-prep-display');
  const speechDisplay = document.getElementById('timer-speech-display');
  const btnStartPrep = document.getElementById('btn-start-prep');
  const btnResetPrep = document.getElementById('btn-reset-prep');
  const btnStartSpeech = document.getElementById('btn-start-speech');
  const btnResetSpeech = document.getElementById('btn-reset-speech');

  // Voice Recorder
  const cardRecorder = document.getElementById('voice-recorder-card');
  const recDot = document.getElementById('rec-dot');
  const recText = document.getElementById('rec-text');
  const recTimerDisplay = document.getElementById('rec-duration-display');
  const btnRecordStart = document.getElementById('btn-record-start');
  const btnRecordStop = document.getElementById('btn-record-stop');
  const playbackSection = document.getElementById('rec-playback-section');
  const audioPlayer = document.getElementById('rec-audio-player');
  const btnDownloadRec = document.getElementById('btn-download-recording');
  const btnClearRec = document.getElementById('btn-clear-recording');
  const sessionHistoryDiv = document.getElementById('session-recordings-history');
  const historyList = document.getElementById('recordings-history-list');

  let currentMode = 'part1'; // 'part1' | 'part2' | 'part3'
  let part1Index = 0;
  let part2Index = 0;
  let part3Index = 0;

  // Timers state
  let prepTimerInterval = null;
  let prepSecondsRemaining = 60;
  let speechTimerInterval = null;
  let speechSecondsRemaining = 120;

  // MediaRecorder state
  let mediaRecorder = null;
  let audioChunks = [];
  let recordingInterval = null;
  let recordingElapsedSecs = 0;
  let currentRecordingBlobUrl = null;

  function renderCurrentPrompt() {
    if (currentMode === 'part1') {
      if (badgePart) badgePart.textContent = 'Part 1: Tanışma ve Genel Sorular';
      if (part2Timers) part2Timers.style.display = 'none';

      if (typeof PART1_QUESTIONS === 'undefined' || PART1_QUESTIONS.length === 0) return;
      const qGroup = PART1_QUESTIONS[part1Index % PART1_QUESTIONS.length];
      const qList = qGroup.questions || [qGroup.title || 'Where are you from?'];

      promptContainer.innerHTML = `
        <div>
          <span class="badge badge-purple" style="margin-bottom: 6px;">Konu: ${qGroup.topic || 'Genel'}</span>
          <h3 class="sim-question-text">${qList[0]}</h3>
          <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); margin-top: 10px;">
            <strong style="font-size: 13px; color: var(--brand-blue); display: block; margin-bottom: 6px;">Takip Soruları:</strong>
            <ul style="font-size: 13px; padding-left: 20px; line-height: 1.6;">
              ${qList.slice(1).map(q => `<li>${q}</li>`).join('')}
            </ul>
          </div>
          <div class="teacher-note">
            <span class="teacher-avatar">👨‍🏫</span>
            <div class="teacher-note-text">
              <strong>Kural 1 & 2 Uygula:</strong> Asla sadece tek kelime cevap verme! Doğrudan Cevap + Konum/Açıklama + Kişisel Yorum formülünü kullan.
            </div>
          </div>
        </div>
      `;
    } else if (currentMode === 'part2') {
      if (badgePart) badgePart.textContent = 'Part 2: Bireysel Uzun Konuşma (Cue Card)';
      if (part2Timers) part2Timers.style.display = 'grid';

      if (typeof CUE_CARDS === 'undefined' || CUE_CARDS.length === 0) return;
      const card = CUE_CARDS[part2Index % CUE_CARDS.length];

      promptContainer.innerHTML = `
        <div>
          <span class="badge badge-warning" style="margin-bottom: 6px;">Cue Card #${part2Index + 1}</span>
          <h3 class="sim-question-text">${card.topic}</h3>
          <p style="font-size: 13.5px; color: var(--text-muted);">You should say:</p>
          <ul class="cue-card-bullets">
            ${(card.bulletPoints || card.bullets || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
          <div class="teacher-note">
            <span class="teacher-avatar">👨‍🏫</span>
            <div class="teacher-note-text">
              <strong>Kural 4 (Sınav Görevlisinden Çok Konuş):</strong> 1 dakika hazırlıkta her madde için bir anahtar kelime yaz. 2 dakika boyunca duraksamadan anlat.
            </div>
          </div>
        </div>
      `;
    } else {
      // Part 3
      if (badgePart) badgePart.textContent = 'Part 3: İki Yönlü Soyut Tartışma';
      if (part2Timers) part2Timers.style.display = 'none';

      if (typeof PART3_QUESTIONS === 'undefined' || PART3_QUESTIONS.length === 0) return;
      const p3 = PART3_QUESTIONS[part3Index % PART3_QUESTIONS.length];

      promptContainer.innerHTML = `
        <div>
          <span class="badge badge-success" style="margin-bottom: 6px;">Tartışma Teması: ${p3.topic || 'Toplumsal Dinamikler'}</span>
          <h3 class="sim-question-text">${p3.question || (p3.questions ? p3.questions[0] : 'What are the main consequences?')}</h3>
          <div style="background: var(--bg-subtle); padding: 12px; border-radius: var(--radius-md); margin-top: 10px;">
            <strong style="font-size: 13px; color: var(--brand-blue); display: block; margin-bottom: 6px;">İpuçları & Beklenti:</strong>
            <p style="font-size: 13px; line-height: 1.5; color: var(--text-muted);">
              Kişisel tecrübeden ziyade toplumsal, ekonomik veya küresel açıdan iki zıt görüşü karşılaştırarak cevap ver.
            </p>
          </div>
          <div class="teacher-note">
            <span class="teacher-avatar">👨‍🏫</span>
            <div class="teacher-note-text">
              <strong>Kural 7 (Cevabını Genişlet):</strong> 'On the one hand..., but when viewed from another angle...' kalıbını kullanarak derinlemesine analiz yap.
            </div>
          </div>
        </div>
      `;
    }
  }

  // Switch modes
  [btnMode1, btnMode2, btnMode3].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      [btnMode1, btnMode2, btnMode3].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.getAttribute('data-mode');
      renderCurrentPrompt();
    });
  });

  // Next prompt button
  if (btnNextPrompt) {
    btnNextPrompt.addEventListener('click', () => {
      if (currentMode === 'part1') part1Index++;
      else if (currentMode === 'part2') part2Index++;
      else part3Index++;
      renderCurrentPrompt();
    });
  }

  // Timer helpers
  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // Part 2 Prep Countdown (1 min)
  if (btnStartPrep) {
    btnStartPrep.addEventListener('click', () => {
      if (prepTimerInterval) {
        clearInterval(prepTimerInterval);
        prepTimerInterval = null;
        btnStartPrep.textContent = 'Devam Et';
        return;
      }
      btnStartPrep.textContent = 'Duraklat';
      prepTimerInterval = setInterval(() => {
        prepSecondsRemaining--;
        if (prepDisplay) {
          prepDisplay.textContent = formatTime(prepSecondsRemaining);
          if (prepSecondsRemaining <= 10) prepDisplay.classList.add('urgent');
        }
        if (prepSecondsRemaining <= 0) {
          clearInterval(prepTimerInterval);
          prepTimerInterval = null;
          btnStartPrep.textContent = 'Bitti';
          showToast('1 Dakikalık Hazırlık Süreniz Doldu! Konuşmaya başlayın.', '⏰');
          // Beep audio indicator
          playBeep();
        }
      }, 1000);
    });
  }

  if (btnResetPrep) {
    btnResetPrep.addEventListener('click', () => {
      if (prepTimerInterval) clearInterval(prepTimerInterval);
      prepTimerInterval = null;
      prepSecondsRemaining = 60;
      if (prepDisplay) {
        prepDisplay.textContent = '01:00';
        prepDisplay.classList.remove('urgent');
      }
      if (btnStartPrep) btnStartPrep.textContent = 'Başlat';
    });
  }

  // Part 2 Speaking Countdown (2 min)
  if (btnStartSpeech) {
    btnStartSpeech.addEventListener('click', () => {
      if (speechTimerInterval) {
        clearInterval(speechTimerInterval);
        speechTimerInterval = null;
        btnStartSpeech.textContent = 'Devam Et';
        return;
      }
      btnStartSpeech.textContent = 'Duraklat';
      speechTimerInterval = setInterval(() => {
        speechSecondsRemaining--;
        if (speechDisplay) {
          speechDisplay.textContent = formatTime(speechSecondsRemaining);
          if (speechSecondsRemaining <= 15) speechDisplay.classList.add('urgent');
        }
        if (speechSecondsRemaining <= 0) {
          clearInterval(speechTimerInterval);
          speechTimerInterval = null;
          btnStartSpeech.textContent = 'Bitti';
          showToast('2 Dakikalık Konuşma Süreniz Tamamlandı! Teşekkürler.', '🛑');
          playBeep();
        }
      }, 1000);
    });
  }

  if (btnResetSpeech) {
    btnResetSpeech.addEventListener('click', () => {
      if (speechTimerInterval) clearInterval(speechTimerInterval);
      speechTimerInterval = null;
      speechSecondsRemaining = 120;
      if (speechDisplay) {
        speechDisplay.textContent = '02:00';
        speechDisplay.classList.remove('urgent');
      }
      if (btnStartSpeech) btnStartSpeech.textContent = 'Başlat';
    });
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (err) {
      console.warn('AudioContext beep error:', err);
    }
  }

  // ==========================================
  // MEDIARECORDER RECORDING ENGINE
  // ==========================================
  async function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Tarayıcınız ses kaydını desteklemiyor.', '⚠️');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        if (currentRecordingBlobUrl) URL.revokeObjectURL(currentRecordingBlobUrl);
        currentRecordingBlobUrl = URL.createObjectURL(audioBlob);

        if (audioPlayer) {
          audioPlayer.src = currentRecordingBlobUrl;
        }
        if (playbackSection) playbackSection.style.display = 'flex';

        // Add to session history
        addRecordingToSessionHistory(currentRecordingBlobUrl, recordingElapsedSecs);

        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();

      // UI state
      if (cardRecorder) cardRecorder.classList.add('recording');
      if (recText) recText.textContent = 'Kayıt Yapılıyor...';
      if (btnRecordStart) btnRecordStart.style.display = 'none';
      if (btnRecordStop) btnRecordStop.style.display = 'inline-flex';

      recordingElapsedSecs = 0;
      if (recTimerDisplay) recTimerDisplay.textContent = '00:00';

      recordingInterval = setInterval(() => {
        recordingElapsedSecs++;
        if (recTimerDisplay) recTimerDisplay.textContent = formatTime(recordingElapsedSecs);
      }, 1000);

      showToast('Kayıt başladı. Rahat ve tane tane konuşun.', '🎙️');
    } catch (err) {
      console.error('Mic access error:', err);
      showToast('Mikrofon erişim izni verilmedi!', '❌');
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (recordingInterval) clearInterval(recordingInterval);
    recordingInterval = null;

    if (cardRecorder) cardRecorder.classList.remove('recording');
    if (recText) recText.textContent = 'Kayıt Tamamlandı';
    if (btnRecordStart) btnRecordStart.style.display = 'inline-flex';
    if (btnRecordStop) btnRecordStop.style.display = 'none';

    showToast('Ses kaydı kaydedildi. Aşağıdan dinleyin.', '✅');
  }

  if (btnRecordStart) btnRecordStart.addEventListener('click', startRecording);
  if (btnRecordStop) btnRecordStop.addEventListener('click', stopRecording);

  if (btnDownloadRec) {
    btnDownloadRec.addEventListener('click', () => {
      if (!currentRecordingBlobUrl) return;
      const a = document.createElement('a');
      a.href = currentRecordingBlobUrl;
      a.download = `Yigit_IELTS_Speaking_${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Ses kaydı bilgisayarınıza indirildi.', '💾');
    });
  }

  if (btnClearRec) {
    btnClearRec.addEventListener('click', () => {
      if (audioPlayer) audioPlayer.src = '';
      if (playbackSection) playbackSection.style.display = 'none';
      if (recTimerDisplay) recTimerDisplay.textContent = '00:00';
      if (recText) recText.textContent = 'Mikrofon Hazır';
      showToast('Kayıt temizlendi.', '🗑️');
    });
  }

  function addRecordingToSessionHistory(blobUrl, duration) {
    if (!sessionHistoryDiv || !historyList) return;
    sessionHistoryDiv.style.display = 'block';

    const item = document.createElement('div');
    item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px; background: var(--bg-subtle); border-radius: 8px; margin-top: 6px; font-size: 13px;';
    item.innerHTML = `
      <div>
        <strong>Kayıt:</strong> ${new Date().toLocaleTimeString()} (${formatTime(duration)})
      </div>
      <div style="display: flex; gap: 6px;">
        <audio src="${blobUrl}" controls style="height: 32px; width: 180px;"></audio>
      </div>
    `;
    historyList.prepend(item);
  }

  // Initial render
  renderCurrentPrompt();
}

/* ==========================================================================
   11. ERROR HUNTER QUIZ MODULE
   ========================================================================== */
const QUIZ_STORAGE_KEY = 'yigit_quiz_answered';

function initQuiz() {
  const container = document.getElementById('quiz-container');
  const scoreBadge = document.getElementById('quiz-score-badge');
  const btnReset = document.getElementById('btn-reset-quiz');

  if (!container || typeof QUIZ_QUESTIONS === 'undefined') return;

  let answeredMap = {};
  try {
    answeredMap = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) || '{}');
  } catch {
    answeredMap = {};
  }

  function updateScore() {
    const answeredKeys = Object.keys(answeredMap);
    let correctCount = 0;
    answeredKeys.forEach(k => {
      if (answeredMap[k].isCorrect) correctCount++;
    });
    const total = QUIZ_QUESTIONS.length;
    if (scoreBadge) {
      scoreBadge.textContent = `Skor: ${correctCount} / ${total}`;
      if (answeredKeys.length === total) {
        scoreBadge.classList.add('badge-success');
      }
    }
  }

  function renderQuiz() {
    container.innerHTML = QUIZ_QUESTIONS.map((q, idx) => {
      const prevAns = answeredMap[idx];
      const isAnswered = prevAns !== undefined;

      return `
        <div class="quiz-card" id="quiz-question-${idx}">
          <div class="quiz-header">
            <span class="quiz-question-num">Soru ${idx + 1} / ${QUIZ_QUESTIONS.length}</span>
            ${isAnswered ? `
              <span class="badge ${prevAns.isCorrect ? 'badge-success' : 'badge-danger'}">
                ${prevAns.isCorrect ? '✓ Doğru' : '✕ Hatalı'}
              </span>
            ` : ''}
          </div>

          <div class="quiz-question-stem">${q.question}</div>

          <div class="quiz-options-list">
            ${(q.options || []).map((opt, optIdx) => {
              let optClass = '';
              if (isAnswered) {
                if (optIdx === q.correct) optClass = 'correct';
                else if (optIdx === prevAns.selected) optClass = 'incorrect';
                else optClass = 'disabled';
              }
              return `
                <button class="quiz-opt-btn ${optClass}" data-q="${idx}" data-opt="${optIdx}" ${isAnswered ? 'disabled' : ''}>
                  <span style="font-family: var(--font-mono); font-weight: 800;">${String.fromCharCode(65 + optIdx)})</span>
                  <span>${opt}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${isAnswered ? `
            <div class="quiz-explanation-box">
              <strong style="color: ${prevAns.isCorrect ? 'var(--success)' : 'var(--danger)'};">
                ${prevAns.isCorrect ? '🎉 Harika, Tam İsabet!' : '💡 Dikkat, Sınav Tuzağı:'}
              </strong>
              <p style="margin-top: 4px; color: var(--text-main);">${q.explanation}</p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    updateScore();
  }

  // Answer selection listener
  container.addEventListener('click', (e) => {
    const optBtn = e.target.closest('.quiz-opt-btn');
    if (optBtn && !optBtn.classList.contains('disabled')) {
      const qIdx = parseInt(optBtn.getAttribute('data-q'), 10);
      const selectedOpt = parseInt(optBtn.getAttribute('data-opt'), 10);
      const question = QUIZ_QUESTIONS[qIdx];
      const isCorrect = (selectedOpt === question.correct);

      answeredMap[qIdx] = {
        selected: selectedOpt,
        isCorrect: isCorrect
      };

      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answeredMap));
      renderQuiz();

      if (isCorrect) {
        showToast('Tebrikler Yiğit! Doğru cevap.', '🎉');
      } else {
        showToast('Tuzağa düştün! Açıklamayı oku.', '💡');
      }
    }
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Tüm quiz yanıtların sıfırlansın mı?')) {
        answeredMap = {};
        localStorage.removeItem(QUIZ_STORAGE_KEY);
        renderQuiz();
        showToast('Quiz sıfırlandı.', '🔄');
      }
    });
  }

  // Initial render
  renderQuiz();
}

/* ==========================================================================
   12. 28-DAY STUDY PLAN MODULE
   ========================================================================== */
const PLAN_STORAGE_KEY = 'yigit_study_plan_checked';

function initStudyPlan() {
  const container = document.getElementById('study-plan-container');
  const badge = document.getElementById('plan-progress-badge');
  const progressFill = document.getElementById('plan-progress-fill');
  const btnReset = document.getElementById('btn-reset-plan');

  if (!container || typeof STUDY_PLAN === 'undefined') return;

  function getCheckedDays() {
    try {
      return new Set(JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveCheckedDays(set) {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(Array.from(set)));
    updatePlanBadge();
  }

  function updatePlanBadge() {
    const checked = getCheckedDays();
    const count = checked.size;
    const total = STUDY_PLAN.length;
    const pct = Math.round((count / total) * 100);

    if (badge) badge.textContent = `${count} / ${total} Gün Tamamlandı (%${pct})`;
    if (progressFill) progressFill.style.width = `${pct}%`;
  }

  function renderPlan() {
    const checked = getCheckedDays();

    const weeks = [
      { num: 1, title: 'Hafta 1: Fluency & Akıcılık İskeletleri (Part 1 Odaklı)', days: STUDY_PLAN.slice(0, 7) },
      { num: 2, title: 'Hafta 2: Part 2 Cue Card Ustalığı & Hikaye Anlatımı', days: STUDY_PLAN.slice(7, 14) },
      { num: 3, title: 'Hafta 3: Part 3 Analitik Düşünce & Soyut Tartışma', days: STUDY_PLAN.slice(14, 21) },
      { num: 4, title: 'Hafta 4: Full Mock Sınavlar & Hata Eliminasyonu', days: STUDY_PLAN.slice(21, 28) }
    ];

    container.innerHTML = weeks.map(w => `
      <div class="week-card">
        <h3 class="week-title">
          <span>📅 ${w.title}</span>
        </h3>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${w.days.map(d => {
            const isDone = checked.has(d.day);
            return `
              <div class="plan-day-item ${isDone ? 'completed' : ''}" id="plan-day-${d.day}">
                <span class="day-badge">Gün ${d.day}</span>
                <div class="plan-day-content">
                  <h4 class="plan-day-title">${d.focus || d.title || 'Günlük Çalışma'}</h4>
                  <p class="plan-day-task">${d.task || d.desc || ''}</p>
                </div>
                <label class="checkbox-label" style="align-self: center;">
                  <input type="checkbox" class="plan-check-input" data-day="${d.day}" ${isDone ? 'checked' : ''} style="display: none;">
                  <span class="checkbox-custom">${isDone ? '✓' : ''}</span>
                </label>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    updatePlanBadge();
  }

  // Checkbox toggle listener
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('plan-check-input')) {
      const day = parseInt(e.target.getAttribute('data-day'), 10);
      const checked = getCheckedDays();
      const itemRow = document.getElementById(`plan-day-${day}`);

      if (e.target.checked) {
        checked.add(day);
        if (itemRow) itemRow.classList.add('completed');
        showToast(`Gün ${day} tamamlandı! Aferin Yiğit.`, '🏆');
      } else {
        checked.delete(day);
        if (itemRow) itemRow.classList.remove('completed');
      }

      saveCheckedDays(checked);
      renderPlan();
    }
  });

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('28 Günlük çalışma planı ilerlemen sıfırlansın mı?')) {
        localStorage.removeItem(PLAN_STORAGE_KEY);
        updatePlanBadge();
        renderPlan();
        showToast('Çalışma planı sıfırlandı.', '🔄');
      }
    });
  }

  // Initial render
  renderPlan();
}

/* ==========================================================================
   13. GLOBAL FUZZY SEARCH ENGINE
   ========================================================================== */
function normalizeForSearch(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function initGlobalSearch() {
  const input = document.getElementById('global-search-input');
  const dropdown = document.getElementById('search-results-dropdown');
  const resultsList = document.getElementById('search-results-list');
  const btnClear = document.getElementById('btn-clear-search');

  if (!input || !dropdown || !resultsList) return;

  // Build searchable index from all data modules
  const searchIndex = [];

  // 1. 50 Grammar Rules
  if (typeof GRAMMAR_POINTS !== 'undefined') {
    GRAMMAR_POINTS.forEach(item => {
      searchIndex.push({
        id: `grammar-${item.id}`,
        domId: `grammar-card-${item.id}`,
        tab: 'grammar-rules',
        category: 'Gramer Kuralı',
        badgeClass: 'badge-primary',
        title: `Kural ${item.id}: ${item.title}`,
        snippet: item.rule || (item.correct ? item.correct[0] : ''),
        searchCorpus: `${item.title} ${item.rule} ${(item.correct || []).join(' ')} ${(item.incorrect || []).join(' ')} ${item.tip} ${item.category}`
      });
    });
  }

  // 2. 107 Idioms
  if (typeof IDIOMS_DATA !== 'undefined') {
    IDIOMS_DATA.forEach(item => {
      searchIndex.push({
        id: `idiom-${item.id}`,
        domId: `idiom-card-${item.id}`,
        tab: 'idioms',
        category: 'Deyim / İdiom',
        badgeClass: 'badge-purple',
        title: `"${item.phrase}"`,
        snippet: `${item.meaning} - Örnek: "${item.example}"`,
        searchCorpus: `${item.phrase} ${item.meaning} ${item.example} ${item.tip} ${item.part} ${item.set}`
      });
    });
  }

  // 3. Essential Tips
  if (typeof ESSENTIAL_TIPS !== 'undefined') {
    // Part 1 rules
    (ESSENTIAL_TIPS.part1?.rules || []).forEach(r => {
      searchIndex.push({
        id: `tip-p1-${r.num}`,
        domId: 'tip-card-part1',
        tab: 'essential-tips',
        category: 'Part 1 İpucu',
        badgeClass: 'badge-warning',
        title: `Part 1 Kural ${r.num}: ${r.title}`,
        snippet: r.teacherTip || '',
        searchCorpus: `${r.title} ${r.teacherTip || ''} ${(r.dialogue ? r.dialogue.candidate : '')}`
      });
    });

    // Part 2 rules
    (ESSENTIAL_TIPS.part2?.rules || []).forEach(r => {
      searchIndex.push({
        id: `tip-p2-${r.num}`,
        domId: 'tip-card-part2',
        tab: 'essential-tips',
        category: 'Part 2 İpucu',
        badgeClass: 'badge-warning',
        title: `Part 2 Kural ${r.num}: ${r.title}`,
        snippet: r.teacherTip || r.content || '',
        searchCorpus: `${r.title} ${r.content || ''} ${r.teacherTip || ''}`
      });
    });

    // Part 3 rules
    (ESSENTIAL_TIPS.part3?.rules || []).forEach(r => {
      searchIndex.push({
        id: `tip-p3-${r.num}`,
        domId: 'tip-card-part3',
        tab: 'essential-tips',
        category: 'Part 3 İpucu',
        badgeClass: 'badge-warning',
        title: `Part 3 Kural ${r.num}: ${r.title}`,
        snippet: r.teacherTip || '',
        searchCorpus: `${r.title} ${r.teacherTip || ''} ${(r.recoveryQuestions || []).join(' ')}`
      });
    });
  }

  // 4. Fluency Categories & Phrases
  FLUENCY_CATEGORIES_DATA.forEach(cat => {
    cat.phrases.forEach((p, idx) => {
      searchIndex.push({
        id: `fluency-${cat.id}-${idx}`,
        domId: `fluency-cat-${cat.id}`,
        tab: 'fluency',
        category: 'Fluency İskeleti',
        badgeClass: 'badge-success',
        title: `"${p.en}"`,
        snippet: `${cat.title} - ${p.tr}`,
        searchCorpus: `${p.en} ${p.tr} ${cat.title} ${cat.desc} ${cat.teacherTip}`
      });
    });
  });

  // Pre-normalize index
  searchIndex.forEach(item => {
    item.normalizedCorpus = normalizeForSearch(item.searchCorpus);
  });

  function performSearch() {
    const rawQuery = input.value.trim();
    if (!rawQuery) {
      dropdown.classList.remove('visible');
      if (btnClear) btnClear.classList.remove('visible');
      return;
    }

    if (btnClear) btnClear.classList.add('visible');

    const normQuery = normalizeForSearch(rawQuery);
    const tokens = normQuery.split(' ').filter(t => t.length > 0);

    // Filter index
    const matches = searchIndex.filter(item => {
      return tokens.every(token => item.normalizedCorpus.includes(token));
    }).slice(0, 15); // Show top 15 results

    if (matches.length === 0) {
      resultsList.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          "${rawQuery}" için eşleşen içerik bulunamadı.
        </div>
      `;
    } else {
      resultsList.innerHTML = matches.map(m => `
        <div class="search-result-item" data-tab="${m.tab}" data-dom="${m.domId}">
          <div class="search-item-top">
            <span class="search-item-title">${m.title}</span>
            <span class="badge ${m.badgeClass}">${m.category}</span>
          </div>
          <div class="search-item-snippet">${m.snippet}</div>
        </div>
      `).join('');
    }

    dropdown.classList.add('visible');
  }

  input.addEventListener('input', performSearch);
  input.addEventListener('focus', performSearch);

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      input.value = '';
      dropdown.classList.remove('visible');
      btnClear.classList.remove('visible');
      input.focus();
    });
  }

  // Handle click on search item
  resultsList.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (item) {
      const tab = item.getAttribute('data-tab');
      const domId = item.getAttribute('data-dom');

      dropdown.classList.remove('visible');

      if (window.switchTab) {
        window.switchTab(tab);
      }

      setTimeout(() => {
        const targetEl = document.getElementById(domId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.remove('pulse-target');
          void targetEl.offsetWidth; // trigger reflow
          targetEl.classList.add('pulse-target');
        }
      }, 250);
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.global-search-container')) {
      dropdown.classList.remove('visible');
    }
  });
}

/* ==========================================================================
   14. TOAST NOTIFICATION SYSTEM
   ========================================================================== */
function showToast(message, icon = 'ℹ️') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span style="font-size: 18px; line-height: 1;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2800);
}
