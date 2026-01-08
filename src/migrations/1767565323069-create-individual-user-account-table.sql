CREATE TABLE IF NOT EXISTS individual_accounts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID REFERENCES individual_users(id) ON DELETE CASCADE,
    account_number VARCHAR(20),
    account_name VARCHAR(100),
    account_type VARCHAR(30),
    currency VARCHAR(10),
    balance BIGINT,
    institution_id VARCHAR(30),
    institution_auth_method VARCHAR(25),
    institution_name VARCHAR(100),
    institution_bank_code VARCHAR(20),
    institution_type VARCHAR(30),
    mono_account_id VARCHAR(30) NOT NULL,
    mono_customer_id VARCHAR(30) NOT NULL,
    mono_reference VARCHAR(10) NOT NULL,
    mono_reauthorize BOOLEAN NOT NULL DEFAULT FALSE,
    mono_data_status VARCHAR(15),
    mfa BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER account_set_updated_at
BEFORE UPDATE ON individual_accounts
FOR EACH ROW
EXECUTE FUNCTION set_update_timestamp();

CREATE INDEX IF NOT EXISTS idx_account_created_at ON individual_accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_account_mono_account_id ON individual_accounts(mono_account_id);
