# Product Vision — Daily Good Deeds

> **"Small Good Deeds, Every Day. A Better You, Every Day."**
> বাংলা: **"প্রতিদিন ছোট ছোট ভালো কাজ, প্রতিদিন একটু ভালো আপনি।"** *(working translation; final copy pending native-reviewer sign-off)*

## 1. Vision statement
Daily Good Deeds helps people build steady habits of goodness. It covers personal growth, family, faith, and community, in English and Bengali, on any device. It treats people gently: progress is encouraged and never judged.

## 2. Core philosophy
| Pillar | What it means in the product |
|---|---|
| **Goodness** | A curated, bilingual library of practical good deeds. Users can add their own deeds, set them to repeat, and get suggestions. |
| **Personal Growth** | Goals, journals, reflection, life balance, and gentle analytics that show patterns. They never rate a person. |
| **Social Impact** | Families, community campaigns, volunteering, and kindness stories. Sharing always requires explicit consent. |

## 3. Problem
- Many good intentions never become habits. Existing habit trackers feel clinical, focus only on productivity, or are available in English only.
- Bengali-speaking users rarely find well-typeset, culturally relevant tools for growth and faith.
- Muslim users juggle separate apps for salah, Quran, dhikr, and fasting. Many of those apps include unsourced content or public "worship leaderboards".
- Community "kindness" apps often expose private behaviour or reward performative sharing.

## 4. Target users
- Adults and teenagers (13+, subject to local consent law) who want to build positive habits.
- Bengali speakers in Bangladesh, India (West Bengal and Assam), and the diaspora.
- Muslims who want an integrated Islamic lifestyle tracker. The Islamic module is optional, so non-Muslim users get a full non-religious experience.
- Families who want shared, age-appropriate challenges.
- Community organisers, volunteer coordinators, and campaign runners.
- Platform administrators, moderators, and content editors.

See [USER_PERSONAS.md](USER_PERSONAS.md).

## 5. Value proposition
1. **One calm daily home:** a single checklist that combines good deeds, planner items, and (optionally) worship.
2. **Truly bilingual:** EN and BN everywhere, including notifications, emails, the widget, and admin-managed content.
3. **Private by default:** journals and worship records are never shared automatically.
4. **Works where users are:** low-end Android phones, in-app browsers (with honest fallbacks), offline, and on the home-screen widget.
5. **Helpful, optional AI:** suggestions and reflections when the user opts in, with clear cost and privacy limits and no religious rulings.

## 6. Product principles
1. **Encourage, never shame.** Copy, notifications, and analytics use positive framing. A missed day is "a fresh start", never "failure".
2. **No measure of human worth.** Scores describe habits. They never describe a person.
3. **No public worship rankings.** Worship metrics are personal.
4. **Sourced religious content.** Every Dua, Hadith, and Quran translation shows its reference. AI never issues rulings.
5. **Respect attention.** The app has quiet hours, no manipulative streak pressure, and no dark patterns.
6. **Accessible and fast.** WCAG 2.2 AA, a performance budget aimed at mid-range Android on 3G/4G, and Bengali typography done properly.
7. **Honest capabilities.** If a browser cannot do something, the app says so and offers an alternative.

## 7. Success metrics (privacy-conscious, aggregate only)
| Metric | Target (12 months after launch) |
|---|---|
| D30 retention of activated users | ≥ 25% |
| Weekly active users who complete ≥ 3 deeds per week | ≥ 40% of WAU |
| Share of sessions in BN | Tracked; target parity with the BN user base |
| Crash-free sessions (web + widget) | ≥ 99.5% |
| Accessibility (axe critical violations in CI) | 0 |
| Moderation SLA (reports triaged) | 90% within 24 h |
| AI cost per active AI user per month | Under the configured budget cap |

Analytics are aggregate and consented ([F-RPT-008](FEATURE_CATALOG.md#f-rpt-008)). Journal content and worship details never feed product analytics.

## 8. Non-goals
- A native mobile application. The web app is the product; the Android project hosts the widget only.
- A social network built for engagement metrics.
- A fatwa or religious-ruling service.
- Monitoring a device or its screen time.
- Monetisation in the initial release (subscription management is Won't Have, F-ADMIN-017).
