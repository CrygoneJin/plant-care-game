// Cloudflare Worker — Lehrerlosung
// Jeden Morgen eine pädagogische Tageslosung via Telegram.
// Cron: 0 4 * * * (= 06:30 MESZ im Sommer, 05:30 MEZ im Winter — UTC+2 Offset)
//
// Setup:
// 1. Workers & Pages → Create → Paste this
// 2. Environment Variables:
//    TELEGRAM_BOT_TOKEN = dein-bot-token (von @BotFather)
//    TELEGRAM_CHAT_ID   = deine-chat-id
// 3. Triggers → Cron: 0 4 * * * (täglich 04:00 UTC = 06:00 MESZ)
// 4. Deploy

const LOSUNGEN = [
  // --- Zählen vs. Messen ---
  {
    losung: "Geld zählt. Das Wetter misst man.",
    impuls: "Frag die Klasse: Wie viele Brötchen kauft Mama? → ganze Zahlen. Wie warm ist es draußen? → Kommazahlen. Fertig.",
    quelle: "Schatzinsel-Aufsatz"
  },
  {
    losung: "Kommazahlen wurden nicht für den Supermarkt erfunden. Sie wurden erfunden damit Menschen aufhören konnten zu lügen, wenn sie messen.",
    impuls: "Lass die Kinder 200g Mehl abwiegen. Keiner trifft genau 200. Das ist die Kommazahl.",
    quelle: "Pestalozzi-Prinzip: Erst das Ding, dann das Wort"
  },
  {
    losung: "Muscheln zählt man. Man teilt sie nicht in Hälften.",
    impuls: "Bring Muscheln mit. Lass die Kinder tauschen. 3 Muscheln für einen Stift. Wer hat am Ende die meisten?",
    quelle: "Mr. Krabs, Wirtschaftsberater"
  },
  // --- Kopf, Herz, Hand ---
  {
    losung: "Kinder lernen nicht durch Zuhören, sondern durch Tun.",
    impuls: "Was auch immer du heute erklären willst — lass sie es zuerst selbst versuchen. Dann erst erklären.",
    quelle: "Pestalozzi"
  },
  {
    losung: "Erst das Ding, dann das Wort.",
    impuls: "Zeig den Gegenstand bevor du den Begriff nennst. Immer.",
    quelle: "Pestalozzi, Elementarmethode"
  },
  {
    losung: "Ein Kind das baut, lernt. Ein Kind das zuschaut, wartet.",
    impuls: "Gib jedem Kind heute etwas in die Hand. Egal was. Hauptsache anfassen.",
    quelle: "Pestalozzi"
  },
  // --- Spieltrieb ---
  {
    losung: "Der Mensch ist nur da ganz Mensch, wo er spielt.",
    impuls: "Wenn die Klasse heute unruhig ist: 5 Minuten freies Spiel. Nicht als Belohnung — als Methode.",
    quelle: "Schiller, Ästhetische Erziehung, 15. Brief"
  },
  {
    losung: "Kinder die lernen müssen, lernen nichts. Kinder die spielen wollen, lernen alles.",
    impuls: "Versteck den Lernstoff im Spiel. Nicht umgekehrt.",
    quelle: "Pestalozzi, frei"
  },
  {
    losung: "Zwischen Chaos und Ordnung liegt Flow.",
    impuls: "Zu viel Struktur = Langeweile. Zu wenig = Chaos. Finde heute die Mitte.",
    quelle: "Schiller, Spieltrieb"
  },
  // --- Natur & Staunen ---
  {
    losung: "Das Thermometer macht keine ganzen Schritte.",
    impuls: "Häng ein Thermometer ans Fenster. Lass die Kinder jeden Morgen ablesen und aufschreiben. Nach einer Woche: erstes Diagramm.",
    quelle: "Schatzinsel-Aufsatz"
  },
  {
    losung: "Die Natur ist das beste Klassenzimmer. Sie hat keine Lehrpläne und trotzdem lernt jeder.",
    impuls: "10 Minuten draußen. Ein Blatt mitbringen. Beschreiben. Das ist Deutsch, Bio und Kunst gleichzeitig.",
    quelle: "Pestalozzi"
  },
  {
    losung: "Wasser fließt immer nach unten. Das ist Physik. Dass Kinder trotzdem Staudämme bauen — das ist Pädagogik.",
    impuls: "Lass sie heute etwas bauen das nicht funktionieren wird. Der Moment des Scheiterns ist der Moment des Lernens.",
    quelle: "Freie Interpretation"
  },
  // --- Ehrlichkeit ---
  {
    losung: "Kinder kennen den Unterschied zwischen zählen und messen. Sie können ihn nur nicht benennen.",
    impuls: "Unser Job: ihnen die Sprache geben für das, was sie schon fühlen.",
    quelle: "Schatzinsel-Aufsatz"
  },
  {
    losung: "Weiß ich nicht ist eine gültige Antwort. Auch für Lehrer.",
    impuls: "Sag heute einmal ehrlich: Das weiß ich nicht. Lass uns zusammen nachschauen.",
    quelle: "Sokrates, Apologie"
  },
  {
    losung: "Ein Test misst ob ein Kind die richtige Antwort kennt. Er misst nicht ob es verstanden hat.",
    impuls: "Frag heute nicht Was ist die Antwort? sondern Wie bist du darauf gekommen?",
    quelle: "Feynman, frei"
  },
  // --- Beziehung ---
  {
    losung: "Zusammen sind wir weniger allein.",
    impuls: "Setz heute zwei Kinder zusammen die sich sonst nicht aussuchen würden.",
    quelle: "Schatzinsel"
  },
  {
    losung: "Ein Kind das fragt ist wacher als ein Kind das antwortet.",
    impuls: "Lass die Kinder heute die Fragen stellen. Du antwortest nur.",
    quelle: "Sokrates"
  },
  {
    losung: "Das Leben bildet. Nicht die Schule.",
    impuls: "Was hat das Kind heute Morgen erlebt bevor es kam? Frag. Hör zu. Das ist der Stoff.",
    quelle: "Pestalozzi"
  },
  // --- Mut ---
  {
    losung: "Fehler sind kein Bug. Sie sind ein Feature.",
    impuls: "Feiere heute den besten Fehler. Wer hat sich am schönsten geirrt?",
    quelle: "Bug die Raupe, Schatzinsel"
  },
  {
    losung: "Die gefährlichste Frage im Unterricht ist: Wer hat die richtige Antwort?",
    impuls: "Ersetze sie durch: Wer hat eine andere Antwort?",
    quelle: "Freie Interpretation"
  },
  {
    losung: "Jedes Kind kann alles lernen. Nicht alles gleichzeitig. Nicht alles gleich schnell. Aber alles.",
    impuls: "Schau heute auf das Kind das am langsamsten ist. Es lernt. Nur anders.",
    quelle: "Pestalozzi"
  },
  // --- Stille ---
  {
    losung: "Manchmal ist die beste Unterrichtsstunde die, in der nichts passiert.",
    impuls: "5 Minuten Stille. Kein Auftrag. Kein Ziel. Nur da sein.",
    quelle: "Montessori, frei"
  },
  {
    losung: "Ein leeres Blatt ist kein Problem. Es ist eine Einladung.",
    impuls: "Gib jedem Kind ein leeres Blatt. Kein Thema. Kein Auftrag. Warte.",
    quelle: "Freie Interpretation"
  },
  {
    losung: "Nicht jede Frage braucht eine Antwort. Manche brauchen nur jemanden der zuhört.",
    impuls: "Wenn ein Kind heute fragt und du nicht weißt was es wirklich fragt — frag zurück.",
    quelle: "Rogers, frei"
  },
  // --- Zahlen & Mathe ---
  {
    losung: "Drei Freunde können sich nicht 2,33 Muscheln teilen.",
    impuls: "Teile 10 Gummibärchen auf 3 Kinder auf. Was passiert mit dem letzten? Das ist der Rest. Das ist Mathematik.",
    quelle: "Schatzinsel-Aufsatz"
  },
  {
    losung: "Mathematik ist nicht rechnen. Mathematik ist Muster sehen.",
    impuls: "Lass die Kinder heute Muster in der Schule suchen. Fliesen, Fenster, Treppen. Wo versteckt sich Mathe?",
    quelle: "Freie Interpretation"
  },
  {
    losung: "42.",
    impuls: "Frag die Klasse: Was ist die Antwort auf alles? Wer Douglas Adams kennt, grinst. Wer nicht, hat jetzt eine Hausaufgabe.",
    quelle: "Douglas Adams, Per Anhalter durch die Galaxis"
  },
  // --- Abschluss-Losungen ---
  {
    losung: "Du bist nicht perfekt. Du bist Lehrer. Das ist mehr.",
    impuls: "Heute nichts besonderes machen. Einfach da sein. Das reicht.",
    quelle: "Pestalozzi, sinngemäß"
  },
  {
    losung: "Das Wichtigste was ein Kind aus der Schule mitnimmt, steht in keinem Zeugnis.",
    impuls: "Was hat ein Kind heute gelernt das nicht im Lehrplan steht? Das war der wichtigste Moment.",
    quelle: "Einstein, frei"
  },
  {
    losung: "Am Ende des Tages: Hast du ein Kind zum Denken gebracht? Dann war es ein guter Tag.",
    impuls: "Geh nach Hause. Der Rest kommt morgen.",
    quelle: "Pestalozzi"
  },
  {
    losung: "Das Wort das ein Kind heute lernt, trägt es ein Leben lang.",
    impuls: "Welches Wort gibst du ihnen heute mit?",
    quelle: "Pestalozzi"
  },
];

const TG_API = 'https://api.telegram.org/bot';

export default {
  // HTTP-Handler + Telegram Webhook
  async fetch(request, env) {
    const url = new URL(request.url);

    // Telegram Webhook: Bot-Commands verarbeiten
    if (url.pathname === '/webhook' && request.method === 'POST') {
      return handleWebhook(request, env);
    }

    if (url.pathname === '/heute') {
      const losung = getTodaysLosung();
      return new Response(formatLosung(losung), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    if (url.pathname === '/alle') {
      const all = LOSUNGEN.map((l, i) => `${i + 1}. ${l.losung}`).join('\n');
      return new Response(all, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    if (url.pathname === '/send') {
      const losung = getTodaysLosung();
      const result = await sendTelegram(env, formatLosung(losung));
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(
      'Lehrerlosung\n\n/heute — Tageslosung\n/alle — Alle Losungen\n/send — Jetzt senden',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  },

  // Cron: täglich 04:30 UTC = 06:30 MESZ
  async scheduled(event, env) {
    // Nur senden wenn nicht pausiert
    const paused = await env.LEHRERLOSUNG_KV?.get('paused');
    if (paused === 'true') return;

    const losung = getTodaysLosung();
    // An alle Abonnenten senden
    const subs = await getSubscribers(env);
    for (const chatId of subs) {
      await sendTelegramTo(env, chatId, formatLosung(losung));
    }
  }
};

function getTodaysLosung() {
  // Tag des Jahres → Index (rotiert)
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return LOSUNGEN[dayOfYear % LOSUNGEN.length];
}

function formatLosung(l) {
  return [
    `📖 *Lehrerlosung*`,
    ``,
    `_"${l.losung}"_`,
    ``,
    `💡 *Impuls:* ${l.impuls}`,
    ``,
    `— ${l.quelle}`,
    ``,
    `schatzinsel.app`
  ].join('\n');
}

// --- Telegram Webhook: /start, /stop, /heute, /hilfe ---

async function handleWebhook(request, env) {
  let body;
  try { body = await request.json(); } catch { return new Response('ok'); }

  const msg = body.message;
  if (!msg || !msg.text) return new Response('ok');

  const chatId = msg.chat.id.toString();
  const text = msg.text.trim().toLowerCase();
  const firstName = msg.from?.first_name || 'du';

  if (text === '/start') {
    await addSubscriber(env, chatId);
    const losung = getTodaysLosung();
    await sendTelegramTo(env, chatId,
      `Hallo ${firstName} 👋\n\nAb jetzt bekommst du jeden Morgen um 06:30 eine Lehrerlosung.\n\n` +
      `/stop — Pausieren\n/heute — Heutige Losung\n/hilfe — Alle Befehle\n\n` +
      `Hier ist deine erste:\n\n${formatLosung(losung)}`
    );
    return new Response('ok');
  }

  if (text === '/stop') {
    await removeSubscriber(env, chatId);
    await sendTelegramTo(env, chatId,
      `Abgemeldet. Keine Losungen mehr. 🤫\n\n/start — Wieder anmelden`
    );
    return new Response('ok');
  }

  if (text === '/heute') {
    const losung = getTodaysLosung();
    await sendTelegramTo(env, chatId, formatLosung(losung));
    return new Response('ok');
  }

  if (text === '/hilfe' || text === '/help') {
    await sendTelegramTo(env, chatId,
      `📖 *Lehrerlosung — Befehle*\n\n` +
      `/start — Anmelden (täglich 06:30)\n` +
      `/stop — Abmelden\n` +
      `/heute — Heutige Losung jetzt\n` +
      `/hilfe — Diese Übersicht`
    );
    return new Response('ok');
  }

  return new Response('ok');
}

// --- Subscriber-Verwaltung (KV) ---

async function getSubscribers(env) {
  if (!env.LEHRERLOSUNG_KV) return [env.TELEGRAM_CHAT_ID].filter(Boolean);
  const list = await env.LEHRERLOSUNG_KV.get('subscribers', 'json');
  return list || [env.TELEGRAM_CHAT_ID].filter(Boolean);
}

async function addSubscriber(env, chatId) {
  if (!env.LEHRERLOSUNG_KV) return;
  const subs = await getSubscribers(env);
  if (!subs.includes(chatId)) subs.push(chatId);
  await env.LEHRERLOSUNG_KV.put('subscribers', JSON.stringify(subs));
}

async function removeSubscriber(env, chatId) {
  if (!env.LEHRERLOSUNG_KV) return;
  const subs = await getSubscribers(env);
  const filtered = subs.filter(id => id !== chatId);
  await env.LEHRERLOSUNG_KV.put('subscribers', JSON.stringify(filtered));
}

// --- Telegram senden ---

async function sendTelegramTo(env, chatId, text) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return { error: 'Token/ChatID fehlt' };

  const res = await fetch(`${TG_API}${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    })
  });
  return res.json();
}
