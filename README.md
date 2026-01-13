# Bun Mobile Banking

A mobile banking application built with [Elysia](https://elysia.dev).
User type includes individual and business.

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

## Development

To start the development server run:

```bash
bun run dev
```

### OpenAPI Documentation

Open <http://localhost:3000/openapi> to see OpenAPI documentation.

### Tunnel With [Localhost.run](https://localhost.run/docs)

Free tunnel for connecting your localhost apps to the internet e.g webhooks, or other web apps or share with trusted users to test your app.

- domain: <https://5ea7d840767aef.lhr.life>
- connection id is cf157c20-ed53-4e57-b692-0d1c68b57901
- RSA key fingerprint is:
SHA256:FV8IMJ4IYjYUTnd6on7PqbRjaZf4c1EhhEBgeUdE94I

> create an account and add your key for a longer lasting domain name.
> see https://localhost.run/docs/forever-free/ for more information.

To create a tunnel to your localhost, run:

```bash
bun run tunnel
```

### Mono External API

We use Mono's external API to get user's bank account details and to link the account to the user's profile.

To test Mono Connect using the connect SDK for authorization code and exchange for account ID, run:

```bash
bun run mono:connect
```

> To get the Mono API key, visit [Mono](https://mono.co/).

> Check the [`script`](package.json#L6) field in [package.json](package.json) for more commands.

### File Storage

In development, the file storage is managed with [garage](https://garagehq.deuxfleurs.fr/), a rust based self-host AWS S3 compatible container image. The garage config file is in [storage/garage.toml](storage/garage.toml) along with the data and metadata in the [storage/data](storage/data) and [storage/meta](storage/meta) directories.

To run garage, use the following command:

```bash
podman run \
  -d \
  --name garaged \
  -p 3900:3900 -p 3901:3901 -p 3902:3902 -p 3903:3903 \
  -v ./storage/garage.toml:/etc/garage.toml \
  -v ./storage/meta:/var/lib/garage/meta \
  -v ./storage/data:/var/lib/garage/data \
  dxflrs/garage:v2.1.0
```

> Note: You don't have to run the single command above. You can use the [scripts/app-pod.sh](scripts/app-pod.sh) script to run the garage container along with the app pod. Example:

```bash
./scripts/app-pod.sh .env.development
# OR run script from package.json
bun run pod:app .env.development
```

> Note: For further configuration(layout, bucket, etc.) visit [garage docs](https://garagehq.deuxfleurs.fr/documentation/quick-start/).

In production this will be replaced with AWS S3, Cloudflare R2, or any other AWS S3 compatible storage.

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

## Reference

- [Mono](https://mono.co/) - Identity Verification, Financial Data, etc.
- [Garage](https://garagehq.deuxfleurs.fr/) - Local File Storage
