// ===== Data Management (localStorage) =====
const STORAGE_KEYS = {
    users: 'bsss_users',
    currentUser: 'bsss_currentUser',
    officials: 'bsss_officials',
    notices: 'bsss_notices'
};

// Default admin
const DEFAULT_ADMIN = {
    name: 'অ্যাডমিন',
    email: 'admin@bsss.org',
    password: 'admin123',
    type: 'admin',
    isAdmin: true
};

// Default officials
const DEFAULT_OFFICIALS = [
    { id: 1, name: 'ড. রফিকুল ইসলাম', position: 'সহ-সভাপতি', bio: 'বিজ্ঞান শিক্ষা বিশেষজ্ঞ ও গবেষক।' },
    { id: 2, name: 'প্রফেসর সালমা আক্তার', position: 'সাধারণ সম্পাদক', bio: 'জৈবপ্রযুক্তি বিভাগের অধ্যাপক।' },
    { id: 3, name: 'ইঞ্জি. কামরুল হাসান', position: 'কোষাধ্যক্ষ', bio: 'প্রকৌশল ও প্রযুক্তি বিশেষজ্ঞ।' },
    { id: 4, name: 'ড. নাজমুল হুদা', position: 'গবেষণা পরিচালক', bio: 'পদার্থবিজ্ঞানে পিএইচডি, গবেষণা সমন্বয়ক।' }
];

// ===== Initialize =====
function init() {
    // Ensure default admin exists
    let users = getUsers();
    if (!users.find(u => u.email === DEFAULT_ADMIN.email)) {
        users.push(DEFAULT_ADMIN);
        saveUsers(users);
    }

    // Ensure default officials
    if (!localStorage.getItem(STORAGE_KEYS.officials)) {
        localStorage.setItem(STORAGE_KEYS.officials, JSON.stringify(DEFAULT_OFFICIALS));
    }

    checkAuth();
    renderOfficials();
    renderNotices();
    setupEventListeners();
    setupScrollEffects();
}

// ===== Storage Helpers =====
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
}
function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser) || 'null');
}
function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
}
function getOfficials() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.officials) || '[]');
}
function saveOfficials(list) {
    localStorage.setItem(STORAGE_KEYS.officials, JSON.stringify(list));
}
function getNotices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.notices) || 'null');
}
function saveNotices(list) {
    localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(list));
}

// ===== Auth =====
function checkAuth() {
    const user = getCurrentUser();
    const navAuth = document.getElementById('navAuth');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (user) {
        navAuth.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = user.name;
        
        // Show admin panels
        if (user.isAdmin) {
            document.getElementById('adminOfficials').style.display = 'block';
            document.getElementById('adminNotices').style.display = 'block';
            document.body.classList.add('admin-mode');
        }
    } else {
        navAuth.style.display = 'flex';
        userMenu.style.display = 'none';
        document.getElementById('adminOfficials').style.display = 'none';
        document.getElementById('adminNotices').style.display = 'none';
        document.body.classList.remove('admin-mode');
    }
}

function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        setCurrentUser({ name: user.name, email: user.email, type: user.type, isAdmin: user.isAdmin || false });
        checkAuth();
        closeModal('loginModal');
        showToast('সফলভাবে লগইন হয়েছে!', 'success');
        return true;
    }
    showToast('ইমেইল বা পাসওয়ার্ড ভুল!', 'error');
    return false;
}

function signup(name, email, password, type) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showToast('এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে!', 'error');
        return false;
    }
    users.push({ name, email, password, type, isAdmin: false });
    saveUsers(users);
    setCurrentUser({ name, email, type, isAdmin: false });
    checkAuth();
    closeModal('signupModal');
    showToast('নিবন্ধন সফল! স্বাগতম ' + name, 'success');
    return true;
}

function logout() {
    setCurrentUser(null);
    checkAuth();
    showToast('লগআউট সম্পন্ন', 'success');
}

// ===== Officials =====
function renderOfficials() {
    const grid = document.getElementById('officialsGrid');
    const officials = getOfficials();
    grid.innerHTML = officials.map(o => `
        <div class="official-card">
            <button class="remove-btn" onclick="removeOfficial(${o.id})" title="মুছে ফেলুন">
                <i class="fas fa-times"></i>
            </button>
            <div class="official-avatar">${o.name.charAt(0)}</div>
            <h4>${o.name}</h4>
            <p class="position">${o.position}</p>
            <p class="bio">${o.bio || ''}</p>
        </div>
    `).join('');
}

function addOfficial(name, position, bio) {
    const officials = getOfficials();
    const id = Date.now();
    officials.push({ id, name, position, bio });
    saveOfficials(officials);
    renderOfficials();
    showToast('কর্মকর্তা যোগ করা হয়েছে', 'success');
}

function removeOfficial(id) {
    if (!confirm('আপনি কি নিশ্চিত এই কর্মকর্তাকে মুছে ফেলতে চান?')) return;
    let officials = getOfficials();
    officials = officials.filter(o => o.id !== id);
    saveOfficials(officials);
    renderOfficials();
    showToast('কর্মকর্তা মুছে ফেলা হয়েছে', 'success');
}

// ===== Notices =====
function renderNotices() {
    const list = document.getElementById('noticesList');
    let notices = getNotices();
    
    // Keep default notices if none custom
    if (!notices) {
        // Default ones are already in HTML, just return
        return;
    }

    // Prepend custom notices to existing HTML notices
    const customHTML = notices.map(n => `
        <div class="notice-item">
            <div class="notice-date">
                <span class="day">${n.day}</span>
                <span class="month">${n.month}</span>
            </div>
            <div class="notice-content">
                <h4>${n.title}</h4>
                <p>${n.body}</p>
                ${n.tag ? `<span class="notice-tag">${n.tag}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    // Keep original notices + custom
    if (!list.dataset.original) {
        list.dataset.original = list.innerHTML;
    }
    list.innerHTML = customHTML + list.dataset.original;
}

function addNotice(title, body, tag) {
    let notices = getNotices() || [];
    const now = new Date();
    const banglaMonths = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'];
    notices.unshift({
        id: Date.now(),
        title,
        body,
        tag: tag || 'সাধারণ',
        day: String(now.getDate()).padStart(2, '০').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]),
        month: banglaMonths[now.getMonth()]
    });
    // Fix day to proper Bangla digits
    const dayNum = now.getDate();
    const banglaDigits = '০১২৩৪৫৬৭৮৯';
    notices[0].day = String(dayNum).split('').map(d => banglaDigits[d]).join('');
    
    saveNotices(notices);
    renderNotices();
    showToast('নোটিশ প্রকাশিত হয়েছে', 'success');
}

// ===== Modal =====
function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}
function switchModal(from, to) {
    closeModal(from);
    openModal(to);
}

// ===== Toast =====
function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        login(email, password);
    });

    // Signup form
    document.getElementById('signupForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const type = document.getElementById('signupType').value;
        signup(name, email, password, type);
    });

    // Add official
    document.getElementById('addOfficialForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('offName').value.trim();
        const position = document.getElementById('offPosition').value.trim();
        const bio = document.getElementById('offBio').value.trim();
        addOfficial(name, position, bio);
        e.target.reset();
    });

    // Add notice
    document.getElementById('addNoticeForm').addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('noticeTitle').value.trim();
        const body = document.getElementById('noticeBody').value.trim();
        const tag = document.getElementById('noticeTag').value.trim();
        addNotice(title, body, tag);
        e.target.reset();
    });

    // Hamburger
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('navLinks').classList.toggle('open');
    });

    // Close mobile nav on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('navLinks').classList.remove('open');
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

function setupScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== Run =====
document.addEventListener('DOMContentLoaded', init);
