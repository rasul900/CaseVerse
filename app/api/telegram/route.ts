import { handleTelegramUpdate } from '@/bot';
import { ok } from '@/lib/http';

export async function POST(req: Request) {
  try {
    const update = await req.json();
    await handleTelegramUpdate(update);
  } catch (e) {
    console.error('[telegram]', e);
  }
  return ok({ ok: true });
}
