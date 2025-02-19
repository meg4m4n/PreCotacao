/*
  # Add clients table and update quotations

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `brand` (text)
      - `email` (text)
      - `our_ref` (text)
      - `client_ref` (text)
      - `description` (text)
      - `sample_size` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to quotations
    - Add `client_id` foreign key reference to clients table
    - Add `ref` column for reference number
    - Remove individual client fields

  3. Security
    - Enable RLS on clients table
    - Add policies for authenticated users
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  email text,
  our_ref text,
  client_ref text,
  description text,
  sample_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add client_id and ref to quotations
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id),
ADD COLUMN IF NOT EXISTS ref text;

-- Drop old client columns from quotations
ALTER TABLE quotations
DROP COLUMN IF EXISTS client_name,
DROP COLUMN IF EXISTS client_brand,
DROP COLUMN IF EXISTS client_email,
DROP COLUMN IF EXISTS client_our_ref,
DROP COLUMN IF EXISTS client_ref,
DROP COLUMN IF EXISTS client_description,
DROP COLUMN IF EXISTS client_sample_size;

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_client_id ON quotations(client_id);