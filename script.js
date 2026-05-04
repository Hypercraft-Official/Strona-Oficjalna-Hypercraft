// --- STAN APLIKACJI ---
let balance = localStorage.getItem('hc_balance') ? parseInt(localStorage.getItem('hc_balance')) : 0;
let lastClaim = localStorage.getItem('hc_last_claim') ? parseInt(localStorage.getItem('hc_last_claim')) : 0;
let currentTheme = localStorage.getItem('hc_theme') || 'default';
let currentFont = localStorage.getItem('hc_font') || 'default';

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000;

// --- ZMIENNE MINI-GRY (RDZEŃ) ---
let coreStability = 100;
let coreInterval;

// --- INICJALIZACJA ---
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    // Jeśli miałeś funkcje applyTheme i applyFont zostaw je, ja je na chwilę zakomentowałem bo ich nie wysłałeś
    // applyTheme(currentTheme); 
    // applyFont(currentFont);
    setInterval(updateTimer, 1000);
    
    // Start systemu ładowania (animacja kropek na stronie startowej)
    startLoadingAnimation();
    
    // Start systemu degradacji rdzenia (Mini-gra)
    startCoreSystem();
});

// --- MENU MOBILNE ---
function toggleMenu() {
    document.querySelector('.hamburger').classList.toggle('active');
    document.querySelector('.nav-links').classList.toggle('active-menu');
}

// --- NAWIGACJA (SPA) ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active-nav'));

    document.getElementById(tabId).classList.add('active-tab');
    event.currentTarget.classList.add('active-nav');

    if(window.innerWidth <= 768) {
        document.querySelector('.hamburger').classList.remove('active');
        document.querySelector('.nav-links').classList.remove('active-menu');
    }
}

// --- SYSTEM ŁADOWANIA (ANIMACJA KROPEK) ---
function startLoadingAnimation() {
    let dotCount = 0;
    setInterval(() => {
        const loader = document.getElementById('loading-dots');
        if(loader) {
            dotCount = (dotCount + 1) % 4; // od 0 do 3 kropek
            loader.innerText = 'Ładowanie' + '.'.repeat(dotCount);
        }
    }, 500);
}

// --- MINI-GRA (RDZEŃ) ---
function startCoreSystem() {
    // Rdzeń traci stabilność co sekundę
    coreInterval = setInterval(() => {
        coreStability -= 1.5; // Szybkość spadku stabilności
        if (coreStability < 0) coreStability = 0;
        updateCoreUI();
    }, 1000);
}

function stabilizeCore() {
    // Dodaje stabilność po kliknięciu
    coreStability += 8;
    if (coreStability > 100) coreStability = 100;
    
    // Szansa na zdobycie darmowego HyperCoina z reaktora (np. 10% szans)
    if(Math.random() < 0.10) {
        balance += 1;
        saveData();
        updateUI();
        showToast("⚡ Rdzeń wygenerował 1 HC!", "info");
    }
    
    updateCoreUI();
}

function updateCoreUI() {
    const fill = document.getElementById('core-stability-fill');
    const text = document.getElementById('stability-text');
    if(!fill || !text) return;
    
    fill.style.width = coreStability + '%';
    text.innerText = Math.floor(coreStability) + '%';
    
    // Zmiana kolorów zależnie od stabilności
    if(coreStability > 60) {
        fill.style.backgroundColor = '#00ff88'; // Zielony - stabilnie
        fill.style.boxShadow = '0 0 20px #00ff88';
    } else if (coreStability > 25) {
        fill.style.backgroundColor = '#ffaa00'; // Pomarańczowy - ostrzeżenie
        fill.style.boxShadow = '0 0 20px #ffaa00';
    } else {
        fill.style.backgroundColor = '#ff0000'; // Czerwony - krytyczny
        fill.style.boxShadow = '0 0 20px #ff0000';
    }
}

// --- CUSTOM POWIADOMIENIA (TOASTY) ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}

// --- CUSTOM MODAL POTWIERDZENIA ---
function showConfirm(message, onConfirmCallback) {
    const overlay = document.getElementById('custom-confirm-overlay');
    const textElem = document.getElementById('custom-confirm-text');
    const btnYes = document.getElementById('confirm-btn-yes');
    const btnNo = document.getElementById('confirm-btn-no');

    textElem.innerText = message;
    overlay.classList.remove('hidden');

    btnYes.onclick = null;
    btnNo.onclick = null;

    btnYes.onclick = () => {
        overlay.classList.add('hidden');
        onConfirmCallback();
    };

    btnNo.onclick = () => {
        overlay.classList.add('hidden');
    };
}

// --- KOPIOWANIE IP ---
function copyIP() {
    // Nie mamy IP więc wrzucamy akcję Wejścia
    showToast("Rozpoczynanie procedury logowania do systemu...", "info");
}

// --- ZAPISYWANIE DANYCH ---
function saveData() {
    localStorage.setItem('hc_balance', balance);
    localStorage.setItem('hc_last_claim', lastClaim);
}

// --- EKONOMIA (HYPERCOINS) ---
function updateUI() {
    const formattedBalance = balance.toLocaleString('pl-PL');
    document.getElementById('nav-balance').innerText = formattedBalance;
    if(document.getElementById('main-balance')) {
        document.getElementById('main-balance').innerText = formattedBalance;
    }
}

function claimDaily() {
    const now = new Date().getTime();
    if (now - lastClaim >= CLAIM_COOLDOWN) {
        balance += 50;
        lastClaim = now;
        saveData();
        updateUI();
        updateTimer();
        showToast("Transfer udany! Zasilenie konta: +50 HC", "success");
    }
}

function updateTimer() {
    const btn = document.getElementById('claim-btn');
    const timerText = document.getElementById('timer-text');
    if (!btn || !timerText) return;

    const now = new Date().getTime();
    const timeLeft = CLAIM_COOLDOWN - (now - lastClaim);

    if (timeLeft <= 0) {
        btn.disabled = false;
        btn.innerText = "INICJUJ TRANSFER (50 HC)";
        timerText.innerText = "Dostępne teraz!";
    } else {
        btn.disabled = true;
        btn.innerText = "ŁADOWANIE TRANSFERU";
        
        // Zwykła matematyka na godziny/minuty/sekundy
        let h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        let s = Math.floor((timeLeft % (1000 * 60)) / 1000);
        timerText.innerText = `Odnawia się za: ${h}h ${m}m ${s}s`;
    }
}
