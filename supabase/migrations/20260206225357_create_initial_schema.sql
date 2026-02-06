/*
  # UOttaLive Initial Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `description` (text, bio)
      - `profile_picture` (text, URL)
      - `group_id` (uuid, references groups)
      - `is_landlord` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `groups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references profiles)
    
    - `listings`
      - `id` (uuid, primary key)
      - `landlord_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `address` (text)
      - `price` (numeric)
      - `bedrooms` (integer)
      - `bathrooms` (numeric)
      - `is_on_campus` (boolean)
      - `gender_preference` (text: 'any', 'male', 'female')
      - `rental_type` (text: 'apartment', 'house', 'room', 'basement', 'floor')
      - `is_verified` (boolean)
      - `image_urls` (text array)
      - `amenities` (text array)
      - `available_from` (date)
      - `lease_duration` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `applications`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, references listings)
      - `applicant_id` (uuid, references profiles)
      - `group_id` (uuid, nullable, references groups)
      - `status` (text: 'pending', 'accepted', 'rejected')
      - `message` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for landlords to manage their listings
    - Add policies for viewing public listing data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text DEFAULT '',
  description text DEFAULT '',
  profile_picture text DEFAULT '',
  group_id uuid,
  is_landlord boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Housing Group',
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  address text NOT NULL,
  price numeric NOT NULL,
  bedrooms integer NOT NULL DEFAULT 1,
  bathrooms numeric NOT NULL DEFAULT 1,
  is_on_campus boolean DEFAULT false,
  gender_preference text DEFAULT 'any',
  rental_type text NOT NULL,
  is_verified boolean DEFAULT false,
  image_urls text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  available_from date DEFAULT CURRENT_DATE,
  lease_duration text DEFAULT '12 months',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for group_id in profiles
ALTER TABLE profiles ADD CONSTRAINT profiles_group_id_fkey 
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON profiles(group_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_landlord ON profiles(is_landlord);
CREATE INDEX IF NOT EXISTS idx_listings_landlord_id ON listings(landlord_id);
CREATE INDEX IF NOT EXISTS idx_applications_listing_id ON applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_group_id ON applications(group_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Groups policies
CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT group_id FROM profiles WHERE id = auth.uid())
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Listings policies
CREATE POLICY "Anyone can view verified listings"
  ON listings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Landlords can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (
    landlord_id = auth.uid() 
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_landlord = true)
  );

CREATE POLICY "Landlords can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (landlord_id = auth.uid())
  WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Landlords can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (landlord_id = auth.uid());

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = applications.listing_id 
      AND listings.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Students can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid())
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Landlords can update applications for their listings"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = applications.listing_id 
      AND listings.landlord_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = applications.listing_id 
      AND listings.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own applications"
  ON applications FOR DELETE
  TO authenticated
  USING (applicant_id = auth.uid());