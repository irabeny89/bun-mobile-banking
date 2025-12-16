CREATE TABLE IF NOT EXISTS business_users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_type VARCHAR(128) NOT NULL DEFAULT 'business',
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  phone VARCHAR(20) UNIQUE,
  street VARCHAR,
  city VARCHAR(128),
  state VARCHAR(128),
  country VARCHAR(128),
  address_proof VARCHAR,
  bvn VARCHAR(11) UNIQUE,
  nin VARCHAR(11) UNIQUE,
  govt_id VARCHAR(128) UNIQUE,
  tin VARCHAR UNIQUE,
  pin VARCHAR,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  name VARCHAR(256),
  date DATE,
  type VARCHAR(128),
  industry VARCHAR,
  cac VARCHAR,
  tin VARCHAR,
  kyb_status VARCHAR(128),
  address_verified BOOLEAN DEFAULT FALSE,
  name_verified BOOLEAN DEFAULT FALSE,
  date_verified BOOLEAN DEFAULT FALSE,
  type_verified BOOLEAN DEFAULT FALSE,
  industry_verified BOOLEAN DEFAULT FALSE,
  cac_verified BOOLEAN DEFAULT FALSE,
  tin_verified BOOLEAN DEFAULT FALSE,
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

CREATE TRIGGER business_users_set_updated_at
BEFORE UPDATE ON business_users
FOR EACH ROW
EXECUTE FUNCTION set_update_timestamp();

CREATE INDEX IF NOT EXISTS idx_business_users_created_at ON business_users(created_at);