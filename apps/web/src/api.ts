import type {
  InventoryItem,
  ItemDef,
  MarketListing,
  OpenCaseResult,
  UpgradeQuote,
  UpgradeResult,
  UserState,
} from '@caseverse/shared';

function telegramInitData(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp;
    return tg?.initData ?? '';
  } catch {
    return '';
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const initData = telegramInitData();
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(initData ? { 'x-telegram-init-data': initData } : { 'x-user-id': 'demo-user' }),
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export type CaseCard = {
  id: string;
  name: string;
  price: number;
  description: string;
  limited?: boolean;
  itemCount: number;
  items: ItemDef[];
};

export const client = {
  me: () => api<UserState>('/api/me'),
  cases: () => api<CaseCard[]>('/api/cases'),
  openCase: (caseId: string) =>
    api<OpenCaseResult>(`/api/cases/${caseId}/open`, { method: 'POST' }),
  upgradeTargets: () => api<ItemDef[]>('/api/upgrade/targets'),
  quoteUpgrade: (instanceIds: string[], targetItemId: string) =>
    api<UpgradeQuote & { target: ItemDef; instances: InventoryItem[] }>(
      '/api/upgrade/quote',
      {
        method: 'POST',
        body: JSON.stringify({ instanceIds, targetItemId }),
      },
    ),
  upgrade: (instanceIds: string[], targetItemId: string) =>
    api<UpgradeResult>('/api/upgrade', {
      method: 'POST',
      body: JSON.stringify({ instanceIds, targetItemId }),
    }),
  market: (q: URLSearchParams) => api<MarketListing[]>(`/api/market?${q}`),
  listItem: (instanceId: string, price: number) =>
    api<MarketListing>('/api/market/list', {
      method: 'POST',
      body: JSON.stringify({ instanceId, price }),
    }),
  buy: (listingId: string) =>
    api<{ item: InventoryItem; paid: number; fee: number; coinsLeft: number }>(
      `/api/market/${listingId}/buy`,
      { method: 'POST' },
    ),
};
