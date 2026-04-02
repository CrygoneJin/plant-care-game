// === A/B TEST MYTHOLOGIE (#38) ===
// 4 Genesis-Varianten: Bibel, Griechisch, Maori, Nordisch
// Wird VOR game.js geladen. Exportiert window.INSEL_AB.
(function () {
    'use strict';

    // --- Die 4 Mythologie-Varianten ---
    // Jede hat 7 Schritte die den Genesis-Fortschritt begleiten:
    //   step 0: Urgrund (Tao-Platzierung)
    //   step 1: Spaltung (Tao → Yin/Yang)
    //   step 2: Energie (Qi entsteht)
    //   step 3: Element 1 (Wu Xing Metall)
    //   step 4: Element 2-3
    //   step 5: Element 4-5
    //   step 6: Vollendung (erste Crafts)
    var VARIANTS = {
        bible: {
            name: 'Bibel',
            steps: [
                { emoji: '💡', label: 'Licht',     toast: '💡 Es werde Licht!',                       badge: '💡',  tip: 'Tag 1: Licht' },
                { emoji: '🌅', label: 'Himmel',    toast: '🌅 Der Himmel trennt die Wasser!',          badge: '🌅',  tip: 'Tag 2: Himmel' },
                { emoji: '🌍', label: 'Erde',      toast: '🌍 Land und Meer entstehen!',               badge: '🌍',  tip: 'Tag 3: Erde & Meer' },
                { emoji: '⭐', label: 'Sterne',    toast: '⭐ Sonne, Mond und Sterne!',                badge: '⭐',  tip: 'Tag 4: Sterne' },
                { emoji: '🐟', label: 'Fische',    toast: '🐟 Das Meer füllt sich mit Leben!',         badge: '🐟',  tip: 'Tag 5: Fische & Vögel' },
                { emoji: '🧑', label: 'Mensch',    toast: '🧑 Der Mensch betritt die Insel!',          badge: '🧑',  tip: 'Tag 6: Mensch' },
                { emoji: '🕊️', label: 'Ruhetag',   toast: '🕊️ Und am siebten Tag war Ruhe.',          badge: '🕊️',  tip: 'Tag 7: Ruhetag' },
            ],
        },
        greek: {
            name: 'Griechisch',
            steps: [
                { emoji: '🌀', label: 'Chaos',       toast: '🌀 Am Anfang war das Chaos!',              badge: '🌀',  tip: 'Chaos — der Urgrund' },
                { emoji: '🌎', label: 'Gaia',        toast: '🌎 Gaia erwacht — die Erde lebt!',         badge: '🌎',  tip: 'Gaia — Mutter Erde' },
                { emoji: '⏳', label: 'Kronos',      toast: '⏳ Kronos verschlingt die Zeit!',           badge: '⏳',  tip: 'Kronos — Herr der Zeit' },
                { emoji: '🔱', label: 'Poseidon',    toast: '🔱 Poseidon erhebt sich aus den Wellen!',  badge: '🔱',  tip: 'Poseidon — Gott der Meere' },
                { emoji: '🔨', label: 'Hephaistos',  toast: '🔨 Hephaistos schmiedet in der Esse!',     badge: '🔨',  tip: 'Hephaistos — der Schmied' },
                { emoji: '🌾', label: 'Demeter',     toast: '🌾 Demeter lässt die Felder blühen!',      badge: '🌾',  tip: 'Demeter — Göttin der Ernte' },
                { emoji: '🔥', label: 'Prometheus',   toast: '🔥 Prometheus bringt das Feuer!',          badge: '🔥',  tip: 'Prometheus — Feuer für die Menschen' },
            ],
        },
        maori: {
            name: 'Maori',
            steps: [
                { emoji: '🕳️', label: 'Te Kore',    toast: '🕳️ Te Kore — die große Leere!',            badge: '🕳️', tip: 'Te Kore — das Nichts' },
                { emoji: '🌑', label: 'Te Pō',      toast: '🌑 Te Pō — die ewige Nacht!',              badge: '🌑',  tip: 'Te Pō — die Dunkelheit' },
                { emoji: '🌌', label: 'Ranginui',    toast: '🌌 Ranginui umarmt die Welt!',             badge: '🌌',  tip: 'Ranginui — Himmelsvater' },
                { emoji: '🌳', label: 'Tāne',       toast: '🌳 Tāne stemmt Himmel und Erde auseinander!', badge: '🌳', tip: 'Tāne — Gott der Wälder' },
                { emoji: '🌊', label: 'Tangaroa',    toast: '🌊 Tangaroa ruft das Meer!',               badge: '🌊',  tip: 'Tangaroa — Gott des Meeres' },
                { emoji: '🌱', label: 'Rongo',       toast: '🌱 Rongo sät den ersten Samen!',           badge: '🌱',  tip: 'Rongo — Gott der Pflanzen' },
                { emoji: '☀️', label: 'Te Ao',       toast: '☀️ Te Ao — die Welt des Lichts!',          badge: '☀️',  tip: 'Te Ao — die Welt erwacht' },
            ],
        },
        norse: {
            name: 'Nordisch',
            steps: [
                { emoji: '🌫️', label: 'Ginnungagap', toast: '🌫️ Ginnungagap — die gähnende Leere!',   badge: '🌫️', tip: 'Ginnungagap — der Abgrund' },
                { emoji: '🌲', label: 'Yggdrasil',    toast: '🌲 Yggdrasil — der Weltenbaum wächst!',   badge: '🌲',  tip: 'Yggdrasil — Weltenbaum' },
                { emoji: '👁️', label: 'Odin',         toast: '👁️ Odin opfert sein Auge für Weisheit!',  badge: '👁️',  tip: 'Odin — der Allvater' },
                { emoji: '⛏️', label: 'Zwerge',       toast: '⛏️ Die Zwerge hämmern in den Bergen!',     badge: '⛏️',  tip: 'Zwerge — Meisterschmiede' },
                { emoji: '⚡', label: 'Thor',          toast: '⚡ Thor schwingt Mjölnir!',                badge: '⚡',  tip: 'Thor — Donnergott' },
                { emoji: '🦊', label: 'Loki',          toast: '🦊 Loki schleicht durch die Schatten!',   badge: '🦊',  tip: 'Loki — der Trickster' },
                { emoji: '🐺', label: 'Ragnarök',      toast: '🐺 Ragnarök — das Ende ist der Anfang!',  badge: '🐺',  tip: 'Ragnarök — Götterdämmerung' },
            ],
        },
    };

    // --- Variante zuweisen ---
    var STORAGE_KEY = 'insel-ab-myth';
    var variant = null;

    // URL-Override: ?myth=bible|greek|maori|norse
    var params = new URLSearchParams(window.location.search);
    var urlMyth = params.get('myth');
    if (urlMyth && VARIANTS[urlMyth]) {
        variant = urlMyth;
        localStorage.setItem(STORAGE_KEY, variant);
    }

    // localStorage-Persistenz
    if (!variant) {
        variant = localStorage.getItem(STORAGE_KEY);
    }

    // Erstbesuch: Zufällig zuweisen
    if (!variant || !VARIANTS[variant]) {
        var keys = Object.keys(VARIANTS);
        variant = keys[Math.floor(Math.random() * keys.length)];
        localStorage.setItem(STORAGE_KEY, variant);
    }

    // --- Aktuellen Schritt berechnen (basierend auf Genesis-Fortschritt) ---
    // Wird von game.js aufgerufen wenn sich der Fortschritt ändert
    var currentStep = 0;

    function setStep(step) {
        if (step >= 0 && step < 7) {
            currentStep = step;
        }
    }

    function getStep() {
        return VARIANTS[variant].steps[currentStep] || VARIANTS[variant].steps[0];
    }

    function getAllSteps() {
        return VARIANTS[variant].steps;
    }

    // --- Tracking: Variante an Analytics melden ---
    function trackVariant() {
        if (window.INSEL_ANALYTICS && window.INSEL_ANALYTICS.trackEvent) {
            window.INSEL_ANALYTICS.trackEvent('ab_myth_variant', {
                variant: variant,
                name: VARIANTS[variant].name,
            });
        }
        // abGroup in analytics-localStorage setzen für collectTestData
        try {
            var analytics = JSON.parse(localStorage.getItem('insel-analytics') || '{}');
            analytics.abGroup = variant;
            analytics.abMythVariant = variant;
            localStorage.setItem('insel-analytics', JSON.stringify(analytics));
        } catch (e) { /* still */ }
    }

    // --- Export ---
    window.INSEL_AB = {
        variant: variant,
        variantName: VARIANTS[variant].name,
        variants: VARIANTS,
        getStep: getStep,
        getAllSteps: getAllSteps,
        setStep: setStep,
        currentStep: function () { return currentStep; },
        trackVariant: trackVariant,
    };

    // Beim Laden tracken
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackVariant);
    } else {
        trackVariant();
    }
})();
