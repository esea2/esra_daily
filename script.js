// ===================================================================
// 1. FIREBASE ALTYAPISI (GITHUB PAGES İLE UYUMLU VE SON HALİ)
// ===================================================================

// ÖNEMLİ: Kendi Firebase Konsolunuzdan aldığınız GERÇEK anahtarları buraya yapıştırın!
const firebaseConfig = {
  // Lütfen bu alanı Firebase'den kopyaladığınız GERÇEK anahtarlarınızla doldurun.
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
const baslangicTarihi = new Date(2021, 5, 16); 
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

const ozelGunler = [ { ay: 1, gun: 14, ad: "Sevgililer Günü" }, { ay: 4, gun: 25, ad: "Senin Doğum Günün" }, { ay: 7, gun: 12, ad: "O'nun Doğum Günü" }, { ay: 5, gun: 16, ad: "Yıldönümümüz" } ];

function isOzelGun(tarih) {
    const ay = tarih.getMonth();
    const gun = tarih.getDate();
    return ozelGunler.some(ozel => ozel.ay === ay && ozel.gun === gun); 
}

let currentDayTarih = null;
let currentLoggedInUser = null; 

async function loadCalendarPage(user) {
    const body = document.body;
    currentLoggedInUser = user; 
    
    body.innerHTML = ''; 
    
    // BULUTTAN TÜM ANILARI ÇEKME
    const tumAnilarSnapshot = await getDoc(doc(db, "meta", "anilar_tumu"));
    const tumAnilar = tumAnilarSnapshot.exists() ? tumAnilarSnapshot.data() : {};

    const header = document.createElement('h1');
    header.className = 'main-title';
    header.textContent = `🗓️ ${user}'ın Yılı: Anılarımız 🗓️`;
    body.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    for (let i = 0; i < 365; i++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'day-box';
        const tarih = new Date(takvimBaslangicYili, 0, i + 1); 
        const tarihKey = tarih.toDateString(); 
        
        const ayIndex = tarih.getMonth(); 
        dayBox.style.backgroundColor = ayRenkleri[ayIndex]; 
        const tarihFormat = tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const anilar = tumAnilar[tarihKey] || {};
        let photoIndicator = ''; 

        if (isOzelGun(tarih)) {
             dayBox.classList.add('ozel-gun');
        }
        
        // Eğer Ali veya Esra not bıraktıysa kutuyu dolu yap
        if (anilar.esra || anilar.ali) { 
            dayBox.classList.add('filled-day'); 
            
            if ((anilar.esra && anilar.esra.photo) || (anilar.ali && anilar.ali.photo)) {
                photoIndicator = '📸'; 
            }
        }
        
        dayBox.innerHTML = `<span class="day-number">${tarih.getDate()}</span> <span class="photo-icon">${photoIndicator}</span> <span class="full-date">${tarihFormat}</span>`;
        dayBox.onclick = () => openModal(tarih);
        grid.appendChild(dayBox);
    }
    
    body.appendChild(grid);
    
    // Modal HTML'ini tekrar ekle
    const modalHtml = `
        <div id="memoryModal" class="modal">
            <div class="modal-content">
                <span class="close-button" onclick="closeModal()">&times;</span>
                <h3 id="modalDate"></h3>
                <textarea id="memoryText" placeholder="Bugünün anısını buraya yaz..."></textarea>
                <label for="memoryPhoto" class="photo-label">📸 Fotoğraf Ekle (Yükleme simülasyonu)
                    <input type="file" id="memoryPhoto" accept="image/*"></label>
                <button onclick="saveMemory()">Anıyı Kaydet</button>
            </div>
        </div>`;
    
    body.insertAdjacentHTML('beforeend', modalHtml);
}

// -------------------------------------------------------------------
// 4. MODAL VE VERİ KAYDETME/OKUMA (BULUTA BAĞLI)
// -------------------------------------------------------------------

function openModal(tarih) {
    currentDayTarih = tarih;
    const tarihFormat = tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('modalDate').textContent = `${tarihFormat} Anısı (${currentLoggedInUser.toUpperCase()})`; 
    
    document.getElementById('memoryText').value = '';
    document.getElementById('memoryPhoto').value = ''; 
    loadMemory(); 
    document.getElementById('memoryModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('memoryModal').style.display = 'none';
    currentDayTarih = null;
}

// BULUTA KAYDETME (Ortak Okuma)
async function saveMemory() {
    if (!currentDayTarih || !currentLoggedInUser) return;

    const tarihKey = currentDayTarih.toDateString(); 
    const memoryText = document.getElementById('memoryText').value;
    const photoFile = document.getElementById('memoryPhoto').files[0];
    let photoName = photoFile ? photoFile.name : '';
    
    const memoryData = {
        user: currentLoggedInUser, 
        text: memoryText,
        photo: photoName,
        timestamp: new Date().getTime()
    };
    
    try {
        const updateObject = {};
        updateObject[`${tarihKey}.${currentLoggedInUser}`] = memoryData;

        // Firebase'e kaydet
        await setDoc(doc(db, "meta", "anilar_tumu"), updateObject, { merge: true });
        
        alert(`Anınız (${currentLoggedInUser}) buluta başarıyla kaydedildi!`);
        loadCalendarPage(currentLoggedInUser); 
    } catch (e) {
        console.error("Buluta Kaydetme Hatası: ", e);
        alert("HATA: Anı buluta kaydedilemedi. Konsolu kontrol edin.");
    }
    
    closeModal();
}

// BULUTTAN OKUMA (Ortak Okuma)
async function loadMemory() {
    const tarihKey = currentDayTarih.toDateString();
    const otherUser = (currentLoggedInUser === "esra") ? "ali" : "esra";

    // Tüm anıları buluttan çek
    const tumAnilarSnapshot = await getDoc(doc(db, "meta", "anilar_tumu"));
    const tumAnilar = tumAnilarSnapshot.exists() ? tumAnilarSnapshot.data() : {};
    
    const anilar = tumAnilar[tarihKey] || {};

    let photoInfo = '';
    let memoryStatus = '(Yeni Anı)';

    // Kendi Anısını Yükle
    if (anilar[currentLoggedInUser]) {
        const myData = anilar[currentLoggedInUser];
        document.getElementById('memoryText').value = myData.text;
        
        photoInfo = myData.photo ? ` 📸` : '';
        memoryStatus = `(Kendi Anınız Kayıtlı${photoInfo})`;
    } else {
        document.getElementById('memoryText').value = '';
    }
    
    // Diğer Sevgilinin Anısını Kontrol Et
    if (anilar[otherUser]) {
        const otherData = anilar[otherUser];
        const otherPhotoInfo = otherData.photo ? ` 📸` : '';
        memoryStatus += ` | ${otherUser.toUpperCase()} Anısı Var${otherPhotoInfo}`;
    }

    document.getElementById('modalDate').textContent = document.getElementById('modalDate').textContent.split('(')[0].trim() + ' ' + memoryStatus;
}
