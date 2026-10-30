# Technology Stack Decision

The repository is empty, so this stack is proposed from first principles. The user confirmed the four key choices on 2026-10-30: managed Postgres, a Next.js + NestJS monorepo, Claude as the default AI provider, and external APIs plus a curated seed for Islamic content. Full ADRs are in [architecture/ARCHITECTURE_DECISIONS.md](architecture/ARCHITECTURE_DECISIONS.md).

## Requirements that drive the choice

| Driver | Source |
|---|---|
| The web app is the primary product. It must be a responsive, installable PWA that works offline. | Directive §2.1–3, §4.P |
| A native Android widget must consume the **same backend API** | §4.O |
| A public API for future integrations | §4.R |
| Background work: reminders, digests, report generation, AI batches, future-letter delivery | §4.N, Q, K |
| Strong RBAC, audit logging, and data isolation | §4.B, §6 |
| Full EN/BN localization, including server-rendered emails and notifications | §4.C |
| A relational domain with many per-user time-series records (completions, salah, etc.) | §4 overall |
| A small team. Avoid microservices. | §3 Stage 3 |

## Selected stack

| Layer | Choice | Why | Alternatives considered |
|---|---|---|---|
| Language | **TypeScript** end to end (Kotlin for the widget) | One language across web, API, and shared domain logic. Shared Zod schemas avoid contract drift. | — |
| Monorepo | **pnpm workspaces + Turborepo** | Shared `domain`, `contracts`, `i18n`, and `tokens` packages, with cached builds | Nx (heavier); Yarn (no advantage) |
| Web | **Next.js 15+ App Router, React, Tailwind CSS** | SSR/SSG for fast first paint on low-end phones and in-app browsers, route-level code splitting, and a mature PWA tooling ecosystem | Vite SPA (no SSR, so worse first load in in-app browsers); Remix (smaller ecosystem) |
| UI primitives | **Radix UI** wrapped in `packages/ui` | Accessible behaviour (focus, ARIA) without imposing a visual style | MUI (heavy, opinionated look) |
| i18n | **next-intl** (ICU messages) for web; the same JSON catalogs are used in the API for emails and notifications | ICU plurals, locale routing, server components | react-i18next |
| PWA | **Serwist** (Workbox successor for Next.js) + IndexedDB (via `idb`) outbox | Maintained, works with App Router | next-pwa (unmaintained) |
| API | **NestJS** modular monolith, REST, OpenAPI 3.1 | Module boundaries, DI, guards for RBAC, and first-class OpenAPI. A dedicated API serves web, widget, and the public API together. | Next.js route handlers only (the widget and public API would be tied to the web deployment, and long-running jobs fit poorly); Express (we would hand-build structure) |
| ORM | **Prisma** | Type-safe queries, migrations, and good Postgres support. Raw SQL is still used for heavy aggregates. | Drizzle (a strong option; Prisma chosen for the maturity of its migration tooling) |
| Validation | **Zod** (shared) via a Nest pipe | One schema for client and server | class-validator only |
| Database | **PostgreSQL 16+, managed (Neon)** | Relational integrity, JSONB where it fits, partial indexes, and row-level filters. Neon offers branching for preview environments. | MySQL; MongoDB (a poor fit for relational data) |
| Jobs | **pg-boss** in a separate `worker` process | Reuses Postgres, so there is no Redis to run at the start. Supports scheduling, retries, and singleton jobs. | BullMQ + Redis (added later if throughput requires it) |
| Cache / rate limit | Postgres plus an in-process LRU at first; **Redis optional later** | Avoids infrastructure before it is needed | — |
| Auth | Own implementation in NestJS: **Argon2id**; **opaque DB-backed session cookie** for the web (SameSite=Lax + Origin check) and an opaque **device token** for the widget; Google OAuth (Authorization Code + PKCE); admin TOTP + step-up (DL-012). | Full control over RBAC, multi-device sessions, and widget device linking | Auth.js (web-centric, awkward for the widget); Supabase Auth / Clerk (vendor lock-in, and admin RBAC lives elsewhere) |
| Email | **Resend** (adapter; SMTP fallback). Templates use React Email with EN/BN. | Simple API and good deliverability | SES (more setup) |
| Push | Web Push with **VAPID** (`web-push` library) | Standard; no Firebase dependency for the web | FCM |
| Storage | **S3-compatible (Cloudflare R2)**, signed upload URLs | Low cost and no egress fees | — |
| AI | **Anthropic Claude** (current Claude 5 family) behind `AiProvider` | User choice. The abstraction keeps the provider swappable. | OpenAI, Gemini (possible future adapters) |
| Islamic data | Quran.com API v4 (cached), `adhan` (prayer times), Hijri computed with `Intl` Islamic calendars plus a user offset, and a curated Dua/Hadith seed with references | User choice. Prayer times run offline-capable on the client. | Aladhan API (network dependency) |
| Android widget | **Kotlin, Jetpack Glance, WorkManager, DataStore, Ktor client, minSdk 26** | Modern widget API with interactive actions (`actionRunCallback`) | RemoteViews XML (more boilerplate); React Native/Capacitor (would turn the product native, which is not allowed) |
| Testing | Vitest everywhere in TS (packages, web, api with Supertest; DL-035), Playwright (E2E, PWA, responsive), axe-core, Lighthouse CI, k6, OWASP ZAP baseline, Android instrumented + Glance tests | See [qa/QA_STRATEGY.md](qa/QA_STRATEGY.md) | — |
| Observability | Pino structured logs, OpenTelemetry traces, Sentry (web + api + Android) | — | — |
| CI/CD | GitHub Actions; Vercel (web), Render/Fly.io (api + worker), Neon branches per preview | Proposal; final choice is an open decision | — |

## What we deliberately do not use (yet)
- **Microservices / Kubernetes:** the scale does not justify them. The modular monolith has clean module boundaries, so modules can be extracted later.
- **GraphQL:** REST plus OpenAPI is simpler to cache, rate-limit, and use from the widget.
- **Redis:** deferred until rate-limit or cache load measurements justify it (ADR-005).
- **A native mobile app:** prohibited. The Android project is a widget host only.
