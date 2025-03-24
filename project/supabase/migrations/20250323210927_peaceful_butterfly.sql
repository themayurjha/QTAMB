/*
  # Question limits and subscriptions schema update

  1. Tables
    - Ensures user_questions and subscriptions tables exist
    - Adds proper constraints and defaults
  
  2. Security
    - Enables RLS on both tables
    - Adds policies for user access
    - Creates function for incrementing question count

  Note: Includes checks to prevent duplicate policy creation
*/

-- Create user_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  status text DEFAULT 'inactive',
  plan text DEFAULT 'free',
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
  -- Check and create user_questions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_questions' 
    AND policyname = 'Users can read their own question usage'
  ) THEN
    CREATE POLICY "Users can read their own question usage"
      ON user_questions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_questions' 
    AND policyname = 'Users can insert their own question usage'
  ) THEN
    CREATE POLICY "Users can insert their own question usage"
      ON user_questions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_questions' 
    AND policyname = 'Users can update their own question usage'
  ) THEN
    CREATE POLICY "Users can update their own question usage"
      ON user_questions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check and create subscriptions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscriptions' 
    AND policyname = 'Users can read their own subscription'
  ) THEN
    CREATE POLICY "Users can read their own subscription"
      ON subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Function to increment question count
CREATE OR REPLACE FUNCTION increment_question_count()
RETURNS integer AS $$
DECLARE
  current_count integer;
BEGIN
  INSERT INTO user_questions (user_id, date, count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = user_questions.count + 1
  RETURNING count INTO current_count;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;