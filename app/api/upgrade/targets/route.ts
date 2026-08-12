import { catalogTargets } from '@/lib/store';
import { ok } from '@/lib/http';

export async function GET() {
  return ok(catalogTargets());
}
