-- Drop subdomain column since we'll use client_slug for subdomain matching
DROP INDEX IF EXISTS idx_subdomain;
ALTER TABLE client_themes DROP COLUMN IF EXISTS subdomain;
