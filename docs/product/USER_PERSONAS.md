# User Personas

Personas are illustrative composites used to make design decisions. They are not based on real people.

## Role summary
| Role | Description | Key permissions |
|---|---|---|
| Guest | Not signed in | View landing, public campaigns, public kindness stories, and a sample of the deed library; sign up / sign in |
| User | Signed-in member | All personal features; join groups, campaigns, and challenges; post and report |
| Admin | Staff (content editors, moderators) with scoped permissions | Content, moderation, campaigns, notifications, user support (no role escalation) |
| Super Admin | Platform owner | Everything, including role and permission management, feature flags, system settings |

Admin capabilities depend on **permissions**, not only on the role name. For example, a "Moderator" admin has `moderation.act` but not `content.deeds.manage` (see F-RBAC-002).

---

## P1 — Nusrat (Bengali-first student)
- **Age / place:** 21, university student, Rajshahi, Bangladesh.
- **Device:** mid-range Android (3 GB RAM), mobile data, often opens links from Facebook Messenger.
- **Language:** Bengali (reads English slowly); prefers Bengali digits.
- **Goals:** pray on time, read some Quran daily, be kinder to her younger siblings, reduce time on social media.
- **Frustrations:** apps in English only; apps that use a lot of data; links opened in Messenger that "don't work properly".
- **Needs:** full BN UI, fast load, PWA install guidance from the in-app browser, a home-screen widget, offline tasbih.
- **Key features:** F-I18N-*, F-PWA-007, F-ISL-001/003/007, F-WIDGET-002, F-WELL-002.

## P2 — Rafiq (busy professional, Islamic lifestyle)
- **Age / place:** 34, software engineer, Dhaka; travels to Singapore.
- **Device:** Android flagship plus a work laptop.
- **Language:** switches between EN and BN.
- **Goals:** consistent salah and tahajjud, plan for Ramadan, calculate zakat correctly, weekly reflection.
- **Frustrations:** prayer times that are wrong after travel; streaks that break because of time-zone changes.
- **Needs:** time-zone-aware days, a selectable calculation method, the Islamic widget, an AI weekly summary (opt-in).
- **Key features:** F-CAL-010, F-ISL-002/010/012/014, F-WIDGET-005, F-AI-007.

## P3 — Emma (non-Muslim kindness enthusiast)
- **Age / place:** 29, nurse, Manchester, UK.
- **Language:** English.
- **Goals:** do one kind act a day, keep a gratitude journal, join local volunteer drives.
- **Frustrations:** feels unwelcome in apps that assume a religious identity.
- **Needs:** the Islamic module disabled entirely (no Islamic navigation, widgets, or notifications); a neutral deed library; volunteer listings.
- **Key features:** F-ISL-017 (opt-out), F-DEED-012, F-JRNL-004, F-COMM-008.

## P4 — Ayesha (family organiser)
- **Age / place:** 42, teacher and mother of three (ages 9, 14, 17), Sylhet / London diaspora.
- **Language:** BN at home, EN at work.
- **Goals:** run family challenges (for example "30 days of helping at home"), share a family calendar, celebrate together.
- **Frustrations:** worried that the children's private reflections could be visible to others; no wish for competition between siblings.
- **Needs:** family groups with invitations, privacy controls, family achievements that celebrate together without rankings.
- **Key features:** F-COMM-001/002/003/004/005/014.

## P5 — Tanvir (volunteer coordinator)
- **Age / place:** 38, NGO programme officer, Khulna.
- **Goals:** publish winter-clothes drives and tree-planting campaigns, let people join by QR code at events, report participation.
- **Needs:** campaign creation (through an admin or a delegated permission), QR participation, volunteer opportunities, bilingual campaign content.
- **Key features:** F-COMM-007/008, F-INTG-006, F-ADMIN-006.

## P6 — Farhana (Admin: content editor and moderator)
- **Age:** 31, platform staff.
- **Goals:** keep the deed library and the Dua/Hadith content accurate in both languages; triage reports quickly.
- **Needs:** content versioning, a translation side-by-side editor, a source verification workflow, a moderation queue with clear actions, audit trails.
- **Key features:** F-ADMIN-003/004/005/008/011, F-COMM-012.

## P7 — Karim (Super Admin: platform owner)
- **Age:** 45, founder.
- **Goals:** a safe, reliable platform; control over AI cost; fast incident response.
- **Needs:** role and permission management, feature flags, system health, job and backup monitoring, AI usage and cost dashboards, audit log search, admin TOTP.
- **Key features:** F-RBAC-*, F-ADMIN-002/009/012/014/015/016, F-AI-003.

## P8 — Sami (teen family member)
- **Age:** 14, student, part of Ayesha's family group.
- **Goals:** fun challenges, a growing "Good Deeds Tree", privacy from siblings.
- **Needs:** simple UI, positive feedback, private journal, no public posting by default.
- **Key features:** F-GAME-004/008, F-JRNL-007, F-COMM-014.

## Persona → module emphasis
| Module | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 |
|---|---|---|---|---|---|---|---|---|
| DEED/CAL | ●● | ● | ●●● | ● | | | | ●● |
| ISL | ●●● | ●●● | — | ● | | ●● (content) | | ● |
| JRNL/GROW | ● | ●● | ●● | | | | | ● |
| COMM | | | ●● | ●●● | ●●● | ●●● (mod) | | ●● |
| AI | | ●● | ● | | | | ●● (cost) | |
| WIDGET/PWA | ●●● | ●● | ● | | ● | | | ● |
| ADMIN | | | | | ● | ●●● | ●●● | |
