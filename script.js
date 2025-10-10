// -------------------------------------------------------------------
// 1. Aşk Gün Sayacı Referansı: 16 Haziran 2021
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

// -------------------------------------------------------------------
// 2. Giriş Mantığı
// -------------------------------------------------------------------
function loginUser(userNumber) {
    const nameInput = document.getElementById(`user${userNumber}Name`).value;
    const passInput = document.getElementById(`user${userNumber}Pass`).value;
    
    // Şifreler sadece ön yüz simülasyonudur.
    const user1_AD = "esra";
    const user1_SIFRE = "2502"; 
    const user2_AD = "ali";
    const user2_SIFRE = "0402"; 

    let success = false;
    let username = "";

    if (userNumber === 1 && nameInput === user1_AD && passInput === user1_SIFRE) {
        success = true;
        username = user1_AD;
    } else if (userNumber === 2 && nameInput === user2_AD && passInput === user2_SIFRE) {
        success = true;
        username = user2_AD;
    }

    if (success) {
        alert(`${username} hoş geldin! Günlüğe giriş yapılıyor...`);
        loadCalendarPage(username); 
    } else {
        alert("Kullanıcı adı veya şifre hatalı. Lütfen tekrar dene.");
    }
}


// -------------------------------------------------------------------
// 3. Takvim Ayarları, Renkler ve Özel Günler
// -------------------------------------------------------------------
const takvimBaslangicYili = 2025; // Takvimin gösterime başlayacağı yıl (Ocak 1'den)

const ayRenkleri = {
    0: '#f8bbd0', 1: '#e1bee7', 2: '#c5cae9', 3: '#b2ebf2',
    4: '#a5d6a7', 5: '#fff9c4', 6: '#ffe0b2', 7: '#ffccbc',
    8: '#d7ccc8', 9: '#cfd8dc', 10: '#bcaaa4', 11: '#90caf9' 
};

// AY DEĞERLERİ 0'DAN BAŞLAR (0=Ocak, 1=Şubat, 5=Haziran, 11=Aralık)
const ozelGunler = [
   { ay: 1, gun: 14, ad: "Sevgililer Günü" }, // 14 Şubat
    { ay: 1, gun: 4, ad: "Senin Doğum Günün" }, // )
    { ay: 1, gun: 25, ad: "O'nun Doğum Günü" }, // 
    { ay: 5, gun: 16, ad: "Yıldönümümüz" } // 16 Haziran
];

function isOzelGun(tarih) {
    const ay = tarih.getMonth();
    const gun = tarih.getDate();
    return ozelGunler.some(ozel => ozel.ay === ay && ozel.gun === gun); 
}

// -------------------------------------------------------------------
// Global Durum Yönetimi
// -------------------------------------------------------------------
let currentDayTarih = null;
let currentLoggedInUser = null; 

// -------------------------------------------------------------------
// 4. Takvim Sayfasını Yükleme
// -------------------------------------------------------------------
function loadCalendarPage(user) {
    const body = document.body;
    currentLoggedInUser = user; // Giriş yapan kullanıcıyı kaydet
    
    // Yalnızca içeriği temizle
    body.innerHTML = ''; 
    
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
        const ayIndex = tarih.getMonth(); 
        dayBox.style.backgroundColor = ayRenkleri[ayIndex]; 
        
        const tarihFormat = tarih.toLocaleDateString('tr-TR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });

        const tarihKeyEsra = `${tarih.toDateString()}-esra`;
        const tarihKeyAli = `${tarih.toDateString()}-ali`;
        let photoIndicator = ''; 

        // 1. ÖZEL GÜN VURGUSU
        if (isOzelGun(tarih)) {
             dayBox.classList.add('ozel-gun');
        }
        
        // 2. KAYDEDİLMİŞ ANI VE FOTOĞRAF KONTROLÜ (Çift Kontrol)
        const storedMemoryEsra = localStorage.getItem(tarihKeyEsra);
        const storedMemoryAli = localStorage.getItem(tarihKeyAli);

        // İki kişiden biri not bıraktıysa kutucuğu dolu yap
        if (storedMemoryEsra || storedMemoryAli) {
            dayBox.classList.add('filled-day'); 

            // Fotoğraf kontrolü: Kimin bıraktığı önemli değil, fotoğraf var mı?
            const memoryDataEsra = storedMemoryEsra ? JSON.parse(storedMemoryEsra) : {photo: ''};
            const memoryDataAli = storedMemoryAli ? JSON.parse(storedMemoryAli) : {photo: ''};
            
            if ((memoryDataEsra.photo && memoryDataEsra.photo !== '') || 
                (memoryDataAli.photo && memoryDataAli.photo !== '')) {
                photoIndicator = '📸'; 
            }
        }
        
        dayBox.innerHTML = `
            <span class="day-number">${tarih.getDate()}</span> 
            <span class="photo-icon">${photoIndicator}</span> 
            <span class="full-date">${tarihFormat}</span>
        `;
        
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
                <label for="memoryPhoto" class="photo-label">
                    📸 Fotoğraf Ekle (Yükleme simülasyonu)
                    <input type="file" id="memoryPhoto" accept="image/*">
                </label>
                <button onclick="saveMemory()">Anıyı Kaydet</button>
            </div>
        </div>`;
    
    body.insertAdjacentHTML('beforeend', modalHtml);
}

// -------------------------------------------------------------------
// 5. Modal Fonksiyonları (ÇİFT KULLANICI DESTEĞİ)
// -------------------------------------------------------------------

function openModal(tarih) {
    currentDayTarih = tarih;
    
    const tarihFormat = tarih.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Modal başlığını giriş yapan kullanıcıya göre kişiselleştir
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

function saveMemory() {
    if (!currentDayTarih || !currentLoggedInUser) return;

    // Anahtar artık kullanıcı adını da içeriyor: "Tarih-KullanıcıAdı"
    const tarihKey = `${currentDayTarih.toDateString()}-${currentLoggedInUser}`; 
    
    const memoryText = document.getElementById('memoryText').value;
    const photoFile = document.getElementById('memoryPhoto').files[0];
    let photoName = photoFile ? photoFile.name : '';
    
    const memoryData = {
        user: currentLoggedInUser, // Kimin yazdığını kaydet
        text: memoryText,
        photo: photoName
    };

    localStorage.setItem(tarihKey, JSON.stringify(memoryData));
    
    alert(`Anınız (${currentLoggedInUser}) başarıyla kaydedildi!`);
    
    // Takvimi yeniden yükle
    loadCalendarPage(currentLoggedInUser); 
    closeModal();
}

function loadMemory() {
    // Tanımlı kullanıcı adları
    const user1 = "esra"; 
    const user2 = "ali";
    
    // Hangi veriyi yükleyeceğimizi belirle
    const currentUserKey = `${currentDayTarih.toDateString()}-${currentLoggedInUser}`;
    const otherUser = (currentLoggedInUser === user1) ? user2 : user1;
    const otherUserKey = `${currentDayTarih.toDateString()}-${otherUser}`;
    
    
    // 1. Kendi Anısını Yükle
    const storedData = localStorage.getItem(currentUserKey);
    let photoInfo = '';
    let memoryStatus = '(Yeni Anı)';

    if (storedData) {
        const memoryData = JSON.parse(storedData);
        document.getElementById('memoryText').value = memoryData.text;
        
        photoInfo = memoryData.photo ? ` 📸` : '';
        memoryStatus = `(Kendi Anınız Kayıtlı${photoInfo})`;
    } else {
        document.getElementById('memoryText').value = '';
    }
    
    // 2. Diğer Sevgilinin Anısını Kontrol Et ve Başlığa Ekle
    const otherStoredData = localStorage.getItem(otherUserKey);
    if (otherStoredData) {
        const otherData = JSON.parse(otherStoredData);
        const otherPhotoInfo = otherData.photo ? ` 📸` : '';
        memoryStatus += ` | ${otherUser.toUpperCase()} Anısı Var${otherPhotoInfo}`;
    }

    // Modal Başlığını Güncelle
    document.getElementById('modalDate').textContent = 
        document.getElementById('modalDate').textContent.split('(')[0].trim() + ' ' + memoryStatus;
}