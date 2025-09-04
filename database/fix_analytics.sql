-- Create primary profiles for existing users if they don't exist
INSERT INTO user_profiles (user_id, name, is_primary)
SELECT id, COALESCE(raw_user_meta_data->>'name', email), true
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_profiles WHERE is_primary = true)
ON CONFLICT DO NOTHING;

-- Update content_analytics trigger to work properly
CREATE OR REPLACE FUNCTION update_content_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_analytics (content_id, total_views, unique_viewers, average_watch_time, completion_rate)
  VALUES (NEW.content_id, 1, 1, NEW.view_duration, CASE WHEN NEW.completed_view THEN 1.0 ELSE 0.0 END)
  ON CONFLICT (content_id) DO UPDATE SET
    total_views = content_analytics.total_views + 1,
    unique_viewers = (SELECT COUNT(DISTINCT profile_id) FROM content_views WHERE content_id = NEW.content_id),
    average_watch_time = (SELECT AVG(view_duration) FROM content_views WHERE content_id = NEW.content_id),
    completion_rate = (SELECT COUNT(*) FILTER (WHERE completed_view) * 1.0 / COUNT(*) FROM content_views WHERE content_id = NEW.content_id),
    last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS update_analytics_trigger ON content_views;
CREATE TRIGGER update_analytics_trigger 
  AFTER INSERT ON content_views 
  FOR EACH ROW EXECUTE FUNCTION update_content_analytics();