CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_type VARCHAR(128) NOT NULL,
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  middle_name VARCHAR(128),
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  dob DATE,
  gender VARCHAR(2),
  bvn VARCHAR(11) UNIQUE,
  nin VARCHAR(11) UNIQUE,
  govt_id VARCHAR(128) UNIQUE,
  tin VARCHAR UNIQUE,
  password VARCHAR NOT NULL,
  photo_id VARCHAR,
  kyc_tier VARCHAR(10),
  kyc_status VARCHAR(128),
  pin VARCHAR(4),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  business_name VARCHAR(256),
  business_date DATE,
  business_type VARCHAR(128),
  business_industry VARCHAR,
  business_cac VARCHAR,
  business_tin VARCHAR,
  kyb_status VARCHAR(128),
  refresh_token VARCHAR NOT NULL,
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

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_update_timestamp();

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);