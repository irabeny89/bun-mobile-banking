# AUDIT LOG

In a banking application for 2026, audit logging is essential for security forensics, regulatory compliance (such as PCI DSS 4.0, GDPR, and the EU AI Act), and dispute resolution. A comprehensive audit log must answer who did `what, when, where, and the outcome`.

## 1. Financial Transactions

Every movement of funds must be documented in a transaction audit trail:

- **Transaction Lifecycle**: Log initiation, authorization, multi-factor verification, settlement, and completion status.
- **Core Details**: Record transaction amount, currency, sender/receiver account numbers, and transaction method (e.g., online, in-branch).
- **Corrections**: All modifications, reversals, refunds, or cancellations must be permanently logged.

## 2. Authentication & Session Management

Monitoring how users enter and stay in the system is critical for preventing unauthorized access:

- **Access Events**: Log all successful and failed login attempts, logouts, and attempts to access restricted areas.
- **Credential Changes**: Record password resets, modifications to authentication factors (like MFA changes), and account lockouts.
- **Session Data**: Capture the originating IP address, device information, and geographic location for every login.

## 3. Data & Account Modifications

Changes to critical information must be traceable to ensure data integrity:

- **Account Profiles**: Log updates to customer personal information (e.g., address, phone number), beneficiary additions, or role/permission changes.
- **State Changes**: Capture "before and after" states of modified records, such as account balance changes or interest rate adjustments.
- **Administrative Actions**: Every action taken by high-privilege accounts (admins, support staff) must be meticulously logged, including rationale for critical changes.

## 4. Security & Compliance Events

Logs must support anti-fraud and anti-money laundering (AML) efforts:

- **Compliance Procedures**: Document identity verification steps (KYC), suspicious activity report (SAR) triggers, and watch list screenings.
- **System Integrity**: Log starting, stopping, or pausing of logging services, as well as any failures in security controls.
- **AI Governance (2026 Mandate)**: Under the EU AI Act, banks must maintain audit trails for high-risk AI models (like credit scoring), including training data provenance and why specific decisions were made.

## 5. What NOT to Log (Data Minimization)

To remain compliant with privacy laws like GDPR, sensitive data must be protected within the logs:

- **Secrets**: Never log plain-text passwords, security tokens, or API keys.
- **Sensitive Data**: Truncate or mask raw cardholder data (e.g., full PAN) or personal identifiers not essential for the audit trail.

## Logging Requirements for 2026

- **Immutability**: Use Write-Once, Read-Many (WORM) storage or blockchain-based solutions to prevent log tampering.
- **Retention**: PCI DSS 4.0 mandates logs be kept for at least 12 months, with the last 3 months immediately searchable.
- **Time Sync**: All systems must use synchronized clocks (preferably UTC) to ensure forensic timelines are accurate.
