CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_type VARCHAR(128) NOT NULL DEFAULT 'individual',
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  middle_name VARCHAR(128),
  email VARCHAR NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR NOT NULL,
  photo_url VARCHAR,
  address VARCHAR NOT NULL,
  business_name VARCHAR(255),
  pin VARCHAR(4),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  photo_verified BOOLEAN DEFAULT FALSE,
  business_verified BOOLEAN DEFAULT FALSE,
  address_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
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