# Audit Trail Implementation Guide

This guide details specific locations in the codebase where audit logs must be implemented to ensure full observability and compliance. This maps directly to the `AuditModel` configurations.

## 1. Authentication Module (`src/modules/auth`)

These events track entry and exit from the system.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Register Init** | `REGISTER_ATTEMPT` | `auth` | Email | ✅ Implemented |
| **Register Complete** | `REGISTER_COMPLETE_ATTEMPT` | `auth` | Phone number | ✅ Implemented |
| **Login** | `LOGIN_ATTEMPT` | `auth` | IP, User Agent, Failure Reason | ✅ Implemented |
| **MFA Login** | `mfa_login` | `auth` | IP, User Agent | ✅ Implemented |
| **Refresh Token** | `REFRESH_TOKEN_ATTEMPT` | `auth` | Token ID | ✅ Implemented |
| **Logout** | `logout` | `auth` | - | ✅ Implemented |
| **Forgot Password** | `password_reset` | `auth` | Email | ✅ Implemented |
| **Reset Password** | `reset_password` | `auth` | Recovery Token | ✅ Implemented |

## 2. User & KYC Module (`src/modules/Individual_user`, `src/modules/kyc`)

These events track changes to the user's permanent record and compliance status.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Update Profile** | `toggle_mfa` | `individual_user` | Fields changed (e.g., photo_url) | ✅ Implemented |
| **Change PIN** | `PIN_CHANGE` | `security` | Success/Failure | ✅ Implemented |
| **Submit KYC Tier 1** | `tier1_kyc_submission` | `kyc` | Tier: 1 | ✅ Implemented |
| **Submit KYC Tier 2** | `tier2_kyc_submission` | `kyc` | Tier: 2, Document Type | ✅ Implemented |
| **Submit KYC Tier 3** | `tier3_kyc_submission` | `kyc` | Tier: 3, Document Type | ✅ Implemented |
| **Initiate BVN Verification** | `tier2_kyc_bvn_initiate` | `kyc` | Provider (Mono/Dojah) | ✅ Implemented |

## 3. Account Module (`src/modules/account`)

These events track interaction with financial accounts.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Connect Mono Account** | `account_linking_init` | `account` | Institution Name | ✅ Implemented |
| **Link Account Success** | `account_linking_complete` | `account` | Account ID | ✅ Implemented |
| **Generate Statement** | `statement_generation` | `account` | Period, Format | ✅ Implemented |

## 4. Webhook Module (`src/modules/webhook`)

These events track external signals that modify system state.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Mono Webhook** | `webhook_received` | `webhook` | Event Type, Payload | ✅ Implemented |
| **Dojah Webhook** | `webhook_received` | `webhook` | Event Type, Payload | ❌ To Do |

## Implementation Pattern

Use the `AuditService.queue.add` method within your route handlers. Ideally, use the `state` plugin pattern to capture IP and User Agent automatically if possible, or pass them manually.

### Example Usage

```typescript
import { AuditService } from "@/modules/audit/service";

// Inside a route handler
await AuditService.queue.add("log", {
    userId: user.id,
    userType: "individual",
    action: "login",
    targetType: "individual_user", // The resource being affected
    targetId: user.id,             // ID of the resource
    status: "success",             // "success" | "failure"
    ipAddress: server?.requestIP(request)?.address,
    userAgent: headers["user-agent"],
    details: {
        field: "photo_url",
        oldValue: "...",
        newValue: "..."
    }
});
```

### Critical Rules

1. **No Secrets**: Never log passwords, PINs, or raw credit card numbers in the `details` object.
2. **Failure Reasons**: Always log *why* an action failed (e.g., "Invalid OTP", "Insufficient Balance") to help with support.
