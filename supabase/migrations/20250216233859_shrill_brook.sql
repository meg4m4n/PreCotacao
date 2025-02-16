/*
  # Remove authentication and update quotations schema

  1. Changes
    - Remove user_id from quotations table
    - Remove RLS policies
    - Update foreign key constraints
*/

-- Remove user_id from quotations
ALTER TABLE quotations DROP COLUMN IF EXISTS user_id;

-- Disable RLS on all tables
ALTER TABLE quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE components DISABLE ROW LEVEL SECURITY;
ALTER TABLE developments DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can manage components of their quotations" ON components;
DROP POLICY IF EXISTS "Users can manage developments of their quotations" ON developments;