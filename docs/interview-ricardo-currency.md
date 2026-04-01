# Interview: David Ricardo über die Währungsarchitektur der Schatzinsel

*David Ricardo (1772–1823) war britischer Ökonom, Abgeordneter und Mitbegründer der klassischen Nationalökonomie. Er entwickelte die Theorie der komparativen Kostenvorteile und war einer der schärfsten Analytiker monetärer Systeme seiner Zeit. Dieses Gespräch ist fiktiv. Die Zahlen sind es nicht.*

---

**Host:** Herr Ricardo, willkommen. Sie haben sich die Wirtschaft der Schatzinsel angesehen. Erster Eindruck?

**Ricardo:** Interessant. Zehn NPCs. Zehn verschiedene Currencies. Krabbenburger, Musik-Noten, Seelenglut, Nein-Sterne. Und daneben Muscheln als Handelsgeld. Dazu MMX als Metawährung. Das sind drei Ebenen. Die meisten Volkswirtschaften kommen mit einer aus. Ich hatte Fragen.

---

## Frage 1: Eine Währung für alle — oder jeder NPC seine eigene?

**Host:** Beginnen wir mit dem Auffälligsten: Jeder NPC hat eine eigene Währung. SpongeBob rechnet in Krabbenburger, Mephisto in Seelenglut. Gleichzeitig gibt es Muscheln als universales Tauschmittel. Ist das klug?

**Ricardo:** Nein und ja. Lassen Sie mich trennen, was hier vermischt ist.

Die NPC-Currencies — Burger, Noten, Glut — sind keine Währungen im ökonomischen Sinne. Sie sind **Energiepunkte**. Token-Budget pro Session: 2.000 Einheiten. Das System im Code heißt `TOKEN_BUDGET_PER_CHARACTER`. Diese "Währungen" messen Gesprächsenergie, nicht Kaufkraft. SpongeBobs Krabbenburger sind ein UI-Konzept, kein Geld. Ein Kind sieht Burger. Das System sieht `tokenUsage['spongebob'] < 2000`. Das ist clever verkleidet.

Die Muschel hingegen ist echtes Geld. Sie wird gehandelt. Sie hat Preise. Krabbs' Kontor (`KRABS_SHOP`) kauft und verkauft dagegen. Holz kostet 2 Muscheln, Diamant kostet 20. Das ist eine Preisstruktur.

**Host:** Also kein Konflikt zwischen den Systemen?

**Ricardo:** Konzeptionell keiner. Aber ein praktischer: Das Kind sieht zehn verschiedene bunte Symbole und muss unterscheiden — dieses hier ist Energie für den Chat, jenes ist Handelsgeld für den Markt. Das ist kognitiver Aufwand. Für einen Erwachsenen trivial. Für einen Achtjährigen nicht.

Meine Empfehlung: **Behalte die Trennung. Mache sie sichtbarer.** Die NPC-Currencies sind Energie-Anzeigen — nenn sie so. Die Muschel ist Geld — zeig sie getrennt. Kein gemeinsamer Bildschirmbereich. Zwei Konzepte, zwei Orte.

**Host:** Und die komparativen Vorteile der NPCs?

**Ricardo:** Jetzt wird es interessant. Im `KRABS_SHOP` erkenne ich folgende Preisstruktur:

| Material | Kaufpreis | Verkaufspreis | Spread | Spread % |
|----------|-----------|---------------|--------|----------|
| Sand     | 1 🐚      | 1 🐚          | 0      | 0 %      |
| Holz     | 2 🐚      | 1 🐚          | 1      | 100 %    |
| Stein    | 3 🐚      | 1 🐚          | 2      | 200 %    |
| Planken  | 4 🐚      | 2 🐚          | 2      | 100 %    |
| Glas     | 5 🐚      | 2 🐚          | 3      | 150 %    |
| Diamant  | 20 🐚     | 8 🐚          | 12     | 150 %    |

Das ist Krabbs' komparativer Vorteil: Er sitzt auf dem einzigen Marktplatz. Kein Wettbewerb. Der Spread von 200 % bei Stein und 150 % bei Diamant ist Monopolrente, keine effizienter Preis. In meinem *Werk über Besteuerung* von 1817 nannte ich das Grundrente — Extragewinn aus privilegierter Position, nicht aus Arbeit oder Kapital.

Die anderen NPCs haben keinen Markt. Elefant rechnet in Musik-Noten, hat aber nichts zu verkaufen. Mephisto handelt in Seelenglut, kauft aber nichts. Das ist kein komparativer Vorteil — das sind Inseln ohne Hafen.

---

## Frage 2: Hat jeder NPC einen eigenen Wallet?

**Host:** Aktuell hat nur der Spieler ein Muschel-Inventar. NPCs besitzen kein eigenes Vermögen. Sollten sie?

**Ricardo:** Das ist die interessanteste Frage des Tages.

Derzeitiger Zustand: Der Spieler akkumuliert Muscheln. Krabbs ist Handelspartner, aber hat kein eigenes Vermögen — er ist ein Interface, kein Akteur. Wenn ich ihm 10 Muscheln verkaufe, verschwinden sie in einem globalen Inventar. Keine Gegenseite. Kein echter Handel.

**Host:** Und wenn NPCs eigene Wallets hätten?

**Ricardo:** Dann hätten Sie eine Wirtschaft. Jetzt haben Sie einen Einzelhandel.

Stellen Sie sich vor: Krabbs startet mit 50 Muscheln. Elefant mit 30. Jeder NPC hat Präferenzen — Krabbs kauft Holz und Stein für seinen Hafen, Elefant will Glas für seine Konzertmuschel. Jetzt kann der Spieler **zwischen NPCs arbitrieren**: Elefants Glas teuer kaufen, günstig an Krabbs verkaufen. Das ist Handel. Das ist Lehrstoff.

Aber — und das ist entscheidend — **NPC-Wallets erzeugen Inflation**. Wenn Krabbs aus Quests immer mehr Muscheln erhält und sie ins System pumpt, entwerten sich alle anderen Muscheln. Das Kind lernt unbeabsichtigt Inflation. Ist das gewollt?

**Host:** Ihre Empfehlung?

**Ricardo:** Zwei Schritte:

1. **Kurzfristig**: Krabbs erhält einen sichtbaren Vorrat. Nicht nur als Anzeige — er kann tatsächlich knapp werden. Wenn er kein Holz mehr hat, kann er keins verkaufen. Das lehrt Angebot und Nachfrage ohne Erklärung.

2. **Langfristig**: Zwei bis drei NPCs mit eigenen Wallets, die untereinander nachgefragt sind. Krabbs braucht Elefants Musik für sein Resort — zahlt dafür Muscheln. Elefant braucht Krabbs' Holz für seine Bühne. Dann haben Sie einen **Wirtschaftskreislauf**, nicht nur einen Shop.

---

## Frage 3: MMX als Metaebene — Goldstandard oder Illusion?

**Host:** Das Faszinierendste: `1 🐚 = 0.001 MMX`. Muscheln sind craftbar — 2 Sand + 1 Wasser = 2 Muscheln. MMX ist real und begrenzt. Ist das eine Deckung?

**Ricardo:** Das ist eine **Anzeige**, keine Deckung. Ich sage das ohne Wertung — es ist eine wichtige Unterscheidung.

Rechnen wir. Der Spieler hat 100 Muscheln. Das zeigt `≈ 0.1000 MMX`. Klingt solide. Aber der Spieler kann jederzeit craftbar 2 Sand + 1 Wasser nehmen und 2 neue Muscheln herstellen. Sand ist auf der Insel unbegrenzt vorhanden — oder zumindest leicht craftbar. Also kann die Muschelmenge beliebig wachsen. MMX wächst nicht mit. Der Code fragt zwar `window._mmxBurnBalance` ab und zeigt echte MMX-Zahlen, aber die Relation `SHELL_TO_MMX = 0.001` ist **fix hardcoded**. Sie passt sich nicht an die Muschelmenge an.

Das ist das Gegenteil eines Goldstandards. Beim Goldstandard hält die Zentralbank physisches Gold entsprechend der umlaufenden Geldmenge. Hier sind die Muscheln inflationär und MMX ist unveränderlich. Die Anzeige wird mit jeder gecrafteten Muschel realer Entwertung nicht gerecht.

**Host:** Greshams Gesetz?

**Ricardo:** Kommt unweigerlich. Thomas Gresham beobachtete 1558 am englischen Hof: **Schlechtes Geld verdrängt gutes.** Wenn zwei Währungen nebeneinander existieren und eine weniger wertvoll ist, horten Menschen die gute und geben die schlechte aus.

Hier: Muscheln sind inflationär und handelbar. MMX ist real, begrenzt, auf dem Bildschirm sichtbar — aber nicht handelbar innerhalb des Spiels. Also: Muscheln zirkulieren, MMX schlummert. Das schlechte Geld — die craftbaren Muscheln — verdrängt das gute Geld — die echten MMX. Die Kinder spielen mit der Inflationswährung. MMX wird zur Anzeige für Erwachsene.

Ist das schlimm? Nein. Aber es bedeutet: **MMX ist kein Goldstandard. MMX ist ein Easter Egg für Nerds.** Das ist ehrlicher als zu behaupten, es wäre eine Deckung.

**Host:** Was würden Sie empfehlen?

**Ricardo:** Entweder MMX aus dem UI nehmen — es verwirrt mehr als es lehrt. Oder MMX tatsächlich zur Deckung machen: Begrenzte Muschelmenge, pro Session nicht mehr als X craftbar. Dann hat `1 🐚 = 0.001 MMX` Bedeutung. Derzeit ist es ein hübsches Detail ohne ökonomische Substanz.

Ich tendiere zum Easter Egg. Es ist ehrlich. Kinder spielen mit Muscheln. Nerds lesen den Wert in der Ecke und freuen sich.

---

## Die eigentliche Frage

**Host:** Eine letzte Frage. Sie haben die Architektur durchleuchtet. Aber braucht ein Achtjähriger überhaupt eine Wirtschaft?

**Ricardo:** Das ist die richtige Frage. Ich hätte sie früher stellen sollen.

Meine Antwort: **Ja. Aber nicht diese.**

Was ein Kind von acht Jahren aus einer Spielwirtschaft lernen kann — und sollte:

1. **Tauschen lohnt sich.** Ich habe Holz. Du willst Holz. Du gibst mir Fisch. Jeder gewinnt. Das ist der Kern meiner Theorie der komparativen Vorteile, vereinfacht auf drei Sätze.
2. **Knappheit macht Dinge wertvoll.** Sand ist überall. Diamant nicht. Deshalb kostet Diamant zwanzig Muscheln und Sand eine.
3. **Arbeit hat Wert.** Planken kosten mehr als Holz, weil jemand das Holz verarbeitet hat. Wertschöpfung durch Transformation.

Die aktuelle Architektur vermittelt Punkt 2 (Preisstruktur im KRABS_SHOP) und ansatzweise Punkt 3 (Rezepte). Punkt 1 fehlt fast vollständig, weil NPCs keine eigenen Wallets haben und nicht wirklich tauschen.

Was sie **nicht** brauchen mit acht Jahren: Inflate-Deflate-Zyklen, Währungsdeckung, Spread-Arbitrage, Greshams Gesetz. Das kommt mit zwölf. Oder achtzehn. Oder im Berufsleben.

**Host:** Was also ist Ihr Gesamturteil?

**Ricardo:** Die Schatzinsel hat ein solides Fundament. Eine Handelswährung (Muscheln), ein Marktplatz (Krabbs' Kontor), Preisdifferenzierung (Sand 1, Diamant 20), Quests als Wirtschaftsanreiz. Das ist mehr Ökonomie als die meisten Videospiele bieten.

Die Schwächen sind handhabbar:

- NPC-Energiewährungen und Handelswährung visuell trennen.
- Krabbs einen sichtbaren, begrenzbaren Vorrat geben.
- MMX als Nerd-Feature labeln, nicht als Deckung behaupten.

Und eines noch: Mr. Krabbs hat eine Münzprägerei gebaut, eine Strand-Börse, eine Muschelbank, ein Handelskontor. Alles als Quest-Belohnungen. Dieser Charakter versteht Kapitalismus intuitiv besser als manche Zentralbanken. Ich würde ihn einstellen.

---

*David Ricardo, Ökonom und Abgeordneter. Gestorben 1823 in Gatcombe Park, Gloucestershire. Er wurde 51 Jahre alt. Er hatte keine Kinder, die auf einer Schatzinsel spielten.*
