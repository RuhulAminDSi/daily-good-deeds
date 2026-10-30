# Future Enhancements

This file lists items that are deliberately **not** in v1.0. None of the requested features were silently dropped. Each one below is either a "Won't (initial release)" item from the registry or a natural extension of the product.

| ID | Enhancement | Origin | Why deferred | Preconditions |
|---|---|---|---|---|
| FE-001 | Wearable integrations (Health Connect, HealthKit, Fitbit) | F-INTG-004 (W) | Needs native code, health-data consent, and per-platform review | A native companion app with clear value; a privacy review |
| FE-002 | Subscription and premium plans | F-ADMIN-017 (W) | No monetisation in v1 | Payment provider, tax/VAT handling, entitlement service |
| FE-003 | iOS home-screen widget | Not requested | Needs a native iOS app and an App Store presence | Demand data from v1 |
| FE-004 | Additional languages (Urdu, Arabic UI, Hindi) | Extension | The i18n infrastructure already supports more locales; RTL needs a layout audit | Translators; RTL QA |
| FE-005 | Child accounts without email, managed by a parent | Extension of COMM | Legal (COPPA/GDPR-K) and safety complexity | Legal review |
| FE-006 | Campaign donations | Extension of COMM-007 | Payments and charity regulation | Payment partner, compliance |
| FE-007 | Mosque / organisation pages | Extension | Verification of organisations | Org verification process |
| FE-008 | Real-time group chat | Extension | Moderation load | Mature moderation tooling, ML-assisted filters |
| FE-009 | On-device or self-hosted AI model for privacy-sensitive features | AI extension | Cost and quality trade-offs | Model evaluation |
| FE-010 | Audio Quran recitation player and memorisation audio loops | ISL extension | Licensing of recitations; bandwidth | Licensed audio source |
| FE-011 | Wear OS tile | WIDGET extension | Separate surface | Widget adoption data |
| FE-012 | Outlook / Apple Calendar sync | F-INTG-003 extension | Google first | Demand |
| FE-013 | Automated (ML) content moderation | COMM extension | Accuracy for BN; false positives | A labelled BN dataset |
| FE-014 | Automated digital-wellbeing data via Android widget-host permissions (UsageStats) | WELL extension | Sensitive permission; Play policy | A justified user benefit and policy compliance |
| FE-015 | End-to-end encrypted journal (client-held keys) | JRNL extension | Breaks server-side search and AI summaries; key-recovery UX | Opt-in "vault" mode design |
| FE-016 | Organisation (B2B) workspaces for schools and NGOs | Extension | Multi-tenant admin | Demand from pilots |
