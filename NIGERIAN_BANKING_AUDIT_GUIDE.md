# Comprehensive Guide to Auditing a Nigerian Banking App

This guide outlines the critical steps, regulatory frameworks, and technical checks required to audit a mobile banking application operating within Nigeria. It ensures compliance with Central Bank of Nigeria (CBN) directives, Nigeria Data Protection Act (NDPA), and international best practices.

## 1. Regulatory Compliance Framework

A Nigerian banking app must adhere to strict guidelines. The audit must verify compliance with:

* **CBN Guidelines on Mobile Money Services in Nigeria**: Rules for mobile money operators and transaction limits.
* **CBN Risk-Based Cybersecurity Framework and Guidelines for Deposit Money Banks and Payment Service Providers**: Mandatory cybersecurity controls.
* **Nigeria Data Protection Act (NDPA) / NDPR**: Requirements for data sovereignty, user consent, and privacy rights.
* **AML/CFT Regulations**: Anti-Money Laundering and Combating the Financing of Terrorism checks (NFIU reporting).
* **PCI DSS**: If card data is processed or stored.

## 2. Know Your Customer (KYC) & Identity Management Audit

Verify that the app enforces the CBN-mandated tiered KYC structure correctly.

### Audit Checkpoints

* **Tier 1 (Low Level)**:
  * Check if account opening requires at least a passport photograph and Name/Phone number.
  * *Verify limits*: Ensure daily transaction and balance limits are enforced (e.g., N50,000 single deposit limit, N300,000 cumulative balance - *subject to current CBN circulars*).
* **Tier 2 (Medium Level)**:
  * Check for BVN (Bank Verification Number) and/or NIN (National Identity Number) verification.
  * Verify integration with NIBSS for BVN validation.
* **Tier 3 (High Level)**:
  * Check for government-issued ID (Int'l Passport, Drivers License, Voters Card) and Proof of Address.
  * Verify "Liveness Checks" are implemented to prevent spoofing during selfie verification.
* **Sanctions Screening**: Ensure users are screened against politically exposed persons (PEP) and watchlists during onboarding.

## 3. Transaction Integrity & financial Audits

Ensure that money is moved securely and accurately recorded.

### Audit Checkpoints

* **Transaction Limits**: Test that users cannot exceed their KYC tier limits for daily transfers and account balances.
* **Double Spending**: Attempt race conditions to see if funds can be spent twice.
* **NIP/NIBSS Integration**: Verify that transfer status codes (successful, pending, failed) are accurately reflected and reconciled.
* **Reversal Handling**: specific audit of the "auto-reversal" mechanism for failed transactions.
* **Ledger Integrity**: Validate that `Debit User` and `Credit Beneficiary` happen atomically (Database Transactions).

## 4. Security & Authentication Audit (VAPT)

Perform Vulnerability Assessment and Penetration Testing.

### Audit Checkpoints

* **Device Binding**: Confirm the app binds the user's session to a specific device ID to prevent unauthorized access from other devices.
* **MFA (Multi-Factor Authentication)**: Ensure MFA (OTP, Token, Biometrics) is mandatory for:
  * Login (on new devices).
  * Transactions above a certain threshold.
  * Password/PIN changes.
* **Session Management**:
  * Verify auto-logout after inactivity (e.g., 5-10 minutes).
  * Check if concurrent sessions are handled correctly (or blocked).
* **App Shielding**: Check for root/jailbreak detection and SSL Pinning to prevent Man-in-the-Middle (MitM) attacks.
* **Input Validation**: Test for SQL Injection (SQLi) and Cross-Site Scripting (XSS) in input fields (e.g., transaction narration).

## 5. Data Privacy & Audit Logs (NDPA/NDPR)

The app must protect user data and maintain a trail of all actions.

### Audit Checkpoints

* **Data Residency**: Ensure critical user data is hosted within Nigeria or in jurisdictions with adequate data protection laws as per NDPA.
* **In-Transit Encryption**: All traffic must use TLS 1.2 or 1.3.
* **At-Rest Encryption**: Sensitive columns (BVN, PIN logs, Balances) must be encrypted in the database.
* **Audit Trails**:
  * Check the `audit_logs` table.
  * Ensure NO SENSITIVE DATA (PINs, Passwords, Full Card Numbers) is written to logs.
  * Verify that `admin` actions (viewing user details, freezing accounts) are logged with a timestamp and IP address.

## 6. Operational & Infrastructure Audit

### Audit Checkpoints

* **Disaster Recovery (DR)**: Verify the existence of a backup site and test failover procedures.
* **Third-Party APIs**: Audit integrations (e.g., Mono, Paystack, Dojah). Ensure API keys are rotated and stored in secure vaults (not hardcoded).
* **Change Management**: Review the process for deploying code updates. Modifications to financial logic must require dual approval.

## 7. Reporting

The audit report should include:

1. **Executive Summary**: High-level risk overview.
2. **Compliance Matrix**: Status against CBN/NDPR requirements (Compliant/Non-Compliant/Partial).
3. **Vulnerability Findings**: Critical/High/Medium/Low security issues.
4. **Remediation Plan**: Recommended fixes and timelines.
