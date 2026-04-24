-- Add logo_height column to client_settings table
-- This allows setting logo height with priority over width for better app bar fitting

ALTER TABLE client_settings ADD COLUMN logo_height INTEGER;

-- Update comment for logo_height
COMMENT ON COLUMN client_settings.logo_height IS 'Height of the logo in pixels. Takes priority over width for sizing. Used to fit logo in app bar with fixed height.';

-- Set default logo height for existing themes (50px is slightly smaller than 56px app bar)
UPDATE client_settings SET logo_height = 50 WHERE logo_height IS NULL;
