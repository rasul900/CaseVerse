import { setupBot } from '@/bot';
import { err, ok } from '@/lib/http';

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret') ?? '';
  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return err('Forbidden', 403);
  }
  try {
    return ok(await setupBot());
  } catch (e) {
    return err((e as Error).message, 500);
  }
}

export async function POST(req: Request) {
  return GET(req);
}
