/*
  # Update quotations schema to store all data in a single record

  1. Changes
    - Add new JSON columns to store components and developments data
    - Remove separate tables for components and developments
    - Update RLS policies

  2. Security
    - Enable RLS on quotations table
    - Add policies for authenticated users
*/

-- Add new columns to quotations
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS components jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS developments jsonb DEFAULT '[]'::jsonb;

-- Drop foreign key constraints
ALTER TABLE components DROP CONSTRAINT IF EXISTS components_quotation_id_fkey;
ALTER TABLE developments DROP CONSTRAINT IF EXISTS developments_quotation_id_fkey;

-- Drop old tables
DROP TABLE IF EXISTS components;
DROP TABLE IF EXISTS developments;

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert quotations"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update quotations"
  ON quotations FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete quotations"
  ON quotations FOR DELETE
  TO authenticated
  USING (true);