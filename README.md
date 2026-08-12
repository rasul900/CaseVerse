# CaseVerse

Telegram Mini App — case opening, upgrade, marketplace + Telegram bot.

## Tezkor start (local)

```bash
npm install
npm run dev:api
npm run dev:web
```

- Web: http://localhost:5173  
- API: http://localhost:3001  

## Telegram + Vercel

To‘liq yo‘riqnoma: [docs/DEPLOY.md](docs/DEPLOY.md)

Qisqa:

1. GitHubga push
2. Vercelga ulang, env qo‘ying: `BOT_TOKEN`, `WEBAPP_URL`, `SETUP_SECRET`
3. Oching: `https://YOUR.app/api/bot/setup?secret=SETUP_SECRET`
4. Botga `/start` → Mini App

## Struktura

```
apps/web      React Mini App
apps/api      Express (local) + bot webhook
api/          Vercel serverless entry
packages/shared   RNG / EV / catalog
docs/TZ.md    Texnik topshiriq
```
