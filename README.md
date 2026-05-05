# arrakis

Frontend SPA for the dune-lab adaptive learning platform. The interface through which students experience their learning journey and administrators manage the system.

Named after the desert planet Arrakis — the surface through which everything flows.

---

## Responsibilities

- Student onboarding: account creation, enrollment, journey start
- Real-time journey progress display via SSE
- Admin panel: users, students, journeys, DLQ management
- All API calls proxied through `imperium` (no direct service communication)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 |
| Build | Vite 8 |
| Runtime (production) | nginx (static file serving) |

---

## Pages & Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/login` | public | Sign in |
| `/register` | public | Create account |
| `/dashboard` | student/admin | Journey progress overview |
| `/admin/students` | admin | List and manage all students |
| `/admin/journeys` | admin | List and manage all journeys |
| `/admin/dlq` | admin | Harkonnen DLQ — inspect, edit and reprocess failed Kafka messages |

Navigation is role-aware: admin-only routes are hidden from student accounts.

---

## Architecture

```
src/
├── api/
│   └── imperium.ts       ← all HTTP calls to the BFF
├── context/
│   └── AuthContext.tsx   ← JWT storage + role extraction
├── components/
│   ├── AppLayout.tsx     ← sidebar navigation + outlet
│   └── ui/               ← Button, inputs, shared components
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx     ← journey progress + SSE hook
│   └── admin/
│       ├── Students.tsx
│       ├── Journeys.tsx
│       └── Dlq.tsx       ← DLQ management UI
└── router.tsx            ← route definitions + protected route wrapper
```

### API Client (`src/api/imperium.ts`)

Thin, typed wrapper over `fetch`. Every function maps directly to one imperium endpoint:

```ts
login(email, password)               → POST /auth/login
register(name, email, pw, role)      → POST /users/register
getMe(token)                         → GET  /me
listStudents(token)                  → GET  /students
startJourney(studentId, token)       → POST /journeys
listDlq(token)                       → GET  /harkonnen
reprocessDlqOne(id, payload, token)  → POST /harkonnen/reprocess
reprocessDlqAllByTopic(topic, token) → POST /harkonnen/reprocess-all
dismissDlq(id, token)                → POST /harkonnen/dismiss
```

The base URL is injected at build time via `VITE_IMPERIUM_URL`.

---

## DLQ Admin UI

The `/admin/dlq` page provides full Harkonnen DLQ management:

- **Filter tabs**: All / Pending / Reprocessed / Dismissed
- **Expandable cards**: click any message to view its full payload and error
- **Editable payload**: pending and reprocessed messages have an editable textarea — edit before reprocessing to fix malformed data
- **Per-message actions**: Reprocess / Reprocess novamente / Dismiss
- **Bulk action**: "Reprocessar tudo: {topic}" button appears when there are pending messages on a topic

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_IMPERIUM_URL` | Base URL for the BFF (default: `http://localhost:3004`) |

Set at **build time** via Vite — the value is baked into the static bundle.

---

## Running Locally

```bash
npm install
npm run dev
```

Default port: **5173**

In production (Docker), the built bundle is served by nginx on port **80**.

---

## Scripts

```bash
npm run dev      # Vite dev server with HMR
npm run build    # TypeScript check + production bundle
npm run preview  # serve production build locally
npm run lint     # ESLint check
```

---

## Docker

The image uses a two-stage build:

1. **Builder** (`node:24-alpine`): `tsc` + `vite build`
2. **Production** (`nginx:alpine`): serves `dist/` as static files

`VITE_IMPERIUM_URL` is passed as a Docker build arg and baked into the bundle at build time.
