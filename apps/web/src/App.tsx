import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import type { InventoryItem, ItemDef, MarketListing, OpenCaseResult, UserState } from '@caseverse/shared';
import { client, type CaseCard } from './api';
import { formatCoins, rarityColor, rarityLabel } from './lib';
import { CaseOpenModal } from './components/CaseOpenModal';
import { UpgradeWheel } from './components/UpgradeWheel';
import './styles.css';

type Tab = 'cases' | 'upgrade' | 'inventory' | 'market';

export default function App() {
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
    try {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor('#071018');
    } catch {
      /* browser preview */
    }
    refresh().catch((e) => setError(e.message));
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
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function sellItem(item: InventoryItem) {
    const price = Math.max(1, Math.round(item.basePrice * 0.95));
    try {
      await client.listItem(item.instanceId, price);
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
        <div className="brand">CASEVERSE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.username && <span className="muted" style={{ fontSize: 13 }}>@{user.username}</span>}
          <div className="coins">{formatCoins(user?.coins ?? 0)}</div>
        </div>
      </div>

      {tab === 'cases' && (
        <>
          <header className="hero">
            <h1>CASEVERSE</h1>
            <p>Och, upgrade qil, bozorda sot — server RNG bilan.</p>
          </header>
          <p className="section-title">Cases</p>
          <div className="case-grid">
            {cases.map((c) => (
              <button
                key={c.id}
                className={`case-tile ${c.limited ? 'limited' : ''}`}
                onClick={() => handleOpen(c)}
              >
                <h3>{c.name}</h3>
                <p>{c.description}</p>
                <div className="case-meta">
                  <span className="price">{c.price} coin</span>
                  {c.limited ? <span className="badge">Limited</span> : <span className="muted">{c.itemCount} items</span>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'upgrade' && (
        <>
          <p className="section-title">Upgrade</p>
          <p className="muted">Itemlarni tanlang → maqsadni tanlang → g‘ildirak aylanadi.</p>
          <UpgradeWheel chance={chance} spinning={upSpinning} stopAngle={stopAngle} />
          {upOutcome && (
            <div className={`result-banner ${upOutcome}`}>
              {upOutcome === 'win' ? 'Upgrade muvaffaqiyatli!' : 'Item yo‘qoldi...'}
            </div>
          )}
          <label className="muted">Maqsad item</label>
          <select
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setStopAngle(null);
              setUpOutcome(null);
            }}
            style={{ width: '100%', marginBottom: 12 }}
          >
            <option value="">Tanlang...</option>
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {rarityLabel(t.rarity)} · {t.basePrice}
              </option>
            ))}
          </select>
          <div className="panel">
            {(user?.inventory ?? []).map((item) => (
              <label key={item.instanceId} className="item-row" style={{ cursor: 'pointer' }}>
                <div
                  className="swatch"
                  style={{ background: `${rarityColor(item.rarity)}22`, color: rarityColor(item.rarity) }}
                >
                  {item.rarity.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4>{item.name}</h4>
                  <div className="sub">
                    {rarityLabel(item.rarity)} · {item.basePrice} · float {item.float}
                  </div>
                </div>
                <input
                  className="checkbox"
                  type="checkbox"
                  checked={selected.includes(item.instanceId)}
                  onChange={() => toggleSelect(item.instanceId)}
                />
              </label>
            ))}
            {!user?.inventory.length && <div className="empty">Avval case oching</div>}
          </div>
          <button
            className="btn"
            style={{ width: '100%', marginTop: 12 }}
            disabled={!selected.length || !targetId || upSpinning}
            onClick={handleUpgrade}
          >
            Upgrade ({Math.round(chance * 100)}%)
          </button>
        </>
      )}

      {tab === 'inventory' && (
        <>
          <p className="section-title">Inventory</p>
          <div className="panel">
            {(user?.inventory ?? []).map((item) => (
              <div key={item.instanceId} className="item-row">
                <div
                  className="swatch"
                  style={{ background: `${rarityColor(item.rarity)}22`, color: rarityColor(item.rarity) }}
                >
                  {item.rarity.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4>{item.name}</h4>
                  <div className="sub">
                    {rarityLabel(item.rarity)} · {item.basePrice} coin
                  </div>
                </div>
                <button className="btn ghost" onClick={() => sellItem(item)}>
                  Sotish
                </button>
              </div>
            ))}
            {!user?.inventory.length && <div className="empty">Inventar bo‘sh</div>}
          </div>
        </>
      )}

      {tab === 'market' && (
        <>
          <p className="section-title">Marketplace</p>
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
          <div className="panel">
            {market.map((l) => (
              <div key={l.id} className="item-row">
                <div
                  className="swatch"
                  style={{
                    background: `${rarityColor(l.instance.rarity)}22`,
                    color: rarityColor(l.instance.rarity),
                  }}
                >
                  {l.instance.rarity.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h4>{l.instance.name}</h4>
                  <div className="sub">
                    {l.price} coin · fee 5%
                  </div>
                </div>
                <button className="btn" onClick={() => buyListing(l.id)}>
                  Sotib ol
                </button>
              </div>
            ))}
            {!market.length && <div className="empty">Hozircha listing yo‘q — inventardan soting</div>}
          </div>
        </>
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
        {(
          [
            ['cases', 'Cases'],
            ['upgrade', 'Upgrade'],
            ['inventory', 'Inventar'],
            ['market', 'Market'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
