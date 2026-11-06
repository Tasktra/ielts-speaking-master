/* ==========================================================================
   question_bank.js - IELTS Speaking Question & Answer Bank (Pages 193-391)
   Interactive UI Logic for Yiğit's 199-Page Speaking Question Bank
   ========================================================================== */

(function () {
  let qbState = {
    category: 'all',
    searchQuery: '',
    currentPage: 1,
    pageSize: 6,
    expandedPages: new Set(),
    activeTabMap: {} // pageNum -> 'both' | 'en' | 'tr'
  };

  function normalize(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanEnglishForSpeech(text) {
    if (!text) return '';
    // Strip Turkish text inside parentheses or general parenthetical instructions
    let cleaned = text.replace(/\([^)]*[\u00C0-\u017F\u0400-\u04FFğüşıöçĞÜŞİÖÇ][^)]*\)/g, '');
    cleaned = cleaned.replace(/\((Don't stop there!|Not:.*?)\)/gi, '');
    cleaned = cleaned.replace(/Q:\s*/g, '');
    return cleaned.trim();
  }

  function speakEnglish(text, btnElement) {
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız ses sentezini (Text-to-Speech) desteklemiyor.');
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = cleanEnglishForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95; // Natural speaking pace

    // Try finding a good English voice
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (enVoice) utterance.voice = enVoice;

    if (btnElement) {
      btnElement.classList.add('speaking');
      btnElement.innerHTML = '🔊 Okunuyor...';
    }

    utterance.onend = () => {
      if (btnElement) {
        btnElement.classList.remove('speaking');
        btnElement.innerHTML = '🔊 Dinle (EN)';
      }
    };

    utterance.onerror = () => {
      if (btnElement) {
        btnElement.classList.remove('speaking');
        btnElement.innerHTML = '🔊 Dinle (EN)';
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  function getFilteredPages() {
    if (typeof QUESTION_BANK_PAGES === 'undefined' || !Array.isArray(QUESTION_BANK_PAGES)) {
      return [];
    }

    const normQuery = normalize(qbState.searchQuery);

    return QUESTION_BANK_PAGES.filter(p => {
      // Category filter
      if (qbState.category !== 'all' && p.category !== qbState.category) {
        return false;
      }

      // Search filter
      if (normQuery) {
        // Direct page number match e.g. "205", "page 205"
        const pNumStr = p.page_num.toString();
        if (normQuery === pNumStr || normQuery === `sayfa ${pNumStr}` || normQuery === `page ${pNumStr}`) {
          return true;
        }

        const normTitle = normalize(p.title);
        const normEn = normalize(p.original_text);
        const normTr = normalize(p.turkish_translation);
        const normTeacher = normalize(p.teacher_guidance);

        const fullHaystack = `${pNumStr} ${normTitle} ${normEn} ${normTr} ${normTeacher}`;
        const queryWords = normQuery.split(' ');

        return queryWords.every(w => fullHaystack.includes(w));
      }

      return true;
    });
  }

  function renderQuestionBank() {
    const container = document.getElementById('qb-cards-container');
    const pagination = document.getElementById('qb-pagination');
    const statsBadge = document.getElementById('qb-stats-badge');
    if (!container) return;

    if (typeof QUESTION_BANK_PAGES === 'undefined') {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 12px;">⏳</div>
          <p>Soru bankası verileri yükleniyor, lütfen birkaç saniye bekleyin...</p>
        </div>
      `;
      return;
    }

    const filtered = getFilteredPages();
    const total = filtered.length;

    if (statsBadge) {
      statsBadge.textContent = `${total} Sayfa Listeleniyor (Toplam 199 Sayfa / 1000+ Soru)`;
    }

    if (total === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--border-color);">
          <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Eşleşen Sayfa Bulunamadı</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">"${qbState.searchQuery}" için sonuç yok. Başka bir arama terimi deneyin veya filtreyi sıfırlayın.</p>
          <button class="btn btn-sm btn-secondary" id="btn-qb-clear-search">Filtreleri Temizle</button>
        </div>
      `;
      const clearBtn = document.getElementById('btn-qb-clear-search');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          qbState.category = 'all';
          qbState.searchQuery = '';
          qbState.currentPage = 1;
          const searchInput = document.getElementById('qb-search-input');
          if (searchInput) searchInput.value = '';
          document.querySelectorAll('#qb-category-chips .chip').forEach(c => {
            c.classList.toggle('active', c.dataset.cat === 'all');
          });
          renderQuestionBank();
        });
      }
      if (pagination) pagination.innerHTML = '';
      return;
    }

    const totalPages = Math.ceil(total / qbState.pageSize);
    if (qbState.currentPage > totalPages) qbState.currentPage = 1;

    const startIdx = (qbState.currentPage - 1) * qbState.pageSize;
    const pageSlice = filtered.slice(startIdx, startIdx + qbState.pageSize);

    // Format text into HTML paragraphs
    function formatText(txt) {
      if (!txt) return '';
      const paragraphs = txt.split(/\n\s*\n/);
      return paragraphs
        .map(p => {
          const lines = p.split('\n');
          return `<p style="margin-bottom: 8px;">${lines.join('<br>')}</p>`;
        })
        .join('');
    }

    let cardsHtml = '';

    pageSlice.forEach(p => {
      const pNum = p.page_num;
      const viewMode = qbState.activeTabMap[pNum] || 'both'; // 'both' | 'en' | 'tr'
      const isTeacherExpanded = qbState.expandedPages.has(pNum);

      cardsHtml += `
        <article class="qb-page-card" id="qb-card-${pNum}">
          <!-- Header -->
          <div class="qb-card-top">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="qb-page-pill">SAYFA ${pNum}</span>
              <span class="qb-cat-pill">${p.category_icon || '📖'} ${p.category}</span>
            </div>
            <div class="qb-card-actions">
              <button class="btn-icon-subtle btn-speak-en" data-pnum="${pNum}" title="İngilizce Metni Dinle (TTS)">
                🔊 Dinle (EN)
              </button>
              <button class="btn-icon-subtle btn-record-sim" data-pnum="${pNum}" title="Bu Soruyla Sınav Stüdyosunda Pratik Yap">
                🎙️ Pratik Yap
              </button>
            </div>
          </div>

          <h3 class="qb-card-title">${p.title}</h3>

          <!-- View Mode Switcher: Her İkisi / Sadece EN / Sadece TR -->
          <div class="qb-view-tabs">
            <button class="qb-tab-btn ${viewMode === 'both' ? 'active' : ''}" data-pnum="${pNum}" data-mode="both">Yan Yana (Çift Dil)</button>
            <button class="qb-tab-btn ${viewMode === 'en' ? 'active' : ''}" data-pnum="${pNum}" data-mode="en">📘 İngilizce Orijinal</button>
            <button class="qb-tab-btn ${viewMode === 'tr' ? 'active' : ''}" data-pnum="${pNum}" data-mode="tr">🇹🇷 Türkçe Çeviri</button>
          </div>

          <!-- Dual Column Grid -->
          <div class="qb-dual-grid mode-${viewMode}">
            <div class="qb-box qb-en-box" style="${viewMode === 'tr' ? 'display: none;' : ''}">
              <div class="qb-box-header">
                <span>📘 Kitaptaki Özgün İngilizce Sorular & Cevaplar</span>
              </div>
              <div class="qb-box-body" id="qb-en-text-${pNum}">
                ${formatText(p.original_text)}
              </div>
            </div>

            <div class="qb-box qb-tr-box" style="${viewMode === 'en' ? 'display: none;' : ''}">
              <div class="qb-box-header">
                <span>🇹🇷 Türkçe Birebir Çeviri</span>
              </div>
              <div class="qb-box-body">
                ${formatText(p.turkish_translation)}
              </div>
            </div>
          </div>

          <!-- Teacher Guidance Box -->
          <div class="qb-teacher-card">
            <div class="qb-teacher-header" data-pnum="${pNum}">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 18px;">👨‍🏫</span>
                <span style="font-weight: 700; color: var(--success); font-size: 13px;">
                  Öğretmeninden Yiğit'e Özel Sınav Taktiği & Kelime Analizi
                </span>
              </div>
              <span class="qb-teacher-toggle-icon">${isTeacherExpanded ? '▲ Kapat' : '▼ İncele'}</span>
            </div>
            <div class="qb-teacher-body ${isTeacherExpanded ? 'open' : ''}">
              ${formatText(p.teacher_guidance)}
            </div>
          </div>
        </article>
      `;
    });

    container.innerHTML = cardsHtml;

    // Attach card event listeners
    container.querySelectorAll('.btn-speak-en').forEach(btn => {
      btn.addEventListener('click', () => {
        const pNum = parseInt(btn.dataset.pnum, 10);
        const enEl = document.getElementById(`qb-en-text-${pNum}`);
        if (enEl) speakEnglish(enEl.innerText, btn);
      });
    });

    container.querySelectorAll('.btn-record-sim').forEach(btn => {
      btn.addEventListener('click', () => {
        const pNum = parseInt(btn.dataset.pnum, 10);
        const p = QUESTION_BANK_PAGES.find(x => x.page_num === pNum);
        if (p && window.switchTab) {
          window.switchTab('simulator');
          // Populate simulator question if available
          const customPrompt = document.getElementById('sim-custom-prompt');
          if (customPrompt) {
            customPrompt.value = p.title + '\n' + (p.original_text ? p.original_text.split('\n')[0] : '');
          }
        }
      });
    });

    container.querySelectorAll('.qb-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pNum = parseInt(btn.dataset.pnum, 10);
        const mode = btn.dataset.mode;
        qbState.activeTabMap[pNum] = mode;
        const card = document.getElementById(`qb-card-${pNum}`);
        if (card) {
          card.querySelectorAll('.qb-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
          const grid = card.querySelector('.qb-dual-grid');
          if (grid) {
            grid.className = `qb-dual-grid mode-${mode}`;
            const enBox = grid.querySelector('.qb-en-box');
            const trBox = grid.querySelector('.qb-tr-box');
            if (enBox) enBox.style.display = (mode === 'tr') ? 'none' : 'block';
            if (trBox) trBox.style.display = (mode === 'en') ? 'none' : 'block';
          }
        }
      });
    });

    container.querySelectorAll('.qb-teacher-header').forEach(header => {
      header.addEventListener('click', () => {
        const pNum = parseInt(header.dataset.pnum, 10);
        if (qbState.expandedPages.has(pNum)) {
          qbState.expandedPages.delete(pNum);
        } else {
          qbState.expandedPages.add(pNum);
        }
        const card = document.getElementById(`qb-card-${pNum}`);
        if (card) {
          const body = card.querySelector('.qb-teacher-body');
          const toggleIcon = card.querySelector('.qb-teacher-toggle-icon');
          const isOpen = qbState.expandedPages.has(pNum);
          if (body) body.classList.toggle('open', isOpen);
          if (toggleIcon) toggleIcon.textContent = isOpen ? '▲ Kapat' : '▼ İncele';
        }
      });
    });

    // Render pagination
    if (pagination) {
      if (totalPages <= 1) {
        pagination.innerHTML = '';
      } else {
        let pagHtml = `
          <div class="qb-pag-bar">
            <button class="btn btn-sm btn-secondary" id="btn-qb-prev" ${qbState.currentPage === 1 ? 'disabled' : ''}>
              ◀ Önceki
            </button>
            <span class="qb-pag-info">
              Sayfa <strong>${qbState.currentPage}</strong> / ${totalPages}
            </span>
            <button class="btn btn-sm btn-secondary" id="btn-qb-next" ${qbState.currentPage === totalPages ? 'disabled' : ''}>
              Sonraki ▶
            </button>
          </div>
        `;
        pagination.innerHTML = pagHtml;

        const prevBtn = document.getElementById('btn-qb-prev');
        const nextBtn = document.getElementById('btn-qb-next');
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            if (qbState.currentPage > 1) {
              qbState.currentPage--;
              renderQuestionBank();
              const sec = document.getElementById('sec-question-bank');
              if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (qbState.currentPage < totalPages) {
              qbState.currentPage++;
              renderQuestionBank();
              const sec = document.getElementById('sec-question-bank');
              if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
        }
      }
    }
  }

  function initCategoryChips() {
    const chipsContainer = document.getElementById('qb-category-chips');
    if (!chipsContainer) return;

    chipsContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      qbState.category = chip.dataset.cat || 'all';
      qbState.currentPage = 1;
      renderQuestionBank();
    });
  }

  function initSearch() {
    const searchInput = document.getElementById('qb-search-input');
    const clearBtn = document.getElementById('btn-qb-search-clear');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        qbState.searchQuery = searchInput.value.trim();
        qbState.currentPage = 1;
        if (clearBtn) clearBtn.style.display = qbState.searchQuery ? 'block' : 'none';
        renderQuestionBank();
      }, 250);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        qbState.searchQuery = '';
        qbState.currentPage = 1;
        clearBtn.style.display = 'none';
        renderQuestionBank();
        searchInput.focus();
      });
    }
  }

  function initPageJumper() {
    const jumpInput = document.getElementById('qb-jump-input');
    const jumpBtn = document.getElementById('btn-qb-jump');
    if (!jumpInput || !jumpBtn) return;

    function doJump() {
      const val = parseInt(jumpInput.value.trim(), 10);
      if (isNaN(val) || val < 193 || val > 391) {
        alert('Lütfen 193 ile 391 arasında geçerli bir sayfa numarası girin.');
        return;
      }

      // Reset category and search to jump directly to this page
      qbState.category = 'all';
      qbState.searchQuery = val.toString();
      qbState.currentPage = 1;

      // Update UI chips & search input
      const searchInput = document.getElementById('qb-search-input');
      if (searchInput) searchInput.value = val.toString();
      document.querySelectorAll('#qb-category-chips .chip').forEach(c => {
        c.classList.toggle('active', c.dataset.cat === 'all');
      });

      renderQuestionBank();
    }

    jumpBtn.addEventListener('click', doJump);
    jumpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doJump();
    });
  }

  function init() {
    initCategoryChips();
    initSearch();
    initPageJumper();
    renderQuestionBank();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.renderQuestionBank = renderQuestionBank;
})();
