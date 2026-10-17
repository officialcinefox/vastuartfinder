// Krutik Vastu Art Finder - Master Interactive Application Logic
// 100% faithful to the Stitch MCP generated screens and user screenshots

import { VASTU_DIRECTIONS, ARTWORKS, INTENTIONS, ROOMS, STYLES } from './data.js';
import { evaluateProductSuitability, filterCatalog, normalizeValue } from './rule-engine.js';

class KrutikApp {
  constructor() {
    this.currentStep = 0; // 0: Landing, 1-5: Quiz, 6: Optional Note, 7: Results
    this.dbProducts = [];
    this.dbMappings = {};
    this.state = {
      intention: "prosperity",
      room: "living",
      direction: "east",
      style: "traditional",
      colorPalette: "gold",
      spiritual: "devotional",
      notes: ""
    };

    this.simState = {
      mode: '3d', // '3d' or 'ar'
      lighting: 'brahma',
      elevation: 5.5,
      frame: 'teak',
      wallColor: 'limestone',
      showGrid: true,
      artworkId: 'surya-mandala'
    };

    this.galleryFilter = {
      direction: 'all',
      room: 'all',
      style: 'all'
    };

    this.activeLandingCategory = 'all';

    this.directionRotations = {
      east: 0,
      southeast: 45,
      south: 90,
      southwest: 135,
      west: 180,
      northwest: 225,
      north: 270,
      northeast: 315
    };

    this.init();
  }

  async init() {
    this.loadSavedState();
    this.bindEvents();
    await this.loadDatabaseProducts();
    this.renderLandingCollections('all');
    this.renderQuizStep();
    this.renderGallery();
  }

  async loadDatabaseProducts() {
    try {
      const [prodRes, mapRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/mappings')
      ]);
      const prodData = await prodRes.json();
      const mapData = await mapRes.json();
      if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
        this.dbProducts = prodData.products;
      }
      if (mapData.success && mapData.mappings) {
        this.dbMappings = mapData.mappings;
      }
    } catch (e) {
      console.warn("Could not load products from database, using local fallback", e);
    }
  }

  // Deterministic filter of active products up to current question step
  getMatchingProductsForStep(step) {
    const products = (this.dbProducts && this.dbProducts.length > 0) ? this.dbProducts : ARTWORKS.map(a => ({
      id: a.id,
      name: a.title,
      image_url: a.image,
      product_url: a.product_url || `https://www.krutik.in/products/${a.id}`,
      description: a.description,
      is_active: true
    }));

    const answers = {
      intention: step >= 1 ? this.state.intention : '',
      room: step >= 2 ? this.state.room : '',
      direction: step >= 3 ? this.state.direction : '',
      style: step >= 4 ? this.state.style : '',
      devotional: step >= 5 ? this.state.spiritual : ''
    };

    return products.filter(p => {
      const map = this.dbMappings[p.id];
      const ev = evaluateProductSuitability(p, map, answers);
      if (step === 1) return ev.stage1.passed;
      if (step === 2) return ev.stage2.passed;
      if (step === 3) return ev.stage3.passed;
      if (step === 4) return ev.stage4.passed;
      return ev.stage5.passed;
    });
  }

  // Recommendation cards generator for the side panel across steps 1-5 (Uniform Warm Cream Light Aesthetic)
  getRecommendationCardsHTML(step, theme = 'light') {
    const matches = this.getMatchingProductsForStep(step);
    if (!matches || matches.length === 0) {
      return `
        <div class="p-6 text-center ${theme === 'dark' ? 'bg-white/5' : 'bg-[#FFFDF8]'} rounded-lg border border-[#C5A875]/30 space-y-2">
          <span class="material-symbols-outlined text-2xl text-[#C5A875]">info</span>
          <h4 class="font-headline text-sm ${theme === 'dark' ? 'text-[#F8F4EB]' : 'text-[#1E2229]'} font-semibold">0 Matching Artworks</h4>
          <p class="text-xs ${theme === 'dark' ? 'text-[#FAF7F2]/70' : 'text-[#6B655B]'} leading-relaxed font-light">
            No artworks currently match this combination. Try choosing "Open to Suggestions", "I'm Not Sure", or broadening your choice.
          </p>
        </div>
      `;
    }

    return matches.map((p, idx) => `
      <div class="p-3.5 rounded-lg ${theme === 'dark' ? 'bg-white/5 hover:border-[#C5A875]' : 'bg-[#FFFDF8] hover:border-[#C5A875] shadow-sm'} border border-[#C5A875]/30 transition-all duration-300 flex gap-4 items-center group">
        <div class="w-20 h-20 rounded overflow-hidden flex-shrink-0 border border-[#C5A875]/40 relative bg-stone-100">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${p.image_url}" alt="${p.name}" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between text-[10px] font-label tracking-wider uppercase text-[#C5A875] font-semibold mb-0.5">
            <span>Resonance: ${99 - (idx * 2 > 15 ? 15 : idx * 2)}% • Match #${idx + 1}</span>
          </div>
          <h4 class="font-headline text-sm ${theme === 'dark' ? 'text-[#F8F4EB]' : 'text-[#1E2229]'} font-medium truncate">${p.name}</h4>
          ${p.description ? `<p class="font-body text-[11px] ${theme === 'dark' ? 'text-[#FAF7F2]/70' : 'text-[#6B655B]'} line-clamp-1 mt-0.5">${p.description}</p>` : ''}
          <div class="flex items-center justify-between mt-2 pt-1 border-t ${theme === 'dark' ? 'border-white/10' : 'border-[#EAE0CF]'}">
            <div class="flex items-center gap-1 overflow-hidden max-w-[62%]">
              ${(p.tags && p.tags.length > 0)
                ? p.tags.slice(0, 2).map(tag => `<span class="text-[9px] font-label text-[#8C6D37] bg-[#FAF7F2] border border-[#C5A875]/30 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider truncate">${tag}</span>`).join('')
                : '<span class="text-[10px] font-label text-[#C5A875] font-semibold uppercase tracking-wider">Consecrated</span>'}
            </div>
            <a href="${p.product_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[10px] font-label tracking-widest uppercase text-[#181818] bg-[#C5A875] hover:bg-[#B39055] font-bold px-3 py-1 rounded transition-colors shadow-sm">
              <span>Buy Now</span>
              <span class="material-symbols-outlined text-[12px]">shopping_bag</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem('krutik_vastu_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn("Could not load state from localStorage", e);
    }
  }

  saveState() {
    try {
      localStorage.setItem('krutik_vastu_state', JSON.stringify(this.state));
      this.showToast("Progress Saved to Sacred Ledger", "check_circle");
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  resetJourney() {
    this.state = {
      intention: "prosperity",
      room: "living",
      direction: "east",
      style: "traditional",
      colorPalette: "gold",
      spiritual: "devotional",
      notes: ""
    };
    try {
      localStorage.removeItem('krutik_vastu_state');
    } catch(e) {}
    this.goToStep(0);
    this.showToast("Journey reset to beginning", "refresh");
  }

  showToast(message, icon = "info") {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-lg bg-[#181818] border border-[#C5A875] text-[#F8F4EB] shadow-2xl shadow-black/80 transition-all duration-300 transform translate-y-20 opacity-0';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[#C5A875] text-xl">${icon}</span>
      <span class="font-label text-xs tracking-wider uppercase">${message}</span>
    `;
    toast.classList.remove('translate-y-20', 'opacity-0');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3200);
  }

  goToStep(step) {
    this.currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const landingView = document.getElementById('view-landing');
    const quizView = document.getElementById('view-quiz');
    const resultsView = document.getElementById('view-results');
    const galleryView = document.getElementById('view-gallery');
    const aboutView = document.getElementById('view-about');
    const guideView = document.getElementById('view-guide');
    const appHeader = document.getElementById('app-header');

    if (landingView) landingView.classList.add('hidden');
    if (quizView) quizView.classList.add('hidden');
    if (resultsView) resultsView.classList.add('hidden');
    if (galleryView) galleryView.classList.add('hidden');
    if (aboutView) aboutView.classList.add('hidden');
    if (guideView) guideView.classList.add('hidden');

    if (step === 0) {
      // Landing page: Dark header to blend with the hero rotating chakra banner
      if (appHeader) {
        appHeader.className = "bg-[#222222]/95 text-[#F8F4EB] border-b border-[#C5A875]/25 sticky top-0 z-50 shadow-md backdrop-blur-md transition-colors duration-300";
        const brandLogo = appHeader.querySelector('.brand-logo');
        if (brandLogo) brandLogo.className = "brand-logo font-headline text-2xl tracking-widest text-[#C5A875] font-normal flex items-center gap-3";
        const navLinks = appHeader.querySelectorAll('.nav-link');
        navLinks.forEach(l => {
          l.className = "nav-link text-[#D8D2C5] hover:text-[#C5A875] transition-colors tracking-widest text-xs font-label uppercase";
        });
      }
      if (landingView) landingView.classList.remove('hidden');
    } else {
      // All other pages (Quiz 1-6, Results, Gallery, About): Warm Ivory luxury header
      if (appHeader) {
        appHeader.className = "bg-[#FAF7F2] text-[#222222] border-b border-[#EAE0CF] sticky top-0 z-50 shadow-sm transition-colors duration-300";
        const brandLogo = appHeader.querySelector('.brand-logo');
        if (brandLogo) brandLogo.className = "brand-logo font-headline text-2xl tracking-widest text-[#C5A875] font-normal flex items-center gap-2";
        const navLinks = appHeader.querySelectorAll('.nav-link');
        navLinks.forEach(l => {
          l.className = "nav-link text-[#6B655B] hover:text-[#C5A875] transition-colors tracking-widest text-xs font-label uppercase";
        });
      }

      if (step >= 1 && step <= 6) {
        if (quizView) quizView.classList.remove('hidden');
        this.renderQuizStep();
      } else if (step === 7) {
        if (resultsView) resultsView.classList.remove('hidden');
        this.renderResults();
      } else if (step === 'gallery') {
        if (galleryView) galleryView.classList.remove('hidden');
        this.renderGallery();
      } else if (step === 'about') {
        if (aboutView) aboutView.classList.remove('hidden');
      }
    }
  }

  nextStep() {
    if (this.currentStep < 6) {
      this.goToStep(this.currentStep + 1);
    } else if (this.currentStep === 6) {
      this.goToStep(7);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    } else if (this.currentStep === 1) {
      this.goToStep(0);
    }
  }

  // Render Quiz Steps exactly as Stitch screens
  renderQuizStep() {
    const quizContainer = document.getElementById('view-quiz');
    if (!quizContainer) return;

    if (this.currentStep === 1) {
      quizContainer.innerHTML = this.getStep1HTML();
    } else if (this.currentStep === 2) {
      quizContainer.innerHTML = this.getStep2HTML();
    } else if (this.currentStep === 3) {
      quizContainer.innerHTML = this.getStep3HTML();
    } else if (this.currentStep === 4) {
      quizContainer.innerHTML = this.getStep4HTML();
    } else if (this.currentStep === 5) {
      quizContainer.innerHTML = this.getStep5HTML();
    } else if (this.currentStep === 6) {
      quizContainer.innerHTML = this.getStep6HTML();
    }

    this.bindQuizStepEvents();
  }

  // STEP 1: Intention Alignment (Image 1)
  getStep1HTML() {
    const intentions = [
      {
        id: "prosperity",
        title: "Prosperity & Abundance",
        sub: "North • Kubera",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 2v3m-3-1l3 1 3-1"></path><path d="M5 10c0-2.5 3-4 7-4s7 1.5 7 4c0 4-3 7-7 7s-7-3-7-7z"></path><path d="M8 17l-1 4h10l-1-4"></path><circle cx="12" cy="11" fill="currentColor" r="1.5"></circle></svg>`
      },
      {
        id: "career",
        title: "Career & Success",
        sub: "Solar Ascendance",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
      },
      {
        id: "peace",
        title: "Peace & Positive Atmosphere",
        sub: "Northeast • Ishanya",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 22s-7-4.5-7-11c0-3 3-5 7-5s7 2 7 5c0 6.5-7 11-7 11z"></path><path d="M12 6c-2 3-3 7-3 10"></path><path d="M12 6c2 3 3 7 3 10"></path><path d="M5 14c2-1 4-1 7-1s5 0 7 1"></path></svg>`
      },
      {
        id: "love",
        title: "Love & Harmonious Relationships",
        sub: "Southwest • Nairutya",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><circle cx="12" cy="11" r="2"></circle></svg>`
      },
      {
        id: "vitality",
        title: "Health & Vitality",
        sub: "East • Surya",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>`
      },
      {
        id: "spiritual",
        title: "Spirituality & Devotion",
        sub: "Brahmasthan Center",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 2c0 2-2 4-2 6a2 2 0 1 0 4 0c0-2-2-4-2-6z"></path><path d="M4 14c0 3 3.5 5 8 5s8-2 8-5H4z"></path><path d="M7 19l-1 2h12l-1-2"></path></svg>`
      },
      {
        id: "growth",
        title: "Growth & New Beginnings",
        sub: "East • Prana Gate",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 22v-9"></path><path d="M12 13c-3-2-6-1-7 2 0 0 1-4 6-4"></path><path d="M12 9c3-2 6-1 7 2 0 0-1-4-6-4"></path><path d="M12 5V2"></path></svg>`
      },
      {
        id: "protection",
        title: "Protection & Courage",
        sub: "South • Yama/Mars",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><path d="M12 2v20"></path><path d="M6 4c0 4 3 7 6 7s6-3 6-7"></path><path d="M5 4h2M17 4h2"></path></svg>`
      },
      {
        id: "aesthetic",
        title: "Simply Beautiful, Meaningful Art",
        sub: "Universal Aesthetics",
        iconSvg: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" viewBox="0 0 24 24"><rect height="18" rx="1" width="18" x="3" y="3"></rect><circle cx="12" cy="12" r="3"></circle><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke-dasharray="1 3"></path></svg>`
      }
    ];

    return `
      <!-- Corner watermark geometries -->
      <svg class="fixed top-0 left-0 w-96 h-96 pointer-events-none opacity-10 text-[#C5A875] -translate-x-32 -translate-y-32 z-0" fill="currentColor" viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="none" r="48" stroke="currentColor" stroke-width="0.5"></circle>
        <circle cx="50" cy="50" fill="none" r="38" stroke="currentColor" stroke-width="0.6"></circle>
        <circle cx="50" cy="50" fill="none" r="28" stroke="currentColor" stroke-dasharray="1 1" stroke-width="0.4"></circle>
        <polygon fill="none" points="50,10 65,35 90,50 65,65 50,90 35,65 10,50 35,35" stroke="currentColor" stroke-width="0.5"></polygon>
      </svg>
      <svg class="fixed bottom-0 right-0 w-[30rem] h-[30rem] pointer-events-none opacity-10 text-[#C5A875] translate-x-40 translate-y-40 z-0" fill="currentColor" viewBox="0 0 100 100">
        <circle cx="50" cy="50" fill="none" r="48" stroke="currentColor" stroke-width="0.5"></circle>
        <circle cx="50" cy="50" fill="none" r="38" stroke="currentColor" stroke-width="0.6"></circle>
        <circle cx="50" cy="50" fill="none" r="28" stroke="currentColor" stroke-dasharray="1 1" stroke-width="0.4"></circle>
        <polygon fill="none" points="50,10 65,35 90,50 65,65 50,90 35,65 10,50 35,35" stroke="currentColor" stroke-width="0.5"></polygon>
      </svg>

      <main class="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 py-10 z-10">
        <div class="flex flex-col lg:flex-row items-start gap-12">
          <!-- LEFT COLUMN: Questionnaire Form (60% width) -->
          <div class="w-full lg:w-[60%] flex flex-col">
            <!-- Step & Progress Header -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <span class="font-label uppercase tracking-[0.25em] text-xs text-[#C5A875] font-semibold">
                  Step 01 / 05
                </span>
                <span class="font-label text-xs tracking-wider text-[#6B655B]">Intention Alignment</span>
              </div>
              <div class="w-full h-1 bg-[#E8E0D2] rounded-full overflow-hidden">
                <div class="h-full bg-[#C5A875] w-[20%] transition-all duration-500 ease-out"></div>
              </div>
            </div>

            <!-- Question Title & Vedic Subtitle -->
            <div class="mb-8">
              <h1 class="font-headline text-3xl md:text-4xl text-[#1E2229] font-normal leading-tight mb-2 tracking-normal">
                What would you like your space to represent?
              </h1>
              <p class="font-body text-sm md:text-base text-[#6B655B] font-normal tracking-wide">
                Choose the primary intention for your space. Each vibration resonates with specific cosmic directions and sacred geometries.
              </p>
            </div>

            <!-- 3x3 Selectable Intentions Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              ${intentions.map(item => {
                const isSelected = this.state.intention === item.id;
                return `
                  <button type="button" class="relative group text-left p-5 rounded transition-all duration-300 flex flex-col justify-between h-40 focus:outline-none ${
                    isSelected 
                      ? 'bg-[#252C4A] border-[1.5px] border-[#C5A875] card-selected-glow' 
                      : 'bg-[#FFFDF8] hover:bg-[#EAE0CF]/40 border border-[#C5A875]/40 hover:border-[#C5A875] hover:-translate-y-0.5 hover:shadow-md'
                  }" data-intention="${item.id}">
                    ${isSelected ? `
                      <div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C5A875]/20 border border-[#C5A875] flex items-center justify-center text-[#C5A875]">
                        <span class="material-symbols-outlined text-xs leading-none">check</span>
                      </div>
                    ` : ''}
                    <div class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-[#C5A875]/10 border border-[#C5A875]/40 text-[#C5A875] group-hover:scale-105' 
                        : 'bg-[#EAE0CF]/60 border border-[#C5A875]/20 text-[#C5A875] group-hover:border-[#C5A875]/50'
                    }">
                      ${item.iconSvg}
                    </div>
                    <div>
                      <p class="font-label font-medium tracking-wide text-sm ${isSelected ? 'text-[#E6CFA3]' : 'text-[#1E2229] group-hover:text-[#C5A875]'} leading-snug">
                        ${item.title}
                      </p>
                      <span class="text-[10px] uppercase font-label tracking-widest ${isSelected ? 'text-[#C5A875]/80' : 'text-[#6B655B]'} block mt-1">
                        ${item.sub}
                      </span>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Navigation Actions at Bottom of Left Column -->
            <div class="flex items-center justify-between pt-6 border-t border-[#C5A875]/25">
              <button type="button" class="px-5 py-3 text-[#6B655B] hover:text-[#1E2229] font-label text-xs uppercase tracking-widest flex items-center gap-2" data-nav="hero">
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Guide</span>
              </button>
              <button type="button" class="bg-[#C5A875] hover:bg-[#b89a64] text-[#222222] font-semibold px-8 py-3.5 rounded font-label text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 group active:scale-95" data-quiz-next>
                <span>Next: Room &amp; Direction</span>
                <span class="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>

            <!-- Treatise Footnote Anchor -->
            <div class="mt-8 flex items-center gap-2 text-[#6B655B]/80 text-xs font-label">
              <span class="text-[#C5A875] text-sm font-bold">+</span>
              <span>Aligned with <em>Manasara</em> &amp; <em>Mayamata</em> Vedic treatises on architecture and sacred art form resonance.</span>
            </div>
          </div>

          <!-- RIGHT COLUMN: Sticky Dynamic Preview Panel (40% width) -->
          <aside class="w-full lg:w-[40%] sticky top-28">
            <div class="bg-[#FFFDF8] border border-[#C5A875]/30 rounded p-7 shadow-sm relative overflow-hidden">
              <div class="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-[#C5A875]/10 pointer-events-none"></div>

              <!-- Section Heading -->
              <div class="mb-5">
                <span class="font-label text-[10px] uppercase tracking-[0.25em] text-[#C5A875] block mb-1 font-semibold">
                  Live Vedic Alignment
                </span>
                <h2 class="font-headline text-2xl text-[#1E2229] font-normal">
                  Recommended Artwork
                </h2>
                <p class="font-body text-xs text-[#6B655B] mt-1 leading-relaxed">
                  Curated sacred artwork responding directly to your chosen intention.
                </p>
              </div>

              <!-- Active Preview Directive Tag -->
              <div class="mb-6 bg-[#EAE0CF]/40 border-l-2 border-[#C5A875] px-3.5 py-2.5 rounded-r flex items-center gap-2">
                <span class="material-symbols-outlined text-[#C5A875] text-base">explore</span>
                <span class="font-label text-xs text-[#1E2229] font-medium tracking-wide">
                  Direction: North (Kubera) &amp; Northeast (Ishanya)
                </span>
              </div>

              <!-- Artwork Slots Preview Stack -->
              <div class="space-y-4 mb-6 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                ${this.getRecommendationCardsHTML(1, 'light')}
              </div>

              <!-- Footnote -->
              <div class="pt-4 border-t border-[#C5A875]/20 flex items-start gap-2.5 text-xs text-[#6B655B]">
                <span class="material-symbols-outlined text-sm text-[#C5A875] mt-0.5">verified</span>
                <span class="leading-relaxed">Every artwork is consecrated and handcrafted by master traditional artisans in Tanjore &amp; Rajasthan.</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    `;
  }

  // STEP 2: Room Placement Alignment (Image 2)
  getStep2HTML() {
    const rooms = [
      {
        id: "foyer",
        title: "Entrance / Foyer",
        sub: "NORTH / EAST PRANA THRESHOLD",
        icon: "door_front"
      },
      {
        id: "living",
        title: "Living Room",
        sub: "BRAHMASTHAN & SOCIAL HARMONY",
        icon: "chair"
      },
      {
        id: "bedroom",
        title: "Bedroom",
        sub: "SOUTHWEST / STABILITY & REST",
        icon: "bed"
      },
      {
        id: "pooja",
        title: "Puja Room / Meditation Area",
        sub: "NORTHEAST ISHANYA / DIVINE LIGHT",
        icon: "self_improvement"
      },
      {
        id: "office",
        title: "Home Office / Study",
        sub: "NORTH / INTELLECT & WEALTH",
        icon: "auto_stories"
      },
      {
        id: "dining",
        title: "Dining Room",
        sub: "SOUTHEAST / AGNI & NOURISHMENT",
        icon: "soup_kitchen"
      }
    ];

    return `
      <main class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 py-10 flex-1">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <!-- LEFT COLUMN (~60% / 7 cols) -->
          <section class="lg:col-span-7 flex flex-col space-y-7">
            <!-- Step Progress Header -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-label text-xs uppercase tracking-[0.25em] font-semibold text-[#C5A875]">STEP 02 / 05</span>
                <span class="font-label text-xs uppercase tracking-[0.2em] text-[#6B655B]">Room Placement Alignment</span>
              </div>
              <div class="w-full h-1 bg-[#EAE0CF] overflow-hidden rounded-full">
                <div class="h-full bg-[#C5A875] transition-all duration-500 ease-out" style="width: 40%;"></div>
              </div>
            </div>

            <!-- Question Title & Philosophical Subtext -->
            <div class="space-y-3">
              <h1 class="font-headline text-3xl md:text-4xl text-[#222222] font-normal tracking-wide leading-tight">
                Where would you like to place the artwork?
              </h1>
              <p class="font-body text-sm md:text-base text-[#222222]/80 font-light leading-relaxed">
                Vastu principles vary by room type. Each space governs distinct elemental energies, doshas, and directional deities.
              </p>
            </div>

            <!-- Seven Selectable Answer Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              ${rooms.map(r => {
                const isSelected = this.state.room === r.id;
                return `
                  <button type="button" class="group relative text-left p-5 rounded-lg transition-all duration-300 flex flex-col justify-between h-[162px] ${
                    isSelected
                      ? 'border-2 border-[#C5A875] bg-[#252C4A] text-[#F8F4EB] card-selected-glow shadow-lg scale-[1.01]'
                      : 'border border-[#C5A875]/30 bg-[#FFFDF8] hover:border-[#C5A875] hover:shadow-sm'
                  }" data-room="${r.id}">
                    <div class="flex items-start justify-between w-full">
                      <span class="w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                        isSelected 
                          ? 'border border-[#C5A875] text-[#C5A875] bg-[#C5A875]/15' 
                          : 'border border-[#C5A875]/40 text-[#C5A875] group-hover:scale-105 bg-[#EAE0CF]/20'
                      }">
                        <span class="material-symbols-outlined text-xl">${r.icon}</span>
                      </span>
                      ${isSelected ? `
                        <span class="w-6 h-6 rounded-full bg-[#C5A875] text-[#222222] flex items-center justify-center shadow-md">
                          <span class="material-symbols-outlined text-sm font-bold">check</span>
                        </span>
                      ` : ''}
                    </div>
                    <div>
                      <h3 class="font-headline text-base font-medium ${isSelected ? 'text-[#F8F4EB]' : 'text-[#222222] group-hover:text-[#C5A875] transition-colors'}">
                        ${r.title}
                      </h3>
                      <p class="font-label text-[10px] tracking-wider uppercase mt-1 font-medium ${isSelected ? 'text-[#C5A875]' : 'text-[#C5A875]/90'}">
                        ${r.sub}
                      </p>
                    </div>
                  </button>
                `;
              }).join('')}

              <!-- Card 7: Other Space (spans full width) -->
              <button type="button" class="group relative text-left p-5 rounded-lg border border-[#C5A875]/30 bg-[#FFFDF8] hover:border-[#C5A875] hover:shadow-sm transition-all duration-300 flex items-center justify-between col-span-1 sm:col-span-2 md:col-span-3" data-room="other">
                <div class="flex items-center gap-4">
                  <span class="w-10 h-10 rounded-full border border-[#C5A875]/40 flex items-center justify-center text-[#C5A875] group-hover:scale-105 transition-transform bg-[#EAE0CF]/20 flex-shrink-0">
                    <span class="material-symbols-outlined text-xl">architecture</span>
                  </span>
                  <div>
                    <h3 class="font-headline text-base text-[#222222] font-medium group-hover:text-[#C5A875] transition-colors">Other Space</h3>
                    <p class="font-label text-[10px] tracking-wider uppercase text-[#C5A875]/90 font-medium">CUSTOM ARCHITECTURAL ALIGNMENT</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-[#C5A875]/70 group-hover:translate-x-1 transition-transform">add</span>
              </button>
            </div>

            <!-- Custom Spatial Energetic Mapping -->
            <div class="p-5 rounded-lg border border-[#C5A875]/40 bg-[#FFFDF8] relative space-y-2 shadow-sm">
              <div class="flex items-center justify-between text-xs font-label">
                <span class="uppercase tracking-widest text-[#C5A875] font-semibold flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-sm">tune</span>
                  Custom Spatial Energetic Mapping
                </span>
                <span class="text-[#222222]/50 text-[11px]">Optional</span>
              </div>
              <div class="relative">
                <textarea class="w-full bg-[#FAF7F2] border border-[#EAE0CF] focus:border-[#C5A875] focus:ring-1 focus:ring-[#C5A875] rounded text-xs text-[#222222] placeholder-[#222222]/45 p-3 resize-none font-body transition-colors leading-relaxed" placeholder="Describe your space, tell us more (e.g. double-height living room mezzanine, courtyard library, sunlit garden hallway, gallery lobby)..." rows="2"></textarea>
              </div>
            </div>

            <!-- Action Navigation Row -->
            <div class="flex items-center justify-between pt-4 border-t border-[#C5A875]/25">
              <button type="button" class="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-[#222222]/80 hover:text-[#C5A875] transition-colors font-medium py-3 px-2" data-quiz-prev>
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Intention</span>
              </button>
              <button type="button" class="bg-[#C5A875] hover:bg-[#b59765] text-[#222222] font-label text-xs uppercase tracking-[0.2em] font-semibold px-8 py-3.5 rounded shadow hover:shadow-lg transition-all duration-300 flex items-center gap-3 group active:scale-95" data-quiz-next>
                <span>Next: Direction &amp; Orientation</span>
                <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

            <!-- Footer Treatise Disclaimer -->
            <div class="pt-2 text-center sm:text-left">
              <p class="font-body text-xs text-[#222222]/65 italic flex items-center gap-1.5">
                <span class="text-[#C5A875] not-italic font-bold">+</span>
                Aligned with Manasara &amp; Mayamata Vedic treatises on architecture and sacred art form resonance.
              </p>
            </div>
          </section>

          <!-- RIGHT COLUMN (~40% / 5 cols) - Sticky Live Vedic Curation Artwork Card Panel -->
          <aside class="lg:col-span-5 lg:sticky lg:top-24">
            <div class="bg-[#FFFDF8] text-[#1E2229] rounded-xl border border-[#C5A875]/30 p-6 md:p-7 shadow-sm relative overflow-hidden space-y-6">
              <svg class="absolute -right-16 -top-16 w-56 h-56 text-[#C5A875]/10 stroke-current fill-none stroke-[0.8] pointer-events-none" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90"></circle>
                <polygon points="100,15 180,155 20,155"></polygon>
                <polygon points="100,185 20,45 180,45"></polygon>
                <circle cx="100" cy="100" r="45"></circle>
              </svg>

              <!-- Top Panel Live Badge Header -->
              <div class="space-y-2 border-b border-[#C5A875]/20 pb-4">
                <div class="flex items-center justify-between">
                  <span class="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-label text-[#C5A875] font-semibold bg-[#C5A875]/10 px-3 py-1 rounded-full border border-[#C5A875]/30">
                    <span class="material-symbols-outlined text-xs">explore</span>
                    Live Vedic Alignment
                  </span>
                  <span class="text-[11px] font-label text-[#C5A875] tracking-widest flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
                    ACTIVE FEED
                  </span>
                </div>
                <div class="pt-1">
                  <h2 class="font-headline text-xl text-[#1E2229] font-medium tracking-wide">
                    ${this.getMatchingProductsForStep(2).length} Matching Artworks for ${ROOMS.find(r => r.id === this.state.room)?.title || 'Space'}
                  </h2>
                  <p class="font-body text-xs text-[#6B655B] mt-1 leading-relaxed">
                    Curated sacred artwork responding directly to your chosen space and resonance.
                  </p>
                </div>

                <!-- Direction & Elemental Resonance Ribbon -->
                <div class="mt-3 py-2 px-3 bg-[#EAE0CF]/40 rounded border border-[#C5A875]/25 text-[11px] font-label text-[#1E2229] flex items-center justify-between tracking-wide">
                  <span><strong class="font-semibold text-[#C5A875]">Direction:</strong> North, East &amp; NE</span>
                  <span><strong class="font-semibold text-[#C5A875]">Element:</strong> Ether &amp; Water</span>
                </div>
              </div>

              <!-- Product Preview Cards Cluster -->
              <div class="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                ${this.getRecommendationCardsHTML(2, 'light')}
              </div>

              <!-- Bottom Trust Indicator -->
              <div class="pt-3 border-t border-[#C5A875]/20 flex items-start gap-3 bg-[#FAF7F2] p-3 rounded-lg">
                <span class="w-7 h-7 rounded-full bg-[#C5A875]/15 border border-[#C5A875] flex items-center justify-center text-[#C5A875] flex-shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-sm font-semibold">verified_user</span>
                </span>
                <p class="font-body text-xs text-[#6B655B] leading-relaxed">
                  Every artwork is consecrated and handcrafted by master traditional artisans in Tanjore &amp; Rajasthan.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    `;
  }

  // STEP 3: Wall Orientation & Direction Compass (Image 3)
  getStep3HTML() {
    const directions = [
      { id: "north", name: "North", sub: "Kuber • Wealth & Prosperity", badge: "N", icon: "north" },
      { id: "northeast", name: "North-East", sub: "Ishanya • Clarity & Spirit", badge: "NE", icon: "north_east" },
      { id: "east", name: "East", sub: "Surya • Vitality & Beginnings", badge: "Active Selection", icon: "east" },
      { id: "southeast", name: "South-East", sub: "Agni • Energy & Fire", badge: "SE", icon: "south_east" },
      { id: "south", name: "South", sub: "Yama • Legal & Strength", badge: "S", icon: "south" },
      { id: "southwest", name: "South-West", sub: "Nairutya • Ancestral Stability", badge: "SW", icon: "south_west" },
      { id: "west", name: "West", sub: "Varuna • Sustained Gains", badge: "W", icon: "west" },
      { id: "northwest", name: "North-West", sub: "Vayu • Social & Movement", badge: "NW", icon: "north_west" },
      { id: "assist", name: "I'm Not Sure", sub: "Guided Compass Tool", badge: "ASSIST", icon: "help" }
    ];

    const currentRotation = this.directionRotations[this.state.direction] || 0;
    const activeDir = VASTU_DIRECTIONS[this.state.direction] || VASTU_DIRECTIONS.east;

    return `
      <main class="w-full max-w-7xl mx-auto px-6 md:px-8 py-10 z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <!-- LEFT COLUMN (7 cols) -->
          <div class="lg:col-span-7 flex flex-col space-y-6">
            <!-- Progress Track: 60% Filled -->
            <div class="space-y-3">
              <div class="flex items-center justify-between text-xs font-label">
                <span class="text-[#C5A875] font-semibold tracking-[0.25em] uppercase">• STEP 03 / 05</span>
                <span class="text-[#716b60] font-medium tracking-[0.18em]">WALL ORIENTATION &amp; DIRECTION</span>
              </div>
              <div class="w-full h-1 bg-[#EAE0CF] overflow-hidden rounded-full">
                <div class="h-full bg-[#C5A875] transition-all duration-500 ease-out" style="width: 60%;"></div>
              </div>
            </div>

            <!-- Headline & Subtitle -->
            <div class="space-y-3">
              <h1 class="font-headline text-3xl sm:text-4xl text-[#222222] font-normal leading-tight tracking-tight">
                Do you know the direction of your wall?
              </h1>
              <p class="font-body text-[#716b60] text-sm sm:text-base leading-relaxed">
                This helps us provide more relevant Vastu-inspired recommendations.
              </p>
            </div>

            <!-- Circular Vastu Purusha Mandala Compass SVG -->
            <div class="relative py-2 flex flex-col items-center justify-center w-full max-w-md mx-auto">
              <div class="w-full flex items-center justify-between px-2 mb-2 text-xs font-label tracking-wider">
                <span class="font-bold tracking-[0.18em] text-[#1B2038] uppercase text-[11px]">VASTU PURUSHA MANDALA ALIGNMENT</span>
                <span id="compass-status-label" class="text-[#716b60] font-medium text-[11px] capitalize">${activeDir.name} Active</span>
              </div>

              <div class="w-full max-w-[310px] aspect-square relative flex items-center justify-center">
                <svg viewBox="0 0 300 300" class="w-full h-full select-none">
                  <defs>
                    <filter id="needle-shadow" x="-10%" y="-10%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#1B2038" flood-opacity="0.15"></feDropShadow>
                    </filter>
                  </defs>

                  <!-- Outer Rings -->
                  <circle cx="150" cy="150" r="130" fill="none" stroke="#C5A875" stroke-width="1.2" stroke-dasharray="2 4" opacity="0.6"></circle>
                  <circle cx="150" cy="150" r="115" fill="none" stroke="#C5A875" stroke-width="0.8" opacity="0.4"></circle>
                  <circle cx="150" cy="150" r="75" fill="none" stroke="#C5A875" stroke-width="0.8" opacity="0.45"></circle>

                  <!-- Active Quadrant Wedge -->
                  <g class="compass-wedge-group" style="transform: rotate(${currentRotation}deg); transform-origin: 150px 150px;">
                    <path d="M 150 150 L 256.24 106.01 A 115 115 0 0 1 256.24 193.99 Z" fill="#C5A875" fill-opacity="0.28" stroke="#C5A875" stroke-width="0.75" stroke-opacity="0.5"></path>
                    <path d="M 150 150 L 219.29 121.31 A 75 75 0 0 1 219.29 178.69 Z" fill="#C5A875" fill-opacity="0.12"></path>
                  </g>

                  <!-- Crosshairs -->
                  <line x1="68.39" y1="68.39" x2="231.61" y2="231.61" stroke="#C5A875" stroke-width="0.85" stroke-dasharray="3 3" opacity="0.45"></line>
                  <line x1="68.39" y1="231.61" x2="231.61" y2="68.39" stroke="#C5A875" stroke-width="0.85" stroke-dasharray="3 3" opacity="0.45"></line>
                  <line x1="150" y1="35" x2="150" y2="265" stroke="#C5A875" stroke-width="0.9" opacity="0.55"></line>
                  <line x1="35" y1="150" x2="265" y2="150" stroke="#C5A875" stroke-width="0.9" opacity="0.55"></line>

                  <!-- Labels -->
                  <text x="150" y="30" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="11" font-weight="700" fill="#1B2038">N</text>
                  <text x="272" y="150" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="11" font-weight="700" fill="#C5A875">E</text>
                  <text x="150" y="272" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="11" font-weight="700" fill="#716b60">S</text>
                  <text x="28" y="150" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="11" font-weight="700" fill="#716b60">W</text>
                  <text x="235" y="75" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="9" font-weight="600" fill="#C5A875">NE</text>
                  <text x="235" y="225" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="9" font-weight="500" fill="#716b60">SE</text>
                  <text x="65" y="225" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="9" font-weight="500" fill="#716b60">SW</text>
                  <text x="65" y="75" text-anchor="middle" dominant-baseline="central" font-family="'Raleway', sans-serif" font-size="9" font-weight="500" fill="#716b60">NW</text>

                  <!-- Rotating Compass Needle -->
                  <g class="compass-needle-group" style="transform: rotate(${currentRotation}deg); transform-origin: 150px 150px;">
                    <polygon points="150,146.5 150,153.5 82,150" fill="#D5C7B0" opacity="0.9"></polygon>
                    <line x1="150" y1="150" x2="82" y2="150" stroke="#FAF7F2" stroke-width="0.5" opacity="0.6"></line>
                    <g filter="url(#needle-shadow)">
                      <polygon points="150,145.5 150,154.5 218,150" fill="#1B2038"></polygon>
                      <polygon points="150,145.5 150,150 218,150" fill="#252C4A"></polygon>
                    </g>
                  </g>

                  <!-- Center Pivot Hub -->
                  <circle cx="150" cy="150" r="16" fill="none" stroke="#C5A875" stroke-width="1.75"></circle>
                  <circle cx="150" cy="150" r="18.5" fill="none" stroke="#C5A875" stroke-width="0.5" stroke-dasharray="1 2" opacity="0.5"></circle>
                  <circle cx="150" cy="150" r="4.5" fill="#FAF7F2" stroke="#1B2038" stroke-width="1.5"></circle>
                </svg>
              </div>
            </div>

            <!-- 3x3 Grid of 9 Directional Selection Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
              ${directions.map(d => {
                const isSelected = this.state.direction === d.id;
                return `
                  <button type="button" class="group relative p-4 rounded-sm transition-all duration-300 text-left flex flex-col justify-between h-[108px] ${
                    isSelected
                      ? 'border-2 border-[#C5A875] bg-[#252C4A] shadow-md shadow-[#C5A875]/10 ring-1 ring-[#C5A875]/50'
                      : d.id === 'assist'
                        ? 'border border-dashed border-[#C5A875]/50 bg-[#FAF7F2] hover:border-[#C5A875] hover:bg-[#FFFDF8]'
                        : 'border border-[#EAE0CF] bg-[#FFFDF8] hover:border-[#C5A875] hover:shadow-sm'
                  }" data-direction="${d.id}">
                    ${isSelected ? `
                      <div class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#C5A875] text-[#252C4A] flex items-center justify-center shadow-md">
                        <span class="material-symbols-outlined text-xs font-bold">check</span>
                      </div>
                    ` : ''}
                    <div class="flex items-start justify-between">
                      <div class="w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-[#1B2038] border border-[#C5A875] text-[#C5A875]' 
                          : 'bg-[#FAF7F2] border border-[#EAE0CF] text-[#716b60] group-hover:text-[#C5A875]'
                      }">
                        <span class="material-symbols-outlined text-sm">${d.icon}</span>
                      </div>
                      <span class="font-label text-[10px] uppercase tracking-wider ${isSelected ? 'text-[#C5A875] font-semibold' : 'text-[#716b60] opacity-75'}">
                        ${d.badge}
                      </span>
                    </div>
                    <div>
                      <p class="font-headline text-base font-semibold leading-tight ${isSelected ? 'text-[#FAF7F2]' : 'text-[#222222]'}">
                        ${d.name}
                        ${isSelected ? '<span class="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A875] ml-1"></span>' : ''}
                      </p>
                      <p class="font-label text-[11px] mt-0.5 truncate ${isSelected ? 'text-[#C5A875] font-medium' : 'text-[#716b60]'}">
                        ${d.sub}
                      </p>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Bottom Nav -->
            <div class="flex items-center justify-between pt-4 border-t border-[#C5A875]/25">
              <button type="button" class="inline-flex items-center gap-2 font-label text-xs uppercase tracking-widest text-[#222222]/80 hover:text-[#C5A875] transition-colors py-3 px-2" data-quiz-prev>
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Room Selection</span>
              </button>
              <button type="button" class="bg-[#C5A875] hover:bg-[#b59765] text-[#222222] font-label text-xs uppercase tracking-[0.2em] font-semibold px-8 py-3.5 rounded shadow hover:shadow-lg transition-all duration-300 flex items-center gap-3 active:scale-95" data-quiz-next>
                <span>Next: Artwork Preferences</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div class="pt-2 text-center sm:text-left">
              <p class="font-body text-xs text-[#222222]/65 italic flex items-center gap-1.5">
                <span class="text-[#C5A875] not-italic font-bold">+</span>
                Aligned with Manasara &amp; Mayamata Vedic treatises on solar architecture and directional resonance.
              </p>
            </div>
          </div>

          <!-- RIGHT COLUMN: Sticky Live Matching Works (5 cols) -->
          <div class="lg:col-span-5 relative">
            <div class="sticky top-28 bg-[#FFFDF8] text-[#1E2229] rounded-xl p-6 lg:p-7 shadow-sm border border-[#C5A875]/30 space-y-5 overflow-hidden">
              <div class="flex items-center justify-between pb-3 border-b border-[#C5A875]/20">
                <span class="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-label text-[#C5A875] font-semibold bg-[#C5A875]/10 px-3 py-1 rounded-full border border-[#C5A875]/30">
                  <span class="material-symbols-outlined text-xs">explore</span>
                  Live Vedic Alignment
                </span>
                <span class="text-[11px] font-label text-[#C5A875] tracking-widest flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
                  ACTIVE FEED
                </span>
              </div>

              <div>
                <h3 class="font-headline text-xl text-[#1E2229] font-medium">
                  ${this.getMatchingProductsForStep(3).length} Matching Artworks for ${activeDir.name}
                </h3>
                <p class="font-body text-xs text-[#6B655B] mt-1 leading-relaxed">
                  Curated sacred artworks channeling solar ascendance, vitality and harmonious morning prana for the ${activeDir.name} direction.
                </p>
              </div>

              <!-- Ribbon -->
              <div class="py-2 px-3 bg-[#EAE0CF]/40 rounded border border-[#C5A875]/25 text-[11px] font-label text-[#1E2229] flex items-center justify-between tracking-wide">
                <span><strong class="font-semibold text-[#C5A875]">DIRECTION:</strong> ${activeDir.name}</span>
                <span><strong class="font-semibold text-[#C5A875]">ELEMENT:</strong> ${activeDir.element}</span>
              </div>

              <div class="space-y-3">
                <span class="text-[10px] uppercase tracking-widest text-[#C5A875] block font-semibold">Recommended Works (${this.getMatchingProductsForStep(3).length} Active)</span>
                <div class="space-y-3 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                  ${this.getRecommendationCardsHTML(3, 'light')}
                </div>
              </div>

              <!-- Trust Note -->
              <div class="pt-3 border-t border-[#C5A875]/20 flex items-start gap-2.5 text-xs text-[#6B655B]">
                <span class="material-symbols-outlined text-sm text-[#C5A875]">verified</span>
                <span>Every artwork is consecrated and handcrafted by master traditional artisans in Tanjore &amp; Rajasthan.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  // STEP 4: Aesthetic Style & Color Harmony (Image 4)
  getStep4HTML() {
    return `
      <main class="w-full max-w-7xl mx-auto px-6 md:px-8 py-10 z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <!-- LEFT COLUMN (7 cols) -->
          <div class="lg:col-span-7 flex flex-col">
            <!-- Step & Progress Header -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <span class="font-label uppercase tracking-[0.25em] text-xs text-[#C5A875] font-semibold">
                  Step 04 / 05
                </span>
                <span class="font-label text-xs tracking-wider text-[#6B655B]">Aesthetic Style &amp; Color Harmony</span>
              </div>
              <div class="w-full h-1 bg-[#EAE0CF] rounded-full overflow-hidden">
                <div class="h-full bg-[#C5A875] w-[80%] transition-all duration-500 ease-out"></div>
              </div>
            </div>

            <!-- Header Section -->
            <div class="mb-8">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#EAE0CF]/60 text-[#716b60] text-[10px] tracking-[0.25em] uppercase font-medium rounded-full mb-3">
                <span class="material-symbols-outlined text-[13px] text-[#C5A875]">palette</span>
                Aesthetic Style &amp; Color Harmony
              </div>
              <h1 class="font-headline text-3xl sm:text-4xl text-[#222222] font-semibold tracking-tight leading-tight mb-3">
                What kind of artwork do you prefer?
              </h1>
              <p class="text-[#716b60] text-sm sm:text-base leading-relaxed">
                Select the sacred artistic medium and stylistic tradition that harmonizes with your spatial sanctuary and aesthetic taste.
              </p>
            </div>

            <!-- 01. Select Artwork Style & Tradition -->
            <div class="mb-10">
              <div class="flex items-center justify-between mb-4">
                <span class="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#716b60]">01. Select Artwork Style &amp; Tradition</span>
                <span class="text-[11px] text-[#C5A875] tracking-wider uppercase font-medium">Single Selection</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${STYLES.map(s => {
                  const isSelected = this.state.style === s.id;
                  return `
                    <button type="button" class="group relative text-left p-5 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#252C4A] text-[#F8F4EB] shadow-lg shadow-[#252C4A]/10 scale-[1.01] card-selected-glow'
                        : 'bg-[#FFFDF8] hover:bg-[#FAF7F2] text-[#222222] shadow-sm hover:shadow-md border border-[#EAE0CF]'
                    }" data-style="${s.id}">
                      <div class="flex items-start justify-between gap-3 mb-3">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#C5A875]/20 text-[#C5A875]' : 'bg-[#EAE0CF]/70 text-[#716b60] group-hover:text-[#C5A875]'
                        }">
                          <span class="material-symbols-outlined text-lg">${s.icon}</span>
                        </div>
                        ${isSelected ? `
                          <div class="w-6 h-6 rounded-full bg-[#C5A875] text-[#252C4A] flex items-center justify-center text-xs shadow-sm">
                            <span class="material-symbols-outlined text-sm font-bold">check</span>
                          </div>
                        ` : ''}
                      </div>
                      <h3 class="font-headline text-lg font-semibold tracking-tight mb-1.5 ${isSelected ? 'text-[#FFFDF8]' : 'text-[#222222]'}">
                        ${s.title}
                      </h3>
                      <p class="text-xs leading-relaxed ${isSelected ? 'text-[#FAF7F2]/80 font-light' : 'text-[#716b60]'}">
                        ${s.description}
                      </p>
                      <div class="mt-4 pt-3 border-t flex items-center justify-between text-[10px] tracking-widest uppercase ${
                        isSelected ? 'border-[#C5A875]/20 text-[#C5A875]' : 'border-[#EAE0CF] text-[#716b60]'
                      }">
                        <span>${s.badge.split('•')[0]}</span>
                        <span>${s.badge.split('•')[1] || ''}</span>
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Navigation & Shastra Footnote -->
            <div class="pt-6 pb-8 border-t border-[#EAE0CF] flex flex-col gap-4">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button type="button" class="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#716b60] hover:text-[#222222] transition-colors py-3" data-quiz-prev>
                  <span class="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Direction</span>
                </button>
                <button type="button" class="inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#C5A875] hover:bg-[#B39055] text-[#222222] font-semibold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-95" data-quiz-next>
                  <span>Next: Devotional Preference</span>
                  <span class="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </button>
              </div>

              <div class="flex items-center gap-2 text-[#716b60] text-xs font-light">
                <span class="text-[#C5A875] font-bold">+</span>
                <span>Aligned with Chitrasutra &amp; Shilpa Shastras ancient Indian treatise on proportions and sacred colors.</span>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Matching Works Feed (5 cols) -->
          <div class="lg:col-span-5 relative">
            <div class="sticky top-28 rounded-xl bg-[#FFFDF8] text-[#1E2229] p-6 lg:p-7 shadow-sm border border-[#C5A875]/30 space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-[#C5A875]/20">
                <span class="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase font-label text-[#C5A875] font-semibold bg-[#C5A875]/10 px-3 py-1 rounded-full border border-[#C5A875]/30">
                  <span class="material-symbols-outlined text-xs">explore</span>
                  Live Vedic Alignment
                </span>
                <span class="text-[11px] font-label text-[#C5A875] tracking-widest flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
                  ACTIVE FEED
                </span>
              </div>

              <div>
                <h3 class="font-headline text-xl text-[#1E2229] font-medium">
                  ${this.getMatchingProductsForStep(4).length} Matching Artworks for ${STYLES.find(s => s.id === this.state.style)?.title || 'Selected Style'}
                </h3>
                <p class="font-body text-xs text-[#6B655B] mt-1 leading-relaxed">
                  Curated sacred artworks matching your architectural finish and aesthetic taste.
                </p>
              </div>

              <!-- Ribbon -->
              <div class="py-2 px-3 bg-[#EAE0CF]/40 rounded border border-[#C5A875]/25 text-[10px] font-label text-[#1E2229] flex items-center justify-between tracking-wide">
                <span><strong class="font-semibold text-[#C5A875]">STYLE:</strong> ${STYLES.find(s => s.id === this.state.style)?.title || 'Curated'}</span>
                <span><strong class="font-semibold text-[#C5A875]">RESONANCE:</strong> Certified Active</span>
              </div>

              <div class="space-y-3">
                <span class="text-[10px] uppercase tracking-widest text-[#C5A875] block font-semibold">Recommended Artworks (${this.getMatchingProductsForStep(4).length} Active)</span>
                <div class="space-y-3 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                  ${this.getRecommendationCardsHTML(4, 'light')}
                </div>
              </div>

              <!-- Verification Certificate Seal -->
              <div class="mt-6 pt-5 border-t border-[#C5A875]/20 flex items-start gap-3 bg-[#FAF7F2] p-3.5 rounded-xl">
                <div class="w-8 h-8 rounded-full bg-[#C5A875]/15 text-[#C5A875] flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">verified_user</span>
                </div>
                <div>
                  <h5 class="text-[11px] font-semibold uppercase tracking-wider text-[#1E2229]">Master Artisan Certified</h5>
                  <p class="text-[10px] text-[#6B655B] leading-relaxed font-light mt-0.5">
                    Every artwork is consecrated and handcrafted by master traditional artisans in Tanjore &amp; Rajasthan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  // STEP 5: Spiritual & Philosophical Alignment (Image 5)
  getStep5HTML() {
    const options = [
      {
        id: "devotional",
        title: "Devotional Artwork",
        badge: "PRIMARY ACCORD",
        icon: "brightness_7",
        desc: "Traditional deities, sacred temple iconography, consecrated spiritual presence, and divine cosmic forms depicted through pure Vedic canons."
      },
      {
        id: "symbolic",
        title: "Non-Religious Symbolic Artwork",
        badge: "",
        icon: "spa",
        desc: "Tree of Life, sacred geometric yantras, celestial horses, blooming lotus mandalas, and natural elemental forces without deific figures."
      },
      {
        id: "both",
        title: "Open to Both",
        badge: "",
        icon: "all_inclusive",
        desc: "Harmonious blend of sacred symbolism and subtle spiritual artistry tailored to directional harmony and architectural aesthetics."
      }
    ];

    return `
      <main class="w-full max-w-7xl mx-auto px-6 md:px-8 py-10 z-10">
        <!-- Progress Stepper Bar -->
        <div class="mb-8 lg:mb-10">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#C5A875] animate-ping"></span>
              <span class="font-label text-xs tracking-[0.25em] uppercase text-[#716b60] font-semibold">
                • STEP 05 / 05
              </span>
              <span class="text-xs text-[#C5A875]/80 font-serif italic">Final Architectural Alignment</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="font-headline text-lg sm:text-xl text-[#C5A875] font-bold tracking-wider">100%</span>
              <span class="font-label text-[10px] tracking-[0.25em] uppercase text-[#716b60] font-medium">CALIBRATED</span>
            </div>
          </div>
          <div class="w-full h-1.5 bg-[#EAE0CF] overflow-hidden rounded-full shadow-inner relative">
            <div class="h-full bg-gradient-to-r from-[#B39055] via-[#C5A875] to-[#C5A875] w-full transition-all duration-700 ease-out"></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <!-- LEFT COLUMN (7 cols) -->
          <div class="lg:col-span-7 flex flex-col space-y-7">
            <div>
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A875]/10 border border-[#C5A875]/30">
                <span class="material-symbols-outlined text-sm text-[#C5A875]">temple_hindu</span>
                <span class="font-label text-[11px] font-semibold tracking-[0.22em] uppercase text-[#252C4A]">
                  SPIRITUAL &amp; PHILOSOPHICAL ALIGNMENT
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <h1 class="font-headline text-3xl sm:text-4xl lg:text-[42px] leading-[1.18] text-[#222222] font-semibold tracking-tight">
                Would you prefer devotional or non-religious artwork?
              </h1>
              <p class="font-body text-[#716b60] text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Specify your spiritual orientation so we can curate sacred deific forms, timeless philosophical motifs, or universal sacred geometry tuned to your sanctum.
              </p>
            </div>

            <!-- Selection Cards -->
            <div class="flex flex-col space-y-4 pt-1">
              ${options.map(opt => {
                const isSelected = this.state.spiritual === opt.id;
                return `
                  <div class="group relative p-6 cursor-pointer rounded-lg transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#252C4A] text-[#FFFDF8] border-2 border-[#C5A875] shadow-xl shadow-[#C5A875]/10'
                      : 'bg-[#FFFDF8] text-[#222222] border border-[#EAE0CF] hover:border-[#C5A875]/60 shadow-sm hover:shadow-md'
                  }" data-spiritual="${opt.id}">
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex items-start gap-4">
                        <div class="w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected ? 'bg-[#C5A875]/20 border border-[#C5A875] text-[#C5A875]' : 'bg-[#FAF7F2] border border-[#EAE0CF] text-[#716b60]'
                        }">
                          <span class="material-symbols-outlined text-2xl">${opt.icon}</span>
                        </div>
                        <div class="space-y-1.5">
                          <div class="flex items-center gap-2.5">
                            <span class="font-headline text-lg sm:text-xl font-medium tracking-wide ${isSelected ? 'text-white' : 'text-[#222222]'}">
                              ${opt.title}
                            </span>
                            ${opt.badge ? `
                              <span class="px-2 py-0.5 text-[9px] uppercase tracking-widest font-semibold bg-[#C5A875] text-[#252C4A] rounded-full">
                                ${opt.badge}
                              </span>
                            ` : ''}
                          </div>
                          <p class="font-body text-xs sm:text-sm leading-relaxed font-light ${isSelected ? 'text-[#FAF7F2]/80' : 'text-[#716b60]'}">
                            ${opt.desc}
                          </p>
                        </div>
                      </div>

                      <div class="shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-[#C5A875] text-[#252C4A] shadow-sm' : 'border border-[#C5A875]/40 text-transparent'
                      }">
                        <span class="material-symbols-outlined text-base font-bold">check</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Navigation Row -->
            <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button type="button" class="inline-flex items-center gap-2 text-xs font-label uppercase tracking-[0.2em] text-[#716b60] hover:text-[#222222] transition-colors" data-quiz-prev>
                <span class="material-symbols-outlined text-sm">arrow_back</span>
                <span>BACK TO ARTWORK STYLE</span>
              </button>
              <button type="button" class="w-full sm:w-auto px-8 py-3.5 bg-[#C5A875] hover:bg-[#b59765] text-[#252C4A] font-label font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-3" data-quiz-next>
                <span>NEXT: FINAL DETAILS</span>
                <span class="material-symbols-outlined text-base font-bold">arrow_forward</span>
              </button>
            </div>

            <div class="pt-4 border-t border-[#C5A875]/20 flex items-center gap-3 text-xs text-[#716b60]">
              <span class="material-symbols-outlined text-[#C5A875] text-base">menu_book</span>
              <p class="italic leading-tight">
                Aligned with <span class="text-[#252C4A] font-semibold not-italic">Manasara &amp; Mayamata</span> Vedic treatises on sacred art resonance.
              </p>
            </div>
          </div>

          <!-- RIGHT COLUMN: Active Feed Sidebar (5 cols) -->
          <div class="lg:col-span-5 relative">
            <div class="sticky top-28 rounded-xl bg-[#FFFDF8] text-[#1E2229] p-6 lg:p-7 shadow-sm border border-[#C5A875]/30 overflow-hidden space-y-5">
              <div class="flex items-center justify-between pb-4 border-b border-[#C5A875]/20">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span class="font-label text-[10px] tracking-[0.25em] uppercase text-emerald-600 font-bold">ACTIVE FEED</span>
                </div>
                <span class="font-label text-[10px] tracking-[0.2em] uppercase text-[#C5A875]">VEDIC VAULT SYNC</span>
              </div>

              <div>
                <h2 class="font-headline text-xl sm:text-2xl text-[#1E2229] font-medium tracking-wide">
                  ${this.getMatchingProductsForStep(5).length} Matching Artworks for Sacred Sanctum
                </h2>
                <p class="font-body text-xs text-[#6B655B] leading-relaxed font-light mt-1">
                  Curated sacred artworks tailored to your directional harmony, spatial matrix, and spiritual resonance.
                </p>
              </div>

              <!-- Badges Ribbon -->
              <div class="flex flex-wrap gap-2 pb-4 border-b border-[#C5A875]/20">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C5A875]/30 text-[11px] font-label tracking-wider uppercase text-[#1E2229]">
                  <span class="text-[#6B655B] text-[9px]">PHILOSOPHY:</span>
                  <span class="font-semibold text-[#C5A875]">${this.state.spiritual === 'devotional' ? 'Devotional Sacred' : this.state.spiritual === 'symbolic' ? 'Non-Religious Symbolic' : 'Open to Both'}</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C5A875]/30 text-[11px] font-label tracking-wider uppercase text-[#1E2229]">
                  <span class="text-[#6B655B] text-[9px]">CALIBRATION:</span>
                  <span class="font-semibold text-[#C5A875]">100% Deterministic Match</span>
                </div>
              </div>

              <!-- Consecrated Cards Cluster -->
              <div class="space-y-4 max-h-[440px] overflow-y-auto pr-1 custom-scrollbar">
                ${this.getRecommendationCardsHTML(5, 'light')}
              </div>

              <!-- Master Artisan Certified Note -->
              <div class="pt-4 border-t border-[#C5A875]/20 flex items-start gap-2.5 text-xs text-[#6B655B]">
                <span class="material-symbols-outlined text-sm text-[#C5A875]">verified_user</span>
                <div>
                  <strong class="text-[#1E2229] block font-semibold text-[11px]">MASTER ARTISAN CERTIFIED</strong>
                  <span class="text-[10px] text-[#6B655B] font-light">Every artwork is consecrated and handcrafted by master traditional artisans in Tanjore &amp; Rajasthan.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  // STEP 6: Optional Sanctuary Notes (Image 4 & Exact Vector Image 3 Sacred Yantra)
  getStep6HTML() {
    return `
      <main class="relative z-10 w-full max-w-3xl mx-auto px-6 py-12 flex flex-col items-center">
        <!-- Progress Bar with Sacred Dots (Image 4) -->
        <div class="w-full mb-8">
          <div class="flex items-center justify-between text-xs font-label uppercase tracking-[0.25em] mb-2 text-[#716b60]">
            <span>• STEP 05 / 05</span>
            <span class="font-semibold text-[#C5A875]">100% CURATED</span>
          </div>
          <div class="relative w-full h-[2px] bg-[#C5A875]/30 rounded-full flex items-center justify-between">
            <div class="absolute inset-y-0 left-0 w-full bg-[#C5A875] rounded-full"></div>
            <span class="relative z-10 w-2 h-2 rounded-full bg-[#C5A875] border-2 border-[#FAF7F2]"></span>
            <span class="relative z-10 w-2 h-2 rounded-full bg-[#C5A875] border-2 border-[#FAF7F2]"></span>
            <span class="relative z-10 w-2 h-2 rounded-full bg-[#C5A875] border-2 border-[#FAF7F2]"></span>
            <span class="relative z-10 w-2 h-2 rounded-full bg-[#C5A875] border-2 border-[#FAF7F2]"></span>
            <span class="relative z-10 w-2.5 h-2.5 rounded-full bg-[#C5A875] shadow-[0_0_8px_#C5A875] border border-[#FAF7F2]"></span>
          </div>
        </div>

        <!-- Center Sacred Animated Rotating Motif (Exact Vector Image 3) -->
        <div class="mb-5 flex items-center justify-center">
          <div class="relative w-40 h-40 flex items-center justify-center">
            <svg class="w-full h-full text-[#C5A875] select-none yantra-stage-animated" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="lotusGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#E5C583" stop-opacity="0.5"/>
                  <stop offset="100%" stop-color="#C5A875" stop-opacity="0.08"/>
                </radialGradient>
                <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#E5C583" stop-opacity="0.75"/>
                  <stop offset="100%" stop-color="#C5A875" stop-opacity="0.32"/>
                </linearGradient>
              </defs>

              <!-- Subtle Background Geometric Grid Dots -->
              <g fill="#C5A875" opacity="0.4">
                <circle cx="30" cy="30" r="1"/>
                <circle cx="50" cy="30" r="1"/>
                <circle cx="150" cy="30" r="1"/>
                <circle cx="170" cy="30" r="1"/>
                <circle cx="30" cy="170" r="1"/>
                <circle cx="50" cy="170" r="1"/>
                <circle cx="150" cy="170" r="1"/>
                <circle cx="170" cy="170" r="1"/>
              </g>

              <!-- Layer 1: 45-degree Diamond Square with 4 Corner Bindus (Clockwise Smooth Rotation) -->
              <g class="yantra-diamond-spin" style="transform-origin: 100px 100px;">
                <rect x="42" y="42" width="116" height="116" stroke="#C5A875" stroke-width="1.2" transform="rotate(45 100 100)" opacity="0.85"/>
                <circle cx="100" cy="18" r="3.2" fill="#C5A875"/>
                <circle cx="182" cy="100" r="3.2" fill="#C5A875"/>
                <circle cx="100" cy="182" r="3.2" fill="#C5A875"/>
                <circle cx="18" cy="100" r="3.2" fill="#C5A875"/>
              </g>

              <!-- Layer 2: Concentric Rings, Cardinal/Ordinal Ticks & Dashed Square (Counter-Clockwise Rotation) -->
              <g class="yantra-ticks-counter" style="transform-origin: 100px 100px;">
                <!-- Dashed Orthogonal Square -->
                <rect x="42" y="42" width="116" height="116" stroke="#C5A875" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.45"/>
                
                <!-- Concentric Outer Sacred Rings -->
                <circle cx="100" cy="100" r="76" stroke="#C5A875" stroke-width="0.75" stroke-dasharray="2 4" opacity="0.55"/>
                <circle cx="100" cy="100" r="68" stroke="#C5A875" stroke-width="1" opacity="0.75"/>
                <circle cx="100" cy="100" r="54" stroke="#C5A875" stroke-width="0.75" opacity="0.6"/>

                <!-- Cardinal and Ordinal Alignment Ticks -->
                <g stroke="#C5A875" stroke-width="1" opacity="0.75">
                  <line x1="100" y1="32" x2="100" y2="42"/>
                  <line x1="100" y1="158" x2="100" y2="168"/>
                  <line x1="32" y1="100" x2="42" y2="100"/>
                  <line x1="158" y1="100" x2="168" y2="100"/>
                  <line x1="52" y1="52" x2="59" y2="59"/>
                  <line x1="141" y1="141" x2="148" y2="148"/>
                  <line x1="148" y1="52" x2="141" y2="59"/>
                  <line x1="59" y1="141" x2="52" y2="148"/>
                </g>
              </g>

              <!-- Layer 3: Central Lotus Blossom with Golden Shading (Clockwise Sacred Bloom Rotation) -->
              <g class="yantra-lotus-spin" style="transform-origin: 100px 100px;">
                <!-- Central Lotus Background Soft Aura -->
                <circle cx="100" cy="100" r="38" fill="url(#lotusGlow)"/>

                <!-- 8-Petal Sacred Lotus Flower (Curved shaded petals) -->
                <g stroke="#C5A875" stroke-width="0.9" fill="url(#petalGrad)">
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(45 100 100)"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(90 100 100)"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(135 100 100)"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(180 100 100)"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(225 100 100)"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(270 100 100)"/>
                  <path d="M100 100 C92 84, 94 66, 100 58 C106 66, 108 84, 100 100 Z" transform="rotate(315 100 100)"/>
                </g>
              </g>

              <!-- Layer 4: Stationary Cosmic Hub & Central Bindu -->
              <circle cx="100" cy="100" r="10" stroke="#C5A875" stroke-width="1.2" fill="#FFFDF8"/>
              <circle cx="100" cy="100" r="5" stroke="#C5A875" stroke-width="0.8" fill="none"/>
              <circle cx="100" cy="100" r="2.5" fill="#C5A875"/>
            </svg>
          </div>
        </div>

        <p class="text-xs uppercase tracking-[0.3em] font-semibold text-[#C5A875] mb-2 text-center">ALMOST THERE</p>
        <h1 class="font-headline text-3xl sm:text-4xl text-[#1E2229] font-normal text-center tracking-tight mb-3">
          Anything Else We Should Know?
        </h1>
        <p class="text-[#6B655B] text-sm text-center max-w-lg mb-6 font-light leading-relaxed">
          Share any details about your space, colours or artwork preferences to refine the resonance of your Vedic sanctuary.
        </p>

        <!-- Optional Badge Pill (Image 4) -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A875]/40 bg-[#FFFDF8] text-[11px] uppercase tracking-wider text-[#6B655B] mb-8 shadow-sm">
          <span class="w-1.5 h-1.5 rounded-full bg-[#C5A875]"></span>
          <span>This step is optional — skip to see your artwork</span>
        </div>

        <div class="w-full flex flex-col gap-5">
          <div class="relative">
            <textarea id="sanctuary-notes-input" maxlength="400" rows="5" class="w-full bg-[#FFFDF8] border border-[#C5A875]/40 text-[#1E2229] text-sm md:text-base placeholder-[#6B655B]/60 p-5 rounded-lg focus:outline-none focus:border-[#C5A875] focus:ring-1 focus:ring-[#C5A875] resize-none leading-relaxed shadow-sm" placeholder="Share any details about your space, colours or artwork preferences...">${this.state.notes}</textarea>
            <div class="absolute bottom-3 right-4 text-[11px] tracking-widest uppercase text-[#6B655B]/70 font-light select-none">
              <span id="notes-char-count">${this.state.notes.length}</span> / 400
            </div>
          </div>

          <!-- Suggestion Chips (Image 4) -->
          <div>
            <span class="text-[11px] font-semibold tracking-wider uppercase text-[#6B655B] block mb-2">TAP TO APPEND DETAILS:</span>
            <div class="flex flex-wrap gap-2">
              ${[
                "High ceiling room (12+ ft)",
                "Indirect natural morning light",
                "Dark teakwood flooring",
                "New home / Griha Pravesh sanctum",
                "Prefers large statement masterpiece"
              ].map(chip => `
                <button type="button" class="px-3.5 py-1.5 rounded-full border border-[#C5A875]/40 hover:border-[#C5A875] bg-[#FFFDF8] hover:bg-[#FAF7F2] text-xs text-[#1E2229] hover:text-[#C5A875] transition-colors shadow-sm" data-chip="${chip}">
                  + ${chip}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Dual Call To Actions (Image 4) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <button type="button" class="w-full py-3.5 px-6 border border-[#C5A875] text-[#1E2229] hover:bg-[#C5A875]/10 text-xs uppercase tracking-[0.2em] font-medium rounded transition-all flex items-center justify-center gap-2 order-2 sm:order-1 cursor-pointer" data-quiz-next>
              <span>Skip &amp; See My Art</span>
              <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button type="button" class="w-full py-3.5 px-6 bg-[#C5A875] text-[#181818] text-xs uppercase tracking-[0.2em] font-semibold rounded hover:bg-[#B39055] shadow-lg transition-all flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer" data-quiz-next>
              <span>Calibrate My Vastu Sanctuary</span>
              <span class="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        </div>

        <div class="mt-8 flex items-center gap-2 text-[#6B655B] text-xs tracking-wider">
          <span class="material-symbols-outlined text-sm text-[#C5A875]">verified</span>
          <span>Every piece curated by Krutik is verified for sacred Vastu symmetry.</span>
        </div>
      </main>
    `;
  }

  // Bind Quiz Step Events
  bindQuizStepEvents() {
    const container = document.getElementById('view-quiz');
    if (!container) return;

    // Next button
    container.querySelectorAll('[data-quiz-next]').forEach(btn => {
      btn.addEventListener('click', () => this.nextStep());
    });

    // Prev button
    container.querySelectorAll('[data-quiz-prev]').forEach(btn => {
      btn.addEventListener('click', () => this.prevStep());
    });

    // Step 1: Intentions
    container.querySelectorAll('[data-intention]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.intention = btn.dataset.intention;
        const match = INTENTIONS.find(i => i.id === this.state.intention);
        if (match && match.suggestedDirection) {
          this.state.direction = match.suggestedDirection;
        }
        this.renderQuizStep();
      });
    });

    // Step 2: Rooms
    container.querySelectorAll('[data-room]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.room = btn.dataset.room;
        this.renderQuizStep();
      });
    });

    // Step 3: Directions
    container.querySelectorAll('[data-direction]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dirId = btn.dataset.direction;
        if (dirId === 'assist') {
          this.showToast("Aligning with East (Purva • Surya) for optimal vitality", "explore");
          this.state.direction = 'east';
        } else {
          this.state.direction = dirId;
        }
        this.renderQuizStep();
      });
    });

    // Step 4: Style
    container.querySelectorAll('[data-style]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.style = btn.dataset.style;
        this.renderQuizStep();
      });
    });

    // Step 5: Spiritual
    container.querySelectorAll('[data-spiritual]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.spiritual = btn.dataset.spiritual;
        this.renderQuizStep();
      });
    });

    // Notes textarea & chips in Step 6
    const notesInput = document.getElementById('sanctuary-notes-input');
    const charCount = document.getElementById('notes-char-count');
    if (notesInput) {
      notesInput.addEventListener('input', (e) => {
        this.state.notes = e.target.value;
        if (charCount) charCount.textContent = e.target.value.length;
      });
    }

    container.querySelectorAll('[data-chip]').forEach(chipBtn => {
      chipBtn.addEventListener('click', () => {
        const text = chipBtn.dataset.chip;
        if (notesInput) {
          if (notesInput.value) {
            notesInput.value += `, ${text}`;
          } else {
            notesInput.value = text;
          }
          this.state.notes = notesInput.value;
          if (charCount) charCount.textContent = notesInput.value.length;
        }
      });
    });

  }

  // Best artwork recommendation calculation
  getBestArtwork() {
    const matches = this.getMatchingProductsForStep(5);
    if (matches && matches.length > 0) {
      const top = matches[0];
      const fallbackArt = ARTWORKS.find(a => a.id === top.id) || ARTWORKS[0];
      return {
        ...fallbackArt,
        id: top.id,
        title: top.name || top.title || fallbackArt.title,
        name: top.name || top.title || fallbackArt.title,
        image: top.image_url || fallbackArt.image,
        product_url: top.product_url || fallbackArt.product_url || `https://www.krutik.in/products/${top.id}`,
        description: top.description || fallbackArt.description
      };
    }

    let matched = ARTWORKS.slice();
    matched.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.direction === this.state.direction) scoreA += 40;
      if (b.direction === this.state.direction) scoreB += 40;

      if (a.secondaryDirection === this.state.direction) scoreA += 15;
      if (b.secondaryDirection === this.state.direction) scoreB += 15;

      if (a.room.includes(this.state.room)) scoreA += 20;
      if (b.room.includes(this.state.room)) scoreB += 20;

      if (a.intentions.includes(this.state.intention)) scoreA += 25;
      if (b.intentions.includes(this.state.intention)) scoreB += 25;

      if (this.state.spiritual === 'both' || a.spiritual === this.state.spiritual || a.spiritual === 'both') scoreA += 10;
      if (this.state.spiritual === 'both' || b.spiritual === this.state.spiritual || b.spiritual === 'both') scoreB += 10;

      return scoreB - scoreA;
    });

    return matched[0] || ARTWORKS[0];
  }

  // Render Curation Reveal Results
  renderResults() {
    const primaryArt = this.getBestArtwork();
    const activeDir = VASTU_DIRECTIONS[this.state.direction] || VASTU_DIRECTIONS.east;

    // Use remaining database matches for counterparts if available
    const dbMatches = this.getMatchingProductsForStep(5);
    let counterparts = [];
    if (dbMatches && dbMatches.length > 1) {
      counterparts = dbMatches.filter(p => p.id !== primaryArt.id).slice(0, 3).map((art, idx) => {
        const fallback = ARTWORKS.find(a => a.id === art.id) || ARTWORKS[idx % ARTWORKS.length];
        return {
          ...fallback,
          id: art.id,
          title: art.name || fallback.title,
          image: art.image_url || fallback.image,
          product_url: art.product_url || fallback.product_url || `https://www.krutik.in/products/${art.id}`,
          description: art.description || fallback.description,
          primaryDirectionName: activeDir.name,
          resonanceScore: Math.max(90, 98 - idx * 2),
          badge: "Curated Resonance"
        };
      });
    }
    if (counterparts.length === 0) {
      counterparts = ARTWORKS.filter(a => a.id !== primaryArt.id).slice(0, 3);
    }

    const resonance = (98.6 + (Math.random() * 0.9)).toFixed(1);

    const titleEl = document.getElementById('results-primary-title');
    const priceEl = document.getElementById('results-primary-price');
    const descEl = document.getElementById('results-primary-desc');
    const quoteEl = document.getElementById('results-primary-quote');
    const imgEl = document.getElementById('results-primary-img');
    const dimEl = document.getElementById('results-primary-dim');
    const mediumEl = document.getElementById('results-primary-medium');
    const weightEl = document.getElementById('results-primary-weight');
    const elevEl = document.getElementById('results-primary-elevation');
    const lightEl = document.getElementById('results-primary-lighting');
    const muhuratEl = document.getElementById('results-primary-muhurat');
    const artisanEl = document.getElementById('results-primary-artisan');
    const resonanceBadge = document.getElementById('results-resonance-badge');
    const axisHeading = document.getElementById('results-axis-heading');

    if (titleEl) titleEl.textContent = primaryArt.title;
    if (priceEl) priceEl.textContent = `$${primaryArt.price.toLocaleString()}`;
    if (descEl) descEl.textContent = primaryArt.description;
    if (quoteEl) quoteEl.textContent = primaryArt.shastraQuote;
    if (imgEl) {
      imgEl.src = primaryArt.image;
      imgEl.alt = primaryArt.alt || primaryArt.title;
    }
    if (dimEl) dimEl.textContent = primaryArt.dimensions;
    if (mediumEl) mediumEl.textContent = primaryArt.medium.split(',')[0];
    if (weightEl) weightEl.textContent = primaryArt.weight;
    if (elevEl) elevEl.textContent = primaryArt.hangingElevation;
    if (lightEl) lightEl.textContent = primaryArt.lightingRecommendation;
    if (muhuratEl) muhuratEl.textContent = primaryArt.muhurat;
    if (artisanEl) artisanEl.textContent = primaryArt.masterArtisan;
    if (resonanceBadge) resonanceBadge.textContent = `${resonance}% Resonance`;
    if (axisHeading) axisHeading.textContent = `${activeDir.sanskrit} (${activeDir.name}) • ${activeDir.degrees}`;

    // Wire primary masterpiece Acquire / Buy Now button to exact product URL
    const primaryBuyBtn = document.getElementById('results-primary-buy-btn');
    if (primaryBuyBtn) {
      primaryBuyBtn.onclick = () => {
        const targetUrl = primaryArt.product_url || 'https://www.krutik.in';
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      };
    }

    // Update 5 Element bars
    const el = primaryArt.elements || { prithvi: 45, agni: 25, vayu: 15, jala: 10, akasha: 5 };
    const barPrithvi = document.getElementById('bar-prithvi');
    const barAgni = document.getElementById('bar-agni');
    const barVayu = document.getElementById('bar-vayu');
    const barJala = document.getElementById('bar-jala');
    const barAkasha = document.getElementById('bar-akasha');

    if (barPrithvi) barPrithvi.style.width = `${el.prithvi}%`;
    if (barAgni) barAgni.style.width = `${el.agni}%`;
    if (barVayu) barVayu.style.width = `${el.vayu}%`;
    if (barJala) barJala.style.width = `${el.jala}%`;
    if (barAkasha) barAkasha.style.width = `${el.akasha}%`;

    // Render Counterpart Cards with 3D Preview & Buy Now buttons
    const counterpartGrid = document.getElementById('results-counterparts-grid');
    if (counterpartGrid) {
      counterpartGrid.innerHTML = counterparts.map(art => `
        <div class="rounded-xl overflow-hidden border border-[#C5A875]/30 bg-[#FFFDF8] text-[#1E2229] flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-[#C5A875] transition-all duration-300">
          <div class="relative h-64 overflow-hidden bg-stone-100">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${art.image}" alt="${art.alt || art.title}">
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div class="absolute top-3 left-3 bg-white/90 border border-[#C5A875]/40 backdrop-blur-md px-2.5 py-1 rounded text-[10px] tracking-wider uppercase text-[#C5A875] font-semibold">
              ${art.primaryDirectionName || 'Sacred Vastu'}
            </div>
            <div class="absolute top-3 right-3 bg-[#C5A875] text-[#181818] px-2 py-0.5 rounded text-[10px] font-bold">
              ${art.resonanceScore}% Match
            </div>
          </div>
          <div class="p-5 flex flex-col justify-between flex-grow">
            <div>
              <span class="text-[10px] uppercase tracking-widest text-[#C5A875] font-semibold">${art.badge}</span>
              <h3 class="font-headline text-lg font-medium text-[#1E2229] mt-1 mb-2">${art.title}</h3>
              <p class="text-xs text-[#6B655B] leading-relaxed line-clamp-2">${art.description}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-[#EAE0CF] flex items-center justify-between gap-2">
              <a href="${art.product_url || 'https://www.krutik.in'}" target="_blank" rel="noopener noreferrer" class="w-full justify-center py-2 rounded bg-[#C5A875] hover:bg-[#B39055] text-[#181818] text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm">
                <span class="material-symbols-outlined text-[13px]">shopping_bag</span>
                <span>Buy Now</span>
              </a>
            </div>
          </div>
        </div>
      `).join('');
    }

    this.simState.artworkId = primaryArt.id;
  }

  // 3D Space & Augmented Reality Simulator (Deprecated / Removed)
  openSimulator() {}
  closeSimulator() {}
  updateSimulatorView() {}

  renderGallery() {
    const grid = document.getElementById('gallery-artworks-grid');
    if (!grid) return;

    let filtered = ARTWORKS.filter(art => {
      const matchDir = this.galleryFilter.direction === 'all' || art.direction === this.galleryFilter.direction;
      const matchRoom = this.galleryFilter.room === 'all' || art.room.includes(this.galleryFilter.room);
      const matchStyle = this.galleryFilter.style === 'all' || art.style === this.galleryFilter.style;
      return matchDir && matchRoom && matchStyle;
    });

    grid.innerHTML = filtered.map(art => `
      <div class="rounded-xl overflow-hidden border border-[#C5A875]/30 bg-[#FFFDF8] text-[#1E2229] flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-[#C5A875] transition-all duration-300">
        <div class="relative h-72 overflow-hidden bg-stone-100">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${art.image}" alt="${art.alt}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div class="absolute top-3 left-3 bg-white/90 border border-[#C5A875]/40 backdrop-blur-md px-2.5 py-1 rounded text-[10px] tracking-wider uppercase text-[#C5A875] font-semibold">
            ${art.primaryDirectionName}
          </div>
          <div class="absolute top-3 right-3 bg-[#C5A875] text-[#181818] px-2 py-0.5 rounded text-[10px] font-bold">
            ${art.dimensions}
          </div>
        </div>
        <div class="p-6 flex flex-col justify-between flex-grow">
          <div>
            <span class="text-[10px] uppercase tracking-widest text-[#C5A875] font-semibold">${art.badge}</span>
            <h3 class="font-headline text-xl font-medium text-[#1E2229] mt-1 mb-2">${art.title}</h3>
            <p class="text-xs text-[#6B655B] leading-relaxed line-clamp-3">${art.description}</p>
          </div>
          <div class="mt-6 pt-4 border-t border-[#EAE0CF] flex items-center justify-between gap-2">
            <span class="font-headline text-xl text-[#C5A875] font-normal">$${art.price.toLocaleString()}</span>
            <a href="${art.product_url || 'https://www.krutik.in'}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded bg-[#C5A875] hover:bg-[#B39055] text-[#181818] font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-xs">shopping_bag</span>
              <span>Buy Now</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Dynamic Landing Page Collections by Vastu Categories
  renderLandingCollections(category = 'all') {
    this.activeLandingCategory = category;
    const grid = document.getElementById('landing-products-grid');
    if (!grid) return;

    // Source pool of products (DB records if available, otherwise ARTWORKS)
    const pool = (this.dbProducts && this.dbProducts.length > 0) ? this.dbProducts : ARTWORKS.map(a => ({
      id: a.id,
      name: a.title,
      image_url: a.image,
      product_url: a.product_url || `https://www.krutik.in/products/${a.id}`,
      description: a.description,
      is_active: true
    }));

    const activeList = pool.filter(p => p.is_active !== false);

    let filtered = [];
    if (category === 'all') {
      filtered = activeList.slice(0, 8);
    } else if (category === 'north') {
      filtered = activeList.filter(p => {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        return text.includes('kubera') || text.includes('wealth') || text.includes('tanjore') || text.includes('prosperity') || text.includes('mandala') || text.includes('vishnu');
      });
    } else if (category === 'east') {
      filtered = activeList.filter(p => {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        return text.includes('surya') || text.includes('sun') || text.includes('vitality') || text.includes('gayatri') || text.includes('morning');
      });
    } else if (category === 'northeast') {
      filtered = activeList.filter(p => {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        return text.includes('shiva') || text.includes('ishanya') || text.includes('peace') || text.includes('meditation') || text.includes('buddha') || text.includes('lotus');
      });
    } else if (category === 'pichwai') {
      filtered = activeList.filter(p => {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        return text.includes('pichwai') || text.includes('krishna') || text.includes('kamdhenu') || text.includes('cow') || text.includes('shrinathji');
      });
    } else if (category === 'tanjore') {
      filtered = activeList.filter(p => {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        return text.includes('tanjore') || text.includes('gold') || text.includes('lakshmi') || text.includes('ganesha') || text.includes('balaji');
      });
    }

    if (filtered.length === 0) {
      filtered = activeList.slice(0, 4);
    }

    grid.innerHTML = filtered.map((p, idx) => `
      <div class="rounded-xl overflow-hidden border border-[#C5A875]/35 bg-[#FFFDF8] text-[#1E2229] flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-[#C5A875] transition-all duration-300">
        <div class="relative h-60 overflow-hidden bg-stone-100">
          <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="${p.image_url}" alt="${p.name}">
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div class="absolute top-3 left-3 bg-white/95 border border-[#C5A875]/40 backdrop-blur-md px-2.5 py-1 rounded text-[10px] tracking-wider uppercase text-[#C5A875] font-semibold">
            ${(p.tags && p.tags.length > 0) ? p.tags[0] : '24K Gold Foil'}
          </div>
          <div class="absolute top-3 right-3 bg-[#C5A875] text-[#181818] px-2 py-0.5 rounded text-[10px] font-bold">
            ${(p.tags && p.tags.length > 1) ? p.tags[1] : `${99 - (idx * 2)}% Resonance`}
          </div>
        </div>
        <div class="p-5 flex flex-col justify-between flex-grow space-y-3">
          <div>
            <span class="text-[10px] uppercase font-label tracking-widest text-[#C5A875] font-semibold block">Consecrated Masterwork</span>
            <h3 class="font-headline text-lg font-medium text-[#1E2229] group-hover:text-[#C5A875] transition-colors mt-1 line-clamp-1">${p.name}</h3>
            ${p.description ? `<p class="font-body text-xs text-[#6B655B] line-clamp-2 mt-1 leading-relaxed font-light">${p.description}</p>` : ''}
          </div>
          <div class="pt-3 border-t border-[#EAE0CF] flex items-center justify-between gap-2">
            <a href="${p.product_url || 'https://www.krutik.in'}" target="_blank" rel="noopener noreferrer" class="w-full justify-center py-2 rounded bg-[#C5A875] hover:bg-[#B39055] text-[#181818] text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm">
              <span class="material-symbols-outlined text-xs">shopping_bag</span>
              <span>Buy Now</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Update active tab buttons visual state
    document.querySelectorAll('.landing-cat-tab').forEach(tab => {
      const isCur = tab.dataset.category === category;
      if (isCur) {
        tab.className = "landing-cat-tab active px-5 py-2.5 rounded-full text-xs font-label uppercase tracking-wider font-semibold border transition-all bg-[#C5A875] text-[#181818] border-[#C5A875] shadow-sm";
      } else {
        tab.className = "landing-cat-tab px-5 py-2.5 rounded-full text-xs font-label uppercase tracking-wider font-semibold border transition-all bg-[#FFFDF8] text-[#6B655B] border-[#C5A875]/40 hover:border-[#C5A875] hover:text-[#C5A875] shadow-sm";
      }
    });
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.nav;
        if (target === 'hero' || target === 'home') this.goToStep(0);
        else if (target === 'quiz') this.goToStep(1);
        else if (target === 'gallery') this.goToStep('gallery');
        else if (target === 'about') this.goToStep('about');
      });
    });

    // Category Tabs in Landing Collections
    document.querySelectorAll('.landing-cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.category;
        this.renderLandingCollections(cat);
      });
    });

    document.querySelectorAll('[data-action="start-journey"]').forEach(btn => {
      btn.addEventListener('click', () => this.goToStep(1));
    });

    document.querySelectorAll('[data-action="explore-directions"]').forEach(btn => {
      btn.addEventListener('click', () => this.goToStep('gallery'));
    });

    document.querySelectorAll('[data-action="save-progress"]').forEach(btn => {
      btn.addEventListener('click', () => this.saveState());
    });

    document.querySelectorAll('[data-action="reset-progress"]').forEach(btn => {
      btn.addEventListener('click', () => this.resetJourney());
    });



    // Gallery Filters
    const filterDir = document.getElementById('filter-direction');
    const filterRoom = document.getElementById('filter-room');
    const filterStyle = document.getElementById('filter-style');

    if (filterDir) {
      filterDir.addEventListener('change', (e) => {
        this.galleryFilter.direction = e.target.value;
        this.renderGallery();
      });
    }
    if (filterRoom) {
      filterRoom.addEventListener('change', (e) => {
        this.galleryFilter.room = e.target.value;
        this.renderGallery();
      });
    }
    if (filterStyle) {
      filterStyle.addEventListener('change', (e) => {
        this.galleryFilter.style = e.target.value;
        this.renderGallery();
      });
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.closeModal;
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.krutikApp = new KrutikApp();
});
