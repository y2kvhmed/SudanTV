-- Delete existing bucket and policies
DELETE FROM storage.buckets WHERE id = 'content-images';

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'content-images', 
  'content-images', 
  true, 
  52428800, 
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'content-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');