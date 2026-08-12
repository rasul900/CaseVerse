import express from 'express';
import cors from 'cors';
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
} from './store.js';
import { handleTelegramUpdate } from './bot.js';
import { resolveAuth, resolveUserId } from './auth.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'caseverse-api' });
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'caseverse-api' });
  });

  app.get('/api/me', (req, res) => {
    try {
      const auth = resolveAuth(req);
      res.json(getOrCreateUser(auth.id, auth.username));
    } catch (e) {
      res.status(401).json({ error: (e as Error).message });
    }
  });

  app.get('/api/cases', (_req, res) => {
    res.json(listCases());
  });

  app.post('/api/cases/:caseId/open', (req, res) => {
    try {
      const auth = resolveAuth(req);
      getOrCreateUser(auth.id, auth.username);
      res.json(openCase(auth.id, req.params.caseId));
    } catch (e) {
      const msg = (e as Error).message;
      res.status(msg.includes('auth') || msg.includes('initData') || msg.includes('Telegram') ? 401 : 400).json({ error: msg });
    }
  });

  app.get('/api/upgrade/targets', (_req, res) => {
    res.json(catalogTargets());
  });

  app.post('/api/upgrade/quote', (req, res) => {
    try {
      const userId = resolveUserId(req);
      const { instanceIds, targetItemId } = req.body as {
        instanceIds: string[];
        targetItemId: string;
      };
      res.json(quoteUpgrade(userId, instanceIds, targetItemId));
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  app.post('/api/upgrade', (req, res) => {
    try {
      const userId = resolveUserId(req);
      const { instanceIds, targetItemId } = req.body as {
        instanceIds: string[];
        targetItemId: string;
      };
      res.json(performUpgrade(userId, instanceIds, targetItemId));
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  app.get('/api/market', (req, res) => {
    res.json(
      listMarket({
        rarity: req.query.rarity ? String(req.query.rarity) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        caseId: req.query.caseId ? String(req.query.caseId) : undefined,
      }),
    );
  });

  app.post('/api/market/list', (req, res) => {
    try {
      const userId = resolveUserId(req);
      const { instanceId, price } = req.body as { instanceId: string; price: number };
      res.json(createListing(userId, instanceId, price));
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  app.post('/api/market/:listingId/buy', (req, res) => {
    try {
      const userId = resolveUserId(req);
      res.json(buyListing(userId, req.params.listingId));
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  /** Telegram Bot webhook */
  app.post('/api/telegram', async (req, res) => {
    try {
      await handleTelegramUpdate(req.body);
      res.json({ ok: true });
    } catch (e) {
      console.error('[telegram]', e);
      res.status(200).json({ ok: true }); // always 200 so Telegram doesn't retry forever
    }
  });

  /**
   * One-time setup after Vercel deploy:
   * GET /api/bot/setup?secret=SETUP_SECRET
   * Sets webhook + menu button to WEBAPP_URL
   */
  app.all('/api/bot/setup', async (req, res) => {
    try {
      const secret = String(req.query.secret ?? req.headers['x-setup-secret'] ?? '');
      const expected = process.env.SETUP_SECRET;
      if (!expected || secret !== expected) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      const { setupBot } = await import('./bot.js');
      const result = await setupBot();
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  });

  return app;
}
