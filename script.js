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

// --- NAWIGACJA (SPA) ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active-nav'));

    document.getElementById(tabId).classList.add('active-tab');
    event.currentTarget.classList.add('active-nav');
}

// --- KOPIOWANIE IP ---
function copyIP() {
    navigator.clipboard.writeText("hypercraft.ivhs.pl").then(() => {
        const btnText = document.getElementById('ip-text');
        btnText.innerHTML = "<strong>IP SKOPIOWANE!</strong>";
        setTimeout(() => {
            btnText.innerHTML = "SKOPIUJ IP: <strong>hypercraft.ivhs.pl</strong>";
        }, 2000);
    });
}

// --- EKONOMIA (HYPERCOINS) ---
function updateUI() {
    // Formatowanie z przecinkami dla tysięcy
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
        alert("Transfer udany! Zasilenie konta: +50 HC");
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
        if (confirm(`Zatwierdź transfer: ${price} HC za [${itemName}]?`)) {
            balance -= price;
            successCallback();
            saveData();
            updateUI();
        }
    } else {
        alert(`Błąd: Niewystarczająca ilość energii HC. Brakuje ${price - balance} HC.`);
    }
}

function buyTheme(theme, price) {
    if (currentTheme === theme) return alert("Ten motyw jest już aktywny.");
    executePurchase(price, `Motyw: ${theme}`, () => {
        applyTheme(theme);
        alert(theme === 'void' ? "CAŁUN PUSTKI ZAAKCEPTOWAŁ CIĘ." : "Zmiana wizualna powiodła się.");
    });
}

function buyFont(font, price) {
    if (currentFont === font) return alert("Ten styl czcionki jest już aktywny.");
    executePurchase(price, `Czcionka: ${font}`, () => {
        applyFont(font);
        alert("Pomyślnie zaktualizowano interfejs tekstowy.");
    });
}

function buyBundle(bundle, price) {
    if (currentTheme === 'void' && currentFont === 'ancient') {
        return alert("Masz już główne elementy tego pakietu!");
    }
    executePurchase(price, "Pakiet Władcy Endu", () => {
        applyTheme('void');
        applyFont('ancient');
        alert("Pakiet aktywowany! Skontaktuj się z administracją na serwerze, by odebrać rangę VIP.");
    });
}