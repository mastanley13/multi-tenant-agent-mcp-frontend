# Multi-Tenant MCP Integration Audit Checklist

## 🎯 Pre-Audit Requirements
- [x] **Context7 Documentation**: Retrieved latest docs from `/openai/openai-agents-js` and `/gohighlevel/highlevel-api-docs`
- [x] **Database Access**: Can query TenantSecret and related tables via Neon MCP
- [x] **Environment Variables**: All required keys available (OPENAI_API_KEY, GHL_CLIENT_ID, GHL_CLIENT_SECRET, etc.)

## 1. Database & Data Layer Audit

### 1.1 Prisma Schema Validation ✅ COMPLETED
- [x] **TenantSecret Model**: Properly stores `tenantId`, `accessToken`, `refreshToken`, `expiresAt`, `locationId`, `companyId`, `ghlUserId`, `userType`
- [x] **User Model**: Links to `locationId` for GHL integration
- [x] **Account Model**: Stores GHL OAuth details including `access_token`, `refresh_token`, `expires_at`, `locationId`, `companyId`, `userType`

### 1.2 Token Storage Validation ✅ COMPLETED
- [x] **Token Format**: JWT tokens are stored correctly without corruption
  - Access Token Length: 5204 characters ✅
  - Refresh Token Length: 5284 characters ✅
  - Token Headers: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9` ✅ MATCH
- [x] **Database Storage**: Both `Account` and `TenantSecret` tables store tokens correctly
- [x] **Token Expiration**: `expiresAt` timestamps are properly stored (Unix timestamp format)

### 1.3 Data Consistency Issues ⚠️ FOUND ISSUES
- [x] **Tenant Data**: 2 tenant records found
  - Tenant 1: `ghl_88QfKRPxmudIfgDt43Ha` (older, expires: 1750391049)
  - Tenant 2: `5k8PyeqTMALv0sXCAVDm` (newer, expires: 1750443239) ✅ ACTIVE
- [x] **Location ID Consistency**: Both tenants share same locationId `88QfKRPxmudIfgDt43Ha`
- [x] **Company ID Consistency**: Both tenants share same companyId `2i1llGYjYDQVxrfCpZxt`

## 2. Authentication Flow Audit

### 2.1 GoHighLevel OAuth Flow ⚠️ ISSUES FOUND
- [x] **Token Reception**: Tokens are received correctly from GHL
- [x] **Token Storage**: Tokens stored without corruption in database
- [ ] **User ID Mapping**: CRITICAL ISSUE - Inconsistent user ID mapping
  - Issue 1: `tenantId` vs `ghlUserId` confusion
  - Issue 2: Multiple tenant records for same location
  - Issue 3: `providerAccountId` mapping inconsistency

### 2.2 NextAuth Integration Issues ❌ CRITICAL FIXES NEEDED
- [ ] **User Creation**: `createUser` function has potential ID conflicts
- [ ] **Token Callback**: JWT callback stores multiple user ID variants
- [ ] **Session Management**: Session callback may not use consistent user ID
- [ ] **Account Linking**: Account and TenantSecret may use different primary keys

## 3. 🚨 CRITICAL TOKEN VALIDATION ISSUES FOUND

### 3.1 User ID Inconsistency Problem
**Problem**: Your auth flow creates multiple user ID variants:
```
- User.id: "ghl_88QfKRPxmudIfgDt43Ha" 
- TenantSecret.tenantId: "5k8PyeqTMALv0sXCAVDm" (newer)
- TenantSecret.tenantId: "ghl_88QfKRPxmudIfgDt43Ha" (older)
- TenantSecret.ghlUserId: "5k8PyeqTMALv0sXCAVDm" (both records)
- Account.providerAccountId: "5k8PyeqTMALv0sXCAVDm"
```

**Impact**: MCP integration will fail because it won't know which tenant ID to use for API calls.

### 3.2 Token Lookup Logic Problem
**Problem**: `getValidToken()` function tries multiple lookups:
1. First by `userId` 
2. Then by `providerAccountId`

**Impact**: This creates race conditions and inconsistent token retrieval.

### 3.3 Recommended Fixes
- [ ] **Standardize User ID**: Use consistent ID across all tables
- [ ] **Clean up duplicate records**: Remove older tenant record
- [ ] **Fix token lookup**: Use single, consistent identifier
- [ ] **Update MCP integration**: Ensure it uses correct tenant identifier

## 4. Frontend Integration Audit

### 4.1 OpenAI Client Implementation ❌ NEEDS COMPLETE REFACTOR
- [ ] **Framework Alignment**: Currently using raw OpenAI client instead of OpenAI Agents JS
- [ ] **Tool Integration**: Manual tool call handling instead of `tool()` helpers
- [ ] **MCP Connection**: No proper MCP server integration with frontend

### 4.2 Session Management
- [x] **Session Data**: Access tokens properly stored in session
- [x] **Location Context**: LocationId available in session
- [ ] **Tenant Context**: Need to ensure consistent tenant ID in session

## 5. Backend MCP Server Audit

### 5.1 MCP Server Architecture ⏳ PENDING
- [ ] **Server Implementation**: Examine `/backend/mcp-src/src/server.ts`
- [ ] **Tool Definitions**: Validate GHL API tool implementations  
- [ ] **Tenant Context**: Verify how server receives tenant credentials
- [ ] **Database Integration**: Check how server queries TenantSecret table

### 5.2 GHL API Client ⏳ PENDING  
- [ ] **Authentication**: Verify token usage in API calls
- [ ] **Error Handling**: Check token refresh logic
- [ ] **Rate Limiting**: Validate per-tenant rate limiting

## 6. API Integration Audit

### 6.1 GoHighLevel API Compatibility ⏳ PENDING
- [ ] **Scopes**: Verify all required scopes are requested and granted
- [ ] **Endpoints**: Test critical GHL API endpoints with stored tokens
- [ ] **Error Handling**: Validate token refresh and error recovery

## 7. Security Audit

### 7.1 Token Security ✅ GOOD
- [x] **Storage**: Tokens stored in database, not in logs
- [x] **Transmission**: Tokens not exposed in client-side code
- [x] **Expiration**: Token expiration properly tracked

## 8. Performance & Scalability

### 8.1 Database Performance ⏳ PENDING
- [ ] **Indexing**: Verify proper indexes on tenant lookups
- [ ] **Query Optimization**: Check tenant-specific queries

## 9. Testing & Validation

### 9.1 Token Validation Tests ⏳ PENDING
- [ ] **API Call Test**: Make actual GHL API call with stored token
- [ ] **Token Refresh Test**: Test token refresh flow
- [ ] **MCP Integration Test**: End-to-end MCP tool call test

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1: Fix User ID Consistency
1. **Clean up duplicate tenant records**
2. **Standardize user ID mapping**  
3. **Update token lookup logic**

### Priority 2: Validate Token Usage
1. **Test actual GHL API call with stored tokens**
2. **Verify token refresh works correctly**
3. **Ensure MCP server can retrieve correct tenant tokens**

### Priority 3: MCP Integration
1. **Refactor frontend to use OpenAI Agents JS**
2. **Connect MCP server with tenant context**
3. **End-to-end integration test**

---

**Last Updated**: {timestamp}
**Framework Versions**: OpenAI Agents JS (latest), GoHighLevel API v2021-07-28 