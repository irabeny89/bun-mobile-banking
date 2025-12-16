CREATE TABLE IF NOT EXISTS individual_users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_type VARCHAR(128) NOT NULL DEFAULT 'individual',
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  password_hash VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  middle_name VARCHAR(128),
  phone VARCHAR(20) UNIQUE,
  street VARCHAR(256),
  city VARCHAR(128),
  state VARCHAR(128),
  country VARCHAR(128),
  address_proof VARCHAR,
  dob DATE,
  gender VARCHAR(1) NOT NULL,
  bvn VARCHAR(11) UNIQUE,
  nin VARCHAR(11) UNIQUE,
  govt_id VARCHAR(128) UNIQUE,
  tin VARCHAR UNIQUE,
  photo_id VARCHAR,
  pin_hash VARCHAR,
  kyc_tier VARCHAR(50),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  photo_verified BOOLEAN DEFAULT FALSE,
  tin_verified BOOLEAN DEFAULT FALSE,
  bvn_verified BOOLEAN DEFAULT FALSE,
  dob_verified BOOLEAN DEFAULT FALSE,
  nin_verified BOOLEAN DEFAULT FALSE,
  govt_id_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  middle_name_verified BOOLEAN DEFAULT FALSE,
  first_name_verified BOOLEAN DEFAULT FALSE,
  last_name_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  address_verified BOOLEAN DEFAULT FALSE,
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

CREATE TRIGGER individual_users_set_updated_at
BEFORE UPDATE ON individual_users
FOR EACH ROW
EXECUTE FUNCTION set_update_timestamp();

CREATE INDEX IF NOT EXISTS idx_individual_users_email ON individual_users(email);
CREATE INDEX IF NOT EXISTS idx_individual_users_created_at ON individual_users(created_at);