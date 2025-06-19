# Multi-Tenant GoHighLevel AI SaaS – Development Roadmap

> **Scope**  
> Convert the current single-tenant prototype into a secure, scalable multi-tenant SaaS that spawns one MCP process **per tenant** using their individual OAuth access-token + locationId.

---
## 📑 Table of Contents
1. [Legend](#legend)
2. [Epic & Task Checklist](#epic--task-checklist)
3. [Kanban View](#kanban-view)
4. [Code Scaffolds](#code-scaffolds)
5. [Smoke-Test & Go-Live Script](#smoke-test--go-live-script)
6. [Reference Docs](#reference-docs)

---
## Legend
| Symbol | Meaning |
| ------ | ------- |
| ☑️ | Complete |
| 🔄 | In-Progress |
| ⬜ | To-Do |
| 🛠 | Dev task |
| 🔐 | Security |
| 📦 | DevOps / CI |
| 📖 | Docs |
| 🧪 | Tests |

---
## Epic & Task Checklist

### A — Credential Capture & Storage
| Status | Task ID | Description | Owner | Acceptance Criteria |
| ------ | ------- | ----------- | ----- | ------------------ |
| ☑️ | A-1 | **Create `TenantSecret` model** in Prisma (`encryptedAccessToken`, `locationId`, `tenantId`) 🔐🛠 | BE | ① Prisma migrate succeeds ② pgcrypto (or KMS) verified |
| ☑️ | A-2 | API `POST /api/tenant/credentials` to upsert secrets 🔐🛠 | BE | ① Handles full OAuth payload ② Returns 201/200 ③ Unit tests pass |
| ☑️ | A-3 | Helper `getTenantSecrets(tenantId)` 🔐🛠 | BE | ① Returns full credential set ② Throws 404 when missing |
| ☑️ | A-4 | **Server-side upsert in NextAuth `signIn` event** 🔐🛠 | BE | ① Real `access_token` & `refresh_token` persisted immediately on login |
| ☑️ | A-5 | **Sync token refresh to `TenantSecret`** 🔐🛠 | BE | ① `getValidToken()` path updates row after refresh ② Unit test validates new expiry saved |

### B — Multi-Tenant Process Manager
| Status | Task ID | Description | Owner | Acceptance Criteria |
| ------ | ------- | ----------- | ----- | ------------------ |
| ☑️ | B-1 | Implement `processManager.ts` (Map, refCount, idleKill) 🛠 | BE | ① 100 % unit-test coverage ② Idle reap < 12 min |
| ☑️ | B-2 | Refactor `server.ts` → `backend/src/index.ts` to use manager 🛠 | BE | ① Socket/REST connections spawn correct tenant ② Zero global MCP env |
| ☑️ | B-3 | Env injection: `GHL_ACCESS_TOKEN`, `GHL_LOCATION_ID`, `GHL_BASE_URL` 🛠 | BE | ① Child receives correct env (assert via stderr) |

### C — Client ↔ Wrapper Contract
| Status | ID | Description | Owner | Acceptance Criteria |
| ------ | -- | ----------- | ----- | ------------------- |
| ☑️ | C-1 | Pass `tenantId` from Next.js to wrapper (header or socket auth) 🛠 | FE | ① Request inspected in dev-tools shows header ② Auth middleware validates |
| ☑️ | C-2 | Expose `NEXT_PUBLIC_MCP_URL` env 📦 | DevOps | ① Next build injects URL ② SSR & client both resolve |

### D — Rate-Limits & Watchdogs
| Status | ID | Description | Owner | Acceptance |
| ------ | -- | ----------- | ----- | ----------- |
| ☑️ | D-1 | Upstash limiter inside wrapper per tenant 🛠 | BE | ① 60 req/min enforced ② Returns 429 with standard headers |
| ☑️ | D-2 | Idle reaper cron 🔄 (tie-in with B-1) 🛠 | BE | ① Processes killed >10 min idle ② Prom metrics show drop |

### E — Observability & Logging
| Status | ID | Description | Owner | Acceptance |
| ------ | -- | ----------- | ----- | ----------- |
| ☑️ | E-1 | Pipe child MCP `stdout/stderr` → Winston with tenant tag 🛠 | BE | ① Logs contain `tenantId` field ② Tokens redacted |
| ☑️ | E-2 | `/metrics` Prom endpoint (prom-client) 📦 | BE | ① Exposes activeChildren, memUsage |
| ☑️ | E-3 | Log redaction middleware 🔐 | BE | ① Regex removes `Bearer ...` tokens |

### F — Containerisation & CI/CD
| Status | ID | Description | Owner | Acceptance |
| ------ | -- | ----------- | ----- | ----------- |
| ☑️ | F-1 | Multi-stage Dockerfile (client, wrapper, dumb-init) 📦 | DevOps | ① `docker compose up` works ② Image < 800 MB |
| ☑️ | F-2 | GitHub Actions: lint → test → build → push 📦 | DevOps | ① Runs on PR ② Green badge |
| ☑️ | F-3 | Compose/Helm manifest for single-VM prod 📦 | DevOps | ① Provision script deploys & passes /health |

### G — Security Hardening
| Status | ID | Description | Owner | Acceptance |
| ------ | -- | ----------- | ----- | ----------- |
| ☑️ | G-1 | Remove token prints in debug logs 🔐 | All | 0 occurrences grep `access_token` |
| ☑️ | G-2 | Child processes user isolation via Docker user 🔐 | DevOps | ① UID ≠ 0 ② Confirm with `docker top` |

### H — Tests & QA
| Status | ID | Description | Owner | Acceptance |
| ------ | -- | ----------- | ----- | ----------- |
| ☑️ | H-1 | Unit tests: ProcessManager, credential helper 🧪 | QA | ≥ 90 % coverage on those modules |
| ☑️ | H-2 | Integration test: spawn MCP, list tools 🧪 | QA | ① Jest passes ② Tools array length > 0 |
| ☑️ | H-3 | e2e smoke via GH Action 🧪 | QA | ① Runs docker image ② Returns 200 /health |

---
## 🚨 URGENT - LIVE DEPLOYMENT GAPS

### Critical Missing Pieces (Prevent Production Use)
| Status | ID | Issue | Fix Required |
| ------ | -- | ----- | ------------ |
| 🔴 | DEPLOY-1 | **Frontend not accessible** | Dockerfile only serves backend, need to expose Next.js app |
| 🔴 | DEPLOY-2 | **MCP tools not exposed via HTTP** | Add `/tools` and `/tools/:name` endpoints to backend |
| 🔴 | DEPLOY-3 | **Missing environment variables** | Set NEXTAUTH_SECRET, GHL_CLIENT_ID, etc. in Railway |
| 🔴 | DEPLOY-4 | **OAuth flow broken** | Configure GHL OAuth app with correct redirect URL |
| 🔴 | DEPLOY-5 | **API routes not working** | Next.js API routes not accessible (need frontend running) |

### Immediate Action Plan
**See IMMEDIATE_DEPLOYMENT_PLAN.md for step-by-step fixes**

---
## Kanban View

| Urgent (Fix NOW) | In-Progress | Review | Done |
| --- | --- | --- | --- |
| **DEPLOY-1**<br/>**DEPLOY-2**<br/>**DEPLOY-3**<br/>**DEPLOY-4**<br/>**DEPLOY-5** |  |  | B-1 B-2 B-3 C-1 C-2 D-1 D-2 A-4 A-5 E-1 E-2 E-3 F-1 F-2 F-3 G-1 G-2 H-1 H-2 H-3 |

Move task IDs across columns as work advances.

---
## Code Scaffolds
### `prisma/schema.prisma` addition
```prisma
model TenantSecret {
  tenantId   String @id
  encryptedAccessToken Bytes   // pgcrypto: pgp_sym_encrypt
  locationId           String
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

### `backend/src/processManager.ts` skeleton
```ts
import { MCPServerStdio } from '@openai/agents';
import { getTenantSecrets } from './secrets';

interface ProcInfo { proc: MCPServerStdio; refCount: number; lastUsed: number }
const processes = new Map<string, ProcInfo>();

export async function getProcess(tenantId: string): Promise<MCPServerStdio> {
  const existing = processes.get(tenantId);
  if (existing && existing.proc.isConnected()) {
    existing.refCount++;
    existing.lastUsed = Date.now();
    return existing.proc;
  }
  const { accessToken, locationId } = await getTenantSecrets(tenantId);
  const proc = new MCPServerStdio({
    name: `GHL-MCP-${tenantId}`,
    command: 'node',
    args: ['/app/ghl-mcp-server/dist/server.js'],
    env: {
      GHL_ACCESS_TOKEN: accessToken,
      GHL_LOCATION_ID: locationId,
      GHL_BASE_URL: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
    },
    cacheToolsList: true,
    clientSessionTimeoutSeconds: 30,
  });
  await proc.connect();
  processes.set(tenantId, { proc, refCount: 1, lastUsed: Date.now() });
  return proc;
}

export function releaseProcess(tenantId: string) {
  const info = processes.get(tenantId);
  if (!info) return;
  info.refCount--;
  info.lastUsed = Date.now();
}

// Idle reaper
setInterval(async () => {
  const now = Date.now();
  for (const [tenantId, info] of processes) {
    if (info.refCount === 0 && now - info.lastUsed > 10 * 60_000) {
      await info.proc.close();
      processes.delete(tenantId);
    }
  }
}, 60_000);
```

---
## Smoke-Test & Go-Live Script
```bash
# Trigger from CI after deploy
curl -sSf https://$PROD_URL/health | jq
curl -sSf -X POST https://$PROD_URL/api/tenant/credentials \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"tenantId":"demo","accessToken":"fake","locationId":"123"}'

# Call a lightweight MCP endpoint
curl -sSf -X POST https://$PROD_URL/mcp/demo/tool/list_contacts \
     -H "Authorization: Bearer demo-token" -d '{}'
```

---
## Reference Docs
• Context7 `/openai/openai-agents-js` – `MCPServerStdio`, tracing, hosted tools  
• OpenAI MCP spec (2025-05) – process env vars, security  
• Upstash Rate Limit docs – sliding window  
• Docker best-practices – multi-stage, non-root user  

---
> **Next Step (kick-off)** : move A-1, A-2, A-3 to "In-Progress", create corresponding feature branches, and start implementation. 