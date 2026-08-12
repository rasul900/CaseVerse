import { resolveAuth } from '@/bot';
import { buyListing } from '@/lib/store';
import { authStatus, err, ok } from '@/lib/http';

export async function POST(
  req: Request,
  ctx: { params: Promise<{ listingId: string }> },
) {
  try {
    const { listingId } = await ctx.params;
    const auth = resolveAuth(req.headers);
    return ok(buyListing(auth.id, listingId));
  } catch (e) {
    return err((e as Error).message, authStatus((e as Error).message));
  }
}
