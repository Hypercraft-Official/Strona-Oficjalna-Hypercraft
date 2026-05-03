let balance = localStorage.getItem('hc_balance') ? parseInt(localStorage.getItem('hc_balance')) : 0;
let lastClaim = localStorage.getItem('hc_last_claim') ? parseInt(localStorage.getItem('hc_last_claim')) : 0;
let lastChestClaim = localStorage.getItem('hc_last_chest') ? parseInt(localStorage.getItem('hc_last_chest')) : 0;

const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000;
const CHEST_COOLDOWN = 4 * 60 * 60 * 1000;

document.addEventListener("DOMContentLoaded", () => {
    updateUI();
    setInterval(updateTimers, 1000);
    updateTimers();
});

function updateUI() {
    document.getElementById('nav-balance').innerText = balance.toLocaleString();
    if(document.getElementById('main-balance')) {
        document.getElementById('main-balance').innerText = balance.toLocaleString();
    }
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function switchTab(id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.getElementById(id).classList.add('active-tab');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    event.currentTarget.classList.add('active-nav');
}

function claimDaily() {
    const now = Date.now();
    if (now - lastClaim >= CLAIM_COOLDOWN) {
        balance += 50;
        lastClaim = now;
        localStorage.setItem('hc_balance', balance);
        localStorage.setItem('hc_last_claim', lastClaim);
        updateUI();
        showToast("Odebrano 50 HC!");
    }
}

function openChest() {
    const now = Date.now();
    if (now - lastChestClaim >= CHEST_COOLDOWN) {
        const reward = Math.floor(Math.random() * 141) + 10;
        balance += reward;
        lastChestClaim = now;
        localStorage.setItem('hc_balance', balance);
        localStorage.setItem('hc_last_chest', lastChestClaim);
        updateUI();
        showToast(`Znaleziono ${reward} HC!`);
    }
}

function updateTimers() {
    const now = Date.now();
    // Prosta obsługa timerów w tekście przycisków lub pod nimi
    const dailyLeft = CLAIM_COOLDOWN - (now - lastClaim);
    if(dailyLeft > 0) {
        document.getElementById('claim-btn').disabled = true;
        document.getElementById('timer-text').innerText = "Dostępne za: " + new Date(dailyLeft).toISOString().substr(11, 8);
    } else {
        document.getElementById('claim-btn').disabled = false;
        document.getElementById('timer-text').innerText = "Gotowe!";
    }
}

function copyIP() {
    navigator.clipboard.writeText("hypercraft.ivhs.pl");
    showToast("Skopiowano IP!");
}
