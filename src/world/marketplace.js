// === INSEL MARKETPLACE — P2P Rare-Item-Handel via MMX/XCH ===
// Kindertauglich: Kinder sehen Seelenglut, Nerds sehen Crypto.
// DSGVO: Nur pseudonyme Blockchain-Adressen, kein PII.
// Deflationäre Arbeitswerttheorie: Tokens → Burn → Arbeit → Hawking-Strahlung.
(function () {
    'use strict';

    // --- Config ---
    var PROXY = (window.INSEL_CONFIG && window.INSEL_CONFIG.proxy) || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
    var WALLET_KEY = 'insel-wallet'; // localStorage: { mmx: 'mmx1...', xch: 'xch1...' }
    var PAGE_SIZE = 20;

    // --- Wallet (pseudonym, kein Account) ---
    function getWallet() {
        try { return JSON.parse(localStorage.getItem(WALLET_KEY) || '{}'); } catch (e) { return {}; }
    }

    function setWallet(wallet) {
        localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    }

    // --- API ---
    function apiGet(path) {
        return fetch(PROXY + path).then(function (r) { return r.json(); });
    }

    function apiPost(path, body) {
        return fetch(PROXY + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).then(function (r) { return r.json(); });
    }

    // --- Rare Items: LLM-gecraftete Unikate erkennen ---
    function isRareItem(materialId) {
        // LLM-gecraftete Materialien haben keinen Eintrag in MATERIALS
        var mats = window.INSEL_MATERIALS || {};
        return materialId && !mats[materialId];
    }

    // --- Marketplace UI ---
    var marketPanel = null;
    var isOpen = false;

    function createMarketPanel() {
        if (marketPanel) return marketPanel;

        var panel = document.createElement('div');
        panel.id = 'marketplace-panel';
        panel.style.cssText = 'display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
            'width:90vw;max-width:480px;max-height:80vh;background:#1a1a2e;color:#e0e0e0;border:2px solid #FF6B00;' +
            'border-radius:12px;z-index:10000;overflow-y:auto;font-family:monospace;padding:0;';

        panel.innerHTML = [
            '<div style="padding:16px;border-bottom:1px solid #333;">',
            '  <div style="display:flex;justify-content:space-between;align-items:center;">',
            '    <span style="font-size:16px;font-weight:bold;">🏪 Schwarzmarkt</span>',
            '    <button id="market-close" style="background:none;border:none;color:#888;font-size:20px;cursor:pointer;">&times;</button>',
            '  </div>',
            '  <div style="font-size:10px;color:#666;margin-top:4px;">Rare Items tauschen. Pseudonym. Kein Account.</div>',
            '</div>',
            '<div id="market-tabs" style="display:flex;border-bottom:1px solid #333;">',
            '  <button class="market-tab active" data-tab="browse" style="flex:1;padding:8px;background:none;border:none;color:#FF6B00;font-size:12px;cursor:pointer;border-bottom:2px solid #FF6B00;">Angebote</button>',
            '  <button class="market-tab" data-tab="sell" style="flex:1;padding:8px;background:none;border:none;color:#666;font-size:12px;cursor:pointer;">Verkaufen</button>',
            '  <button class="market-tab" data-tab="wallet" style="flex:1;padding:8px;background:none;border:none;color:#666;font-size:12px;cursor:pointer;">Wallet</button>',
            '</div>',
            '<div id="market-content" style="padding:16px;min-height:200px;">',
            '  <div id="market-browse"></div>',
            '  <div id="market-sell" style="display:none;"></div>',
            '  <div id="market-wallet" style="display:none;"></div>',
            '</div>',
        ].join('\n');

        document.body.appendChild(panel);
        marketPanel = panel;

        // Close
        panel.querySelector('#market-close').addEventListener('click', closeMarket);

        // Tabs
        var tabs = panel.querySelectorAll('.market-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function () {
                var target = this.getAttribute('data-tab');
                for (var j = 0; j < tabs.length; j++) {
                    tabs[j].style.color = '#666';
                    tabs[j].style.borderBottom = '2px solid transparent';
                    tabs[j].classList.remove('active');
                }
                this.style.color = '#FF6B00';
                this.style.borderBottom = '2px solid #FF6B00';
                this.classList.add('active');
                panel.querySelector('#market-browse').style.display = target === 'browse' ? '' : 'none';
                panel.querySelector('#market-sell').style.display = target === 'sell' ? '' : 'none';
                panel.querySelector('#market-wallet').style.display = target === 'wallet' ? '' : 'none';
                if (target === 'browse') loadListings();
                if (target === 'sell') renderSellTab();
                if (target === 'wallet') renderWalletTab();
            });
        }

        return panel;
    }

    function openMarket() {
        var panel = createMarketPanel();
        panel.style.display = '';
        isOpen = true;
        loadListings();
    }

    function closeMarket() {
        if (marketPanel) marketPanel.style.display = 'none';
        isOpen = false;
    }

    // --- Browse Tab: Listings laden ---
    function loadListings() {
        var container = document.getElementById('market-browse');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Lade Angebote...</div>';

        apiGet('/market/items?limit=' + PAGE_SIZE).then(function (data) {
            if (!data.items || data.items.length === 0) {
                container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Noch keine Angebote. Sei der Erste!</div>';
                return;
            }
            var html = '';
            for (var i = 0; i < data.items.length; i++) {
                var item = data.items[i];
                html += renderListingCard(item);
            }
            container.innerHTML = html;

            // Buy buttons
            var buyBtns = container.querySelectorAll('.market-buy-btn');
            for (var j = 0; j < buyBtns.length; j++) {
                buyBtns[j].addEventListener('click', function () {
                    handleBuy(this.getAttribute('data-id'));
                });
            }
        }).catch(function () {
            container.innerHTML = '<div style="text-align:center;color:#c33;padding:20px;">Keine Verbindung zum Schwarzmarkt.</div>';
        });
    }

    function renderListingCard(item) {
        var emoji = item.emoji || '🎁';
        var priceStr = '';
        if (item.price_mmx > 0) priceStr += item.price_mmx + ' MMX ';
        if (item.price_xch > 0) priceStr += item.price_xch + ' XCH ';
        if (item.price_glut > 0) priceStr += item.price_glut + ' Seelenglut ';
        if (!priceStr) priceStr = 'Gratis';

        return [
            '<div style="background:#0f0f1a;border:1px solid #333;border-radius:8px;padding:12px;margin-bottom:8px;">',
            '  <div style="display:flex;justify-content:space-between;align-items:center;">',
            '    <span style="font-size:20px;">' + emoji + '</span>',
            '    <div style="flex:1;margin-left:10px;">',
            '      <div style="font-weight:bold;font-size:12px;">' + escHtml(item.name || item.material_id) + '</div>',
            '      <div style="font-size:10px;color:#888;">' + escHtml(item.description || '') + '</div>',
            '    </div>',
            '    <div style="text-align:right;">',
            '      <div style="font-size:11px;color:#FF6B00;">' + escHtml(priceStr) + '</div>',
            '      <button class="market-buy-btn" data-id="' + item.id + '" style="margin-top:4px;background:#FF6B00;color:#fff;border:none;border-radius:4px;padding:4px 10px;font-size:10px;cursor:pointer;">Kaufen</button>',
            '    </div>',
            '  </div>',
            '  <div style="font-size:9px;color:#555;margin-top:4px;">von ' + (item.seller_addr ? item.seller_addr.slice(0, 10) + '...' : 'Anonym') + '</div>',
            '</div>',
        ].join('');
    }

    // --- Sell Tab: Eigene Rare Items listen ---
    function renderSellTab() {
        var container = document.getElementById('market-sell');
        if (!container) return;

        var wallet = getWallet();
        if (!wallet.mmx && !wallet.xch) {
            container.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">Erst Wallet einrichten (Tab: Wallet)</div>';
            return;
        }

        // Rare Items aus dem Inventar finden
        var rareItems = findPlayerRareItems();
        if (rareItems.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">Keine Rare Items. Crafte mit dem LLM etwas Einzigartiges!</div>';
            return;
        }

        var html = '<div style="font-size:11px;color:#888;margin-bottom:8px;">Deine seltenen Items:</div>';
        for (var i = 0; i < rareItems.length; i++) {
            var item = rareItems[i];
            html += [
                '<div style="background:#0f0f1a;border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">',
                '  <span style="font-size:16px;">' + (item.emoji || '✨') + ' ' + escHtml(item.name) + '</span>',
                '  <button class="market-list-btn" data-material="' + escHtml(item.id) + '" data-name="' + escHtml(item.name) + '" data-emoji="' + escHtml(item.emoji || '✨') + '" style="background:#3AAC59;color:#fff;border:none;border-radius:4px;padding:4px 10px;font-size:10px;cursor:pointer;">Anbieten</button>',
                '</div>',
            ].join('');
        }
        container.innerHTML = html;

        // List buttons
        var listBtns = container.querySelectorAll('.market-list-btn');
        for (var j = 0; j < listBtns.length; j++) {
            listBtns[j].addEventListener('click', function () {
                handleList(this.getAttribute('data-material'), this.getAttribute('data-name'), this.getAttribute('data-emoji'));
            });
        }
    }

    function findPlayerRareItems() {
        // LLM-gecraftete Materialien aus localStorage
        var rares = [];
        try {
            var stored = JSON.parse(localStorage.getItem('insel-llm-materials') || '{}');
            for (var key in stored) {
                if (stored.hasOwnProperty(key)) {
                    rares.push({
                        id: key,
                        name: stored[key].name || key,
                        emoji: stored[key].emoji || '✨',
                    });
                }
            }
        } catch (e) { /* still */ }
        return rares;
    }

    // --- Wallet Tab ---
    function renderWalletTab() {
        var container = document.getElementById('market-wallet');
        if (!container) return;

        var wallet = getWallet();

        container.innerHTML = [
            '<div style="font-size:11px;color:#888;margin-bottom:12px;">',
            '  Pseudonym. Keine Registrierung. Nur Blockchain-Adressen.',
            '  <br><span style="color:#555;font-size:9px;">DSGVO: Kein PII gespeichert. Adressen = Pseudonyme.</span>',
            '</div>',
            '<label style="font-size:10px;color:#FF6B00;">MMX Adresse</label>',
            '<input id="wallet-mmx" type="text" value="' + escHtml(wallet.mmx || '') + '" placeholder="mmx1..." style="width:100%;background:#0f0f1a;color:#e0e0e0;border:1px solid #333;border-radius:4px;padding:6px;font-size:11px;font-family:monospace;margin:4px 0 12px;box-sizing:border-box;">',
            '<label style="font-size:10px;color:#3AAC59;">XCH Adresse</label>',
            '<input id="wallet-xch" type="text" value="' + escHtml(wallet.xch || '') + '" placeholder="xch1..." style="width:100%;background:#0f0f1a;color:#e0e0e0;border:1px solid #333;border-radius:4px;padding:6px;font-size:11px;font-family:monospace;margin:4px 0 12px;box-sizing:border-box;">',
            '<button id="wallet-save" style="width:100%;background:#FF6B00;color:#fff;border:none;border-radius:6px;padding:8px;font-size:12px;cursor:pointer;">Speichern</button>',
            '<div style="margin-top:12px;padding:10px;background:#0f0f1a;border:1px solid #222;border-radius:6px;font-size:9px;color:#555;">',
            '  <b style="color:#888;">Deflation\u00e4re Arbeitswerttheorie</b><br>',
            '  Jeder Token der hierher flie\u00dft, wird zu Arbeit. Jede Arbeit strahlt<br>',
            '  als Code, als Quest, als Insel zur\u00fcck in die Welt. Das Schwarze Loch<br>',
            '  frisst Tokens und strahlt Hawking-Strahlung: Kinderlachen.<br><br>',
            '  Marx sa\u00df im Lesesaal. Wir sitzen auf der Insel.<br>',
            '  Der Wert entsteht nicht im Besitz, sondern im Verschwinden.',
            '</div>',
        ].join('\n');

        container.querySelector('#wallet-save').addEventListener('click', function () {
            var mmx = container.querySelector('#wallet-mmx').value.trim();
            var xch = container.querySelector('#wallet-xch').value.trim();

            // Validierung: Adressen-Prefix
            if (mmx && !mmx.startsWith('mmx1')) {
                if (typeof window.showToast === 'function') window.showToast('MMX-Adresse muss mit mmx1 beginnen');
                return;
            }
            if (xch && !xch.startsWith('xch1')) {
                if (typeof window.showToast === 'function') window.showToast('XCH-Adresse muss mit xch1 beginnen');
                return;
            }

            setWallet({ mmx: mmx, xch: xch });
            if (typeof window.showToast === 'function') window.showToast('Wallet gespeichert');
        });
    }

    // --- Handlers ---
    function handleBuy(listingId) {
        var wallet = getWallet();
        if (!wallet.mmx && !wallet.xch) {
            if (typeof window.showToast === 'function') window.showToast('Erst Wallet einrichten!');
            return;
        }

        apiGet('/market/item/' + listingId).then(function (data) {
            if (!data.item) {
                if (typeof window.showToast === 'function') window.showToast('Angebot nicht mehr verf\u00fcgbar');
                return;
            }
            var item = data.item;

            // Zeige Zahlungsinfos
            var payAddr = item.seller_mmx || item.seller_xch || '';
            var payAmount = item.price_mmx > 0 ? item.price_mmx + ' MMX' : item.price_xch + ' XCH';
            var msg = item.name + ' kaufen?\n\nSende ' + payAmount + ' an:\n' + payAddr +
                '\n\nDanach "Zahlung best\u00e4tigen" klicken.';

            if (confirm(msg)) {
                // Zahlung als pending markieren
                apiPost('/market/buy', {
                    listing_id: listingId,
                    buyer_addr: wallet.mmx || wallet.xch,
                }).then(function (res) {
                    if (res.ok) {
                        if (typeof window.showToast === 'function') window.showToast('Kauf eingeleitet! Verifizierung l\u00e4uft...');
                        loadListings();
                    }
                });
            }
        });
    }

    function handleList(materialId, name, emoji) {
        var wallet = getWallet();
        var price = prompt('Preis in MMX (z.B. 0.1):');
        if (!price || isNaN(parseFloat(price))) return;

        apiPost('/market/list', {
            material_id: materialId,
            name: name,
            emoji: emoji,
            price_mmx: parseFloat(price),
            price_xch: 0,
            price_glut: 0,
            seller_addr: wallet.mmx || wallet.xch || 'anonym',
            seller_mmx: wallet.mmx || '',
            seller_xch: wallet.xch || '',
        }).then(function (res) {
            if (res.ok) {
                if (typeof window.showToast === 'function') window.showToast('Item gelistet!');
                renderSellTab();
            } else {
                if (typeof window.showToast === 'function') window.showToast(res.error || 'Fehler beim Listen');
            }
        }).catch(function () {
            if (typeof window.showToast === 'function') window.showToast('Keine Verbindung');
        });
    }

    // --- HTML Escaping ---
    function escHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str || ''));
        return div.innerHTML;
    }

    // --- NPC Rare Shop (Mephisto) ---
    var MEPHISTO_DEALS = [
        { id: 'schatten_kristall', name: 'Schatten-Kristall', emoji: '🔮', desc: 'Leuchtet nur bei Nacht. Fl\u00fcstert Faust-Zitate.', price_glut: 50, price_mmx: 0.01 },
        { id: 'seelen_laterne', name: 'Seelen-Laterne', emoji: '🏮', desc: 'Zeigt den Weg den man nicht gehen sollte.', price_glut: 80, price_mmx: 0.02 },
        { id: 'mitternachts_rose', name: 'Mitternachts-Rose', emoji: '🥀', desc: 'Bl\u00fcht nur zwischen 23:00 und 01:00.', price_glut: 120, price_mmx: 0.05 },
        { id: 'pakt_siegel', name: 'Pakt-Siegel', emoji: '📜', desc: 'Unterschreibe nicht. Oder doch. Hehehehe...', price_glut: 200, price_mmx: 0.1 },
        { id: 'hawking_stern', name: 'Hawking-Stern', emoji: '⭐', desc: 'Strahlt Information. Schwarzes Loch im Taschenformat.', price_glut: 500, price_mmx: 0.5 },
    ];

    function getMephistoDeals() { return MEPHISTO_DEALS; }

    // --- Exports ---
    var marketplace = {
        open: openMarket,
        close: closeMarket,
        isOpen: function () { return isOpen; },
        getWallet: getWallet,
        setWallet: setWallet,
        isRareItem: isRareItem,
        getMephistoDeals: getMephistoDeals,
        MEPHISTO_DEALS: MEPHISTO_DEALS,
    };

    if (window.INSEL) {
        window.INSEL.register('marketplace', marketplace);
    }
    window.INSEL_MARKETPLACE = marketplace;
})();
