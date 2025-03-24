/*
  # Question limits and subscriptions schema

  1. New Tables
    - `user_questions`
      - Tracks daily question usage per user
      - Fields:
        - user_id (references auth.users)
        - date (daily tracking)
        - count (questions asked today)
    - `subscriptions`
      - Tracks user subscription status
      - Fields:
        - user_id (references auth.users)
        - status (active/inactive)
        - plan (free/premium)
        - valid_until (subscription end date)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create user_questions table
CREATE TABLE IF NOT EXISTS user_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create subscriptions table
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

-- Policies for user_questions
CREATE POLICY "Users can read their own question usage"
  ON user_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own question usage"
  ON user_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for subscriptions
CREATE POLICY "Users can read their own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to increment question count
CREATE OR REPLACE FUNCTION increment_question_count()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_questions (user_id, date, count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = user_questions.count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;