// ===================================================================
// 1. FIREBASE ALTYAPISI (GITHUB PAGES İLE UYUMLU VE SON HALİ)
// ===================================================================

// ÖNEMLİ: Kendi Firebase Konsolunuzdan aldığınız GERÇEK anahtarları buraya yapıştırın!
const firebaseConfig = {
  // Lütfen bu alanı Firebase'den kopyaladığınız GERÇEK anahtarlarınızla doldurun.
  // ÇİFT TIRNAKLARI (") SİLMEYİN!
  apiKey: "YOUR_API_KEY", 
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com", 
  projectId: "YOUR_PROJECT_ID", 
  storageBucket: "YOUR_PROJECT_ID.appspot.com", 
  messagingSenderId: "1234567890", 
  appId: "1:1234567890:web:abcdefg123456789" 
};

// KRİTİK DÜZELTME: Global 'firebase' objesi üzerinden başlatma (CDN ile uyumlu)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const ANILAR_KOLEKSIYON = "ortak_anilar";

// Firestore fonksiyonlarını global değişkenlere atama
const doc = firebase.firestore.doc;
const setDoc = firebase.firestore.setDoc;
const getDoc = firebase.firestore.getDoc;

// -------------------------------------------------------------------
// 2. Aşk Gün Sayacı ve Giriş Mantığı
// -------------------------------------------------------------------
const baslangicTarihi = new Date(2022, 5, 16); 
const bugununTarihi = new Date();

function gunSayisiniHesapla() {
    const farkMs = bugununTarihi - baslangicTarihi;
    const birGunMs = 1000 * 60 * 60 * 24; 
    const gunSayisi = Math.floor(farkMs / birGunMs) + 1; 
    document.getElementById('gunSayisi').textContent = gunSayisi.toLocaleString();
}

document.addEventListener('DOMContentLoaded', gunSayisiniHesapla);

// GÜVENLİ GİRİŞ FONKSİYONU (Sadece Kullanıcı Adı Kontrolü)
function loginUser(userNumber) {
    const nameInput = document.getElementById(`user${userNumber}Name`).value;
    
    const user1_AD = "esra";
    const user2_AD = "ali"; 

    let success = false;
    let username = "";

    if (userNumber === 1 && nameInput === user1_AD) {
        success = true;
        username = user1_AD;
    } else if (userNumber === 2 && nameInput === user2_AD) {
        success = true;
        username = user2_AD;
    }

    if (success) {
        alert(`${username} hoş geldin! Günlüğe giriş yapılıyor...`);
        loadCalendarPage(username); 
    } else {
        alert("Kullanıcı adı yanlış. Lütfen kullanıcı adını kontrol et.");
    }
}

// -------------------------------------------------------------------
// 3. TAKVİM VE VERİ ÇEKME (BULUTTAN)
// -------------------------------------------------------------------

const takvimBaslangicYili = 2025; 

const ayRenkleri = {
    0: '#f8bbd0', 1: '#e1bee7', 2: '#c5cae9', 3: '#b2ebf2',
    4: '#a5d6a7', 5: '#fff9c4', 6: '#ffe0b2', 7: '#ffccbc',
    8: '#d7ccc8', 9: '#cfd8dc', 10: '#bcaaa4', 11: '#90caf9' 
};

const ozelGunler = [ { ay: 1, gun: 14, ad: "Sevgililer Günü" }, { ay: 4, gun: 25, ad: "Senin Doğum Günün" }, { ay: 7, gun: 12, ad: "O'nun Doğum Gününü" }, { ay: 5, gun: 16, ad: "Yıldönümümüz" } ];

function isOzelGun(tarih) {
    const ay = tarih.getMonth();
    const gun = tarih.getDate();
    return ozelGunler.some(ozel => ozel.ay === ay && ozel.gun === gun); 
}

let currentDayTarih = null;
let currentLoggedInUser = null; 

async function loadCalendar
