#!/usr/bin/env node
/**
 * Telegram MCP Server — Schatzinsel
 * Sendet Nachrichten via Telegram Bot API
 *
 * Benötigt:
 * - TELEGRAM_BOT_TOKEN: Token von @BotFather
 * - TELEGRAM_CHAT_ID: Deine Chat-ID (nur DU bekommst Nachrichten)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const TG_API = 'https://api.telegram.org/bot';

const server = new Server(
  { name: 'telegram', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN und TELEGRAM_CHAT_ID müssen gesetzt sein');
  }
  return { token, chatId };
}

async function tgCall(token, method, body) {
  const res = await fetch(`${TG_API}${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

server.setRequestHandler({ method: 'tools/list' }, async () => ({
  tools: [
    {
      name: 'send_message',
      description: 'Sendet eine Telegram-Nachricht an den konfigurierten Chat (nur deine ID)',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Die Nachricht (Markdown erlaubt)'
          }
        },
        required: ['message']
      }
    },
    {
      name: 'send_link',
      description: 'Sendet einen Link mit Beschreibung via Telegram',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'Der Link' },
          text: { type: 'string', description: 'Begleittext' }
        },
        required: ['url']
      }
    },
    {
      name: 'send_karte',
      description: 'Fragt den Schatzkarte-Endpoint ab und sendet die Insel-Stats via Telegram',
      inputSchema: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Schatzkarte-Code (4 Wörter mit Bindestrich, z.B. meer-wald-blitz-stern)'
          },
          worker_url: {
            type: 'string',
            description: 'Worker-URL (default: https://schatzinsel.hoffmeyer-zlotnik.workers.dev)',
            default: 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev'
          }
        },
        required: ['code']
      }
    }
  ]
}));

server.setRequestHandler({ method: 'tools/call' }, async (request) => {
  const { name, arguments: args } = request.params;
  const { token, chatId } = getConfig();

  if (name === 'send_message') {
    const data = await tgCall(token, 'sendMessage', {
      chat_id: chatId,
      text: args.message,
      parse_mode: 'Markdown',
    });
    if (!data.ok) {
      return { content: [{ type: 'text', text: `Fehler: ${data.description || JSON.stringify(data)}` }] };
    }
    return { content: [{ type: 'text', text: `✅ Nachricht gesendet (ID: ${data.result?.message_id})` }] };
  }

  if (name === 'send_link') {
    const body = args.text ? `${args.text}\n\n${args.url}` : args.url;
    const data = await tgCall(token, 'sendMessage', {
      chat_id: chatId,
      text: body,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
    if (!data.ok) {
      return { content: [{ type: 'text', text: `Fehler: ${data.description}` }] };
    }
    return { content: [{ type: 'text', text: `✅ Link gesendet (ID: ${data.result?.message_id})` }] };
  }

  if (name === 'send_karte') {
    const workerUrl = args.worker_url || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
    try {
      const res = await fetch(`${workerUrl}/karte/${args.code}`);
      if (!res.ok) {
        return { content: [{ type: 'text', text: `Schatzkarte "${args.code}" nicht gefunden oder abgelaufen.` }] };
      }
      const karte = await res.json();
      const msg = [
        `🗺️ *Schatzkarte: ${args.code}*`,
        ``,
        `👤 Spieler: ${karte.player || 'Anonym'}`,
        `🧱 Blöcke: ${karte.blocks}`,
        `🐚 Muscheln: ${karte.shells}/42`,
        `✅ Quests: ${karte.quests}`,
        `🎨 Materialien: ${karte.materials}`,
        `⏱️ Spielzeit: ${karte.minutes} Min.`,
        ``,
        `_Erstellt: ${karte.created}_`,
        karte.updated ? `_Aktualisiert: ${karte.updated}_` : '',
      ].filter(Boolean).join('\n');

      const data = await tgCall(token, 'sendMessage', {
        chat_id: chatId,
        text: msg,
        parse_mode: 'Markdown',
      });
      return { content: [{ type: 'text', text: `✅ Insel-Stats gesendet:\n${msg}` }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Fehler beim Abrufen der Schatzkarte: ${e.message}` }] };
    }
  }

  return { content: [{ type: 'text', text: `Unbekanntes Tool: ${name}` }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
