import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

export type TelegramWebAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

function parseInitData(initData: string, botToken: string): TelegramWebAppUser {
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
  const ageSec = Math.floor(Date.now() / 1000) - authDate;
  if (!authDate || ageSec > 86400) {
    throw new Error('Expired Telegram initData');
  }

  const userRaw = params.get('user');
  if (!userRaw) throw new Error('Missing user in initData');
  return JSON.parse(userRaw) as TelegramWebAppUser;
}

export type AuthUser = { id: string; username?: string };

/**
 * Resolve player:
 * 1) Valid Telegram WebApp initData (production)
 * 2) x-user-id header when ALLOW_DEMO_USER=1 or non-production
 */
export function resolveAuth(req: Request): AuthUser {
  const initData = String(req.headers['x-telegram-init-data'] ?? '');
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
    return { id: String(req.headers['x-user-id'] ?? 'demo-user') };
  }

  throw new Error('Telegram auth required (open via Mini App)');
}

export function resolveUserId(req: Request): string {
  return resolveAuth(req).id;
}
