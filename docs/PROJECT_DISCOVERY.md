# Project Discovery (Stage 0)

**Date:** 2026-10-30  
**Performed by:** Claude Code (planning session)  
**Method:** Read-only inspection of `D:\Daily Good Deeds` and of the local toolchain. Every finding below comes from a command that was actually run. Nothing is inferred or invented.

## 1. Repository inspection

| Check | Result |
|---|---|
| Directory listing (recursive, including hidden files) | **Empty.** No files or folders. |
| Version control | **Not a git repository** at the time of discovery. `git init` was run afterwards to hold these docs. |
| Source code, frameworks, dependencies | None |
| Build scripts, CI config, tests | None |
| Existing UI, design system, fonts, colours, navigation | None |
| Existing documentation or conventions | None |
| Deployment configuration | None |

**Conclusion:** this is a greenfield project. There is no existing functionality to preserve and no incomplete, duplicated, or problematic code to fix. Every architecture choice is new and is justified in [TECH_STACK_DECISION.md](TECH_STACK_DECISION.md).

## 2. Development environment

| Tool | Found | Version / note |
|---|---|---|
| OS | yes | Windows 11 Pro 10.0.26300 |
| Node.js | yes | v24.21.0 |
| npm | yes | 12.2.0 |
| pnpm | **no** | Can be enabled with `corepack enable pnpm` (Node 24 ships Corepack) |
| git | yes | 2.45.1.windows.1 |
| Java (JDK) | yes | OpenJDK 21.0.12.1 (Microsoft build). Suitable for Gradle and the Android Gradle Plugin |
| Android SDK | partial | Folder exists at `%LOCALAPPDATA%\Android\Sdk`. `ANDROID_HOME` / `ANDROID_SDK_ROOT` are **not set**. Installed platforms and build-tools were not checked yet |
| Docker | **no** | Not installed. Managed Postgres was chosen, so Docker is not needed |
| PostgreSQL client (`psql`) | **no** | Not needed for development. Prisma connects directly; `psql` is optional for debugging |
| Shells | yes | PowerShell 5.1, Git Bash |

## 3. Implications

1. pnpm has to be enabled through Corepack before Phase 2. This is a one-time step.
2. A Neon (or Supabase) project and its connection strings (`DATABASE_URL`, plus `DIRECT_URL` for migrations) are needed before Phase 2 database work starts. This is a **user action**.
3. Phase 9 Android work needs `ANDROID_HOME` set and the SDK checked: platform 35+, build-tools, and an emulator image. Android Studio is recommended.
4. The project has no CI yet. GitHub Actions is planned for Phase 2, so a remote repository must be created. This is a **user action**.

## 4. External accounts and credentials needed (none exist yet)

| Need | Required by | Phase |
|---|---|---|
| Neon/Supabase Postgres | API, migrations | P2 |
| Hosting (proposed: Vercel for web; Render or Fly.io for api + worker) | Deploy | P2 (staging) |
| Email provider (Resend recommended) + verified sending domain | Verification, reset | P2 |
| Google Cloud OAuth client | Google login | P2 |
| Object storage (Cloudflare R2 / S3) | Attachments, exports | P3 |
| VAPID key pair (generated locally) | Web Push | P6 |
| Anthropic API key + budget cap | AI | P8 |
| Quran.com API terms confirmed; Hadith source licensing | Islamic content | P5 |
| Google Play Console account | Widget distribution | P9 |
| Domain name | PWA, email, deep links (assetlinks.json) | P2 |
