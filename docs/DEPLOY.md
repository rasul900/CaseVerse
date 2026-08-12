# Deploy (Next.js + Vercel)

## Vercel Settings

| Setting | Qiymat |
|---|---|
| Framework | **Next.js** (avtomatik) |
| Root Directory | bo'sh |
| Build Command | `next build` (default) |
| Output | default |

## Env

| Name | Value |
|---|---|
| `BOT_TOKEN` | BotFather token |
| `WEBAPP_URL` | `https://YOUR.vercel.app` |
| `SETUP_SECRET` | random parol |
| `ALLOW_DEMO_USER` | `0` |

## Bot ulash

```
https://YOUR.vercel.app/api/bot/setup?secret=SETUP_SECRET
```

Keyin Telegramda `/start`.
