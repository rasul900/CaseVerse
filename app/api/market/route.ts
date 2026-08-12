import { listMarket } from '@/lib/store';
import { ok } from '@/lib/http';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return ok(
    listMarket({
      rarity: searchParams.get('rarity') ?? undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      caseId: searchParams.get('caseId') ?? undefined,
    }),
  );
}
