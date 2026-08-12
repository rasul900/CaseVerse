import { createHmac, timingSafeEqual } from 'node:crypto';

export type AuthUser = { id: string; username?: string };

function header(headers: Headers, name: string): string {
  return headers.get(name) ?? '';
}

function parseInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('Missing initData hash');
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculated = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const a = Buffer.from(calculated, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Invalid Telegram initData');
  }
  const authDate = Number(params.get('auth_date') ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) {
    throw new Error('Expired Telegram initData');
  }
  const userRaw = params.get('user');
  if (!userRaw) throw new Error('Missing user in initData');
  return JSON.parse(userRaw) as {
    id: number;
    username?: string;
    first_name?: string;
  };
}

export function resolveAuth(headers: Headers): AuthUser {
  const initData = header(headers, 'x-telegram-init-data');
  const botToken = process.env.BOT_TOKEN;

  if (initData && botToken) {
    const user = parseInitData(initData, botToken);
    return {
      id: `tg:${user.id}`,
      username: user.username || user.first_name || `user_${user.id}`,
    };
  }

  const allowDemo =
    process.env.ALLOW_DEMO_USER === '1' || process.env.NODE_ENV !== 'production';
  if (allowDemo) {
    return { id: header(headers, 'x-user-id') || 'demo-user' };
  }

  throw new Error('Telegram auth required (open via Mini App)');
}
