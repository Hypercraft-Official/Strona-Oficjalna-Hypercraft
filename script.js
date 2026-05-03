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
    updateTimer(); // Wywołanie od razu, by nie było 1 sekundy opóźnienia
});

// --- NAWIGACJA (SPA) ---
function switchTab(tabId) {
    // Resetowanie klas aktywnych
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active-nav');
    });

    // Dodanie klasy aktywnej do wybranego elementu
    const targetTab = document.getElementById(tabId);
    targetTab.classList.add('active-tab');
    
    if(event) {
        event.currentTarget.classList.add('active-nav');
    }

    // Resetowanie animacji (by odtwarzały się od nowa po zmianie zakładki)
    const animatedElements = targetTab.querySelectorAll('.slide-up');
    animatedElements.forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = null; 
    });
    
    // Smooth scroll na samą górę podczas zmiany zakładki (przydatne na telefonach)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- KOPIOWANIE IP ---
function copyIP() {
    navigator.clipboard.writeText("hypercraft.ivhs.pl").then(() => {
        const btnText = document.getElementById('ip-text');
        btnText.innerHTML = "<strong>IP SKOPIOWANE!</strong>";
        
        // Dodatkowy efekt wizualny na przycisku
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
        alert("✅ Transfer udany! Zasilenie konta: +50 HC");
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
        
        // Formatowanie czasu z zerami wiodącymi (np. 05m zamiast 5m)
        const formattedH = h.toString().padStart(2, '0');
        const formattedM = m.toString().padStart(2, '0');
        const formattedS = s.toString().padStart(2, '0');
        
        timerText.innerText = `Pozostały czas: ${formattedH}h ${formattedM}m ${formattedS}s`;
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
        alert(`❌ Błąd: Niewystarczająca ilość energii HC. Brakuje ${price - balance} HC.`);
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

function buyBundle(bundle, price) {
    if (currentTheme === 'void' && currentFont === 'ancient') {
        return alert("⚠️ Masz już główne elementy tego pakietu!");
    }
    executePurchase(price, "Pakiet Władcy Endu", () => {
        applyTheme('void');
        applyFont('ancient');
        alert("👑 Pakiet aktywowany! Skontaktuj się z administracją na serwerze, by odebrać rangę VIP.");
    });
}
