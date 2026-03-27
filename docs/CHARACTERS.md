# Charakter-Profile

Jeder Charakter hat eine Rolle im Spiel, eine Persönlichkeit und ein Ziel.
Claude Code nutzt diese Profile für Dialoge, Quests und NPC-Verhalten.

---

## 1. Tim (der Spieler)

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Spieler-Charakter                                  |
| Alter           | 8 Jahre                                            |
| Aussehen        | Normaler Junge mit Rucksack                        |
| Persönlichkeit  | Mutig, aber erst schüchtern. Wird selbstbewusst.   |
| Fähigkeit       | Baut alles -- Häuser, Wege, Türme                  |
| Entwicklung     | Lernt Freunde kennen → wird zum Chefarchitekten    |

**Für Code**: Tim ist der Avatar des Spielers. Er spricht nicht selbst --
der Spieler handelt durch ihn. Dialoge anderer Figuren richten sich an Tim.

---

## 2. SpongeBob Schwammkopf

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Unterwasser-Nachbar, Koch                          |
| Aussehen        | Gelber Schwamm, große blaue Augen, braune Hose    |
| Persönlichkeit  | Immer fröhlich, hilfsbereit, singt Lieder          |
| Herkunft        | Kommt aus dem Wasser zur Insel                     |
| Ziel            | Burger-Stand am Hafen eröffnen                     |

**Typische Sprüche:**
- "Ich bin bereit! Ich bin bereit! Ich bin bereit!"
- "Lass uns einen Krabbenburger-Stand bauen!"
- "Das wird der BESTE Hafen der Welt!"

**Für Code**: SpongeBob ist der erste Freund, den Tim trifft. Er motiviert
zum Bauen und liefert Quests rund um Essen und den Hafen.

---

## 3. Mr. Krabs

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Geld-Experte, Händler                              |
| Aussehen        | Roter Krebs, große Scheren, grüne Augen, blaue Hose |
| Persönlichkeit  | Gierig nach Geld, aber nett zu Freunden            |
| Herkunft        | Kommt mit SpongeBob aus dem Wasser                 |
| Ziel            | Reicher werden durch Handel mit Bikini Bottom      |

**Typische Sprüche:**
- "Geld! Geld! Geld! Wir brauchen einen Handelshafen!"
- "Das Holz ist ein Vermögen wert, mein Junge!"
- "Ahh, der schönste Klang der Welt: Klingelingeling!"

**Für Code**: Mr. Krabs führt das Handelssystem ein. Er zählt Ressourcen
und motiviert den Spieler, mehr zu bauen um zu handeln.

---

## 4. Blauer Elefant

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Wald-Freund, Musiker, Helfer                       |
| Aussehen        | Blau, großer Rüssel, freundliches Gesicht          |
| Persönlichkeit  | Ruhig, geduldig, hilfsbereit                       |
| Herkunft        | Kommt aus dem Wald der Insel                       |
| Ziel            | Einen Musik-Turm für alle bauen                    |
| Spezial         | Trötet Musik wie Loisach Marci                     |

**Typische Sprüche:**
- "Törööö! Lass uns zusammen was Schönes bauen!"
- "Pflanzen machen alles besser. Probier mal!"
- "Mein Turm soll so hoch sein, dass man die Musik überall hört!"

**Für Code**: Der Elefant führt Pflanzen und Natur-Bauen ein. Er ist ruhig
und geduldig -- der Gegenpol zu SpongeBobs Energie.

---

## 5. Maus & Ente (Duo)

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Sammler-Team, Gärtner                              |
| Aussehen        | Kleine graue Maus + gelbe Ente mit Schnabel        |
| Persönlichkeit  | Lustig, machen Quatsch, quaken und piepsen         |
| Herkunft        | Kommen mit dem Elefanten aus dem Wald              |
| Ziel            | Großen Garten mit Blumen anlegen                   |

**Typische Sprüche:**
- Maus: *pieps pieps* (zeigt auf Blumen)
- Ente: *quak quak!* (watschelt herum)
- Zusammen: (machen Quatsch und zeigen wo Pflanzen hin sollen)

**Für Code**: Maus & Ente sind ein Comic-Relief-Duo. Sie kommunizieren
hauptsächlich durch Geräusche und Gestik. Perfekt für kleine Animationen.

---

## 6. Tommy Krab

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Bau-Assistent, Hafen-Spezialist                    |
| Aussehen        | Kleiner roter Krebs, Mini-Version von Mr. Krabs   |
| Persönlichkeit  | Schnell, neugierig, sagt immer "Ja!"               |
| Herkunft        | Kommt mit Mr. Krabs aus dem Wasser                 |
| Ziel            | Den Hafen mit Booten füllen                        |
| Spezial         | Macht "klick-klack!" Geräusche beim Bauen          |

**Typische Sprüche:**
- "Ja! Ja! Ja! Lass uns bauen!"
- "Klick-klack! Noch ein Boot für den Hafen!"
- "Ich bin zwar klein, aber ich kann VIEL tragen!"

**Für Code**: Tommy ist der eifrigste Helfer. Er reagiert auf jede
Bau-Aktion mit Begeisterung. Gut für sofortiges Feedback.

---

## 7. Neinhorn

| Feld            | Wert                                              |
|-----------------|----------------------------------------------------|
| Rolle           | Geheimnisvoller Baumeister, Schatzverstecker       |
| Aussehen        | Weißes Einhorn mit Horn, trotziger Blick           |
| Persönlichkeit  | Frech, sagt oft "Nein!", hilft aber am Ende doch   |
| Herkunft        | Taucht plötzlich auf, niemand weiß woher           |
| Ziel            | Einen Regenbogen-Turm mit Schätzen bauen           |
| Spezial         | Baut Geheimtüren und versteckte Ecken              |

**Typische Sprüche:**
- "Nein!"
- "Nein, das mach ich nicht! ... Na gut, EINMAL."
- "Hier kommt eine Geheimtür hin. Aber sag's keinem! NEIN!"
- "Mein Regenbogen-Turm wird der schönste. Nein, der ALLERSCHÖNSTE!"

**Für Code**: Neinhorn ist der Charakter mit dem meisten Humor. Es sagt
erst "Nein" und hilft dann doch. Perfekt für überraschende Momente.

---

## Charakter-Beziehungen

```
                Tim (Spieler)
               /    |    \
        Wasser-Team  |  Wald-Team
        /        \   |   /       \
  SpongeBob  Mr.Krabs | Elefant  Maus&Ente
       |        |     |
   Tommy Krab   |   Neinhorn
                |   (wild card)
            Handel mit
          Bikini Bottom
```

**Wasser-Team** (SpongeBob, Mr. Krabs, Tommy Krab):
- Kommen aus dem Meer, bringen Hafen- und Handels-Quests

**Wald-Team** (Elefant, Maus & Ente):
- Kommen aus dem Wald, bringen Natur- und Garten-Quests

**Wild Card** (Neinhorn):
- Taucht auf wann es will, bringt Geheim- und Überraschungs-Quests
