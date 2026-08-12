#!/usr/bin/env node
/**
 * Local helper: set Telegram webhook + menu button.
 * Usage:
 *   BOT_TOKEN=... WEBAPP_URL=https://xxx.vercel.app node scripts/setup-bot.mjs
 * Or after deploy:
 *   open https://xxx.vercel.app/api/bot/setup?secret=SETUP_SECRET
 */

const token = process.env.BOT_TOKEN;
const webAppUrl = process.env.WEBAPP_URL?.replace(/\/$/, '');

if (!token || !webAppUrl) {
  console.error('Set BOT_TOKEN and WEBAPP_URL env vars');
  process.exit(1);
}

const api = (method, body) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const data = await r.json();
    if (!data.ok) throw new Error(data.description || method);
    return data.result;
  });

const webhookUrl = `${webAppUrl}/api/telegram`;

const me = await api('getMe', {});
await api('setWebhook', {
  url: webhookUrl,
  allowed_updates: ['message'],
  drop_pending_updates: true,
});
await api('setChatMenuButton', {
  menu_button: {
    type: 'web_app',
    text: 'CaseVerse',
    web_app: { url: webAppUrl },
  },
});
await api('setMyCommands', {
  commands: [
    { command: 'start', description: 'Mini Appni ochish' },
    { command: 'help', description: 'Yordam' },
  ],
});

console.log(`OK @${me.username}`);
console.log(`Webhook → ${webhookUrl}`);
console.log(`Mini App → ${webAppUrl}`);
