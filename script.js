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

// --- CUSTOMOWE POWIADOMIENIA ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    
    container.appendChild(toast);
    
    // Usuń element z DOM po zakończeniu animacji (4 sekundy)
    setTimeout(() => {
        if(toast.parentElement) toast.remove();
    }, 4000);
}

// --- CUSTOM MODAL (ZAMIAST CONFIRM) ---
function showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    overlay.innerHTML = `
        <div class="custom-modal">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="magic-btn btn-cancel" id="modal-cancel">Anuluj</button>
                <button class="magic-btn btn-confirm" id="modal-confirm">Potwierdź</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('modal-cancel').onclick = () => {
        overlay.remove();
    };
    
    document.getElementById('modal-confirm').onclick = () => {
        onConfirm();
        overlay.remove();
    };
}

// --- NAWIGACJA MOBILNA ---
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

// --- NAWIGACJA (SPA) ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active-nav');
    });

    const targetTab = document.getElementById(tabId);
    if(targetTab) targetTab.classList.add('active-tab');
    
    // Obsługa dodawania klasy active na menu
    if(event && event.currentTarget && event.currentTarget.classList.contains('nav-item')) {
        event.currentTarget.classList.add('active-nav');
    } else {
        const menuLink = document.querySelector(`.nav-item[onclick*="${tabId}"]`);
        if(menuLink) menuLink.classList.add('active-nav');
    }

    // Zamknij menu mobilne przy kliknięciu w link
    const navLinks = document.getElementById('nav-links');
    if(navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }

    // Reset animacji
    if(targetTab) {
        const animatedElements = targetTab.querySelectorAll('.slide-up');
        animatedElements.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; 
            el.style.animation = null; 
        });
    }
    
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
        
        showToast('Pomyślnie skopiowano adres IP serwera!', 'success');
        
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
    const navBal = document.getElementById('nav-balance');
    const mainBal = document.getElementById('main-balance');
    
    if(navBal) navBal.innerText = formattedBalance;
    if(mainBal) mainBal.innerText = formattedBalance;
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
        showToast("✅ Transfer udany! Zasilenie konta: +50 HC", 'success');
    }
}

// Otwieranie skrzyni
function openChest() {
    const now = new Date().getTime();
    if (now - lastChestClaim >= CHEST_COOLDOWN) {
        const reward = Math.floor(Math.random() * 141) + 10;
        balance += reward;
        lastChestClaim = now;
        saveData();
        updateUI();
        updateTimers();
        
        showToast(`🎉 Niesamowite! Znalazłeś w skrzyni <strong>${reward} HC</strong>!`, 'success');
    }
}

// --- SYSTEM CLICKERA (NOWOŚĆ) ---
function mineHC(event) {
    balance += 1;
    saveData();
    updateUI();
    
    // Tworzenie odlatującego tekstu
    const clickerCore = document.querySelector('.clicker-core');
    const rect = clickerCore.getBoundingClientRect();
    
    // Losowe przesunięcie w ramach kliknięcia
    const offsetX = (Math.random() - 0.5) * 40; 
    
    const floatText = document.createElement('div');
    floatText.className = 'floating-text';
    floatText.innerText = '+1 HC';
    
    // Ustawienie pozycji blisko myszki / dotyku
    let x = event.clientX;
    let y = event.clientY;
    
    // Fallback dla urzadzeń mobilnych
    if(x === undefined) {
        x = rect.left + (rect.width / 2);
        y = rect.top + (rect.height / 2);
    }
    
    floatText.style.left = `${x + offsetX}px`;
    floatText.style.top = `${y - 20}px`;
    
    document.body.appendChild(floatText);
    
    // Usunięcie po animacji
    setTimeout(() => {
        floatText.remove();
    }, 1000);
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

function buyTheme(themeName, price) {
    executePurchase(price, `Motyw: ${themeName}`, () => {
        applyTheme(themeName);
        saveData();
        showToast(`Pomyślnie zmieniono motyw na ${themeName}!`, 'success');
    });
}

function buyFont(fontName, price) {
    executePurchase(price, `Czcionka: ${fontName}`, () => {
        applyFont(fontName);
        saveData();
        showToast(`Pomyślnie aktywowano nową czcionkę!`, 'success');
    });
}

function executePurchase(price, itemName, successCallback) {
    if (balance >= price) {
        showConfirm('Weryfikacja transakcji', `Zatwierdź transfer: <strong>${price} HC</strong> za <strong>[${itemName}]</strong>?`, () => {
            balance -= price;
            successCallback();
            saveData();
            updateUI();
        });
    } else {
        const missing = price - balance;
        showToast(`❌ Błąd: Niewystarczająca ilość energii HC. Brakuje Ci <strong>${missing} HC</strong>!`, 'error');
    }
}
