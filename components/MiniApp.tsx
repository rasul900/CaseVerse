'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { InventoryItem, ItemDef, MarketListing, OpenCaseResult, UserState } from '@/lib/types';
import { client, type CaseCard } from '@/lib/client-api';
import { formatCoins, rarityColor, rarityLabel } from '@/lib/format';
import { CaseOpenModal } from '@/components/CaseOpenModal';
import { UpgradeWheel } from '@/components/UpgradeWheel';

type Tab = 'cases' | 'upgrade' | 'inventory' | 'market';

const NAV: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'cases',
    label: 'Cases',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M12 12v4" />
      </svg>
    ),
  },
  {
    id: 'upgrade',
    label: 'Upgrade',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
        <path d="M9 7V5a3 3 0 0 1 6 0v2" />
        <path d="M4 11h16" />
      </svg>
    ),
  },
  {
    id: 'market',
    label: 'Market',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l2-5h14l2 5" />
        <path d="M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
        <path d="M9 14h6" />
      </svg>
    ),
  },
];

export default function MiniApp() {
  const [tab, setTab] = useState<Tab>('cases');
  const [user, setUser] = useState<UserState | null>(null);
  const [cases, setCases] = useState<CaseCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<CaseCard | null>(null);
  const [openResult, setOpenResult] = useState<OpenCaseResult | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [targets, setTargets] = useState<ItemDef[]>([]);
  const [targetId, setTargetId] = useState('');
  const [chance, setChance] = useState(0);
  const [upSpinning, setUpSpinning] = useState(false);
  const [stopAngle, setStopAngle] = useState<number | null>(null);
  const [upOutcome, setUpOutcome] = useState<'win' | 'lose' | null>(null);
  const [market, setMarket] = useState<MarketListing[]>([]);
  const [rarityFilter, setRarityFilter] = useState('');

  async function refresh() {
    const [me, cs] = await Promise.all([client.me(), client.cases()]);
    setUser(me);
    setCases(cs);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mod = await import('@twa-dev/sdk');
        const WebApp = mod.default;
        WebApp.ready();
        WebApp.expand();
        WebApp.setHeaderColor('#0a0a0c');
      } catch {
        /* browser preview */
      }
      if (cancelled) return;
      try {
        await refresh();
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (tab !== 'upgrade') return;
    client.upgradeTargets().then(setTargets).catch((e) => setError(e.message));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'market') return;
    const q = new URLSearchParams();
    if (rarityFilter) q.set('rarity', rarityFilter);
    client.market(q).then(setMarket).catch((e) => setError(e.message));
  }, [tab, rarityFilter]);

  useEffect(() => {
    if (!selected.length || !targetId) {
      setChance(0);
      return;
    }
    client
      .quoteUpgrade(selected, targetId)
      .then((q) => setChance(q.successChance))
      .catch(() => setChance(0));
  }, [selected, targetId]);

  async function handleOpen(c: CaseCard) {
    setError(null);
    setOpening(c);
    setOpenResult(null);
    setSpinning(true);
    try {
      const result = await client.openCase(c.id);
      setOpenResult(result);
      setTimeout(async () => {
        setSpinning(false);
        await refresh();
      }, 4200);
    } catch (e) {
      setSpinning(false);
      setOpening(null);
      setError((e as Error).message);
    }
  }

  async function handleUpgrade() {
    if (!selected.length || !targetId) return;
    setError(null);
    setUpSpinning(true);
    setStopAngle(null);
    setUpOutcome(null);
    try {
      const result = await client.upgrade(selected, targetId);
      setStopAngle(result.stopAngle);
      setTimeout(async () => {
        setUpSpinning(false);
        setUpOutcome(result.success ? 'win' : 'lose');
        setSelected([]);
        await refresh();
      }, 3600);
    } catch (e) {
      setUpSpinning(false);
      setError((e as Error).message);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function sellItem(item: InventoryItem) {
    try {
      await client.listItem(item.instanceId, Math.max(1, Math.round(item.basePrice * 0.95)));
      await refresh();
      if (tab === 'market') {
        const q = new URLSearchParams();
        if (rarityFilter) q.set('rarity', rarityFilter);
        setMarket(await client.market(q));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function buyListing(id: string) {
    try {
      await client.buy(id);
      await refresh();
      const q = new URLSearchParams();
      if (rarityFilter) q.set('rarity', rarityFilter);
      setMarket(await client.market(q));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="app">
      <div className="brand-bar">
        <div className="brand">
          CASE<span>VERSE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user?.username && <span className="user-chip">@{user.username}</span>}
          <div className="coins">{formatCoins(user?.coins ?? 0)}</div>
        </div>
      </div>

      {tab === 'cases' && (
        <div className="tab-enter" key="cases">
          <p className="section-title">Cases</p>
          <div className="case-grid">
            {cases.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`case-tile ${c.limited ? 'limited' : ''}`}
                onClick={() => handleOpen(c)}
              >
                <div className="case-art">
                  <div className="case-icon" />
                </div>
                <div className="case-body">
                  <h3>{c.name}</h3>
                  <div className="case-meta">
                    <span className="price-chip">{c.price}</span>
                    {c.limited ? (
                      <span className="badge">Limited</span>
                    ) : (
                      <span className="case-count">{c.itemCount}</span>
                    )}
                  </div>
                  <span className="case-open-cta">Open</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'upgrade' && (
        <div className="tab-enter" key="upgrade">
          <p className="section-title">Upgrade</p>
          <div className="upgrade-panel">
            <p className="upgrade-hint">Tanlang → maqsad → g‘ildirak</p>
            <UpgradeWheel chance={chance} spinning={upSpinning} stopAngle={stopAngle} />
            {upOutcome && (
              <div className={`result-banner ${upOutcome}`}>
                {upOutcome === 'win' ? 'Upgrade muvaffaqiyatli!' : 'Item yo‘qoldi...'}
              </div>
            )}
          </div>
          <label className="field-label">Maqsad item</label>
          <select
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setStopAngle(null);
              setUpOutcome(null);
            }}
            style={{ marginBottom: 12 }}
          >
            <option value="">Tanlang...</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {rarityLabel(t.rarity)} · {t.basePrice}
              </option>
            ))}
          </select>
          <p className="section-title">Inventory</p>
          <div className="item-grid">
            {(user?.inventory ?? []).map((item) => {
              const on = selected.includes(item.instanceId);
              const c = rarityColor(item.rarity);
              return (
                <button
                  key={item.instanceId}
                  type="button"
                  className={`item-cell ${on ? 'selected' : ''}`}
                  onClick={() => toggleSelect(item.instanceId)}
                  style={{ borderColor: `${c}55` }}
                >
                  <span className="check-mark">{on ? '✓' : ''}</span>
                  <div className="swatch" style={{ background: `${c}22`, color: c, borderColor: c }}>
                    {item.rarity.slice(0, 1).toUpperCase()}
                  </div>
                  <h4>{item.name}</h4>
                  <div className="sub">{item.basePrice}</div>
                </button>
              );
            })}
            {!user?.inventory.length && <div className="empty">Avval case oching</div>}
          </div>
          <button
            className="btn"
            style={{ width: '100%', marginTop: 14 }}
            disabled={!selected.length || !targetId || upSpinning}
            onClick={handleUpgrade}
          >
            Upgrade {Math.round(chance * 100)}%
          </button>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="tab-enter" key="inventory">
          <p className="section-title">Inventory</p>
          <div className="item-grid">
            {(user?.inventory ?? []).map((item) => {
              const c = rarityColor(item.rarity);
              return (
                <div key={item.instanceId} className="item-cell" style={{ borderColor: `${c}66` }}>
                  <div className="swatch" style={{ background: `${c}22`, color: c, borderColor: c }}>
                    {item.rarity.slice(0, 1).toUpperCase()}
                  </div>
                  <h4>{item.name}</h4>
                  <div className="sub">{item.basePrice}</div>
                  <div className="cell-actions">
                    <button className="btn ghost" type="button" onClick={() => sellItem(item)}>
                      Sotish
                    </button>
                  </div>
                </div>
              );
            })}
            {!user?.inventory.length && <div className="empty">Inventar bo‘sh</div>}
          </div>
        </div>
      )}

      {tab === 'market' && (
        <div className="tab-enter" key="market">
          <p className="section-title">Market</p>
          <div className="filters">
            <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
              <option value="">Barcha rarity</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythic">Mythic</option>
            </select>
          </div>
          <div className="item-grid">
            {market.map((l) => {
              const c = rarityColor(l.instance.rarity);
              return (
                <div key={l.id} className="item-cell" style={{ borderColor: `${c}66` }}>
                  <div className="swatch" style={{ background: `${c}22`, color: c, borderColor: c }}>
                    {l.instance.rarity.slice(0, 1).toUpperCase()}
                  </div>
                  <h4>{l.instance.name}</h4>
                  <div className="sub">{l.price}</div>
                  <div className="cell-actions">
                    <button className="btn" type="button" onClick={() => buyListing(l.id)}>
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
            {!market.length && <div className="empty">Listing yo‘q</div>}
          </div>
        </div>
      )}

      {error && (
        <div className="result-banner lose" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}

      {opening && (
        <CaseOpenModal
          caseName={opening.name}
          pool={opening.items}
          result={openResult}
          spinning={spinning}
          onClose={() => {
            if (spinning) return;
            setOpening(null);
            setOpenResult(null);
          }}
        />
      )}

      <nav className="nav">
        {NAV.map(({ id, label, icon }) => (
          <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
