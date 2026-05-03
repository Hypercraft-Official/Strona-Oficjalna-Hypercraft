// --- STAN ---
let balance = parseInt(localStorage.getItem('hc_balance') || 0);
let lastClaim = parseInt(localStorage.getItem('hc_last_claim') || 0);
let lastChest = parseInt(localStorage.getItem('hc_last_chest') || 0);

// --- INICJALIZACJA ---
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setInterval(updateTimers, 1000);
});

// --- POWIADOMIENIA ---
function notify(msg, type = 'error') {
    const notifier = document.getElementById('hyper-notifier');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="font-size: 0.6rem; color: #888; font-weight: 800;">POWIADOMIENIE SYSTEMOWE</div>
        <div style="font-weight: 600;">${msg}</div>
    `;
    notifier.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- NAWIGACJA ---
function switchTab(id, el) {
    // Ukryj sekcje
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    // Dezaktywuj przyciski nav
    document.querySelectorAll('.nav-slot').forEach(s => s.classList.remove('active-slot'));

    // Aktywuj wybrane
    document.getElementById(id).classList.add('active-tab');
    if(el) el.classList.add('active-slot');

    // Feedback dotykowy
    if (navigator.vibrate) navigator.vibrate(15);
    window.scrollTo(0, 0);
}

// --- KOPIOWANIE ---
function copyIP() {
    const ip = "HYPERCRAFT.IVHS.PL";
    navigator.clipboard.writeText(ip).then(() => {
        notify("IP SKOPIOWANE DO SCHOWKA!", "success");
    });
}

// --- EKONOMIA ---
function updateUI() {
    const display = balance.toLocaleString();
    document.getElementById('nav-balance').innerText = display;
    localStorage.setItem('hc_balance', balance);
}

function claimDaily() {
    const now = Date.now();
    if (now - lastClaim > 86400000) {
        balance += 50;
        lastClaim = now;
        localStorage.setItem('hc_last_claim', lastClaim);
        updateUI();
        notify("ODEBRANO 50 HC!", "success");
    } else {
        notify("TWOJE ZASYPY SĄ JESZCZE PEŁNE!");
    }
}

function openChest() {
    const now = Date.now();
    if (now - lastChest > 14400000) { // 4h
        const win = Math.floor(Math.random() * 191) + 10;
        balance += win;
        lastChest = now;
        localStorage.setItem('hc_last_chest', lastChest);
        updateUI();
        notify(`LUCKY BOX: +${win} HC!`, "success");
    } else {
        notify("SKRZYNIA JEST PUSTA!");
    }
}

function buyItem(name, price) {
    if (balance >= price) {
        balance -= price;
        updateUI();
        notify(`ZAKUPIONO: ${name}!`, "success");
    } else {
        notify(`BRAK ŚRODKÓW! BRAKUJE ${price - balance} HC`);
    }
}

// --- TIMERY ---
function updateTimers() {
    const now = Date.now();
    
    // Dzienny
    const dailyTag = document.getElementById('timer-daily');
    if(now - lastClaim < 86400000) {
        dailyTag.innerText = "ŁADOWANIE...";
        dailyTag.style.color = "#555";
    } else {
        dailyTag.innerText = "GOTOWE";
        dailyTag.style.color = "#00f3ff";
    }

    // Skrzynia
    const chestTag = document.getElementById('timer-chest');
    if(now - lastChest < 14400000) {
        chestTag.innerText = "PUSTE";
        chestTag.style.color = "#555";
    } else {
        chestTag.innerText = "GOTOWE";
        chestTag.style.color = "#ff0055";
    }
}
