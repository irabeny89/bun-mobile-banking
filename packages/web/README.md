# MoBa Web Client

The frontend web application for MoBa (Modern Banking), a premium mobile banking solution built with Bun, React, and Vite.

## Tech Stack

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **API Client**: [Elysia Eden Treaty](https://elysiajs.com/eden/treaty) (Type-safe API communication)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Tailwind CSS Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

## Features

### 1. User Onboarding

User Type: Individual - KYC

- [x] User registration (NIN/Bank verification)
- [x] KYC compliance (photo ID, address verification, etc.)
- [x] OTP and email/mobile verification

User Type: Business - KYB

- [ ] Documents upload

### 2. Account Management

- [x] Dashboard overview
- [x] View account balances
- [x] View transaction history
- [x] Statement generation (PDF/email)

### 3. Transactions

- [ ] Intra-bank transfers
- [ ] Inter-bank transfers (via NIBSS/NIP)
- [ ] Wallet-to-wallet transfer (if applicable)
- [ ] Scheduled/recurring payments
- [ ] Saved beneficiaries
- [ ] FX Swap

### 4. Payments & Top-ups

- [ ] Airtime & data recharge
- [ ] DSTV, PHCN, and other utility bill payments
- [ ] Payment with USSD

### 5. Card Management

- [ ] Request for ATM/virtual cards
- [ ] Card activation & deactivation
- [ ] PIN change & card freeze

### 6. Loan Management

- [ ] Request loan
- [ ] Loan repayment tracker

### 7. Investment

- [ ] Fixed deposit investment management

### 8. Security

- [ ] Biometric authentication (Face ID, Fingerprint)
- [x] 2FA (Two-Factor Authentication)
- [x] Session management (auto logout)
- [ ] Transaction PIN and OTP confirmation
- [ ] Secret Question
- [x] Change password

### 9. Support

- [ ] In-app live chat
- [ ] Customer service contact options

### 10. Audit Logs

- [x] Audit logs

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

### Installation

1. Install dependencies from the root of the project:

   ```bash
   bun install
   ```

2. Run the development server:

   ```bash
   bun run dev
   ```

3. The application will be available at `http://localhost:5173`.

## Project Structure

- `src/components`: Reusable UI components (shadcn/ui and custom blocks)
- `src/hooks`: Custom React hooks (including authentication and API mutations)
- `src/lib`: Utility functions and API client setup (Eden Treaty)
- `src/routes`: File-based routing powered by TanStack Router
- `src/types.ts`: Shared TypeScript interfaces and types
