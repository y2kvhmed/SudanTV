-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_lists CASCADE;
DROP TABLE IF EXISTS watch_history CASCADE;

-- User Lists Table
CREATE TABLE user_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Watch History Table
CREATE TABLE watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NULL,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, episode_id)
);

-- Enable RLS
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_lists
CREATE POLICY "Users can view their own lists" ON user_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their own lists" ON user_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own lists" ON user_lists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watch_history
CREATE POLICY "Users can view their own watch history" ON watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history" ON watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history" ON watch_history
  FOR UPDATE USING (auth.uid() = user_id);