import type {
  InventoryItem,
  ItemDef,
  MarketListing,
  OpenCaseResult,
  UpgradeResult,
  UserState,
} from '@/lib/types';

function telegramInitData(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).Telegram?.WebApp?.initData ?? '';
  } catch {
    return '';
  }
}

async function waitForInitData(timeoutMs = 2500): Promise<string> {
  const start = Date.now();
  let data = telegramInitData();
  while (!data && Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 50));
    data = telegramInitData();
  }
  return data;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const initData = await waitForInitData();
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
    api<{ successChance: number }>('/api/upgrade/quote', {
      method: 'POST',
      body: JSON.stringify({ instanceIds, targetItemId }),
    }),
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
    api<{ item: InventoryItem }>(`/api/market/${listingId}/buy`, { method: 'POST' }),
};
