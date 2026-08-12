import { resolveAuth } from '@/bot';
import { getOrCreateUser, openCase } from '@/lib/store';
import { authStatus, err, ok } from '@/lib/http';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ caseId: string }> },
) {
  try {
    const { caseId } = await ctx.params;
    const auth = resolveAuth(req.headers);
    getOrCreateUser(auth.id, auth.username);
    return ok(openCase(auth.id, caseId));
  } catch (e) {
    return err((e as Error).message, authStatus((e as Error).message));
  }
}
