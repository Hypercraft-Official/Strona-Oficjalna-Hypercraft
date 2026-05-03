// --- STAN APLIKACJI ---
let balance = localStorage.getItem('hc_balance') ? parseInt(localStorage.getItem('hc_balance')) : 0;
let lastClaim = localStorage.getItem('hc_last_claim') ? parseInt(localStorage.getItem('hc_last_claim')) : 0;
let lastChestClaim = localStorage.getItem('hc_last_chest') ? parseInt(localStorage.getItem('hc_last_chest')) : 0;

let currentTheme = localStorage.getItem('hc_theme') || 'default';
let currentFont = localStorage.getItem('hc_font') || 'default';

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000; // 24h
const CHEST_COOLDOWN = 4 * 60 * 60 * 1000; // 4h

// --- INICJALIZACJA ---
document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    applyTheme(currentTheme);
    applyFont(currentFont);
    setInterval(updateTimers, 1000);
    updateTimers(); 
});

// --- NAWIGACJA (SPA) ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active-nav');
    });

    const targetTab = document.getElementById(tabId);
    targetTab.classList.add('active-tab');
    
    if(event && event.currentTarget.classList.contains('nav-item')) {
        event.currentTarget.classList.add('active-nav');
    } else {
        // Jeśli kliknięto z widgetu zamiast z menu
        const menuLink = document.querySelector(`.nav-item[onclick*="${tabId}"]`);
        if(menuLink) menuLink.classList.add('active-nav');
    }

    // Reset animacji dla efektu pojawiania się
    const animatedElements = targetTab.querySelectorAll('.slide-up');
    animatedElements.forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; 
        el.style.animation = null; 
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- KOPIOWANIE IP ---
function copyIP() {
    navigator.clipboard.writeText("hypercraft.ivhs.pl").then(() => {
        const btnText = document.getElementById('ip-text');
        btnText.innerHTML = "<strong>IP SKOPIOWANE!</strong>";
        
        const btn = document.querySelector('.copy-ip-btn');
        btn.style.background = 'rgba(0, 255, 136, 0.3)';
        btn.style.borderColor = '#00ff88';
        
        setTimeout(() => {
            btnText.innerHTML = "SKOPIUJ IP: <strong>hypercraft.ivhs.pl</strong>";
            btn.style.background = '';
            btn.style.borderColor = '';
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

// Dzienny odbior
function claimDaily() {
    const now = new Date().getTime();
    if (now - lastClaim >= CLAIM_COOLDOWN) {
        balance += 50;
        lastClaim = now;
        saveData();
        updateUI();
        updateTimers();
        alert("✅ Transfer udany! Zasilenie konta: +50 HC");
    }
}

// Otwieranie skrzyni (Losowe 10-150 HC co 4 godziny)
function openChest() {
    const now = new Date().getTime();
    if (now - lastChestClaim >= CHEST_COOLDOWN) {
        // Losuj kwote od 10 do 150
        const reward = Math.floor(Math.random() * 141) + 10;
        balance += reward;
        lastChestClaim = now;
        saveData();
        updateUI();
        updateTimers();
        
        // Efekt specjalny
        alert(`🎉 Niesamowite! Znalazłeś w skrzyni ${reward} HC!`);
    }
}

// Aktualizacja obu timerów
function updateTimers() {
    const now = new Date().getTime();

    // Timer Dzienny
    const btnDaily = document.getElementById('claim-btn');
    const timerTextDaily = document.getElementById('timer-text');
    if (btnDaily && timerTextDaily) {
        const timeLeftDaily = CLAIM_COOLDOWN - (now - lastClaim);
        if (timeLeftDaily <= 0) {
            btnDaily.disabled = false;
            btnDaily.innerText = "Odbierz (50 HC)";
            timerTextDaily.innerText = "Gotowość systemów: 100%";
            timerTextDaily.style.color = "#00ff88";
        } else {
            btnDaily.disabled = true;
            btnDaily.innerText = "ŁADOWANIE GENERATORA";
            timerTextDaily.style.color = "#888";
            timerTextDaily.innerText = formatTime(timeLeftDaily);
        }
    }

    // Timer Skrzyni
    const btnChest = document.getElementById('chest-btn');
    const timerTextChest = document.getElementById('chest-timer-text');
    if (btnChest && timerTextChest) {
        const timeLeftChest = CHEST_COOLDOWN - (now - lastChestClaim);
        if (timeLeftChest <= 0) {
            btnChest.disabled = false;
            btnChest.innerText = "Otwórz Skrzynię";
            timerTextChest.innerText = "Skrzynia gotowa do otwarcia!";
            timerTextChest.style.color = "#00ff88";
        } else {
            btnChest.disabled = true;
            btnChest.innerText = "SKRZYNIA JEST PUSTA";
            timerTextChest.style.color = "#888";
            timerTextChest.innerText = `Kolejna dostawa za: ${formatTime(timeLeftChest)}`;
        }
    }
}

function formatTime(ms) {
    const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
}

function saveData() {
    localStorage.setItem('hc_balance', balance);
    localStorage.setItem('hc_last_claim', lastClaim);
    localStorage.setItem('hc_last_chest', lastChestClaim);
    localStorage.setItem('hc_theme', currentTheme);
    localStorage.setItem('hc_font', currentFont);
}

// --- SYSTEM ZAKUPÓW ---
function applyTheme(theme) {
    document.body.classList.remove('theme-toxic', 'theme-blood', 'theme-void', 'theme-neon');
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
        alert(`❌ Błąd: Niewystarczająca ilość energii HC. Brakuje Ci ${price - balance} HC.`);
    }
}

function buyTheme(theme, price) {
    if (currentTheme === theme) return alert("⚠️ Ten motyw jest już aktywny.");
    executePurchase(price, `Motyw: ${theme}`, () => {
        applyTheme(theme);
        alert(theme === 'void' ? "🌌 CAŁUN PUSTKI ZAAKCEPTOWAŁ CIĘ." : "🎨 Zmiana wizualna powiodła się.");
    });
}

function buyFont(font, price) {
    if (currentFont === font) return alert("⚠️ Ten styl czcionki jest już aktywny.");
    executePurchase(price, `Czcionka: ${font}`, () => {
        applyFont(font);
        alert("🔤 Pomyślnie zaktualizowano interfejs tekstowy.");
    });
}
