# KYC (Know Your Customer) Tiers

KYC (Know Your Customer) tiers are a risk-based approach that financial institutions use to verify customer identity and determine the appropriate level of scrutiny. 

This tiered system aligns with global Anti-Money Laundering (AML) and Counter-Terrorism Financing (CFT) guidelines set by the Financial Action Task Force (FATF), allowing for simplified due diligence in low-risk scenarios and enhanced due diligence for high-risk customers. 

Customers are typically assigned to tiers based on the information they provide, with each tier having specific transaction limits and verification requirements. 

## Common KYC Tiers and Requirements

While specific names and requirements may vary by institution and country (such as the Central Bank of Nigeria's (CBN) three-tiered system), the general structure involves progressive levels of verification: 

### Tier 1 (Basic/Low-Risk Accounts): This is the entry-level tier designed for financial inclusion, allowing customers to open basic accounts with minimal initial documentation.

**Requirements**: Basic personal information such as full name, gender, date of birth, address, and a passport photo. In some regions, a Bank Verification Number (BVN) or National Identification Number (NIN) might be required at this stage.

**Limits**: Accounts at this level typically have restrictions on maximum available balances, single deposit amounts, and cumulative daily transactions.

### Tier 2 (Medium-Risk Accounts): To access higher transaction limits, customers must provide more robust identification.

**Requirements**: Submission and verification of a government-issued identification document, such as an international passport, driver's license, or national ID card.

**Limits**: Limits on balances and transactions are significantly increased compared to Tier 1.

### Tier 3 (High-Risk/High-Value Accounts): This is the highest level of verification, involving extensive due diligence for high-value transactions or politically exposed persons (PEPs).

**Requirements**: A valid ID, proof of address (e.g., a utility bill or bank statement), and potentially biometrics or a "liveliness check" to confirm real-time presence and prevent fraud. Verification of the source of funds or wealth may also be required.

**Limits**: These accounts often have no maximum balance limits and much higher transaction thresholds. 

## Why Tiers are Used

The tiered approach is a practical way for financial institutions to:

- Promote financial inclusion: It makes it easier for unbanked individuals who may lack formal documentation to access basic financial services.
- Manage risk effectively: It applies scrutiny appropriate to the risk level, ensuring high-risk activities receive Enhanced Due Diligence (EDD) while low-risk ones benefit from Simplified Due Diligence (SDD).
- Comply with regulations: It helps institutions meet legal requirements for monitoring suspicious transactions and preventing financial crimes. 

If a customer's account activity exceeds the limits of their current tier, their account may be frozen or blocked until they provide the necessary documentation to upgrade their KYC level. 

## Building a mobile banking app in Nigeria

In Nigeria, building a mobile banking app requires adhering strictly to the Central Bank of Nigeria (CBN) regulations. KYC for individuals is managed via the BVN/NIN system, and KYB for businesses focuses on the CAC registration system. Both rely heavily on integrating with RegTech aggregators via APIs.

### Part 1: Performing KYC for Individual Users
The process for individuals is a tiered approach, starting with basic identity collection and escalating to verification using national identifiers.

#### A. Data Collection (Mobile App Inputs)
Your mobile app UI must capture the following required inputs:
Full Legal Name
Date of Birth
Gender
Phone Number
Residential Address
Passport Photograph
Bank Verification Number (BVN)
National Identity Number (NIN)

#### B. Verification Process (Backend & RegTech Aggregator)
The backend uses a RegTech aggregator (e.g., Paystack, Mono, Identitypass) to verify the data against NIBSS records:
Backend Call: Your Node.js backend sends the BVN, fullName, and dateOfBirth to the aggregator's API endpoint.
Aggregator Verification: The aggregator communicates with NIBSS/NIMC databases.
Status Confirmation:
Success: The API returns a successful match. The user can be moved to KYC Tier 2 or 3.
Failure/Mismatch: The user is restricted to KYC Tier 1 limits (₦100,000 daily limit) until corrected or manually reviewed.
Proof of Address (for Tier 3): The user uploads a utility bill or bank statement, which is reviewed (either manually or using an automated document verification service) to unlock unlimited transactions.

### Part 2: Performing KYB for Business Users
KYB for businesses focuses on verifying the entity's legal standing with the Corporate Affairs Commission (CAC) and confirming the identity of its owners.

#### A. Data Collection (Mobile App Inputs)
The app needs specific inputs regarding the business structure:
Legal Business Name
CAC Registration Number
Business TIN (Tax Identification Number)
Business Type (LTD, Enterprise, etc.)
Registered Address
List of all Ultimate Beneficial Owners (UBOs) and Directors.

#### B. Verification Process (Backend & RegTech Aggregator)
The backend workflow involves two main verification steps:
Business Verification (CAC Lookup):
Your backend sends the CAC Registration Number and Legal Business Name to the aggregator's KYB API.
The aggregator verifies the business registration status and returns official data (e.g., active status, date of incorporation).
The backend confirms the business is legitimate and active.
UBO/Director Verification (Individual KYC Check):
For every director or UBO listed (typically those owning 25% or more, as per CBN rules), you must run a standard individual KYC check.
You collect their personal BVN via the app and verify it using the same process described in Part 1.

#### C. Final Status
Once both the business entity is verified and all associated UBOs have their BVNs confirmed, the business user is onboarded and gains full access to business banking services.

## Transaction Limits By KYC Tier

The transaction limits for KYC tiers in Nigeria are fixed standards set by the Central Bank of Nigeria (CBN), not individual banking apps.

Financial institutions must adhere to these caps to comply with Anti-Money Laundering (AML) and financial inclusion regulations.

The limits are designed to align the level of risk with the required identification documentation. Exceeding these limits typically results in the account being frozen (placed on "Post No Debit") until the customer provides the necessary documentation to upgrade their tier. 

### CBN Mandated Limits
These are the maximum allowed limits that all Nigerian banking apps must enforce (Note: some specific mobile money circulars have slightly different sub-limits, but these are the general banking limits):

| Tier 	| Maximum Single Deposit Amount	| Maximum Daily Cumulative Transaction Limit	| Maximum Cumulative Account Balance |
|---	|---	|---	|--- |
| Tier 1 (Low Value)	| ₦50,000	| ₦100,000	| ₦300,000 |
| Tier 2 (Medium Value)	| ₦100,000	| ₦500,000	| No specific limit mentioned in recent documents |
| Tier 3 (High Value)	| No Limit	| No Limit	| No Limit |

> ### Important Note: Banking apps can choose to implement stricter internal limits if they have a lower risk appetite, but they cannot exceed the CBN's mandated maximums. 