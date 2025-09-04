-- SudanTV Admin System Update
-- Run this after the main production database setup

-- Update the user registration function to auto-create admin
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  
  -- Auto-create admin for bedaya.sdn@gmail.com (case insensitive)
  IF LOWER(NEW.email) = 'bedaya.sdn@gmail.com' THEN
    INSERT INTO admin_users (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies for content management
CREATE POLICY "Admins can manage all content" ON content 
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all episodes" ON episodes 
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all series" ON series 
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all seasons" ON seasons 
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage content genres" ON content_genres 
  FOR ALL USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- If bedaya.sdn@gmail.com already exists, make them admin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM profiles WHERE LOWER(email) = 'bedaya.sdn@gmail.com') THEN
    INSERT INTO admin_users (user_id, role)
    SELECT id, 'super_admin' 
    FROM profiles 
    WHERE LOWER(email) = 'bedaya.sdn@gmail.com'
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;