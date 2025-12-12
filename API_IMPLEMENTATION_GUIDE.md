# API Implementation Guide

This document outlines the API endpoints required to implement the features listed in the project roadmap. It serves as a blueprint for backend development.

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── accounts/
│   ├── transfers/
│   ├── payments/
│   ├── cards/
│   ├── loans/
│   ├── investments/
│   └── support/
├── utils/
├── config/
├── migrations/
├── server.ts
└── index.ts
```

## Prerequisites

*   **Node.js:** v22.10.0
*   **Bun:** v1.3.0
*   **PostgreSQL:** v18.0
*   **Redis:** v9.0.0
*   **NPM:** v10.16.0

## Technology Stack

Based on the current project structure:
*   **Runtime:** Bun
*   **Framework:** ElysiaJS (High-performance TS framework)
*   **Language:** TypeScript
*   **Database:** SQL (PostgreSQL recommended for banking data consistency)

## Architecture: Modular Monolith

We will organize the code by **modules** (domain-driven design). Each major feature set corresponds to a module in `src/modules/`.

## Features

### 1. Authentication & Onboarding
**Base URL**: `/api/v1/auth`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/register/individual-user` | Register a new user (Individual). |
| **POST** | `/register/business-user` | Register a new user (Business). |
| **POST** | `/verify/email` | Verify email via OTP. |
| **POST** | `/verify/mobile` | Verify mobile via OTP. |
| **POST** | `/login` | Authenticate user and return JWT. |
| **POST** | `/refresh-token` | Refresh access token. |
| **POST** | `/password/forgot` | Initiate password recovery. |
| **POST** | `/password/reset` | Reset password using recovery token. |
| **POST** | `/logout` | Invalidate user session. |

### 2. Individual User Profile & KYC
**Base URL**: `/api/v1/individual-users`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/me` | Get current user's profile details. |
| **POST** | `/update/photo-url` | Update photo ID URL. |
| **POST** | `/kyc` | Submit KYC documents (Photo ID, Address). |
| **GET** | `/kyc/status` | Check current KYC verification status. |
| **POST** | `/pin/set` | Set transaction PIN. |
| **POST** | `/pin/change` | Change transaction PIN. |
| **POST** | `/security/mfa` | Enable/Disable MFA. |

### 3. Business User Profile & KYB
**Base URL**: `/api/v1/business-users`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/me` | Get current user's profile details. |
| **POST** | `/update/photo-url` | Update photo ID URL. |
| **POST** | `/kyb` | Submit KYB documents (Address Proof). |
| **GET** | `/kyb/status` | Check current KYB verification status. |
| **POST** | `/pin/set` | Set transaction PIN. |
| **POST** | `/pin/change` | Change transaction PIN. |
| **POST** | `/security/mfa` | Enable/Disable MFA. |

### 4. Account Management
**Base URL**: `/api/v1/accounts`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | Get list of user accounts (Dashboard overview). |
| **GET** | `/{accountId}` | Get specific account details and balance. |
| **GET** | `/{accountId}/transactions` | Get transaction history for an account. |
| **POST** | `/{accountId}/statement` | Request account statement (PDF/Email). |

### 5. Transactions & Transfers
**Base URL**: `/api/v1/transfers`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/internal` | Intra-bank transfer (to another user within the app). |
| **POST** | `/external` | Inter-bank transfer (NIP/NIBSS). |
| **POST** | `/wallet` | Wallet-to-wallet transfer. |
| **POST** | `/fx-swap` | Perform FX swap. |
| **GET** | `/beneficiaries` | List saved beneficiaries. |
| **POST** | `/beneficiaries` | Add a new beneficiary. |
| **DELETE**| `/beneficiaries/{id}` | Remove a beneficiary. |

### 6. Payments & Bills
**Base URL**: `/api/v1/payments`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/billers` | List available billers (DSTV, PHCN, etc.). |
| **GET** | `/billers/{billerId}/items` | Get available items/plans for a biller. |
| **POST** | `/bills` | Pay a utility bill. |
| **POST** | `/airtime` | Purchase airtime or data. |
| **POST** | `/validate` | Validate customer ID for a biller. |

### 7. Card Management
**Base URL**: `/api/v1/cards`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/` | List all user cards (Virtual/Physical). |
| **POST** | `/request` | Request a new ATM or virtual card. |
| **POST** | `/{cardId}/activate` | Activate a new card. |
| **POST** | `/{cardId}/freeze` | Freeze/Unfreeze a card. |
| **POST** | `/{cardId}/pin` | Change card PIN. |
| **GET** | `/{cardId}/details` | Get sensitive card details (for virtual cards). |

### 8. Loans
**Base URL**: `/api/v1/loans`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/offers` | Get eligible loan offers. |
| **POST** | `/apply` | Apply for a loan. |
| **GET** | `/active` | Get details of active loans. |
| **GET** | `/history` | Get loan repayment history. |

### 9. Investments
**Base URL**: `/api/v1/investments`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/plans` | Get available investment plans/rates. |
| **POST** | `/create` | Create a new fixed deposit investment. |
| **GET** | `/` | List user investments. |
| **POST** | `/{investmentId}/liquidate` | Liquidate an investment early. |

### 10. Support
**Base URL**: `/api/v1/support`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/tickets` | Create a support ticket. |
| **GET** | `/tickets` | List user's support tickets. |
| **POST** | `/tickets/{id}/reply` | Reply to a support ticket. |
| **GET** | `/faq` | Get list of FAQs. |
