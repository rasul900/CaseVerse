const TELEGRAM_API = 'https://api.telegram.org';

function token(): string {
  const t = process.env.BOT_TOKEN;
  if (!t) throw new Error('BOT_TOKEN is not set');
  return t;
}

function webAppUrl(): string {
  const url = process.env.WEBAPP_URL?.replace(/\/$/, '');
  if (!url) throw new Error('WEBAPP_URL is not set (e.g. https://caseverse.vercel.app)');
  return url;
}

async function tg<T>(method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${TELEGRAM_API}/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as { ok: boolean; description?: string; result: T };
  if (!data.ok) throw new Error(data.description ?? `Telegram ${method} failed`);
  return data.result;
}

type TgUpdate = {
  update_id: number;
  message?: {
    chat: { id: number; type: string };
    text?: string;
    from?: { id: number; first_name?: string; username?: string };
  };
  callback_query?: unknown;
};

export async function handleTelegramUpdate(update: TgUpdate): Promise<void> {
  const msg = update.message;
  if (!msg?.text) return;

  const text = msg.text.trim();
  const chatId = msg.chat.id;
  const name = msg.from?.first_name ?? 'Explorer';

  if (text.startsWith('/start') || text.startsWith('/app') || text.startsWith('/play')) {
    await sendWelcome(chatId, name);
    return;
  }

  if (text.startsWith('/help')) {
    await tg('sendMessage', {
      chat_id: chatId,
      text:
        'CaseVerse buyruqlari:\n' +
        '/start — Mini Appni ochish\n' +
        '/help — yordam',
    });
  }
}

async function sendWelcome(chatId: number, name: string) {
  const url = webAppUrl();
  await tg('sendMessage', {
    chat_id: chatId,
    text:
      `Salom, ${name}! 👋\n\n` +
      `*CaseVerse* — case ochish, upgrade va marketplace Mini App.\n\n` +
      `Pastdagi tugma orqali o‘yinga kiring.`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 CaseVerse ochish', web_app: { url } }],
      ],
    },
  });
}

export async function setupBot() {
  const url = webAppUrl();
  const webhookUrl = `${url}/api/telegram`;

  const webhook = await tg<{ url: string }>('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message'],
    drop_pending_updates: true,
  });

  await tg('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'CaseVerse',
      web_app: { url },
    },
  });

  await tg('setMyCommands', {
    commands: [
      { command: 'start', description: 'Mini Appni ochish' },
      { command: 'help', description: 'Yordam' },
    ],
  });

  const me = await tg<{ username: string; first_name: string }>('getMe');

  return {
    ok: true,
    bot: me.username,
    webhook,
    webhookUrl,
    webAppUrl: url,
    menuButton: 'web_app',
  };
}
