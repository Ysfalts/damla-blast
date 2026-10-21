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
  const STORAGE_KEY_SAVE = "damla_blast_saved_game_v1";

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
      quote: "Gülüşün bütün oyun tahtasını aydınlatıyor bitanem, iyi ki doğdun! ❤️"
    },
    {
      key: "love",
      name: "Kalp Gözlü 😍",
      unlockScore: 0,
      role: "Başlangıç Paketi • Hayran Modu",
      power: "💖 Özel Yetenek: Tek satır bile patlatsan Dünya Kupası kazanmışsın gibi alkışlar.",
      quote: "Sen blok yerleştirirken bile dünyanın en tatlı insanısın! 😍🎂"
    },
    {
      key: "panic",
      name: "Terleyen Manita 🥵",
      unlockScore: 0,
      role: "Başlangıç Paketi • Sıkışma Alarmı",
      power: "🚨 Özel Yetenek: Tahta %65 dolduğunda soğuk terler döküp seni uyarır.",
      quote: "Canım tahta biraz doldu sanki... Yanarsan vallahi benim suçum değil! 😅"
    },
    {
      key: "sorry",
      name: "Güllü Özür 💐",
      unlockScore: 0,
      role: "Joker Karakteri • 3x3 Bomba",
      power: "💐 Özel Yetenek: 'Özür Dilerim Haklısın' jokeriyle 3x3 alanı güllerle tertemiz açar.",
      quote: "Ne konuda olduğunu bilmiyorum ama %100 sen haklısın canım, al çiçeklerin! 💐"
    },
    {
      key: "cool",
      name: "Piyasa Modu 😎",
      unlockScore: 0,
      role: "Joker Karakteri • Hallederiz Modu",
      power: "😎 Özel Yetenek: 'Ben Hallederim' jokeriyle en zor anında 3 adet kurtarıcı 1x1 blok verir.",
      quote: "Sen hiç stres yapma bitanem, arkanı yaslan Metehan halleder! 😎✨"
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
      unlockScore: 0, // config.rewardTiers'tan hesaplanır
      role: "Güçlü Blok",
      power: "💪 Özel Yetenek: Tahtada patlatıldığında 100 kg dambıl basıp rastgele 3 dolu bloğu daha ezer!",
      quote: "Sporda 100 kilo basıyorum ama senin tek bir bakışın beni nakavt ediyor! 💪🔥"
    },
    {
      key: "mangal",
      name: "Mangal Şefi 🔥",
      unlockScore: 0,
      role: "Joker Üretici",
      power: "🔥 Özel Yetenek: Tahtada patlatıldığında maşayı şıklatır ve anında +1 Joker hakkı doldurur!",
      quote: "Maşayı da tatlıyı da hazırladım, bu skordan sonra sana ziyafet borcumuz oldu! 🔥🍰"
    },
    {
      key: "crying",
      name: "Trip Yemiş 😭",
      unlockScore: 0,
      role: "+150 Bonus Puan",
      power: "😭 Özel Yetenek: Patlatıldığında 'Trip Çözüldü' bonusu olarak +150 ekstra puan kazandırır!",
      quote: "Tamam canım bir daha 'fark etmez' demeyeceğim, nereye istersen oraya gidiyoruz! 😭❤️"
    },
    {
      key: "broke",
      name: "Şaşkın Manita 😱",
      unlockScore: 0,
      role: "Rekor Şoku",
      power: "⚡ Özel Yetenek: Yüksek skor barajlarını yıktığında şaşkınlıktan küçük dilini yutar.",
      quote: "Bu skor ne?! Bu nasıl bir zeka, karşında saygıyla eğiliyorum! 😱👑"
    },
    {
      key: "king",
      name: "Kral Metehan 👑",
      unlockScore: 0,
      role: "Büyük Final Ödülü • VIP Mod",
      power: "👑 Özel Yetenek: Büyük Doğum Günü Senedini mühürler ve tahtayı kraliçesi için kurtarır.",
      quote: "Büyük doğum günü ödülü senindir kraliçem! İyi ki doğdun, iyi ki varsın! 👑🎂❤️"
    },
    {
      key: "kumru",
      name: "Kumrucu Metehan 🥪",
      unlockScore: 0,
      role: "Güçlü Blok • Çapraz Patlama",
      power: "🥪 Özel Yetenek: Patlayınca İzmir usulü çapraz patlama yapar, bulunduğu satır ve sütunu birlikte temizler!",
      quote: "Kordon'da sucuklu kaşarlı kumru, yanında ayran... Bu söz benden canım! 🥪🌅"
    },
    {
      key: "sambali",
      name: "Şambalici Metehan 🍮",
      unlockScore: 0,
      role: "Güçlü Blok • Şerbet x2",
      power: "🍮 Özel Yetenek: Patlayınca şerbetli mola verir, bir sonraki satır patlatman 2 kat puan kazandırır!",
      quote: "Kaymaklı şambali da benden, tatlının en tatlısı sana yakışır bitanem! 🍮✨"
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

  // iPadOS 13+ kendini Mac olarak tanıttığı için dokunmatik nokta sayısıyla da kontrol edilir
  const IS_IOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function hapticTick() {
    try {
      const label = document.createElement("label");
      label.setAttribute("aria-hidden", "true");
      label.style.display = "none";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      label.appendChild(input);
      document.head.appendChild(label);
      label.click();
      document.head.removeChild(label);
    } catch (e) {
      // desteklenmiyorsa sessizce geç
    }
  }

  // ============================================================================
  // iOS SÜRÜKLEME TİTREŞİMİ (iOS 18+ ve 26.5+)
  // iOS 26.5'ten beri koddan tetiklenen switch tıkları çalmıyor. Ama parmak bir switch'in
  // başparmağını sürüklerken switch'in ortasını geçtiğinde iOS yine tık çalıyor ve bunun için
  // tıklama gerekmiyor. Tepsiyi görünmez, çok geniş bir switch ile kaplıyoruz; dokunuş onun
  // üstünde başlıyor. Tık istendiğinde switch'i, parmak ortanın öbür tarafında kalacak şekilde
  // kaydırıyoruz; bir sonraki touchmove ortayı geçiyor ve iOS tık çalıyor.
  // Kısıtlar: WebKit takibe dokunuştan ~200ms sonra başlar (önceki tıklar çalmaz) ve parmak
  // kalkarken tık çalınamaz. Uyarlandığı yer: github.com/ilyassesalama/vibration (src/drag.ts, MIT).
  // ============================================================================
  const DRAG_HAPTIC_WIDTH = 4000;
  const DRAG_HAPTIC_SIDES = [DRAG_HAPTIC_WIDTH / 4, (DRAG_HAPTIC_WIDTH * 3) / 4];
  const DRAG_HAPTIC_HOLD = 250;
  const DRAG_HAPTIC_REST =
    "-webkit-appearance:none;appearance:none;position:absolute;left:0;top:0;width:100%;height:100%;margin:0;padding:0;border:0;opacity:0;pointer-events:auto";

  const dragHaptic = { host: null, toggle: null, drag: null, restoreTimer: null, requested: 0, crossed: 0 };

  function findTouchById(list, id) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].identifier === id) return list[i];
    }
    return null;
  }

  function placeDragHapticSwitch(d) {
    const box = dragHaptic.host.getBoundingClientRect();
    const scale = box.width / dragHaptic.host.offsetWidth || 1;
    const left = (d.x - box.left) / scale - DRAG_HAPTIC_SIDES[d.side];
    dragHaptic.toggle.style.cssText =
      `-webkit-appearance:none;appearance:none;position:absolute;top:0;left:${left}px;width:${DRAG_HAPTIC_WIDTH}px;height:8px;` +
      "margin:0;padding:0;border:0;opacity:0;pointer-events:none";
    // Switch, dokunuşu işlerken yerleşimini senkron okur
    void dragHaptic.toggle.offsetWidth;
  }

  function crossDragHapticSwitch(d) {
    d.side = d.side === 0 ? 1 : 0;
    d.crossed = true;
    dragHaptic.crossed++;
    placeDragHapticSwitch(d);
  }

  function attachDragHaptic(element) {
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText =
      "position:absolute;inset:0;display:block;z-index:5;touch-action:none;-webkit-tap-highlight-color:transparent;" +
      "-webkit-user-select:none;user-select:none;-webkit-touch-callout:none";
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.setAttribute("switch", "");
    toggle.tabIndex = -1;
    toggle.style.cssText = DRAG_HAPTIC_REST;
    host.appendChild(toggle);
    element.appendChild(host);
    dragHaptic.host = host;
    dragHaptic.toggle = toggle;

    const opts = { capture: true, passive: true };
    window.addEventListener(
      "touchstart",
      (e) => {
        // WebKit bir switch'i tek parmakla takip eder
        if (e.target !== host || dragHaptic.drag || e.targetTouches.length !== 1) return;
        const t = e.changedTouches[0];
        dragHaptic.drag = {
          touch: t.identifier,
          startedAt: performance.now(),
          x: t.clientX,
          side: 0,
          pending: false,
          move: null,
          crossed: false
        };
        placeDragHapticSwitch(dragHaptic.drag);
      },
      opts
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        const d = dragHaptic.drag;
        if (!d || e.target !== host) return;
        const t = findTouchById(e.changedTouches, d.touch);
        if (!t) return;
        d.x = t.clientX;
        d.move = e;
        d.crossed = false;
        if (d.pending && performance.now() - d.startedAt >= DRAG_HAPTIC_HOLD) {
          d.pending = false;
          crossDragHapticSwitch(d);
        } else {
          placeDragHapticSwitch(d);
        }
      },
      opts
    );
    const onEnd = (e) => {
      const d = dragHaptic.drag;
      if (!d || e.target !== host || findTouchById(e.touches, d.touch)) return;
      dragHaptic.drag = null;
      // touchend WebKit'e ulaşmadan switch'i gizle: tıklama ve bırakma tıkı olmasın.
      // WebKit'in 200ms zamanlayıcısı dolana kadar gizli kalsın ki kısa dokunuş takip başlatmasın.
      toggle.style.display = "none";
      void toggle.offsetWidth;
      clearTimeout(dragHaptic.restoreTimer);
      dragHaptic.restoreTimer = setTimeout(() => {
        toggle.style.cssText = DRAG_HAPTIC_REST;
      }, Math.max(0, d.startedAt + DRAG_HAPTIC_HOLD + 50 - performance.now()));
    };
    window.addEventListener("touchend", onEnd, opts);
    window.addEventListener("touchcancel", onEnd, opts);
  }

  // Sürükleme sırasında bir tık iste (tepsiden başlayan iOS sürüklemesi yoksa hiçbir şey yapmaz)
  function requestDragHapticTick() {
    const d = dragHaptic.drag;
    if (!d || !sfx.enabled) return;
    dragHaptic.requested++;
    if (performance.now() - d.startedAt < DRAG_HAPTIC_HOLD) return;
    if (window.event && window.event === d.move) {
      // Aynı touchmove işlenirken istendi: switch konumu dinleyiciler bitince okunur
      if (!d.crossed) crossDragHapticSwitch(d);
    } else {
      d.pending = true;
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
      // iPhone'da navigator.vibrate ya yok ya da hiçbir şey yapmıyor: doğrudan haptic yöntemine geç
      if (IS_IOS) {
        this.iosHaptic(pattern);
        return;
      }
      try {
        if (window.navigator && typeof window.navigator.vibrate === "function") {
          window.navigator.vibrate(pattern);
        }
      } catch (e) {
        // yoksay
      }
    }

    // iOS 18+ Safari'de "switch" checkbox'ın etiketine tıklamak sistemin dokunsal tıkını tetikler
    // (ios-haptics kütüphanesindeki yöntem: her seferinde yeni, display:none etiket, <head> içinde).
    // Desen [titreşim, bekleme, titreşim, ...] ise her titreşim için bir tık atılır; ilki dokunma
    // olayının içinde anında atılır, çünkü iOS yalnızca kullanıcı etkileşimi sırasında izin veriyor.
    iosHaptic(pattern) {
      const steps = Array.isArray(pattern) ? pattern : [pattern];
      let offset = 0;
      for (let i = 0; i < steps.length; i += 2) {
        if (offset === 0) {
          hapticTick();
        } else {
          setTimeout(hapticTick, offset);
        }
        offset += (steps[i] || 0) + (steps[i + 1] || 0);
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

  // Final hedef değişince tüm hediye kademelerini ve WhatsApp bildirim eşiklerini aynı oranda ölçekle,
  // böylece çubuk, koleksiyon ve kupon her zaman aynı sayıları gösterir.
  function applyTargetScore(newTarget) {
    const tiers = config.rewardTiers || [];
    const currentFinal = (tiers.length && tiers[tiers.length - 1].score) || config.targetBirthdayScore || newTarget;
    const ratio = newTarget / currentFinal;
    if (ratio !== 1) {
      const scale = (v) => Math.round((v * ratio) / 100) * 100;
      tiers.forEach((t) => {
        t.score = scale(t.score);
      });
      if (tiers.length) tiers[tiers.length - 1].score = newTarget;
      (config.whatsappNotifications || []).forEach((w) => {
        w.score = scale(w.score);
      });
    }
    config.targetBirthdayScore = newTarget;

    PERSONA_CATALOG.forEach((p) => {
      const tier = tiers.find((t) => Array.isArray(t.unlockedFaces) && t.unlockedFaces.includes(p.key));
      p.unlockScore = tier ? tier.score : 0;
    });
  }

  function personaRoleText(p) {
    return p.unlockScore > 0 ? `${p.unlockScore} Puan Ödülü • ${p.role}` : p.role;
  }

  function loadSavedCustomizations() {
    try {
      const raw = safeStorage.getItem(STORAGE_KEY_CUSTOM);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.boyfriendName) config.boyfriendName = saved.boyfriendName;
      if (saved.targetBirthdayScore) applyTargetScore(Number(saved.targetBirthdayScore));
      if (saved.rewardText && config.coupon) config.coupon.rewardText = saved.rewardText;
      if (typeof saved.photoDataUrl === "string" && saved.photoDataUrl.startsWith("data:image")) {
        config.photos.main = saved.photoDataUrl;
      }
    } catch (e) {
      console.warn("Özel ayarlar okunamadı:", e);
    }
  }

  applyTargetScore(config.targetBirthdayScore || 10000);
  loadSavedCustomizations();

  const loadedImages = {};

  // Kumru / Şambali güçlü bloklarının köşe rozetleri (şeffaf PNG ikonlar)
  const FOOD_ICONS = {};
  [
    ["kumru", "assets/food/kumru.png"],
    ["sambali", "assets/food/sambali.png"]
  ].forEach(([key, src]) => {
    const img = new Image();
    img.onload = () => {
      // İkon geldi: tahta ve tepsi yeniden çizilsin
      state.boardDirty = true;
      state.trayDirty = true;
    };
    img.src = src;
    FOOD_ICONS[key] = img;
  });
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
      "kumru",
      "sambali",
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
      "mindblown",
      "kumru",
      "sambali"
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

  // <img> etiketleri için: özel fotoğraf yüklendiyse her karakterde o, yoksa karakterin kendi yüzü
  function photoSrcFor(key) {
    const photos = config.photos || {};
    if (photos.main && photos.main.startsWith("data:image")) return photos.main;
    return photos[key] || photos.happy || "assets/faces/metehan_happy.jpg";
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
    returning: null, // geçersiz bırakılan bloğun tepsiye dönüş animasyonu
    particles: [],
    floatingTexts: [], // 5. Madde: Tahta üstü çizgi roman balonları
    confetti: [],      // Tam ekran doğum günü konfeti yağmuru
    confettiActive: false,
    shownWaScores: new Set(), // Gösterilmiş WhatsApp bildirim skorları
    tierJustUnlocked: false, // Bu hamlede yeni hediye açıldıysa o cümle ezilmesin
    serbetActive: false, // Şambali bloğu patladı: bir sonraki satır patlatma 2 kat puan
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
    uiSerbetBadge: document.getElementById("ui-serbet-badge"),
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

    // Özel Güçlü (Event) Blok Şansı (Gym / Mangal / Trip) — yalnızca puanla açılmış olanlar
    const eventChance = config.eventBlockChance ?? 0.28;
    const events = [
      { mood: "gym", eventType: "gym", badge: "💪" },
      { mood: "mangal", eventType: "mangal", badge: "🔥" },
      { mood: "crying", eventType: "trip", badge: "😭" },
      { mood: "kumru", eventType: "kumru", badge: "🥪" },
      { mood: "sambali", eventType: "sambali", badge: "🍮" }
    ].filter((ev) => state.unlockedFaces.has(ev.mood));
    if (events.length > 0 && Math.random() < eventChance) {
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
    happy: { emoji: "😊", tag: "Hayran & İtaatkar", cls: "mood-happy" },
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
    panic: { emoji: "🥵", tag: "Sıkıştı & Terliyor!", cls: "mood-panic" },
    kumru: { emoji: "🥪", tag: "İzmir Kumrucusu", cls: "mood-happy" },
    sambali: { emoji: "🍮", tag: "Şerbetli Mola", cls: "mood-happy" }
  };

  // Henüz puanla açılmamış bir karakter yüzü istenirse, açık olan benzer bir yüzle değiştir
  const LOCKED_MOOD_FALLBACK = {
    gym: "cool",
    mangal: "party",
    crying: "panic",
    broke: "panic",
    king: "love",
    mindblown: "love",
    kumru: "party",
    sambali: "love"
  };
  function resolveUnlockedMood(mood) {
    if (mood === "guilty") {
      // "guilty" ağlayan Metehan fotoğrafını kullanır
      return state.unlockedFaces.has("crying") ? mood : "sorry";
    }
    if (LOCKED_MOOD_FALLBACK[mood] && !state.unlockedFaces.has(mood)) {
      return LOCKED_MOOD_FALLBACK[mood];
    }
    return mood;
  }

  function setManitaMood(mood, customQuote = null) {
    mood = resolveUnlockedMood(mood);
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
  // style: "bubble" (kutulu çizgi roman balonu), "score" (uçan +puan), "banner" (büyük özel yazı)
  function spawnFloatingComicText(text, x, y, color = "#ffcc29", style = "bubble") {
    state.floatingTexts.push({
      style,
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
  // Kombo ve özel durum ayarları (dengelemek için tek yer)
  const COMBO_GRACE_MOVES = 3; // bu kadar hamle üst üste satır patlamazsa kombo biter
  const COMBO_STEP = 0.2; // her kombo adımı satır puanına +%20
  const COMBO_MAX_MULT = 4; // en fazla x4
  const PERFECT_CLEAR_BONUS = 500; // tahta tamamen temizlenince
  const ESCAPE_FILL_RATIO = 0.75; // patlamadan önce bu kadar doluysa "son anda kurtuldun"

  function placePieceOnBoard(trayIndex, startR, startC) {
    const piece = state.tray[trayIndex];
    if (!piece) return false;
    if (!canPlaceAt(state.board, piece.matrix, startR, startC)) return false;

    state.lastMoveTime = performance.now();
    state.tierJustUnlocked = false;
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
      // Block Blast gibi: kombo, satır patlatmayan ilk hamlede değil, COMBO_GRACE_MOVES
      // hamle üst üste patlatma olmazsa biter
      state.noClearMoves++;
      if (state.noClearMoves >= COMBO_GRACE_MOVES) state.streak = 0;
      updateStreakBadge();

      const occupancy = getBoardOccupancyRatio();
      const isCorner =
        (startR === 0 && startC === 0) ||
        (startR === 0 && startC + piece.cols === GRID_SIZE) ||
        (startR + piece.rows === GRID_SIZE && startC === 0) ||
        (startR + piece.rows === GRID_SIZE && startC + piece.cols === GRID_SIZE);

      if (state.tierJustUnlocked) {
        // Yeni hediye cümlesi ekranda kalsın
      } else if (occupancy >= 0.65) {
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

    saveGameState();
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
    // "Son anda kurtuldun" için patlamadan önceki doluluk
    const fillBeforeClear = getBoardOccupancyRatio();
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

    // Kumru bloğu: İzmir usulü çapraz patlama. Satırla patlıyorsa bulunduğu sütun,
    // sütunla patlıyorsa bulunduğu satır da temizlenir (artı şekli).
    let kumruExtraCells = 0;
    Array.from(toClearMap.values()).forEach(({ r, c, cell }) => {
      if (!cell || cell.eventType !== "kumru") return;
      const clearColumn = fullRows.includes(r);
      for (let i = 0; i < GRID_SIZE; i++) {
        const rr = clearColumn ? i : r;
        const cc = clearColumn ? c : i;
        const key = `${rr},${cc}`;
        if (!toClearMap.has(key) && state.board[rr][cc]) {
          toClearMap.set(key, { r: rr, c: cc, cell: state.board[rr][cc] });
          kumruExtraCells++;
        }
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

    if (triggeredEvents.has("kumru")) {
      eventBonusScore += 60 + kumruExtraCells * 15;
      sfx.playGymSmash();
      specialMood = "kumru";
      specialQuote = quoteDeck.pick("eventKumru");
      spawnFloatingComicText("🥪 İZMİR USULÜ ÇAPRAZ!", centerX, centerY - 18, "#ffb703");
    }

    // Şambali: bu patlatma önceki şerbeti kullanır mı? (kendi açtığı şerbet bir sonrakine kalır)
    const serbetUsed = state.serbetActive;
    if (serbetUsed) state.serbetActive = false;
    if (triggeredEvents.has("sambali")) {
      state.serbetActive = true;
      sfx.playCashRegister();
      specialMood = "sambali";
      specialQuote = quoteDeck.pick("eventSambali");
      spawnFloatingComicText("🍮 SONRAKİ PATLATMA x2!", centerX, centerY + 14, "#ffcf6e");
    }

    if (triggeredEvents.has("trip")) {
      // Trip Bloğu: +150 Ekstra Puan
      eventBonusScore += 150;
      specialMood = "crying";
      specialQuote = quoteDeck.pick("eventTrip");
      spawnFloatingComicText("😭 TRİP ÇÖZÜLDÜ +150!", centerX, centerY - 35, "#ff477e");
    }

    // Tahta tamamen boşaldı mı (gym etkisi dahil)?
    const perfectClear = state.board.every((row) => row.every((cell) => cell === null));

    // Puan Hesaplama: satır puanı kombo çarpanıyla büyür
    const baseLineScore = totalLines * 100 * totalLines;
    const comboMult = Math.min(COMBO_MAX_MULT, 1 + COMBO_STEP * Math.max(0, state.streak - 1));
    const faceBonus = faceClearedCount * 35;
    const gained =
      Math.round(baseLineScore * comboMult * (serbetUsed ? 2 : 1)) +
      faceBonus +
      eventBonusScore +
      (perfectClear ? PERFECT_CLEAR_BONUS : 0);
    addScore(gained);

    // Yazı yerleşimi: balon patlayan satırda, uçan puan hemen altında, özel yazı tahtanın öbür yarısında
    const size = state.boardPixelSize;
    const textY = Math.max(40, Math.min(size - 72, centerY));
    const bannerY = centerY < size / 2 ? size * 0.82 : size * 0.18;
    spawnFloatingComicText(
      `+${gained.toLocaleString("tr-TR")}${serbetUsed ? " 🍮x2" : ""}`,
      centerX,
      textY + 36,
      "#ffcc29",
      "score"
    );

    // Nadir durumlar için özel büyük yazılar
    const special = config.specialPopups || {};
    const pickText = (arr, fallback) => (Array.isArray(arr) && arr.length ? arr[Math.floor(Math.random() * arr.length)] : fallback);
    let bannerShown = false;
    if (perfectClear) {
      spawnConfettiBurst(140);
      sfx.playFanfare();
      bannerShown = true; // büyük "TAHTA TERTEMİZ" gösterisi var
    } else if (fillBeforeClear >= ESCAPE_FILL_RATIO) {
      spawnFloatingComicText(pickText(special.escape, "SON ANDA KURTULDUN! 😱"), size / 2, bannerY, "#7bf1cc", "banner");
      bannerShown = true;
    } else if (totalLines >= 3) {
      spawnFloatingComicText(pickText(special.bigClear, "METEHAN ŞOKTA! 🤯"), size / 2, bannerY, "#ff85a2", "banner");
      bannerShown = true;
    }

    // Genel Çizgi Roman Balonu (5. Madde): özel yazı yoksa ve güçlü blok balonu çıkmadıysa
    if (!bannerShown && triggeredEvents.size === 0) {
      const popups = config.comicPopups || ["ŞAAAK! 💥", "YİNE HAKLISIN! 👑"];
      const popupText = popups[Math.floor(Math.random() * popups.length)];
      spawnFloatingComicText(popupText, centerX, textY);
    }

    sfx.playClear(totalLines, state.streak);
    updateStreakBadge();

    // Konuşma Balonu ve Büyük Kombo Gösterisi
    let quote = specialQuote;
    let targetMood = specialMood || "love";

    if (perfectClear) {
      quote = quoteDeck.pick("perfectClear", ["Tahtayı tertemiz yaptın canım, Metehan şokta! 🎂"]);
      targetMood = "king";
    } else if (!quote) {
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

    if (!state.tierJustUnlocked) {
      setManitaMood(targetMood, quote);
    }

    if (perfectClear || totalLines >= 2 || state.streak >= 2 || triggeredEvents.size > 0) {
      triggerBoardShake();
      const title = perfectClear
        ? "TAHTA TERTEMİZ! 🎂"
        : state.streak >= 2
        ? `KOMBO ${state.streak}!`
        : totalLines >= 2
        ? `${totalLines} SATIR!`
        : `ÖZEL METEHAN ŞOV! 💥`;
      // Yalnızca kombo yüzünden açılıyorsa sade göster (yüz/alt yazı yok), tahta ve uçan puan görünsün
      const compact = !perfectClear && totalLines < 2 && triggeredEvents.size === 0;
      showComboShowcase(title, quote, targetMood, perfectClear ? 3 : comboLevel(state.streak), compact);
    }
  }

  // Kombo görsel seviyesi: 0 yok, 1 (2-4), 2 (5-9), 3 (10+)
  function comboLevel(streak) {
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    if (streak >= 2) return 1;
    return 0;
  }

  function triggerBoardShake() {
    dom.boardFrame.classList.remove("screen-shake");
    void dom.boardFrame.offsetWidth;
    dom.boardFrame.classList.add("screen-shake");
  }

  let comboTimer = null;
  function showComboShowcase(title, subtitle, avatarMood = "love", level = 0, compact = false) {
    avatarMood = resolveUnlockedMood(avatarMood);
    dom.comboShowcase.classList.toggle("compact", compact);
    dom.comboShowcase.classList.remove("combo-l1", "combo-l2", "combo-l3");
    if (level > 0) dom.comboShowcase.classList.add(`combo-l${level}`);
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
      dom.waMessageText.textContent = waItem.message || waItem.text || "";
    }
    if (dom.waAvatarCanvas) {
      const ctx = dom.waAvatarCanvas.getContext("2d");
      const size = dom.waAvatarCanvas.width;
      ctx.clearRect(0, 0, size, size);
      drawBoyfriendAvatar(ctx, size / 2, size / 2, size / 2 - 2, waItem.avatarMood || waItem.mood || "love");
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
        state.tierJustUnlocked = true;
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
      dom.uiGoalNumbers.textContent = `${state.score.toLocaleString("tr-TR")} / ${nextTier.score.toLocaleString("tr-TR")}`;
    } else {
      dom.uiGoalLabel.textContent = "👑 VIP Doğum Günü Kuponu Hazır!";
      dom.uiGoalNumbers.textContent = `${state.score.toLocaleString("tr-TR")} Puan (MAX)`;
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
      while (state.score >= state.nextBonusScore) {
        state.bombCount++;
        state.rerollCount++;
        state.nextBonusScore += config.bonusJokerEveryScore || 900;
      }
      updateJokerButtons();
    }

    updateWalletProgressAndTiers();
    checkWhatsAppNotifications();
  }

  function updateSerbetBadge() {
    if (dom.uiSerbetBadge) dom.uiSerbetBadge.classList.toggle("hidden", !state.serbetActive);
  }

  function updateStreakBadge() {
    if (state.streak >= 2) {
      dom.uiStreakBadge.textContent = `🔥 KOMBO x${state.streak}`;
      dom.uiStreakBadge.classList.remove("hidden");
    } else {
      dom.uiStreakBadge.classList.add("hidden");
    }
    // Kombo sürerken tahta çevresinde nokta ışıklar (Block Blast gibi); bitince söner
    dom.boardFrame.classList.toggle("combo-active", state.streak >= 2);
    dom.boardFrame.classList.toggle("combo-hot", state.streak >= 5);
    updateSerbetBadge();
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
    state.tierJustUnlocked = false;
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
    // Boş alana atılan bomba puan vermesin
    addScore(cleared > 0 ? cleared * 25 + 50 : 0);
    const quote = quoteDeck.pick("bombUsed");
    if (!state.tierJustUnlocked) setManitaMood("sorry", quote);
    spawnFloatingComicText("💐 ÖZÜR DİLERİM!", (centerC + 0.5) * state.cellSize, (centerR + 0.5) * state.cellSize);
    showComboShowcase("ÖZÜR DİLERİM CANIM! 💐", quote, "sorry");
    saveGameState();
  }

  // Joker 2: "Ben Hallederim Canım" (1x1 Kolay Bloklar)
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
    saveGameState();
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
    showComboShowcase("TORPİL AKTİF! 👑", "SEN HEP HAKLISIN BİTANEM!", "king");
    saveGameState();
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

    // 3. Kral Metehan Portresi
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

    const ts = tierScoreText;
    const tierItems = [
      `✅ 🥪 İzmir Kumrusu + Ayran (${ts(1)} Puan Barajı)`,
      `✅ 🍮 Kahve + Kaymaklı Şambali (${ts(2)} Puan Barajı)`,
      `✅ 🍽️ Lüks Akşam Yemeği (${ts(3)} Puan Barajı)`,
      `✅ 👑 VIP Tam Paket + %100 Haklılık Garantisi (${ts(4)} Puan)`
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
    const rewardText =
      (config.coupon && config.coupon.rewardText) ||
      "Bu kuponla Metehan'dan 1 adet lüks akşam yemeği, sınırsız kahve/tatlı ve tartışmasız %100 HAKLILIK hakkı kazandın!";
    // Satır sonlarını koru (her paragrafı ayrı sar), boş satırları yarım boşluk say;
    // metin kutuya sığana kadar yazı boyutunu küçült.
    const paragraphs = String(rewardText).split(/\n/);
    const maxTextH = 180;
    let fontSize = 26;
    let layout = [];
    for (; fontSize >= 14; fontSize -= 1) {
      ctx.font = `700 ${fontSize}px 'Nunito', sans-serif`;
      const lineH = fontSize * 1.38;
      layout = [];
      let h = 0;
      paragraphs.forEach((para) => {
        if (para.trim() === "") {
          if (layout.length > 0) h += lineH * 0.5;
          return;
        }
        wrapCanvasLines(ctx, para.trim(), W - 240).forEach((ln) => {
          layout.push({ text: ln, y: h });
          h += lineH;
        });
      });
      if (h <= maxTextH) break;
    }
    const textTop = 950 + fontSize * 0.69;
    layout.forEach((ln) => {
      if (ln.y <= maxTextH) ctx.fillText(ln.text, W / 2, textTop + ln.y);
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

  // Hediye kademesinin puanını config'ten okunur biçimde döndürür (örn. 10.000)
  function tierScoreText(idx) {
    const tiers = config.rewardTiers || [];
    const t = tiers[idx] || tiers[tiers.length - 1];
    return (t ? t.score : config.targetBirthdayScore || 0).toLocaleString("tr-TR");
  }

  function shareCouponViaWhatsApp() {
    sfx.playAvatarBoop();
    const scoreVal = Math.max(state.score, state.bestScore, config.targetBirthdayScore || 10000);
    const bf = config.boyfriendName || "Metehan";
    const ts = tierScoreText;
    const msg =
      `🚨 *RESMİ DOĞUM GÜNÜ SENEDİ BİLDİRİMİ* 🚨\n\n` +
      `Sayın ${bf}, *Damla Blast* oyununda *${scoreVal.toLocaleString("tr-TR")} Puan* yaparak bütün doğum günü ödüllerini resmen kazandım! 🎂👑\n\n` +
      `*Kazanılan Resmi Haklarım:*\n` +
      `✅ 🥪 İzmir Kumrusu + Ayran (${ts(1)} Puan)\n` +
      `✅ 🍮 Kaymaklı Şambali + Kahve (${ts(2)} Puan)\n` +
      `✅ 🍽️ Lüks Akşam Yemeği (${ts(3)} Puan)\n` +
      `✅ 👑 %100 Tartışmasız Haklılık Garantisi (${ts(4)} Puan)\n\n` +
      `*Not:* ${bf.toUpperCase()} ONAYLIDIR, İTİRAZ EDİLEMEZ! 😎🎂❤️`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  // 📸 #5: Karakter Kartı Büyütme & İnceleme Modalı
  function openPersonaDetailModal(persona) {
    if (!persona || !dom.dialogPersonaDetail) return;
    sfx.playAvatarBoop();
    state.activePersonaDetail = persona;

    const src = photoSrcFor(persona.key);
    if (dom.personaDetailImg) {
      dom.personaDetailImg.src = src;
      dom.personaDetailImg.alt = persona.name;
    }
    if (dom.personaDetailName) {
      dom.personaDetailName.textContent = persona.name;
    }
    if (dom.personaDetailRole) {
      dom.personaDetailRole.textContent = personaRoleText(persona) || "Özel Metehan Karakteri";
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
        <span style="font-weight:900;color:#ffcc29">${isReached ? "✅ AÇILDI" : `${t.score.toLocaleString("tr-TR")} P`}</span>
      `;
      dom.collectionTiersList.appendChild(row);
    });

    dom.collectionFacesGrid.innerHTML = "";
    // Kartlar açılma puanına göre sıralı (aynı puandakiler katalog sırasını korur)
    PERSONA_CATALOG.slice()
      .sort((a, b) => a.unlockScore - b.unlockScore)
      .forEach((p) => {
      const unlocked = state.unlockedFaces.has(p.key) || state.bestScore >= p.unlockScore || state.score >= p.unlockScore;
      const src = photoSrcFor(p.key);
      const card = document.createElement("div");
      card.className = `face-collect-item ${unlocked ? "unlocked" : "locked"}`;
      card.innerHTML = `
        <img src="${src}" alt="${p.name}" />
        <span>${unlocked ? `🔍 ${p.name}` : `🔒 ${p.unlockScore.toLocaleString("tr-TR")}P`}</span>
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

      // Kumru / Şambali bloklarında rozet olarak yiyecek ikonu (tepsideki küçük bloklarda da görünsün)
      const foodIcon = cellMeta.eventType && FOOD_ICONS[cellMeta.eventType];
      if (foodIcon && foodIcon.complete && foodIcon.naturalWidth && size >= 14) {
        const iconSize = size * 0.55;
        ctx.drawImage(foodIcon, x + size - iconSize, y + size - iconSize, iconSize, iconSize);
      } else if (badge && size >= 24) {
        // Eğer Özel Etkinlik Bloğuysa (Gym 💪 / Mangal 🔥 / Trip 😭) sağ alt köşesine rozet çiz!
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
    // Sonraki kareyi en başta iste: bir çizim hatası döngüyü durdurup oyunu dondurmasın
    requestAnimationFrame(renderLoop);
    state.timeSec = timestamp / 1000;
    // Ekran yenileme hızından bağımsız animasyon: 60Hz = 1.0, 120Hz = 0.5, 30Hz = 2.0
    const rawDt = lastFrameTs ? (timestamp - lastFrameTs) / 16.667 : 1;
    state.dt = Math.max(0.25, Math.min(3, rawDt));
    lastFrameTs = timestamp;
    if (debugPanel.on) debugOnFrame(timestamp);
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
    updateReturnAnim(performance.now());
    renderTray(dpr);
    renderLiveAvatars();
    renderConfetti(dpr);
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

      if (ft.style === "score" || ft.style === "banner") {
        // Kutusuz, konturlu büyük yazı: uçan "+puan" veya özel durum yazısı
        const size = ft.style === "score" ? Math.round(state.cellSize * 0.62) : Math.round(state.cellSize * 0.5);
        ctx.font = `900 ${size}px 'Fredoka', 'Nunito', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = Math.max(3, size * 0.16);
        ctx.strokeStyle = "rgba(40, 8, 30, 0.9)";
        ctx.strokeText(ft.text, 0, 0);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, 0, 0);
        ctx.restore();
        continue;
      }

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
      if (state.returning && state.returning.trayIndex === i) continue;

      if (piece.scaleAnim < 1) {
        piece.scaleAnim = Math.min(1, piece.scaleAnim + 0.14 * (state.dt || 1));
        if (piece.scaleAnim < 1) stillAnimating = true;
      }

      // Tepsideki bloklar tahta hücresinin ~%62'si kadar; küçük ekranlarda slota sığacak kadar küçülür
      // Block Blast videosunda tepsideki kare, tahta karesinin ~%45'i (21 pt / 47 pt)
      const baseCell = Math.min(state.cellSize * 0.45, (slotWidth - 12) / piece.cols, (rect.height - 12) / piece.rows);
      if (!(baseCell > 2)) {
        // Tepsi henüz ölçülemedi (yerleşim/ekran döndürme anı): sonraki karede tekrar dene
        stillAnimating = true;
        continue;
      }
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

    // Retina ekranlarda net görünsün: tampon dpr kadar büyük, çizim 340x260 mantıksal koordinatta
    const dpr = window.devicePixelRatio || 1;
    if (dom.cakeCanvas.width !== Math.round(W * dpr)) {
      dom.cakeCanvas.width = Math.round(W * dpr);
      dom.cakeCanvas.height = Math.round(H * dpr);
    }
    ctx.setTransform(dom.cakeCanvas.width / W, 0, 0, dom.cakeCanvas.height / H, 0, 0);
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
  // Gerçek Block Blast'taki gibi dokunmatikte blok parmaktan biraz hızlı gider; parmak az
  // hareket ederken blok tahtaya çabuk ulaşır. Hissiyat ayarı için yalnızca bu sabitler yeterli.
  // Yusuf'un telefonda test panelinden bulduğu değerler (hız 2.2, kaldırma 1.1)
  const DRAG_SPEED_TOUCH_DEFAULT = 2.2;
  const DRAG_SPEED_MOUSE = 1.0;
  // Block Blast videosunda alınan bloğun merkezi parmağın ~2,3 tahta karesi yukarısında duruyordu
  // (~107-110 pt, kare 47 pt); hız 2.2 ile birlikte telefonda en iyi his 1,1 karede bulundu.
  const LIFT_CELLS_TOUCH_DEFAULT = 1.1;
  const STORAGE_KEY_FEEL = "damla_blast_drag_feel_v1";
  // Test panelinden telefonda canlı ayarlanabilir; ayar o cihaza kaydedilir
  const dragFeel = { speed: DRAG_SPEED_TOUCH_DEFAULT, liftCells: LIFT_CELLS_TOUCH_DEFAULT };
  try {
    const savedFeel = JSON.parse(safeStorage.getItem(STORAGE_KEY_FEEL) || "null");
    if (savedFeel && savedFeel.speed > 0) dragFeel.speed = Number(savedFeel.speed);
    if (savedFeel && savedFeel.liftCells >= 0) dragFeel.liftCells = Number(savedFeel.liftCells);
  } catch (e) {
    // yoksay
  }
  // Geçersiz bırakılan blok tepsiye bu sürede kayarak döner (videoda ~150-200 ms, yavaşlayarak)
  const RETURN_ANIM_MS = 180;

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
    const speed = pos.isTouch ? dragFeel.speed : DRAG_SPEED_MOUSE;
    return {
      x: dragState.startX + dx * speed,
      y: dragState.startY - dragState.liftOffset + dy * speed
    };
  }

  let lastTouchStartTs = 0;
  function handleTrayPointerDown(e) {
    const isTouchEvent = !!e.touches;
    if (isTouchEvent) {
      lastTouchStartTs = performance.now();
    } else if (performance.now() - lastTouchStartTs < 1000) {
      // iOS dokunuştan sonra sahte mousedown üretebilir (haptic yüzeyinde touchstart engellenmiyor)
      return;
    }
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

    // iOS titreşim yüzeyinde touchstart engellenmemeli: engellenirse WebKit switch'i takip etmez.
    // Kaydırmayı zaten touch-action:none engelliyor.
    if (!(dragHaptic.host && e.target === dragHaptic.host)) e.preventDefault();
    sfx.playPickup();
    state.lastMoveTime = performance.now();

    // Önceki blok hâlâ tepsiye dönüyorsa dönüşü hemen bitir
    if (state.returning) finishReturnAnim();
    const liftOffset = pos.isTouch ? Math.round(state.cellSize * dragFeel.liftCells) : 18;
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
      // Blok yeni bir kareye oturdu: iPhone'da küçük bir tık
      requestDragHapticTick();
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
    // iOS titreşim yüzeyinde touchmove engellenmemeli (switch takibi bozulur); kaydırmayı touch-action:none engelliyor
    if (!(dragHaptic.host && e.target === dragHaptic.host)) e.preventDefault();
    if (debugPanel.on) debugOnMove(e);
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
    const { trayIndex, valid, snapRow, snapCol, piece, x, y } = state.dragging;
    state.dragging = null;
    state.trayDirty = true;
    state.boardViewDirty = true;

    if (valid) {
      syncDragCanvasTransform();
      placePieceOnBoard(trayIndex, snapRow, snapCol);
    } else {
      // Block Blast gibi: blok tam boyutta tepsideki yerine kayarak döner, sonra küçülür
      const rect = dom.trayContainer.getBoundingClientRect();
      state.returning = {
        trayIndex,
        piece,
        fromX: x,
        fromY: y,
        toX: rect.left + (rect.width / 3) * (trayIndex + 0.5),
        toY: rect.top + rect.height / 2,
        start: performance.now()
      };
    }
  }

  function setDragCanvasCenter(piece, cx, cy) {
    const cs = state.cellSize;
    const left = cx - (piece.cols * cs) / 2;
    const top = cy - (piece.rows * cs) / 2;
    dom.dragCanvas.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
  }

  function finishReturnAnim() {
    state.returning = null;
    state.trayDirty = true;
    if (!state.dragging) syncDragCanvasTransform();
  }

  function updateReturnAnim(now) {
    const ret = state.returning;
    if (!ret) return;
    const t = Math.min(1, (now - ret.start) / RETURN_ANIM_MS);
    const ease = 1 - Math.pow(1 - t, 3); // yavaşlayarak dur
    setDragCanvasCenter(
      ret.piece,
      ret.fromX + (ret.toX - ret.fromX) * ease,
      ret.fromY + (ret.toY - ret.fromY) * ease
    );
    if (t >= 1) finishReturnAnim();
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

    // Hediye çubuğu çentikleri: config'teki kademelerden, final hedefe oranla
    const track = dom.uiGoalFill.parentElement;
    track.querySelectorAll(".tier-tick").forEach((el) => el.remove());
    const target = config.targetBirthdayScore || 10000;
    (config.rewardTiers || []).slice(1).forEach((t) => {
      const tick = document.createElement("span");
      tick.className = "tier-tick";
      tick.style.left = `${Math.min(97, (t.score / target) * 100)}%`;
      tick.title = `${t.score.toLocaleString("tr-TR")} Puan: ${t.rewardShort}`;
      tick.textContent = String(t.rewardShort || "🎁").split(" ")[0];
      track.appendChild(tick);
    });

    const bombImg = dom.btnJokerBomb.querySelector("img");
    if (bombImg) bombImg.src = photoSrcFor("sorry");
    const rerollImg = dom.btnJokerReroll.querySelector("img");
    if (rerollImg) rerollImg.src = photoSrcFor("cool");
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
    state.serbetActive = false;
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
    saveGameState();
  }

  // ============================================================================
  // DEVAM EDEN OYUNU KAYDETME / GERİ YÜKLEME (Sayfa yenilenince oyun kaybolmasın)
  // ============================================================================
  function serializeCell(cell) {
    if (!cell) return null;
    return { color: cell.color.id, hasFace: cell.hasFace, eventType: cell.eventType || null, badge: cell.badge || null };
  }

  function findPaletteColor(id) {
    return PALETTE.find((p) => p.id === id) || PALETTE[0];
  }

  function saveGameState() {
    try {
      safeStorage.setItem(
        STORAGE_KEY_SAVE,
        JSON.stringify({
          board: state.board.map((row) => row.map(serializeCell)),
          tray: state.tray.map((p) =>
            p ? { matrix: p.matrix, cellDataMap: p.cellDataMap, color: p.color.id } : null
          ),
          score: state.score,
          streak: state.streak,
          noClearMoves: state.noClearMoves,
          bombCount: state.bombCount,
          rerollCount: state.rerollCount,
          nextBonusScore: state.nextBonusScore,
          currentTierIndex: state.currentTierIndex,
          couponUnlocked: state.couponUnlocked,
          serbetActive: state.serbetActive,
          shownWaScores: Array.from(state.shownWaScores)
        })
      );
    } catch (e) {
      // yoksay: kayıt yapılamazsa oyun yine de oynanır
    }
  }

  function restoreGameState() {
    try {
      const raw = safeStorage.getItem(STORAGE_KEY_SAVE);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved.board) || saved.board.length !== GRID_SIZE || !Array.isArray(saved.tray)) {
        return false;
      }

      state.board = saved.board.map((row) =>
        row.map((cell) =>
          cell
            ? { color: findPaletteColor(cell.color), hasFace: cell.hasFace, eventType: cell.eventType, badge: cell.badge }
            : null
        )
      );
      state.tray = [0, 1, 2].map((i) => {
        const p = saved.tray[i];
        if (!p || !Array.isArray(p.matrix)) return null;
        return {
          matrix: p.matrix,
          cellDataMap: p.cellDataMap,
          color: findPaletteColor(p.color),
          rows: p.matrix.length,
          cols: p.matrix[0].length,
          scaleAnim: 0.1
        };
      });
      state.score = Number(saved.score) || 0;
      state.streak = Number(saved.streak) || 0;
      state.noClearMoves = Number(saved.noClearMoves) || 0;
      state.bombCount = Number(saved.bombCount) || 0;
      state.rerollCount = Number(saved.rerollCount) || 0;
      state.nextBonusScore = Number(saved.nextBonusScore) || config.bonusJokerEveryScore || 900;
      state.currentTierIndex = Number(saved.currentTierIndex) || 0;
      state.couponUnlocked = !!saved.couponUnlocked;
      state.serbetActive = !!saved.serbetActive;
      state.shownWaScores = new Set(saved.shownWaScores || []);
      state.bombTargetingMode = false;
      state.particles = [];
      state.floatingTexts = [];
      state.boardDirty = true;
      state.trayDirty = true;
      state.liveAvatarDirty = true;
      state.lastMoveTime = performance.now();

      if (state.tray.every((p) => p === null)) spawnNewTray();

      dom.btnGiftCoupon.classList.toggle("unlocked", state.couponUnlocked);
      dom.uiCurrentScore.textContent = state.score.toLocaleString("tr-TR");
      updateWalletProgressAndTiers();
      updateStreakBadge();
      updateJokerButtons();
      setManitaMood("party", quoteDeck.pick("idle"));
      resizeCanvases();
      // Sıkışmış kayıt varsa torpil penceresi "HEMEN OYNA"ya basılınca açılır
      return true;
    } catch (e) {
      console.warn("Kayıtlı oyun okunamadı:", e);
      return false;
    }
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
    applyTargetScore(newTarget);
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
    if (IS_IOS) attachDragHaptic(dom.trayContainer);

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
      checkGameOverCondition();
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
        { mood: "party", quote: "İyi ki doğdun canım! Düdüğü senin için çalıyorum 🥳🎂" },
        { mood: "kumru", quote: "Kordon'a inip kumru yiyelim mi? Ayranlar benden canım 🥪" },
        { mood: "sambali", quote: "Bu oyun bitince kaymaklı şambali ısmarlıyorum bitanem 🍮" }
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

  // ============================================================================
  // GİZLİ TEST PANELİ (Ekran kare hızı, dokunma olay hızı, olay→kare gecikmesi, titreşim)
  // Açmak/kapatmak: giriş ekranındaki "sürüm" yazısına art arda 5 kez dokun veya adrese ?debug=1 ekle.
  // ============================================================================
  const STORAGE_KEY_DEBUG = "damla_blast_debug_panel";
  const debugPanel = {
    on: false,
    el: null,
    frames: [], // son 1 sn'deki kare zaman damgaları
    moves: [], // son 1 sn'deki touchmove zaman damgaları
    pendingMoveTs: null, // henüz bir kareye yansımamış en eski hareketin zamanı
    delays: [], // olay→kare gecikmeleri (ms)
    lastRender: 0
  };

  function debugOnMove(e) {
    const now = performance.now();
    debugPanel.moves.push(now);
    if (debugPanel.pendingMoveTs === null) {
      // touchmove'un tarayıcıya ulaştığı an; yoksa işleyicinin çalıştığı an
      const ts = e.timeStamp && e.timeStamp <= now ? e.timeStamp : now;
      debugPanel.pendingMoveTs = ts;
    }
  }

  function debugOnFrame(ts) {
    const now = performance.now();
    debugPanel.frames.push(now);
    if (debugPanel.pendingMoveTs !== null) {
      const delay = now - debugPanel.pendingMoveTs;
      // Sekme arka plandayken biriken uç değerleri sayma
      if (delay < 1000) debugPanel.delays.push(delay);
      if (debugPanel.delays.length > 60) debugPanel.delays.shift();
      debugPanel.pendingMoveTs = null;
    }
    const cutoff = now - 1000;
    while (debugPanel.frames.length && debugPanel.frames[0] < cutoff) debugPanel.frames.shift();
    while (debugPanel.moves.length && debugPanel.moves[0] < cutoff) debugPanel.moves.shift();
    if (now - debugPanel.lastRender < 400) return;
    debugPanel.lastRender = now;

    let worst = 0;
    for (let i = 1; i < debugPanel.frames.length; i++) {
      worst = Math.max(worst, debugPanel.frames[i] - debugPanel.frames[i - 1]);
    }
    const sortedDelays = debugPanel.delays.slice().sort((a, b) => a - b);
    const medianDelay = sortedDelays.length ? sortedDelays[Math.floor(sortedDelays.length / 2)] : 0;
    const iosMatch = /OS (\d+)[_.](\d+)/.exec(navigator.userAgent);
    const hapticMode = IS_IOS
      ? "iOS sürükleme switch"
      : typeof navigator.vibrate === "function"
      ? "navigator.vibrate"
      : "yok";
    debugPanel.textEl.textContent = [
      `sürüm ${APP_VERSION || "?"}  ·  ${iosMatch ? `iOS ${iosMatch[1]}.${iosMatch[2]}` : "iOS değil"}`,
      `ekran: ${debugPanel.frames.length} kare/sn  (en kötü ${worst.toFixed(0)} ms)`,
      `dokunma: ${debugPanel.moves.length} hareket/sn`,
      `olay→kare: ${medianDelay.toFixed(1)} ms (medyan)`,
      `dpr ${window.devicePixelRatio || 1}  ·  hız x${dragFeel.speed.toFixed(2)}  ·  kaldırma ${dragFeel.liftCells.toFixed(1)} kare`,
      `titreşim: ${hapticMode}`,
      `sürükleme tık: ${dragHaptic.crossed} / ${dragHaptic.requested} istek`
    ].join("\n");
  }

  function setDebugPanel(on) {
    debugPanel.on = on;
    try {
      if (on) window.localStorage.setItem(STORAGE_KEY_DEBUG, "1");
      else window.localStorage.removeItem(STORAGE_KEY_DEBUG);
    } catch (e) {
      // yoksay
    }
    if (on && !debugPanel.el) {
      const el = document.createElement("div");
      el.className = "debug-panel";
      const textEl = document.createElement("div");
      el.appendChild(textEl);

      // Sürükleme hissi ayarı: telefonda oynarken canlı değiştir, değer bu cihaza kaydedilir
      const controls = document.createElement("div");
      controls.className = "debug-controls";
      const saveFeel = () => safeStorage.setItem(STORAGE_KEY_FEEL, JSON.stringify(dragFeel));
      const addRow = (label, onMinus, onPlus) => {
        const row = document.createElement("div");
        const minus = document.createElement("button");
        minus.type = "button";
        minus.textContent = "−";
        const plus = document.createElement("button");
        plus.type = "button";
        plus.textContent = "+";
        const span = document.createElement("span");
        span.textContent = label;
        minus.addEventListener("click", () => {
          onMinus();
          saveFeel();
        });
        plus.addEventListener("click", () => {
          onPlus();
          saveFeel();
        });
        row.append(minus, span, plus);
        controls.appendChild(row);
      };
      const round2 = (v) => Math.round(v * 100) / 100;
      addRow(
        "hız",
        () => (dragFeel.speed = Math.max(0.8, round2(dragFeel.speed - 0.05))),
        () => (dragFeel.speed = Math.min(3, round2(dragFeel.speed + 0.05)))
      );
      addRow(
        "kaldırma",
        () => (dragFeel.liftCells = Math.max(0, round2(dragFeel.liftCells - 0.1))),
        () => (dragFeel.liftCells = Math.min(4, round2(dragFeel.liftCells + 0.1)))
      );
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "debug-reset";
      reset.textContent = "varsayılana dön";
      reset.addEventListener("click", () => {
        dragFeel.speed = DRAG_SPEED_TOUCH_DEFAULT;
        dragFeel.liftCells = LIFT_CELLS_TOUCH_DEFAULT;
        saveFeel();
      });
      controls.appendChild(reset);
      el.appendChild(controls);

      document.body.appendChild(el);
      debugPanel.el = el;
      debugPanel.textEl = textEl;
    }
    if (debugPanel.el) debugPanel.el.style.display = on ? "block" : "none";
  }

  function initDebugPanel() {
    let stored = false;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY_DEBUG) === "1";
    } catch (e) {
      // yoksay
    }
    if (/[?&]debug=1/.test(location.search) || stored) setDebugPanel(true);

    const versionEl = document.getElementById("app-version");
    if (!versionEl) return;
    let taps = 0;
    let tapTimer = null;
    versionEl.addEventListener("click", () => {
      taps++;
      clearTimeout(tapTimer);
      if (taps >= 5) {
        taps = 0;
        setDebugPanel(!debugPanel.on);
      } else {
        tapTimer = setTimeout(() => {
          taps = 0;
        }, 1800);
      }
    });
  }

  // ============================================================================
  // SÜRÜM ETİKETİ & OTOMATİK GÜNCELLEME
  // Ana ekrana eklenmiş uygulama veya açık kalan Safari sekmesi, açılınca sayfayı yeniden
  // indirmeden eski sürümü göstermeye devam edebiliyor. Açılışta ve uygulama öne geldiğinde
  // yayındaki index.html'deki sürümle karşılaştırıp gerekiyorsa yeni sürümü yükle.
  // ============================================================================
  const APP_VERSION = (() => {
    const s = document.querySelector('script[src*="game.js"]');
    const m = s && /[?&]v=(\d+)/.exec(s.getAttribute("src") || "");
    return m ? m[1] : null;
  })();
  const STORAGE_KEY_UPDATE_TRIED = "damla_blast_update_tried_v";

  let updateCheckInFlight = false;
  function checkForNewVersion() {
    if (!APP_VERSION || updateCheckInFlight || location.protocol === "file:") return;
    // Sürükleme ortasında veya bir pencere açıkken sayfayı yenileme
    if (state.dragging || document.querySelector("dialog[open]")) return;
    updateCheckInFlight = true;
    fetch(`${location.pathname}?update-check=${Date.now()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : ""))
      .then((html) => {
        const m = /game\.js\?v=(\d+)/.exec(html);
        if (!m || m[1] === APP_VERSION) return;
        // Aynı sürüm için yalnızca bir kez dene (yayın gecikirse sonsuz yenileme olmasın)
        let tried = null;
        try {
          tried = window.sessionStorage.getItem(STORAGE_KEY_UPDATE_TRIED);
          window.sessionStorage.setItem(STORAGE_KEY_UPDATE_TRIED, m[1]);
        } catch (e) {
          // yoksay
        }
        if (tried === m[1]) return;
        saveGameState();
        location.replace(`${location.pathname}?v=${m[1]}`);
      })
      .catch(() => {})
      .finally(() => {
        updateCheckInFlight = false;
      });
  }

  function init() {
    // Görselleri beklemeden oyunu hemen başlat; yüzler indikçe otomatik yerine oturur.
    syncUIFromConfig();
    bindEvents();
    if (!restoreGameState()) startNewGame();
    requestAnimationFrame(renderLoop);

    const playLabel = dom.btnStartGame.querySelector
      ? dom.btnStartGame.querySelector("span")
      : null;
    const originalLabel = playLabel ? playLabel.textContent : "";
    if (playLabel) playLabel.textContent = "METEHAN HAZIRLANIYOR…";

    reloadPhotos(() => {
      if (playLabel) playLabel.textContent = originalLabel;
    });

    const versionEl = document.getElementById("app-version");
    if (versionEl && APP_VERSION) versionEl.textContent = `sürüm ${APP_VERSION}`;
    initDebugPanel();
    setTimeout(checkForNewVersion, 1500);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForNewVersion();
    });
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) checkForNewVersion();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
