-- Dynamic Themes Database Schema
-- For Vercel Postgres (Neon)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Client themes table
CREATE TABLE IF NOT EXISTS client_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  organisation_id VARCHAR(255),
  custom_domain VARCHAR(255) UNIQUE,
  colors JSONB NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  website TEXT,
  supports_dark_mode BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_client_slug ON client_themes(client_slug);
CREATE INDEX IF NOT EXISTS idx_organisation_id ON client_themes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_custom_domain ON client_themes(custom_domain);
CREATE INDEX IF NOT EXISTS idx_active ON client_themes(is_active) WHERE is_active = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate (idempotent approach)
DROP TRIGGER IF EXISTS update_client_themes_updated_at ON client_themes;
CREATE TRIGGER update_client_themes_updated_at
  BEFORE UPDATE ON client_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE client_themes IS 'Stores white-label theme configurations for clients';
COMMENT ON COLUMN client_themes.client_slug IS 'URL-friendly identifier used as subdomain (e.g., virgin-active)';
COMMENT ON COLUMN client_themes.organisation_id IS 'GetMe.video API organisation ID for tenant data isolation';
COMMENT ON COLUMN client_themes.custom_domain IS 'Future: custom domain for white-label (e.g., careers.virginactive.com)';
COMMENT ON COLUMN client_themes.colors IS 'JSON containing light and dark mode color palettes';
