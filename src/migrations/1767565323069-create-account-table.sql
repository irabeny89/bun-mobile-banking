CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    individual_user_id UUID REFERENCES individual_users(id) ON DELETE CASCADE,
    mono_account_id VARCHAR(255) NOT NULL,
    mono_customer_id VARCHAR(255) NOT NULL,
    mono_reference VARCHAR(255) NOT NULL,
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
BEFORE UPDATE ON accounts
FOR EACH ROW
EXECUTE FUNCTION set_update_timestamp();

CREATE INDEX IF NOT EXISTS idx_account_created_at ON accounts(created_at);
CREATE INDEX IF NOT EXISTS idx_account_mono_account_id ON accounts(mono_account_id);
