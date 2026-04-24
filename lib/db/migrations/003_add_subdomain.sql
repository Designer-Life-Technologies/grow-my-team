-- Add subdomain column for storing subdomain prefix (e.g., "shr" for shr.applicant.growmy.team)
-- This is separate from custom_domain which stores the full domain

ALTER TABLE client_themes ADD COLUMN subdomain VARCHAR(100);
CREATE INDEX idx_subdomain ON client_themes(subdomain);
