/**
 * ============================================================================
 * DAMLA BLAST: DOĞUM GÜNÜ ÖZEL - ANA OYUN MOTORU (game.js v2 - MEGA SÜRÜM)
 * ============================================================================
 */

(function () {
  "use strict";

  const GRID_SIZE = 8;
  const STORAGE_KEY_BEST = "damla_blast_best_score_v1";
  const STORAGE_KEY_CUSTOM = "damla_blast_custom_config_v1";
  const STORAGE_KEY_UNLOCKED = "damla_blast_unlocked_faces_v1";

  // Güvenli localStorage: Gizli sekme / Instagram-WhatsApp içi tarayıcıda engelliyse
  // oyun çökmesin, hafızada (memory) tutmaya devam etsin.
  const memoryStore = {};
  const safeStorage = {
    getItem(k) {
      try {
        return window.localStorage.getItem(k);
      } catch (e) {
        return k in memoryStore ? memoryStore[k] : null;
      }
    },
    setItem(k, v) {
      memoryStore[k] = String(v);
      try {
        window.localStorage.setItem(k, String(v));
      } catch (e) {
        // yoksay: hafızada tutuluyor
      }
    }
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[ch]);
  }

  // 3D Kristal Blok Renk Paleti (Orijinal Block Blast Tonları)
  const PALETTE = [
    { id: "ruby", main: "#ff3366", light: "#ff85a2", dark: "#a80b35", glow: "rgba(255, 51, 102, 0.55)" },
    { id: "gold", main: "#ffb703", light: "#ffe169", dark: "#b56e00", glow: "rgba(255, 183, 3, 0.55)" },
    { id: "emerald", main: "#06d6a0", light: "#7bf1cc", dark: "#047a5b", glow: "rgba(6, 214, 160, 0.55)" },
    { id: "sapphire", main: "#3a86ff", light: "#8ecae6", dark: "#17469e", glow: "rgba(58, 134, 255, 0.55)" },
    { id: "amethyst", main: "#9b5de5", light: "#cba4f7", dark: "#58229c", glow: "rgba(155, 93, 229, 0.55)" },
    { id: "coral", main: "#fb5607", light: "#ff9e6d", dark: "#9e2f00", glow: "rgba(251, 86, 7, 0.55)" },
    { id: "cyan", main: "#00bbf9", light: "#90e0ef", dark: "#006ba6", glow: "rgba(0, 187, 249, 0.55)" }
  ];

  // 11 Metehan Yüzü Tanımları (Koleksiyon & Büyütme Ekranı İçin - Genişletilmiş Puan Aralıkları)
  const PERSONA_CATALOG = [
    {
      key: "happy",
      name: "Klasik Metehan",
      unlockScore: 0,
      role: "Başlangıç Paketi • Her Zaman Yanında",
      power: "✨ Özel Yetenek: Damla'ya her koşulda hayranlıkla bakma ve moral verme garantisi.",
      quote: "Gülüşün bütün oyun tahtasını aydınlatıyor sevgilim, iyi ki doğdun! ❤️"
    },
    {
      key: "love",
      name: "Kalp Gözlü 😍",
      unlockScore: 0,
      role: "Başlangıç Paketi • Aşık Modu",
      power: "💖 Özel Yetenek: Tek satır bile patlatsan Dünya Kupası kazanmışsın gibi alkışlar.",
      quote: "Sen blok yerleştirirken bile dünyanın en tatlı insanısın! 😍🎂"
    },
    {
      key: "panic",
      name: "Terleyen Manita 🥵",
      unlockScore: 0,
      role: "Başlangıç Paketi • Sıkışma Alarmı",
      power: "🚨 Özel Yetenek: Tahta %65 dolduğunda soğuk terler döküp seni uyarır.",
      quote: "Aşkım tahta biraz doldu sanki... Yanarsan vallahi benim suçum değil! 😅"
    },
    {
      key: "sorry",
      name: "Güllü Özür 💐",
      unlockScore: 0,
      role: "Joker Karakteri • 3x3 Bomba",
      power: "💐 Özel Yetenek: 'Özür Dilerim Haklısın' jokeriyle 3x3 alanı güllerle tertemiz açar.",
      quote: "Ne konuda olduğunu bilmiyorum ama %100 sen haklısın aşkım, al çiçeklerin! 💐"
    },
    {
      key: "cool",
      name: "Piyasa Modu 😎",
      unlockScore: 0,
      role: "Joker Karakteri • Hallederiz Modu",
      power: "😎 Özel Yetenek: 'Ben Hallederim' jokeriyle en zor anında 3 adet kurtarıcı 1x1 blok verir.",
      quote: "Sen hiç stres yapma güzelim, arkanı yaslan Metehan halleder! 😎✨"
    },
    {
      key: "party",
      name: "Parti Çocuğu 🥳",
      unlockScore: 0,
      role: "Doğum Günü Özel • Kutlama Modu",
      power: "🎉 Özel Yetenek: Her kombo sonrası konfeti ve doğum günü neşesi saçar.",
      quote: "Bugün Damla'nın günü! Bütün düdükler ve konfetiler kraliçemiz için! 🥳🎂"
    },
    {
      key: "gym",
      name: "Gym Bro 💪",
      unlockScore: 600,
      role: "600 Puan Ödülü • Güçlü Blok",
      power: "💪 Özel Yetenek: Tahtada patlatıldığında 100 kg dambıl basıp rastgele 3 dolu bloğu daha ezer!",
      quote: "Sporda 100 kilo basıyorum ama senin tek bir bakışın beni nakavt ediyor! 💪🔥"
    },
    {
      key: "mangal",
      name: "Mangal Şefi 🔥",
      unlockScore: 1400,
      role: "1400 Puan Ödülü • Joker Üretici",
      power: "🔥 Özel Yetenek: Tahtada patlatıldığında maşayı şıklatır ve anında +1 Joker hakkı doldurur!",
      quote: "Maşayı da tatlıyı da hazırladım, bu skordan sonra sana ziyafet borcumuz oldu! 🔥🍰"
    },
    {
      key: "crying",
      name: "Trip Yemiş 😭",
      unlockScore: 2400,
      role: "2400 Puan Ödülü • 3 Kat Puan",
      power: "😭 Özel Yetenek: Patlatıldığında 'Trip Çözüldü' bonusu olarak +150 ekstra puan kazandırır!",
      quote: "Tamam aşkım bir daha 'fark etmez' demeyeceğim, nereye istersen oraya gidiyoruz! 😭❤️"
    },
    {
      key: "broke",
      name: "Şaşkın Manita 😱",
      unlockScore: 2400,
      role: "2400 Puan Ödülü • Rekor Şoku",
      power: "⚡ Özel Yetenek: Yüksek skor barajlarını yıktığında şaşkınlıktan küçük dilini yutar.",
      quote: "2400 puan mı?! Bu nasıl bir zeka, karşında saygıyla eğiliyorum! 😱👑"
    },
    {
      key: "king",
      name: "Kral Damat 👑",
      unlockScore: 3500,
      role: "3500 Puan Büyük Ödülü • VIP Mod",
      power: "👑 Özel Yetenek: Büyük Doğum Günü Senedini mühürler ve tahtayı kraliçesi için kurtarır.",
      quote: "3500 puanlık büyük ödül senindir kraliçem! İyi ki doğdun, iyi ki varsın! 👑🎂❤️"
    }
  ];

  // Standart Block Blast Polyomino Şekilleri
  const SHAPES = [
    { matrix: [[1]], weight: 4, easy: true },
    { matrix: [[1, 1]], weight: 5, easy: true },
    { matrix: [[1], [1]], weight: 5, easy: true },
    { matrix: [[1, 1, 1]], weight: 5, easy: true },
    { matrix: [[1], [1], [1]], weight: 5, easy: true },
    { matrix: [[1, 1], [1, 0]], weight: 5, easy: true },
    { matrix: [[1, 1], [0, 1]], weight: 5, easy: true },
    { matrix: [[1, 0], [1, 1]], weight: 5, easy: true },
    { matrix: [[0, 1], [1, 1]], weight: 5, easy: true },
    { matrix: [[1, 1], [1, 1]], weight: 6, easy: true },
    { matrix: [[1, 1, 1, 1]], weight: 4, easy: false },
    { matrix: [[1], [1], [1], [1]], weight: 4, easy: false },
    { matrix: [[1, 1, 1], [1, 0, 0]], weight: 4, easy: false },
    { matrix: [[1, 1, 1], [0, 0, 1]], weight: 4, easy: false },
    { matrix: [[1, 0], [1, 0], [1, 1]], weight: 4, easy: false },
    { matrix: [[0, 1], [0, 1], [1, 1]], weight: 4, easy: false },
    { matrix: [[1, 1, 1], [0, 1, 0]], weight: 4, easy: false },
    { matrix: [[0, 1, 0], [1, 1, 1]], weight: 4, easy: false },
    { matrix: [[1, 1, 0], [0, 1, 1]], weight: 3, easy: false },
    { matrix: [[0, 1, 1], [1, 1, 0]], weight: 3, easy: false },
    { matrix: [[1, 1, 1, 1, 1]], weight: 2, easy: false },
    { matrix: [[1], [1], [1], [1], [1]], weight: 2, easy: false },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], weight: 2, easy: false },
    { matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], weight: 2, easy: false },
    { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], weight: 2, easy: false }
  ];

  // ============================================================================
  // TEKRARSIZ DİYALOG DESTESİ (SHUFFLE BAG - 2. Madde)
  // ============================================================================
  class QuoteDeck {
    constructor() {
      this.bags = {};
      this.lastPicked = {};
    }

    pick(category, fallbackArr = []) {
      const source =
        (config.quotes && Array.isArray(config.quotes[category]) && config.quotes[category]) ||
        fallbackArr;
      if (!source || source.length === 0) return "";
      if (source.length === 1) return source[0];

      if (!this.bags[category] || this.bags[category].length === 0) {
        // Fisher-Yates karıştırma
        const copy = source.slice();
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        // Bir önceki son cümleyle yeni destenin ilk cümlesi aynı olmasın
        if (copy.length > 1 && copy[copy.length - 1] === this.lastPicked[category]) {
          [copy[0], copy[copy.length - 1]] = [copy[copy.length - 1], copy[0]];
        }
        this.bags[category] = copy;
      }

      const nextQuote = this.bags[category].pop();
      this.lastPicked[category] = nextQuote;
      return nextQuote;
    }
  }

  // ============================================================================
  // SES EFEKT MOTORU & DAMLA ÖZEL MÜZİK KUTUSU (Web Audio API - Kalimba & SFX)
  // ============================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.musicEnabled = false;
      this.musicTimer = null;
      this.musicStep = 0;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    vibrate(pattern) {
      if (!this.enabled) return;
      try {
        if (window.navigator && typeof window.navigator.vibrate === "function") {
          window.navigator.vibrate(pattern);
        }
      } catch (e) {
        // iOS veya masaüstünde desteklenmiyorsa yoksay
      }
    }

    tone(freq, type, duration, vol = 0.16, delay = 0, slideTo = null) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const start = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
      }

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(vol, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    }

    // Tatlı Kalimba / Müzik Kutusu (Music Box) tınısı: ana sine + hafif 2. ve 3. harmonik çan tınısı
    playKalimbaNote(freq, duration = 0.65, vol = 0.065, delay = 0) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const start = this.ctx.currentTime + delay;
      const mainOsc = this.ctx.createOscillator();
      const chimeOsc = this.ctx.createOscillator();
      const mainGain = this.ctx.createGain();
      const chimeGain = this.ctx.createGain();

      mainOsc.type = "sine";
      mainOsc.frequency.setValueAtTime(freq, start);

      chimeOsc.type = "triangle";
      chimeOsc.frequency.setValueAtTime(freq * 2, start);

      mainGain.gain.setValueAtTime(0.0008, start);
      mainGain.gain.linearRampToValueAtTime(vol, start + 0.012);
      mainGain.gain.exponentialRampToValueAtTime(0.0008, start + duration);

      chimeGain.gain.setValueAtTime(0.0005, start);
      chimeGain.gain.linearRampToValueAtTime(vol * 0.28, start + 0.008);
      chimeGain.gain.exponentialRampToValueAtTime(0.0005, start + duration * 0.45);

      mainOsc.connect(mainGain);
      chimeOsc.connect(chimeGain);
      mainGain.connect(this.ctx.destination);
      chimeGain.connect(this.ctx.destination);

      mainOsc.start(start);
      chimeOsc.start(start);
      mainOsc.stop(start + duration + 0.03);
      chimeOsc.stop(start + duration * 0.5 + 0.03);
    }

    // 🎵 #3: Damla'ya Özel "İyi ki Doğdun + D-A-M-L-A" Müzik Kutusu Melodisi
    // Notalar:
    // 1. Bölüm: "İyi ki doğdun Damla" (Re majör sıcak müzik kutusu)
    // 2. Bölüm: D-A-M-L-A Harf Motif Notaları -> D(Re5) - A(La5) - M(Mi5/Fa#5) - L(La5) - A(Re6)
    startMusicBox() {
      this.init();
      this.musicEnabled = true;
      if (this.musicTimer) clearTimeout(this.musicTimer);

      // Frekans tablosu (Hz)
      const A4 = 440.0;
      const B4 = 493.88;
      const Cs5 = 554.37;
      const D5 = 587.33;
      const E5 = 659.25;
      const Fs5 = 739.99;
      const G5 = 783.99;
      const A5 = 880.0;
      const B5 = 987.77;
      const D6 = 1174.66;

      const MELODY_SEQUENCE = [
        // 1. Cümle: "İyi ki doğdun..." (A4 A4 B4 A4 D5 C#5)
        { f: A4, b: 0.36, h: 293.66 },
        { f: A4, b: 0.26 },
        { f: B4, b: 0.52, h: 369.99 },
        { f: A4, b: 0.52 },
        { f: D5, b: 0.52, h: 440.0 },
        { f: Cs5, b: 0.92, h: 329.63 },

        // 2. Cümle: "İyi ki doğdun..." (A4 A4 B4 A4 E5 D5)
        { f: A4, b: 0.36 },
        { f: A4, b: 0.26 },
        { f: B4, b: 0.52, h: 329.63 },
        { f: A4, b: 0.52 },
        { f: E5, b: 0.52, h: 440.0 },
        { f: D5, b: 0.92, h: 293.66 },

        // 3. Cümle: "İyi ki doğdun Damla'm..." (A4 A4 A5 F#5 D5 C#5 B4)
        { f: A4, b: 0.36 },
        { f: A4, b: 0.26 },
        { f: A5, b: 0.54, h: 440.0 },
        { f: Fs5, b: 0.52 },
        { f: D5, b: 0.52, h: 369.99 },
        { f: Cs5, b: 0.52 },
        { f: B4, b: 0.88, h: 392.0 },

        // 4. Cümle: "İyi ki doğdun!" (G5 G5 F#5 D5 E5 D5)
        { f: G5, b: 0.36, h: 392.0 },
        { f: G5, b: 0.26 },
        { f: Fs5, b: 0.52, h: 293.66 },
        { f: D5, b: 0.52 },
        { f: E5, b: 0.56, h: 329.63 },
        { f: D5, b: 0.95, h: 293.66 },

        // 5. Cümle (ÖZEL): D - A - M - L - A İmzalı Notalar!
        // D (D5) - A (A5) - M (E5/F#5) - L (A5) - A (D6)
        { f: D5, b: 0.42, h: 293.66 }, // D
        { f: A5, b: 0.42, h: 440.0 },  // A
        { f: Fs5, b: 0.42, h: 369.99 },// M
        { f: E5, b: 0.42 },            // L
        { f: A5, b: 0.48, h: 440.0 },  // A
        { f: B5, b: 0.38 },
        { f: A5, b: 0.38 },
        { f: Fs5, b: 0.45 },
        { f: D6, b: 1.25, h: 587.33 }  // Kapanış Işıltısı
      ];

      const stepLoop = () => {
        if (!this.musicEnabled) return;
        const item = MELODY_SEQUENCE[this.musicStep % MELODY_SEQUENCE.length];
        this.musicStep = (this.musicStep + 1) % MELODY_SEQUENCE.length;

        if (this.enabled && item && item.f) {
          this.playKalimbaNote(item.f, Math.max(0.55, item.b * 1.35), 0.055, 0);
          if (item.h) {
            this.playKalimbaNote(item.h, Math.max(0.7, item.b * 1.6), 0.032, 0.02);
          }
        }
        this.musicTimer = setTimeout(stepLoop, Math.round((item ? item.b : 0.5) * 1000));
      };

      stepLoop();
    }

    stopMusicBox() {
      this.musicEnabled = false;
      if (this.musicTimer) {
        clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }

    toggleMusicBox() {
      if (this.musicEnabled) {
        this.stopMusicBox();
      } else {
        this.startMusicBox();
      }
      return this.musicEnabled;
    }

    // 🕯️ Mum üfleme sesi: D-A-M-L-A notaları sırayla parlar
    playCandleBlow(index = 0) {
      const damlaNotes = [587.33, 659.25, 739.99, 880.0, 1174.66]; // D5, E5, F#5, A5, D6
      const note = damlaNotes[index % damlaNotes.length];
      this.tone(180, "sine", 0.14, 0.12, 0, 95); // hafif üfleme rüzgarı
      this.playKalimbaNote(note, 0.65, 0.14, 0.03);
      this.playKalimbaNote(note * 1.5, 0.45, 0.06, 0.09);
      this.vibrate(18);
    }

    // 💬 WhatsApp bildirimi sesi
    playWhatsAppPing() {
      this.playKalimbaNote(783.99, 0.25, 0.12, 0);
      this.playKalimbaNote(1174.66, 0.42, 0.15, 0.11);
      this.vibrate([20, 35, 30]);
    }

    playPickup() {
      this.tone(320, "sine", 0.08, 0.14, 0, 480);
      this.vibrate(8);
    }

    playPlace() {
      this.tone(190, "triangle", 0.11, 0.22, 0, 120);
      this.tone(380, "sine", 0.07, 0.1, 0.02, 440);
      this.vibrate(14);
    }

    playClear(linesCount, streak) {
      const baseNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      const shift = Math.min(streak * 35, 220);
      const count = Math.min(linesCount + 2, 5);
      for (let i = 0; i < count; i++) {
        this.tone(baseNotes[i] + shift, "triangle", 0.24, 0.2, i * 0.055);
        this.tone((baseNotes[i] + shift) * 1.5, "sine", 0.2, 0.08, i * 0.055);
      }
      if (linesCount >= 2 || streak >= 2) {
        this.vibrate([30, 25, 55, 25, 80]);
      } else {
        this.vibrate([22, 20, 32]);
      }
    }

    playGymSmash() {
      // Güçlü dambıl basma efekti
      this.tone(110, "sawtooth", 0.28, 0.24, 0, 55);
      this.tone(220, "square", 0.18, 0.14, 0.08, 440);
      this.vibrate([45, 25, 70]);
    }

    playMangalSizzle() {
      // Neşeli mangal/joker dolum sesi
      this.tone(440, "triangle", 0.12, 0.18, 0, 660);
      this.tone(660, "triangle", 0.18, 0.18, 0.1, 990);
      this.vibrate([25, 25, 45]);
    }

    playCashRegister() {
      // Cüzdan ağlama / Kasa "Ka-ching!" sesi
      this.tone(987.77, "sine", 0.09, 0.2, 0);
      this.tone(1318.51, "triangle", 0.28, 0.22, 0.09);
      this.vibrate([35, 30, 75]);
    }

    playBomb() {
      this.tone(160, "sawtooth", 0.35, 0.22, 0, 45);
      this.tone(587.33, "triangle", 0.22, 0.18, 0.12, 880);
      this.vibrate([55, 30, 90]);
    }

    playFanfare() {
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
      const times = [0, 0.11, 0.22, 0.34, 0.5, 0.64];
      notes.forEach((n, idx) => {
        this.tone(n, "triangle", 0.22, 0.22, times[idx]);
      });
      this.vibrate([45, 35, 65, 35, 95, 40, 120]);
    }

    playAvatarBoop() {
      this.tone(440, "sine", 0.12, 0.16, 0, 660);
      this.tone(660, "sine", 0.14, 0.14, 0.09, 880);
      this.vibrate(12);
    }
  }

  const sfx = new SoundEngine();

  // ============================================================================
  // YAPILANDIRMA & 12'Lİ FOTOĞRAF YÖNETİCİSİ
  // ============================================================================
  const config = JSON.parse(JSON.stringify(window.DAMLA_CONFIG || {}));
  const quoteDeck = new QuoteDeck();

  function loadSavedCustomizations() {
    try {
      const raw = safeStorage.getItem(STORAGE_KEY_CUSTOM);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.boyfriendName) config.boyfriendName = saved.boyfriendName;
      if (saved.targetBirthdayScore) config.targetBirthdayScore = Number(saved.targetBirthdayScore);
      if (saved.rewardText && config.coupon) config.coupon.rewardText = saved.rewardText;
      if (typeof saved.photoDataUrl === "string" && saved.photoDataUrl.startsWith("data:image")) {
        config.photos.main = saved.photoDataUrl;
      }
    } catch (e) {
      console.warn("Özel ayarlar okunamadı:", e);
    }
  }

  loadSavedCustomizations();

  const loadedImages = {};
  const avatarSprites = {};
  const boardStaticCanvas = document.createElement("canvas");

  function bakeAvatarSpriteForMood(mood) {
    const size = 128;
    const radius = size / 2;
    const cx = radius;
    const cy = radius;
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const oCtx = off.getContext("2d");

    oCtx.save();
    oCtx.beginPath();
    oCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    oCtx.closePath();
    oCtx.clip();

    const bgGrad = oCtx.createRadialGradient(cx, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    if (mood === "panic") {
      bgGrad.addColorStop(0, "#ff758f");
      bgGrad.addColorStop(1, "#800f2f");
    } else if (mood === "love" || mood === "party") {
      bgGrad.addColorStop(0, "#ff9ebb");
      bgGrad.addColorStop(1, "#c9184a");
    } else {
      bgGrad.addColorStop(0, "#4cc9f0");
      bgGrad.addColorStop(1, "#1d3557");
    }
    oCtx.fillStyle = bgGrad;
    oCtx.fillRect(0, 0, size, size);

    const customImg = getImageForMood(mood);
    if (customImg) {
      const iw = customImg.width;
      const ih = customImg.height;
      const scale = Math.max(size / iw, size / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      oCtx.drawImage(customImg, cx - dw / 2, cy - dh / 2, dw, dh);
    } else {
      oCtx.fillStyle = "#ffcdb2";
      oCtx.beginPath();
      oCtx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
      oCtx.fill();
    }

    oCtx.restore();
    avatarSprites[mood] = off;
  }

  function rebuildAllAvatarSprites() {
    const allMoods = [
      "main",
      "happy",
      "panic",
      "love",
      "sorry",
      "cool",
      "gym",
      "mangal",
      "crying",
      "party",
      "broke",
      "king",
      "mindblown",
      "guilty"
    ];
    allMoods.forEach((m) => bakeAvatarSpriteForMood(m));
    // Yeni yüzler hazır: tüm canvas'ları yeniden çizdir (yalnızca init sonrası çağrılır)
    state.boardDirty = true;
    state.trayDirty = true;
    state.liveAvatarDirty = true;
    if (state.dragging) prepareDragCanvas(state.dragging.piece);
  }

  function reloadPhotos(callback) {
    const keys = [
      "main",
      "happy",
      "panic",
      "love",
      "sorry",
      "cool",
      "gym",
      "mangal",
      "crying",
      "party",
      "broke",
      "king",
      "mindblown"
    ];
    let pending = keys.length;
    const done = () => {
      pending--;
      if (pending <= 0) {
        rebuildAllAvatarSprites();
        if (callback) callback();
      }
    };

    keys.forEach((k) => {
      const src = config.photos && config.photos[k];
      if (src && src.trim() !== "") {
        const img = new Image();
        img.onload = () => {
          loadedImages[k] = img;
          done();
        };
        img.onerror = () => {
          loadedImages[k] = null;
          done();
        };
        img.src = src;
      } else {
        loadedImages[k] = null;
        done();
      }
    });
  }

  function getImageForMood(mood) {
    if (config.photos && config.photos.main && config.photos.main.startsWith("data:image") && loadedImages.main) {
      return loadedImages.main;
    }
    if (mood === "guilty") {
      return loadedImages.crying || loadedImages.panic || loadedImages.main;
    }
    if (loadedImages[mood]) {
      return loadedImages[mood];
    }
    return loadedImages.happy || loadedImages.main;
  }

  // ============================================================================
  // CANLI METEHAN AVATAR ÇİZİM MOTORU (SPRITE ÖNBELLEKLİ ULTRA HIZLI ÇİZİM)
  // ============================================================================
  function drawBoyfriendAvatar(ctx, cx, cy, radius, mood = "happy") {
    const sprite = avatarSprites[mood] || avatarSprites.happy;
    if (sprite) {
      ctx.drawImage(sprite, cx - radius, cy - radius, radius * 2, radius * 2);
      return;
    }
    bakeAvatarSpriteForMood(mood);
    if (avatarSprites[mood]) {
      ctx.drawImage(avatarSprites[mood], cx - radius, cy - radius, radius * 2, radius * 2);
    }
  }

  // ============================================================================
  // OYUN DURUMU (STATE)
  // ============================================================================
  const state = {
    board: createEmptyBoard(),
    tray: [null, null, null],
    score: 0,
    bestScore: Number(safeStorage.getItem(STORAGE_KEY_BEST) || 0),
    streak: 0,
    noClearMoves: 0,
    bombCount: config.initialBombCount ?? 2,
    rerollCount: config.initialRerollCount ?? 2,
    nextBonusScore: config.bonusJokerEveryScore || 900,
    currentTierIndex: 0,
    unlockedFaces: new Set(["happy", "love", "panic", "sorry", "cool", "party"]),
    couponUnlocked: false,
    bombTargetingMode: false,
    bombHoverCell: null,
    mood: "happy",
    dragging: null,
    particles: [],
    floatingTexts: [], // 5. Madde: Tahta üstü çizgi roman balonları
    confetti: [],      // Tam ekran doğum günü konfeti yağmuru
    confettiActive: false,
    shownWaScores: new Set(), // Gösterilmiş WhatsApp bildirim skorları
    activePersonaDetail: null,
    candles: [
      { letter: "D", color: "#ff477e", lit: true, smoke: [] },
      { letter: "A", color: "#ffb703", lit: true, smoke: [] },
      { letter: "M", color: "#06d6a0", lit: true, smoke: [] },
      { letter: "L", color: "#4cc9f0", lit: true, smoke: [] },
      { letter: "A", color: "#9b5de5", lit: true, smoke: [] }
    ],
    cakeCompleted: false,
    cellSize: 40,
    boardPixelSize: 320,
    timeSec: 0,
    dt: 1,
    lastMoveTime: performance.now(),
    boardDirty: true,
    boardViewDirty: true,
    trayDirty: true,
    liveAvatarDirty: true
  };

  // Önceden açılmış yüzleri localStorage'dan yükle
  try {
    const savedFaces = JSON.parse(safeStorage.getItem(STORAGE_KEY_UNLOCKED) || "[]");
    savedFaces.forEach((f) => state.unlockedFaces.add(f));
  } catch (e) {
    // yoksay
  }

  function createEmptyBoard() {
    const b = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push(null);
      }
      b.push(row);
    }
    return b;
  }

  // ============================================================================
  // DOM REFERANSLARI
  // ============================================================================
  const dom = {
    cakeCeremonyScreen: document.getElementById("cake-ceremony-screen"),
    cakeAvatarCanvas: document.getElementById("cake-avatar-canvas"),
    cakeCanvas: document.getElementById("cake-canvas"),
    cakeCandleStatus: document.getElementById("cake-candle-status"),
    btnBlowAllCandles: document.getElementById("btn-blow-all-candles"),
    btnSkipCake: document.getElementById("btn-skip-cake"),

    startScreen: document.getElementById("start-screen"),
    birthdayPill: document.getElementById("ui-birthday-pill"),
    leaderboardList: document.getElementById("leaderboard-list"),
    btnStartGame: document.getElementById("btn-start-game"),
    btnReplayCake: document.getElementById("btn-replay-cake"),
    btnOpenSettingsStart: document.getElementById("btn-open-settings-start"),
    heroAvatarCanvas: document.getElementById("hero-avatar-canvas"),

    uiBestScore: document.getElementById("ui-best-score"),
    uiCurrentScore: document.getElementById("ui-current-score"),
    uiStreakBadge: document.getElementById("ui-streak-badge"),
    goalProgressWrap: document.getElementById("goal-progress-wrap"),
    uiGoalLabel: document.getElementById("ui-goal-label"),
    uiGoalNumbers: document.getElementById("ui-goal-numbers"),
    uiGoalFill: document.getElementById("ui-goal-fill"),

    btnOpenCollection: document.getElementById("btn-open-collection"),
    btnGiftCoupon: document.getElementById("btn-gift-coupon"),
    btnMusicToggle: document.getElementById("btn-music-toggle"),
    btnSoundToggle: document.getElementById("btn-sound-toggle"),
    btnOpenSettings: document.getElementById("btn-open-settings"),

    whatsappToast: document.getElementById("whatsapp-toast"),
    waAvatarCanvas: document.getElementById("wa-avatar-canvas"),
    waSenderName: document.getElementById("wa-sender") || document.getElementById("wa-sender-name"),
    waMessageText: document.getElementById("wa-message") || document.getElementById("wa-message-text"),

    manitaLiveBar: document.getElementById("manita-live-bar"),
    manitaAvatarWrapper: document.getElementById("manita-avatar-wrapper"),
    liveAvatarCanvas: document.getElementById("live-avatar-canvas"),
    avatarMoodEmoji: document.getElementById("avatar-mood-emoji"),
    uiBoyfriendName: document.getElementById("ui-boyfriend-name"),
    uiMoodTag: document.getElementById("ui-mood-tag"),
    uiWalletBadge: document.getElementById("ui-wallet-badge"),
    uiSpeechText: document.getElementById("ui-speech-text"),

    boardStage: document.getElementById("board-stage"),
    boardFrame: document.getElementById("board-frame"),
    boardCanvas: document.getElementById("board-canvas"),
    bombModeBanner: document.getElementById("bomb-mode-banner"),
    btnCancelBomb: document.getElementById("btn-cancel-bomb"),

    tierUnlockToast: document.getElementById("tier-unlock-toast"),
    toastAvatarCanvas: document.getElementById("toast-avatar-canvas"),
    toastTitle: document.getElementById("toast-title"),
    toastDesc: document.getElementById("toast-desc"),

    comboShowcase: document.getElementById("combo-showcase"),
    comboAvatarCanvas: document.getElementById("combo-avatar-canvas"),
    comboTitleText: document.getElementById("combo-title-text"),
    comboSubText: document.getElementById("combo-sub-text"),

    trayContainer: document.getElementById("tray-container"),
    trayCanvas: document.getElementById("tray-canvas"),
    dragCanvas: document.getElementById("drag-canvas"),
    confettiCanvas: document.getElementById("confetti-canvas"),

    btnJokerBomb: document.getElementById("btn-joker-bomb"),
    btnJokerReroll: document.getElementById("btn-joker-reroll"),
    badgeBombCount: document.getElementById("badge-bomb-count"),
    badgeRerollCount: document.getElementById("badge-reroll-count"),

    dialogTorpil: document.getElementById("dialog-torpil"),
    torpilAvatarCanvas: document.getElementById("torpil-avatar-canvas"),
    torpilBadge: document.getElementById("torpil-badge"),
    torpilTitle: document.getElementById("torpil-title"),
    torpilMessage: document.getElementById("torpil-message"),
    btnAcceptTorpil: document.getElementById("btn-accept-torpil"),
    btnDeclineTorpil: document.getElementById("btn-decline-torpil"),

    dialogCoupon: document.getElementById("dialog-coupon"),
    couponAvatarCanvas: document.getElementById("coupon-avatar-canvas"),
    couponBadge: document.getElementById("coupon-badge"),
    couponTitle: document.getElementById("coupon-title"),
    couponSubtitle: document.getElementById("coupon-subtitle"),
    couponHeader: document.getElementById("coupon-header"),
    couponBody: document.getElementById("coupon-body"),
    couponStamp: document.getElementById("coupon-stamp"),
    btnShareCouponImage: document.getElementById("btn-share-coupon-image"),
    btnWhatsappCoupon: document.getElementById("btn-whatsapp-coupon"),
    btnCloseCoupon: document.getElementById("btn-close-coupon"),

    dialogGameover: document.getElementById("dialog-gameover"),
    gameoverAvatarCanvas: document.getElementById("gameover-avatar-canvas"),
    gameoverFinalScore: document.getElementById("gameover-final-score"),
    gameoverBestScore: document.getElementById("gameover-best-score"),
    btnRestartGame: document.getElementById("btn-restart-game"),

    dialogCollection: document.getElementById("dialog-collection"),
    btnCloseCollectionX: document.getElementById("btn-close-collection-x"),
    btnCloseCollection: document.getElementById("btn-close-collection"),
    collectionTiersList: document.getElementById("collection-tiers-list"),
    collectionFacesGrid: document.getElementById("collection-faces-grid"),

    dialogPersonaDetail: document.getElementById("dialog-persona-detail"),
    btnClosePersonaDetailX:
      document.getElementById("btn-close-persona-detail") ||
      document.getElementById("btn-close-persona-detail-x"),
    personaDetailImg: document.getElementById("persona-detail-img"),
    personaDetailName: document.getElementById("persona-detail-name"),
    personaDetailRole:
      document.getElementById("persona-detail-rarity") ||
      document.getElementById("persona-detail-role"),
    personaDetailPower: document.getElementById("persona-detail-power"),
    personaDetailQuote: document.getElementById("persona-detail-quote"),
    btnActivatePersona: document.getElementById("btn-activate-persona"),

    dialogSettings: document.getElementById("dialog-settings"),
    btnCloseSettingsX: document.getElementById("btn-close-settings-x"),
    inputBfName: document.getElementById("input-bf-name"),
    inputTargetScore: document.getElementById("input-target-score"),
    inputBfPhoto: document.getElementById("input-bf-photo"),
    btnResetPhoto: document.getElementById("btn-reset-photo"),
    settingsPreviewCanvas: document.getElementById("settings-preview-canvas"),
    inputCouponText: document.getElementById("input-coupon-text"),
    btnSaveSettings: document.getElementById("btn-save-settings"),
    btnExportConfig: document.getElementById("btn-export-config"),
    btnNewGameSettings: document.getElementById("btn-new-game-settings")
  };

  // ============================================================================
  // AKILLI BLOK & ÖZEL GÜÇLÜ BLOK ÜRETİCİ (3. Madde)
  // ============================================================================
  function pickRandomUnlockedFace() {
    const arr = Array.from(state.unlockedFaces);
    return arr[Math.floor(Math.random() * arr.length)] || "happy";
  }

  function createRandomCellData(forceFace = false, forcedMood = null) {
    const faceChance = forceFace ? 1 : (config.faceBlockChance ?? 0.38);
    const isFace = forceFace || Math.random() < faceChance;
    if (!isFace) return { hasFace: false, eventType: null };

    if (forcedMood) {
      return { hasFace: forcedMood, eventType: null };
    }

    // Özel Güçlü (Event) Blok Şansı (Gym / Mangal / Trip)
    const eventChance = config.eventBlockChance ?? 0.28;
    if (Math.random() < eventChance) {
      const events = [
        { mood: "gym", eventType: "gym", badge: "💪" },
        { mood: "mangal", eventType: "mangal", badge: "🔥" },
        { mood: "crying", eventType: "trip", badge: "😭" }
      ];
      const chosenEv = events[Math.floor(Math.random() * events.length)];
      return {
        hasFace: chosenEv.mood,
        eventType: chosenEv.eventType,
        badge: chosenEv.badge
      };
    }

    return {
      hasFace: pickRandomUnlockedFace(),
      eventType: null,
      badge: null
    };
  }

  function createPieceFromMatrix(matrix, forceFace = false, forcedMood = null) {
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const rows = matrix.length;
    const cols = matrix[0].length;
    const cellDataMap = [];
    let hasAtLeastOneFace = false;

    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c]) {
          const data = createRandomCellData(forceFace, forcedMood);
          if (data.hasFace) hasAtLeastOneFace = true;
          row.push(data);
        } else {
          row.push(null);
        }
      }
      cellDataMap.push(row);
    }

    // En azından çoğu parçada 1 adet Metehan yüzü bulunsun
    if (!hasAtLeastOneFace && Math.random() < 0.72) {
      const coords = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c]) coords.push([r, c]);
        }
      }
      if (coords.length > 0) {
        const [fr, fc] = coords[Math.floor(Math.random() * coords.length)];
        cellDataMap[fr][fc] = createRandomCellData(true, forcedMood);
      }
    }

    return {
      matrix,
      cellDataMap,
      color,
      rows,
      cols,
      scaleAnim: 0.1
    };
  }

  function canPieceFitAnywhere(board, matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    for (let r = 0; r <= GRID_SIZE - rows; r++) {
      for (let c = 0; c <= GRID_SIZE - cols; c++) {
        if (canPlaceAt(board, matrix, r, c)) return true;
      }
    }
    return false;
  }

  function canPlaceAt(board, matrix, startR, startC) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    if (startR < 0 || startC < 0 || startR + rows > GRID_SIZE || startC + cols > GRID_SIZE) {
      return false;
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] && board[startR + r][startC + c] !== null) {
          return false;
        }
      }
    }
    return true;
  }

  function getBoardOccupancyRatio() {
    let filled = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (state.board[r][c] !== null) filled++;
      }
    }
    return filled / (GRID_SIZE * GRID_SIZE);
  }

  function pickWeightedShape(pool) {
    const total = pool.reduce((acc, s) => acc + s.weight, 0);
    let rand = Math.random() * total;
    for (const s of pool) {
      rand -= s.weight;
      if (rand <= 0) return s;
    }
    return pool[0];
  }

  function spawnNewTray() {
    const occupancy = getBoardOccupancyRatio();
    const fittingShapes = SHAPES.filter((s) => canPieceFitAnywhere(state.board, s.matrix));
    const pool = occupancy > 0.52 && fittingShapes.length > 0 ? fittingShapes : SHAPES;

    const newTray = [];
    for (let i = 0; i < 3; i++) {
      let chosen;
      if (i === 0 && fittingShapes.length > 0) {
        chosen = pickWeightedShape(fittingShapes);
      } else {
        chosen = pickWeightedShape(pool);
      }
      newTray.push(createPieceFromMatrix(chosen.matrix));
    }

    state.tray = newTray;
    state.trayDirty = true;
    checkGameOverCondition();
  }

  // ============================================================================
  // DİNAMİK KONUŞMA BALONU & DUYGU DURUMU YÖNETİCİSİ
  // ============================================================================
  const MOOD_META = {
    happy: { emoji: "😊", tag: "Aşık & İtaatkar", cls: "mood-happy" },
    love: { emoji: "😍", tag: "Hayran Kaldı 👑", cls: "mood-happy" },
    party: { emoji: "🥳", tag: "Doğum Günü Modu", cls: "mood-happy" },
    cool: { emoji: "😎", tag: "Ben Hallederim", cls: "mood-happy" },
    gym: { emoji: "💪", tag: "Gym Bro (100kg)", cls: "mood-happy" },
    mangal: { emoji: "🔥", tag: "Mangal Şefi", cls: "mood-happy" },
    king: { emoji: "👑", tag: "Resmi Kölen", cls: "mood-happy" },
    sorry: { emoji: "💐", tag: "Özür Diliyor", cls: "mood-happy" },
    guilty: { emoji: "😅", tag: "Suçluluk Duyuyor", cls: "mood-guilty" },
    crying: { emoji: "😭", tag: "Trip Yedi Ağlıyor", cls: "mood-guilty" },
    broke: { emoji: "😱", tag: "Şaşkın Manita!", cls: "mood-panic" },
    panic: { emoji: "🥵", tag: "Sıkıştı & Terliyor!", cls: "mood-panic" }
  };

  function setManitaMood(mood, customQuote = null) {
    const prevMood = state.mood;
    state.mood = mood;
    state.liveAvatarDirty = true;
    if ((prevMood === "panic") !== (mood === "panic")) {
      state.boardDirty = true;
      state.trayDirty = true;
    }
    dom.manitaLiveBar.classList.remove("bar-panic", "bar-celebrate");
    dom.uiMoodTag.classList.remove("mood-panic", "mood-guilty", "mood-happy");

    const meta = MOOD_META[mood] || MOOD_META.happy;
    dom.avatarMoodEmoji.textContent = meta.emoji;
    dom.uiMoodTag.textContent = meta.tag;
    dom.uiMoodTag.classList.add(meta.cls);

    if (mood === "panic" || mood === "broke") {
      dom.manitaLiveBar.classList.add("bar-panic");
    } else if (mood === "love" || mood === "king" || mood === "gym" || mood === "mangal") {
      dom.manitaLiveBar.classList.add("bar-celebrate");
    }

    if (customQuote) {
      dom.uiSpeechText.textContent = customQuote;
    } else if (mood === "panic") {
      dom.uiSpeechText.textContent = quoteDeck.pick("boardCrowded");
    } else if (mood === "guilty" || mood === "crying") {
      dom.uiSpeechText.textContent = quoteDeck.pick("noClearStreak");
    } else {
      dom.uiSpeechText.textContent = quoteDeck.pick("idle");
    }
  }

  // 5. Madde: Tahta Üstü Çizgi Roman Konuşma Balonu Oluşturucu
  function spawnFloatingComicText(text, x, y, color = "#ffcc29") {
    state.floatingTexts.push({
      text,
      x: Math.max(70, Math.min(state.boardPixelSize - 70, x)),
      y: Math.max(40, Math.min(state.boardPixelSize - 30, y)),
      vy: -1.6,
      scale: 0.3,
      alpha: 1.0,
      color
    });
  }

  // ============================================================================
  // TAHTA YERLEŞTİRME, SATIR PATLATMA & ÖZEL GÜÇLÜ BLOK ETKİLERİ (3. Madde)
  // ============================================================================
  function placePieceOnBoard(trayIndex, startR, startC) {
    const piece = state.tray[trayIndex];
    if (!piece) return false;
    if (!canPlaceAt(state.board, piece.matrix, startR, startC)) return false;

    state.lastMoveTime = performance.now();
    let placedBlocks = 0;

    for (let r = 0; r < piece.rows; r++) {
      for (let c = 0; c < piece.cols; c++) {
        if (piece.matrix[r][c]) {
          const cellMeta = piece.cellDataMap[r][c] || { hasFace: false };
          state.board[startR + r][startC + c] = {
            color: piece.color,
            hasFace: cellMeta.hasFace,
            eventType: cellMeta.eventType || null,
            badge: cellMeta.badge || null
          };
          placedBlocks++;
        }
      }
    }

    state.tray[trayIndex] = null;
    state.boardDirty = true;
    state.trayDirty = true;
    sfx.playPlace();
    addScore(placedBlocks * 10);

    const { fullRows, fullCols } = findCompletedLines(state.board);
    const totalLines = fullRows.length + fullCols.length;

    if (totalLines > 0) {
      state.streak++;
      state.noClearMoves = 0;
      clearLinesAndCelebrate(fullRows, fullCols, totalLines);
    } else {
      state.streak = 0;
      state.noClearMoves++;
      updateStreakBadge();

      const occupancy = getBoardOccupancyRatio();
      const isCorner =
        (startR === 0 && startC === 0) ||
        (startR === 0 && startC + piece.cols === GRID_SIZE) ||
        (startR + piece.rows === GRID_SIZE && startC === 0) ||
        (startR + piece.rows === GRID_SIZE && startC + piece.cols === GRID_SIZE);

      if (occupancy >= 0.65) {
        setManitaMood("panic");
      } else if (state.noClearMoves >= 3) {
        setManitaMood(state.noClearMoves % 2 === 0 ? "crying" : "guilty");
      } else if (placedBlocks >= 5) {
        setManitaMood("gym", quoteDeck.pick("bigPiecePlaced"));
      } else if (isCorner && Math.random() < 0.65) {
        setManitaMood("cool", quoteDeck.pick("cornerMove"));
      } else if (Math.random() < 0.55) {
        const casualMoods = ["happy", "party", "cool", "love"];
        setManitaMood(casualMoods[Math.floor(Math.random() * casualMoods.length)]);
      }
    }

    if (state.tray.every((p) => p === null)) {
      spawnNewTray();
    } else {
      checkGameOverCondition();
    }

    return true;
  }

  function findCompletedLines(board) {
    const fullRows = [];
    const fullCols = [];

    for (let r = 0; r < GRID_SIZE; r++) {
      let rowFull = true;
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === null) {
          rowFull = false;
          break;
        }
      }
      if (rowFull) fullRows.push(r);
    }

    for (let c = 0; c < GRID_SIZE; c++) {
      let colFull = true;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (board[r][c] === null) {
          colFull = false;
          break;
        }
      }
      if (colFull) fullCols.push(c);
    }

    return { fullRows, fullCols };
  }

  function clearLinesAndCelebrate(fullRows, fullCols, totalLines) {
    const toClearMap = new Map();

    fullRows.forEach((r) => {
      for (let c = 0; c < GRID_SIZE; c++) {
        toClearMap.set(`${r},${c}`, { r, c, cell: state.board[r][c] });
      }
    });

    fullCols.forEach((c) => {
      for (let r = 0; r < GRID_SIZE; r++) {
        toClearMap.set(`${r},${c}`, { r, c, cell: state.board[r][c] });
      }
    });

    let faceClearedCount = 0;
    const triggeredEvents = new Set();
    let sumX = 0;
    let sumY = 0;
    let countCells = 0;

    toClearMap.forEach(({ r, c, cell }) => {
      if (cell) {
        if (cell.hasFace) faceClearedCount++;
        if (cell.eventType) triggeredEvents.add(cell.eventType);
        spawnCellExplosion(r, c, cell);
        state.board[r][c] = null;
        sumX += (c + 0.5) * state.cellSize;
        sumY += (r + 0.5) * state.cellSize;
        countCells++;
      }
    });

    const centerX = countCells > 0 ? sumX / countCells : state.boardPixelSize / 2;
    const centerY = countCells > 0 ? sumY / countCells : state.boardPixelSize / 2;
    state.boardDirty = true;
    state.trayDirty = true;

    // Özel Güçlü (Event) Blok Etkilerini Uygula (3. Madde)
    let eventBonusScore = 0;
    let specialMood = null;
    let specialQuote = null;

    if (triggeredEvents.has("gym")) {
      // Gym Bro: Tahtadaki rastgele 3 dolu bloğu daha dambılla ezer!
      const remaining = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (state.board[r][c] !== null) remaining.push([r, c]);
        }
      }
      for (let i = 0; i < Math.min(3, remaining.length); i++) {
        const idx = Math.floor(Math.random() * remaining.length);
        const [er, ec] = remaining.splice(idx, 1)[0];
        spawnCellExplosion(er, ec, state.board[er][ec]);
        state.board[er][ec] = null;
      }
      state.boardDirty = true;
      eventBonusScore += 80;
      sfx.playGymSmash();
      specialMood = "gym";
      specialQuote = quoteDeck.pick("eventGym");
      spawnFloatingComicText("💪 100 KG BASTI!", centerX, centerY - 18, "#4cd964");
    }

    if (triggeredEvents.has("mangal")) {
      // Mangalcı Metehan: +1 Joker hakkı doldurur
      if (state.bombCount <= state.rerollCount) {
        state.bombCount++;
      } else {
        state.rerollCount++;
      }
      updateJokerButtons();
      eventBonusScore += 60;
      sfx.playMangalSizzle();
      specialMood = "mangal";
      specialQuote = quoteDeck.pick("eventMangal");
      spawnFloatingComicText("🔥 +1 JOKER PİŞTİ!", centerX, centerY + 14, "#ff9900");
    }

    if (triggeredEvents.has("trip")) {
      // Trip Bloğu: 3 Kat Ekstra Puan (+150)
      eventBonusScore += 150;
      specialMood = "crying";
      specialQuote = quoteDeck.pick("eventTrip");
      spawnFloatingComicText("😭 TRİP ÇÖZÜLDÜ +150!", centerX, centerY - 35, "#ff477e");
    }

    // Genel Çizgi Roman Balonu (5. Madde)
    if (triggeredEvents.size === 0) {
      const popups = config.comicPopups || ["ŞAAAK! 💥", "YİNE HAKLISIN! 👑"];
      const popupText = popups[Math.floor(Math.random() * popups.length)];
      spawnFloatingComicText(popupText, centerX, centerY);
    }

    // Puan Hesaplama
    const baseLineScore = totalLines * 100 * totalLines;
    const streakBonus = state.streak > 1 ? state.streak * 60 : 0;
    const faceBonus = faceClearedCount * 35;
    addScore(baseLineScore + streakBonus + faceBonus + eventBonusScore);

    sfx.playClear(totalLines, state.streak);
    updateStreakBadge();

    // Konuşma Balonu ve Büyük Kombo Gösterisi
    let quote = specialQuote;
    let targetMood = specialMood || "love";

    if (!quote) {
      if (totalLines >= 3 || state.streak >= 3) {
        quote = quoteDeck.pick("clear3Plus");
        targetMood = "king";
      } else if (totalLines === 2 || state.streak === 2) {
        quote = quoteDeck.pick("clear2");
        targetMood = "love";
      } else {
        quote = quoteDeck.pick("clear1");
        targetMood = Math.random() < 0.5 ? "love" : "party";
      }
    }

    setManitaMood(targetMood, quote);

    if (totalLines >= 2 || state.streak >= 2 || triggeredEvents.size > 0) {
      triggerBoardShake();
      const title =
        totalLines >= 2
          ? `COMBO x${totalLines}!`
          : state.streak >= 2
          ? `SERİ x${state.streak}!`
          : `ÖZEL METEHAN ŞOV! 💥`;
      showComboShowcase(title, quote, targetMood);
    }
  }

  function triggerBoardShake() {
    dom.boardFrame.classList.remove("screen-shake");
    void dom.boardFrame.offsetWidth;
    dom.boardFrame.classList.add("screen-shake");
  }

  let comboTimer = null;
  function showComboShowcase(title, subtitle, avatarMood = "love") {
    dom.comboTitleText.textContent = title;
    dom.comboSubText.textContent = subtitle;
    dom.comboShowcase.classList.remove("hidden");

    const ctx = dom.comboAvatarCanvas.getContext("2d");
    ctx.clearRect(0, 0, 140, 140);
    drawBoyfriendAvatar(ctx, 70, 70, 66, avatarMood, state.timeSec);
    spawnConfettiBurst(38);

    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
      dom.comboShowcase.classList.add("hidden");
    }, 1250);
  }

  // Tam Ekran Doğum Günü Konfeti Yağmuru Motoru (Öneri #5)
  const CONFETTI_COLORS = ["#ffcc29", "#ff477e", "#06d6a0", "#4cc9f0", "#cba4f7", "#ffffff", "#ff9e00"];
  function spawnConfettiBurst(count = 75) {
    if (!dom.confettiCanvas) return;
    const w = window.innerWidth || 390;
    const h = window.innerHeight || 844;
    for (let i = 0; i < count; i++) {
      const fromSide = i % 3 !== 0;
      const startX = fromSide ? (i % 2 === 0 ? w * 0.12 : w * 0.88) : Math.random() * w;
      const startY = fromSide ? h * (0.22 + Math.random() * 0.25) : -20 - Math.random() * 60;
      const vx = fromSide
        ? (i % 2 === 0 ? 1 : -1) * (2.2 + Math.random() * 5.2) + (Math.random() - 0.5) * 2
        : (Math.random() - 0.5) * 4;
      const vy = fromSide ? -4.5 - Math.random() * 5.5 : 2.0 + Math.random() * 3.5;

      state.confetti.push({
        x: startX,
        y: startY,
        vx,
        vy,
        w: 7 + Math.random() * 6,
        h: 4 + Math.random() * 5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        wobble: Math.random() * Math.PI * 2,
        vWobble: 0.08 + Math.random() * 0.1,
        alpha: 1
      });
    }
    state.confettiActive = true;
  }

  function renderConfetti(dpr) {
    if (!dom.confettiCanvas) return;
    if (state.confetti.length === 0) {
      if (state.confettiActive) {
        const ctx = dom.confettiCanvas.getContext("2d");
        ctx.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
        state.confettiActive = false;
      }
      return;
    }

    const ctx = dom.confettiCanvas.getContext("2d");
    const w = window.innerWidth || 390;
    const h = window.innerHeight || 844;
    const dt = state.dt || 1;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    for (let i = state.confetti.length - 1; i >= 0; i--) {
      const c = state.confetti[i];
      c.wobble += c.vWobble * dt;
      c.x += (c.vx + Math.sin(c.wobble) * 1.1) * dt;
      c.y += c.vy * dt;
      c.vy = Math.min(5.2, c.vy + 0.16 * dt);
      c.vx *= Math.pow(0.985, dt);
      c.rot += c.vRot * dt;

      if (c.y > h * 0.78) {
        c.alpha -= 0.025 * dt;
      }

      if (c.alpha <= 0 || c.y > h + 30) {
        state.confetti.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.scale(Math.cos(c.wobble), 1);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }

    ctx.restore();
  }

  // ============================================================================
  // PARÇACIK & UÇAN METEHAN KAFASI EFEKT MOTORU
  // ============================================================================
  function spawnCellExplosion(r, c, cell) {
    const cx = (c + 0.5) * state.cellSize;
    const cy = (r + 0.5) * state.cellSize;

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      state.particles.push({
        type: "shard",
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 5 + Math.random() * 6,
        color: i % 2 === 0 ? cell.color.main : cell.color.light,
        alpha: 1,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.25
      });
    }

    if (cell.hasFace) {
      const headMood = typeof cell.hasFace === "string" ? cell.hasFace : "love";
      state.particles.push({
        type: "head",
        mood: headMood,
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 4.0,
        vy: -3.4 - Math.random() * 2.5,
        size: state.cellSize * 0.88,
        alpha: 1,
        rot: 0,
        vRot: (Math.random() - 0.5) * 0.22
      });

      const emojis = cell.badge ? [cell.badge, "❤️", "👑"] : ["❤️", "👑", "🎂", "💸"];
      state.particles.push({
        type: "emoji",
        text: emojis[Math.floor(Math.random() * emojis.length)],
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 3,
        vy: -2.5 - Math.random() * 2,
        size: 18,
        alpha: 1
      });
    }
  }

  // ============================================================================
  // PUAN, SÜRPRİZ HEDİYE BARI, WHATSAPP BİLDİRİMLERİ & KOLEKSİYON SİSTEMİ
  // ============================================================================
  let toastTimer = null;
  function showTierUnlockToast(tierObj, avatarMood) {
    dom.toastTitle.textContent = `🔓 ${tierObj.title}`;
    dom.toastDesc.textContent = tierObj.unlockedPersonaName;
    dom.tierUnlockToast.classList.remove("hidden");

    const ctx = dom.toastAvatarCanvas.getContext("2d");
    ctx.clearRect(0, 0, 68, 68);
    drawBoyfriendAvatar(ctx, 34, 34, 31, avatarMood || "party", state.timeSec);

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.tierUnlockToast.classList.add("hidden");
    }, 3400);
  }

  // 💬 #4: Üstten İnen Sahte WhatsApp Bildirimi (800 / 1800 / 3000 / 4500 Puan)
  let waToastTimer = null;
  function showWhatsAppNotification(waItem) {
    if (!dom.whatsappToast || !waItem) return;
    sfx.playWhatsAppPing();

    const bf = config.boyfriendName || "Metehan";
    if (dom.waSenderName) {
      dom.waSenderName.textContent = waItem.sender || `${bf} ❤️`;
    }
    if (dom.waMessageText) {
      dom.waMessageText.textContent = waItem.text || "";
    }
    if (dom.waAvatarCanvas) {
      const ctx = dom.waAvatarCanvas.getContext("2d");
      ctx.clearRect(0, 0, 64, 64);
      drawBoyfriendAvatar(ctx, 32, 32, 29, waItem.mood || "love", state.timeSec);
    }

    dom.whatsappToast.classList.remove("hidden");
    if (waToastTimer) clearTimeout(waToastTimer);
    waToastTimer = setTimeout(() => {
      dom.whatsappToast.classList.add("hidden");
    }, 5200);
  }

  function checkWhatsAppNotifications() {
    const list = config.whatsappNotifications || [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (state.score >= item.score && !state.shownWaScores.has(item.score)) {
        state.shownWaScores.add(item.score);
        showWhatsAppNotification(item);
        break;
      }
    }
  }

  function updateWalletProgressAndTiers() {
    const tiers = config.rewardTiers || [];
    const finalTarget = config.targetBirthdayScore || 3500;
    const pct = Math.min(100, (state.score / finalTarget) * 100);
    dom.uiGoalFill.style.width = `${pct}%`;

    // Hangi aşamadayız kontrol et
    let reachedIndex = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (state.score >= tiers[i].score) {
        reachedIndex = i;
      }
    }

    // Yeni aşama geçildiyse karakterleri ve sürpriz hediyeleri aç!
    if (reachedIndex > state.currentTierIndex) {
      for (let idx = state.currentTierIndex + 1; idx <= reachedIndex; idx++) {
        const t = tiers[idx];
        if (t && Array.isArray(t.unlockedFaces)) {
          t.unlockedFaces.forEach((f) => state.unlockedFaces.add(f));
        }
      }
      safeStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(Array.from(state.unlockedFaces)));

      const newlyReached = tiers[reachedIndex];
      state.currentTierIndex = reachedIndex;

      if (newlyReached) {
        sfx.playCashRegister();
        spawnConfettiBurst(85);
        const unlockedFaceKey =
          (newlyReached.unlockedFaces && newlyReached.unlockedFaces[0]) || "party";
        setManitaMood(unlockedFaceKey, newlyReached.quote);
        showTierUnlockToast(newlyReached, unlockedFaceKey);
      }
    }

    const activeTier = tiers[state.currentTierIndex] || tiers[0];
    const nextTier = tiers[state.currentTierIndex + 1];

    if (activeTier) {
      dom.uiWalletBadge.textContent = `🎁 ${activeTier.walletStatus}`;
    }

    if (nextTier) {
      dom.uiGoalLabel.textContent = `🎁 Sıradaki: ${nextTier.rewardShort}`;
      dom.uiGoalNumbers.textContent = `${state.score} / ${nextTier.score}`;
    } else {
      dom.uiGoalLabel.textContent = "👑 VIP Doğum Günü Kuponu Hazır!";
      dom.uiGoalNumbers.textContent = `${state.score} Puan (MAX)`;
    }

    if (state.score >= finalTarget && !state.couponUnlocked) {
      state.couponUnlocked = true;
      dom.btnGiftCoupon.classList.add("unlocked");
      setTimeout(() => {
        openCouponModal();
      }, 650);
    }
  }

  function addScore(points) {
    if (points <= 0) return;
    state.score += points;

    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      safeStorage.setItem(STORAGE_KEY_BEST, String(state.bestScore));
    }

    dom.uiCurrentScore.textContent = state.score.toLocaleString("tr-TR");
    dom.uiBestScore.textContent = state.bestScore.toLocaleString("tr-TR");
    dom.uiCurrentScore.classList.remove("score-pop");
    void dom.uiCurrentScore.offsetWidth;
    dom.uiCurrentScore.classList.add("score-pop");

    if (state.score >= state.nextBonusScore) {
      state.bombCount++;
      state.rerollCount++;
      state.nextBonusScore += config.bonusJokerEveryScore || 900;
      updateJokerButtons();
    }

    updateWalletProgressAndTiers();
    checkWhatsAppNotifications();
  }

  function updateStreakBadge() {
    if (state.streak >= 2) {
      dom.uiStreakBadge.textContent = `🔥 SERİ x${state.streak}`;
      dom.uiStreakBadge.classList.remove("hidden");
    } else {
      dom.uiStreakBadge.classList.add("hidden");
    }
  }

  function updateJokerButtons() {
    dom.badgeBombCount.textContent = String(state.bombCount);
    dom.badgeRerollCount.textContent = String(state.rerollCount);
    dom.btnJokerBomb.disabled = state.bombCount <= 0;
    dom.btnJokerReroll.disabled = state.rerollCount <= 0;

    if (state.bombTargetingMode) {
      dom.btnJokerBomb.classList.add("active-mode");
      dom.bombModeBanner.classList.remove("hidden");
    } else {
      dom.btnJokerBomb.classList.remove("active-mode");
      dom.bombModeBanner.classList.add("hidden");
    }
  }

  // Joker 1: "Özür Dilerim Haklısın" (3x3 Bomba)
  function toggleBombMode() {
    if (state.bombCount <= 0 && !state.bombTargetingMode) return;
    state.bombTargetingMode = !state.bombTargetingMode;
    state.bombHoverCell = { r: 3, c: 3 };
    updateJokerButtons();
  }

  function executeBombAt(centerR, centerC) {
    if (state.bombCount <= 0) return;
    state.bombCount--;
    state.bombTargetingMode = false;
    state.bombHoverCell = null;
    state.lastMoveTime = performance.now();
    updateJokerButtons();

    let cleared = 0;
    for (let r = centerR - 1; r <= centerR + 1; r++) {
      for (let c = centerC - 1; c <= centerC + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          const cell = state.board[r][c];
          if (cell) {
            spawnCellExplosion(r, c, { color: cell.color, hasFace: "sorry" });
            state.board[r][c] = null;
            cleared++;
          } else {
            state.particles.push({
              type: "emoji",
              text: "💐",
              x: (c + 0.5) * state.cellSize,
              y: (r + 0.5) * state.cellSize,
              vx: (Math.random() - 0.5) * 3,
              vy: -2.5 - Math.random() * 2,
              size: 20,
              alpha: 1
            });
          }
        }
      }
    }

    state.boardDirty = true;
    state.trayDirty = true;
    sfx.playBomb();
    triggerBoardShake();
    addScore(cleared * 25 + 50);
    const quote = quoteDeck.pick("bombUsed");
    setManitaMood("sorry", quote);
    spawnFloatingComicText("💐 ÖZÜR DİLERİM!", (centerC + 0.5) * state.cellSize, (centerR + 0.5) * state.cellSize);
    showComboShowcase("ÖZÜR DİLERİM AŞKIM! 💐", quote, "sorry");
  }

  // Joker 2: "Ben Hallederim Aşkım" (1x1 Kolay Bloklar)
  function executeRerollJoker() {
    if (state.rerollCount <= 0) return;
    state.rerollCount--;
    state.lastMoveTime = performance.now();
    updateJokerButtons();

    state.tray = [
      createPieceFromMatrix([[1]], true, "cool"),
      createPieceFromMatrix([[1]], true, "cool"),
      createPieceFromMatrix([[1]], true, "cool")
    ];
    state.trayDirty = true;

    sfx.playAvatarBoop();
    const quote = quoteDeck.pick("rerollUsed");
    setManitaMood("cool", quote);
    showComboShowcase("BEN HALLEDERİM! 😎", quote, "cool");
  }

  // ============================================================================
  // YANMAMA GARANTİSİ (DOĞUM GÜNÜ TORPİLİ) VE MODALLAR
  // ============================================================================
  function isBoardStuck() {
    const remainingPieces = state.tray.filter((p) => p !== null);
    if (remainingPieces.length === 0) return false;
    return !remainingPieces.some((p) => canPieceFitAnywhere(state.board, p.matrix));
  }

  function checkGameOverCondition() {
    if (!isBoardStuck()) return;

    setTimeout(() => {
      if (isBoardStuck() && !dom.dialogTorpil.open && !dom.dialogGameover.open) {
        openTorpilModal();
      }
    }, 350);
  }

  function openTorpilModal() {
    sfx.playFanfare();
    const ctx = dom.torpilAvatarCanvas.getContext("2d");
    ctx.clearRect(0, 0, 128, 128);
    drawBoyfriendAvatar(ctx, 64, 64, 60, "sorry", state.timeSec);

    if (config.torpil) {
      dom.torpilBadge.textContent = config.torpil.badge;
      dom.torpilTitle.textContent = config.torpil.title;
      dom.torpilMessage.textContent = config.torpil.message;
      dom.btnAcceptTorpil.textContent = config.torpil.acceptButton;
      dom.btnDeclineTorpil.textContent = config.torpil.declineButton;
    }

    if (!dom.dialogTorpil.open) {
      dom.dialogTorpil.showModal();
    }
  }

  function applyTorpilRescue() {
    if (dom.dialogTorpil.open) dom.dialogTorpil.close();
    state.lastMoveTime = performance.now();

    for (let r = 1; r <= 6; r++) {
      for (let c = 1; c <= 6; c++) {
        if (state.board[r][c]) {
          spawnCellExplosion(r, c, { color: state.board[r][c].color, hasFace: "king" });
          state.board[r][c] = null;
        }
      }
    }

    state.tray = [
      createPieceFromMatrix([[1, 1]], true, "love"),
      createPieceFromMatrix([[1, 1], [1, 1]], true, "party"),
      createPieceFromMatrix([[1]], true, "cool")
    ];
    state.boardDirty = true;
    state.trayDirty = true;

    sfx.playBomb();
    triggerBoardShake();
    setManitaMood("king", "Kraliçem her zaman haklıdır! Tahtayı senin için tertemiz açtım 👑❤️");
    showComboShowcase("TORPİL AKTİF! 👑", "SEN HEP HAKLISIN AŞKIM!", "king");
  }

  function openGameOverModal() {
    if (dom.dialogTorpil.open) dom.dialogTorpil.close();
    const ctx = dom.gameoverAvatarCanvas.getContext("2d");
    ctx.clearRect(0, 0, 120, 120);
    drawBoyfriendAvatar(ctx, 60, 60, 56, "crying", state.timeSec);

    dom.gameoverFinalScore.textContent = state.score.toLocaleString("tr-TR");
    dom.gameoverBestScore.textContent = state.bestScore.toLocaleString("tr-TR");
    if (!dom.dialogGameover.open) {
      dom.dialogGameover.showModal();
    }
  }

  function openCouponModal() {
    sfx.playFanfare();
    spawnConfettiBurst(120);
    const ctx = dom.couponAvatarCanvas.getContext("2d");
    ctx.clearRect(0, 0, 128, 128);
    drawBoyfriendAvatar(ctx, 64, 64, 60, "king", state.timeSec);

    if (config.coupon) {
      dom.couponBadge.textContent = config.coupon.badge;
      dom.couponTitle.textContent = config.coupon.title;
      dom.couponSubtitle.textContent = config.coupon.subtitle;
      dom.couponHeader.textContent = config.coupon.couponHeader;
      dom.couponBody.textContent = config.coupon.rewardText;
      dom.couponStamp.textContent = `${config.boyfriendName.toUpperCase()} ONAYLI • İTİRAZ EDİLEMEZ`;
      dom.btnCloseCoupon.textContent = config.coupon.continueButton;
    }

    if (!dom.dialogCoupon.open) {
      dom.dialogCoupon.showModal();
    }
  }

  // ============================================================================
  // RESMİ DOĞUM GÜNÜ SENEDİ GÖRSEL ÜRETİCİ & WHATSAPP PAYLAŞIM (Öneri #1)
  // ============================================================================
  function wrapCanvasLines(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let current = "";
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function renderOfficialCouponCardCanvas() {
    const W = 1080;
    const H = 1350;
    const card = document.createElement("canvas");
    card.width = W;
    card.height = H;
    const ctx = card.getContext("2d");

    // 1. Kraliyet Gece Mavisi & Altın Lüks Arka Plan
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1c2759");
    bg.addColorStop(0.5, "#111738");
    bg.addColorStop(1, "#090d24");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Dekoratif Çift Katmanlı Altın Çerçeve
    ctx.strokeStyle = "#ffcc29";
    ctx.lineWidth = 8;
    roundRect(ctx, 36, 36, W - 72, H - 72, 36);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 204, 41, 0.35)";
    ctx.lineWidth = 3;
    roundRect(ctx, 54, 54, W - 108, H - 108, 28);
    ctx.stroke();

    // 2. Üst Rozet (Resmi Senet Başlığı)
    ctx.fillStyle = "#ff477e";
    roundRect(ctx, 190, 82, W - 380, 64, 32);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 28px 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎂 DAMLA BLAST • RESMİ DOĞUM GÜNÜ SENEDİ 🎂", W / 2, 115);

    // 3. Kral Damat Metehan Portresi
    const avatarX = W / 2;
    const avatarY = 295;
    const avatarR = 112;
    drawBoyfriendAvatar(ctx, avatarX, avatarY, avatarR, "king");

    ctx.strokeStyle = "#ffcc29";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR + 4, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Ana Başlık ve Skor Özeti
    ctx.fillStyle = "#ffcc29";
    ctx.font = "900 54px 'Fredoka', 'Nunito', sans-serif";
    ctx.fillText("İYİ Kİ DOĞDUN DAMLA! 👑", W / 2, 468);

    const scoreVal = Math.max(state.score, state.bestScore, config.targetBirthdayScore || 1500);
    const dateStr = new Date().toLocaleDateString("tr-TR");
    ctx.fillStyle = "#80ffdb";
    ctx.font = "800 30px 'Nunito', sans-serif";
    ctx.fillText(
      `SKOR: ${scoreVal.toLocaleString("tr-TR")} PUAN  •  TARİH: ${dateStr}`,
      W / 2,
      522
    );

    // 5. Kazanılan Kademeli Ödüller Kutusu
    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
    ctx.strokeStyle = "rgba(255, 204, 41, 0.45)";
    ctx.lineWidth = 3;
    roundRect(ctx, 90, 565, W - 180, 275, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffcc29";
    ctx.font = "900 28px 'Nunito', sans-serif";
    ctx.fillText("🎁 METEHAN'DAN KAZANILAN RESMİ DOĞUM GÜNÜ HAKLARI:", W / 2, 610);

    const tierItems = [
      "✅ ☕ 1 Adet Kahve Sözü (600 Puan Barajı)",
      "✅ 🍰 Kahve + İstediğin Tatlı (1400 Puan Barajı)",
      "✅ 🍽️ Lüks Akşam Yemeği + Tatlı + Kahve (2400 Puan Barajı)",
      "✅ 👑 VIP Tam Paket + %100 Haklılık Garantisi (3500 Puan)"
    ];
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 27px 'Nunito', sans-serif";
    ctx.textAlign = "left";
    tierItems.forEach((line, idx) => {
      ctx.fillText(line, 135, 662 + idx * 44);
    });

    // 6. VIP Doğum Günü Kupon Metni Kutusu
    ctx.fillStyle = "rgba(255, 204, 41, 0.12)";
    ctx.strokeStyle = "#ffcc29";
    ctx.lineWidth = 4;
    roundRect(ctx, 90, 870, W - 180, 265, 24);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffcc29";
    ctx.font = "900 30px 'Nunito', sans-serif";
    ctx.fillText(
      (config.coupon && config.coupon.couponHeader) || "🎁 METEHAN'DAN VIP DOĞUM GÜNÜ KUPONU",
      W / 2,
      918
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 26px 'Nunito', sans-serif";
    const rewardText =
      (config.coupon && config.coupon.rewardText) ||
      "Bu kuponla Metehan'dan 1 adet lüks akşam yemeği, sınırsız kahve/tatlı ve tartışmasız %100 HAKLILIK hakkı kazandın!";
    const wrapped = wrapCanvasLines(ctx, rewardText, W - 260);
    wrapped.slice(0, 4).forEach((ln, idx) => {
      ctx.fillText(ln, W / 2, 972 + idx * 38);
    });

    // 7. Resmi Mühür Damgası
    ctx.save();
    ctx.translate(W / 2, 1218);
    ctx.rotate(-0.035);
    ctx.fillStyle = "rgba(255, 71, 126, 0.18)";
    ctx.strokeStyle = "#ff477e";
    ctx.lineWidth = 6;
    roundRect(ctx, -370, -40, 740, 80, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffcc29";
    ctx.font = "900 32px 'Fredoka', 'Nunito', sans-serif";
    ctx.fillText(
      `${(config.boyfriendName || "METEHAN").toUpperCase()} ONAYLI • İTİRAZ EDİLEMEZ`,
      0,
      2
    );
    ctx.restore();

    return card;
  }

  function downloadCouponPng(cardCanvas) {
    const dataUrl = cardCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "Damla_Dogum_Gunu_Senedi.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function shareOrDownloadCouponImage() {
    sfx.playCashRegister();
    const cardCanvas = renderOfficialCouponCardCanvas();

    if (typeof cardCanvas.toBlob !== "function") {
      downloadCouponPng(cardCanvas);
      return;
    }

    cardCanvas.toBlob((blob) => {
      if (!blob) {
        downloadCouponPng(cardCanvas);
        return;
      }
      const file = new File([blob], "Damla_Dogum_Gunu_Senedi.png", { type: "image/png" });
      if (
        window.navigator &&
        typeof window.navigator.canShare === "function" &&
        window.navigator.canShare({ files: [file] })
      ) {
        window.navigator
          .share({
            title: "Damla Blast — Resmi Doğum Günü Senedi 👑",
            text: `Damla Blast'ta ${state.score} puanla tüm ödülleri kazandım! İtiraz edilemez resmi senedim ektedir 😎🎂`,
            files: [file]
          })
          .catch(() => {
            downloadCouponPng(cardCanvas);
          });
      } else {
        downloadCouponPng(cardCanvas);
      }
    }, "image/png");
  }

  function shareCouponViaWhatsApp() {
    sfx.playAvatarBoop();
    const scoreVal = Math.max(state.score, state.bestScore, config.targetBirthdayScore || 3500);
    const bf = config.boyfriendName || "Metehan";
    const msg =
      `🚨 *RESMİ DOĞUM GÜNÜ SENEDİ BİLDİRİMİ* 🚨\n\n` +
      `Sevgili ${bf}, *Damla Blast* oyununda *${scoreVal.toLocaleString("tr-TR")} Puan* yaparak bütün doğum günü ödüllerini resmen kazandım! 🎂👑\n\n` +
      `*Kazanılan Resmi Haklarım:*\n` +
      `✅ ☕ Kahve Sözü (600 Puan)\n` +
      `✅ 🍰 İstediğim Tatlı (1400 Puan)\n` +
      `✅ 🍽️ Lüks Akşam Yemeği (2400 Puan)\n` +
      `✅ 👑 %100 Tartışmasız Haklılık Garantisi (3500 Puan)\n\n` +
      `*Not:* ${bf.toUpperCase()} ONAYLIDIR, İTİRAZ EDİLEMEZ! 😎🎂❤️`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  // 📸 #5: Karakter Kartı Büyütme & İnceleme Modalı
  function openPersonaDetailModal(persona) {
    if (!persona || !dom.dialogPersonaDetail) return;
    sfx.playAvatarBoop();
    state.activePersonaDetail = persona;

    const src = (config.photos && config.photos[persona.key]) || "assets/faces/metehan_happy.jpg";
    if (dom.personaDetailImg) {
      dom.personaDetailImg.src = src;
      dom.personaDetailImg.alt = persona.name;
    }
    if (dom.personaDetailName) {
      dom.personaDetailName.textContent = persona.name;
    }
    if (dom.personaDetailRole) {
      dom.personaDetailRole.textContent = persona.role || "Özel Metehan Karakteri";
    }
    if (dom.personaDetailPower) {
      dom.personaDetailPower.textContent = persona.power || "";
    }
    if (dom.personaDetailQuote) {
      dom.personaDetailQuote.textContent = `"${persona.quote || ""}"`;
    }

    if (!dom.dialogPersonaDetail.open) {
      dom.dialogPersonaDetail.showModal();
    }
  }

  // Koleksiyon ve Hediye Durumu Modalı
  function openCollectionModal() {
    sfx.playAvatarBoop();
    const tiers = config.rewardTiers || [];
    dom.collectionTiersList.innerHTML = "";

    tiers.slice(1).forEach((t) => {
      const isReached = state.score >= t.score || state.bestScore >= t.score;
      const row = document.createElement("div");
      row.className = `tier-row-card ${isReached ? "unlocked" : ""}`;
      row.innerHTML = `
        <div>
          <strong>${t.rewardShort}</strong>
          <div style="font-size:0.66rem;color:#a6b4e8">${t.unlockedPersonaName}</div>
        </div>
        <span style="font-weight:900;color:#ffcc29">${isReached ? "✅ AÇILDI" : `${t.score} P`}</span>
      `;
      dom.collectionTiersList.appendChild(row);
    });

    dom.collectionFacesGrid.innerHTML = "";
    PERSONA_CATALOG.forEach((p) => {
      const unlocked = state.unlockedFaces.has(p.key) || state.bestScore >= p.unlockScore || state.score >= p.unlockScore;
      const src = (config.photos && config.photos[p.key]) || "assets/faces/metehan_happy.jpg";
      const card = document.createElement("div");
      card.className = `face-collect-item ${unlocked ? "unlocked" : "locked"}`;
      card.innerHTML = `
        <img src="${src}" alt="${p.name}" />
        <span>${unlocked ? `🔍 ${p.name}` : `🔒 ${p.unlockScore}P`}</span>
      `;
      if (unlocked) {
        card.addEventListener("click", () => {
          openPersonaDetailModal(p);
        });
      }
      dom.collectionFacesGrid.appendChild(card);
    });

    if (!dom.dialogCollection.open) {
      dom.dialogCollection.showModal();
    }
  }

  // ============================================================================
  // CANVAS BOYUTLANDIRMA VE 3D KRİSTAL BLOK ÇİZİMİ
  // ============================================================================
  function resizeCanvases() {
    const dpr = window.devicePixelRatio || 1;

    const stageRect = dom.boardStage.getBoundingClientRect();
    const maxBoardSize = Math.min(stageRect.width - 16, stageRect.height - 16, 410);
    const cellSize = Math.floor(maxBoardSize / GRID_SIZE);
    const boardPixelSize = cellSize * GRID_SIZE;

    state.cellSize = cellSize;
    state.boardPixelSize = boardPixelSize;

    dom.boardCanvas.style.width = `${boardPixelSize}px`;
    dom.boardCanvas.style.height = `${boardPixelSize}px`;
    dom.boardCanvas.width = boardPixelSize * dpr;
    dom.boardCanvas.height = boardPixelSize * dpr;

    boardStaticCanvas.width = boardPixelSize * dpr;
    boardStaticCanvas.height = boardPixelSize * dpr;

    const trayRect = dom.trayContainer.getBoundingClientRect();
    dom.trayCanvas.width = trayRect.width * dpr;
    dom.trayCanvas.height = trayRect.height * dpr;

    if (dom.confettiCanvas) {
      dom.confettiCanvas.width = (window.innerWidth || 390) * dpr;
      dom.confettiCanvas.height = (window.innerHeight || 844) * dpr;
    }

    state.boardDirty = true;
    state.boardViewDirty = true;
    state.trayDirty = true;
    state.liveAvatarDirty = true;
    if (state.dragging) {
      prepareDragCanvas(state.dragging.piece);
      syncDragCanvasTransform();
    }
  }

  function draw3DBlock(ctx, x, y, size, colorObj, cellMeta = null, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;

    const pad = 1.2;
    const bx = x + pad;
    const by = y + pad;
    const bs = size - pad * 2;
    const bevel = Math.max(3, bs * 0.14);

    // Ana gövde
    ctx.fillStyle = colorObj.main;
    roundRect(ctx, bx, by, bs, bs, 5);
    ctx.fill();

    // Üst ve Sol Parlak Bevel
    ctx.fillStyle = colorObj.light;
    ctx.beginPath();
    ctx.moveTo(bx + 3, by);
    ctx.lineTo(bx + bs - 3, by);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bevel);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx, by + bs - 3);
    ctx.closePath();
    ctx.fill();

    // Alt ve Sağ Koyu Gölge Bevel
    ctx.fillStyle = colorObj.dark;
    ctx.beginPath();
    ctx.moveTo(bx + bs, by + 3);
    ctx.lineTo(bx + bs, by + bs - 3);
    ctx.lineTo(bx + 3, by + bs);
    ctx.lineTo(bx + bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bs - bevel);
    ctx.lineTo(bx + bs - bevel, by + bevel);
    ctx.closePath();
    ctx.fill();

    // İç Kristal Yüzey
    const innerGrad = ctx.createLinearGradient(bx + bevel, by + bevel, bx + bs - bevel, by + bs - bevel);
    innerGrad.addColorStop(0, colorObj.light);
    innerGrad.addColorStop(0.35, colorObj.main);
    innerGrad.addColorStop(1, colorObj.dark);
    ctx.fillStyle = innerGrad;
    roundRect(ctx, bx + bevel, by + bevel, bs - bevel * 2, bs - bevel * 2, 3);
    ctx.fill();

    const hasFace = cellMeta && cellMeta.hasFace;
    const badge = cellMeta && cellMeta.badge;

    if (hasFace) {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const faceR = size * 0.37;
      const blockMood =
        state.mood === "panic" && !cellMeta.eventType
          ? "panic"
          : typeof hasFace === "string"
          ? hasFace
          : "happy";

      drawBoyfriendAvatar(ctx, cx, cy, faceR, blockMood);

      // Altın veya Özel Güç Çerçevesi
      ctx.strokeStyle = badge ? "#00f5d4" : "#ffe169";
      ctx.lineWidth = Math.max(1.6, size * 0.055);
      ctx.beginPath();
      ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.stroke();

      // Eğer Özel Etkinlik Bloğuysa (Gym 💪 / Mangal 🔥 / Trip 😭) sağ alt köşesine rozet çiz!
      if (badge && size >= 24) {
        ctx.font = `${Math.max(10, Math.floor(size * 0.32))}px sans-serif`;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(badge, x + size - 1, y + size);
      }
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      roundRect(ctx, bx + bevel + 2, by + bevel + 2, (bs - bevel * 2) * 0.45, (bs - bevel * 2) * 0.22, 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function rebuildBoardStaticCanvas(dpr) {
    const cs = state.cellSize;
    const total = state.boardPixelSize;
    if (boardStaticCanvas.width !== total * dpr || boardStaticCanvas.height !== total * dpr) {
      boardStaticCanvas.width = total * dpr;
      boardStaticCanvas.height = total * dpr;
    }

    const sCtx = boardStaticCanvas.getContext("2d");
    sCtx.save();
    sCtx.scale(dpr, dpr);
    sCtx.clearRect(0, 0, total, total);

    // 1. Izgara Hücre Yuvaları
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const x = c * cs;
        const y = r * cs;
        sCtx.fillStyle = "#192246";
        roundRect(sCtx, x + 2, y + 2, cs - 4, cs - 4, 5);
        sCtx.fill();
      }
    }

    // 2. Yerleşmiş Bloklar
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = state.board[r][c];
        if (cell) {
          draw3DBlock(sCtx, c * cs, r * cs, cs, cell.color, cell, 1);
        }
      }
    }

    sCtx.restore();
    state.boardDirty = false;
  }

  // Sürüklenen parçayı tek seferde ufak dragCanvas'a çizip GPU translate3d ile 0ms gecikmeyle taşıma
  function prepareDragCanvas(piece) {
    const dpr = window.devicePixelRatio || 1;
    const cs = state.cellSize;
    const pw = piece.cols * cs;
    const ph = piece.rows * cs;

    dom.dragCanvas.style.width = `${pw}px`;
    dom.dragCanvas.style.height = `${ph}px`;
    dom.dragCanvas.width = pw * dpr;
    dom.dragCanvas.height = ph * dpr;

    const ctx = dom.dragCanvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, pw, ph);

    for (let r = 0; r < piece.rows; r++) {
      for (let c = 0; c < piece.cols; c++) {
        if (piece.matrix[r][c]) {
          draw3DBlock(
            ctx,
            c * cs,
            r * cs,
            cs,
            piece.color,
            piece.cellDataMap[r][c],
            0.98
          );
        }
      }
    }
    ctx.restore();
  }

  function syncDragCanvasTransform() {
    if (!state.dragging) {
      dom.dragCanvas.style.transform = "translate3d(-9999px, -9999px, 0)";
      return;
    }
    const { piece, x, y } = state.dragging;
    const cs = state.cellSize;
    const left = x - (piece.cols * cs) / 2;
    const top = y - (piece.rows * cs) / 2;
    dom.dragCanvas.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
  }

  // ============================================================================
  // ANA RENDER DÖNGÜSÜ (60-120 FPS) & IDLE ZAMANLAYICI
  // ============================================================================
  let lastFrameTs = 0;
  function renderLoop(timestamp) {
    state.timeSec = timestamp / 1000;
    // Ekran yenileme hızından bağımsız animasyon: 60Hz = 1.0, 120Hz = 0.5, 30Hz = 2.0
    const rawDt = lastFrameTs ? (timestamp - lastFrameTs) / 16.667 : 1;
    state.dt = Math.max(0.25, Math.min(3, rawDt));
    lastFrameTs = timestamp;
    const dpr = window.devicePixelRatio || 1;

    const anyDialogOpen =
      dom.dialogTorpil.open ||
      dom.dialogGameover.open ||
      dom.dialogCoupon.open ||
      dom.dialogCollection.open ||
      (dom.dialogPersonaDetail && dom.dialogPersonaDetail.open) ||
      dom.dialogSettings.open;

    // 9.5 saniye hamle yapılmazsa Metehan laf atsın! (2. Madde)
    if (
      anyDialogOpen ||
      state.dragging ||
      (dom.cakeCeremonyScreen && dom.cakeCeremonyScreen.classList.contains("active"))
    ) {
      state.lastMoveTime = timestamp;
    } else if (
      !dom.startScreen.classList.contains("active") &&
      timestamp - state.lastMoveTime > 9500
    ) {
      state.lastMoveTime = timestamp;
      const idleMoods = ["crying", "party", "cool", "mangal"];
      const chosenM = idleMoods[Math.floor(Math.random() * idleMoods.length)];
      setManitaMood(chosenM, quoteDeck.pick("idleTimeout"));
    }

    if (dom.cakeCeremonyScreen && dom.cakeCeremonyScreen.classList.contains("active")) {
      renderCakeCeremony();
    }
    renderBoard(dpr);
    renderTray(dpr);
    renderLiveAvatars();
    renderConfetti(dpr);

    requestAnimationFrame(renderLoop);
  }

  function renderBoard(dpr) {
    if (state.boardDirty) {
      rebuildBoardStaticCanvas(dpr);
      state.boardViewDirty = true;
    }

    const hasLinePulse =
      state.dragging &&
      state.dragging.valid &&
      ((state.dragging.previewFullRows && state.dragging.previewFullRows.length > 0) ||
        (state.dragging.previewFullCols && state.dragging.previewFullCols.length > 0));

    const needsRedraw =
      state.boardViewDirty ||
      hasLinePulse ||
      state.bombTargetingMode ||
      state.particles.length > 0 ||
      state.floatingTexts.length > 0;

    if (!needsRedraw) return;
    state.boardViewDirty = false;

    const ctx = dom.boardCanvas.getContext("2d");
    const cs = state.cellSize;
    const total = state.boardPixelSize;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, total, total);

    // 1 & 2. Önbellekten Statik Tahta + Yerleşmiş Bloklar (Tek GPU Blit!)
    ctx.drawImage(boardStaticCanvas, 0, 0, total, total);

    // 3. Sürükleme Sırasında Önizleme (Ghost) ve Tamamlanacak Satır Parlaması
    if (state.dragging && state.dragging.valid) {
      const { piece, snapRow, snapCol, previewFullRows, previewFullCols } = state.dragging;

      if (
        (previewFullRows && previewFullRows.length > 0) ||
        (previewFullCols && previewFullCols.length > 0)
      ) {
        const pulse = 0.35 + Math.sin(state.timeSec * 10) * 0.15;
        ctx.fillStyle = `rgba(255, 204, 41, ${pulse})`;
        previewFullRows.forEach((r) => {
          roundRect(ctx, 0, r * cs, total, cs, 6);
          ctx.fill();
        });
        previewFullCols.forEach((c) => {
          roundRect(ctx, c * cs, 0, cs, total, 6);
          ctx.fill();
        });
      }

      for (let r = 0; r < piece.rows; r++) {
        for (let c = 0; c < piece.cols; c++) {
          if (piece.matrix[r][c]) {
            draw3DBlock(
              ctx,
              (snapCol + c) * cs,
              (snapRow + r) * cs,
              cs,
              piece.color,
              piece.cellDataMap[r][c],
              0.48
            );
          }
        }
      }
    }

    // 4. "Özür Dilerim" 3x3 Bomba Hedefleme Önizlemesi
    if (state.bombTargetingMode && state.bombHoverCell) {
      const { r: hr, c: hc } = state.bombHoverCell;
      const pulse = 0.35 + Math.sin(state.timeSec * 9) * 0.15;
      for (let r = hr - 1; r <= hr + 1; r++) {
        for (let c = hc - 1; c <= hc + 1; c++) {
          if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            ctx.fillStyle = `rgba(255, 71, 126, ${pulse})`;
            roundRect(ctx, c * cs + 2, r * cs + 2, cs - 4, cs - 4, 6);
            ctx.fill();
            ctx.strokeStyle = "#ffcc29";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }
    }

    // 5. Patlama Parçacıkları ve Uçan Metehan Kafaları
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      const dt = state.dt || 1;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.22 * dt;
      p.alpha -= 0.022 * dt;

      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);

      if (p.type === "shard") {
        p.rot += p.vRot * dt;
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        roundRect(ctx, -p.size / 2, -p.size / 2, p.size, p.size, 2);
        ctx.fill();
      } else if (p.type === "head") {
        p.rot += p.vRot * dt;
        ctx.rotate(p.rot);
        drawBoyfriendAvatar(ctx, 0, 0, p.size / 2, p.mood || "love");
      } else if (p.type === "emoji") {
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);
      }

      ctx.restore();
    }

    // 6. Tahta Üstü Çizgi Roman Konuşma Balonları (5. Madde)
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      const fdt = state.dt || 1;
      ft.y += ft.vy * fdt;
      ft.scale = Math.min(1.05, ft.scale + 0.12 * fdt);
      ft.alpha -= 0.018 * fdt;

      if (ft.alpha <= 0) {
        state.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = "900 16px 'Fredoka', 'Nunito', sans-serif";
      const textW = ctx.measureText(ft.text).width;
      const boxW = textW + 20;
      const boxH = 28;

      ctx.fillStyle = "rgba(17, 23, 48, 0.92)";
      ctx.strokeStyle = ft.color;
      ctx.lineWidth = 2.5;
      roundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ft.text, 0, 1);
      ctx.restore();
    }

    ctx.restore();
  }

  function renderTray(dpr) {
    let anyAnimating = false;
    for (let i = 0; i < 3; i++) {
      if (state.tray[i] && state.tray[i].scaleAnim < 1) {
        anyAnimating = true;
        break;
      }
    }
    if (!state.trayDirty && !anyAnimating) return;

    const ctx = dom.trayCanvas.getContext("2d");
    const rect = dom.trayContainer.getBoundingClientRect();
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const slotWidth = rect.width / 3;
    const cy = rect.height / 2;

    let stillAnimating = false;
    for (let i = 0; i < 3; i++) {
      const piece = state.tray[i];
      if (!piece) continue;
      if (state.dragging && state.dragging.trayIndex === i) continue;

      if (piece.scaleAnim < 1) {
        piece.scaleAnim = Math.min(1, piece.scaleAnim + 0.14 * (state.dt || 1));
        if (piece.scaleAnim < 1) stillAnimating = true;
      }

      const maxDim = Math.max(piece.rows, piece.cols);
      const baseCell = Math.min(22, (slotWidth - 22) / Math.max(3, maxDim), (rect.height - 16) / maxDim);
      const cell = baseCell * piece.scaleAnim;

      const pw = piece.cols * cell;
      const ph = piece.rows * cell;
      const startX = i * slotWidth + (slotWidth - pw) / 2;
      const startY = cy - ph / 2;

      const fits = canPieceFitAnywhere(state.board, piece.matrix);
      const alpha = fits ? 1 : 0.42;

      for (let r = 0; r < piece.rows; r++) {
        for (let c = 0; c < piece.cols; c++) {
          if (piece.matrix[r][c]) {
            draw3DBlock(
              ctx,
              startX + c * cell,
              startY + r * cell,
              cell,
              piece.color,
              piece.cellDataMap[r][c],
              alpha
            );
          }
        }
      }
    }

    ctx.restore();
    state.trayDirty = stillAnimating;
  }

  function renderLiveAvatars() {
    if (!state.liveAvatarDirty) return;
    state.liveAvatarDirty = false;

    const liveCtx = dom.liveAvatarCanvas.getContext("2d");
    liveCtx.clearRect(0, 0, 112, 112);
    drawBoyfriendAvatar(liveCtx, 56, 56, 52, state.mood);

    if (dom.startScreen.classList.contains("active")) {
      const heroCtx = dom.heroAvatarCanvas.getContext("2d");
      heroCtx.clearRect(0, 0, 136, 136);
      drawBoyfriendAvatar(heroCtx, 68, 68, 64, "party");
    }
    if (dom.cakeAvatarCanvas) {
      const cakeAvCtx = dom.cakeAvatarCanvas.getContext("2d");
      cakeAvCtx.clearRect(0, 0, 96, 96);
      drawBoyfriendAvatar(cakeAvCtx, 48, 48, 45, "party");
    }
  }

  // ============================================================================
  // 🕯️ #1: DOĞUM GÜNÜ PASTASI & 5 MUM (D-A-M-L-A) ÜFLEME RİTÜELİ
  // ============================================================================
  function getCandlePositions() {
    // 340x260 mantıksal koordinat alanında 5 mumun konumları
    const xs = [98, 134, 170, 206, 242];
    const baseY = 92;
    return xs.map((x, idx) => ({
      index: idx,
      x,
      topY: baseY - 38,
      bottomY: baseY
    }));
  }

  function resetCakeCandles() {
    state.cakeCompleted = false;
    state.candles.forEach((c) => {
      c.lit = true;
      c.smoke = [];
    });
    updateCakeCandleStatusUI();
  }

  function updateCakeCandleStatusUI() {
    if (!dom.cakeCandleStatus) return;
    const litCount = state.candles.filter((c) => c.lit).length;
    if (litCount > 0) {
      dom.cakeCandleStatus.textContent = `🕯️ Yanan Mumlar: ${litCount} / 5 (Söndürmek İçin Dokun / Kaydır)`;
    } else {
      dom.cakeCandleStatus.textContent = "🎉 DİLEĞİN KABUL OLSUN İYİ Kİ DOĞDUN DAMLA! 🎂";
    }
  }

  function extinguishCandle(idx) {
    const c = state.candles[idx];
    if (!c || !c.lit) return;
    c.lit = false;

    const pos = getCandlePositions()[idx];
    for (let i = 0; i < 12; i++) {
      c.smoke.push({
        x: pos.x + (Math.random() - 0.5) * 6,
        y: pos.topY - 6,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -0.9 - Math.random() * 1.1,
        r: 3 + Math.random() * 4,
        alpha: 0.85,
        gold: i % 3 === 0
      });
    }

    const blownCount = state.candles.filter((item) => !item.lit).length;
    sfx.playCandleBlow(blownCount - 1);
    updateCakeCandleStatusUI();

    if (blownCount === state.candles.length && !state.cakeCompleted) {
      state.cakeCompleted = true;
      sfx.playFanfare();
      spawnConfettiBurst(110);
      // Mumlar üflenince Damla'nın özel müzik kutusu otomatik başlasın!
      if (!sfx.musicEnabled) {
        sfx.startMusicBox();
        syncMusicButtonUI();
      }
      setTimeout(() => {
        if (dom.cakeCeremonyScreen) {
          dom.cakeCeremonyScreen.classList.remove("active");
        }
        dom.startScreen.classList.add("active");
        state.liveAvatarDirty = true;
      }, 1550);
    }
  }

  function blowAllCandles() {
    sfx.init();
    state.candles.forEach((c, idx) => {
      if (c.lit) {
        setTimeout(() => {
          extinguishCandle(idx);
        }, idx * 130);
      }
    });
  }

  function handleCakePointer(e) {
    if (!dom.cakeCanvas) return;
    sfx.init();
    const rect = dom.cakeCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    const scaleX = 340 / rect.width;
    const scaleY = 260 / rect.height;
    const cx = (clientX - rect.left) * scaleX;
    const cy = (clientY - rect.top) * scaleY;

    const positions = getCandlePositions();
    let hitAny = false;
    positions.forEach((p) => {
      const dx = Math.abs(cx - p.x);
      const dy = cy - p.topY;
      if (dx <= 24 && dy >= -35 && dy <= 62) {
        extinguishCandle(p.index);
        hitAny = true;
      }
    });

    // Eğer pastanın gövdesine tıklandıysa sıradaki yanan mumu söndür
    if (!hitAny && e.type === "mousedown") {
      const nextIdx = state.candles.findIndex((c) => c.lit);
      if (nextIdx !== -1) extinguishCandle(nextIdx);
    }
  }

  function renderCakeCeremony() {
    if (!dom.cakeCanvas) return;
    const ctx = dom.cakeCanvas.getContext("2d");
    const W = 340;
    const H = 260;
    const t = state.timeSec || 0;
    const dt = state.dt || 1;

    ctx.clearRect(0, 0, W, H);

    // 1. Arka Plan Işıltı Halkası
    const glow = ctx.createRadialGradient(W / 2, 125, 10, W / 2, 135, 145);
    glow.addColorStop(0, "rgba(255, 204, 41, 0.25)");
    glow.addColorStop(0.6, "rgba(255, 71, 126, 0.1)");
    glow.addColorStop(1, "rgba(12, 17, 42, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 2. Altın Pasta Tabağı / Standı
    ctx.fillStyle = "#e0a92e";
    roundRect(ctx, 44, 224, W - 88, 12, 6);
    ctx.fill();
    ctx.fillStyle = "#b87d14";
    roundRect(ctx, 135, 234, 70, 12, 5);
    ctx.fill();

    // 3. 1. Kat (En Alt Geniş Çilekli & Çikolatalı Kat)
    ctx.fillStyle = "#ff758f";
    roundRect(ctx, 64, 176, 212, 50, 12);
    ctx.fill();
    ctx.fillStyle = "#fff0f3";
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(82 + i * 29, 180, 11, 0, Math.PI);
      ctx.fill();
    }

    // 4. 2. Kat (Orta Vanilyalı & Altın Kremalı Kat)
    ctx.fillStyle = "#ffd166";
    roundRect(ctx, 84, 132, 172, 46, 10);
    ctx.fill();
    ctx.fillStyle = "#ff477e";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(100 + i * 28, 136, 9, 0, Math.PI);
      ctx.fill();
    }

    // 5. 3. Kat (Üst Butik Kat + Metehan Rozeti)
    ctx.fillStyle = "#c77dff";
    roundRect(ctx, 106, 92, 128, 42, 10);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(120 + i * 25, 96, 8, 0, Math.PI);
      ctx.fill();
    }

    // Pastanın ortasında minik Kral Metehan rozeti ve "DAMLA" yazısı
    drawBoyfriendAvatar(ctx, W / 2, 155, 19, state.cakeCompleted ? "king" : "party");
    ctx.strokeStyle = "#ffcc29";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(W / 2, 155, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 15px 'Fredoka', 'Nunito', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ İYİ Kİ DOĞDUN DAMLA ✨", W / 2, 204);

    // 6. 5 Adet "D - A - M - L - A" Mumu ve Canlı Alevleri / Dumanları
    const positions = getCandlePositions();
    positions.forEach((p, idx) => {
      const candle = state.candles[idx];
      const cw = 16;
      const ch = 38;
      const cx = p.x - cw / 2;
      const cy = p.topY;

      // Mum gövdesi
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, cx, cy, cw, ch, 4);
      ctx.fill();
      ctx.strokeStyle = candle.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Renkli şerit ve Harf (D-A-M-L-A)
      ctx.fillStyle = candle.color;
      roundRect(ctx, cx + 2, cy + 9, cw - 4, 20, 3);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 12px 'Fredoka', 'Nunito', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(candle.letter, p.x, cy + 19);

      // Fitil
      ctx.strokeStyle = "#2b2d42";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, cy);
      ctx.lineTo(p.x, cy - 5);
      ctx.stroke();

      if (candle.lit) {
        // Canlı titreşen çift katmanlı mum alevi
        const sway = Math.sin(t * 9 + idx * 1.7) * 2.2;
        const stretch = 1 + Math.cos(t * 12 + idx) * 0.12;
        const fx = p.x + sway;
        const fy = cy - 13 * stretch;

        const flameGlow = ctx.createRadialGradient(fx, fy, 2, fx, fy, 22);
        flameGlow.addColorStop(0, "rgba(255, 230, 109, 0.85)");
        flameGlow.addColorStop(0.5, "rgba(255, 159, 28, 0.35)");
        flameGlow.addColorStop(1, "rgba(255, 159, 28, 0)");
        ctx.fillStyle = flameGlow;
        ctx.beginPath();
        ctx.arc(fx, fy, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ff9f1c";
        ctx.beginPath();
        ctx.moveTo(p.x, cy - 4);
        ctx.quadraticCurveTo(fx - 9, fy, fx, fy - 12 * stretch);
        ctx.quadraticCurveTo(fx + 9, fy, p.x, cy - 4);
        ctx.fill();

        ctx.fillStyle = "#fff3b0";
        ctx.beginPath();
        ctx.arc(fx, fy - 2, 3.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sönen mumların duman ve altın kıvılcım parçacıkları
      for (let s = candle.smoke.length - 1; s >= 0; s--) {
        const sm = candle.smoke[s];
        sm.x += sm.vx * dt;
        sm.y += sm.vy * dt;
        sm.r += 0.12 * dt;
        sm.alpha -= 0.02 * dt;
        if (sm.alpha <= 0) {
          candle.smoke.splice(s, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, sm.alpha);
        ctx.fillStyle = sm.gold ? "#ffcc29" : "rgba(220, 228, 255, 0.78)";
        ctx.beginPath();
        ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  function syncMusicButtonUI() {
    if (!dom.btnMusicToggle) return;
    if (sfx.musicEnabled) {
      dom.btnMusicToggle.classList.add("music-on");
      dom.btnMusicToggle.textContent = "🎵";
    } else {
      dom.btnMusicToggle.classList.remove("music-on");
      dom.btnMusicToggle.textContent = "🎶";
    }
  }

  // ============================================================================
  // DOKUNMATİK (TOUCH) VE FARE (MOUSE) SÜRÜKLE-BIRAK KONTROLLERİ (0ms GECİKME)
  // ============================================================================
  // Sürükleme hız çarpanı: 1.0 = blok parmakla birebir (1:1) hareket eder.
  // Hissiyat ayarı gerekirse yalnızca bu sabiti değiştirmek yeterli.
  const DRAG_SPEED = 1.0;

  // Aktif sürüklemeyi başlatan parmağı (touch identifier) takip ederek
  // ikinci bir parmağın sürüklemeyi bozmasını engeller.
  function findTrackedTouch(list, id) {
    if (!list) return null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].identifier === id) return list[i];
    }
    return null;
  }

  function getPointerPos(e) {
    const trackId = state.dragging ? state.dragging.touchId : null;
    if (trackId !== null && trackId !== undefined) {
      const t = findTrackedTouch(e.touches, trackId) || findTrackedTouch(e.changedTouches, trackId);
      if (t) return { x: t.clientX, y: t.clientY, isTouch: true, id: t.identifier };
    }
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      return { x: t.clientX, y: t.clientY, isTouch: true, id: t.identifier };
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      return { x: t.clientX, y: t.clientY, isTouch: true, id: t.identifier };
    }
    return { x: e.clientX, y: e.clientY, isTouch: false, id: null };
  }

  function computeDraggedCenter(pos, dragState) {
    const dx = pos.x - dragState.startX;
    const dy = pos.y - dragState.startY;
    return {
      x: dragState.startX + dx * DRAG_SPEED,
      y: dragState.startY - dragState.liftOffset + dy * DRAG_SPEED
    };
  }

  function handleTrayPointerDown(e) {
    if (state.bombTargetingMode) {
      state.bombTargetingMode = false;
      state.boardViewDirty = true;
      updateJokerButtons();
    }

    const pos = getPointerPos(e);
    const rect = dom.trayContainer.getBoundingClientRect();
    // Dokunmatikte tepsi çevresine +14px tolerans tanı
    if (
      pos.x < rect.left - 8 ||
      pos.x > rect.right + 8 ||
      pos.y < rect.top - 14 ||
      pos.y > rect.bottom + 14
    ) {
      return;
    }

    const rawSlot = Math.floor(((pos.x - rect.left) / rect.width) * 3);
    const slotIndex = Math.max(0, Math.min(2, rawSlot));

    const piece = state.tray[slotIndex];
    if (!piece) return;

    e.preventDefault();
    sfx.playPickup();
    state.lastMoveTime = performance.now();

    const liftOffset = pos.isTouch ? 58 : 18;
    state.dragging = {
      trayIndex: slotIndex,
      piece,
      touchId: pos.id ?? null,
      startX: pos.x,
      startY: pos.y,
      grabOffsetX: 0,
      grabOffsetY: 0,
      x: pos.x,
      y: pos.y - liftOffset,
      liftOffset,
      snapRow: -1,
      snapCol: -1,
      valid: false,
      previewFullRows: [],
      previewFullCols: []
    };

    state.trayDirty = true;
    state.boardViewDirty = true;
    prepareDragCanvas(piece);
    syncDragCanvasTransform();
    updateDraggingSnap();
  }

  function updateDraggingSnap() {
    if (!state.dragging) return;
    const { piece, x, y } = state.dragging;
    const boardRect = dom.boardCanvas.getBoundingClientRect();
    const cs = state.cellSize;

    const pw = piece.cols * cs;
    const ph = piece.rows * cs;
    const topLeftX = x - pw / 2;
    const topLeftY = y - ph / 2;

    const col = Math.round((topLeftX - boardRect.left) / cs);
    const row = Math.round((topLeftY - boardRect.top) / cs);

    if (row === state.dragging.snapRow && col === state.dragging.snapCol) {
      return;
    }

    state.boardViewDirty = true;

    if (canPlaceAt(state.board, piece.matrix, row, col)) {
      state.dragging.snapRow = row;
      state.dragging.snapCol = col;
      state.dragging.valid = true;

      // Yalnızca hedef hücre değiştiğinde tamamlanacak satır/sütunları hesapla
      const tempBoard = state.board.map((rArr) => rArr.slice());
      for (let r = 0; r < piece.rows; r++) {
        for (let c = 0; c < piece.cols; c++) {
          if (piece.matrix[r][c]) {
            tempBoard[row + r][col + c] = { color: piece.color };
          }
        }
      }
      const { fullRows, fullCols } = findCompletedLines(tempBoard);
      state.dragging.previewFullRows = fullRows;
      state.dragging.previewFullCols = fullCols;
    } else {
      state.dragging.snapRow = -1;
      state.dragging.snapCol = -1;
      state.dragging.valid = false;
      state.dragging.previewFullRows = [];
      state.dragging.previewFullCols = [];
    }
  }

  function handleGlobalPointerMove(e) {
    if (state.bombTargetingMode) {
      const pos = getPointerPos(e);
      const boardRect = dom.boardCanvas.getBoundingClientRect();
      if (
        pos.x >= boardRect.left &&
        pos.x <= boardRect.right &&
        pos.y >= boardRect.top &&
        pos.y <= boardRect.bottom
      ) {
        const c = Math.floor((pos.x - boardRect.left) / state.cellSize);
        const r = Math.floor((pos.y - boardRect.top) / state.cellSize);
        state.bombHoverCell = {
          r: Math.max(0, Math.min(GRID_SIZE - 1, r)),
          c: Math.max(0, Math.min(GRID_SIZE - 1, c))
        };
      }
    }

    if (!state.dragging) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    const nextPos = computeDraggedCenter(pos, state.dragging);
    state.dragging.x = nextPos.x;
    state.dragging.y = nextPos.y;

    // Anında (rAF beklemeden) GPU üzerinde bloğu parmakla aynı anda taşı!
    syncDragCanvasTransform();
    updateDraggingSnap();
  }

  function handleGlobalPointerUp(e) {
    if (!state.dragging) return;
    // Çoklu dokunuşta sürükleyen parmak hâlâ ekrandaysa sürüklemeyi sonlandırma
    if (
      e &&
      e.touches &&
      state.dragging.touchId !== null &&
      state.dragging.touchId !== undefined &&
      findTrackedTouch(e.touches, state.dragging.touchId)
    ) {
      return;
    }
    const { trayIndex, valid, snapRow, snapCol } = state.dragging;
    state.dragging = null;
    syncDragCanvasTransform();
    state.trayDirty = true;
    state.boardViewDirty = true;

    if (valid) {
      placePieceOnBoard(trayIndex, snapRow, snapCol);
    }
  }

  function handleBoardPointerDown(e) {
    if (!state.bombTargetingMode) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    const boardRect = dom.boardCanvas.getBoundingClientRect();
    const c = Math.floor((pos.x - boardRect.left) / state.cellSize);
    const r = Math.floor((pos.y - boardRect.top) / state.cellSize);
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      executeBombAt(r, c);
    }
  }

  // ============================================================================
  // ARAYÜZ & AYARLAR PANELİ ETKİLEŞİMLERİ
  // ============================================================================
  function syncUIFromConfig() {
    dom.birthdayPill.textContent = config.birthdayAgeText || "🎂 İYİ Kİ DOĞDUN DAMLA! 🎂";
    dom.uiBoyfriendName.textContent = config.boyfriendName || "Metehan";
    dom.uiBestScore.textContent = state.bestScore.toLocaleString("tr-TR");

    dom.leaderboardList.innerHTML = "";
    const lb = config.leaderboard || [];
    lb.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = `lb-row ${idx === 0 ? "rank-1" : ""}`;
      const displayName = escapeHtml(idx === 1 ? `${config.boyfriendName} 🤡` : item.name);
      row.innerHTML = `
        <div class="lb-left">
          <span class="lb-badge">${item.badge}</span>
          <div>
            <span class="lb-name">${displayName}</span>
            <span class="lb-note">${item.note}</span>
          </div>
        </div>
        <span class="lb-score">${item.score} Puan</span>
      `;
      dom.leaderboardList.appendChild(row);
    });
  }

  function startNewGame() {
    state.board = createEmptyBoard();
    state.score = 0;
    state.streak = 0;
    state.noClearMoves = 0;
    state.currentTierIndex = 0;
    state.bombCount = config.initialBombCount ?? 2;
    state.rerollCount = config.initialRerollCount ?? 2;
    state.nextBonusScore = config.bonusJokerEveryScore || 900;
    state.bombTargetingMode = false;
    state.particles = [];
    state.floatingTexts = [];
    state.shownWaScores.clear();
    state.couponUnlocked = false;
    dom.btnGiftCoupon.classList.remove("unlocked");
    state.boardDirty = true;
    state.trayDirty = true;
    state.liveAvatarDirty = true;
    state.lastMoveTime = performance.now();

    dom.uiCurrentScore.textContent = "0";
    dom.uiGoalFill.style.width = "0%";
    updateWalletProgressAndTiers();
    updateStreakBadge();
    updateJokerButtons();
    setManitaMood("party", quoteDeck.pick("idle"));

    spawnNewTray();
    resizeCanvases();
  }

  function openSettingsModal() {
    dom.inputBfName.value = config.boyfriendName || "Metehan";
    dom.inputTargetScore.value = config.targetBirthdayScore || 1500;
    dom.inputCouponText.value = (config.coupon && config.coupon.rewardText) || "";

    const pCtx = dom.settingsPreviewCanvas.getContext("2d");
    pCtx.clearRect(0, 0, 76, 76);
    drawBoyfriendAvatar(pCtx, 38, 38, 35, "happy", state.timeSec);

    if (!dom.dialogSettings.open) {
      dom.dialogSettings.showModal();
    }
  }

  function handlePhotoFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const off = document.createElement("canvas");
        const size = 256;
        off.width = size;
        off.height = size;
        const oCtx = off.getContext("2d");

        const scale = Math.max(size / img.width, size / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        oCtx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

        const dataUrl = off.toDataURL("image/jpeg", 0.86);
        config.photos.main = dataUrl;
        reloadPhotos(() => {
          const pCtx = dom.settingsPreviewCanvas.getContext("2d");
          pCtx.clearRect(0, 0, 76, 76);
          drawBoyfriendAvatar(pCtx, 38, 38, 35, "happy", state.timeSec);
        });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveSettingsFromModal() {
    const newName = dom.inputBfName.value.trim() || "Metehan";
    const newTarget = Math.max(500, Number(dom.inputTargetScore.value) || 1500);
    const newCoupon = dom.inputCouponText.value.trim();

    config.boyfriendName = newName;
    config.targetBirthdayScore = newTarget;
    if (config.coupon && newCoupon) {
      config.coupon.rewardText = newCoupon;
    }

    try {
      safeStorage.setItem(
        STORAGE_KEY_CUSTOM,
        JSON.stringify({
          boyfriendName: config.boyfriendName,
          targetBirthdayScore: config.targetBirthdayScore,
          rewardText: config.coupon ? config.coupon.rewardText : "",
          photoDataUrl:
            config.photos.main && config.photos.main.startsWith("data:image")
              ? config.photos.main
              : ""
        })
      );
    } catch (err) {
      console.warn("Ayarlar localStorage'a kaydedilemedi:", err);
    }

    syncUIFromConfig();
    updateWalletProgressAndTiers();
    if (dom.dialogSettings.open) dom.dialogSettings.close();
  }

  function exportConfigJsFile() {
    saveSettingsFromModal();
    const content = `// Damla Blast Özelleştirilmiş Ayar Dosyası\nwindow.DAMLA_CONFIG = ${JSON.stringify(
      config,
      null,
      2
    )};\n`;
    const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    window.addEventListener("resize", resizeCanvases);

    // Android geri tuşu / Esc ile kritik pencereler kapatılıp oyun kilitlenmesin
    [dom.dialogTorpil, dom.dialogGameover].forEach((dlg) => {
      dlg.addEventListener("cancel", (e) => e.preventDefault());
      dlg.addEventListener("close", () => {
        setTimeout(() => {
          if (!isBoardStuck() || dom.dialogTorpil.open || dom.dialogGameover.open) return;
          if (dlg === dom.dialogGameover) {
            openGameOverModal();
          } else {
            openTorpilModal();
          }
        }, 60);
      });
    });

    dom.btnStartGame.addEventListener("click", () => {
      sfx.init();
      sfx.playAvatarBoop();
      if (!sfx.musicEnabled) {
        sfx.startMusicBox();
        syncMusicButtonUI();
      }
      state.lastMoveTime = performance.now();
      dom.startScreen.classList.remove("active");
      resizeCanvases();
    });

    // 🕯️ #1: Pasta ve Mum Üfleme Kontrolleri
    if (dom.cakeCanvas) {
      dom.cakeCanvas.addEventListener("mousedown", handleCakePointer);
      dom.cakeCanvas.addEventListener("mousemove", (e) => {
        if (e.buttons === 1) handleCakePointer(e);
      });
      dom.cakeCanvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleCakePointer(e);
      }, { passive: false });
      dom.cakeCanvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        handleCakePointer(e);
      }, { passive: false });
    }
    if (dom.btnBlowAllCandles) {
      dom.btnBlowAllCandles.addEventListener("click", blowAllCandles);
    }
    if (dom.btnSkipCake) {
      dom.btnSkipCake.addEventListener("click", () => {
        sfx.init();
        sfx.playAvatarBoop();
        if (dom.cakeCeremonyScreen) dom.cakeCeremonyScreen.classList.remove("active");
        dom.startScreen.classList.add("active");
        state.liveAvatarDirty = true;
      });
    }
    if (dom.btnReplayCake) {
      dom.btnReplayCake.addEventListener("click", () => {
        sfx.init();
        sfx.playAvatarBoop();
        resetCakeCandles();
        if (dom.cakeCeremonyScreen) dom.cakeCeremonyScreen.classList.add("active");
      });
    }

    // 🎵 #3: Damla Özel Müzik Kutusu Aç/Kapat Butonu
    if (dom.btnMusicToggle) {
      dom.btnMusicToggle.addEventListener("click", () => {
        sfx.init();
        sfx.toggleMusicBox();
        syncMusicButtonUI();
      });
    }

    // 💬 #4: WhatsApp Bildirimine Dokununca Kapat ve Konuştur
    if (dom.whatsappToast) {
      dom.whatsappToast.addEventListener("click", () => {
        dom.whatsappToast.classList.add("hidden");
      });
    }

    // 📸 #5: Karakter Kartı Büyütme Modalı Kontrolleri
    if (dom.btnClosePersonaDetailX && dom.dialogPersonaDetail) {
      dom.btnClosePersonaDetailX.addEventListener("click", () => dom.dialogPersonaDetail.close());
    }
    if (dom.btnActivatePersona) {
      dom.btnActivatePersona.addEventListener("click", () => {
        const p = state.activePersonaDetail;
        if (p) {
          setManitaMood(p.key, p.quote);
          sfx.playAvatarBoop();
        }
        if (dom.dialogPersonaDetail && dom.dialogPersonaDetail.open) {
          dom.dialogPersonaDetail.close();
        }
        if (dom.dialogCollection && dom.dialogCollection.open) {
          dom.dialogCollection.close();
        }
      });
    }

    dom.btnOpenSettingsStart.addEventListener("click", openSettingsModal);
    dom.btnOpenSettings.addEventListener("click", openSettingsModal);
    dom.btnCloseSettingsX.addEventListener("click", () => dom.dialogSettings.close());

    // 🔒 Gizli Ayarlar Tetikleyicisi: Girişteki doğum günü rozetine veya REKOR kutusuna
    // art arda 5 kez dokunulduğunda gizli ayarlar paneli açılır.
    let secretTapCount = 0;
    let secretTapTimer = null;
    const handleSecretSettingsTap = () => {
      secretTapCount++;
      if (secretTapTimer) clearTimeout(secretTapTimer);
      if (secretTapCount >= 5) {
        secretTapCount = 0;
        openSettingsModal();
      } else {
        secretTapTimer = setTimeout(() => {
          secretTapCount = 0;
        }, 1800);
      }
    };
    if (dom.birthdayPill) dom.birthdayPill.addEventListener("click", handleSecretSettingsTap);
    if (dom.uiBestScore) dom.uiBestScore.addEventListener("click", handleSecretSettingsTap);

    dom.btnOpenCollection.addEventListener("click", openCollectionModal);
    dom.goalProgressWrap.addEventListener("click", openCollectionModal);
    dom.btnCloseCollectionX.addEventListener("click", () => dom.dialogCollection.close());
    dom.btnCloseCollection.addEventListener("click", () => dom.dialogCollection.close());

    dom.btnSoundToggle.addEventListener("click", () => {
      sfx.enabled = !sfx.enabled;
      dom.btnSoundToggle.textContent = sfx.enabled ? "🔊" : "🔇";
    });

    dom.btnGiftCoupon.addEventListener("click", () => {
      if (state.couponUnlocked) {
        openCouponModal();
      } else {
        openCollectionModal();
      }
    });

    // Canlı Metehan Avatarına Dokununca Karakter Değiştirerek Tepki Versin!
    dom.manitaAvatarWrapper.addEventListener("click", () => {
      sfx.playAvatarBoop();
      const tapOptions = [
        { mood: "gym", quote: "Sporda 100 kilo basıyorum ama senin parmak darben devirdi beni 😂💪" },
        { mood: "mangal", quote: "Maşayı bıraktım sana bakıyorum Damla'm, hadi patlat bir satır 🔥" },
        { mood: "king", quote: "Doğum günü kraliçesi ne derse o olur, emrindeyim 👑❤️" },
        { mood: "love", quote: "Bana her dokunduğunda kalbim yerinden çıkacakmış gibi çarpıyor 😍❤️" },
        { mood: "party", quote: "İyi ki doğdun sevgilim! Düdüğü senin için çalıyorum 🥳🎂" }
      ];
      const pick = tapOptions[Math.floor(Math.random() * tapOptions.length)];
      setManitaMood(pick.mood, pick.quote);
    });

    dom.trayContainer.addEventListener("mousedown", handleTrayPointerDown);
    dom.trayContainer.addEventListener("touchstart", handleTrayPointerDown, { passive: false });

    window.addEventListener("mousemove", handleGlobalPointerMove, { passive: false });
    window.addEventListener("touchmove", handleGlobalPointerMove, { passive: false });

    window.addEventListener("mouseup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);
    window.addEventListener("touchcancel", handleGlobalPointerUp);

    dom.boardCanvas.addEventListener("mousedown", handleBoardPointerDown);
    dom.boardCanvas.addEventListener("touchstart", handleBoardPointerDown, { passive: false });

    dom.btnJokerBomb.addEventListener("click", toggleBombMode);
    dom.btnCancelBomb.addEventListener("click", () => {
      state.bombTargetingMode = false;
      updateJokerButtons();
    });
    dom.btnJokerReroll.addEventListener("click", executeRerollJoker);

    dom.btnAcceptTorpil.addEventListener("click", applyTorpilRescue);
    dom.btnDeclineTorpil.addEventListener("click", openGameOverModal);
    if (dom.btnShareCouponImage) {
      dom.btnShareCouponImage.addEventListener("click", shareOrDownloadCouponImage);
    }
    if (dom.btnWhatsappCoupon) {
      dom.btnWhatsappCoupon.addEventListener("click", shareCouponViaWhatsApp);
    }
    dom.btnCloseCoupon.addEventListener("click", () => dom.dialogCoupon.close());
    dom.btnRestartGame.addEventListener("click", () => {
      dom.dialogGameover.close();
      startNewGame();
    });

    dom.inputBfPhoto.addEventListener("change", handlePhotoFileSelect);
    dom.btnResetPhoto.addEventListener("click", () => {
      config.photos.main = "assets/faces/metehan_happy.jpg";
      reloadPhotos(() => {
        const pCtx = dom.settingsPreviewCanvas.getContext("2d");
        pCtx.clearRect(0, 0, 76, 76);
        drawBoyfriendAvatar(pCtx, 38, 38, 35, "happy", state.timeSec);
      });
    });
    dom.btnSaveSettings.addEventListener("click", saveSettingsFromModal);
    dom.btnExportConfig.addEventListener("click", exportConfigJsFile);
    dom.btnNewGameSettings.addEventListener("click", () => {
      saveSettingsFromModal();
      dom.startScreen.classList.remove("active");
      startNewGame();
    });
  }

  function init() {
    // Görselleri beklemeden oyunu hemen başlat; yüzler indikçe otomatik yerine oturur.
    syncUIFromConfig();
    bindEvents();
    startNewGame();
    requestAnimationFrame(renderLoop);

    const playLabel = dom.btnStartGame.querySelector
      ? dom.btnStartGame.querySelector("span")
      : null;
    const originalLabel = playLabel ? playLabel.textContent : "";
    if (playLabel) playLabel.textContent = "METEHAN HAZIRLANIYOR…";

    reloadPhotos(() => {
      if (playLabel) playLabel.textContent = originalLabel;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
