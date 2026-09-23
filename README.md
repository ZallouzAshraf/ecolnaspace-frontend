# EcolnaSpace Frontend

Premium multi-tenant educational SaaS UI — French, English, Arabic (RTL).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix)
- next-intl (`fr` / `en` / `ar`)
- TanStack Query · React Hook Form · Zod
- Lucide icons

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Default app URL: [http://localhost:3001](http://localhost:3001). API: `NEXT_PUBLIC_API_URL` → Nest (`http://localhost:3000/api/v1`).

Ensure the backend `CORS_ORIGINS` includes `http://localhost:3001` with credentials (refresh cookie).

## Phase 1 — Auth & shell

- Session bootstrap via refresh cookie + `GET /auth/me`
- Soft middleware gate (`ecolnaspace_auth` hint cookie) + hard client `AuthGate`
- Org name branding (+ optional `config.accentColor` / `config.logoUrl`)
- Permission-filtered sidebar
- Onboarding checklist from campuses / teachers / students counts
- Command palette `⌘K` / `Ctrl+K`

## Routes

| Path | Purpose |
|------|---------|
| `/{locale}/login` | Sign in |
| `/{locale}/register` | Create organization |
| `/{locale}/forgot-password` | Password reset request |
| `/{locale}/reset-password` | Set new password |
| `/{locale}/verify-email` | Email verification |
| `/{locale}/dashboard` | Protected shell + onboarding |

Locales: `fr` (default), `en`, `ar` (RTL).
