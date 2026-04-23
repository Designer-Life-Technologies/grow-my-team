-- Add logo_width column to client_themes table
ALTER TABLE client_themes ADD COLUMN logo_width INTEGER DEFAULT 110;
COMMENT ON COLUMN client_themes.logo_width IS 'Logo width in pixels for branding';
