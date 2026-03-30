/**
 * ELIZA-Kern — Portierung des Weizenbaum-Originals (1966)
 * Vanilla JS, keine Abhängigkeiten.
 *
 * Exportiert window.INSEL_ELIZA mit:
 *   create(script) => { transform(input), reset() }
 *
 * Der Kern ist sprachunabhängig — deutsche Pronomen-Spiegelung,
 * Pre/Post-Substitution und Keywords kommen aus dem Script.
 */
(function () {
  "use strict";

  // ── Deutsche Pronomen-Spiegelung ──────────────────────────────
  // Bidirektionale Paare: ich↔du, mein↔dein usw.
  // Einseitige Paare: wir→ihr, uns→euch, unser→euer
  var REFLECT_PAIRS = [
    ["ich", "du"],
    ["mein", "dein"],
    ["mir", "dir"],
    ["mich", "dich"],
    ["bin", "bist"],
    ["war", "warst"],
    ["habe", "hast"],
    ["meine", "deine"],
    ["meinen", "deinen"],
    ["meinem", "deinem"]
  ];

  var REFLECT_ONE_WAY = [
    ["wir", "ihr"],
    ["uns", "euch"],
    ["unser", "euer"]
  ];

  /**
   * Baut die Reflect-Map aus den Paaren.
   * Bidirektionale Paare werden in beide Richtungen eingetragen.
   */
  function buildReflectMap() {
    var map = {};
    var i, pair;
    for (i = 0; i < REFLECT_PAIRS.length; i++) {
      pair = REFLECT_PAIRS[i];
      map[pair[0]] = pair[1];
      map[pair[1]] = pair[0];
    }
    for (i = 0; i < REFLECT_ONE_WAY.length; i++) {
      pair = REFLECT_ONE_WAY[i];
      map[pair[0]] = pair[1];
    }
    return map;
  }

  var REFLECT_MAP = buildReflectMap();

  /**
   * Spiegelt Pronomen in einem String.
   * Arbeitet wortweise, case-insensitive, behält Original-Case bei.
   */
  function reflect(text) {
    var words = text.split(/\s+/);
    var result = [];
    for (var i = 0; i < words.length; i++) {
      var lower = words[i].toLowerCase();
      if (REFLECT_MAP.hasOwnProperty(lower)) {
        result.push(REFLECT_MAP[lower]);
      } else {
        result.push(words[i]);
      }
    }
    return result.join(" ");
  }

  // ── Pre/Post-Substitution ────────────────────────────────────
  /**
   * Wendet Wort-/Phrasen-Ersetzungen auf den Input an.
   * Die Map kann Multi-Wort-Keys haben ("kannst du" → "können sie").
   * Längere Keys werden zuerst angewandt um Konflikte zu vermeiden.
   */
  function substitute(text, map) {
    if (!map) return text;

    // Keys nach Länge sortieren (längste zuerst)
    var keys = Object.keys(map);
    keys.sort(function (a, b) {
      return b.length - a.length;
    });

    var result = " " + text + " ";
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      // Wortgrenzen-sichere Ersetzung
      var pattern = new RegExp(
        "(?<=\\s)" + escapeRegex(key) + "(?=\\s)",
        "gi"
      );
      result = result.replace(pattern, map[key]);
    }
    return result.trim();
  }

  /** Escaped Sonderzeichen für RegExp */
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ── Decomposition-Pattern kompilieren ────────────────────────
  /**
   * Wandelt ein Decomp-Pattern mit Wildcards (*) in einen RegExp um.
   * "*" wird zu "(.*)" — fängt beliebigen Text ein.
   * Beispiel: "* ich bin *" → /^\s*(.*)\s*ich bin\s*(.*)\s*$/i
   */
  function compileDecomp(pattern) {
    var parts = pattern.split("*");
    var regex = "^";
    for (var i = 0; i < parts.length; i++) {
      if (i > 0) {
        regex += "(.*)";
      }
      var trimmed = parts[i].trim();
      if (trimmed.length > 0) {
        regex += "\\s*" + escapeRegex(trimmed) + "\\s*";
      } else {
        regex += "\\s*";
      }
    }
    regex += "$";
    return new RegExp(regex, "i");
  }

  // ── Reassembly anwenden ──────────────────────────────────────
  /**
   * Setzt Capture-Groups in ein Reassembly-Template ein.
   * Platzhalter: (1), (2), ... für die jeweilige Capture-Group.
   * Der eingefügte Text wird gespiegelt (reflect).
   */
  function applyReassembly(template, matches) {
    return template.replace(/\((\d+)\)/g, function (_, num) {
      var idx = parseInt(num, 10);
      var captured = (matches[idx] || "").trim();
      return reflect(captured);
    });
  }

  // ── ELIZA-Instanz ────────────────────────────────────────────
  /**
   * Erzeugt eine ELIZA-Instanz mit dem gegebenen Script.
   *
   * Script-Struktur:
   *   initial:  String — Begrüßung
   *   finale:   String — Abschied
   *   quit:     String[] — Quit-Keywords
   *   pre:      Object — Pre-Substitution-Map
   *   post:     Object — Post-Substitution-Map
   *   keywords: Array von { word, rank, rules }
   *     rules:  Array von { decomp, reassembly, memory }
   */
  function createEliza(script) {
    // Interner State: Memory-Stack und Reassembly-Rotationszähler
    var memory = [];
    var rotationCounters = {}; // Key: "keyword:ruleIndex" → Zähler

    // Keywords nach Rang sortieren (höchster zuerst)
    var sortedKeywords = (script.keywords || []).slice().sort(function (a, b) {
      return (b.rank || 0) - (a.rank || 0);
    });

    // Decomp-Patterns vorkompilieren
    var compiledRules = {};
    for (var k = 0; k < sortedKeywords.length; k++) {
      var kw = sortedKeywords[k];
      compiledRules[kw.word] = [];
      for (var r = 0; r < kw.rules.length; r++) {
        compiledRules[kw.word].push({
          regex: compileDecomp(kw.rules[r].decomp),
          reassembly: kw.rules[r].reassembly,
          memory: kw.rules[r].memory || false,
          goto: kw.rules[r].goto || null
        });
      }
    }

    /**
     * Holt das nächste Reassembly-Template (Round-Robin).
     */
    function nextReassembly(keywordWord, ruleIndex, templates) {
      var key = keywordWord + ":" + ruleIndex;
      if (!rotationCounters.hasOwnProperty(key)) {
        rotationCounters[key] = 0;
      }
      var idx = rotationCounters[key] % templates.length;
      rotationCounters[key]++;
      return templates[idx];
    }

    /**
     * Sucht ein Keyword-Objekt nach Name (für goto).
     */
    function findKeyword(word) {
      for (var i = 0; i < sortedKeywords.length; i++) {
        if (sortedKeywords[i].word === word) return sortedKeywords[i];
      }
      return null;
    }

    /**
     * Versucht ein Keyword gegen den Input zu matchen.
     * Gibt die Antwort zurück oder null.
     * Bei memory === true wird die Antwort in den Memory-Stack gepusht
     * statt direkt zurückgegeben.
     */
    function matchKeyword(kw, input, isMemoryPass) {
      var rules = compiledRules[kw.word];
      if (!rules) return null;

      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];

        // Goto: an anderes Keyword weiterleiten
        if (rule.goto) {
          var target = findKeyword(rule.goto);
          if (target) {
            var result = matchKeyword(target, input, isMemoryPass);
            if (result) return result;
          }
          continue;
        }

        var match = rule.regex.exec(input);
        if (match) {
          var template = nextReassembly(kw.word, r, rule.reassembly);
          var response = applyReassembly(template, match);

          // Post-Substitution auf die fertige Antwort
          response = substitute(response, script.post);

          if (rule.memory && !isMemoryPass) {
            // In Memory pushen, nicht direkt antworten
            memory.push(response);
            return null;
          }
          return response;
        }
      }
      return null;
    }

    /**
     * Hauptfunktion: Transformiert User-Input in ELIZA-Antwort.
     * Gibt { reply, confidence } zurück.
     * confidence: 0.9 = starker Keyword-Match, 0.5 = schwach, 0.2 = Fallback
     * Six Sigma: confidence < 0.5 → an LLM weiterleiten
     */
    function transform(input) {
      if (!input || typeof input !== "string") {
        return { reply: script.initial || "", confidence: 0.1 };
      }

      // Normalisierung: Kleinschreibung, Satzzeichen entfernen, trimmen
      var cleaned = input
        .toLowerCase()
        .replace(/[.!?,;:'"]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Quit-Check
      if (script.quit && script.quit.length > 0) {
        for (var q = 0; q < script.quit.length; q++) {
          if (cleaned === script.quit[q]) {
            return { reply: script.finale || "", confidence: 1.0 };
          }
        }
      }

      // Pre-Substitution
      var processed = substitute(cleaned, script.pre);

      // Keywords im Input suchen, nach Rang sortiert durchgehen
      for (var k = 0; k < sortedKeywords.length; k++) {
        var kw = sortedKeywords[k];

        // Prüfe ob das Keyword im Input vorkommt
        // "xnone" ist der Fallback und matcht immer
        var wordPattern = new RegExp("\\b" + escapeRegex(kw.word) + "\\b", "i");
        if (kw.word === "xnone" || wordPattern.test(processed)) {
          var response = matchKeyword(kw, processed, false);
          if (response) {
            var conf = kw.word === "xnone" ? 0.3 : (kw.rank || 0) >= 5 ? 0.9 : (kw.rank || 0) >= 3 ? 0.7 : 0.5;
            return { reply: response, confidence: conf };
          }
        }
      }

      // Kein Keyword hat gematcht — Memory versuchen
      if (memory.length > 0) {
        return { reply: memory.shift(), confidence: 0.4 };
      }

      // Absoluter Fallback: xnone-Keyword suchen
      var xnone = findKeyword("xnone");
      if (xnone) {
        var fallback = matchKeyword(xnone, processed, false);
        if (fallback) return { reply: fallback, confidence: 0.2 };
      }

      // Letzter Notfall
      return { reply: "Erzähl mir mehr.", confidence: 0.1 };
    }

    /**
     * Setzt Memory und Rotation zurück.
     */
    function reset() {
      memory = [];
      rotationCounters = {};
    }

    return {
      transform: transform,
      reset: reset
    };
  }

  // ── Script-Registry + Factory ─────────────────────────────────
  var SCRIPTS = {};
  var instances = {};

  function register(id, script) {
    SCRIPTS[id] = script;
    delete instances[id];
  }

  function getEliza(id) {
    if (!instances[id]) {
      if (!SCRIPTS[id]) return null;
      instances[id] = createEliza(SCRIPTS[id]);
    }
    return instances[id];
  }

  // Six Sigma Threshold: confidence unter diesem Wert → LLM
  var SIGMA_THRESHOLD = 0.5;

  // ── Export ────────────────────────────────────────────────────
  window.INSEL_ELIZA = {
    create: createEliza,
    register: register,
    getEliza: getEliza,
    reflect: reflect,
    SCRIPTS: SCRIPTS,
    SIGMA_THRESHOLD: SIGMA_THRESHOLD,
  };
})();
