import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buyListing,
  catalogTargets,
  createListing,
  getOrCreateUser,
  listCases,
  listMarket,
  openCase,
  performUpgrade,
  quoteUpgrade,
} from '../apps/api/src/store';
import { handleTelegramUpdate, setupBot } from '../apps/api/src/bot';
import { resolveAuth } from '../apps/api/src/auth';

function pathOf(req: VercelRequest): string {
  const parts = req.query.path;
  if (Array.isArray(parts)) return parts.join('/');
  if (typeof parts === 'string') return parts;
  const url = req.url ?? '';
  const clean = url.split('?')[0] ?? '';
  return clean.replace(/^\/api\/?/, '');
}

function readBody<T>(req: VercelRequest): T {
  return (req.body ?? {}) as T;
}

function send(res: VercelResponse, status: number, data: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json').json(data);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-telegram-init-data, x-user-id, x-setup-secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const path = pathOf(req);
  const method = (req.method ?? 'GET').toUpperCase();

  try {
    if (path === 'health' && method === 'GET') {
      send(res, 200, { ok: true, service: 'caseverse-api' });
      return;
    }

    if (path === 'me' && method === 'GET') {
      const auth = resolveAuth(req as never);
      send(res, 200, getOrCreateUser(auth.id, auth.username));
      return;
    }

    if (path === 'cases' && method === 'GET') {
      send(res, 200, listCases());
      return;
    }

    const openMatch = path.match(/^cases\/([^/]+)\/open$/);
    if (openMatch && method === 'POST') {
      const auth = resolveAuth(req as never);
      getOrCreateUser(auth.id, auth.username);
      send(res, 200, openCase(auth.id, openMatch[1]!));
      return;
    }

    if (path === 'upgrade/targets' && method === 'GET') {
      send(res, 200, catalogTargets());
      return;
    }

    if (path === 'upgrade/quote' && method === 'POST') {
      const auth = resolveAuth(req as never);
      const body = readBody<{ instanceIds: string[]; targetItemId: string }>(req);
      send(res, 200, quoteUpgrade(auth.id, body.instanceIds, body.targetItemId));
      return;
    }

    if (path === 'upgrade' && method === 'POST') {
      const auth = resolveAuth(req as never);
      const body = readBody<{ instanceIds: string[]; targetItemId: string }>(req);
      send(res, 200, performUpgrade(auth.id, body.instanceIds, body.targetItemId));
      return;
    }

    if (path === 'market' && method === 'GET') {
      send(
        res,
        200,
        listMarket({
          rarity: req.query.rarity ? String(req.query.rarity) : undefined,
          minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
          maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
          caseId: req.query.caseId ? String(req.query.caseId) : undefined,
        }),
      );
      return;
    }

    if (path === 'market/list' && method === 'POST') {
      const auth = resolveAuth(req as never);
      const body = readBody<{ instanceId: string; price: number }>(req);
      send(res, 200, createListing(auth.id, body.instanceId, body.price));
      return;
    }

    const buyMatch = path.match(/^market\/([^/]+)\/buy$/);
    if (buyMatch && method === 'POST') {
      const auth = resolveAuth(req as never);
      send(res, 200, buyListing(auth.id, buyMatch[1]!));
      return;
    }

    if (path === 'telegram' && method === 'POST') {
      await handleTelegramUpdate(req.body);
      send(res, 200, { ok: true });
      return;
    }

    if (path === 'bot/setup' && (method === 'GET' || method === 'POST')) {
      const secret = String(req.query.secret ?? req.headers['x-setup-secret'] ?? '');
      if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
        send(res, 403, { error: 'Forbidden' });
        return;
      }
      send(res, 200, await setupBot());
      return;
    }

    send(res, 404, { error: `Not found: /api/${path}` });
  } catch (e) {
    const msg = (e as Error).message || 'Server error';
    const status =
      msg.includes('Telegram') || msg.includes('initData') || msg.includes('auth') ? 401 : 400;
    send(res, status, { error: msg });
  }
}
