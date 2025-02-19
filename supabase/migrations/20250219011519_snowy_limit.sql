/*
  # Add language column to quotations table

  1. Changes
    - Add language column to quotations table with default value 'pt'
*/

-- Add language column with default value
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'pt';

-- Update database types
ALTER TABLE quotations 
ALTER COLUMN language SET NOT NULL;