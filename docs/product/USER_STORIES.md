# User Stories

Format: **As a** <role/persona>, **I want** <capability>, **so that** <benefit>.

IDs follow `US-{MOD}-{nnn}-{nn}`, where `nnn` is the parent feature number from [FEATURE_ID_REGISTRY.md](FEATURE_ID_REGISTRY.md). Every feature (Must, Should, Could, and Won't) has at least one story. Detailed acceptance criteria are in [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md) (`AC-…`), and the matching SRS requirements are `FR-…` in [SRS.md](../specifications/SRS.md).

Story points use relative Fibonacci estimates (1, 2, 3, 5, 8, 13) and will be re-estimated at phase kickoff.

## A. AUTH
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-AUTH-001-01 | F-AUTH-001 | As a **guest**, I want to create an account with my email and password, so that my good deeds are saved across devices. | M | 5 |
| US-AUTH-001-02 | F-AUTH-001 | As a **Bengali-speaking guest** (Nusrat), I want the sign-up form and its errors in Bengali, so that I understand every step. | M | 2 |
| US-AUTH-002-01 | F-AUTH-002 | As a **user**, I want to log in with my email and password, so that I can reach my data on any device. | M | 3 |
| US-AUTH-002-02 | F-AUTH-002 | As a **user**, I want repeated failed logins to be slowed down, so that nobody can guess my password. | M | 3 |
| US-AUTH-003-01 | F-AUTH-003 | As a **guest**, I want to sign in with Google, so that I don't need to remember another password. | S | 5 |
| US-AUTH-003-02 | F-AUTH-003 | As a **user inside the Messenger in-app browser**, I want to be told to open my real browser for Google sign-in, so that I'm not stuck on a broken login. | S | 2 |
| US-AUTH-004-01 | F-AUTH-004 | As a **new user**, I want to verify my email with a link, so that I can recover my account and receive notifications. | M | 3 |
| US-AUTH-005-01 | F-AUTH-005 | As a **user who forgot my password**, I want a reset link by email, so that I can regain access myself. | M | 3 |
| US-AUTH-006-01 | F-AUTH-006 | As a **user on a shared computer**, I want to log out and have my private data removed from the device, so that others can't see it. | M | 2 |
| US-AUTH-006-02 | F-AUTH-006 | As a **user who lost a phone**, I want to log out of all devices, so that my account is secure. | M | 2 |
| US-AUTH-007-01 | F-AUTH-007 | As a **user**, I want to see my active sessions and revoke any of them, so that I control where I'm signed in. | M | 5 |
| US-AUTH-008-01 | F-AUTH-008 | As a **user**, I want to edit my name, avatar, email, and password, so that my profile stays accurate. | M | 3 |
| US-AUTH-009-01 | F-AUTH-009 | As a **user**, I want to delete my account, with a grace period and the option to export my data first, so that I can leave without losing my history by accident. | M | 8 |
| US-AUTH-010-01 | F-AUTH-010 | As a **user**, I want to set my language, time zone, theme, week start, and numeral style, so that the app fits my life. | M | 3 |
| US-AUTH-011-01 | F-AUTH-011 | As a **user**, I want recovery codes, so that I can get back in even if I lose access to my email. | C | 3 |

## B. RBAC
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-RBAC-001-01 | F-RBAC-001 | As a **super admin** (Karim), I want distinct Guest, User, Admin, and Super Admin roles, so that capabilities are clearly separated. | M | 3 |
| US-RBAC-002-01 | F-RBAC-002 | As a **super admin**, I want every API action checked against permissions on the server, so that hiding a button is never the only protection. | M | 8 |
| US-RBAC-002-02 | F-RBAC-002 | As a **user**, I want my data to be invisible to other users, so that my privacy is protected. | M | 5 |
| US-RBAC-003-01 | F-RBAC-003 | As a **super admin**, I want to assign and revoke roles with a reason, so that staff changes are controlled and recorded. | M | 3 |
| US-RBAC-004-01 | F-RBAC-004 | As a **super admin**, I want to create admin accounts (CLI in P2, email invitations in P10) and require 2FA before they can act, so that staff onboarding is secure. | M | 5 |
| US-RBAC-005-01 | F-RBAC-005 | As a **super admin**, I want every privileged action audit-logged, so that I can investigate incidents. | M | 5 |
| US-RBAC-006-01 | F-RBAC-006 | As a **super admin**, I want destructive admin actions to require re-authentication, so that a hijacked session can't do serious damage. | M | 3 |
| US-RBAC-007-01 | F-RBAC-007 | As an **admin** (Farhana), I want to protect my account with an authenticator app, so that my staff account can't be taken over. | S | 5 |

## C. I18N
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-I18N-001-01 | F-I18N-001 | As a **developer**, I want all UI strings to live in EN and BN catalogs with CI checks, so that no screen ships untranslated. | M | 8 |
| US-I18N-002-01 | F-I18N-002 | As a **user**, I want to switch between English and বাংলা from any screen, so that I can read in my preferred language. | M | 2 |
| US-I18N-003-01 | F-I18N-003 | As a **user**, I want my language choice remembered on every device, so that I don't have to set it again. | M | 2 |
| US-I18N-004-01 | F-I18N-004 | As **Nusrat**, I want dates and numbers in Bengali digits and month names, so that the app feels native to me. | M | 3 |
| US-I18N-005-01 | F-I18N-005 | As a **Bengali reader**, I want proper Bengali fonts and line spacing, so that conjunct letters render cleanly and text is easy to read. | M | 3 |
| US-I18N-006-01 | F-I18N-006 | As a **user**, I want reminders and emails in my language, so that I understand them at a glance. | M | 3 |
| US-I18N-007-01 | F-I18N-007 | As a **user**, I want validation errors in my language, so that I can fix mistakes quickly. | M | 2 |
| US-I18N-008-01 | F-I18N-008 | As an **admin**, I want to enter EN and BN versions of library content, so that both audiences get quality content. | M | 5 |
| US-I18N-009-01 | F-I18N-009 | As a **BN user**, I want to see English when a translation is missing instead of a broken key, so that the app never looks broken. | M | 2 |

## D. DEED
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-DEED-001-01 | F-DEED-001 | As a **user**, I want a library of ready-made good deeds, so that I always have ideas. | M | 5 |
| US-DEED-002-01 | F-DEED-002 | As a **user**, I want deeds grouped into categories, so that I can find deeds for family, health, environment, and more. | M | 3 |
| US-DEED-003-01 | F-DEED-003 | As **Emma**, I want to create my own deeds, so that I can track kindness that is personal to me. | M | 3 |
| US-DEED-004-01 | F-DEED-004 | As a **user**, I want one daily checklist where I can tick off deeds with one tap, so that tracking takes seconds. | M | 8 |
| US-DEED-004-02 | F-DEED-004 | As a **user**, I want to add a one-off deed just for today, so that spontaneous kindness counts too. | M | 2 |
| US-DEED-005-01 | F-DEED-005 | As a **user**, I want deeds to repeat on chosen days (daily, weekdays, 3× per week, monthly), so that they become habits. | M | 8 |
| US-DEED-005-02 | F-DEED-005 | As a **user**, I want to pause a recurring deed while travelling, so that it doesn't clutter my checklist. | M | 2 |
| US-DEED-006-01 | F-DEED-006 | As a **user**, I want to favorite deeds, so that I can add them quickly. | S | 2 |
| US-DEED-007-01 | F-DEED-007 | As a **user**, I want to browse my past activity with filters, so that I can see what I've done. | M | 3 |
| US-DEED-008-01 | F-DEED-008 | As a **user**, I want to add a private note to a completion, so that I remember the moment. | S | 2 |
| US-DEED-009-01 | F-DEED-009 | As **Rafiq**, I want to mark a deed skipped with a reason (rest, excused, not applicable), so that honest tracking doesn't unfairly break my streak. | M | 3 |
| US-DEED-010-01 | F-DEED-010 | As a **user**, I want to attach a photo to a completion privately, so that I keep a memory such as a tree I planted. | C | 5 |
| US-DEED-011-01 | F-DEED-011 | As a **user**, I want to search and filter the library in EN or BN, so that I can find relevant deeds. | S | 3 |
| US-DEED-012-01 | F-DEED-012 | As a **user**, I want a "Surprise me" button, so that doing good feels fresh. | S | 2 |
| US-DEED-013-01 | F-DEED-013 | As a **busy user**, I want a list of five-minute deeds, so that I can do good even on hectic days. | S | 1 |
| US-DEED-014-01 | F-DEED-014 | As a **user**, I want suggestions from areas I've neglected, with a short explanation, so that my growth is balanced. | S | 5 |

## E. CAL
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-CAL-001-01 | F-CAL-001 | As a **user**, I want to open any day and see what I did, so that I can review or correct it. | M | 3 |
| US-CAL-002-01 | F-CAL-002 | As a **user**, I want a weekly view starting on my chosen week-start day, so that I see my weekly rhythm. | M | 3 |
| US-CAL-003-01 | F-CAL-003 | As a **user**, I want a monthly calendar shaded by completion, with optional Hijri dates, so that I see the month at a glance. | M | 5 |
| US-CAL-004-01 | F-CAL-004 | As a **long-time user**, I want yearly history, so that I can appreciate how far I've come. | S | 3 |
| US-CAL-005-01 | F-CAL-005 | As a **user**, I want an activity heatmap with an accessible alternative, so that I can see my consistency visually. | S | 3 |
| US-CAL-006-01 | F-CAL-006 | As a **user**, I want my daily completion rate shown as a ring, so that I know where I stand today. | M | 2 |
| US-CAL-007-01 | F-CAL-007 | As a **user**, I want streaks per deed and overall that respect rest days, so that consistency is rewarded fairly. | M | 8 |
| US-CAL-008-01 | F-CAL-008 | As a **user**, I want to see my longest streak, so that I have a personal best to aim for. | M | 2 |
| US-CAL-009-01 | F-CAL-009 | As a **user**, I want a celebration at streak milestones (7, 21, 40 days), so that I feel encouraged. | S | 3 |
| US-CAL-010-01 | F-CAL-010 | As **Rafiq**, travelling between Dhaka and Singapore, I want "today" to follow my local time zone without breaking past history, so that my records stay correct. | M | 8 |
| US-CAL-011-01 | F-CAL-011 | As a **user who forgot to log yesterday**, I want to backfill recent days within a window, so that my record is accurate. | S | 3 |

## F. GROW
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-GROW-001-01 | F-GROW-001 | As a **user**, I want goals linked to my recurring deeds that update automatically, so that daily actions add up to outcomes. | M | 8 |
| US-GROW-002-01 | F-GROW-002 | As a **user**, I want weekly and monthly goals, so that I have short horizons to aim for. | S | 3 |
| US-GROW-003-01 | F-GROW-003 | As a **user**, I want milestones inside a goal, so that big goals feel achievable. | S | 3 |
| US-GROW-004-01 | F-GROW-004 | As a **user**, I want a timeline of my achievements, so that I can see my growth story. | S | 5 |
| US-GROW-005-01 | F-GROW-005 | As a **user**, I want consistency percentages over 7/30/90 days, so that I understand my patterns. | S | 5 |
| US-GROW-006-01 | F-GROW-006 | As a **user**, I want gentle hints about habits that need a smaller step, so that I can adjust instead of giving up. | S | 3 |
| US-GROW-007-01 | F-GROW-007 | As a **user who has disabled AI**, I want rule-based weekly insights, so that I still get useful feedback. | S | 5 |
| US-GROW-008-01 | F-GROW-008 | As a **user**, I want a guided monthly reflection with my stats, so that I end each month thoughtfully. | S | 3 |
| US-GROW-009-01 | F-GROW-009 | As a **user**, I want a life-balance radar across 8 areas, so that I notice areas I've neglected. | S | 5 |

## G. JRNL
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-JRNL-001-01 | F-JRNL-001 | As a **user**, I want a daily journal with mood and tags that autosaves, so that I never lose my thoughts. | M | 5 |
| US-JRNL-002-01 | F-JRNL-002 | As a **user**, I want to set a morning intention shown on my dashboard, so that I start the day with purpose. | S | 2 |
| US-JRNL-003-01 | F-JRNL-003 | As a **user**, I want guided evening reflection questions, so that I learn from each day. | S | 3 |
| US-JRNL-004-01 | F-JRNL-004 | As **Emma**, I want to list 1–3 things I'm grateful for each day, so that I build a gratitude habit. | S | 2 |
| US-JRNL-005-01 | F-JRNL-005 | As a **user**, I want to write a sealed letter to my future self, delivered on a date I choose, so that I can reflect on my growth later. | C | 5 |
| US-JRNL-006-01 | F-JRNL-006 | As a **user**, I want learning notes with sources, so that I keep what I learn from books and lectures. | C | 2 |
| US-JRNL-007-01 | F-JRNL-007 | As **Sami** (teen), I want my journal encrypted and invisible to everyone, including family and admins, so that I can write honestly. | M | 8 |
| US-JRNL-008-01 | F-JRNL-008 | As a **user**, I want to search and filter my journal, so that I can find past entries. | S | 5 |
| US-JRNL-009-01 | F-JRNL-009 | As a **user**, I want to export my journal as Markdown or JSON, so that I own my writing. | S | 3 |
| US-JRNL-010-01 | F-JRNL-010 | As a **user who opted in**, I want an AI summary of my month's journal, after previewing what is sent, so that I can see themes without rereading everything. | C | 5 |

## H. PLAN
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-PLAN-001-01 | F-PLAN-001 | As a **user**, I want a daily planner next to my checklist, so that tasks and deeds live in one place. | S | 5 |
| US-PLAN-002-01 | F-PLAN-002 | As a **user**, I want a 60-second morning planning flow, so that I start the day focused. | S | 3 |
| US-PLAN-003-01 | F-PLAN-003 | As a **user**, I want an evening review that moves unfinished tasks to tomorrow, so that nothing is forgotten. | S | 3 |
| US-PLAN-004-01 | F-PLAN-004 | As a **user**, I want to mark my top 3 tasks and reorder them by keyboard or drag, so that I focus on what matters. | S | 3 |
| US-PLAN-005-01 | F-PLAN-005 | As a **user**, I want time blocks with overlap warnings, so that I can plan my day realistically. | S | 3 |
| US-PLAN-006-01 | F-PLAN-006 | As a **user**, I want recurring planner tasks, so that routines are planned automatically. | S | 2 |
| US-PLAN-007-01 | F-PLAN-007 | As a **user**, I want a weekly planning board, so that I can spread tasks across the week. | C | 5 |
| US-PLAN-008-01 | F-PLAN-008 | As a **user**, I want planner time blocks in Google Calendar, so that I see them alongside work meetings. | C | 3 |

## I. ISL
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-ISL-001-01 | F-ISL-001 | As **Nusrat**, I want to log each of the five daily prayers (on time, late, qada, excused) quickly, so that I can track my salah privately. | M | 5 |
| US-ISL-001-02 | F-ISL-001 | As a **user on her period**, I want an "excused" status that is never counted as missed, so that tracking is respectful. | M | 2 |
| US-ISL-002-01 | F-ISL-002 | As **Rafiq**, I want prayer times calculated for my location with my chosen method and madhab, so that they match my local mosque. | M | 8 |
| US-ISL-003-01 | F-ISL-003 | As a **user**, I want to log Quran reading by surah, ayah, page, or juz and resume where I stopped, so that I read consistently. | M | 8 |
| US-ISL-004-01 | F-ISL-004 | As a **user memorizing Quran**, I want revision reminders scheduled by spaced repetition, so that I retain what I've memorized. | S | 5 |
| US-ISL-005-01 | F-ISL-005 | As a **user**, I want a khatam plan that rebalances daily pages when I fall behind, so that I can finish by my target date. | S | 5 |
| US-ISL-006-01 | F-ISL-006 | As a **user**, I want morning and evening adhkar with sources, so that I can recite them correctly. | S | 3 |
| US-ISL-007-01 | F-ISL-007 | As a **user**, I want an offline tasbih counter with haptic feedback, so that I can count dhikr anywhere. | S | 3 |
| US-ISL-008-01 | F-ISL-008 | As a **user**, I want a dua collection with Arabic, transliteration, EN/BN meanings, and references, so that I trust what I read. | S | 5 |
| US-ISL-009-01 | F-ISL-009 | As a **user**, I want to choose sunnah practices to track, so that I can revive them gradually. | S | 3 |
| US-ISL-010-01 | F-ISL-010 | As **Rafiq**, I want tahajjud logged against the correct night, with an optional last-third reminder, so that my record is accurate. | S | 3 |
| US-ISL-011-01 | F-ISL-011 | As a **user**, I want to track Ramadan, voluntary, and qada fasts with a balance of fasts owed, so that I know what I still need to make up. | S | 5 |
| US-ISL-012-01 | F-ISL-012 | As a **user**, I want a Ramadan dashboard with suhoor/iftar times, a khatam plan, and goals for the last ten nights, so that I make the most of Ramadan. | S | 8 |
| US-ISL-013-01 | F-ISL-013 | As a **user**, I want Hijri dates next to Gregorian dates with a local adjustment, so that dates match my country's moon sighting. | M | 3 |
| US-ISL-014-01 | F-ISL-014 | As a **user**, I want a zakat calculator with a nisab basis I choose, so that I can estimate my zakat. | S | 5 |
| US-ISL-015-01 | F-ISL-015 | As a **learner**, I want short, verified Islamic lessons in my language, so that I can learn reliably. | C | 5 |
| US-ISL-016-01 | F-ISL-016 | As a **user**, I want a sourced, graded Hadith of the Day, so that I learn something authentic daily. | S | 3 |
| US-ISL-017-01 | F-ISL-017 | As **Emma** (non-Muslim), I want to turn off the Islamic module completely, so that the app fits my life without religious content. | M | 5 |
| US-ISL-018-01 | F-ISL-018 | As an **Islamic content reviewer**, I want every item to cite a source and to require verification by a second person before publishing, so that content is reliable. | M | 5 |

## N. NOTIF
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-NOTIF-001-01 | F-NOTIF-001 | As a **user**, I want an in-app notification center, so that I see updates even without push. | M | 5 |
| US-NOTIF-002-01 | F-NOTIF-002 | As a **user**, I want a daily reminder at my chosen local time, so that I don't forget my deeds. | M | 5 |
| US-NOTIF-003-01 | F-NOTIF-003 | As a **user**, I want reminders for specific deeds or tasks, so that time-specific habits get done. | S | 3 |
| US-NOTIF-004-01 | F-NOTIF-004 | As a **user**, I want a gentle evening nudge only when items remain, so that I'm encouraged, never nagged. | S | 2 |
| US-NOTIF-005-01 | F-NOTIF-005 | As a **user**, I want weekly digest emails with one-click unsubscribe, so that I stay informed on my terms. | M | 3 |
| US-NOTIF-006-01 | F-NOTIF-006 | As a **user who installed the PWA**, I want push notifications, so that reminders reach me like an app's. | S | 5 |
| US-NOTIF-007-01 | F-NOTIF-007 | As a **challenge participant**, I want limited notifications about challenge milestones, so that I stay engaged without spam. | C | 2 |
| US-NOTIF-008-01 | F-NOTIF-008 | As a **user**, I want quiet hours, so that notifications don't disturb my sleep or family time. | S | 3 |
| US-NOTIF-009-01 | F-NOTIF-009 | As a **user**, I want to choose which notifications I get on which channel, so that I control my attention. | M | 3 |
| US-NOTIF-010-01 | F-NOTIF-010 | As **Nusrat**, I want a reminder before each prayer, so that I pray on time. | S | 5 |

## J. COMM
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-COMM-001-01 | F-COMM-001 | As **Ayesha**, I want to create a family group, so that we can grow in goodness together. | S | 5 |
| US-COMM-002-01 | F-COMM-002 | As **Ayesha**, I want to invite family members by link, code, or email, with expiry, so that only my family joins. | S | 5 |
| US-COMM-003-01 | F-COMM-003 | As **Ayesha**, I want a family challenge with collective progress and no sibling ranking, so that we cooperate instead of competing. | S | 8 |
| US-COMM-004-01 | F-COMM-004 | As a **family member**, I want a shared family calendar, so that we plan family events and challenge days together. | C | 5 |
| US-COMM-005-01 | F-COMM-005 | As a **family**, we want collective badges, so that we celebrate together. | C | 3 |
| US-COMM-006-01 | F-COMM-006 | As a **user**, I want to join interest-based community groups, so that I connect with like-minded people. | C | 8 |
| US-COMM-007-01 | F-COMM-007 | As **Tanvir**, I want to publish a bilingual campaign that people can join, so that we mobilize volunteers. | S | 5 |
| US-COMM-008-01 | F-COMM-008 | As **Emma**, I want to find local volunteer opportunities and register interest, so that I can help in person. | C | 5 |
| US-COMM-009-01 | F-COMM-009 | As a **user**, I want to share a kindness story with chosen visibility, so that I inspire others without oversharing. | S | 5 |
| US-COMM-010-01 | F-COMM-010 | As a **user**, I want to post anonymously, so that I can share without seeking praise. | S | 3 |
| US-COMM-011-01 | F-COMM-011 | As a **user**, I want to appreciate others' stories without rankings, so that recognition stays sincere. | C | 2 |
| US-COMM-012-01 | F-COMM-012 | As **Farhana** (moderator), I want a moderation queue with clear actions and reason codes, so that I keep the community safe and fair. | M | 8 |
| US-COMM-013-01 | F-COMM-013 | As a **user**, I want to report harmful content and block people, so that I feel safe. | M | 5 |
| US-COMM-014-01 | F-COMM-014 | As **Sami**, I want everything private by default and shared only when I choose, so that my family sees only what I decide. | M | 5 |

## M. WELL
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-WELL-001-01 | F-WELL-001 | As **Nusrat**, I want to note my estimated screen time and reflect on it, so that I become more aware of my habits. | C | 2 |
| US-WELL-002-01 | F-WELL-002 | As a **user**, I want a social-media time goal with manual check-ins, so that I can cut down intentionally. | C | 2 |
| US-WELL-003-01 | F-WELL-003 | As a **user**, I want to count days since I last did a habit I'm avoiding, with supportive messages after a slip, so that I keep trying. | S | 3 |
| US-WELL-004-01 | F-WELL-004 | As a **user**, I want to see which tasks I postpone most, so that I can address procrastination. | C | 2 |
| US-WELL-005-01 | F-WELL-005 | As a **user**, I want a guided reflection after anger, so that I can respond better next time. | C | 2 |
| US-WELL-006-01 | F-WELL-006 | As a **user**, I want digital-detox challenges, so that I can build healthier device habits. | C | 3 |
| US-WELL-007-01 | F-WELL-007 | As a **user**, I want a daily positive affirmation in my language, so that I start the day well. | S | 2 |

## L. GAME
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-GAME-001-01 | F-GAME-001 | As a **user**, I want to earn badges for meaningful milestones, so that progress feels rewarding. | S | 5 |
| US-GAME-002-01 | F-GAME-002 | As a **user**, I want to celebrate totals such as 100 deeds, so that I recognise my cumulative impact. | S | 2 |
| US-GAME-003-01 | F-GAME-003 | As a **user who finds streaks stressful**, I want to hide streaks everywhere, so that the app stays calm for me. | M | 2 |
| US-GAME-004-01 | F-GAME-004 | As **Sami**, I want a Good Deeds Tree that grows and never dies, so that I feel my deeds blossom. | S | 8 |
| US-GAME-005-01 | F-GAME-005 | As a **user**, I want an optional weekly mini-challenge, so that I try new kinds of deeds. | C | 3 |
| US-GAME-006-01 | F-GAME-006 | As a **user**, I want an occasional surprise deed suggestion, so that I get a small delight. | C | 2 |
| US-GAME-007-01 | F-GAME-007 | As a **user**, I want to see privately how many appreciations my stories received, so that I know they helped. | C | 2 |
| US-GAME-008-01 | F-GAME-008 | As a **user**, I want all messages to be encouraging and never shaming, so that the app supports me. | S | 3 |

## K. AI
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-AI-001-01 | F-AI-001 | As a **super admin**, I want AI behind a provider abstraction with graceful fallback, so that we can switch models and survive outages. | M | 8 |
| US-AI-002-01 | F-AI-002 | As a **user**, I want to understand what data AI uses and to opt in or out at any time, so that I stay in control. | M | 5 |
| US-AI-003-01 | F-AI-003 | As **Karim**, I want per-user quotas and a global budget cap with alerts, so that AI costs never surprise us. | M | 5 |
| US-AI-004-01 | F-AI-004 | As a **user**, I want personalised good-deed suggestions that I can add in one tap, so that I find ideas that fit me. | S | 5 |
| US-AI-005-01 | F-AI-005 | As a **user**, I want a conversational habit coach, so that I get help building habits. | C | 8 |
| US-AI-006-01 | F-AI-006 | As a **user**, I want personalised evening reflection questions, so that reflection feels relevant. | S | 3 |
| US-AI-007-01 | F-AI-007 | As **Rafiq**, I want a short narrative of my week in my language, so that I understand my progress quickly. | S | 5 |
| US-AI-008-01 | F-AI-008 | As a **user**, I want to describe my plans in plain words and get draft tasks to approve, so that planning is faster. | C | 5 |
| US-AI-009-01 | F-AI-009 | As a **user**, I want insights explained in natural language with the data behind them, so that I trust them. | S | 3 |
| US-AI-010-01 | F-AI-010 | As a **user**, I want an assistant that can log deeds or create plans after I confirm, so that I can manage things by chatting. | C | 13 |
| US-AI-011-01 | F-AI-011 | As a **user**, I want to dictate my journal and edit the transcript, so that journaling is easier. | C | 8 |
| US-AI-012-01 | F-AI-012 | As a **user**, I want fresh motivational messages, so that encouragement doesn't feel repetitive. | S | 3 |
| US-AI-013-01 | F-AI-013 | As a **Muslim user**, I want the AI never to issue religious rulings and to point me to scholars instead, so that I'm not misled. | M | 8 |

## P. PWA
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-PWA-001-01 | F-PWA-001 | As a **mobile user**, I want to install the app to my home screen, so that it opens like a native app. | M | 3 |
| US-PWA-002-01 | F-PWA-002 | As a **user on any device**, I want navigation that fits my screen, so that the app is easy to use. | M | 5 |
| US-PWA-003-01 | F-PWA-003 | As a **user on a weak connection**, I want the app shell to load from cache, so that the app opens instantly. | M | 3 |
| US-PWA-004-01 | F-PWA-004 | As **Nusrat**, I want to see today's checklist and recent history offline, so that bad connectivity doesn't stop me. | S | 5 |
| US-PWA-005-01 | F-PWA-005 | As a **user offline**, I want to complete deeds and log salah, then have them sync later, so that nothing is lost. | M | 8 |
| US-PWA-006-01 | F-PWA-006 | As a **multi-device user**, I want offline edits from different devices to merge predictably, so that my data stays correct. | M | 13 |
| US-PWA-007-01 | F-PWA-007 | As a **user opening a link in Facebook**, I want a clear prompt to open my real browser, so that features like install and Google sign-in work. | M | 3 |
| US-PWA-008-01 | F-PWA-008 | As a **user on an older browser**, I want the app to work without unsupported features, so that I'm not blocked. | M | 3 |
| US-PWA-009-01 | F-PWA-009 | As a **user**, I want to be told when a new version is ready, so that I can update without losing pending changes. | S | 2 |

## O. WIDGET
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-WIDGET-001-01 | F-WIDGET-001 | As an **Android user**, I want to link the widget app by pointing my phone camera at a QR code on the web app (or typing a short code), so that setup takes seconds and doesn't need my password. | M | 8 |
| US-WIDGET-002-01 | F-WIDGET-002 | As **Nusrat**, I want a small widget with today's progress, so that I see my progress without opening the app. | M | 5 |
| US-WIDGET-003-01 | F-WIDGET-003 | As a **user**, I want to tick deeds directly from a widget, even offline, so that logging is instant. | S | 8 |
| US-WIDGET-004-01 | F-WIDGET-004 | As a **user**, I want a large widget with my full checklist and intention, so that I can manage my day from the home screen. | S | 5 |
| US-WIDGET-005-01 | F-WIDGET-005 | As **Rafiq**, I want a prayer widget with times, the next prayer, and tap-to-log, so that salah tracking is effortless. | S | 8 |
| US-WIDGET-006-01 | F-WIDGET-006 | As a **user**, I want widget actions to sync reliably with retry, so that the web app and widget always agree. | M | 8 |
| US-WIDGET-007-01 | F-WIDGET-007 | As a **user**, I want the widget to show when its data is out of date, so that I don't act on yesterday's list. | M | 3 |
| US-WIDGET-008-01 | F-WIDGET-008 | As a **Bengali user**, I want the widget in Bengali, so that it matches my app language. | M | 2 |
| US-WIDGET-009-01 | F-WIDGET-009 | As a **user**, I want tapping the widget to open the relevant web page, so that I can do more there. | M | 3 |

## Q. RPT
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-RPT-001-01 | F-RPT-001 | As a **user**, I want daily and weekly summaries, so that I see my progress regularly. | S | 5 |
| US-RPT-002-01 | F-RPT-002 | As a **user**, I want monthly and yearly reports with period comparisons, so that I see long-term growth. | S | 8 |
| US-RPT-003-01 | F-RPT-003 | As a **user**, I want category trends over time, so that I see where my energy goes. | S | 3 |
| US-RPT-004-01 | F-RPT-004 | As a **user**, I want a habit consistency table, so that I compare habits. | S | 2 |
| US-RPT-005-01 | F-RPT-005 | As a **user**, I want a goal completion report, so that I can celebrate achievements. | S | 2 |
| US-RPT-006-01 | F-RPT-006 | As a **user**, I want to export my data as CSV that opens correctly in Excel with Bengali text, so that I can analyse it myself. | S | 5 |
| US-RPT-007-01 | F-RPT-007 | As a **user**, I want a PDF of my monthly report, so that I can keep or print it. | C | 5 |
| US-RPT-008-01 | F-RPT-008 | As **Karim**, I want consented, aggregate product analytics, so that I can improve the product without invading privacy. | S | 5 |

## R. INTG
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-INTG-001-01 | F-INTG-001 | As the **platform**, I want an email adapter with retries and bounce handling, so that transactional emails are reliable. | M | 5 |
| US-INTG-002-01 | F-INTG-002 | As the **platform**, I want a VAPID web-push service that prunes dead subscriptions, so that push stays healthy. | M | 3 |
| US-INTG-003-01 | F-INTG-003 | As a **user**, I want to export my planner and prayer times to Google Calendar, so that I see everything in one calendar. | C | 8 |
| US-INTG-004-01 | F-INTG-004 | As a **user**, I want step and sleep data from my wearable to inform health deeds, so that tracking is automatic. *(Won't Have in v1; see FE-001.)* | W | — |
| US-INTG-005-01 | F-INTG-005 | As a **developer user**, I want a scoped personal API token, so that I can build my own dashboards. | C | 8 |
| US-INTG-006-01 | F-INTG-006 | As an **event attendee**, I want to scan a QR code to join a campaign, so that participation is instant. | C | 3 |

## S. ADMIN
| ID | Feature | Story | Pri | Pts |
|---|---|---|---|---|
| US-ADMIN-001-01 | F-ADMIN-001 | As an **admin**, I want to search users and suspend or reactivate accounts without seeing private content, so that I can support users safely. | M | 5 |
| US-ADMIN-002-01 | F-ADMIN-002 | As **Karim**, I want to create custom admin roles from permissions, so that staff get least privilege. | M | 5 |
| US-ADMIN-003-01 | F-ADMIN-003 | As **Farhana**, I want to manage deeds and categories with a draft/publish workflow and bulk import, so that the library grows reliably. | M | 8 |
| US-ADMIN-004-01 | F-ADMIN-004 | As **Farhana**, I want a dashboard of content missing BN translations, so that I can close the gaps. | S | 3 |
| US-ADMIN-005-01 | F-ADMIN-005 | As an **Islamic content editor**, I want to manage duas, hadith, and adhkar with a second-person verification step, so that published content is accurate. | M | 8 |
| US-ADMIN-006-01 | F-ADMIN-006 | As **Tanvir**, I want to manage campaigns and QR codes and see aggregate participation, so that I can run events. | S | 5 |
| US-ADMIN-007-01 | F-ADMIN-007 | As an **admin**, I want to schedule bilingual announcements to segments that respect opt-outs, so that important news reaches the right users. | S | 5 |
| US-ADMIN-008-01 | F-ADMIN-008 | As a **moderator**, I want a console with context, history, and appeals, so that decisions are fair and fast. | M | 8 |
| US-ADMIN-009-01 | F-ADMIN-009 | As **Karim**, I want feature flags and kill switches, so that I can roll out safely and react to incidents. | M | 5 |
| US-ADMIN-010-01 | F-ADMIN-010 | As **Karim**, I want simple A/B tests on non-religious UI, so that we can improve onboarding with evidence. | C | 8 |
| US-ADMIN-011-01 | F-ADMIN-011 | As **Farhana**, I want content version history with rollback, so that mistakes can be undone. | S | 5 |
| US-ADMIN-012-01 | F-ADMIN-012 | As **Karim**, I want a system health dashboard, so that I can spot problems early. | S | 5 |
| US-ADMIN-013-01 | F-ADMIN-013 | As **Karim**, I want per-route API analytics, so that I can find slow or abused endpoints. | C | 5 |
| US-ADMIN-014-01 | F-ADMIN-014 | As **Karim**, I want to see and retry failed background jobs, so that reminders and exports don't silently fail. | S | 5 |
| US-ADMIN-015-01 | F-ADMIN-015 | As **Karim**, I want backup status and alerts, so that I know we can recover. | S | 3 |
| US-ADMIN-016-01 | F-ADMIN-016 | As **Karim**, I want a read-only, searchable audit log viewer, so that I can investigate who did what. | M | 5 |
| US-ADMIN-017-01 | F-ADMIN-017 | As **Karim**, I want to manage subscriptions, so that we can monetise later. *(Won't Have in v1; see FE-002.)* | W | — |
