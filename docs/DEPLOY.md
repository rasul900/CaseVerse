# CaseVerse — Telegram Mini App + Bot (Vercel)

## Sizdan kerak

1. **Bot token** — [@BotFather](https://t.me/BotFather) → `/newbot`
2. **GitHub repo** — loyihani push qilasiz
3. **Vercel** — GitHub repo ulanadi

## 1) BotFather

```
/newbot
```
Tokenni saqlang. Keyin (ixtiyoriy):

```
/setmenubutton
```
URL ni keyinroq Vercel domainiga qo‘yasiz — yoki avtomatik setup ishlatasiz.

## 2) GitHub

```bash
cd C:\Users\abdur\CaseVerse
git add .
git commit -m "CaseVerse Mini App + Telegram bot"
git remote add origin https://github.com/USER/REPO.git
git push -u origin main
```

## 3) Vercel sozlamalari (muhim)

Import / Settings → Build & Development Settings:

| Setting | Qiymat |
|---|---|
| Framework Preset | **Other** |
| Root Directory | bo'sh (repo root) |
| Build Command | `npm run build:web` (Override ON) |
| Output Directory | `apps/web/dist` (Override ON) |
| Install Command | `npm install` |

Environment Variables:

| Name | Value |
|---|---|
| `BOT_TOKEN` | BotFather token |
| `WEBAPP_URL` | `https://YOUR-PROJECT.vercel.app` |
| `SETUP_SECRET` | uzun random parol |
| `ALLOW_DEMO_USER` | `0` |

Deploy qiling.

## 4) Botni ulash (webhook + menu)

Deploydan keyin brauzerda oching:

```
https://YOUR-PROJECT.vercel.app/api/bot/setup?secret=SETUP_SECRET
```

Javobda `bot`, `webhookUrl`, `webAppUrl` ko‘rinadi.

Yoki lokal:

```bash
set BOT_TOKEN=...
set WEBAPP_URL=https://YOUR-PROJECT.vercel.app
npm run bot:setup
```

## 5) Tekshirish

1. Telegramda botga `/start`
2. **CaseVerse ochish** tugmasi → Mini App
3. Yuqoridagi menu tugmasi ham ishlashi kerak

## Local development

```bash
# terminal 1
npm run dev:api

# terminal 2  
npm run dev:web
```

`.env` (apps/api yoki root):

```
BOT_TOKEN=...
WEBAPP_URL=http://localhost:5173
ALLOW_DEMO_USER=1
SETUP_SECRET=dev
```

Local Mini App test uchun [ngrok](https://ngrok.com) HTTPS tunnel kerak (Telegram `http://localhost` ni Mini App sifatida ochmaydi).

## Eslatma

Hozirgi user/inventar holati **memory**da (serverless warm instance). Production uchun keyin PostgreSQL/Redis qo‘shiladi — aks holda cold startlarda coin/inventar reset bo‘lishi mumkin.
