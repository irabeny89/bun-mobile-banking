# Fluxus Mobile Banking

A mobile banking application built with [Elysia](https://elysia.dev).
User type includes individual and business.

## Features And Todos

1. User Onboarding
User Type: Individual - KYC
- [ ] User registration (NIN/Bank verification)
- [ ] KYC compliance (photo ID, address verification, etc.)
- [ ] OTP and email/mobile verification
User Type: Business - KYB
- [ ] Documents upload

2. Account Management
- [ ] Dashboard overview
- [ ] View account balances
- [ ] View transaction history
- [ ] Statement generation (PDF/email)

3. Transactions
- [ ] Intra-bank transfers
- [ ] Inter-bank transfers (via NIBSS/NIP)
- [ ] Wallet-to-wallet transfer (if applicable)
- [ ] Scheduled/recurring payments
- [ ] Saved beneficiaries
- [ ] FX Swap

4. Payments & Top-ups
- [ ] Airtime & data recharge
- [ ] DSTV, PHCN, and other utility bill payments
- [ ] Payment with USSD

5. Card Management
- [ ] Request for ATM/virtual cards
- [ ] Card activation & deactivation
- [ ] PIN change & card freeze

6. Loan Management
- [ ] Request loan
- [ ] Loan repayment tracker

7. Investment
- [ ] Fixed deposit investment management

8. Security
- [ ] Biometric authentication (Face ID, Fingerprint)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Session management (auto logout)
- [ ] Transaction PIN and OTP confirmation
- [ ] Secret Question
- [ ] Change password

9. Support
- [ ] In-app live chat
- [ ] Customer service contact options

## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.