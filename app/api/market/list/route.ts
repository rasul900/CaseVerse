import { resolveAuth } from '@/bot';
import { createListing } from '@/lib/store';
import { authStatus, err, ok } from '@/lib/http';

export async function POST(req: Request) {
  try {
    const auth = resolveAuth(req.headers);
    const body = (await req.json()) as { instanceId: string; price: number };
    return ok(createListing(auth.id, body.instanceId, body.price));
  } catch (e) {
    return err((e as Error).message, authStatus((e as Error).message));
  }
}
