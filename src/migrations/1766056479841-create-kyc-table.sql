CREATE TABLE IF NOT EXISTS kyc (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES individual_users(id) ON DELETE CASCADE,
    current_tier VARCHAR(20) DEFAULT 'tier_1',
    tier1_status VARCHAR(20) DEFAULT 'pending',
    tier2_status VARCHAR(20) DEFAULT 'pending',
    tier3_status VARCHAR(20) DEFAULT 'pending',
    tier1_data BYTEA NOT NULL,
    tier2_data BYTEA DEFAULT NULL,
    tier3_data BYTEA DEFAULT NULL,
    nin_hash VARCHAR(255) UNIQUE NOT NULL,
    bvn_hash VARCHAR(255) UNIQUE DEFAULT NULL,
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

CREATE TRIGGER kyc_set_updated_at
BEFORE UPDATE ON kyc
FOR EACH ROW
EXECUTE FUNCTION set_update_timestamp();

CREATE INDEX IF NOT EXISTS idx_kyc_created_at ON kyc(created_at);
