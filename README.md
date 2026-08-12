# CaseVerse (Next.js)

Telegram Mini App + bot. Vercel uchun oddiy Next.js loyiha.

## Struktura

```
app/           # Next.js UI + API routes
bot/           # Telegram bot (alohida)
lib/           # RNG, catalog, store
components/    # Mini App UI
docs/          # TZ + deploy
```

## Local

```bash
npm install
npm run dev
```

http://localhost:3000

## Vercel

1. Import `rasul900/CaseVerse`
2. Framework: **Next.js** (auto)
3. Env:
   - `BOT_TOKEN`
   - `WEBAPP_URL` = `https://YOUR.vercel.app`
   - `SETUP_SECRET`
   - `ALLOW_DEMO_USER` = `0`
4. Deploy
5. Ochish: `https://YOUR.vercel.app/api/bot/setup?secret=SETUP_SECRET`
6. Telegram `/start`
