document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadTheme();
    loadExampleData();
    setupPhotoUpload();
});

// === DATABASE YARDIMCILARI ===
function getAllUsers() { return JSON.parse(localStorage.getItem('users_db')) || []; }
function saveAllUsers(users) { localStorage.setItem('users_db', JSON.stringify(users)); }

function getCurrentUserFull() {
    let sessionUser = JSON.parse(localStorage.getItem('currentUser'));
    if(!sessionUser) return null;
    let users = getAllUsers();
    return users.find(u => u.username === sessionUser.username) || sessionUser;
}

function updateAnyUser(updatedUser) {
    let users = getAllUsers();
    let index = users.findIndex(u => u.username === updatedUser.username);
    if(index !== -1) {
        users[index] = updatedUser;
        saveAllUsers(users);
        let current = JSON.parse(localStorage.getItem('currentUser'));
        if(current.username === updatedUser.username) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
    }
}

// === EKRAN YÖNETİMİ ===
function showScreen(screenId) {
    document.querySelectorAll('section').forEach(el => {
        el.classList.remove('active-screen');
        el.classList.add('hidden-screen');
    });
    document.getElementById(screenId).classList.remove('hidden-screen');
    document.getElementById(screenId).classList.add('active-screen');
    window.scrollTo(0, 0);
}
function closeUserProfile() { showScreen('app-screen'); }

// === FOTOĞRAF YÜKLEME ===
function setupPhotoUpload() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(readerEvent) {
                let user = getCurrentUserFull();
                user.photo = readerEvent.target.result;
                updateAnyUser(user);
                alert("Fotoğrafın güncellendi Emmi!");
                renderProfil();
            }
            reader.readAsDataURL(file);
        }
    });
}
function triggerPhotoUpload() { document.getElementById('fileInput').click(); }

// === AUTH ===
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newUser = {
        name: document.getElementById('regName').value,
        surname: document.getElementById('regSurname').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        address: document.getElementById('regAddress').value,
        phone: document.getElementById('regPhone').value,
        photo: 'https://i.pravatar.cc/150?img=11',
        bio: 'Merhaba, ben Yükümnerdeemmi kullanıyorum!',
        isPrivate: false,
        followers: [], following: [], requests: [], posts: []
    };
    
    let users = getAllUsers();
    if(users.find(u => u.username === newUser.username)) {
        alert("Bu kullanıcı adı alınmış emmi.");
        return;
    }
    users.push(newUser);
    saveAllUsers(users);
    alert('Kayıt Başarılı! Giriş yapabilirsin.');
    showScreen('login-screen');
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const uName = document.getElementById('loginUsername').value;
    const uPass = document.getElementById('loginPassword').value;
    let users = getAllUsers();
    const foundUser = users.find(u => u.username === uName && u.password === uPass);
    if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        initApp();
    } else {
        alert('Hatalı kullanıcı adı veya şifre!');
    }
});

function logout() {
    if(confirm('Çıkış yapılıyor...')) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}
function checkLoginStatus() {
    if (localStorage.getItem('currentUser')) initApp();
    else showScreen('login-screen');
}

// === ÖRNEK VERİLER ===
function loadExampleData() {
    if (!localStorage.getItem('ilanlar')) {
        const ilanlar = [{ id: 1, nereden: 'İstanbul', nereye: 'Ankara', yukCinsi: 'Mobilya', agirlik: '5', dorse: 'Tenteli', tarihCikis: '2023-11-20', tarihTeslim: '2023-11-21', adresDetay: 'Tuzla', sahip: 'Ahmet Yılmaz', tel: '0555' }];
        localStorage.setItem('ilanlar', JSON.stringify(ilanlar));
    }
    if (!localStorage.getItem('users_db')) {
        const users = [
            { username: 'ali_kaptan', name: 'Ali', surname: 'Kaptan', password:'123', photo: 'https://i.pravatar.cc/150?img=3', role: 'Şoför', bio: 'Yolların ustasıyım.', isPrivate: true, followers: [], following: [], requests: [], posts: [{text: 'Bugün Ankara seferi bitti.', date: '2 saat önce'}] },
            { username: 'murat_lojistik', name: 'Murat', surname: 'Demir', password:'123', photo: 'https://i.pravatar.cc/150?img=4', role: 'Nakliyeci', bio: '7/24 Yük verilir.', isPrivate: false, followers: [], following: [], requests: [], posts: [{text: 'İstanbul çıkışlı araç lazım.', date: 'Dün'}] }
        ];
        saveAllUsers(users);
    }
}

// === ANA AKIŞ ===
function initApp() {
    const user = getCurrentUserFull();
    document.getElementById('displayUsername').innerText = user.name + ' ' + user.surname;
    document.getElementById('headerProfilePic').src = user.photo;
    showScreen('app-screen');
    renderYukBul();
}
const contentArea = document.getElementById('content-area');

// --- 1. YÜK BUL ---
function renderYukBul(filterText = '', filterDorse = '') {
    updateNav('Yük Bul');
    const ilanlar = JSON.parse(localStorage.getItem('ilanlar')) || [];
    const filtered = ilanlar.filter(ilan => (ilan.nereden.toLowerCase().includes(filterText.toLowerCase()) || ilan.nereye.toLowerCase().includes(filterText.toLowerCase())) && (filterDorse === '' || ilan.dorse === filterDorse));
    let html = `
        <div class="filter-box">
            <input type="text" id="searchInput" placeholder="Şehir Ara..." oninput="applyFilters()" value="${filterText}">
            <select id="filterDorse" onchange="applyFilters()"><option value="">Tümü</option><option value="Tenteli">Tenteli</option><option value="Damperli">Damperli</option></select>
        </div>
        <h2>Yük İlanları</h2>`;
    filtered.forEach(ilan => { html += `<div class="card"><h3>${ilan.nereden} -> ${ilan.nereye}</h3><p>${ilan.yukCinsi}, ${ilan.agirlik} Ton</p><button class="btn-primary" onclick="alert('${ilan.tel} aranıyor...')">Ara</button></div>`; });
    contentArea.innerHTML = html;
    if(filterText) document.getElementById('searchInput').focus();
}
function applyFilters() { renderYukBul(document.getElementById('searchInput').value, document.getElementById('filterDorse').value); }

// --- 2. İLAN VER ---
function renderIlanVer() {
    updateNav('İlan Ver');
    contentArea.innerHTML = `<h2>İlan Ver</h2><div class="card"><form onsubmit="ilanKaydet(event)"><input id="nereden" placeholder="Nereden" required><input id="nereye" placeholder="Nereye" required><button class="btn-primary">Yayınla</button></form></div>`;
}
function ilanKaydet(e) { e.preventDefault(); alert("İlanın düştü emmi!"); renderYukBul(); }

// --- 3. İSTEKLER ---
function renderMesajlar() {
    updateNav('İstekler');
    let me = getCurrentUserFull();
    let html = `<h2>İstekler ve Bildirimler</h2>`;
    if(me.requests && me.requests.length > 0) {
        html += `<div class="card"><h3>Takip İstekleri (${me.requests.length})</h3>`;
        me.requests.forEach(reqUsername => {
            let requester = getAllUsers().find(u => u.username === reqUsername);
            if(requester) {
                html += `
                <div class="request-item">
                    <div onclick="openUserProfile('${requester.username}')" style="cursor:pointer"><strong>${requester.name} ${requester.surname}</strong><br><small>@${requester.username}</small></div>
                    <div class="req-actions"><button class="btn-accept" onclick="acceptRequest('${requester.username}')">Onayla</button><button class="btn-reject" onclick="rejectRequest('${requester.username}')">Sil</button></div>
                </div>`;
            }
        });
        html += `</div>`;
    } else { html += `<div class="card" style="text-align:center; padding:30px;"><p>Yeni bir isteğin yok emmi.</p></div>`; }
    contentArea.innerHTML = html;
}
function acceptRequest(targetUser) {
    let me = getCurrentUserFull();
    let other = getAllUsers().find(u => u.username === targetUser);
    me.requests = me.requests.filter(r => r !== targetUser);
    if(!me.followers) me.followers = []; me.followers.push(targetUser);
    if(!other.following) other.following = []; other.following.push(me.username);
    updateAnyUser(me); updateAnyUser(other);
    if(confirm(`${other.name} artık seni takip ediyor. Sen de takip etmek ister misin?`)) logicFollowUser(me.username, targetUser);
    renderMesajlar();
}
function rejectRequest(targetUser) {
    let me = getCurrentUserFull();
    me.requests = me.requests.filter(r => r !== targetUser);
    updateAnyUser(me);
    renderMesajlar();
}

// --- 4. SOSYAL ---
function renderSosyal() {
    updateNav('Sosyal');
    let me = getCurrentUserFull();
    let users = getAllUsers().filter(u => u.username !== me.username);
    let html = `<h2>Nakliyeciler</h2><div class="card" style="padding:0;">`;
    users.forEach(u => {
        let isFollowing = u.followers && u.followers.includes(me.username);
        let isRequested = u.requests && u.requests.includes(me.username);
        let btnText = isFollowing ? "Takip Ediliyor" : (isRequested ? "İstek Gönderildi" : "Takip Et");
        let btnStyle = isFollowing ? "background:#333; color:white;" : (isRequested ? "background:#ccc; color:black;" : "");
        html += `
        <div class="user-list-item" style="padding:15px; cursor:pointer;" onclick="openUserProfile('${u.username}')">
            <div class="user-list-info"><img src="${u.photo}" class="profile-pic-sm"><div><strong>${u.name} ${u.surname}</strong>${u.isPrivate ? '<i class="fa-solid fa-lock" style="font-size:0.7rem; margin-left:5px;"></i>' : ''}<br><small>@${u.username}</small></div></div>
            <button class="user-list-btn" style="${btnStyle}" onclick="event.stopPropagation(); toggleFollow('${u.username}')">${btnText}</button>
        </div>`;
    });
    html += `</div>`;
    contentArea.innerHTML = html;
}

// --- PROFİL GÖRÜNTÜLEME ---
function openUserProfile(targetUsername) {
    let me = getCurrentUserFull();
    let target = getAllUsers().find(u => u.username === targetUsername);
    if(targetUsername === me.username) { renderProfil(); return; }
    
    document.getElementById('app-screen').classList.remove('active-screen');
    document.getElementById('app-screen').classList.add('hidden-screen');
    document.getElementById('other-profile-screen').classList.remove('hidden-screen');
    document.getElementById('other-profile-screen').classList.add('active-screen');
    
    let isFollowing = target.followers && target.followers.includes(me.username);
    let isRequested = target.requests && target.requests.includes(me.username);
    let canSeeContent = !target.isPrivate || isFollowing;
    let btnText = isFollowing ? "Takibi Bırak" : (isRequested ? "İstek Gönderildi" : "Takip Et");

    let html = `
        <div class="card" style="text-align:center;">
            <img src="${target.photo}" class="profile-pic-lg">
            <h3>${target.name} ${target.surname} ${target.isPrivate ? '<i class="fa-solid fa-lock"></i>' : ''}</h3>
            <p style="color:gray;">@${target.username}</p>
            <p style="margin:10px 0; font-style:italic;">"${target.bio || '...'}"</p>
            <div class="stats-row">
                <div class="stat-item"><span class="stat-num">${target.posts ? target.posts.length : 0}</span><span class="stat-label">Gönderi</span></div>
                <div class="stat-item"><span class="stat-num">${target.followers ? target.followers.length : 0}</span><span class="stat-label">Takipçi</span></div>
                <div class="stat-item"><span class="stat-num">${target.following ? target.following.length : 0}</span><span class="stat-label">Takip</span></div>
            </div>
            <button class="btn-primary" onclick="toggleFollow('${target.username}', true)">${btnText}</button>
        </div>`;

    if(canSeeContent) {
        html += `<h3>Paylaşımlar</h3>`;
        if(target.posts && target.posts.length > 0) {
            target.posts.forEach(post => { html += `<div class="card"><p>${post.text}</p><small style="color:gray;">${post.date}</small></div>`; });
        } else { html += `<p style="text-align:center; opacity:0.6">Henüz gönderisi yok.</p>`; }
    } else {
        html += `<div class="private-warning"><i class="fa-solid fa-lock"></i><h3>Bu Hesap Gizli</h3><p>Paylaşımları görmek için takip isteği gönder.</p></div>`;
    }
    document.getElementById('other-profile-content').innerHTML = html;
}

// --- LOGIC ---
function toggleFollow(targetUsername, refreshProfile = false) {
    let me = getCurrentUserFull();
    let target = getAllUsers().find(u => u.username === targetUsername);
    if(!me.following) me.following = []; if(!target.followers) target.followers = []; if(!target.requests) target.requests = [];
    
    let isFollowing = target.followers.includes(me.username);
    let isRequested = target.requests.includes(me.username);
    
    if(isFollowing) {
        target.followers = target.followers.filter(x => x !== me.username);
        me.following = me.following.filter(x => x !== target.username);
        alert("Takipten çıkıldı.");
    } else if(isRequested) {
        target.requests = target.requests.filter(x => x !== me.username);
        alert("İstek geri çekildi.");
    } else {
        if(target.isPrivate) { target.requests.push(me.username); alert("Takip isteği gönderildi."); }
        else { target.followers.push(me.username); me.following.push(target.username); alert("Takip ediliyor!"); }
    }
    updateAnyUser(me); updateAnyUser(target);
    if(refreshProfile) openUserProfile(targetUsername); else renderSosyal();
}

function logicFollowUser(myUsername, targetUsername) {
    let users = getAllUsers();
    let me = users.find(u => u.username === myUsername);
    let target = users.find(u => u.username === targetUsername);
    if(!me.following) me.following = []; if(!target.followers) target.followers = [];
    if(!target.followers.includes(me.username)) {
        if(target.isPrivate) { if(!target.requests) target.requests=[]; target.requests.push(me.username); alert("İstek atıldı."); }
        else { target.followers.push(me.username); me.following.push(target.username); alert("Takip edildi."); }
    }
    saveAllUsers(users);
}

// --- 5. PROFİL AYARLARI ---
function renderProfil() {
    updateNav('');
    let me = getCurrentUserFull();
    const isDark = document.body.classList.contains('dark-mode');
    contentArea.innerHTML = `
        <h2>Profilim</h2>
        <div class="card" style="text-align:center;">
            <img src="${me.photo}" class="profile-pic-lg">
            <button class="btn-sm" onclick="triggerPhotoUpload()">Fotoğraf Değiştir</button><br><br>
            <div class="stats-row">
                <div class="stat-item"><span class="stat-num">${me.requests ? me.requests.length : 0}</span><span class="stat-label">İstekler</span></div>
                <div class="stat-item"><span class="stat-num">${me.followers ? me.followers.length : 0}</span><span class="stat-label">Takipçi</span></div>
                <div class="stat-item"><span class="stat-num">${me.following ? me.following.length : 0}</span><span class="stat-label">Takip</span></div>
            </div>
        </div>
        <div class="card">
            <h3>Ayarlar</h3>
            <form onsubmit="updateProfile(event)">
                <label>Biyografi:</label><input id="editBio" value="${me.bio || ''}" placeholder="Hakkında...">
                <div class="switch-container"><span><i class="fa-solid fa-lock"></i> Gizli Hesap</span><input type="checkbox" id="editIsPrivate" ${me.isPrivate ? 'checked' : ''}></div>
                <small style="color:gray; display:block; margin-bottom:15px;">Açık olursan herkes takip eder.</small>
                <label>Ad & Soyad:</label><input id="editName" value="${me.name}"><input id="editSurname" value="${me.surname}">
                <button class="btn-primary">Kaydet</button>
            </form>
        </div>
        <div class="card switch-container"><span>Koyu Tema</span><input type="checkbox" id="themeSwitch" ${isDark ? 'checked' : ''} onchange="toggleTheme()"></div>
        <button onclick="logout()" class="btn-danger">Çıkış Yap</button><br><br>`;
}
function updateProfile(e) {
    e.preventDefault();
    let me = getCurrentUserFull();
    me.bio = document.getElementById('editBio').value;
    me.isPrivate = document.getElementById('editIsPrivate').checked;
    me.name = document.getElementById('editName').value;
    me.surname = document.getElementById('editSurname').value;
    updateAnyUser(me); alert("Profilin güncellendi!"); renderProfil();
}
function updateNav(activeText) { document.querySelectorAll('.nav-item').forEach(btn => { if(btn.innerText.includes(activeText)) btn.classList.add('active'); else btn.classList.remove('active'); }); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); }
function loadTheme() { if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode'); }