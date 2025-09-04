-- Fix admin policies by dropping existing ones first

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all content" ON content;
DROP POLICY IF EXISTS "Admins can manage all episodes" ON episodes;

-- Create new admin policies
CREATE POLICY "Admin full content access" ON content FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Admin full episodes access" ON episodes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

-- Enable RLS and create policies for other tables
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public series view" ON series FOR SELECT USING (true);
CREATE POLICY "Admin series manage" ON series FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Public seasons view" ON seasons FOR SELECT USING (true);
CREATE POLICY "Admin seasons manage" ON seasons FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Public categories view" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin categories manage" ON categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);

CREATE POLICY "Public genres view" ON genres FOR SELECT USING (true);
CREATE POLICY "Admin genres manage" ON genres FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'bedaya.sdn@gmail.com'
  )
);