// === TTS — Hoerspiele & Sprachausgabe ===
// Zweite Zellteilung: aus game.js extrahiert.
// Cloud TTS via Worker /tts (OpenAI tts-1), Fallback: Web Speech API.
// Events ueber window.INSEL_BUS: 'tts:start', 'tts:end'
(function () {
    'use strict';

    var HOERSPIELE = window.INSEL_STORIES || {};
    var playedHoerspiele = JSON.parse(localStorage.getItem('insel-hoerspiele') || '[]');

    var hoerspielSpeaking = false;
    var hoerspielAborted = false;
    var hoerspielAudio = null;

    // TTS: Emoji und Markup aus Text strippen fuer Sprachausgabe
    function stripForTTS(text) {
        return text
            .replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27BF}]|[\u{FE00}-\u{FEFF}]|[\u{1F900}-\u{1F9FF}]/gu, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\u2014/g, '\u2013')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function stopHoerspiel() {
        if (!hoerspielSpeaking) return;
        hoerspielAborted = true;
        if (hoerspielAudio) { hoerspielAudio.pause(); hoerspielAudio = null; }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        hoerspielSpeaking = false;
        if (window.INSEL_SOUND) window.INSEL_SOUND.setMasterVolume(1.0);
        if (window.showToast) window.showToast('\uD83C\uDFAD H\u00F6rspiel gestoppt');
        if (window.INSEL_BUS) window.INSEL_BUS.emit('tts:end', { aborted: true });
    }

    // Stimme + Sprache aus Zeile extrahieren
    function detectVoice(line) {
        if (line.indexOf('Lanz:') >= 0) return { voice: 'lanz', lang: 'de' };
        if (line.indexOf('Precht:') >= 0) return { voice: 'precht', lang: 'de' };
        if (line.indexOf('Merz:') >= 0) return { voice: 'merz', lang: 'de' };
        if (line.indexOf('Trump:') >= 0) return { voice: 'trump', lang: 'en' };
        if (line.indexOf('Musk:') >= 0) return { voice: 'musk', lang: 'en' };
        if (line.indexOf('Mephisto:') >= 0) return { voice: 'mephisto', lang: 'de' };
        if (line.indexOf('Kr\u00F6mer:') >= 0) return { voice: 'echo', lang: 'de' };
        if (line.indexOf('B\u00FCker:') >= 0) return { voice: 'alloy', lang: 'de' };
        if (line.indexOf('K\u00FCckens:') >= 0) return { voice: 'nova', lang: 'de' };
        if (line.indexOf('Tommy:') >= 0) return { voice: 'shimmer', lang: 'de' };
        if (line.indexOf('Lesch:') >= 0) return { voice: 'nova', lang: 'de' };
        if (line.indexOf('Feynman:') >= 0) return { voice: 'fable', lang: 'de' };
        if (line.indexOf('Sartre:') >= 0) return { voice: 'fable', lang: 'fr' };
        if (line.indexOf('Machiavelli:') >= 0) return { voice: 'onyx', lang: 'it' };
        if (line.indexOf('SpongeBob:') >= 0) return { voice: 'default', lang: 'de' };
        if (line.indexOf('Python:') >= 0) return { voice: 'default', lang: 'de' };
        if (line.indexOf('JavaScript:') >= 0) return { voice: 'shimmer', lang: 'de' };
        if (line.indexOf('TypeScript:') >= 0) return { voice: 'echo', lang: 'de' };
        if (line.indexOf('Bernd:') >= 0) return { voice: 'echo', lang: 'de' };
        if (line.indexOf('Elefant:') >= 0) return { voice: 'nova', lang: 'de' };
        if (line.indexOf('Neinhorn:') >= 0) return { voice: 'shimmer', lang: 'de' };
        return { voice: 'default', lang: 'de' };
    }

    // Cloud TTS: Text -> MP3 via Worker
    function speakCloudTTS(text, voiceInfo) {
        var proxy = (window.INSEL_CONFIG && window.INSEL_CONFIG.proxy) || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
        return fetch(proxy + '/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, voice: voiceInfo.voice, lang: voiceInfo.lang, speed: 1.0 }),
        }).then(function (r) {
            if (!r.ok) throw new Error('TTS ' + r.status);
            return r.blob();
        }).then(function (blob) {
            return new Promise(function (resolve, reject) {
                var url = URL.createObjectURL(blob);
                var audio = new Audio(url);
                hoerspielAudio = audio;
                audio.onended = function () { URL.revokeObjectURL(url); hoerspielAudio = null; resolve(); };
                audio.onerror = function () { URL.revokeObjectURL(url); hoerspielAudio = null; reject(); };
                audio.play().catch(reject);
            });
        });
    }

    // Fallback: Web Speech API
    function speakBrowserTTS(text, lang) {
        return new Promise(function (resolve) {
            if (!window.speechSynthesis) { resolve(); return; }
            var utter = new SpeechSynthesisUtterance(text);
            utter.lang = (lang === 'en') ? 'en-US' : (lang === 'fr') ? 'fr-FR' : (lang === 'it') ? 'it-IT' : 'de-DE';
            utter.rate = 0.95;
            utter.onend = function () { resolve(); };
            utter.onerror = function () { resolve(); };
            window.speechSynthesis.speak(utter);
        });
    }

    function speakLines(lines, onDone) {
        if (window.INSEL_SOUND && window.INSEL_SOUND.isMuted()) {
            if (onDone) onDone();
            return;
        }
        hoerspielSpeaking = true;
        hoerspielAborted = false;
        if (window.INSEL_SOUND) window.INSEL_SOUND.setMasterVolume(0.15);
        if (window.INSEL_BUS) window.INSEL_BUS.emit('tts:start', { lines: lines.length });

        var index = 0;
        function speakNext() {
            if (hoerspielAborted || index >= lines.length) {
                hoerspielSpeaking = false;
                hoerspielAborted = false;
                if (window.INSEL_SOUND) window.INSEL_SOUND.setMasterVolume(1.0);
                if (window.INSEL_BUS) window.INSEL_BUS.emit('tts:end', { aborted: false });
                if (onDone) onDone();
                return;
            }
            var text = stripForTTS(lines[index]);
            if (window.showToast) window.showToast(lines[index], 4000);
            if (index === 0 && window.soundAchievement) window.soundAchievement();
            var voice = detectVoice(lines[index]);
            index++;

            if (!text || (window.INSEL_SOUND && window.INSEL_SOUND.isMuted())) { setTimeout(speakNext, 500); return; }

            speakCloudTTS(text, voice).catch(function () {
                return speakBrowserTTS(text, voice.lang);
            }).then(function () {
                setTimeout(speakNext, 400);
            });
        }
        speakNext();
    }

    function maybeHoerspiel(stats) {
        var key = null;
        if (stats.total === 1 && playedHoerspiele.indexOf('firstBlock') < 0) key = 'firstBlock';
        else if (stats.total === 10 && playedHoerspiele.indexOf('tenBlocks') < 0) key = 'tenBlocks';
        else if (stats.total === 50 && playedHoerspiele.indexOf('fiftyBlocks') < 0) key = 'fiftyBlocks';
        else if (stats.total === 75 && playedHoerspiele.indexOf('talkshow') < 0) key = 'talkshow';
        else if (stats.total === 100 && playedHoerspiele.indexOf('hundredBlocks') < 0) key = 'hundredBlocks';
        else if (stats.percent === 50 && playedHoerspiele.indexOf('halfIsland') < 0) key = 'halfIsland';
        else if (stats.percent >= 100 && playedHoerspiele.indexOf('fullIsland') < 0) key = 'fullIsland';
        var hasMephisto = window.INSEL_CHARACTERS && window.INSEL_CHARACTERS.mephisto;
        if (!key && stats.total >= 25 && playedHoerspiele.indexOf('podcast_lanz') < 0 && hasMephisto) key = 'podcast_lanz';
        else if (!key && stats.total >= 40 && playedHoerspiele.indexOf('podcast_s1e2_schroeder') < 0 && hasMephisto) key = 'podcast_s1e2_schroeder';
        else if (!key && stats.total >= 60 && playedHoerspiele.indexOf('podcast_s1e3_bueker') < 0 && hasMephisto) key = 'podcast_s1e3_bueker';
        else if (!key && stats.total >= 80 && playedHoerspiele.indexOf('podcast_s1e4_nachts') < 0 && hasMephisto) key = 'podcast_s1e4_nachts';
        else if (!key && stats.total >= 90 && playedHoerspiele.indexOf('podcast_s1e5_krapweis') < 0 && hasMephisto) key = 'podcast_s1e5_krapweis';
        else if (!key && stats.percent >= 75 && playedHoerspiele.indexOf('podcast_lesch') < 0 && hasMephisto) key = 'podcast_lesch';

        if (!key) return;

        playedHoerspiele.push(key);
        localStorage.setItem('insel-hoerspiele', JSON.stringify(playedHoerspiele));

        var lines = HOERSPIELE[key];
        speakLines(lines);
        if (window.trackEvent) window.trackEvent('hoerspiel', { scene: key, blocks: stats.total });
    }

    // Exports via window.INSEL_TTS
    window.INSEL_TTS = {
        get hoerspielSpeaking() { return hoerspielSpeaking; },
        stripForTTS: stripForTTS,
        stopHoerspiel: stopHoerspiel,
        detectVoice: detectVoice,
        speakCloudTTS: speakCloudTTS,
        speakBrowserTTS: speakBrowserTTS,
        speakLines: speakLines,
        maybeHoerspiel: maybeHoerspiel,
    };

    // Flache Exports fuer direkten Zugriff
    window.stripForTTS = stripForTTS;
    window.stopHoerspiel = stopHoerspiel;
    window.detectVoice = detectVoice;
    window.speakCloudTTS = speakCloudTTS;
    window.speakBrowserTTS = speakBrowserTTS;
    window.speakLines = speakLines;
    window.maybeHoerspiel = maybeHoerspiel;

})();
