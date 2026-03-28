# Testdaten einsammeln — Setup-Anleitung

## Option 1: Clipboard (sofort, kein Setup)

1. Spiel öffnen mit `?test` in der URL: `index.html?test`
2. 📊 Button erscheint oben rechts
3. Klick → JSON ist in der Zwischenablage
4. Einfügen in Notizen / Nachricht / Textdatei

## Option 2: Google Sheet + automatischer Ping (5 min Setup)

### Schritt 1: Google Sheet anlegen

Neues Google Sheet, Spalten in Zeile 1:

```
id | ts | session | theme | abGroup | duration_s | ms_firstBlock | ms_firstChat | ms_firstCodeView | ms_firstEasterEgg | blocks | materials | achievements | quests_done | quests_active | easter_eggs | hoerspiele | builds | demolishes | zauber | postcards
```

### Schritt 2: Apps Script erstellen

Im Sheet: **Erweiterungen → Apps Script**

Diesen Code einfügen:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.id,
    data.ts,
    data.session,
    data.theme,
    data.abGroup,
    data.duration_s,
    data.ms_firstBlock,
    data.ms_firstChat,
    data.ms_firstCodeView,
    data.ms_firstEasterEgg,
    data.blocks,
    data.materials,
    data.achievements,
    data.quests_done,
    data.quests_active,
    data.easter_eggs,
    data.hoerspiele,
    data.builds,
    data.demolishes,
    data.zauber,
    data.postcards,
  ]);

  return ContentService.createTextOutput('OK');
}
```

### Schritt 3: Deployen

1. **Bereitstellen → Neue Bereitstellung**
2. Typ: **Web-App**
3. Ausführen als: **Ich**
4. Zugriff: **Jeder**
5. URL kopieren (sieht so aus: `https://script.google.com/macros/s/ABC.../exec`)

### Schritt 4: Im Spiel aktivieren

Browser-Konsole auf dem Testgerät:

```javascript
localStorage.setItem('insel-webhook', 'https://script.google.com/macros/s/DEINE-ID/exec');
localStorage.setItem('insel-testmode', '1');
location.reload();
```

### Fertig!

Jedes Mal wenn ein Kind den Tab schließt → `sendBeacon()` → Daten landen im Sheet.
Kein Name, keine IP, nur Spielverhalten. Anonyme ID pro Gerät.

## Datenpaket (was gesendet wird)

```json
{
  "id": "Tx4k2m",
  "ts": "2026-03-28T14:30:00Z",
  "session": 3,
  "theme": "candy",
  "abGroup": "ocean",
  "duration_s": 847,
  "ms_firstBlock": 12,
  "ms_firstChat": 180,
  "ms_firstCodeView": null,
  "ms_firstEasterEgg": 95,
  "blocks": 47,
  "materials": 8,
  "achievements": 4,
  "quests_done": 2,
  "quests_active": 1,
  "easter_eggs": 3,
  "hoerspiele": 2,
  "builds": 52,
  "demolishes": 5,
  "zauber": 1,
  "postcards": 1
}
```

Kein PII. DSGVO-konform. Feynman-ready.
