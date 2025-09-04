-- Fix signup issue by updating the trigger to handle metadata properly
-- and removing duplicate profile creation

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Updated function that handles user metadata properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't exist (prevents duplicates)
  INSERT INTO profiles (id, name, email, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name),
    language = COALESCE(NEW.raw_user_meta_data->>'language', profiles.language);
  
  -- Auto-create admin for bedaya.sdn@gmail.com
  IF LOWER(NEW.email) = 'bedaya.sdn@gmail.com' THEN
    INSERT INTO admin_users (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();