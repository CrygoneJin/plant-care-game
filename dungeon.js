// dungeon.js — Höhle = Dungeon-Framework (Sprint 25)
// Klick auf cave-Zelle (Ernte-Modus) → 3-Raum-Dungeon öffnen

(function () {
    const ROOMS = [
        {
            id: 'bits',
            emoji: '🕯️',
            title: 'Die Bit-Kammer',
            text: 'Eine Kerze flackert. Überall siehst du 0 und 1. Das ist der Anfang von allem — aus Nullen und Einsen entsteht deine ganze Insel.',
            bg: '#1a0a2e',
            accent: '#7c3aed',
        },
        {
            id: 'kernel',
            emoji: '⚙️',
            title: 'Der Kernel-Saal',
            text: 'Riesige Zahnräder drehen sich lautlos. Der Kernel ist das Herz — er entscheidet wer sprechen darf und wer warten muss.',
            bg: '#0f1923',
            accent: '#0ea5e9',
        },
        {
            id: 'browser',
            emoji: '🌐',
            title: 'Das Browser-Tor',
            text: 'Eine Tür aus Licht. Hier lebst du! Deine Insel, deine NPCs, deine Blöcke — alles kommt durch dieses Tor in deine Welt.',
            bg: '#0a1f0a',
            accent: '#22c55e',
            last: true,
        },
    ];

    let currentRoom = 0;
    let rewardGiven = false;

    function open() {
        currentRoom = 0;
        rewardGiven = false;
        renderRoom();
        const el = document.getElementById('dungeon-overlay');
        if (el) el.classList.remove('hidden');
    }

    function renderRoom() {
        const room = ROOMS[currentRoom];
        const el = document.getElementById('dungeon-overlay');
        if (!el) return;

        el.style.background = room.bg + 'ee';

        const box = el.querySelector('.dungeon-box');
        if (box) box.style.borderColor = room.accent;

        const emojiEl = el.querySelector('.dungeon-emoji');
        if (emojiEl) emojiEl.textContent = room.emoji;

        const titleEl = el.querySelector('.dungeon-title');
        if (titleEl) titleEl.textContent = room.title;

        const textEl = el.querySelector('.dungeon-text');
        if (textEl) textEl.textContent = room.text;

        const counter = el.querySelector('.dungeon-counter');
        if (counter) counter.textContent = `Raum ${currentRoom + 1} / ${ROOMS.length}`;

        const btn = el.querySelector('.dungeon-next-btn');
        if (btn) {
            if (room.last) {
                btn.textContent = '💎 Schatz holen!';
                btn.style.background = room.accent;
            } else {
                btn.textContent = 'Weiter →';
                btn.style.background = room.accent;
            }
        }

        // Breadcrumb-Dots
        const dots = el.querySelectorAll('.dungeon-dot');
        dots.forEach((d, i) => {
            d.style.background = i <= currentRoom ? room.accent : '#444';
        });
    }

    function next() {
        if (currentRoom < ROOMS.length - 1) {
            currentRoom++;
            renderRoom();
        } else {
            giveReward();
            close();
        }
    }

    function giveReward() {
        if (rewardGiven) return;
        rewardGiven = true;
        // 3 Edelsteine ins Inventar
        if (window.addToInventory) {
            window.addToInventory('gem', 3);
            window.unlockMaterial && window.unlockMaterial('gem');
        }
        if (window.showToast) {
            window.showToast('💎💎💎 Du hast die Tiefe der Insel entdeckt! 3 Edelsteine gefunden!', 4000);
        }
        if (window.trackEvent) {
            window.trackEvent('dungeon_completed', { rooms: ROOMS.length });
        }
    }

    function close() {
        const el = document.getElementById('dungeon-overlay');
        if (el) el.classList.add('hidden');
    }

    // Public API
    window.DUNGEON = { open, close, next };
})();
