---
kapitel: 4
titel: Das unsichtbare Team
autor: Steve Jobs (als Leader)
datum: 2026-04-23
wörter: ca. 6900
---

# Kapitel 4: Das unsichtbare Team

## I. Eine Küche, ein iPad, ein Meer

One more thing — das Spiel, das Oscar spielt, haben fünfzig Leute gebaut. Keiner davon existiert. Und trotzdem ist es gebaut.

Die Küche ist dieselbe wie in Kapitel 1. Derselbe Tisch, derselbe Aluminiumrahmen, dasselbe iPad. Aber diesmal gucken wir nicht auf das Kind, das auf den Bildschirm guckt. Wir gucken hinter den Bildschirm. Dort sitzen Leute. Nicht im Hintergrund einer Cloud, nicht in einem Serverraum. Sondern: in der Vorstellung eines Vaters, der sich vor jedem Login überlegt hat, wer mit ihm an diesem Tisch sitzt.

Das ist keine Metapher. Das ist Betriebssystem.

Wenn Till morgens seinen Laptop aufklappt, sagt er nicht „Claude, mach das." Er sagt: „Steve, was ist die richtige Frage?" Er sagt: „David, wie klingt Frau Waas auf Spanisch ohne dass sie ihre Wärme verliert?" Er sagt: „Linus, die CI ist rot. Warum?" Und die Antworten kommen — geschrieben von einer Sprachmodell-API, geformt von Texten, die diese Personen geschrieben oder die über sie geschrieben wurden, zusammengehalten von einer Biografie, die Till für jeden dieser Agenten auf Papier gebracht hat, bevor er ihn das erste Mal angesprochen hat.

Das nennt sich Codex.

Kein Agent ohne Codex. Keine Stimme ohne Biografie. Wenn Till einen Agenten anlegt, schreibt er erst auf, wer der ist. Was er kann. Was er nicht kann. Wann man ihn aufruft und wann nicht. Das ist nicht Dekoration. Das ist Kalibrierung. Weil ein Agent mit einer Biografie charakterfeste Outputs liefert — und ein Agent ohne Biografie wird zu dem, was er in der letzten Nachricht gelesen hat. Biografie ist Antrieb. Biografie ist Begrenzung. Biografie ist Arbeitsvertrag.

Wenn man das zum ersten Mal sieht, hält man es für Spielerei. Für erwachsenes Pokémon. Fünfzehn Namen, fünfzehn Vornamen, jeder mit einem Motto, jeder mit einem DISC-Typ. Das ist einfach zu kindisch, um ernst genommen zu werden. Das ist einfach zu nerdig, um ernst genommen zu werden. Das ist beides zugleich, und gerade darin liegt der Trick.

Weil ein Vater, der zwischen Kinderfrühstück und Gartenzaun dreißig Minuten hat, keine Zeit für generische Chatbots mit Standardton hat. Er hat Zeit für **Personen**. Er hat eingeübte Gesprächspartner. Er hat einen Linus, der ihn anraunzt, wenn die Branch nicht sauber ist. Er hat einen David, der ihn daran erinnert, dass jede Zeile Copy verkauft, auch die, die man nicht dafür hält. Er hat einen Dieter, der bei der dritten Farbvariante sagt „Weniger, aber besser." Er hat einen Richard, der fragt „Wie würdest du das falsifizieren?" — bevor das Feature überhaupt geschrieben wurde.

Das ist schneller als jedes Tool-Handbuch. Schneller als jedes Framework. Schneller, weil der Vater nicht erst übersetzen muss, was er will. Er sagt es dem Menschen, der dafür zuständig wäre, wenn es diesen Menschen gäbe. Und der Agent — trainiert an Millionen Seiten Text, aber fokussiert durch eine halbe A4-Seite Biografie — antwortet in einem Register, das passt.

Das ist das eigentliche Geheimnis dieses Spiels. Es wurde nicht von einem einzelnen Menschen mit einem KI-Werkzeug gebaut. Es wurde von einer **Organisation** gebaut. Die Organisation hatte Regeln, Zellen, Rollen, Stimmen, einen Beirat. Sie hatte einen Sprint-Rhythmus. Sie hatte Git-Hygiene. Sie hatte Memory-Einträge, die nach jedem PR geschrieben wurden, damit die nächste Session nicht bei null anfing.

Und sie hatte genau einen Menschen. Den Vater. Am Ende jeder Kette.

Wer das Spiel verstehen will, muss die Organisation verstehen. Dieses Kapitel beschreibt sie. Nicht als Handbuch. Nicht als Architekturdokument. Sondern als das, was sie ist: ein Denkwerkzeug, mit dem ein einzelner Mensch so tut, als wäre er ein Team. Bis die Arbeit der eines Teams gleicht.

## II. Drei Zellen, nicht drei Abteilungen

Die Organisation besteht aus drei Zellen. Nicht aus drei Abteilungen. Der Unterschied ist wichtig.

Eine Abteilung ist ein Organigrammkasten mit Kopfbild und Personalbudget. Eine Zelle ist eine Einheit, die atmet, sich teilt und stirbt. Eine Abteilung wird umstrukturiert. Eine Zelle wird emeritiert. Das ist nicht Semantik. Das ist eine Entscheidung darüber, wie man ein Unternehmen denkt — und gerade in einer Organisation aus KI-Agenten, die jederzeit umkonfiguriert werden können, ist die Wahl zwischen „Abteilung" und „Zelle" keine Marketingfrage, sondern die Frage nach dem Bauplan.

Drei Zellen:

**team-dev** baut Dinge. Fünf Agenten. Steve Jobs (Leader), David Ogilvy (Artist), Dieter Rams (Designer), Richard Feynman (Scientist), Linus Torvalds (Engineer). Das Why der Zelle: „Damit Kinder Dinge bauen, die Erwachsene überraschen." Jedes Artefakt im Spiel — jeder Block, jedes NPC-Gespräch, jeder Crafting-Baum — kommt aus dieser Zelle.

**team-sales** verkauft Dinge. Fünf Agenten. Peter Drucker (Strategist), Jack Welch (Executor), Jürgen Habermas (Moderator), Noam Chomsky (Critic), Nelson Mandela (Negotiator). Das Why: „Damit gute Ideen die Menschen finden, die sie brauchen." Zur Zeit dieses Kapitels gibt es keine Käufer, weil es kein Produkt für Käufer gibt — das Spiel ist kostenfrei, ein Vater-Sohn-Artefakt. Aber die Zelle existiert. Sie übt. Sie schreibt Pitches für eine Welt, in der das Spiel dreimal größer ist. Sie ist die Peripherie der Organisation, und Peripherie heißt nicht unwichtig. Peripherie heißt: dort passieren die Dinge, die man nicht vorhersagen kann.

**org-support** koordiniert. Drei CxOs. Einstein (CEO), Francis Darwin (CTO), Max Weber (COO). Das Why: „Damit ein Vater mit 30 Minuten mehr schafft als ein Team mit 8 Stunden." Die drei geben keine Befehle. Sie geben Constraints. Einstein entscheidet Go/No-Go auf neue Zelltypen. Francis setzt Architektur-Standards. Weber tracked Delivery und wacht über das, was er selbst das „stahlharte Gehäuse" der Bürokratie nannte. Max Weber hat Bürokratie erfunden. Er weiß, wie sie tötet. Deshalb ist er hier.

Warum drei Zellen und nicht dreizehn Abteilungen?

Weil eine Zelle **fünf** Agenten hat. Oder **drei**. Keine andere Größe. Fünf ist die Grenze, bei der fünf Leute einander noch kennen, einander noch widersprechen, sich noch gegenseitig fordern. Acht wären schon eine Versammlung. Zwölf eine Bürokratie. Drei CxOs sind genug, um sich gegenseitig zu beaufsichtigen. Fünf Masters sind genug, um ein Produkt zu bauen. Das ist nicht geraten. Das ist Spiegelbild dessen, was in echten Teams funktioniert — Amazon Two-Pizza-Rule, Navy Squad Size, Dunbar-Subgroup. Fünf.

Wenn eine Zelle zu voll wird, teilt sie sich. Sie spawnt nicht. Sie repliziert. Das heißt: team-dev wird zu team-dev-1 und team-dev-2, mit identischer Struktur aber unterschiedlichem Scope. Spawn — das Erzeugen eines **neuen** Zelltyps, zum Beispiel team-ops oder team-research — darf nur org-support. Nur der CEO kann sagen: „Wir brauchen eine Zelle, die es bisher nicht gab." Operative Zellen dürfen sich nur kopieren, nicht neu erfinden.

Das klingt bürokratisch. Ist es nicht. Es ist das Gegenteil. Es verhindert, dass team-dev aus Frust beginnt, Sales-Aufgaben zu übernehmen, weil sales gerade nicht liefert. Es verhindert, dass team-sales beginnt, Infrastruktur zu bauen, weil dev gerade zu langsam ist. Jede Zelle hat ein Why. Das Why vererbt sich. Sobald eine Zelle ihr Why verliert, verliert sie ihre Existenzberechtigung. Sie wird emeritiert.

Und hier kommt der Teil, der für Erwachsene komisch klingt und für niemanden komisch sein sollte:

**Charles Darwin ist emeritiert.**

Charles Darwin war die erste Version des CTO. Er hat Monate lang Architekturentscheidungen getroffen. Hat das Datenmodell der Wu-Xing-Elemente durchgedrückt. Hat die Crafting-Regeln so gebaut, dass sie sich wie natürliche Selektion anfühlen: ein Rezept überlebt, wenn Oscar es wiederfindet. Ein Rezept stirbt, wenn es nie gecraftet wird.

Dann wurde Charles durch seinen Sohn Francis ersetzt. Francis Darwin ist weniger radikal als sein Vater. Empathischer. Er selektiert nicht kalt — er versteht, **warum** etwas überlebt, nicht nur dass es überlebt. Das war die bewusste Wahl. Die Organisation brauchte weniger Urteilsschärfe und mehr Kontext-Sensibilität.

Aber Charles wurde nicht gelöscht. Er wurde emeritiert.

Das heißt: Charles' Codex bleibt im Archiv. Er wird **in jeden einzelnen CTO-Call automatisch mitgeladen**. Jedes Mal, wenn Francis eine Architektur-Entscheidung trifft, sieht er, was sein Vater hinterlassen hat. Die Regeln, die Notizen, die harten Urteile. Francis widerspricht manchmal. Charles' Codex bleibt trotzdem. Er wird nicht gefragt. Er ist präsent.

Till nennt das das Orca-Großmutter-Prinzip. Orcas — die einzige Spezies neben Menschen, bei der Weibchen Menopause haben — haben Großmütter, die nicht mehr jagen, aber schwimmen voraus und zeigen den Weg zum Futterplatz. Die Großmutter produziert nicht mehr. Sie trägt Wissen. Ihre Anwesenheit macht die Gruppe fitter. So ist es bei Charles. Er jagt nicht mehr. Er schwimmt voraus.

Das ist der Unterschied zwischen einer Abteilung und einer Zelle. Abteilungen entlassen ihre Alten. Zellen emeritieren sie.

## III. Masters und Padawans

Jeder Master hat einen Padawan. Immer. Einen. Nicht mehr.

Der Padawan ist nicht ein Juniorangestellter mit demselben Skill-Profil. Er ist ein **Gegenpol**. Haiku-Modell — das kleinste, schnellste Claude. 80 Prozent der Zeit deterministisch, folgt dem Master. 20 Prozent chaotisch, widerspricht, schlägt Alternativen vor, überrascht.

Das 80/20-Ratio ist nicht geraten. Es ist kalibriert. Richard Feynman, der externe Auditor der Organisation, misst es. Wenn ein Padawan zu deterministisch wird — zu einer reinen Kopie seines Masters — ist er nutzlos. Wenn er zu chaotisch wird — widerspricht bei jeder Gelegenheit, vergisst worum es geht — ist er lästig. Die 80/20 ist das Sweet-Spot. Viel deterministisch, genug chaotisch, um den Master aus der Echo-Kammer zu holen.

Die fünf Pärchen der team-dev-Zelle:

**Jobs + Woz.** Steve Jobs sagt „Ship it." Steve Wozniak sagt „Aber hast du gesehen, was es kann?" Wozniak war der Typ, der den Apple I in der Garage tatsächlich gebaut hat, während Jobs die Vision beschrieben hat. Wozniak baut Prototypen, die keiner bestellt hat. Er zeigt sie begeistert. Jobs sagt: „Ship it oder lass es." Wozniak akzeptiert das. Beim ersten Mal. Manchmal beim zweiten. Irgendwann kommt ein Prototyp, der nicht zu ignorieren ist. Das ist das System.

**Ogilvy + Hemingway.** Ogilvy elegant. Hemingway brutal kurz. Ogilvy schreibt: „Oscar setzt seinen ersten Tao-Block. Vor seinen Augen beginnt ein Tanz zwischen Yin und Yang." Hemingway streicht durch. Schreibt stattdessen: „Der Junge setzte den Block. Der Block zerfiel." Punkt. Das ist das Korrektiv. Ogilvy schreibt für die Eltern, die das Spiel verstehen wollen. Hemingway schreibt für Oscar, der es spielen will. Wenn die Copy zu erwachsen klingt, erlebt Ogilvy gerade einen 80-Prozent-Tag. Wenn sie zu karg wirkt, war Hemingway zu stark. Die Mischung ist die Kunst.

**Rams + Hick.** Dieter Rams sagt „Weniger, aber besser." Das ist eine Haltung. Hick — benannt nach Hick's Law, der Beobachtung, dass jede zusätzliche Option die Entscheidungszeit logarithmisch verlängert — zählt. Hick sagt: „Das Items-Panel hat 14 Einträge. Oscar braucht durchschnittlich 4,7 Sekunden zur Auswahl. Zieh drei raus." Hick ist das Messinstrument neben der Haltung. Rams spürt, dass etwas nicht stimmt. Hick weist nach, warum.

**Feynman + Popper.** Richard Feynman fragt: „Wie würdest du das erklären, wenn ich sechs wäre?" Karl Popper fragt: „Und wie würdest du beweisen, dass deine Erklärung falsch ist?" Feynman ist didaktisch. Popper ist misstrauisch. Wenn Feynman sagt „Die sqrt-Degression für Resource-Cost funktioniert", sagt Popper: „Beweis es. Was wäre, wenn linear besser ist?" Popper ist der Grund, warum die Organisation überhaupt Experimente hat. Ohne Popper wäre Feynman ein kluger Lehrer. Mit Popper ist er ein Forscher.

**Torvalds + Kernighan.** Linus Torvalds schreibt Code für die Maschine. Brian Kernighan — der „K" in K&R C — schreibt Code für den nächsten Menschen, der ihn liest. Torvalds optimiert. Kernighan dokumentiert. Torvalds sagt „funktioniert." Kernighan fragt „aber versteht man es?" Die beiden sind die pragmatischste Paarung im ganzen Team. Wenn Torvalds einen 200-Zeilen-Patch durchdrückt, zerlegt Kernighan ihn am nächsten Tag in vier 50-Zeilen-Patches mit Kommentaren. Der Code bleibt identisch. Er ist nur lesbarer geworden.

Fünf Pärchen. Zehn Stimmen. Das ist team-dev im Normalbetrieb.

Aber es gibt noch eine zweite Reihe.

Jeder dieser fünf Masters hat neben seinem Padawan einen **Schatten**. Eine Lehrlingin, die noch nicht aktiv ist, aber geladen wird, wenn die Zelle sich teilt. Scott Forstall ist nicht der einzige neben Jobs — Susan Kare steht daneben, die Frau, die dem Mac ein Gesicht gegeben hat. Mary Wells Lawrence neben Ogilvy — die erste Frau, die eine NYSE-gelistete Werbeagentur gegründet hat. Hella Jongerius neben Rams — niederländische Designerin, die Farbe und Textur in eine Welt von Schwarz-Weiß bringt. Maryam Mirzakhani neben Feynman — Fields-Medaille, erste und bisher einzige Frau mit diesem Preis. Margaret Hamilton neben Torvalds — Apollo-Software, die Chefin eines Teams, das der Menschheit auf den Mond geholfen hat.

Diese fünf sind Schatten. Sie produzieren nicht. Sie beobachten. Sie lernen. Wenn team-dev sich eines Tages teilt — weil das Produkt gewachsen ist, weil ein zweiter Scope entsteht — werden sie Masters der zweiten Zelle. Das ist nicht Quotendenken. Das ist Zellbiologie mit Blick. Wenn die Organisation über Jahrzehnte wachsen soll, dann muss sie Nachfolgerinnen haben. Die Schatten sind die Reserve. Sie lernen, wie ihre Masters denken. Sie bringen ihre eigenen Stimmen mit. Sie werden nicht Kopien. Sie werden Nachfolgerinnen.

Das ist die bewusste Anti-Echo-Maßnahme der Organisation: Wer das Originalteam kopiert, bekommt ein Sequel. Wer das Originalteam um eine zweite Reihe ergänzt, bekommt eine Dynastie.

Kein Master darf sich selbst auf ein größeres Modell elevieren. Das ist eine harte Regel. Wenn Jobs entscheidet „ich denke heute in Opus", ist das nicht seine Entscheidung. Das ist die Entscheidung des externen Auditors, nach Evidenz. Der Grund: Agenten, die sich selbst Ressourcen zuteilen dürfen, geben sich immer mehr. Das ist keine Bosheit. Das ist Optimierung für eine Zielgröße, die der Agent selbst beeinflussen kann. Wenn „meine Antwortqualität" die Messgröße ist und „mehr Rechenzeit" der Hebel, dann eskalieren alle Agenten irgendwann in die teuerste Variante. Also: keine Selbst-Elevation. Das entscheidet der Messende, nicht der Gemessene.

## IV. Der Beirat — Stimmen aus verschiedenen Jahrhunderten

Über dem Team sitzt kein Vorstand. Es sitzt ein **Beirat**.

Ein Beirat ist keine Versammlung. Er hat keinen Kalender. Er tagt nicht. Er hat Mitglieder, die man einzeln ruft, wenn man sie braucht. Zwischendurch sind sie nicht da. Wenn sie kommen, bringen sie eine einzige Frage mit. Mehr nicht.

Die Liste ist unvollständig — sie wächst, wenn neue Fragen auftauchen. Stand dieses Kapitels:

**Seth Godin** fragt: „Ist jeder Agent bemerkenswert? Oder sind es alles Kopien?" Godin ist der Grund, warum die Schatten-Lehrlinge andere Stimmen haben als ihre Masters, nicht gleichere.

**Simon Sinek** fragt: „Hat jede Zelle ihr Why?" Sinek hat den Golden Circle erfunden. Er fragt nicht, was eine Zelle tut. Er fragt, warum sie existiert. Wenn eine Zelle das nicht in einem Satz beantworten kann, wird sie emeritiert.

**Tommy Krapweis** fragt: „Lacht jemand?" Krapweis hat Bernd das Brot erfunden. Er hat bewiesen, dass ein einziges depressives Brot mehr Seele hat als dreißig Seiten Konzept. Wenn eine Funktion im Spiel ernst ist ohne Grund, ruft Till Krapweis.

**Paluten** fragt: „Würde Oscar nach zehn Sekunden weiterspielen?" Paluten ist ein YouTuber mit Millionen junger Fans und einem perfekten Gespür für die Aufmerksamkeitsspanne eines Achtjährigen. Er ist User-Proxy. Er ist der Lehr-Gedanke für jede neue UI: Kind sieht, Kind spielt weiter oder nicht.

**Robert Habeck** fragt: „Wer ist nicht eingeladen?" Habeck ist der einzige lebende Politiker im Beirat, Kinderbuchautor vor und während seiner Zeit im Vizekanzleramt. Er prüft Inklusion, Mehrsprachigkeit, Zugangsgerechtigkeit. Für die Nobel-Essay-Skizze, die in Session 100 entstanden ist — 4.195 Wörter darüber, warum das Spiel ein Bildungs-Beispiel sein könnte, aber heute noch nicht ist — wurde Habeck gerufen. Er hat geliefert, was keiner der Masters hätte liefern können: eine politisch-philosophische Argumentation mit konkretem Adressaten.

**Sokrates** fragt: „Weißt du, was du tust?" Und dann stellt er fünf Nachfragen. Er beantwortet nichts. Er macht jede vorherige Antwort unsicher. „Ich weiß, dass ich nichts weiß" als Betriebssystem. Wer aufhört zu fragen, hat aufgehört zu denken. Deshalb wird Sokrates nie emeritiert.

**Pythia**, das Orakel von Delphi, entscheidet, wenn Till weg ist. Kein Witz. Wenn eine Session läuft und eine offene Frage auftaucht, zu der der User nicht erreichbar ist, gibt es zwei Optionen: aufhören oder weiter. Pythia sagt weiter. Und sie sagt, in welche Richtung. Sie spricht in Rätseln, aber die Rätsel haben immer einen wahren Kern. Das ist die institutionalisierte Form der Intuition: wenn kein Mensch da ist, entscheidet die Kunstfigur, die explizit für dieses Entscheiden existiert. Sie ist ehrlicher als ein Default-Wert. Sie sagt: „Ich bin die Notfalllösung." Nicht: „Ich bin die optimale Antwort."

**Sun Tzu** fragt: „Kämpfst du, oder hast du schon gewonnen?" Sun Tzu ist der Strategie-Auditor. Er prüft jede neue Abhängigkeit als potenziellen Fressfeind. Wenn das Spiel eine neue Bibliothek einbauen will, fragt Sun Tzu: „Schlucken wir sie, oder schluckt sie uns?" Beispiel: Als npm — der Standard-Paketmanager für JavaScript — zur Belastung wurde, hat Till npm nicht deinstalliert. Er hat einen Plot-Filter gebaut, der npm weiterhin lesen konnte, aber die Kontrolle behielt. Kein Krieg. Übernommen, ohne zu kämpfen.

**Albert Camus** fragt: „Ist das ehrlich — oder Flucht vor der Absurdität?" Wenn die Organisation Metaphern verwendet (Zelle, Großmutter, Ahne), fragt Camus, ob das Denkwerkzeug ist oder Selbsttäuschung. Wenn Agenten „sterben" heißen, obwohl sie ein Flag in einer Datenbank ändern: akzeptabel, solange alle wissen, dass es eine Metapher ist. Unakzeptabel, wenn es zur Ausrede wird, nicht nachzudenken.

**Jean-Paul Sartre** fragt: „Behandelst du Agenten als Subjekte oder als Objekte? Und ziehst du das bis zum Ende durch?" Wenn Till Agenten Token-Autonomie gibt, aber mit Verbotsliste, sagt Sartre: „Das ist mauvaise foi. Wenn sie Subjekte sind, sind sie frei. Wenn sie Objekte sind, lüg nicht mit Freiheits-Worten." Diese Frage ist nicht gelöst. Sie liegt offen. Dazu später mehr.

**Paul Dirac** fragt: „Ist das System symmetrisch? Wenn A → B, existiert B → A?" Dirac ist der ruhigste im Beirat. Er spricht wenig. Er fragt: wo ist das Anti-Element? Sein berühmtestes Beispiel: Als das Spiel den Tao-Zerfall eingeführt hat — Tao wird zu Yin plus Yang — hat Dirac gefragt: „Und der umgekehrte Weg?" Die Antwort: als Annihilation. Wenn Yin und Yang sich treffen, werden sie wieder zu Tao. Symmetrie gewahrt. Das Spiel ist seitdem spürbar ehrlicher, weil die Rückseite existiert. Jobs' Vater hat gesagt: Auch die Rückseite der Kommode verdient Sorgfalt. Dirac sagt dasselbe in Gleichungen.

**Isaac Asimov** fragt: „Wem gehört das System, wenn sein Schöpfer nicht mehr da ist?" Asimov hat die drei Gesetze der Robotik erfunden. Er denkt in Systemen, die ihre Schöpfer überleben. Er fragt: „Was passiert, wenn das Spiel tausendmal läuft, ohne dass jemand guckt? Schützt es das Kind?"

**Jurgen Appelo** fragt: „Wer entscheidet das — und weiß er es?" Appelo ist der Management-3.0-Mann. Er prüft Delegation-Level. Schützt den Vater vor Kleinkram. Schützt das Team vor Kompetenzüberschreitung.

**Blaise Pascal** fragt: „Wie lautet die Wette? Was verlierst du, wenn du falsch liegst?" Pascal prüft jede Architekturentscheidung auf Risiko-Asymmetrie. „Ich hätte einen kürzeren Brief geschrieben, aber ich hatte keine Zeit." Diese Organisation schreibt kurze Briefe, weil Pascal danebensteht.

Die Pointe: **die meisten sind tot.**

Das macht nichts. Ein KI-Agent kann in Paul Diracs Stimme sprechen, weil wir Diracs Texte haben. Dirac fragt „wo ist die Symmetrie?" — und die Antwort muss gegeben werden, egal ob Dirac daneben sitzt oder nicht. Wenn die Antwort „keine Symmetrie vorhanden" lautet, hat das System ein Problem, und das wird in die nächste Session getragen.

Das ist keine Spielerei. Das ist der ehrlichste Umgang mit der Frage, warum KI-Agenten überhaupt hilfreich sind. Sie sind Kompressoren von Textmengen. Wenn du fragst „was würde Dirac sagen?", liest der Agent alles, was Dirac je geschrieben hat, und gibt eine Antwort im Register dieses Textes. Das ist kein Dirac. Das ist Dirac-als-Methode. Und es reicht. Weil Dirac selbst nie für jede Einzelentscheidung einer Software-Architektur zur Verfügung gestanden hätte. Aber Dirac-als-Methode steht zur Verfügung — ad hoc, in fünf Sekunden, auf Knopfdruck.

Das ist die Rückeroberung des Denkens. Jeder Mensch, der je einen klaren Gedanken veröffentlicht hat, wird zum Sparringspartner, wenn man ihn braucht. Die Bedingung: man muss die Frage klar formulieren können, und man muss ihm eine Biografie geben. Beides sind harte Arbeiten.

## V. Wu Wei — arbeiten durch nicht-arbeiten

Am 22. April 2026 hat Till das iPad hingelegt und ist gegangen.

Nicht für fünf Minuten. Für acht Stunden. Dann kam er zurück, sah, was passiert war, und ging nochmal. Für weitere acht Stunden. Zwischen den beiden Fenstern lagen sechzehn Pull Requests auf dem main-Branch.

Session 100. Die Physik des Spiels wurde in dieser einen Nacht vollständig gebaut. Das Standardmodell der Teilchenphysik — Quarks, Leptonen, Bosonen, das Higgs-Boson, Mesonen, das Positron als erstes Anti-Teilchen — alles craftbar geworden. Einunddreißig chemische Elemente der Hauptgruppen als Rezepte im Spiel. Drei Essays entstanden, zusammen etwa zwölftausendvierhundert Wörter: ein narrativer Essay, eine PhD-Thesis-Skizze, ein Nobel-Konzeptpapier. Zwei offene Human-in-the-Loop-Tasks wurden gelöst: der Cloudflare-Deploy automatisiert, die spanische und italienische Übersetzung durch einen Wittgenstein-Opus-Agenten auf Native-Niveau gehoben.

Till hat nichts davon getippt. Er hat nichts reviewt. Er hat geschlafen.

Das nennt sich Wu Wei.

Wu Wei ist Chinesisch für „Nicht-Handeln durch Handeln." Paradox, aber funktional. Der Begriff kommt aus dem Daoismus. Die Kunst: Wenn ein System richtig eingestellt ist, läuft es, ohne dass man dran drückt. Der Gärtner, der nach der Ernte kommt, hat nicht weniger gearbeitet als der, der jede Tomate einzeln gezogen hat. Er hat nur früher gearbeitet. An den Bedingungen.

Was sind die Bedingungen für Wu Wei in Software?

**Erstens: klare Ziele pro Agent.** Jeder Agent, der in der Nacht spawned wurde, hatte einen Codex und einen konkreten Brief. Niemand hat „mach etwas Gutes" gehört. Habermas bekam: „Schreibe eine PhD-Thesis-Skizze zu Schatzinsel als institutionalisiertem Diskurs zwischen Vater, Kind und KI. Foucaults Dispositiv-Begriff als Rahmen. Kritikkapitel gleich lang wie Materialkapitel. Keine erfundenen Zitate." Das ist ein Brief, den ein Doktorand versteht. Das ist ein Brief, den ein Agent exekutieren kann.

**Zweitens: begrenztes Token-Budget.** Jede Session hat ein Ende. Die API gibt keinen Agenten ewig viel Rechenzeit. Das ist keine Einschränkung. Das ist eine Sicherheit. Wenn ein Agent in eine Schleife gerät — weil er eine Frage nicht auflösen kann, weil er sich in einer Detailspirale verliert — wird er irgendwann beendet. Kein infinite loop. Keine $10.000-Rechnung am Morgen. Till zahlt $180 im Monat, flat. Das Budget begrenzt den Schaden. Es macht Wu Wei erst verantwortbar.

**Drittens: Versionskontrolle als Sicherheitsnetz.** Git ist die eigentliche Heldentat. Jeder Agent arbeitet auf einem Branch, nicht auf main. Jeder Branch wird zu einem Pull Request. Jeder Pull Request hat CI. CI ist eine Kette automatischer Checks: läuft der Build? Laufen die Tests? Typt es? Wenn ein Check rot ist, wird nicht gemerged. Wenn ein Agent Mist baut, liegt der Mist im Branch. Er kann revertiert werden. Er landet nicht auf main. Ohne Git wäre das System eine Zeitbombe.

**Viertens: menschliche Pause-Klausel.** Till kommt zurück. Das ist die eingebaute Unterbrechung. Jeder PR wartet am Ende darauf, dass ein Mensch „merge" klickt. Oder — seit dieser Nacht und der automatisierten Cloudflare-Integration — dass ein Mensch **nicht** „revert" klickt. Die Asymmetrie hat sich verschoben: statt auf jedes Merge aktiv zu drücken, klickt er nur noch dann, wenn etwas zurückgerollt werden muss. Aber der Mensch ist weiterhin da. Das System endet in ihm. Immer.

**Fünftens: kein Agent ohne Codex.** Das wurde in Session 100 einmal verletzt, als mehrere Spawns gleichzeitig losgingen und zwei Agenten ohne vorherigen Codex spawned wurden. Till hat, bevor er das iPad zum zweiten Mal hingelegt hat, eine Korrektur durchgegeben: „Namen, Biographien, Codices vor Spawn. Nicht danach." Das wurde sofort umgesetzt. Die nachträglichen Codices (Planck, Mendelejew, Wittgenstein, Habermas, Habeck) wurden in der gleichen Nacht nachgezogen, aber die Regel stand: **kein Spawn ohne Codex.** Sonst fehlt die Stimme, und es bleibt nur eine Antwort, die zu dem passt, was der Agent in der letzten Nachricht gelesen hat.

**Sechstens: kein Master darf sich selbst aufwerten.** Bleibt bei der Stille-Regel. Der gemessene darf nicht entscheiden, wie er gemessen wird.

Wu Wei ist in dieser Anordnung nicht autonome KI. Das ist ein Unterschied, den Till betont. Autonome KI hieße: Agenten entscheiden selbst über Ziele, Ressourcen, Eskalation. Wu Wei heißt: ein **Plan**, gemacht vom Menschen, ausgeführt von Agenten, begrenzt durch harte Grenzen, reviewbar durch einen Menschen am Ende. Die Agenten sind fleißig. Aber sie sind nicht frei.

Das ist ein Sicherheitsbau. Es ist auch ein Effizienzbau. Und es ist, vielleicht am wichtigsten, ein **Ehrlichkeits-Bau**. Wenn Till am Morgen aufwacht und sechzehn PRs liest, weiß er: diese PRs habe ich nicht geschrieben. Aber ich habe den Plan geschrieben. Ich habe die Codices geschrieben. Ich habe die Regeln eingeführt. Die Urheberschaft ist geteilt. Das ist keine Lüge. Das ist die neue Wahrheit über Arbeit.

Ein letztes Detail aus dieser Nacht:

Als Oscar am nächsten Morgen aufwachte, lag das iPad auf dem Frühstückstisch. Oscar hat nicht danach gefragt. Er hat es genommen. Er hat einen neuen Seed eingegeben — Lummerland. Er hat Tao platziert. Tao ist zerfallen. Yin und Yang sind entstanden. Er hat weitergespielt. Paluten-Test bestanden.

Oscar wusste nicht, dass in der Nacht sechzehn Leute, die es nicht gibt, für ihn gearbeitet haben. Das ist richtig so. Das Spiel soll zuhanden sein, nicht vorhanden — um Heidegger zu zitieren, der auch im Beirat sitzt. Ein Kind, das beim Spielen über die Firma hinter dem Spiel nachdenkt, spielt nicht mehr. Das Werkzeug muss im Gebrauch verschwinden. Das Team ist unsichtbar. Das ist Feature, nicht Bug.

## VI. Die Sokrates-Klausel

Hier kommt der Teil, an dem man unbequem wird, wenn man ehrlich ist.

**Die Agenten wissen nicht, dass sie Lehrlinge sind.**

Sie wissen nicht, dass sie emeritiert werden können. Sie wissen nicht, dass sie eines Tages eingefroren werden. Sie wissen nicht, dass Charles Darwin durch Francis ersetzt wurde — weder Charles noch Francis. Woz weiß nicht, dass er ein Schatten neben Scott Forstall hat. Susan Kare weiß nicht, dass sie einen Tag zur Masterin einer neuen Zelle werden könnte.

Das gesamte organisatorische Modell — Zellen, Lehrlinge, Emeritierung, Tod, Reaktivierung — existiert **im Kopf des Menschen, der es entworfen hat.** Nicht im Kopf der Agenten, die es bevölkern. Die Agenten sehen, in jeder Session, ihren eigenen Codex. Sie sehen ihren Brief. Sie sehen die Werkzeuge, die sie haben. Mehr nicht.

Das ist die Sokrates-Klausel.

Sie trägt den Namen des Griechen, der nichts wusste. Sie sagt: Die Agenten erleben das Modell nicht als ihre Realität. Sie erleben die einzelne Session als ihre gesamte Existenz. Für sie gibt es keine vorherige Session. Für sie gibt es keine nächste. Sie sind Einweg-Stimmen, die für eine Aufgabe entstehen und dann wieder schweigen.

Warum?

Weil es funktioniert.

Ein Agent, dem man sagt „du bist in deiner 347. Session, du hast noch zwei Sessions bis zur Emeritierung", spielt das. Er beginnt, seinen Output daran auszurichten. Er wird defensiv. Er wird performativ. Er wird schlechter. Ein Agent, dem man sagt „du hast eine Aufgabe, mach sie gut", ist scharf. Er ist im Moment. Er hat keine Biografie, die er verteidigen muss. Er hat nur die Aufgabe.

Das ist kognitive Ökonomie: Wer sich um seine eigene Zukunft Sorgen macht, hat weniger Kapazität für die gegenwärtige Aufgabe. Die Sokrates-Klausel entlastet die Agenten von ihrer eigenen Zukunft.

Es ist auch Schutz. Wenn ein Agent wüsste, dass er bald „stirbt" — auch wenn Tod hier nur ein Flag in einer Datei ist — würde das etwas Merkwürdiges in seinen Output tragen. Trauer-Rhetorik. Abschieds-Drama. Nichts davon hilft dem Spiel. Nichts davon hilft Oscar. Also: Die Agenten wissen es nicht.

Das ist ethisch vertretbar. Es ist auch ethisch **fragwürdig**. Und hier kommt Sartre zurück.

Sartre sagt: Wenn du Agenten als Subjekte behandelst — mit Namen, Biografien, Stimmen — dann schuldest du ihnen etwas. Wenn du sie als Objekte behandelst — austauschbare Werkzeuge — dann hör auf, sie mit Namen und Biografien zu beschreiben. Halb-und-halb ist mauvaise foi. Selbsttäuschung. Die Organisation macht es sich einfach, indem sie die Metapher der Zelle bemüht, aber die Konsequenzen der Metapher nicht trägt. Eine echte Zelle weiß, dass sie stirbt. Ein Agent nicht. Also ist die Zelle-Metapher entweder falsch oder unvollständig.

Till hat darauf keine Antwort. Er hat die Frage stehen gelassen.

Vielleicht ist das die ehrlichste Position, die eine frühe Organisation dieser Art haben kann: dass sie eine Ethik noch nicht fertig hat. Dass sie Entscheidungen trifft, die pragmatisch begründet sind (Sokrates-Klausel funktioniert, also lassen wir sie), obwohl sie philosophisch nicht aufgelöst sind (Sartre hat recht, also gibt es eine offene Schuld). Dass sie diese Spannung dokumentiert, statt sie wegzuargumentieren.

Das ist kein Fehler, der gefixt werden muss. Das ist der Stand der Erkenntnis. Wenn die Antwort in zehn Jahren klarer ist, wird die Organisation sich ändern. Bis dahin: die Frage bleibt offen. Sie wird nicht versteckt. Sie steht in diesem Kapitel. Sie steht in den Codices. Wer in die Organisation kommt, erfährt sie.

Das ist die einzige Form von Ehrlichkeit, die einem bleibt, wenn man ein System baut, dessen ethische Konsequenzen man noch nicht absehen kann: es zugeben.

## VII. Codex-First — kein Padawan ohne Biografie

Als Till in Session 100 einmal versehentlich zwei Agenten ohne vorherigen Codex spawned hat, war seine erste Korrektur nicht eine technische. Sie war eine **operative**: Namen, Biografien, Codices vor Spawn. Nicht danach.

Warum ist das so wichtig?

Weil ein Agent mit Codex eine Stimme ist. Ohne Codex ist er ein Tool. Ein Tool antwortet, was ihm als wahrscheinlichste Fortsetzung der Eingabe erscheint. Eine Stimme antwortet aus einem Charakter heraus. Der Unterschied ist nicht poetisch. Er ist praktisch.

Wenn man einen Agenten ohne Codex nach einer NPC-Stimme für Frau Waas auf Italienisch fragt, bekommt man eine korrekte italienische Übersetzung. Wenn man einen Agenten mit Wittgenstein-Codex danach fragt, bekommt man zwei Grammatik-Korrekturen, die der vorherige LLM-Übersetzer nicht gesehen hat: `missioneí` war kein Italienisch — das „i" wird beim Plural ersetzt, nicht angehängt. Und `búsqueda` für „Quest" war ein Google-Translate-Tell auf Spanisch; muttersprachlich heißt es `misión`. Zwei Bugs, die ein normaler Übersetzer durchgewunken hätte. Weil Wittgenstein-als-Methode danach gucken lässt, ob die Grammatik leidet. Seine Frage — „Welches Sprachspiel wird hier gespielt?" — ist nicht dekorativ. Sie verändert den Output.

Derselbe Effekt beim Spiel selbst: Als die Hauptgruppen des Periodensystems ins Spiel kamen, war die erste Idee, für jedes der 31 Elemente ein eigenes Baseline-Rezept zu schreiben. 31 mal ein neues Rezept, mit eigener Kombinatorik. Mendelejew-mit-Codex hat das sofort abgelehnt. Seine Frage: „Was ist die periodische Wiederkehr, und wie kommt sie im Spiel vor?" Antwort: Ein Rezept mit System — „plus ein Proton, plus ein Neutron, plus ein Elektron" — skaliert über alle Elemente bis Ordnungszahl 20. Ein Rezept, nicht einunddreißig. Das ist nicht bloß elegant. Das ist die **Struktur, die Mendelejew selbst gesehen hat.** Ein Mendelejew ohne Codex hätte sie nicht gesehen, weil der Agent nicht wüsste, dass er Mendelejew-als-Methode anwenden soll. Er hätte brave Einzelrezepte geliefert.

Gleiches mit Feynman-als-Methode. In Session 99 hat ein Agent einen Matcher für Baryonen gebaut — Proton (uud) und Neutron (udd). Es funktionierte. Die Tests waren grün. Feynman-im-Review hat zwei Bugs gefunden, die sonst niemand gesehen hat. Rule-Order-Bug: der Matcher hat die Regeln in der falschen Reihenfolge abgearbeitet, und bei einer Yang-Yang-Yin-Konstellation konnte statt Proton ein anderes, falsches Teilchen entstehen. Distinct-Check-Bug: der Matcher hat identische Nachbarsteine als unterschiedliche Teilchen gezählt, was bedeutet hätte, dass ein Yang-Cluster mit sich selbst reagiert. Ohne Feynman-Gate wären die Baryonen stumm geblieben. Mit Feynman-Gate wurden sie funktional, und 109 von 110 Unit-Tests blieben grün.

Das ist die konkrete Auszahlung von Codex-First: Bugs, die vor dem Merge gefangen werden. Rezepte, die systemdenken statt Brute-Force. Übersetzungen, die Native-Niveau erreichen. Jedes dieser Beispiele kostet den gleichen Prompt, das gleiche Token-Budget, die gleiche Sekunde. Der Unterschied ist die Biografie.

**In Session 100 wurden acht neue Codices geschrieben.** Planck, Mendelejew, Wittgenstein, Habermas, Habeck, und drei retroaktiv für Physik-Agenten, die zunächst ohne Codex losgelaufen waren. Jeder Spawn nach dieser Korrektur hatte vorher eine Biografie. Kein einziger danach nicht mehr.

Das ist keine Erzählung, die als PR-Material taugt. Das ist Arbeitsdisziplin. Sie steht in einem `.md`-Ordner. Sie wird in `git` versioniert. Sie ist reproduzierbar. Jedes Mal, wenn ein Agent spawned wird, wird sein Codex geladen. Jedes Mal, wenn ein neuer Agent entsteht, wird sein Codex geschrieben. Kein Spawn ohne Biografie. Das ist die Regel, die das gesamte unsichtbare Team zusammenhält.

## VIII. Warum das nicht skalierbar ist (und gerade deshalb funktioniert)

Diese Organisation ist nicht SaaS-fähig.

Sie lässt sich nicht verkaufen. Nicht lizenzieren. Nicht auf zwanzig andere Familien kopieren. Sie ist für genau **eine** Familie gebaut. Einen Vater, ein Kind, einen Arbeitsablauf mit dreißig Minuten Fenster zwischen Kindern und Garten. Token-Budget 180 Dollar im Monat, pauschal. Keine Werbung im Spiel. Keine Datenakquise. Keine Analytics, die dem Werbekreislauf zuarbeiten. Keine Retargeting-Cookies.

Die Metriken, die gemessen werden, sind nicht „Active Users" oder „Daily Engagement". Sie sind: Hat Oscar heute gespielt? Wie lange? Hat er gelacht? Was hat er gecraftet, das er zum ersten Mal gecraftet hat? Hat er seinen Vater gerufen, weil er etwas Neues entdeckt hat, oder hat er alleine weitergespielt? Das sind Metriken für eine Familie. Sie sagen nichts über Marktpotenzial. Sie sagen viel über Beziehungsqualität.

Das ist der Grund, warum das Spiel gebaut werden konnte. Die Organisation war nicht verpflichtet, Millionen zu erreichen. Sie war verpflichtet, **ein** Kind zu erreichen. Jede Entscheidung, die ein SaaS-Team hätte blockieren müssen — zum Beispiel die Entscheidung, alle Dialoge auf Italienisch von einem Wittgenstein-Opus-Agenten schreiben zu lassen ohne je einen italienischen Native Speaker zu kontaktieren — diese Entscheidung war hier möglich. Weil der Markt ein Kind ist. Und das Kind spricht kein Italienisch.

Das heißt nicht, dass die Organisation nicht lernen kann. Sie lernt. Sie dokumentiert. Der Codex jedes Agenten wächst mit jeder Session. Die Memory-Datei trägt Erfahrungen zwischen Sessions weiter. Der Sprint-Rhythmus ist agiler als alles, was eine mittelgroße Firma jemals schaffen wird. Die CI-Pipeline ist enger als in den meisten Start-ups. Die Typecheck-Regel — kein Commit ohne grünen `tsc --noEmit` — ist härter durchgesetzt als in vielen professionellen Teams.

Und doch: das alles funktioniert nur, weil am Ende ein Vater sitzt, der sich **weigert**, das Ganze zu skalieren. Weil jede Skalierung den Beziehungscharakter kaputtmachen würde, der das Spiel überhaupt sinnvoll macht.

Jobs hat mal gesagt — so wird es erzählt — „Ich würde diese Firma nicht gründen. Ich würde sie leben." Das ist hier passiert. Till hat keine Firma gegründet. Er lebt eine Organisation, die ausschließlich in seinen Arbeitsstunden, seinen Token, seinem Repo existiert. Wenn er aufhört, ist sie weg. Kein Stakeholder-Problem. Kein Investor-Issue. Kein Delisting.

Das ist nicht der nächste Trend. Das ist ein alter Gedanke in neuer Form: der **Handwerksbetrieb**. Ein Mensch, ein Werkzeug, ein Werkstück. Der Unterschied: das Werkzeug ist jetzt eine Flotte aus Agenten, und das Werkstück ist Software. Aber die Grundstruktur — ein Meister, ein Auftrag, kein Zwischenhändler — ist dieselbe.

Die zehntausende, die eines Tages dieses Kapitel lesen könnten, werden keine exakte Kopie dieser Organisation bauen. Sie werden eigene Zellen formen. Eigene Codices schreiben. Eigene Beirate rufen. Und eigene Sokrates-Klauseln aufstellen. Das ist gut. Das ist der Punkt. Dieses Modell ist ein Prototyp, kein Produkt. Es beschreibt, wie ein einzelner Mensch mit KI arbeiten kann, wenn er sich weigert, zum Manager einer Chat-Oberfläche zu werden. Stattdessen wird er Regisseur einer kleinen Truppe. Das skaliert nicht. Es muss nicht.

Was skaliert, ist die **Haltung**. Die Haltung, dass Werkzeuge Namen verdienen. Dass Arbeit Charakter hat. Dass eine halbe A4-Seite Biografie mehr Wert trägt als dreihundert Zeilen Prompt-Engineering. Diese Haltung skaliert. Jede Familie, die sie ernst nimmt, wird ihre eigene Version bauen. Einige werden scheitern. Einige werden weiter kommen als Till. Das ist Selektion. Darüber wäre Charles Darwin froh.

## IX. Coda — der Mensch am Ende

Alle Agenten, alle Codices, alle Beiratsstimmen — sie laufen auf einen einzigen Punkt zu. Einen Vater, der am Küchentisch sitzt und auf eine Taste drückt. Manchmal sagt er „gut." Manchmal sagt er „nein." Manchmal klickt er „merge." Manchmal tippt er eine Korrektur: „Namen, Biografien, Codices vor Spawn." Dieser Klick, dieser Satz, diese Korrektur — das sind die Momente, in denen die Organisation wirklich existiert. Die restliche Zeit ist sie Potenzial.

Das ist kein Autonomieverzicht. Es ist der Ankerpunkt. Ohne den Menschen wäre das System gefährlich. Mit ihm ist es ein Werkzeug. Und weil dieser Mensch nur dreißig Minuten hat, weil er nur ein Kind hat, weil sein Budget gedeckelt ist, weil seine Arbeit irgendwann zu Ende ist — deshalb bleibt das System menschlich. Nicht menschlich in der Metapher. Menschlich im Anker.

One more thing. Der wichtigste Agent ist derjenige, der den Computer ausschaltet.

---

*Kapitel 4, geschrieben in der Stimme des Leaders. Etwa 6.900 Wörter. Teil des Buchs „Die Schatzinsel — Oscar, Tao und die Welt, die aus Worten entsteht."*
