// --- STAN APLIKACJI ---
let balance = localStorage.getItem('hc_balance') ? parseInt(localStorage.getItem('hc_balance')) : 0;
let lastClaim = localStorage.getItem('hc_last_claim') ? parseInt(localStorage.getItem('hc_last_claim')) : 0;
let currentTheme = localStorage.getItem('hc_theme') || 'default';
let currentFont = localStorage.getItem('hc_font') || 'default';

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000;

// --- INICJALIZACJA ---
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    applyTheme(currentTheme);
    applyFont(currentFont);
    setInterval(updateTimer, 1000);
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

    // Automatycznie zamykaj menu na telefonach po kliknięciu
    if(window.innerWidth <= 768) {
        document.querySelector('.hamburger').classList.remove('active');
        document.querySelector('.nav-links').classList.remove('active-menu');
    }
}

// --- CUSTOM POWIADOMIENIA (TOASTY) ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Usuń po 3.5 sekundach
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300); // Po animacji CSS
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

    // Kasujemy poprzednie zdarzenia kliknięcia, aby uniknąć błędów
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
    navigator.clipboard.writeText("hypercraft.ivhs.pl").then(() => {
        const btnText = document.getElementById('ip-text');
        btnText.innerHTML = "<strong>IP SKOPIOWANE!</strong>";
        showToast("Skopiowano IP serwera do schowka!", "success");
        setTimeout(() => {
            btnText.innerHTML = "SKOPIUJ IP: <strong>hypercraft.ivhs.pl</strong>";
        }, 2000);
    });
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
        timerText.innerText = "Gotowość systemów: 100%";
        timerText.style.color = "#00ff88";
    } else {
        btn.disabled = true;
        btn.innerText = "ŁADOWANIE GENERATORA";
        timerText.style.color = "#888";
        
        const h = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        timerText.innerText = `Pozostały czas: ${h}h ${m}m ${s}s`;
    }
}

function saveData() {
    localStorage.setItem('hc_balance', balance);
    localStorage.setItem('hc_last_claim', lastClaim);
    localStorage.setItem('hc_theme', currentTheme);
    localStorage.setItem('hc_font', currentFont);
}

// --- SYSTEM ZAKUPÓW ---
function applyTheme(theme) {
    document.body.classList.remove('theme-toxic', 'theme-blood', 'theme-void');
    if (theme !== 'default') document.body.classList.add('theme-' + theme);
    currentTheme = theme;
}

function applyFont(font) {
    document.body.classList.remove('font-cyber', 'font-retro', 'font-ancient');
    if (font !== 'default') document.body.classList.add('font-' + font);
    currentFont = font;
}

function executePurchase(price, itemName, successCallback) {
    if (balance >= price) {
        showConfirm(`Zatwierdź transfer: ${price} HC za [${itemName}]?`, () => {
            balance -= price;
            successCallback();
            saveData();
            updateUI();
        });
    } else {
        showToast(`Błąd: Niewystarczająca ilość energii HC. Brakuje ${price - balance} HC.`, "error");
    }
}

function buyTheme(theme, price) {
    if (currentTheme === theme) return showToast("Ten motyw jest już aktywny.", "info");
    executePurchase(price, `Motyw: ${theme}`, () => {
        applyTheme(theme);
        if(theme === 'void') {
            showToast("CAŁUN PUSTKI ZAAKCEPTOWAŁ CIĘ.", "success");
        } else {
            showToast("Zmiana wizualna powiodła się.", "success");
        }
    });
}

function buyFont(font, price) {
    if (currentFont === font) return showToast("Ten styl czcionki jest już aktywny.", "info");
    executePurchase(price, `Czcionka: ${font}`, () => {
        applyFont(font);
        showToast("Pomyślnie zaktualizowano interfejs tekstowy.", "success");
    });
}

function buyBundle(bundle, price) {
    if (currentTheme === 'void' && currentFont === 'ancient') {
        return showToast("Masz już główne elementy tego pakietu!", "info");
    }
    executePurchase(price, "Pakiet Władcy Endu", () => {
        applyTheme('void');
        applyFont('ancient');
        showToast("Pakiet aktywowany! Zgłoś się po odbiór rangi.", "success");
    });
}
