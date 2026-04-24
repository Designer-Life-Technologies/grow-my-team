-- Remove logo_width and logo_height columns
-- Add logo_scale column for simplified scaling

ALTER TABLE client_settings DROP COLUMN IF EXISTS logo_width;
ALTER TABLE client_settings DROP COLUMN IF EXISTS logo_height;

-- Add logo_scale column
ALTER TABLE client_settings ADD COLUMN logo_scale NUMERIC(3,2) DEFAULT 1.0;

-- Update comment for logo_scale
COMMENT ON COLUMN client_settings.logo_scale IS 'Scale factor for logo height. Base height is 50px, final height = 50px * scale. Default 1.0 = 50px.';

-- Set default scale for existing themes
UPDATE client_settings SET logo_scale = 1.0 WHERE logo_scale IS NULL;
