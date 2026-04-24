-- Rename client_themes to client_settings and add API endpoint column

-- Rename table
ALTER TABLE client_themes RENAME TO client_settings;

-- Add new columns
ALTER TABLE client_settings 
  ADD COLUMN gmt_api_endpoint VARCHAR(500),
  ADD COLUMN settings JSONB DEFAULT '{}';

-- Update indexes
DROP INDEX IF EXISTS idx_client_slug;
CREATE INDEX idx_client_settings_client_slug ON client_settings(client_slug);

DROP INDEX IF EXISTS idx_organisation_id;
CREATE INDEX idx_client_settings_organisation_id ON client_settings(organisation_id);

DROP INDEX IF EXISTS idx_custom_domain;
CREATE INDEX idx_client_settings_custom_domain ON client_settings(custom_domain);

DROP INDEX IF EXISTS idx_active;
CREATE INDEX idx_client_settings_active ON client_settings(is_active) WHERE is_active = true;

-- Update trigger
DROP TRIGGER IF EXISTS update_client_themes_updated_at ON client_settings;
CREATE TRIGGER update_client_settings_updated_at
  BEFORE UPDATE ON client_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update comments
COMMENT ON TABLE client_settings IS 'Stores white-label theme configurations and client-specific settings';
COMMENT ON COLUMN client_settings.gmt_api_endpoint IS 'Client-specific GetMe.video API endpoint (e.g., https://api-au.getme.video)';
COMMENT ON COLUMN client_settings.settings IS 'JSON for additional client-specific settings';
