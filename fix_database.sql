-- Drop existing tables if they exist
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS watch_history CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS content CASCADE;

-- Create content table
CREATE TABLE content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'show')),
  genre TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  video_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_new_release BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasons table with proper foreign key
CREATE TABLE seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create episodes table with proper foreign key
CREATE TABLE episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user favorites table
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Create watch history table
CREATE TABLE watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  progress FLOAT DEFAULT 0,
  duration INTEGER,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, episode_id)
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON content FOR SELECT USING (true);
CREATE POLICY "Public read access" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read access" ON episodes FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Users can manage their favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can manage their watch history" ON watch_history FOR ALL USING (auth.uid() = user_id::uuid);

-- Admin policies (replace with actual admin user ID)
CREATE POLICY "Admin full access content" ON content FOR ALL USING (true);
CREATE POLICY "Admin full access seasons" ON seasons FOR ALL USING (true);
CREATE POLICY "Admin full access episodes" ON episodes FOR ALL USING (true);