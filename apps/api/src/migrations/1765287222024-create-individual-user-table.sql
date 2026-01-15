CREATE TABLE IF NOT EXISTS individual_users (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  user_type VARCHAR(128) NOT NULL DEFAULT 'individual',
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  pin_hash VARCHAR,
  mfa_enabled BOOLEAN DEFAULT FALSE,
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