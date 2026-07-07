# Grooming Souls — Full UI screenshot pack

Captured live from `http://localhost:4321/` at 1440 × 900 (full-page) via agent-browser.
Date: 2026-06-27.

## Folder layout

| Folder       | Pages                                                                                                          | Count |
|--------------|----------------------------------------------------------------------------------------------------------------|-------|
| `public/`    | Home, About, Contact, Privacy, Terms, Refund, Checkout success                                                 | 7     |
| `auth/`      | Login, Signup, Forgot password, Reset password                                                                 | 4     |
| `academy/`   | Academy list + 3 course details (Class 11-12, CUET-UG, NET-JRF)                                                | 4     |
| `diploma/`   | Diploma list + Diploma course detail                                                                            | 2     |
| `therapy/`   | Therapy directory, Tests list, all 5 test detail pages                                                          | 7     |
| `dashboard/` | Student dashboard, course detail, lesson player (signed in as `akshay.kumar@gmail.com`)                         | 3     |
| `admin/`     | All 11 admin sections + Course-new + Course-edit + Test-submission-detail (signed in as `grooming@admin.com`)   | 13    |

**Total: 40 screenshots — every route in `src/app/**/page.tsx` is covered (verified 2026-06-27).**

## Credentials used for capture

| Role    | Email                       | Password    |
|---------|-----------------------------|-------------|
| Admin   | `grooming@admin.com`        | `Demo@2026` |
| Student | `akshay.kumar@gmail.com`    | `Demo@2026` |

Both passwords were reset for this capture session — change in production.

## What's not captured

- Modals/overlays (checkout QR modal, certificate drawer, module-title modal) — not on standalone routes.
- Empty states for tests/courses that have no data (academy listing still shows all published courses).
- The `/admin/courses/[id]` page is captured for one course; other course IDs render the same layout.
