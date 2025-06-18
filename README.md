# Multi-Tenant GoHighLevel AI SaaS

> One containerised repo that turns every GoHighLevel location into its **own GPT-4-powered assistant** – safely isolated and ready for production.

---

## ✨  Features

• **Per-tenant MCP processes** – one child per location, spawned on demand, reaped when idle.<br/>
• **Secure token storage** – credentials live only in the encrypted `TenantSecret` table.<br/>
• **Rate-limits & watchdogs** – Upstash sliding-window (60 req/min) plus idle-reaper cron.<br/>
• **Prometheus metrics** – `/metrics` endpoint with live gauges for children, memory, limits.<br/>
• **Winston logging** – tenant-tagged, bearer tokens automatically 🔒 redacted.<br/>
• **Modern UI** – Next-JS chat with Socket.IO typing indicators & dark-mode.<br/>
• **One-command deploy** – `docker compose -f deploy/docker-compose.prod.yml up -d`.

---

## 🏎️  Quick Start (local dev)

```bash
# 1. clone & install
pnpm install

# 2. configure Postgres (or point DATABASE_URL to yours)
cp .env.example .env            # fill in DATABASE_URL + GHL OAuth creds
pnpm prisma migrate dev

# 3. launch everything
pnpm dev              # runs backend + frontend concurrently
```

Open http://localhost:3000 and sign in – the UI will add your `tenantId` header automatically.

---

## 🐳  Production in 60 seconds

```bash
# build images (CI does this automatically)
docker build -t ghl/backend:latest .
docker build -t ghl/client:latest ./client

# bring up the stack
export POSTGRES_PASSWORD=mysecret
scripts/provision-prod.sh        # or docker compose -f deploy/docker-compose.prod.yml up -d
```

Health-check: `curl -sf http://<host>:3001/health` → `{"status":"ok"}`

Metrics:      `curl <host>:3001/metrics | head`  
Chat API:     `POST http://<host>:3000/api/chat` with `{ "message":"hello" }` JSON body.

---

## 🔧  Required Environment Variables

| Variable | Where | Notes |
|----------|-------|-------|
| `DATABASE_URL` | backend, client | Postgres connection string |
| `GHL_CLIENT_ID` / `GHL_CLIENT_SECRET` | client auth | Obtained from GoHighLevel OAuth settings |
| `NEXTAUTH_SECRET` | client | Any strong random string |
| `UPSTASH_REST_URL` / `UPSTASH_REST_TOKEN` | backend | Optional – enables global Upstash rate-limit |

Development will fall back to in-memory rate-limits and stub tokens.

---

## 🛠️  Common Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run backend (port 3001) + frontend (port 3000) with hot reload |
| `pnpm lint` | ESLint + Prettier |
| `pnpm test` | Jest unit & integration tests (≥ 90 % coverage) |
| `scripts/grep-tokens.sh` | CI guard – fails if any credential is logged |
| `scripts/provision-prod.sh` | Bring up production compose & wait for health |

---

## ✅  CI / CD

GitHub Actions (`.github/workflows/ci.yml`)
1. Lint & type-check
2. Jest tests with coverage ≥ 90 %
3. Token-grep & non-root UID checks
4. Build backend/client images
5. End-to-end smoke: `docker compose` up → `/health` OK

A green badge means the repo is safe to deploy.

---

## 🗺️  Roadmap Status

All roadmap tasks (A → H) are **complete**.  See `ROADMAP.md` for epic breakdown.

---

## 🤝  Contributing

Pull requests welcome!  Please follow the branch naming & commit conventions in `project-rules.md` and make sure `pnpm test && pnpm lint` stay green.

---

## © License

MIT – do amazing things. ✌️ 