// qr.js — Minimaler QR-Code-Generator (Version 2, EC Level L)
// Vanilla JS, kein Build-Schritt, kein Framework.
// Kapazität: bis zu 32 Bytes im Byte-Modus (reicht für https://schatzinsel.app)
// Verwendung: window.QRCode.draw(ctx, text, x, y, totalSize)
//   totalSize = Gesamtgröße inkl. Quiet-Zone (4 Module)

(function () {
    'use strict';

    // === GF(256) Galois-Feld-Arithmetik ===
    const GF_EXP = new Uint8Array(512);
    const GF_LOG = new Uint8Array(256);

    (function initGF() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
            GF_EXP[i] = x;
            GF_LOG[x] = i;
            x <<= 1;
            if (x & 0x100) x ^= 0x11d; // Primitiv-Polynom x^8+x^4+x^3+x^2+1
        }
        for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
    })();

    function gfMul(a, b) {
        if (!a || !b) return 0;
        return GF_EXP[GF_LOG[a] + GF_LOG[b]]; // Index-Bereich 0..508 durch EXP-Tabellen-Dopplung
    }

    function rsPolyMul(p, q) {
        const r = new Uint8Array(p.length + q.length - 1);
        for (let i = 0; i < p.length; i++)
            for (let j = 0; j < q.length; j++)
                r[i + j] ^= gfMul(p[i], q[j]);
        return r;
    }

    function rsGeneratorPoly(degree) {
        let g = new Uint8Array([1]);
        for (let i = 0; i < degree; i++)
            g = rsPolyMul(g, new Uint8Array([1, GF_EXP[i]]));
        return g;
    }

    function rsEncode(data, ecLen) {
        const gen = rsGeneratorPoly(ecLen);
        const msg = new Uint8Array(data.length + ecLen);
        msg.set(data);
        for (let i = 0; i < data.length; i++) {
            const c = msg[i];
            if (!c) continue;
            for (let j = 1; j < gen.length; j++)
                msg[i + j] ^= gfMul(gen[j], c);
        }
        return msg.slice(data.length);
    }

    // === Daten-Codierung (Byte-Modus) ===
    // Version 2, EC Level L: 34 Datenbytes, 10 Fehlerkorrektur-Bytes
    const DATA_CAP = 34;
    const EC_LEN = 10;
    const QR_N = 25; // 4*2 + 17

    function encodeBytes(text) {
        const raw = Array.from(text).map(c => c.charCodeAt(0));
        if (raw.length > 32) throw new Error('Text zu lang für QR Version 2 EC-L (max 32 Bytes)');

        const bits = [];
        function pushBits(v, n) {
            for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1);
        }

        pushBits(0b0100, 4);        // Byte-Modus
        pushBits(raw.length, 8);    // Zeichenanzahl (8 Bit für Version 1–9)
        raw.forEach(b => pushBits(b, 8));

        // Terminator + Byte-Auffüllung
        for (let i = 0; i < 4 && bits.length < DATA_CAP * 8; i++) bits.push(0);
        while (bits.length % 8) bits.push(0);

        // Füllbytes 0xEC/0x11 abwechselnd
        const PAD = [0xEC, 0x11];
        for (let pi = 0; bits.length < DATA_CAP * 8; pi++)
            pushBits(PAD[pi & 1], 8);

        const cw = new Uint8Array(DATA_CAP);
        for (let i = 0; i < DATA_CAP; i++) {
            let b = 0;
            for (let j = 0; j < 8; j++) b = (b << 1) | bits[i * 8 + j];
            cw[i] = b;
        }
        return cw;
    }

    // === Modul-Matrix ===

    function makeMatrix() {
        return {
            m:  Array.from({ length: QR_N }, () => new Int8Array(QR_N).fill(-1)),
            fn: Array.from({ length: QR_N }, () => new Uint8Array(QR_N)),
        };
    }

    function setMod(mat, r, c, dark, func) {
        if (r >= 0 && r < QR_N && c >= 0 && c < QR_N) {
            mat.m[r][c] = dark ? 1 : 0;
            if (func) mat.fn[r][c] = 1;
        }
    }

    function placeFinder(mat, row, col) {
        for (let dr = -1; dr <= 7; dr++) {
            for (let dc = -1; dc <= 7; dc++) {
                let dark;
                if (dr < 0 || dr > 6 || dc < 0 || dc > 6) {
                    dark = false; // Separator
                } else if (dr === 0 || dr === 6 || dc === 0 || dc === 6) {
                    dark = true;  // Äußere Rahmenlinie
                } else if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) {
                    dark = true;  // Inneres 3×3-Quadrat
                } else {
                    dark = false; // Ring-Lücke
                }
                setMod(mat, row + dr, col + dc, dark, true);
            }
        }
    }

    function placeAlignment(mat, row, col) {
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                const dark = dr === -2 || dr === 2 || dc === -2 || dc === 2 || (dr === 0 && dc === 0);
                setMod(mat, row + dr, col + dc, dark, true);
            }
        }
    }

    function placeTimingAndFormatReserve(mat) {
        // Timing-Muster (Zeile 6 und Spalte 6)
        for (let i = 8; i < QR_N - 8; i++) {
            setMod(mat, 6, i, i % 2 === 0, true);
            setMod(mat, i, 6, i % 2 === 0, true);
        }
        // Format-Info-Reservierung (oben links)
        for (let i = 0; i <= 8; i++) {
            setMod(mat, 8, i, false, true);
            setMod(mat, i, 8, false, true);
        }
        // Format-Info-Reservierung (oben rechts und unten links)
        for (let i = QR_N - 8; i < QR_N; i++) {
            setMod(mat, 8, i, false, true);
            setMod(mat, i, 8, false, true);
        }
        // Dunkles Modul (immer dunkel, Position fixes laut Spec)
        setMod(mat, QR_N - 8, 8, true, true);
    }

    function placeData(mat, codewords) {
        const bits = [];
        for (const b of codewords)
            for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);

        let bi = 0;
        let goingUp = true;
        for (let col = QR_N - 1; col >= 1; col -= 2) {
            if (col === 6) col--; // Timing-Spalte überspringen
            const start = goingUp ? QR_N - 1 : 0;
            const end   = goingUp ? -1 : QR_N;
            const step  = goingUp ? -1 : 1;
            for (let row = start; row !== end; row += step) {
                for (const c of [col, col - 1]) {
                    if (!mat.fn[row][c]) {
                        mat.m[row][c] = bi < bits.length ? bits[bi++] : 0;
                    }
                }
            }
            goingUp = !goingUp;
        }
    }

    // === Maskierung ===

    const MASK_FNS = [
        (r, c) => (r + c) % 2 === 0,
        (r, c) => r % 2 === 0,
        (r, c) => c % 3 === 0,
        (r, c) => (r + c) % 3 === 0,
        (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
        (r, c) => (r * c) % 2 + (r * c) % 3 === 0,
        (r, c) => ((r * c) % 2 + (r * c) % 3) % 2 === 0,
        (r, c) => ((r + c) % 2 + (r * c) % 3) % 2 === 0,
    ];

    function applyMask(mat, maskFn) {
        const result = mat.m.map(row => Int8Array.from(row));
        for (let r = 0; r < QR_N; r++)
            for (let c = 0; c < QR_N; c++)
                if (!mat.fn[r][c] && maskFn(r, c)) result[r][c] ^= 1;
        return result;
    }

    // === Format-Info (EC Level L = 01, BCH-Fehlerkorrektur) ===

    function computeFormatBits(maskNum) {
        const ec = 0b01; // EC Level L
        let fb = (ec << 3) | maskNum; // 5-Bit-Datenwort
        // BCH-Division, Generator-Polynom: 10100110111 (= x^10+x^8+x^5+x^4+x^2+x+1)
        let d = fb << 10;
        for (let i = 4; i >= 0; i--)
            if (d & (1 << (i + 10))) d ^= (0b10100110111 << i);
        // XOR-Maske laut Spec
        return ((fb << 10) | d) ^ 0b101010000010010;
    }

    function placeFormatInfo(modules, maskNum) {
        const fb = computeFormatBits(maskNum);

        // Erste Kopie: um den Finder oben links
        // Positionen (Zeile, Spalte) für Bits 14..0:
        const pos1 = [
            [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
            [7, 8],         [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
        ]; // (6,8) = Timing übersprungen
        for (let i = 0; i < 15; i++) {
            const [r, c] = pos1[i];
            modules[r][c] = (fb >> (14 - i)) & 1;
        }

        // Zweite Kopie: oben rechts (Bits 14..7) + unten links (Bits 6..0)
        for (let i = 0; i < 8; i++)
            modules[8][QR_N - 8 + i] = (fb >> (14 - i)) & 1;
        for (let i = 0; i < 7; i++)
            modules[QR_N - 7 + i][8] = (fb >> (6 - i)) & 1;

        // Dunkles Modul erzwingen
        modules[QR_N - 8][8] = 1;
    }

    // === Penalty-Score (Masken-Auswahl) ===

    function penaltyScore(modules) {
        let score = 0;
        const N = QR_N;

        // Regel 1: 5+ gleiche Module in einer Zeile/Spalte
        for (let r = 0; r < N; r++) {
            for (let startC = 0; startC < N; ) {
                let run = 1;
                while (startC + run < N && modules[r][startC + run] === modules[r][startC]) run++;
                if (run >= 5) score += 3 + (run - 5);
                startC += run;
            }
        }
        for (let c = 0; c < N; c++) {
            for (let startR = 0; startR < N; ) {
                let run = 1;
                while (startR + run < N && modules[startR + run][c] === modules[startR][c]) run++;
                if (run >= 5) score += 3 + (run - 5);
                startR += run;
            }
        }

        // Regel 2: 2×2-Blöcke gleicher Farbe
        for (let r = 0; r < N - 1; r++)
            for (let c = 0; c < N - 1; c++) {
                const v = modules[r][c];
                if (modules[r][c + 1] === v && modules[r + 1][c] === v && modules[r + 1][c + 1] === v)
                    score += 3;
            }

        // Regel 3: Finder-ähnliche Muster
        const p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
        const p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
        for (let r = 0; r < N; r++)
            for (let c = 0; c <= N - 11; c++) {
                let m1 = true, m2 = true;
                for (let k = 0; k < 11; k++) {
                    if (modules[r][c + k] !== p1[k]) m1 = false;
                    if (modules[r][c + k] !== p2[k]) m2 = false;
                }
                if (m1 || m2) score += 40;
            }
        for (let c = 0; c < N; c++)
            for (let r = 0; r <= N - 11; r++) {
                let m1 = true, m2 = true;
                for (let k = 0; k < 11; k++) {
                    if (modules[r + k][c] !== p1[k]) m1 = false;
                    if (modules[r + k][c] !== p2[k]) m2 = false;
                }
                if (m1 || m2) score += 40;
            }

        // Regel 4: Anteil dunkler Module
        let dark = 0;
        for (let r = 0; r < N; r++)
            for (let c = 0; c < N; c++)
                if (modules[r][c]) dark++;
        const pct = dark / (N * N);
        const prev5 = Math.floor(pct * 20) * 5;
        const next5 = prev5 + 5;
        score += Math.min(Math.abs(prev5 - 50), Math.abs(next5 - 50)) * 2;

        return score;
    }

    // === QR-Code generieren ===

    function generateQR(text) {
        const dataBytes = encodeBytes(text);
        const ecBytes   = rsEncode(dataBytes, EC_LEN);
        const allBytes  = new Uint8Array(DATA_CAP + EC_LEN);
        allBytes.set(dataBytes);
        allBytes.set(ecBytes, DATA_CAP);

        const mat = makeMatrix();
        placeFinder(mat, 0, 0);
        placeFinder(mat, 0, QR_N - 7);
        placeFinder(mat, QR_N - 7, 0);
        placeAlignment(mat, 18, 18); // Einziges Alignment-Pattern für Version 2
        placeTimingAndFormatReserve(mat);
        placeData(mat, allBytes);

        // Beste Maske bestimmen
        let bestMask = 0, bestScore = Infinity;
        for (let m = 0; m < 8; m++) {
            const masked    = applyMask(mat, MASK_FNS[m]);
            const withFmt   = masked.map(row => Int8Array.from(row));
            placeFormatInfo(withFmt, m);
            const s = penaltyScore(withFmt);
            if (s < bestScore) { bestScore = s; bestMask = m; }
        }

        const final = applyMask(mat, MASK_FNS[bestMask]);
        placeFormatInfo(final, bestMask);
        return final;
    }

    // === Zeichnen auf Canvas-Context ===
    // totalSize: Gesamtgröße inkl. 4-Modul Quiet-Zone auf jeder Seite
    function draw(ctx, text, x, y, totalSize) {
        try {
            const modules = generateQR(text);
            const n       = modules.length; // 25 für Version 2
            const QUIET   = 4;              // Pflicht-Quiet-Zone laut QR-Spec
            const s       = totalSize / (n + 2 * QUIET); // Pixel pro Modul
            const offset  = QUIET * s;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y, totalSize, totalSize);

            ctx.fillStyle = '#000000';
            for (let r = 0; r < n; r++)
                for (let c = 0; c < n; c++)
                    if (modules[r][c])
                        ctx.fillRect(
                            x + offset + c * s,
                            y + offset + r * s,
                            s, s
                        );
        } catch (e) {
            // Kein QR-Code → Postkarte trotzdem gültig (graceful degradation)
            console.warn('QR-Code-Generierung fehlgeschlagen:', e.message);
        }
    }

    window.QRCode = { draw };
})();
