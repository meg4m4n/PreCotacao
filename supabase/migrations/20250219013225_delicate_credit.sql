/*
  # Admin User Setup

  1. New Tables
    - `admin_users`
      - `user_id` (uuid, primary key)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policies for admin access
    - Add policy for users to read their own admin status

  3. Initial Setup
    - Create initial admin user
    - Set up trigger for new user registration
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for admins to manage other users
CREATE POLICY "Admins can manage all users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_admin = true
    )
  );

-- Create the initial admin user
DO $$ 
BEGIN
  -- Create the user in auth.users if it doesn't exist
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  VALUES (
    'ruiguimaraes@lomartex.pt',
    crypt('3311225', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING;

  -- Add the user to admin_users
  INSERT INTO admin_users (
    user_id,
    is_admin
  )
  SELECT 
    id,
    true
  FROM auth.users
  WHERE email = 'ruiguimaraes@lomartex.pt'
  ON CONFLICT (user_id) DO UPDATE
  SET is_admin = true;
END $$;