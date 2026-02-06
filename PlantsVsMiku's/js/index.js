let gameWindow = null;

// Background music for main menu
const audioSrc = encodeURI('mp3/19. Choose Your Seeds IN-GAME.mp3');
const bgAudio = new Audio(audioSrc);
bgAudio.loop = true;
bgAudio.volume = 0.8;
bgAudio.muted = false;

function loadAudioSettings() {
    try {
        const v = localStorage.getItem('pvsm_volume');
        const m = localStorage.getItem('pvsm_muted');
        if (v !== null) bgAudio.volume = Math.min(1, Math.max(0, Number(v)));
        if (m !== null) bgAudio.muted = m === '1' || m === 'true';
    } catch (e) { }
}

loadAudioSettings();

// Try to play; if blocked, wait for first user interaction
bgAudio.play().catch(() => {
    const startOnUser = () => {
        bgAudio.play().catch(() => { });
        document.removeEventListener('click', startOnUser);
    };
    document.addEventListener('click', startOnUser);
});

document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const optionsBtn = document.getElementById('options-btn');
    const quitBtn = document.getElementById('quit-btn');

    playBtn.addEventListener('click', () => {
        // stop menu music before navigating to the game in the same tab
        try { bgAudio.pause(); bgAudio.currentTime = 0; } catch (e) { }
        window.location.href = 'game.html';
    });

    // Modal elements
    const modal = document.getElementById('options-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const saveOptions = document.getElementById('save-options');
    const volumeInput = document.getElementById('volume');
    const muteCheckbox = document.getElementById('mute');
    let lastFocus = null;

    function openModal() {
        if (!modal) return;
        lastFocus = document.activeElement;
        // sync controls with audio state
        if (volumeInput) volumeInput.value = String(Math.round(bgAudio.volume * 100));
        if (muteCheckbox) muteCheckbox.checked = !!bgAudio.muted;

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        // focus the close button for accessibility
        modalClose && modalClose.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        try { lastFocus && lastFocus.focus(); } catch (e) { }
    }

    optionsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    modalClose && modalClose.addEventListener('click', closeModal);
    modalOverlay && modalOverlay.addEventListener('click', closeModal);

    // live update volume/mute controls for immediate feedback
    if (volumeInput) {
        volumeInput.addEventListener('input', (ev) => {
            const val = Number(ev.target.value) / 100;
            bgAudio.volume = Math.min(1, Math.max(0, val));
        });
    }
    if (muteCheckbox) {
        muteCheckbox.addEventListener('change', (ev) => {
            bgAudio.muted = !!ev.target.checked;
        });
    }

    saveOptions && saveOptions.addEventListener('click', () => {
        // persist and apply
        try {
            const vol = volumeInput ? Number(volumeInput.value) / 100 : bgAudio.volume;
            const muted = muteCheckbox ? !!muteCheckbox.checked : bgAudio.muted;
            bgAudio.volume = Math.min(1, Math.max(0, vol));
            bgAudio.muted = muted;
            localStorage.setItem('pvsm_volume', String(bgAudio.volume));
            localStorage.setItem('pvsm_muted', muted ? '1' : '0');
        } catch (e) { }
        closeModal();
    });

    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });

    quitBtn.addEventListener('click', () => {
        // Ask the game tab to close itself and its opener, then try to close both here.
        if (gameWindow && !gameWindow.closed) {
            try {
                gameWindow.postMessage({ type: 'close-all' }, '*');
            } catch (e) {
                // ignore
            }
            // Attempt to close the game tab from here as well
            try { gameWindow.close(); } catch (e) { }
        }

        // Attempt to close the main menu tab (may be blocked by browser but we try)
        try {
            window.open('', '_self');
            window.close();
        } catch (e) { }

        // Final fallback: send a delayed close in case the other attempts need time
        setTimeout(() => {
            try { window.close(); } catch (e) { }
        }, 300);
    });
});
