/**
 * ============================================================================
 * DAMLA BLAST: DOĞUM GÜNÜ ÖZEL - OYUN AYARLARI (CONFIG v2 - MEGA SÜRÜM)
 * ============================================================================
 */

window.DAMLA_CONFIG = {
  // 1. TEMEL İSİMLER VE HEDEF SKOR
  girlfriendName: "Damla",
  boyfriendName: "Metehan",
  birthdayAgeText: "🎂 İYİ Kİ DOĞDUN DAMLA! 🎂",
  targetBirthdayScore: 1500,

  // 2. METEHAN 12'Lİ YÜZ & KARAKTER PAKETİ
  photos: {
    main: "assets/faces/metehan_happy.jpg",
    happy: "assets/faces/metehan_happy.jpg",         // 1. Klasik Karizmatik Gülüş
    panic: "assets/faces/metehan_panic.jpg",         // 2. Sıkıştı & Terliyor
    love: "assets/faces/metehan_love.jpg",           // 3. Kalp Gözlü Hayran
    sorry: "assets/faces/metehan_sorry.jpg",         // 4. Güllü "Özür Dilerim Haklısın"
    cool: "assets/faces/metehan_cool.jpg",           // 5. Mercedes Güneş Gözlüklü "Ben Hallederim"
    gym: "assets/faces/metehan_gym.jpg",             // 6. Gym Bro (Mavi Şapka + AirPods + Dambıl)
    mangal: "assets/faces/metehan_mangal.jpg",       // 7. Mangalcı Şef Metehan
    crying: "assets/faces/metehan_crying.jpg",       // 8. Trip Yemiş / Ağlayan Metehan
    party: "assets/faces/metehan_party.jpg",         // 9. Doğum Günü Partisi Şapkalı
    broke: "assets/faces/metehan_broke.jpg",         // 10. Cüzdanı Ağlayan / Hesap Ödeyen
    king: "assets/faces/metehan_king.jpg",           // 11. Kral Tacı / Damat Metehan
    mindblown: "assets/faces/metehan_king.jpg"  // 12. Aklı Başından Gitmiş (Mega Kombo)
  },

  // 3. KAFA BLOKLARI VE JOKER AYARLARI
  faceBlockChance: 0.38,       // Bloklarda Metehan yüzü çıkma oranı
  eventBlockChance: 0.28,      // Kafa bloklarının Özel Güçlü (Gym / Mangal / Trip) olma oranı
  initialBombCount: 2,
  initialRerollCount: 2,
  bonusJokerEveryScore: 900,

  // 4. METEHAN'IN CÜZDANI & KARAKTER AÇMA AŞAMALARI (4. Madde - Alternatif D)
  rewardTiers: [
    {
      score: 0,
      title: "Başlangıç: Cüzdan Güvende 😎",
      walletStatus: "Cüzdan Rahat",
      rewardShort: "Sadece Kuru Kutlama",
      unlockedFaces: ["happy", "love", "panic", "sorry", "cool", "party"],
      unlockedPersonaName: "Klasik & Parti Metehan",
      quote: "Bakalım doğum günü hediyesi olarak benden ne koparacaksın Damla'm 😎"
    },
    {
      score: 300,
      title: "1. Aşama: ☕ Kahve Borcu Açıldı!",
      walletStatus: "Isınma Turu ☕",
      rewardShort: "☕ 1 Adet Kahve Borcu",
      unlockedFaces: ["gym"],
      unlockedPersonaName: "💪 Gym Bro Metehan (Dambıl Bloğu Aktif!)",
      quote: "300 puan mı?! Tamam kahveler benden! Ayrıca Gym Bro Metehan tahtaya indi 💪"
    },
    {
      score: 650,
      title: "2. Aşama: 🍰 Tatlı + Kahve Borcu!",
      walletStatus: "Hesap Kabarıyor 🍰",
      rewardShort: "🍰 Kahve + İstediğin Tatlı",
      unlockedFaces: ["mangal"],
      unlockedPersonaName: "🔥 Mangalcı Metehan (Joker Dolduran Blok Aktif!)",
      quote: "Damla yavaş oyna! Kahvenin yanına tatlı da eklendi, Mangalcı Metehan göreve başladı 🔥"
    },
    {
      score: 1050,
      title: "3. Aşama: 🍽️ Lüks Akşam Yemeği!",
      walletStatus: "Cüzdan Ağlıyor 💸",
      rewardShort: "🍽️ Yemek + Tatlı + Kahve",
      unlockedFaces: ["crying", "broke"],
      unlockedPersonaName: "😭 Trip Yemiş & Cüzdanı Ağlayan Metehan (3x Puan Bloğu!)",
      quote: "Ocağımı batırdın aşkım! Akşam yemeği de kilitlendi, cüzdanım hüngür hüngür ağlıyor 💸😭"
    },
    {
      score: 1500,
      title: "FİNAL: 👑 VIP Doğum Günü Kuponu!",
      walletStatus: "İflas & Tam İtaat 👑",
      rewardShort: "👑 VIP Tam Paket + %100 Haklılık",
      unlockedFaces: ["king", "mindblown"],
      unlockedPersonaName: "👑 Kraliyet Damat Metehan (Tüm Yüzler Açıldı!)",
      quote: "TEBRİKLER AŞKIM! Beni tamamen patlattın, VIP Doğum Günü Kuponun hazır! 🎂❤️"
    }
  ],

  // 5. SAHTE REKOR TABLOSU (Giriş Ekranı)
  leaderboard: [
    {
      rank: 1,
      badge: "👑",
      name: "Damla (Doğum Günü Kraliçesi)",
      score: "999.999",
      note: "Her zaman haklı & yenilmez"
    },
    {
      rank: 2,
      badge: "🤡",
      name: "Metehan",
      score: "3",
      note: "Sporda 100kg basar ama bu oyunda 3 puan"
    }
  ],

  // 6. AKILLI & TEKRARSIZ DİYALOG HAVUZU (65+ Kişiselleştirilmiş Replik)
  quotes: {
    idle: [
      "İyi ki doğdun Damla'm! Bugün bütün bloklar ve ben sana fedayız ❤️",
      "Kraliçem hamle düşünüyor, herkes sussun 👑",
      "Kolumdaki dövme kadar karmaşık bir strateji kuruyorsun şu an!",
      "Sporda 100 kilo bench basıyorum ama senin şu bakışların daha ağır geliyor 😍",
      "Mercedes'in anahtarını bıraktım, senin blokları dizmeni izliyorum 😎",
      "Bu oyunda da gerçek hayatta da son sözü hep Damla söyler!",
      "Bak senin için torpilli bloklar gönderiyorum, kıymetimi bil 😘",
      "Doğum günü kızı diye sesimi çıkarmıyorum, yoksa çoktan patlatmıştın beni!",
      "Kıbrıs sıcağı bile senin şu komboların kadar yakmadı beni 🔥",
      "Boğaz köprüsü şahit, senden daha iyi Block Blast oynayan yok!"
    ],

    // 9 saniye boyunca hamle yapmadığında otomatik tetiklenir
    idleTimeout: [
      "Damla uyudun mu yoksa bana trip mi atıyorsun? 🥺",
      "Aşkım mangaldaki etler yandı, hâlâ tek bir blok koymadın! 🔥",
      "Biliyorum yüzüme bakmaktan oyuna odaklanamıyorsun 😎",
      "Alooo doğum günü kızı, cüzdanımı kurtarmak için bilerek mi beklemedesin?",
      "Şapkamı düzeltip bekliyorum, hadi patlat bir satır artık!"
    ],

    // Köşelere blok yerleştirdiğinde
    cornerMove: [
      "Köşeleri de nasıl parselledi hemen! Tam bir emlak kraliçesi 👑",
      "Köşe hamlesi geldi, Metehan'ın kaçacak yeri kalmadı!",
      "Mimar mısın mübarek, o köşeye milimetrik oturdu!"
    ],

    // Büyük (3x3 veya 5'li) blok yerleştirdiğinde
    bigPiecePlaced: [
      "O dev bloğu oraya nasıl sığdırdın?! Benim dambıllardan büyük! 💪",
      "Koca bloğu tek hamlede yerleştirdi, saygıyla eğiliyorum 🙇‍♂️",
      "Tahtanın yarısını kapattın aşkım, üstüme üstüme geliyorsun!"
    ],

    // 3 hamle üst üste satır patlatamayınca
    noClearStreak: [
      "Damla yemin ederim zor blokları ben seçmiyorum, kızma! 😅",
      "Aşkım vallahi algoritmanın suçu, Metehan'ın hiçbir günahı yok!",
      "Böyle bakma, tamam bir sonraki elde en kolay blokları vereceğim!",
      "Bak ağlamaya başlayacağım şimdi, lütfen bir satır patlat artık 😭",
      "Yüzüme baka baka tahtayı doldurdun, birazdan sıkışacağım!"
    ],

    // Tahta %65'ten fazla dolduğunda
    boardCrowded: [
      "Damla yer kalmadı, sıkıştım burada! Nefes alamıyorum! 🥵",
      "Sporda bile bu kadar terlemedim aşkım, imdat! 😱",
      "Alttaki 'Özür Dilerim' bombasını mı kullansan? Boğuluyorum!",
      "Beni harcama Damla, doğum günün hatırına bir joker bas! 🙏",
      "Tahta kilitleniyor, kalbim küt küt atıyor şu an!"
    ],

    // 1 satır patlatınca
    clear1: [
      "HELAL DAMLA'MA! 😍",
      "İşte benim favori oyuncum be!",
      "Nasıl da patlattı ama! 👏",
      "Harikasın sevgilim, cüzdanımdan bir banknot daha uçtu 💸",
      "Zeka küpü müsün mübarek!",
      "Kafamı patlattın ama sana feda olsun ❤️"
    ],

    // 2 satır aynı anda patlatınca
    clear2: [
      "YİNE SEN HAKLI ÇIKTIN! 👑",
      "ÇİFTE PATLAMA! Saygıyla eğiliyorum kraliçem 🙇‍♂️",
      "Beni de böyle patlatıyorsun Damla! 💥",
      "Mükemmel hamle, tek kelime itiraz edemem!",
      "İki satırı birden sildi, cüzdanım titremeye başladı 💸"
    ],

    // 3+ satır veya yüksek seri kombosu
    clear3Plus: [
      "BU ZEKAYLA BENİ NASIL SEÇTİN?! 🤯",
      "DÜNYANIN EN İYİ BLOCK BLAST OYUNCUSU! 🏆",
      "ŞOV YAPIYOR ŞOV! KRALİÇEM BENİM! 🔥",
      "AKLIM BAŞIMDAN GİTTİ DAMLA, BU NASIL KOMBO?! 🤯❤️",
      "REKORLARIN EFENDİSİ! Cüzdanımı komple sana devrediyorum 💸👑"
    ],

    // Özel Etkinlik Blokları Patladığında
    eventGym: [
      "SPORCU METEHAN DEVREDE! Dambılla yan blokları da ezdim senin için 💪",
      "AirPods'umu taktım, senin için etraftaki fazla blokları kırdım aşkım! 🏋️‍♂️"
    ],
    eventMangal: [
      "MANGALCI METEHAN ŞOV! Ateşimle sana +1 bedava Joker hakkı pişirdim 🔥🍖",
      "Maşayı şıklattım, alttaki joker hakkını senin için doldurdum sevgilim! 🔥"
    ],
    eventTrip: [
      "TRİPLER ÇÖZÜLDÜ! Ağlayan Metehan'ın gönlünü aldın, 3 KAT PUAN! 😭❤️",
      "Gözyaşlarım puana dönüştü, tam +150 ekstra puan kaptın kraliçem!"
    ],

    // Jokerler
    bombUsed: [
      "Tamam Damla'm özür dilerim, yine sen haklısın! 💐",
      "Güllerimle geldim, 3x3 alanı senin için tertemiz yaptım! ❤️",
      "Hemen açıyorum orayı, yeter ki sen sinirlenme!"
    ],
    rerollUsed: [
      "Ben hallederim aşkım! Gözlüğümü taktım, o zor blokları kovdum 😎",
      "Mercedes konforunda 1x1 lokum gibi bloklar getirdim sana!",
      "Sen yorulma diye en kolaylarını seçtim sevgilim 😘"
    ]
  },

  // 7. PATLAMA ANINDA TAHTA ÜSTÜNDE ÇIKAN ÇİZGİ ROMAN BALONLARI (5. Madde)
  comicPopups: [
    "ŞAAAK! 💥",
    "YİNE HAKLISIN! 👑",
    "CÜZDAN GİTTİ! 💸",
    "HELAL AŞKIMA! ❤️",
    "AŞKIM YAVAŞ! 😱",
    "TAM İSABET! 🎯",
    "KRALİÇE HAREKETİ! ✨",
    "METEHAN ŞOK! 🤯"
  ],

  // 8. DOĞUM GÜNÜ TORPİLİ (Yanmama Garantisi Ekranı)
  torpil: {
    badge: "🚨 KANUNİ UYARI 🚨",
    title: "Doğum Günü Torpili!",
    message: "Doğum günü kızının bu oyunda yenilmesi kanunen yasaktır! Metehan tahtanın ortasını senin için tertemiz yapsın mı?",
    acceptButton: "Tabii ki, ben hep haklıyım 👑",
    declineButton: "Yok canım, skorum yetti (Bitir)"
  },

  // 9. DOĞUM GÜNÜ ÖDÜL KUPONU
  coupon: {
    badge: "🎉 TÜM AŞAMALAR GEÇİLDİ! 🎉",
    title: "İYİ Kİ DOĞDUN DAMLA! 🎂",
    subtitle: "Metehan'ın cüzdanını ve tüm blokları başarıyla patlattın!",
    couponHeader: "🎁 METEHAN'DAN VIP DOĞUM GÜNÜ KUPONU",
    rewardText: "Bu ekranın görüntüsünü (screenshot) Metehan'a atarak:\n\n🍽️ 1 Adet Lüks Akşam Yemeği\n🍰 1 Adet İstediğin Tatlı & Kahve\n👑 1 Yıl Boyunca İtirazsız %100 Haklılık\n\nhakkı kazandın!",
    stampText: "METEHAN ONAYLI • İTİRAZ EDİLEMEZ",
    continueButton: "Kuponu Cebe At & Sonsuz Moda Devam Et 🚀"
  }
};
