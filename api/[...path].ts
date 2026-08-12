import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../apps/api/src/app.js';

const app = createApp();

/**
 * Catch-all: /api/* → Express app with original /api/... path.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const parts = req.query.path;
  const suffix = Array.isArray(parts) ? parts.join('/') : parts ? String(parts) : '';
  const qsIndex = req.url?.indexOf('?') ?? -1;
  const qs = qsIndex >= 0 ? req.url!.slice(qsIndex) : '';
  req.url = `/api/${suffix}${qs}`;
  return app(req, res);
}
