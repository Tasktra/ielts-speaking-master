// app.js - IELTS Speaking Master Interactive Web Application for Yiğit

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initBandCalculator();
  initEssentialTips();
  initFluencyTTS();
  initGrammarRules();
  initIdioms();
  initSimulator();
  initQuiz();
  initStudyPlan();
  initGlobalSearch();
});

/* ==========================================================================
   1. NAVIGATION & LAYOUT
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.view-section');
  const mobileToggle = document.getElementById('btn-toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  const quickRecordBtn = document.getElementById('btn-quick-record');

  function switchTab(targetId, saveState = true) {
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
    const activeSection = document.getElementById(`sec-${targetId}`);

    if (activeLink) activeLink.classList.add('active');
    if (activeSection) {
      activeSection.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (saveState) {
      localStorage.setItem('yigit_active_tab', targetId);
    }

    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }
  }

  // Restore saved tab on load
  const savedTab = localStorage.getItem('yigit_active_tab');
  if (savedTab && document.getElementById(`sec-${savedTab}`)) {
    switchTab(savedTab, false);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      switchTab(target);
    });
  });

  if (quickRecordBtn) {
    quickRecordBtn.addEventListener('click', () => switchTab('simulator'));
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

/* ==========================================================================
   2. THEME CONTROLLER
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('yigit_ielts_theme') || 'light';

  function setTheme(t) {
    document.body.setAttribute('data-theme', t);
    localStorage.setItem('yigit_ielts_theme', t);
    if (themeIcon) {
      themeIcon.textContent = t === 'dark' ? '☀️' : '🌙';
    }
  }

  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const cur = document.body.getAttribute('data-theme') || 'light';
      setTheme(cur === 'dark' ? 'light' : 'dark');
      showToast(cur === 'dark' ? 'Açık tema aktifleştirildi' : 'Karanlık tema aktifleştirildi', '🎨');
    });
  }
}

/* ==========================================================================
   3. BAND SCORE CALCULATOR (Official IELTS Rounding Algorithm)
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

  // Restore saved band slider values
  const savedSliders = JSON.parse(localStorage.getItem('yigit_band_sliders') || 'null');
  if (savedSliders) {
    if (sliderFC && savedSliders.fc) sliderFC.value = savedSliders.fc;
    if (sliderLR && savedSliders.lr) sliderLR.value = savedSliders.lr;
    if (sliderGRA && savedSliders.gra) sliderGRA.value = savedSliders.gra;
    if (sliderPR && savedSliders.pr) sliderPR.value = savedSliders.pr;
  }

  function calculateBand() {
    if (!sliderFC || !sliderLR || !sliderGRA || !sliderPR) return;
    const fc = parseFloat(sliderFC.value);
    const lr = parseFloat(sliderLR.value);
    const gra = parseFloat(sliderGRA.value);
    const pr = parseFloat(sliderPR.value);

    localStorage.setItem('yigit_band_sliders', JSON.stringify({ fc, lr, gra, pr }));

    if (valFC) valFC.textContent = fc.toFixed(1);
    if (valLR) valLR.textContent = lr.toFixed(1);
    if (valGRA) valGRA.textContent = gra.toFixed(1);
    if (valPR) valPR.textContent = pr.toFixed(1);

    const rawAvg = (fc + lr + gra + pr) / 4;
    const whole = Math.floor(rawAvg);
    const fraction = rawAvg - whole;
    let rounded = whole;

    if (fraction < 0.25) {
      rounded = whole;
    } else if (fraction >= 0.25 && fraction < 0.75) {
      rounded = whole + 0.5;
    } else {
      rounded = whole + 1.0;
    }

    if (calcScore) calcScore.textContent = rounded.toFixed(1);

    let status = '';
    if (rounded >= 8.5) status = 'Kusursuz - Uzman ve Yerli Düzey (Expert Speaker)';
    else if (rounded >= 8.0) status = 'Mükemmel - Çok İleri Düzey Yetkin Konuşmacı';
    else if (rounded >= 7.5) status = 'Çok İyi - Akıcı ve Doğal İleri Seviye (Yiğit Hedef Bandı)';
    else if (rounded >= 7.0) status = 'İyi - Yetkin ve Hatasız Cümle Üretebilen Konuşmacı';
    else if (rounded >= 6.5) status = 'Orta-İleri - Sınırda (Hatasız Cümle Sayısı Artırılmalı)';
    else status = 'Geliştirilmeli - Temel Gramer ve Kelime Eksikleri Var';

    if (calcStatus) calcStatus.textContent = status;
    if (calcDetails) {
      calcDetails.textContent = `Ham Ortalama: ${rawAvg.toFixed(3)} ➔ Resmi IELTS Yuvarlaması ile Band ${rounded.toFixed(1)}`;
    }
  }

  [sliderFC, sliderLR, sliderGRA, sliderPR].forEach(s => {
    if (s) s.addEventListener('input', calculateBand);
  });

  calculateBand();
}

/* ==========================================================================
   4. ESSENTIAL TIPS (Kitap Sayfa 37 - 42)
   ========================================================================== */
function initEssentialTips() {
  const container = document.getElementById('tips-container');
  const filterChips = document.querySelectorAll('[data-tips-filter]');

  if (!container || typeof ESSENTIAL_TIPS === 'undefined') return;

  function renderTips(filter = 'all') {
    let html = '';

    // PART 1 (Sayfa 37 - 38)
    if (filter === 'all' || filter === 'part1') {
      const p1 = ESSENTIAL_TIPS.part1;
      html += `
        <div class="tip-box highlight" style="margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="color: var(--brand-blue); font-size: 16px;">📌 ${p1.title}</h3>
            <span class="badge badge-primary">Kitap Sayfa 37 - 38</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">${p1.desc}</p>
          
          <div style="background: var(--bg-subtle); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <strong style="font-size: 12px; text-transform: uppercase; color: var(--brand-blue);">Kitaptaki Örnek Sorular (Sample Questions):</strong>
            <ul style="margin: 6px 0 0 18px; font-size: 13px;">
              ${(p1.sampleQuestions || []).map(q => `<li><strong>${q}</strong></li>`).join('')}
            </ul>
          </div>

          <!-- Rules -->
          ${(p1.rules || []).map(r => `
            <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px;">
              <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Kural ${r.num}: ${r.title}</h4>
              ${r.dialogue ? `
                <div style="background: var(--bg-subtle); border-left: 3px solid var(--brand-blue); padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 8px;">
                  <div><strong>Examiner:</strong> ${r.dialogue.examiner}</div>
                  <div style="margin-top: 4px;"><strong>Candidate:</strong> ${r.dialogue.candidate}</div>
                </div>
              ` : ''}
              ${r.dialogueNegative ? `
                <div style="background: var(--bg-subtle); border-left: 3px solid #dc2626; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 8px;">
                  <div><strong>Examiner:</strong> ${r.dialogueNegative.examiner}</div>
                  <div style="margin-top: 4px;"><strong>Candidate:</strong> ${r.dialogueNegative.candidate}</div>
                </div>
              ` : ''}
              ${r.phrases ? `
                <div style="background: var(--bg-subtle); padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 8px;">
                  <strong style="color: var(--brand-blue);">Kitaptaki Soru Anlaşılmadığında Kullanılacak Kalıplar:</strong>
                  <ul style="margin: 4px 0 0 18px;">
                    ${r.phrases.map(cp => `<li><em>"${cp}"</em></li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <div class="teacher-note">
                <span class="avatar">👨‍🏫</span>
                <div class="teacher-note-text"><strong>Öğretmen Tavsiyesi:</strong> ${r.teacherTip}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // PART 2 (Sayfa 39 - 40)
    if (filter === 'all' || filter === 'part2') {
      const p2 = ESSENTIAL_TIPS.part2;
      html += `
        <div class="tip-box highlight" style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="color: var(--brand-blue); font-size: 16px;">📌 ${p2.title}</h3>
            <span class="badge badge-warning">Kitap Sayfa 39 - 40</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">${p2.desc}</p>
          
          ${p2.sampleTask ? `
            <div class="cue-card-box" style="margin-bottom: 16px;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #b45309; margin-bottom: 4px;">Kitaptaki Örnek Görev (Sample Task):</div>
              <div style="font-size: 15px; font-weight: 800; margin-bottom: 6px;">${p2.sampleTask.prompt}</div>
              <ul style="margin-left: 20px; font-size: 13.5px;">
                ${(p2.sampleTask.bullets || []).map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Rules -->
          ${(p2.rules || []).map(r => `
            <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px;">
              <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Kural ${r.num}: ${r.title}</h4>
              ${r.starters ? `
                <div style="background: var(--bg-subtle); border-left: 3px solid var(--brand-blue); padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 8px;">
                  <strong style="color: var(--brand-blue);">Kitaptaki Vurucu Girişler (Catchy Starters):</strong>
                  <ul style="margin: 4px 0 0 18px;">
                    ${r.starters.map(st => `<li><em>"${st}"</em></li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${r.signposts ? `
                <div style="background: var(--bg-subtle); padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 8px;">
                  <strong style="color: var(--brand-blue);">Kullanılacak Geçiş Sinyalleri (Signposts):</strong>
                  <ul style="margin: 4px 0 0 18px;">
                    ${r.signposts.map(sp => `<li><em>"${sp}"</em></li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              <div class="teacher-note">
                <span class="avatar">👨‍🏫</span>
                <div class="teacher-note-text"><strong>Öğretmen Tavsiyesi:</strong> ${r.teacherTip}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // PART 3 (Sayfa 41 - 42)
    if (filter === 'all' || filter === 'part3') {
      const p3 = ESSENTIAL_TIPS.part3;
      html += `
        <div class="tip-box highlight" style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="color: var(--brand-blue); font-size: 16px;">📌 ${p3.title}</h3>
            <span class="badge badge-success">Kitap Sayfa 41 - 42</span>
          </div>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">${p3.desc}</p>

          <div style="background: var(--bg-subtle); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <strong style="font-size: 12px; text-transform: uppercase; color: var(--brand-blue);">Kitaptaki Örnek Sorular (Sample Questions):</strong>
            <ul style="margin: 6px 0 0 18px; font-size: 13px;">
              ${(p3.sampleQuestions || []).map(q => `<li><strong>${q}</strong></li>`).join('')}
            </ul>
          </div>

          <!-- Rules -->
          ${(p3.rules || []).map(r => `
            <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px; ${r.isGolden ? 'background: rgba(37,99,235,0.04); padding: 16px; border-radius: 8px; border: 2px solid var(--brand-blue);' : ''}">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <h4 style="font-size: 14.5px; font-weight: 800; ${r.isGolden ? 'color: var(--brand-blue);' : ''}">Kural ${r.num}: ${r.title}</h4>
                ${r.isGolden ? '<span class="badge badge-danger">⭐ ALTIN KURAL (KİTAP SAYFA 41)</span>' : ''}
              </div>
              <div class="teacher-note">
                <span class="avatar">👨‍🏫</span>
                <div class="teacher-note-text"><strong>Öğretmen Tavsiyesi:</strong> ${r.teacherTip}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // GENERAL RULES (Sayfa 42)
    if (filter === 'all' || filter === 'general') {
      const gen = ESSENTIAL_TIPS.general;
      html += `
        <div class="tip-box highlight" style="margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h3 style="color: var(--brand-blue); font-size: 16px;">📌 ${gen.title}</h3>
            <span class="badge badge-purple">Kitap Sayfa 42</span>
          </div>

          ${(gen.rules || []).map(r => `
            <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 14px;">
              <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Kural ${r.num}: ${r.title}</h4>
              <div class="teacher-note">
                <span class="avatar">👨‍🏫</span>
                <div class="teacher-note-text"><strong>Öğretmen Tavsiyesi:</strong> ${r.teacherTip}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderTips(chip.getAttribute('data-tips-filter'));
    });
  });

  renderTips('all');
}

/* ==========================================================================
   5. TTS AUDIO PLAYER (SpeechSynthesis)
   ========================================================================== */
function cleanEnglishForSpeech(raw) {
  if (!raw) return '';
  return raw
    // 1. Remove all parentheses contents (e.g. Turkish translations like '(Telefon çaldığında...)')
    .replace(/\([^)]*\)/g, ' ')
    // 2. Remove square brackets [like this]
    .replace(/\[[^\]]*\]/g, ' ')
    // 3. Remove curly braces
    .replace(/\{[^}]*\}/g, ' ')
    // 4. Remove Turkish annotations after pipe '|'
    .split('|')[0]
    // 5. Remove quotes and clean spaces
    .replace(/["“”«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function speakText(text) {
  if (!('speechSynthesis' in window)) {
    showToast('Tarayıcınız ses sentezini desteklemiyor.', '⚠️');
    return;
  }
  const clean = cleanEnglishForSpeech(text);
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'en-GB';
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

function initFluencyTTS() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-speak');
    if (btn) {
      const text = btn.getAttribute('data-speak');
      if (text) speakText(text);
    }
  });
}

/* ==========================================================================
   6. 50 GRAMMAR RULES & FLASHCARD MODULE
   ========================================================================== */
function initGrammarRules() {
  const container = document.getElementById('grammar-list-container');
  const toggleFlashcardBtn = document.getElementById('btn-toggle-flashcard-mode');
  const txtFlashcardMode = document.getElementById('txt-flashcard-mode');
  const categoryChips = document.querySelectorAll('#grammar-category-filters .chip');
  const progressText = document.getElementById('grammar-progress-text');
  const resetBtn = document.getElementById('btn-reset-grammar-progress');

  if (!container || typeof GRAMMAR_POINTS === 'undefined') return;

  let isFlashcardMode = localStorage.getItem('yigit_flashcard_mode') === 'true';
  let activeCategory = 'all';
  if (txtFlashcardMode && isFlashcardMode) {
    txtFlashcardMode.textContent = 'Liste Görünümüne Geç';
    if (toggleFlashcardBtn) {
      toggleFlashcardBtn.classList.add('btn-primary');
      toggleFlashcardBtn.classList.remove('btn-outline');
    }
  }

  function getMasteredSet() {
    try {
      return new Set(JSON.parse(localStorage.getItem('yigit_grammar_mastered') || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveMasteredSet(set) {
    localStorage.setItem('yigit_grammar_mastered', JSON.stringify(Array.from(set)));
    updateProgress();
  }

  function updateProgress() {
    const set = getMasteredSet();
    const count = set.size;
    const total = GRAMMAR_POINTS.length;
    const pct = Math.round((count / total) * 100);
    if (progressText) {
      progressText.textContent = `${count} / ${total} Öğrenildi (%${pct})`;
    }
  }

  function renderGrammar() {
    const mastered = getMasteredSet();
    const filtered = GRAMMAR_POINTS.filter(item => {
      if (activeCategory === 'all') return true;
      return (item.category && item.category.toLowerCase().includes(activeCategory.toLowerCase())) ||
             (item.title && item.title.toLowerCase().includes(activeCategory.toLowerCase()));
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Bu kategoride kural bulunamadı.</div>';
      return;
    }

    if (!isFlashcardMode) {
      // Standard List / Card Grid View
      container.className = 'grid-2';
      container.innerHTML = filtered.map(item => {
        const isChecked = mastered.has(item.id);
        return `
          <div class="card" id="grammar-card-${item.id}" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <span class="badge badge-primary">Kural ${item.id}</span>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
                  <input type="checkbox" class="grammar-check" data-id="${item.id}" ${isChecked ? 'checked' : ''} style="accent-color: var(--brand-blue);">
                  <span style="font-weight: 600; color: ${isChecked ? 'var(--brand-blue)' : 'var(--text-muted)'};">Öğrendim</span>
                </label>
              </div>
              <h4 style="font-size: 15px; font-weight: 800; margin-bottom: 6px;">${item.title}</h4>
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">${item.rule}</p>

              <div class="example-pair">
                <div class="wrong-box">
                  <div class="label">❌ Hatalı Sınav Kullanımı</div>
                  <div style="color: #991b1b;">${item.incorrect ? item.incorrect.join('<br>') : '-'}</div>
                </div>
                <div class="right-box">
                  <div class="label">✅ Doğru Kullanım (Band 8)</div>
                  <div style="color: #065f46; font-weight: 600;">${item.correct ? item.correct.join('<br>') : '-'}</div>
                </div>
              </div>
            </div>

            <div class="teacher-note" style="margin-top: 12px;">
              <span class="avatar">👨‍🏫</span>
              <div class="teacher-note-text"><strong>Öğretmen Uyarısı:</strong> ${item.tip || 'Sınavda dikkatli ol!'}</div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      // 3D Interactive Flashcard View
      container.className = 'grid-2';
      container.innerHTML = filtered.map(item => {
        const isChecked = mastered.has(item.id);
        return `
          <div class="flashcard-container" data-id="${item.id}">
            <div class="flashcard-inner">
              <!-- FRONT -->
              <div class="flashcard-front">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="badge badge-purple">Flashcard #${item.id}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">Kartı Çevirmek İçin Tıkla 🔄</span>
                  </div>
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--brand-blue); margin-bottom: 8px;">${item.title}</h3>
                  <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">${item.rule}</p>
                  
                  <div class="wrong-box" style="margin-top: 10px;">
                    <div class="label">⚠️ Hatalı Cümle (Bunu Düzeltmeye Çalış):</div>
                    <div style="font-weight: 600; color: #991b1b; font-size: 13.5px;">${item.incorrect ? item.incorrect[0] : '-'}</div>
                  </div>
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted); text-align: center; margin-top: auto;">
                  Cevabı ve öğretmen notunu görmek için karta tıkla ➔
                </div>
              </div>

              <!-- BACK -->
              <div class="flashcard-back">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="badge badge-success">Çözüm & Doğru Cümle</span>
                    <button class="btn-speak" data-speak="${item.correct ? item.correct[0] : ''}">🔊 Dinle</button>
                  </div>
                  
                  <div class="right-box" style="margin-bottom: 12px;">
                    <div class="label">✅ Doğru Sınav Cümlesi:</div>
                    <div style="font-size: 14px; font-weight: 700; color: #065f46;">${item.correct ? item.correct[0] : '-'}</div>
                  </div>

                  <div class="teacher-note" style="margin-top: 8px;">
                    <span class="avatar">👨‍🏫</span>
                    <div class="teacher-note-text" style="font-size: 12.5px;">${item.tip || ''}</div>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid var(--border); padding-top: 10px;">
                  <span style="font-size: 11px; color: var(--text-muted);">Kartı geri çevir 🔄</span>
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
                    <input type="checkbox" class="grammar-check" data-id="${item.id}" ${isChecked ? 'checked' : ''} style="accent-color: var(--brand-blue);">
                    <span style="font-weight: 600;">Öğrendim</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    attachGrammarEvents();
    updateProgress();
  }

  function attachGrammarEvents() {
    document.querySelectorAll('.grammar-check').forEach(cb => {
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        const id = parseInt(cb.getAttribute('data-id'), 10);
        const set = getMasteredSet();
        if (cb.checked) {
          set.add(id);
          showToast(`Kural ${id} "Öğrenildi" olarak işaretlendi! 🎉`, '✅');
        } else {
          set.delete(id);
        }
        saveMasteredSet(set);
        renderGrammar();
      });
    });

    if (isFlashcardMode) {
      document.querySelectorAll('.flashcard-container').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.grammar-check') || e.target.closest('.btn-speak')) return;
          const inner = card.querySelector('.flashcard-inner');
          if (inner) inner.classList.toggle('flipped');
        });
      });
    }
  }

  if (toggleFlashcardBtn) {
    toggleFlashcardBtn.addEventListener('click', () => {
      isFlashcardMode = !isFlashcardMode;
      localStorage.setItem('yigit_flashcard_mode', isFlashcardMode);
      txtFlashcardMode.textContent = isFlashcardMode ? 'Liste Görünümüne Geç' : 'Flashcard Moduna Geç';
      toggleFlashcardBtn.classList.toggle('btn-primary', isFlashcardMode);
      toggleFlashcardBtn.classList.toggle('btn-outline', !isFlashcardMode);
      renderGrammar();
    });
  }

  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-cat');
      renderGrammar();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Tüm gramer ilerlemeni sıfırlamak istediğine emin misin?')) {
        saveMasteredSet(new Set());
        renderGrammar();
        showToast('İlerleme sıfırlandı.', '🔄');
      }
    });
  }

  renderGrammar();
}

/* ==========================================================================
   7. 107 IDIOMS DICTIONARY & RANDOM GENERATOR
   ========================================================================== */
function initIdioms() {
  const container = document.getElementById('idioms-container');
  const chips = document.querySelectorAll('#idiom-filters .chip');
  const randomBtn = document.getElementById('btn-random-idiom');

  const modal = document.getElementById('idiom-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalTitle = document.getElementById('modal-idiom-title');
  const modalMeaning = document.getElementById('modal-idiom-meaning');
  const modalExample = document.getElementById('modal-idiom-example');
  const modalNote = document.getElementById('modal-idiom-note');
  const btnModalSpeak = document.getElementById('btn-modal-speak');
  const btnModalNext = document.getElementById('btn-modal-next');

  if (!container || typeof IDIOMS_DATA === 'undefined') return;

  let activeCategory = 'all';
  let currentModalIdiom = null;

  function renderIdioms() {
    const filtered = IDIOMS_DATA.filter(item => {
      if (activeCategory === 'all') return true;
      return (item.meaning && item.meaning.toLowerCase().includes(activeCategory.toLowerCase())) ||
             (item.context && item.context.toLowerCase().includes(activeCategory.toLowerCase())) ||
             (item.teacher_note && item.teacher_note.toLowerCase().includes(activeCategory.toLowerCase()));
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Bu kategoride deyim bulunamadı.</div>';
      return;
    }

    container.innerHTML = filtered.map(item => {
      const phrase = item.phrase || item.idiom || '';
      const example = item.example || item.sample_sentence || '';
      const tip = item.tip || item.teacher_note || 'Sınavda yerinde ve doğal kullan.';
      const part = item.part || item.context || 'Part 1 / 2 / 3';
      return `
        <div class="idiom-card" id="idiom-card-${item.id}">
          <div>
            <div class="idiom-header">
              <span class="badge badge-purple">${part}</span>
              <button class="btn-speak" data-speak="${phrase}. ${example}" title="Sesli Telaffuz">🔊 Telaffuz</button>
            </div>
            <div class="idiom-name">${phrase}</div>
            <div class="idiom-meaning"><strong>Anlamı:</strong> ${item.meaning}</div>

            ${example ? `
              <div style="background: var(--bg-subtle); padding: 8px 12px; border-radius: 6px; font-size: 12.5px; font-style: italic; margin-bottom: 8px; border-left: 3px solid var(--brand-blue);">
                "${example}"
              </div>
            ` : ''}
          </div>

          <div class="teacher-note" style="margin-top: 10px; font-size: 12px; padding: 8px 12px;">
            <span class="avatar" style="font-size: 15px;">👨‍🏫</span>
            <div class="teacher-note-text">${tip}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-cat');
      renderIdioms();
    });
  });

  function showRandomIdiom() {
    const randomIndex = Math.floor(Math.random() * IDIOMS_DATA.length);
    currentModalIdiom = IDIOMS_DATA[randomIndex];

    const phrase = currentModalIdiom.phrase || currentModalIdiom.idiom || '';
    const example = currentModalIdiom.example || currentModalIdiom.sample_sentence || 'Örnek cümle bulunmuyor.';
    const tip = currentModalIdiom.tip || currentModalIdiom.teacher_note || 'Bu deyim Band 8 için harika bir tercihtir!';
    if (modalTitle) modalTitle.textContent = phrase;
    if (modalMeaning) modalMeaning.textContent = currentModalIdiom.meaning;
    if (modalExample) modalExample.textContent = example;
    if (modalNote) modalNote.textContent = tip;

    if (modal) modal.style.display = 'flex';
  }

  if (randomBtn) randomBtn.addEventListener('click', showRandomIdiom);
  if (btnModalNext) btnModalNext.addEventListener('click', showRandomIdiom);

  if (btnModalSpeak) {
    btnModalSpeak.addEventListener('click', () => {
      if (currentModalIdiom) {
        const p = currentModalIdiom.phrase || currentModalIdiom.idiom || '';
        const ex = currentModalIdiom.example || currentModalIdiom.sample_sentence || '';
        speakText(`${p}. ${ex}`);
      }
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  renderIdioms();
}

/* ==========================================================================
   8. SIMULATOR & VOICE RECORDER STUDIO
   ========================================================================== */
function initSimulator() {
  const btnPart1 = document.getElementById('sim-mode-part1');
  const btnPart2 = document.getElementById('sim-mode-part2');
  const btnPart3 = document.getElementById('sim-mode-part3');
  const badgePart = document.getElementById('sim-part-badge');
  const promptBox = document.getElementById('sim-prompt-content');
  const btnNext = document.getElementById('btn-next-prompt');

  const part2Timers = document.getElementById('part2-timer-section');
  const prepDisplay = document.getElementById('timer-prep-display');
  const speechDisplay = document.getElementById('timer-speech-display');
  const btnStartPrep = document.getElementById('btn-start-prep');
  const btnStartSpeech = document.getElementById('btn-start-speech');

  // Recorder Elements
  const btnRecordStart = document.getElementById('btn-record-start');
  const btnRecordStop = document.getElementById('btn-record-stop');
  const recIndicator = document.getElementById('rec-status-indicator');
  const recStatusText = document.getElementById('rec-status-text');
  const recTimerDisplay = document.getElementById('rec-timer-display');
  const audioPlaybackContainer = document.getElementById('audio-playback-container');
  const audioPlayer = document.getElementById('audio-player');
  const btnDownload = document.getElementById('btn-download-recording');

  let currentMode = localStorage.getItem('yigit_sim_mode') || 'part1';
  let p1Index = 0;
  let p2Index = 0;
  let p3Index = 0;

  let prepInterval = null;
  let speechInterval = null;

  let mediaRecorder = null;
  let audioChunks = [];
  let recInterval = null;
  let recSeconds = 0;

  function loadPrompt() {
    if (!badgePart || !promptBox) return;

    if (currentMode === 'part1') {
      badgePart.textContent = 'Part 1 (4 - 5 Dk)';
      badgePart.className = 'badge badge-primary';
      if (part2Timers) part2Timers.style.display = 'none';

      if (typeof PART1_QUESTIONS !== 'undefined' && PART1_QUESTIONS.length > 0) {
        const item = PART1_QUESTIONS[p1Index % PART1_QUESTIONS.length];
        promptBox.innerHTML = `
          <div style="font-size: 13px; color: var(--brand-blue); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">Konu: ${item.topic}</div>
          <div style="font-size: 17px; margin-bottom: 12px; font-weight: 700;">"${item.q}"</div>
          <div class="teacher-note">
            <span class="avatar">👨‍🏫</span>
            <div class="teacher-note-text">
              <strong>Öğretmen Tavsiyesi (Sayfa 37-38):</strong> Asla sadece 'Yes/No' deyip durma! 2-3 Cümle kuralını uygula: Doğrudan Cevap + Konum/Mesafe + Kişisel Yorum.
            </div>
          </div>
        `;
      }
    } else if (currentMode === 'part2') {
      badgePart.textContent = 'Part 2 Cue Card (3 - 4 Dk)';
      badgePart.className = 'badge badge-warning';
      if (part2Timers) part2Timers.style.display = 'block';

      if (typeof CUE_CARDS !== 'undefined' && CUE_CARDS.length > 0) {
        const item = CUE_CARDS[p2Index % CUE_CARDS.length];
        promptBox.innerHTML = `
          <div style="font-size: 13px; color: #b45309; text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">Cue Card Görevi:</div>
          <div style="font-size: 18px; margin-bottom: 12px; font-weight: 800; color: var(--text-main);">${item.title}</div>
          <div style="font-size: 13.5px; margin-bottom: 8px;">You should say:</div>
          <ul style="margin-left: 20px; font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            ${(item.bullets || []).map(bp => `<li>${bp}</li>`).join('')}
          </ul>
          <div class="teacher-note">
            <span class="avatar">👨‍🏫</span>
            <div class="teacher-note-text">
              <strong>Öğretmen Tavsiyesi (Sayfa 39-40):</strong> ${item.tips}
            </div>
          </div>
        `;
      }
    } else if (currentMode === 'part3') {
      badgePart.textContent = 'Part 3 Derinlemesine Tartışma (4 - 5 Dk)';
      badgePart.className = 'badge badge-success';
      if (part2Timers) part2Timers.style.display = 'none';

      if (typeof PART3_QUESTIONS !== 'undefined' && PART3_QUESTIONS.length > 0) {
        const item = PART3_QUESTIONS[p3Index % PART3_QUESTIONS.length];
        promptBox.innerHTML = `
          <div style="font-size: 13px; color: var(--brand-blue); text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">Tema: ${item.topic}</div>
          <div style="font-size: 17px; margin-bottom: 12px; font-weight: 700;">"${item.q}"</div>
          ${item.stalling ? `
            <div style="background: var(--bg-card); padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-bottom: 10px; border: 1px solid var(--border);">
              <strong>Zaman Kazanma Başlangıcı:</strong> <em>"${item.stalling}"</em>
            </div>
          ` : ''}
          <div class="teacher-note" style="border-left-color: #f59e0b;">
            <span class="avatar">⭐</span>
            <div class="teacher-note-text">
              <strong>Altın Kural (Sayfa 41):</strong> ${item.goldenRule}
            </div>
          </div>
        `;
      }
    }
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem('yigit_sim_mode', mode);
    [btnPart1, btnPart2, btnPart3].forEach(b => {
      if (b) {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      }
    });
    if (mode === 'part1' && btnPart1) btnPart1.classList.replace('btn-outline', 'btn-primary');
    if (mode === 'part2' && btnPart2) btnPart2.classList.replace('btn-outline', 'btn-primary');
    if (mode === 'part3' && btnPart3) btnPart3.classList.replace('btn-outline', 'btn-primary');
    loadPrompt();
  }

  if (btnPart1) btnPart1.addEventListener('click', () => setMode('part1'));
  if (btnPart2) btnPart2.addEventListener('click', () => setMode('part2'));
  if (btnPart3) btnPart3.addEventListener('click', () => setMode('part3'));

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentMode === 'part1') p1Index++;
      else if (currentMode === 'part2') p2Index++;
      else if (currentMode === 'part3') p3Index++;
      loadPrompt();
    });
  }

  function playBeep(freq = 600, duration = 300) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, duration);
    } catch {}
  }

  if (btnStartPrep) {
    btnStartPrep.addEventListener('click', () => {
      clearInterval(prepInterval);
      let sec = 60;
      btnStartPrep.disabled = true;
      btnStartPrep.textContent = 'Hazırlan...';

      prepInterval = setInterval(() => {
        sec--;
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        if (prepDisplay) prepDisplay.textContent = `${m}:${s}`;

        if (sec <= 0) {
          clearInterval(prepInterval);
          btnStartPrep.disabled = false;
          btnStartPrep.textContent = 'Tekrar Başlat';
          if (prepDisplay) prepDisplay.textContent = '00:00';
          playBeep(880, 500);
          showToast('1 Dakikalık Hazırlık Süren Doldu! Şimdi Konuşmaya Başla!', '⏰');
        }
      }, 1000);
    });
  }

  if (btnStartSpeech) {
    btnStartSpeech.addEventListener('click', () => {
      clearInterval(speechInterval);
      let sec = 120;
      btnStartSpeech.disabled = true;
      btnStartSpeech.textContent = 'Konuşuyorsun...';

      speechInterval = setInterval(() => {
        sec--;
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        if (speechDisplay) speechDisplay.textContent = `${m}:${s}`;

        if (sec <= 0) {
          clearInterval(speechInterval);
          btnStartSpeech.disabled = false;
          btnStartSpeech.textContent = 'Tekrar Başlat';
          if (speechDisplay) speechDisplay.textContent = '00:00';
          playBeep(440, 600);
          showToast('2 Dakikalık Konuşma Süresi Tamamlandı! Harika!', '🎉');
        }
      }, 1000);
    });
  }

  if (btnRecordStart) {
    btnRecordStart.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          if (audioPlayer) audioPlayer.src = audioUrl;
          if (btnDownload) {
            btnDownload.href = audioUrl;
            btnDownload.download = `yigit_ielts_${currentMode}_kayit.webm`;
          }
          if (audioPlaybackContainer) audioPlaybackContainer.style.display = 'block';
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        recSeconds = 0;
        if (recTimerDisplay) recTimerDisplay.textContent = '00:00';
        if (recIndicator) recIndicator.className = 'rec-indicator recording';
        if (recStatusText) recStatusText.textContent = 'CANLI KAYITTA ●';
        btnRecordStart.disabled = true;
        if (btnRecordStop) btnRecordStop.disabled = false;

        clearInterval(recInterval);
        recInterval = setInterval(() => {
          recSeconds++;
          const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
          const s = String(recSeconds % 60).padStart(2, '0');
          if (recTimerDisplay) recTimerDisplay.textContent = `${m}:${s}`;
        }, 1000);

        showToast('Mikrofon kaydı başladı. Rahat ve akıcı konuş!', '🎙️');
      } catch (err) {
        showToast('Mikrofona erişilemedi. Tarayıcı izinlerini kontrol et.', '⚠️');
      }
    });
  }

  if (btnRecordStop) {
    btnRecordStop.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(recInterval);
        if (recIndicator) recIndicator.className = 'rec-indicator';
        if (recStatusText) recStatusText.textContent = 'Kayıt Tamamlandı';
        if (btnRecordStart) btnRecordStart.disabled = false;
        btnRecordStop.disabled = true;
        showToast('Kayıt başarıyla durduruldu. Aşağıdan dinleyebilirsin!', '🎧');
      }
    });
  }

  setMode('part1');
}

/* ==========================================================================
   9. ERROR HUNTER QUIZ
   ========================================================================== */
function initQuiz() {
  const container = document.getElementById('quiz-container');
  const scoreBadge = document.getElementById('quiz-score-badge');
  const resetBtn = document.getElementById('btn-reset-quiz');

  if (!container || typeof QUIZ_QUESTIONS === 'undefined') return;

  let answered = JSON.parse(localStorage.getItem('yigit_quiz_answered') || '{}');

  function renderQuiz() {
    container.innerHTML = QUIZ_QUESTIONS.map((q, idx) => {
      const prevAns = answered[idx];
      let fbHtml = '';
      if (prevAns !== undefined) {
        const isCor = (typeof prevAns === 'object') ? prevAns.isCorrect : prevAns;
        fbHtml = `
          <div class="teacher-note" style="${isCor ? 'border-left-color: var(--success);' : 'border-left-color: var(--danger);'}">
            <span class="avatar">${isCor ? '🎉' : '💡'}</span>
            <div class="teacher-note-text">
              <strong>${isCor ? 'Tebrikler Yiğit, Tam İsabet!' : 'Dikkat Tuzağa Düştün:'}</strong> ${q.explanation}
            </div>
          </div>
        `;
      }

      return `
        <div class="card" style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="badge badge-primary">Soru ${idx + 1} / ${QUIZ_QUESTIONS.length}</span>
            <span style="font-size: 11px; color: var(--text-muted);">Kritik Sınav Tuzağı</span>
          </div>
          <p style="font-size: 15px; font-weight: 700; margin-bottom: 14px;">${q.question}</p>

          <div class="quiz-options" data-q-idx="${idx}">
            ${(q.options || []).map((opt, optIdx) => {
              let optClass = 'quiz-opt';
              if (prevAns !== undefined) {
                const chosenOpt = (typeof prevAns === 'object') ? prevAns.optIdx : -1;
                if (optIdx === q.correct) optClass += ' correct';
                else if (optIdx === chosenOpt) optClass += ' wrong';
              }
              return `
                <div class="${optClass}" data-opt-idx="${optIdx}">
                  <span style="font-weight: 700; width: 22px;">${String.fromCharCode(65 + optIdx)})</span>
                  <span>${opt}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="quiz-feedback" id="quiz-feedback-${idx}" style="${fbHtml ? 'display: block;' : 'display: none;'} margin-top: 14px;">
            ${fbHtml}
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.quiz-opt').forEach(optEl => {
      optEl.addEventListener('click', () => {
        const parent = optEl.closest('.quiz-options');
        const qIdx = parseInt(parent.getAttribute('data-q-idx'), 10);
        if (answered[qIdx] !== undefined) return;

        const optIdx = parseInt(optEl.getAttribute('data-opt-idx'), 10);
        const qData = QUIZ_QUESTIONS[qIdx];
        const isCorrect = (optIdx === qData.correct);

        answered[qIdx] = { isCorrect, optIdx };
        localStorage.setItem('yigit_quiz_answered', JSON.stringify(answered));

        parent.querySelectorAll('.quiz-opt').forEach((o, i) => {
          if (i === qData.correct) o.classList.add('correct');
          else if (i === optIdx && !isCorrect) o.classList.add('wrong');
        });

        const fbBox = document.getElementById(`quiz-feedback-${qIdx}`);
        if (fbBox) {
          fbBox.style.display = 'block';
          fbBox.innerHTML = `
            <div class="teacher-note" style="${isCorrect ? 'border-left-color: var(--success);' : 'border-left-color: var(--danger);'}">
              <span class="avatar">${isCorrect ? '🎉' : '💡'}</span>
              <div class="teacher-note-text">
                <strong>${isCorrect ? 'Tebrikler Yiğit, Tam İsabet!' : 'Dikkat Tuzağa Düştün:'}</strong> ${qData.explanation}
              </div>
            </div>
          `;
        }

        updateScore();
      });
    });

    updateScore();
  }

  function updateScore() {
    const total = QUIZ_QUESTIONS.length;
    const correctCount = Object.values(answered).filter(v => v === true || v.isCorrect === true).length;
    if (scoreBadge) {
      scoreBadge.textContent = `Skor: ${correctCount} / ${total}`;
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      answered = {};
      localStorage.removeItem('yigit_quiz_answered');
      renderQuiz();
      showToast('Sınav sıfırlandı. Tekrar başarılar!', '🔄');
    });
  }

  renderQuiz();
}

/* ==========================================================================
   10. 28-DAY STUDY PLAN CHECKLIST
   ========================================================================== */
function initStudyPlan() {
  const container = document.getElementById('study-plan-container');
  const badge = document.getElementById('plan-progress-badge');

  if (!container || typeof STUDY_PLAN === 'undefined') return;

  function getCheckedDays() {
    try {
      return new Set(JSON.parse(localStorage.getItem('yigit_study_plan_checked') || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveCheckedDays(set) {
    localStorage.setItem('yigit_study_plan_checked', JSON.stringify(Array.from(set)));
    updatePlanBadge();
  }

  function updatePlanBadge() {
    const checked = getCheckedDays();
    const count = checked.size;
    const total = STUDY_PLAN.length;
    const pct = Math.round((count / total) * 100);
    if (badge) {
      badge.textContent = `${count} / ${total} Gün Tamamlandı (%${pct})`;
    }
  }

  function renderPlan() {
    const checked = getCheckedDays();

    const weeks = [
      { num: 1, title: 'Hafta 1: Fluency & Akıcılık İskeletleri (Part 1 Odaklı)', days: STUDY_PLAN.slice(0, 7) },
      { num: 2, title: 'Hafta 2: 50 Dilbilgisi Kuralı & Hata Eliminasyonu', days: STUDY_PLAN.slice(7, 14) },
      { num: 3, title: 'Hafta 3: 107 Deyim & Part 2 Cue Card Ustalığı', days: STUDY_PLAN.slice(14, 21) },
      { num: 4, title: 'Hafta 4: Part 3 Felsefi Tartışma & Tam Deneme Sınavları', days: STUDY_PLAN.slice(21, 28) }
    ];

    container.innerHTML = weeks.map(w => `
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; font-weight: 800; color: var(--brand-blue); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span>🗓️</span>
          <span>${w.title}</span>
        </h3>
        
        ${w.days.map(d => {
          const isDone = checked.has(d.day);
          return `
            <div class="plan-item ${isDone ? 'completed' : ''}" id="plan-day-${d.day}">
              <input type="checkbox" class="plan-checkbox" data-day="${d.day}" ${isDone ? 'checked' : ''}>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong class="plan-title" style="font-size: 14px;">Gün ${d.day}: ${d.title}</strong>
                  <span class="badge ${d.title.includes('Deneme') ? 'badge-danger' : 'badge-primary'}">Hafta ${d.week}</span>
                </div>
                <div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">${d.desc}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');

    container.querySelectorAll('.plan-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const day = parseInt(cb.getAttribute('data-day'), 10);
        const set = getCheckedDays();
        if (cb.checked) {
          set.add(day);
          showToast(`Gün ${day} tamamlandı! Harika gidiyorsun Yiğit! 🚀`, '🎯');
        } else {
          set.delete(day);
        }
        saveCheckedDays(set);
        renderPlan();
      });
    });

    updatePlanBadge();
  }

  renderPlan();
}

/* ==========================================================================
   11. REAL SMART SEARCH ENGINE (Fuzzy, Normalized, Typo-Tolerant)
   ========================================================================== */
function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const dropdown = document.getElementById('search-results-dropdown');
  const clearBtn = document.getElementById('btn-clear-search');

  if (!searchInput || !dropdown) return;

  // Build searchable database index
  let searchIndex = [];

  function buildIndex() {
    searchIndex = [];

    // 1. 50 Grammar Rules
    if (typeof GRAMMAR_POINTS !== 'undefined') {
      GRAMMAR_POINTS.forEach(item => {
        searchIndex.push({
          id: `grammar-${item.id}`,
          domId: `grammar-card-${item.id}`,
          type: 'Gramer Kuralı',
          badgeClass: 'badge-primary',
          targetTab: 'grammar-rules',
          title: `Kural ${item.id}: ${item.title}`,
          content: `${item.title} ${item.rule || ''} ${(item.correct || []).join(' ')} ${(item.incorrect || []).join(' ')} ${item.tip || ''} ${item.category || ''}`,
          snippet: item.rule || ((item.correct && item.correct[0]) ? `Doğru: ${item.correct[0]}` : '')
        });
      });
    }

    // 2. 107 Idioms
    if (typeof IDIOMS_DATA !== 'undefined') {
      IDIOMS_DATA.forEach(item => {
        const phrase = item.phrase || item.idiom || '';
        searchIndex.push({
          id: `idiom-${item.id}`,
          domId: `idiom-card-${item.id}`,
          type: 'Deyim & İdiom',
          badgeClass: 'badge-purple',
          targetTab: 'idioms',
          title: phrase,
          content: `${phrase} ${item.meaning || ''} ${item.example || item.sample_sentence || ''} ${item.tip || item.teacher_note || ''} ${item.part || ''}`,
          snippet: item.meaning || ''
        });
      });
    }

    // 3. Essential Tips (Sayfa 37 - 42)
    if (typeof ESSENTIAL_TIPS !== 'undefined') {
      // Part 1
      if (ESSENTIAL_TIPS.part1 && ESSENTIAL_TIPS.part1.rules) {
        ESSENTIAL_TIPS.part1.rules.forEach(r => {
          searchIndex.push({
            id: `tip-p1-${r.num}`,
            domId: 'tips-container',
            type: 'Part 1 İpucu',
            badgeClass: 'badge-primary',
            targetTab: 'essential-tips',
            title: `Part 1 Kural ${r.num}: ${r.title}`,
            content: `${r.title} ${r.teacherTip || ''} ${r.dialogue?.examiner || ''} ${r.dialogue?.candidate || ''} ${(r.phrases || []).join(' ')}`,
            snippet: r.teacherTip || r.title
          });
        });
      }
      // Part 2
      if (ESSENTIAL_TIPS.part2 && ESSENTIAL_TIPS.part2.rules) {
        ESSENTIAL_TIPS.part2.rules.forEach(r => {
          searchIndex.push({
            id: `tip-p2-${r.num}`,
            domId: 'tips-container',
            type: 'Part 2 İpucu',
            badgeClass: 'badge-warning',
            targetTab: 'essential-tips',
            title: `Part 2 Kural ${r.num}: ${r.title}`,
            content: `${r.title} ${r.teacherTip || ''} ${(r.starters || []).join(' ')} ${(r.signposts || []).join(' ')}`,
            snippet: r.teacherTip || r.title
          });
        });
      }
      // Part 3
      if (ESSENTIAL_TIPS.part3 && ESSENTIAL_TIPS.part3.rules) {
        ESSENTIAL_TIPS.part3.rules.forEach(r => {
          searchIndex.push({
            id: `tip-p3-${r.num}`,
            domId: 'tips-container',
            type: r.isGolden ? '⭐ Altın Kural (s. 41)' : 'Part 3 İpucu',
            badgeClass: r.isGolden ? 'badge-danger' : 'badge-success',
            targetTab: 'essential-tips',
            title: `Part 3 Kural ${r.num}: ${r.title}`,
            content: `${r.title} ${r.teacherTip || ''} speak more than the examiner`,
            snippet: r.teacherTip || r.title
          });
        });
      }
      // General
      if (ESSENTIAL_TIPS.general && ESSENTIAL_TIPS.general.rules) {
        ESSENTIAL_TIPS.general.rules.forEach(r => {
          searchIndex.push({
            id: `tip-gen-${r.num}`,
            domId: 'tips-container',
            type: 'Genel Kural',
            badgeClass: 'badge-purple',
            targetTab: 'essential-tips',
            title: `Genel Kural ${r.num}: ${r.title}`,
            content: `${r.title} ${r.teacherTip || ''}`,
            snippet: r.teacherTip || r.title
          });
        });
      }
    }

    // 4. Fluency Templates
    searchIndex.push(
      {
        id: 'fluency-stalling',
        domId: 'sec-fluency',
        type: 'Akıcılık Şablonu',
        badgeClass: 'badge-primary',
        targetTab: 'fluency',
        title: 'Zaman Kazanma (Stalling Phrases)',
        content: "That's an intriguing question stalling thinking time sessiz kalmama düşünme payı kazanma",
        snippet: "Zor sorularda sessiz kalmadan 3-4 saniye düşünme payı kazanma kalıpları."
      },
      {
        id: 'fluency-catchy',
        domId: 'sec-fluency',
        type: 'Akıcılık Şablonu',
        badgeClass: 'badge-warning',
        targetTab: 'fluency',
        title: 'Part 2 Manşet Açılışları (Catchy Starters)',
        content: "If I was about to lose everything catchy starters vurucu giriş anı anlatımı",
        snippet: "Kitap sayfa 39'daki vurucu ilk cümle şablonları."
      },
      {
        id: 'fluency-recovery',
        domId: 'sec-fluency',
        type: 'İletişim Kurtarma',
        badgeClass: 'badge-danger',
        targetTab: 'fluency',
        title: 'Soru Anlaşılmadığında Kurtarma Kalıpları (A, B, C)',
        content: "Could you explain what you mean repeat question anlamadığında kurtarma kalıbı",
        snippet: "Sınavda soruyu kaçırdığınızda puan kaybetmeden nazikçe tekrar ettirme kalıpları."
      }
    );
  }

  buildIndex();

  // Text normalization: lowercase, Turkish to Latin, strip punctuation
  function normalizeText(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Levenshtein distance for typo tolerance
  function editDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Fuzzy match scorer
  function scoreMatch(queryNorm, queryWords, targetText, targetNorm) {
    if (!targetNorm) return 0;

    // 1. Exact full match
    if (targetNorm === queryNorm) return 300;
    if (targetNorm.startsWith(queryNorm)) return 200;
    if (targetNorm.includes(queryNorm)) return 150;

    // 2. All query words match
    let wordsMatched = 0;
    const targetWords = targetNorm.split(' ');

    for (const qWord of queryWords) {
      if (qWord.length < 2) continue;

      let wordFound = false;
      // Direct word match or substring
      for (const tWord of targetWords) {
        if (tWord === qWord) {
          wordFound = true;
          wordsMatched += 2;
          break;
        } else if (tWord.startsWith(qWord)) {
          wordFound = true;
          wordsMatched += 1.5;
          break;
        } else if (tWord.includes(qWord)) {
          wordFound = true;
          wordsMatched += 1;
          break;
        } else if (qWord.length >= 4 && tWord.length >= 4) {
          // Typo tolerance: edit distance <= 2 for words >= 4 chars
          const dist = editDistance(qWord, tWord);
          if (dist <= 1 || (qWord.length >= 6 && dist <= 2)) {
            wordFound = true;
            wordsMatched += 1.2;
            break;
          }
        }
      }
    }

    if (queryWords.length > 0 && wordsMatched > 0) {
      return (wordsMatched / queryWords.length) * 100;
    }

    return 0;
  }

  function highlightMatches(text, queryWords) {
    if (!text || queryWords.length === 0) return text;
    let safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    for (const w of queryWords) {
      if (w.length < 2) continue;
      const regex = new RegExp(`(${w})`, 'gi');
      safeText = safeText.replace(regex, '<span class="search-match-mark">$1</span>');
    }
    return safeText;
  }

  let selectedResultIndex = -1;
  let currentResults = [];

  function performSearch() {
    const rawQuery = searchInput.value.trim();
    if (clearBtn) clearBtn.style.display = rawQuery ? 'flex' : 'none';

    if (!rawQuery) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      currentResults = [];
      selectedResultIndex = -1;
      return;
    }

    const queryNorm = normalizeText(rawQuery);
    const queryWords = queryNorm.split(' ').filter(w => w.length > 0);

    const scored = searchIndex.map(item => {
      const titleNorm = normalizeText(item.title);
      const contentNorm = normalizeText(item.content);

      const titleScore = scoreMatch(queryNorm, queryWords, item.title, titleNorm);
      const contentScore = scoreMatch(queryNorm, queryWords, item.content, contentNorm);

      const totalScore = (titleScore * 2.0) + contentScore;
      return { item, totalScore };
    }).filter(res => res.totalScore > 15);

    scored.sort((a, b) => b.totalScore - a.totalScore);
    currentResults = scored.slice(0, 12).map(s => s.item);
    selectedResultIndex = -1;

    renderDropdown(rawQuery, queryWords);
  }

  function renderDropdown(rawQuery, queryWords) {
    if (currentResults.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 18px 14px; text-align: center; color: var(--text-muted); font-size: 13px;">
          <div>🔍 <strong>"${rawQuery}"</strong> için sonuç bulunamadı.</div>
          <div style="font-size: 11.5px; margin-top: 6px; color: var(--text-muted);">
            İpucu: 'important', 'succeed', 'speak more', 'Part 2', 'edat' gibi terimler arayabilirsiniz.
          </div>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    let html = `
      <div class="search-header-info">
        <span>${currentResults.length} Sonuç Bulundu</span>
        <span style="font-size: 10.5px; opacity: 0.8;">Seçmek için tıkla veya ↵ Enter</span>
      </div>
    `;

    html += currentResults.map((item, idx) => `
      <div class="search-result-item" data-index="${idx}">
        <div class="search-item-top">
          <div class="search-item-title">${highlightMatches(item.title, queryWords)}</div>
          <span class="badge ${item.badgeClass}">${item.type}</span>
        </div>
        <div class="search-item-snippet">${highlightMatches(item.snippet, queryWords)}</div>
      </div>
    `).join('');

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Click handler on results
    dropdown.querySelectorAll('.search-result-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const idx = parseInt(itemEl.getAttribute('data-index'), 10);
        selectResult(currentResults[idx]);
      });
    });
  }

  function selectResult(item) {
    if (!item) return;

    // 1. Switch to tab
    const navLink = document.querySelector(`.nav-link[data-target="${item.targetTab}"]`);
    if (navLink) navLink.click();

    dropdown.style.display = 'none';

    // 2. Find target element and pulse it
    setTimeout(() => {
      let targetEl = null;
      if (item.domId) {
        targetEl = document.getElementById(item.domId);
      }

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetEl.classList.remove('pulse-target');
        void targetEl.offsetWidth; // trigger reflow
        targetEl.classList.add('pulse-target');
        setTimeout(() => targetEl.classList.remove('pulse-target'), 2600);
      }
    }, 150);

    showToast(`"${item.title}" sonucuna gidildi`, '📍');
  }

  // Keyboard navigation (Escape, ArrowDown, ArrowUp, Enter)
  searchInput.addEventListener('keydown', (e) => {
    if (dropdown.style.display !== 'block') return;

    const items = dropdown.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedResultIndex = (selectedResultIndex + 1) % items.length;
      updateSelectedHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedResultIndex = (selectedResultIndex - 1 + items.length) % items.length;
      updateSelectedHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedResultIndex >= 0 && selectedResultIndex < currentResults.length) {
        selectResult(currentResults[selectedResultIndex]);
      } else if (currentResults.length > 0) {
        selectResult(currentResults[0]);
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });

  function updateSelectedHighlight(items) {
    items.forEach((el, i) => {
      if (i === selectedResultIndex) {
        el.classList.add('selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('selected');
      }
    });
  }

  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim()) performSearch();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      dropdown.style.display = 'none';
      clearBtn.style.display = 'none';
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      dropdown.style.display = 'none';
    }
  });
}

/* ==========================================================================
   12. TOAST NOTIFICATION HELPER
   ========================================================================== */
let toastTimeout = null;
function showToast(message, icon = 'ℹ️') {
  const box = document.getElementById('toast-box');
  const msgEl = document.getElementById('toast-message');
  const iconEl = document.getElementById('toast-icon');

  if (!box || !msgEl) return;

  clearTimeout(toastTimeout);
  msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;

  box.classList.add('show');
  toastTimeout = setTimeout(() => {
    box.classList.remove('show');
  }, 3200);
}
