# Fluxus Mobile Banking

A mobile banking application built with [Elysia](https://elysia.dev).
User type includes individual and business.

## Features

### 1. User Onboarding

User Type: Individual - KYC

- [ ] User registration (NIN/Bank verification)
- [ ] KYC compliance (photo ID, address verification, etc.)
- [ ] OTP and email/mobile verification

User Type: Business - KYB

- [ ] Documents upload

### 2. Account Management

- [ ] Dashboard overview
- [ ] View account balances
- [ ] View transaction history
- [ ] Statement generation (PDF/email)

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
- [ ] 2FA (Two-Factor Authentication)
- [ ] Session management (auto logout)
- [ ] Transaction PIN and OTP confirmation
- [ ] Secret Question
- [ ] Change password

### 9. Support

- [ ] In-app live chat
- [ ] Customer service contact options

## Development

To start the development server run:

```bash
bun run dev
```

Open <http://localhost:3000/> with your browser to see the result.
Query `/openapi` endpoint to see OpenAPI documentation.

### Database Migrations

There are scripts to run migrations. Follow the steps below:

1. Create a new migration file by running [scripts/create-migration-file.ts](scripts/create-migration-file.ts).
2. Add migration SQL in the new file in [src/migrations](src/migrations/).
3. Run the migration file with [scripts/sqlmig8.ts](scripts/sqlmig8.ts)
4. Or if a folder exists with migration SQL files (in [`src/migrations`](src/migrations/)) then run bulk migrations with [scripts/sqlmig8.ts](scripts/sqlmig8.ts)

Commands:

```sh
# step 1: src/migrations/[timestamp]-[suffix]
bun mig8:new create-user-table.sql # 123456789-create-user-table.sql
# step 2: add migration SQL in the created file in src/migrations
echo "CREATE TABLE USER username, password VALUES ('Hope', 'King')" > src/migrations/123456789-create-user-table.sql
# step 3: run the migration file
bun mig8:file src/migrations/123456789-create-user-table.sql
# step 4: OR IF there is an existing folder with sql migration files
bun mig8:dir src/migrations
```
