# Entscheidungen

1. **Vanilla JS** -- Kein Framework nötig, einfach `index.html` öffnen
2. **2D Grid** -- Einfach genug für ein Kind, komplex genug um Spaß zu machen
3. **Deutsch** -- Schnipsels Muttersprache
4. **Canvas** -- Performant für Grid-Rendering mit Animationen
5. **localStorage** -- Speichern ohne Backend
6. **Puppeteer Smoke-Test statt nur Syntax-Check** -- `node -c` fängt Syntaxfehler, aber nicht Laufzeitfehler (`ReferenceError`, fehlende DOM-Elemente, kaputte Event-Handler). Puppeteer lädt die Seite wie ein echter Browser. Kostet ~15s im CI, verhindert dass 8/10 Deploys kaputt sind.
7. **SemVer-Tags statt Commit-Counter** -- `v0.47.e95f70a` sagt niemandem etwas. `v0.3.0` → `v0.4.0` zeigt: hier kam was Neues. Tags sind billig, Rollback ist `git checkout v0.3.0`.
8. **Version-Stamp beim Deploy, nicht im Repo** -- Die Version im HTML wird nur im CI gestempelt, nie committed. Das Repo bleibt sauber, der Deploy zeigt trotzdem welche Version läuft.
