-- Add passport_filename field to partners table
ALTER TABLE partners ADD COLUMN passport_filename VARCHAR(255) NULL AFTER nid_filename;
