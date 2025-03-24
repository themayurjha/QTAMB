/*
  # Create web stories table

  1. New Tables
    - `web_stories`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `slug` (text, unique)
      - `published_at` (timestamp with time zone)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `web_stories` table
    - Add policy for public read access
    - Add policy for authenticated users to create stories
*/

CREATE TABLE IF NOT EXISTS web_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  slug text UNIQUE NOT NULL,
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE web_stories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read web stories"
  ON web_stories
  FOR SELECT
  TO public
  USING (true);

-- Only authenticated users can create stories
CREATE POLICY "Authenticated users can create web stories"
  ON web_stories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);