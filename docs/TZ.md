# Telegram Mini App — Case Opening & Skin Marketplace ("CaseVerse")

Skinoz / Skinfight uslubidagi, lekin o'zingizga xos brendli case-opening Mini App uchun to'liq spetsifikatsiya.

---

## 1. Umumiy g'oya

Telegram Mini App bo'lib, foydalanuvchilar:
- Pul yoki ichki valyuta (coin) evaziga **case (quti/keys)** sotib oladi
- Case'ni ochib, tasodifiy **skin/item** yutib oladi
- Yutilgan itemlarni **upgrade** qilib, kattaroq/qimmatroq itemga almashtirishga urinadi (risk bilan)
- Itemlarni ichki **marketpleysda** sotadi yoki sotib oladi
- Barcha jarayonlar **animatsiya + ovoz effektlari** bilan boyitilgan

---

## 2. Asosiy modullar

### A) Case Opening
- Har bir case — o'z nomi, narxi va item pool'iga ega
- Case ochilganda: **ruletka/slot animatsiyasi**
- Ochilish paytida **ovozli effekt** + rarity bo'yicha final tovush
- Rarity: Common, Uncommon, Rare, Epic, Legendary, Mythic

### B) Upgrade tizimi
- 1 yoki bir nechta item → maqsadli itemga upgrade urinishi
- Aylanuvchi wheel — muvaffaqiyat foizi vizual sektor
- Yashil = win, qizil = item yo'qoladi

### C) Marketplace
- Filtrlar: rarity, narx, case turi
- Komissiya 5% (asosiy daromad manbalaridan biri)

### D) Inventar
- Sotish, upgrade, (ixtiyoriy) withdraw

---

## 3. Drop rate / EV

| Daraja | Ehtimollik (%) | Narx diapazoni |
|---|---|---|
| Common | 60–70% | 0.5x – 1x |
| Uncommon | 20–25% | 1x – 2x |
| Rare | 7–10% | 2x – 5x |
| Epic | 2–4% | 5x – 15x |
| Legendary | 0.5–1% | 15x – 50x |
| Mythic | 0.05–0.2% | 50x – 500x+ |

**Tamoyillar:**
1. Case EV = case narxining 85–92% (house edge)
2. Pity-system (ixtiyoriy)
3. Server-side RNG majburiy
4. Provably fair (server seed + client seed + hash)

Upgrade: 2x ≈ 45%, 5x ≈ 15%, 10x ≈ 7% — EV foydalanuvchi foydasiga bo'lmasligi kerak.

---

## 4. Animatsiya / ovoz

- Case: CSS/Canvas/Lottie, 3–5s, ease-out-cubic
- Upgrade: SVG wheel
- Howler.js, Framer Motion / GSAP

---

## 5. Stack

- Frontend: React + `@twa-dev/sdk`
- Backend: Node.js (Express/NestJS)
- DB: PostgreSQL + Redis
- To'lov: Telegram Stars / TON

---

## 6. Monetizatsiya

1. Case EV house edge
2. Marketplace komissiya 5–10%
3. Premium / limited cases
4. Referral

---

## 7. Huquqiy eslatma

Loot-box modeli ba'zi mamlakatlarda gambling sifatida tartibga solinishi mumkin. Launch oldidan yurist bilan tekshirish zarur.

---

## 8. Implementatsiya holati (repo)

- [x] Loyiha papkasi va TZ
- [x] Shared RNG/EV engine
- [x] Backend API skeleton
- [x] Frontend Mini App prototipi (cases, open, upgrade, inventory, market)

### Ishga tushirish

```bash
cd C:\Users\abdur\CaseVerse
npm install
npm run dev:api   # :3001
npm run dev:web   # :5173
```
