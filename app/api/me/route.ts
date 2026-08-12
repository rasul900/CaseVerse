import { resolveAuth } from '@/bot';
import { getOrCreateUser } from '@/lib/store';
import { authStatus, err, ok } from '@/lib/http';

export async function GET(req: Request) {
  try {
    const auth = resolveAuth(req.headers);
    return ok(getOrCreateUser(auth.id, auth.username));
  } catch (e) {
    return err((e as Error).message, authStatus((e as Error).message));
  }
}
