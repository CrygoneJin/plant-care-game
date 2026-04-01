#!/usr/bin/env node
/**
 * WhatsApp MCP Server — Schatzinsel
 * Sendet Nachrichten via WhatsApp Cloud API (Meta Business)
 *
 * Benötigt:
 * - WHATSAPP_TOKEN: Permanent Access Token aus Meta Business Dashboard
 * - WHATSAPP_PHONE_ID: Phone Number ID aus WhatsApp API Setup
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

const server = new Server(
  { name: 'whatsapp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    throw new Error('WHATSAPP_TOKEN und WHATSAPP_PHONE_ID müssen als Umgebungsvariablen gesetzt sein');
  }
  return { token, phoneId };
}

server.setRequestHandler({ method: 'tools/list' }, async () => ({
  tools: [
    {
      name: 'send_message',
      description: 'Sendet eine WhatsApp-Nachricht an eine Telefonnummer',
      inputSchema: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Telefonnummer mit Ländervorwahl, z.B. 4917612345678'
          },
          message: {
            type: 'string',
            description: 'Die Nachricht die gesendet werden soll'
          }
        },
        required: ['to', 'message']
      }
    },
    {
      name: 'send_link',
      description: 'Sendet einen Link mit Vorschau-Text via WhatsApp',
      inputSchema: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Telefonnummer mit Ländervorwahl'
          },
          url: {
            type: 'string',
            description: 'Der Link der gesendet werden soll'
          },
          text: {
            type: 'string',
            description: 'Begleittext zum Link'
          }
        },
        required: ['to', 'url']
      }
    },
    {
      name: 'send_template',
      description: 'Sendet eine genehmigte WhatsApp-Template-Nachricht (für Erstkontakt)',
      inputSchema: {
        type: 'object',
        properties: {
          to: {
            type: 'string',
            description: 'Telefonnummer mit Ländervorwahl'
          },
          template_name: {
            type: 'string',
            description: 'Name des genehmigten Templates, z.B. "hello_world"'
          },
          language: {
            type: 'string',
            description: 'Sprachcode, z.B. "de" oder "en_US"',
            default: 'de'
          }
        },
        required: ['to', 'template_name']
      }
    }
  ]
}));

server.setRequestHandler({ method: 'tools/call' }, async (request) => {
  const { name, arguments: args } = request.params;
  const { token, phoneId } = getConfig();

  if (name === 'send_message') {
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: args.to,
        type: 'text',
        text: { body: args.message }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { content: [{ type: 'text', text: `Fehler: ${JSON.stringify(data.error || data)}` }] };
    }
    return { content: [{ type: 'text', text: `✅ Nachricht gesendet an ${args.to} (ID: ${data.messages?.[0]?.id || 'unknown'})` }] };
  }

  if (name === 'send_link') {
    const body = args.text ? `${args.text}\n\n${args.url}` : args.url;
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: args.to,
        type: 'text',
        text: { preview_url: true, body }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { content: [{ type: 'text', text: `Fehler: ${JSON.stringify(data.error || data)}` }] };
    }
    return { content: [{ type: 'text', text: `✅ Link gesendet an ${args.to} (ID: ${data.messages?.[0]?.id || 'unknown'})` }] };
  }

  if (name === 'send_template') {
    const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: args.to,
        type: 'template',
        template: {
          name: args.template_name,
          language: { code: args.language || 'de' }
        }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { content: [{ type: 'text', text: `Fehler: ${JSON.stringify(data.error || data)}` }] };
    }
    return { content: [{ type: 'text', text: `✅ Template "${args.template_name}" gesendet an ${args.to}` }] };
  }

  return { content: [{ type: 'text', text: `Unbekanntes Tool: ${name}` }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
