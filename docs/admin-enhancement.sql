-- Admin enhancement SQL for full content management functionality

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_series_content_id ON series(content_id);
CREATE INDEX IF NOT EXISTS idx_seasons_series_id ON seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON episodes(season_id);

-- Update RLS policies to allow admin full access
DROP POLICY IF EXISTS "Admins can manage content" ON content;
DROP POLICY IF EXISTS "Admins can manage episodes" ON episodes;

-- Create comprehensive admin policies
CREATE POLICY "Admins can manage all content" ON content FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Admins can manage all episodes" ON episodes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

-- Add RLS policies for series and seasons tables
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view series" ON series FOR SELECT USING (true);
CREATE POLICY "Admins can manage series" ON series FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Anyone can view seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Admins can manage seasons" ON seasons FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

-- Add RLS policies for categories and genres (admin management)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Anyone can view genres" ON genres FOR SELECT USING (true);
CREATE POLICY "Admins can manage genres" ON genres FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

-- Function to automatically create series entry when series content is added
CREATE OR REPLACE FUNCTION create_series_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'series' THEN
    INSERT INTO series (content_id, total_seasons, status)
    VALUES (NEW.id, 1, 'ongoing')
    ON CONFLICT (content_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_series_on_content_insert
  AFTER INSERT ON content
  FOR EACH ROW
  EXECUTE FUNCTION create_series_entry();

-- Function to update episode count in seasons
CREATE OR REPLACE FUNCTION update_season_episode_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE seasons 
    SET episode_count = (
      SELECT COUNT(*) FROM episodes WHERE season_id = NEW.season_id
    )
    WHERE id = NEW.season_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE seasons 
    SET episode_count = (
      SELECT COUNT(*) FROM episodes WHERE season_id = OLD.season_id
    )
    WHERE id = OLD.season_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_episode_count_on_insert
  AFTER INSERT ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_season_episode_count();

CREATE TRIGGER update_episode_count_on_delete
  AFTER DELETE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_season_episode_count();