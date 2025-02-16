/*
  # Initial Schema Setup for Garment Pricing Calculator

  1. New Tables
    - `quotations`
      - Primary table storing quotation metadata
      - Contains client information and general quotation data
    - `components`
      - Stores material components for each quotation
    - `developments`
      - Stores development costs and MOQ information

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  date timestamptz DEFAULT now(),
  client_name text NOT NULL,
  client_brand text,
  client_email text,
  client_our_ref text,
  client_ref text,
  client_description text,
  client_sample_size text,
  article_image text,
  quantities integer[] DEFAULT '{100, 250, 500}',
  margins integer[] DEFAULT '{30, 25, 20}',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  description text NOT NULL,
  supplier text,
  unit_price decimal(10,2) DEFAULT 0,
  consumption decimal(10,2) DEFAULT 0,
  has_moq boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create developments table
CREATE TABLE IF NOT EXISTS developments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  description text NOT NULL,
  supplier text,
  cost decimal(10,2) DEFAULT 0,
  is_from_moq boolean DEFAULT false,
  moq_quantity integer,
  include_in_subtotal boolean DEFAULT false,
  show_in_pdf boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE developments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own quotations"
  ON quotations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage components of their quotations"
  ON components
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE quotations.id = components.quotation_id
    AND quotations.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM quotations
    WHERE quotations.id = components.quotation_id
    AND quotations.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage developments of their quotations"
  ON developments
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE quotations.id = developments.quotation_id
    AND quotations.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM quotations
    WHERE quotations.id = developments.quotation_id
    AND quotations.user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_components_quotation_id ON components(quotation_id);
CREATE INDEX IF NOT EXISTS idx_developments_quotation_id ON developments(quotation_id);