import { resolveAuth } from '@/bot';
import { quoteUpgrade } from '@/lib/store';
import { authStatus, err, ok } from '@/lib/http';

export async function POST(req: Request) {
  try {
    const auth = resolveAuth(req.headers);
    const body = (await req.json()) as { instanceIds: string[]; targetItemId: string };
    return ok(quoteUpgrade(auth.id, body.instanceIds, body.targetItemId));
  } catch (e) {
    return err((e as Error).message, authStatus((e as Error).message));
  }
}
