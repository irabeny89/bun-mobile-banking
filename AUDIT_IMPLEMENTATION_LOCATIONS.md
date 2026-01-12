# Audit Trail Implementation Guide

This guide details specific locations in the codebase where audit logs must be implemented to ensure full observability and compliance. This maps directly to the `AuditModel` configurations.

## 1. Authentication Module (`src/modules/auth`)

These events track entry and exit from the system.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Register Init** | `REGISTER_ATTEMPT` | `auth` | Email | ✅ Implemented |
| **Register Complete** | `REGISTER_COMPLETE_ATTEMPT` | `auth` | Phone number | ✅ Implemented |
| **Login** | `LOGIN_ATTEMPT` | `auth` | IP, User Agent, Failure Reason | ✅ Implemented |
| **MFA Login** | `MFA_LOGIN_ATTEMPT` | `auth` | IP, User Agent | ✅ Implemented |
| **Refresh Token** | `REFRESH_TOKEN_ATTEMPT` | `auth` | Token ID | ✅ Implemented |
| **Logout** | `LOGOUT_ATTEMPT` | `auth` | - | ✅ Implemented |
| **Forgot Password** | `PASSWORD_RESET_REQUEST` | `auth` | Email | ❌ To Do |
| **Reset Password** | `PASSWORD_RESET_COMPLETE` | `auth` | Recovery Token used | ❌ To Do |

## 2. User & KYC Module (`src/modules/Individual_user`, `src/modules/kyc`)

These events track changes to the user's permanent record and compliance status.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture |
| :--- | :--- | :--- | :--- |
| **Update Profile** | `PROFILE_UPDATE` | `individual_user` | Fields changed (e.g., photo_url) |
| **Change PIN** | `PIN_CHANGE` | `security` | Success/Failure |
| **Submit KYC Tier 1** | `KYC_SUBMISSION` | `kyc` | Tier: 1 |
| **Submit KYC Tier 2** | `KYC_SUBMISSION` | `kyc` | Tier: 2, Document Type |
| **Submit KYC Tier 3** | `KYC_SUBMISSION` | `kyc` | Tier: 3, Document Type |
| **Initiate BVN Verification** | `IDENTITY_VERIFICATION_INIT` | `kyc` | Provider (Mono/Dojah) |

## 3. Account Module (`src/modules/account`)

These events track interaction with financial accounts.

| Endpoint / Action | Log Action Name | Target Type | Details to Capture |
| :--- | :--- | :--- | :--- |
| **Connect Mono Account** | `ACCOUNT_LINKING_INIT` | `account` | Institution Name |
| **Link Account Success** | `ACCOUNT_LINKING_COMPLETE` | `account` | Account ID |
| **Generate Statement** | `STATEMENT_GENERATION` | `account` | Period, Format |

## 4. Webhook Module (`src/modules/webhook`)

These events track external signals that modify system state.

| Event | Log Action Name | Target Type | Details to Capture |
| :--- | :--- | :--- | :--- |
| **Mono Webhook** | `WEBHOOK_RECEIVED` | `webhook` | Provider: Mono, Event Type |
| **Dojah Webhook** | `WEBHOOK_RECEIVED` | `webhook` | Provider: Dojah, Event Type |

## Implementation Pattern

Use the `AuditService.queue.add` method within your route handlers. Ideally, use the `state` plugin pattern to capture IP and User Agent automatically if possible, or pass them manually.

### Example Usage

```typescript
import { AuditService } from "@/modules/audit/service";

// Inside a route handler
await AuditService.queue.add("log", {
    userId: user.id,
    userType: "individual",
    action: "PROFILE_UPDATE",
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
