# Project Development Rules

These rules govern day-to-day development of the **Multi-Tenant GoHighLevel AI SaaS**.  They complement the technical roadmap in `ROADMAP-TODO.md` and the Cursor workspace rules.

---
## 1  Branch & Commit Hygiene
1. Branch naming: `feat/<task-id>-<slug>`, `fix/<task-id>-<slug>`, `chore/<scope>`
2. Use [Conventional Commits](https://www.conventionalcommits.org) with roadmap task-ID in the header, e.g.  
   `feat(A-1): add TenantSecret model`.
3. One PR per task unless tasks are inseparable.

## 2  Definition of Done (DoD)
A task is ✅ **Done** when:
1. Code passes `pnpm lint`, `pnpm test`, `tsc --noEmit`.
2. Unit / integration tests written or updated.
3. Documentation updated (ROADMAP box checked, README/ADR if needed).
4. No secrets or tokens emitted in logs (verified by CI grep).
5. PR approved by ≥1 reviewer (pair-programming if solo).
6. **ROADMAP UPDATED**: Task moved from `ROADMAP-TODO.md` to `ROADMAP-COMPLETED.md` immediately upon completion. 
7. **NEVER DESIGNATE TIME FRAMES**

## 3  Security & Secrets
1. Never log raw `access_token`, `refresh_token`, or Bearer headers.
2. `.env*` files must be git-ignored.
3. Tenant credentials are stored only via encrypted `TenantSecret` rows or the chosen vault.
4. New third-party dependencies must pass `pnpm audit`.

## 4  🔧 CRITICAL: Environment Variable Access for Debugging
**MANDATORY PROTOCOL**: When the AI Agent needs to access environment variable information for debugging, configuration validation, or troubleshooting:

### **Approved Method**: 
Use terminal command with `Get-Content` (PowerShell) or `cat` (Unix) to read .env files:

```powershell
# PowerShell (Windows)
Get-Content client/.env.local
Get-Content .env.local
Get-Content .env
```

```bash
# Unix/Linux/Mac
cat client/.env.local
cat .env.local  
cat .env
```

### **Security Guidelines**:
- **ONLY for debugging**: Use only when needed for troubleshooting configuration issues
- **NO logging of secrets**: Never log or repeat sensitive values like API keys, tokens, or passwords
- **Validate configuration**: Use to verify environment variables are properly set
- **Pattern matching**: Check for correct formatting and missing variables

### **Approved Use Cases**:
- ✅ Debugging database connection issues
- ✅ Verifying environment variable formatting
- ✅ Checking if required variables are present
- ✅ Troubleshooting OAuth configuration
- ✅ Validating API key availability (without exposing the key)

### **Prohibited Actions**:
- ❌ Never expose actual secret values in chat/logs
- ❌ Never copy sensitive values to other locations
- ❌ Never commit .env files to version control
- ❌ Never share actual keys/tokens in documentation

**Rationale**: This provides the AI Agent with necessary visibility into configuration issues while maintaining security boundaries.

## 5  Testing Baseline
1. ≥90 % coverage on new modules, ≥80 % project-wide.
2. Every PR adds at least one happy-path & one edge-case test.
3. End-to-end smoke test (`docker compose up && curl /health`) must remain green.

## 6  CI/CD Gates
1. PRs merge only from green GitHub Actions pipelines.
2. `main` remains deployable; releases are made via tag + pipeline.

## 7  Code Style & Tooling
1. Prettier + ESLint auto-fix on commit (`husky pre-commit`).
2. TypeScript `strict` mode stays enabled.
3. Log levels: `info`, `warn`, `error`; no `debug` in production.

## 8  Observability First
1. All long-running components export Prometheus metrics.
2. Winston logs include `tenantId` and `requestId` where relevant.
3. Unhandled promise rejections crash the process; Docker/PM2 restarts captured via metrics.

## 9  🚨 CRITICAL: MCP Management & Usage Protocol
**MANDATORY CONSTRAINT**: Maximum 2-3 MCPs can be enabled simultaneously for proper functionality.

### **Available MCPs & Their Purposes**

| MCP | Symbol | Purpose | When to Use | Priority |
|-----|--------|---------|-------------|----------|
| **Context7** | C | Official documentation retrieval | Framework docs, API references, integration patterns | 🔴 **CRITICAL** |
| **Neon Database** | N | Database operations & validation | Schema queries, data validation, tenant management | 🔴 **CRITICAL** |
| **Sequential Thinking** | S | Complex problem analysis | Multi-step planning, architecture decisions, debugging | 🟡 **HIGH** |
| **GitHub** | G | Repository analysis | Code examples, issue tracking, repository exploration | 🟢 **MEDIUM** |
| **Vapi MCP Server** | V | Voice/call functionality | Voice integration, call management (future feature) | 🔵 **LOW** |
| **Browserbase** | B | Web automation | Testing, scraping, browser automation (if needed) | 🔵 **LOW** |

### **MCP Usage Protocol**
**MANDATORY WORKFLOW**: Before using ANY MCP, the Agent MUST:

1. **Check Current Status**: Ask user "Is [MCP_NAME] currently enabled?" 
2. **Request Enablement**: If not enabled, ask user to enable the specific MCP
3. **Verify Functionality**: Test MCP with a simple query before proceeding
4. **Document Issues**: If MCP fails, immediately inform user and request alternative

### **MCP Combination Strategies**
**For Different Task Types**:

**🔴 CRITICAL TASKS (Framework Implementation)**
- **Enable**: Context7 + Neon Database + Sequential Thinking
- **Purpose**: Get docs, validate DB state, plan complex changes

**🟡 STANDARD TASKS (Feature Development)**  
- **Enable**: Context7 + Neon Database
- **Purpose**: Get API docs, validate database operations

**🟢 ANALYSIS TASKS (Planning/Debugging)**
- **Enable**: Sequential Thinking + Neon Database + Context7
- **Purpose**: Complex analysis, state validation, documentation review

**🔵 RESEARCH TASKS (Repository Analysis)**
- **Enable**: GitHub + Context7 + Sequential Thinking
- **Purpose**: Code analysis, documentation research, planning

### **MCP Request Templates**
**Use these exact phrases when requesting MCP enablement**:

```
🔧 MCP ENABLEMENT REQUEST
I need to use [MCP_NAME] for [SPECIFIC_PURPOSE].
Current task requires: [LIST_OF_MCPS_NEEDED]
Please enable [MCP_NAME] and confirm it's ready for use.
```

**Example**:
```
🔧 MCP ENABLEMENT REQUEST  
I need to use Context7 MCP for retrieving OpenAI Agents JS documentation.
Current task requires: Context7 + Neon Database + Sequential Thinking
Please enable Context7 MCP and confirm it's ready for use.
```

## 10  Documentation Cadence & Roadmap Management
1. **MANDATORY**: Update both `ROADMAP-TODO.md` and `ROADMAP-COMPLETED.md` upon each task completion
2. **IMMEDIATE**: Move completed tasks from TODO to COMPLETED with timestamp and validation method
3. **LIVING DOCS**: Keep roadmaps current - they are the source of truth for project status
4. Add Architecture Decision Records (ADRs) for impactful infra/security decisions.

## 11  🚨 CRITICAL: Documentation-First Problem Solving
**MANDATORY RULE**: If we encounter the same issue more than **2 times**, the Agent MUST:
1. **First Priority**: Use GitHub MCP to examine relevant official repositories:
   - `https://github.com/openai/openai-agents-js` (our AI framework)
   - `https://github.com/GoHighLevel/highlevel-api-docs` (GHL API reference)
   - `https://github.com/mastanley13/GoHighLevel-MCP` (Single Tenant Working MCP for GHL - Only for Tool Reference)
   - User-provided repositories for specific issues
2. **Documentation over assumptions**: Read official docs, examples, and source code
3. **Ask for repo links**: If issue persists, request specific GitHub repositories from user
4. **No repeated guessing**: Stop making assumptions and start reading authoritative sources

**Rationale**: Documentation gets us to the end, not just knowledge. Official repositories contain the ground truth we need for complex integrations.

## 12 🎯 CRITICAL: Multi-Tenant MCP Integration Requirements
**MANDATORY for ANY MCP-related work**: Before making changes, the Agent MUST:
1. **Use Context7 MCP** to fetch documentation from `/openai/openai-agents-js` and `/gohighlevel/highlevel-api-docs`
2. **Use Neon Database MCP** to validate current tenant data and credentials
3. **Understand the frameworks**: OpenAI Agents JS uses specific patterns for tool creation, MCP server connections, and authentication
4. **GoHighLevel OAuth Requirements**: Each tenant uses their OAuth access token with locationId as credentials
5. **Database Context**: Query TenantSecret table for stored credentials (tenantId, accessToken, refreshToken, locationId, companyId)
6. **MCP Server Architecture**: Our MCP server runs as a separate service that needs proper tenant context injection

**Key Integration Points**:
- Frontend: OpenAI Agent creation with custom tools
- Backend: MCP server with tenant credential management  
- Database: TenantSecret model for secure credential storage
- Authentication: NextAuth with GoHighLevel OAuth provider

If more than 2 repeated issues occur with MCP integration, IMMEDIATELY request specific repository links from user and use official documentation sources.

## 13 🔧 MANDATORY: Pre-Work Audit for Every Task
**CRITICAL RULE**: Before starting ANY implementation task, the Agent MUST complete a pre-work audit using the template in `ROADMAP-TODO.md`:

### **Pre-Work Audit Checklist**
1. **MCP Information Gathering**
   - [ ] **Request required MCPs**: Ask user to enable specific MCPs needed
   - [ ] **Use Context7 MCP** for official documentation (if enabled)
   - [ ] **Use GitHub MCP** for repository analysis (if enabled and working)
   - [ ] **Document MCP status**: Note which MCPs are available/unavailable

2. **Current State Validation**
   - [ ] **Use Neon MCP** to check database state (if enabled)
   - [ ] Validate existing code/configuration
   - [ ] Test current functionality before changes
   - [ ] Document baseline performance/behavior

3. **Documentation Review**
   - [ ] Review official docs for frameworks/APIs involved
   - [ ] Check for breaking changes or updates
   - [ ] Validate understanding against authoritative sources
   - [ ] Note any discrepancies with current implementation

4. **Risk Assessment**
   - [ ] Identify potential blocking issues
   - [ ] Plan fallback approaches
   - [ ] Ensure all dependencies are available
   - [ ] Define rollback strategy

5. **Success Criteria Definition**
   - [ ] Define specific, measurable acceptance criteria
   - [ ] Plan testing approach
   - [ ] Identify validation methods
   - [ ] Set completion timeline

**NO IMPLEMENTATION WITHOUT COMPLETED PRE-WORK AUDIT**

## 14 📋 MANDATORY: Roadmap Management
**AUTOMATIC UPDATES REQUIRED**: The Agent MUST immediately update roadmaps when:

### **Task Completion**
- [ ] Move completed task from `ROADMAP-TODO.md` to `ROADMAP-COMPLETED.md`
- [ ] Add completion date, validation method, and notes
- [ ] Update status dashboard in TODO roadmap
- [ ] Check off acceptance criteria
- [ ] Document which MCPs were used for validation

### **Task Start**
- [ ] Update task status to "In Progress" in TODO roadmap
- [ ] Complete pre-work audit checklist
- [ ] Document any blockers or dependencies discovered
- [ ] Update estimated effort if needed
- [ ] List required MCPs for the task

### **Priority Changes**
- [ ] Immediately update priority levels in TODO roadmap
- [ ] Reorganize task order if needed
- [ ] Update status dashboard
- [ ] Document reason for priority change

### **New Tasks Discovered**
- [ ] Add new tasks to TODO roadmap with proper formatting
- [ ] Include pre-work audit requirements
- [ ] Set appropriate priority level
- [ ] Link to dependent tasks
- [ ] Specify required MCPs

**Rationale**: Living roadmaps prevent the restart cycles we've experienced and keep everyone aligned on current state and next steps.

## 15 🎯 CRITICAL: MCP-Enhanced Development Process
**MANDATORY WORKFLOW**: For any development work, the Agent MUST:

1. **Request MCP Enablement**: Ask user to enable specific MCPs needed for the task
2. **Verify MCP Status**: Confirm MCPs are working before proceeding
3. **Information Gathering**: Use MCPs to get authoritative information before making assumptions
4. **Validation**: Use MCPs to validate current state and dependencies
5. **Implementation**: Code with confidence based on validated information
6. **Testing**: Use MCPs to verify results and validate against requirements

**MCP Failure Protocol**:
- If any MCP fails during use, immediately inform user
- Request alternative MCP enablement if needed
- Document MCP issues in task notes
- Never proceed with assumptions when MCP validation fails

**MCP Efficiency Guidelines**:
- Use MCPs strategically - don't overload with unnecessary queries
- Combine related queries when possible
- Cache important information from MCP responses
- Always test MCP connectivity before critical operations

---
**Last updated:** December 19, 2024 - Added comprehensive MCP management protocols and dual roadmap maintenance