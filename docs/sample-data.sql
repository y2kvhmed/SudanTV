-- Sample data for SudanTV production database
-- Run this after the main schema setup

-- Insert sample content data
INSERT INTO content (
  title, title_ar, description, description_ar, poster_url, backdrop_url, video_url, 
  type, duration_minutes, year, rating, language, country, director, cast_members,
  is_featured, is_trending, is_new_release, is_premium, status
) VALUES 
-- Sudanese Movies
(
  'The Blue Elephant', 'الفيل الأزرق', 
  'A psychological thriller about a psychiatrist who returns to work after a breakdown.',
  'فيلم نفسي مثير عن طبيب نفسي يعود للعمل بعد انهيار عصبي.',
  'https://image.tmdb.org/t/p/w500/example1.jpg',
  'https://image.tmdb.org/t/p/w1920/example1_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'movie', 120, 2014, 8.2, 'ar', 'EG', 'Marwan Hamed', 
  ARRAY['Karim Abdel Aziz', 'Khaled El Sawy', 'Nelly Karim'],
  true, true, false, false, 'published'
),
(
  'Talking About Jacqueline', 'الحديث عن جاكلين',
  'A drama about love and relationships in modern Sudan.',
  'دراما عن الحب والعلاقات في السودان الحديث.',
  'https://image.tmdb.org/t/p/w500/example2.jpg',
  'https://image.tmdb.org/t/p/w1920/example2_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'movie', 95, 2021, 7.5, 'ar', 'SD', 'Hajooj Kuka',
  ARRAY['Ger Duany', 'Nyakuoth Weil', 'Deng Ajuet'],
  false, true, true, false, 'published'
),
(
  'You Will Die at Twenty', 'ستموت في العشرين',
  'A young man lives under the prophecy that he will die at age twenty.',
  'شاب يعيش تحت نبوءة أنه سيموت في سن العشرين.',
  'https://image.tmdb.org/t/p/w500/example3.jpg',
  'https://image.tmdb.org/t/p/w1920/example3_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4',
  'movie', 103, 2019, 8.0, 'ar', 'SD', 'Amjad Abu Alala',
  ARRAY['Mustafa Shehata', 'Islam Mubarak', 'Mahmoud Alsarraj'],
  true, false, false, true, 'published'
),

-- Sudanese Series
(
  'Khartoum Nights', 'ليالي الخرطوم',
  'A drama series following families in modern Khartoum.',
  'مسلسل درامي يتابع عائلات في الخرطوم الحديثة.',
  'https://image.tmdb.org/t/p/w500/series1.jpg',
  'https://image.tmdb.org/t/p/w1920/series1_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'series', 45, 2023, 7.8, 'ar', 'SD', 'Ahmed Hassan',
  ARRAY['Salma Ahmed', 'Mohamed Ali', 'Fatima Ibrahim'],
  false, true, true, false, 'published'
),
(
  'The Nile Stories', 'حكايات النيل',
  'Historical drama about life along the Nile River.',
  'دراما تاريخية عن الحياة على ضفاف النيل.',
  'https://image.tmdb.org/t/p/w500/series2.jpg',
  'https://image.tmdb.org/t/p/w1920/series2_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'series', 50, 2022, 8.5, 'ar', 'SD', 'Mariam Sulaiman',
  ARRAY['Omar Bashir', 'Aisha Mohamed', 'Hassan Ali'],
  true, false, false, false, 'published'
),

-- Documentaries
(
  'Sudan: Land of Gold', 'السودان: أرض الذهب',
  'Documentary exploring Sudan''s rich mineral resources.',
  'وثائقي يستكشف الثروات المعدنية الغنية في السودان.',
  'https://image.tmdb.org/t/p/w500/doc1.jpg',
  'https://image.tmdb.org/t/p/w1920/doc1_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'documentary', 75, 2023, 8.1, 'ar', 'SD', 'Khalid Mansour',
  ARRAY['Narrator: Ahmed Zaki'],
  false, false, true, false, 'published'
),
(
  'The Blue and White Nile', 'النيل الأزرق والأبيض',
  'Journey through the confluence of the two Niles.',
  'رحلة عبر ملتقى النيلين الأزرق والأبيض.',
  'https://image.tmdb.org/t/p/w500/doc2.jpg',
  'https://image.tmdb.org/t/p/w1920/doc2_backdrop.jpg',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
  'documentary', 90, 2021, 7.9, 'ar', 'SD', 'Nadia Ahmed',
  ARRAY['Narrator: Salma Hassan'],
  false, true, false, false, 'published'
),

-- YouTube Content
(
  'Sudanese Cooking Show', 'برنامج الطبخ السوداني',
  'Traditional Sudanese recipes and cooking techniques.',
  'وصفات الطبخ السوداني التقليدي وتقنيات الطهي.',
  'https://image.tmdb.org/t/p/w500/youtube1.jpg',
  'https://image.tmdb.org/t/p/w1920/youtube1_backdrop.jpg',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube', 25, 2023, 7.2, 'ar', 'SD', 'Chef Amina',
  ARRAY['Amina Mohamed'],
  false, false, true, false, 'published'
),
(
  'Sudan Travel Guide', 'دليل السفر في السودان',
  'Explore the beautiful landscapes and culture of Sudan.',
  'استكشف المناظر الطبيعية الجميلة وثقافة السودان.',
  'https://image.tmdb.org/t/p/w500/youtube2.jpg',
  'https://image.tmdb.org/t/p/w1920/youtube2_backdrop.jpg',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube', 15, 2023, 8.0, 'ar', 'SD', 'Travel Team',
  ARRAY['Guide: Hassan Ali'],
  false, true, false, false, 'published'
);

-- Link content to genres
INSERT INTO content_genres (content_id, genre_id)
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'The Blue Elephant' AND g.slug = 'thriller'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'The Blue Elephant' AND g.slug = 'drama'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'Talking About Jacqueline' AND g.slug = 'drama'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'Talking About Jacqueline' AND g.slug = 'romance'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'You Will Die at Twenty' AND g.slug = 'drama'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'Khartoum Nights' AND g.slug = 'drama'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'The Nile Stories' AND g.slug = 'drama'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'The Nile Stories' AND g.slug = 'history'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'Sudan: Land of Gold' AND g.slug = 'documentary'
UNION ALL
SELECT c.id, g.id FROM content c, genres g 
WHERE c.title = 'The Blue and White Nile' AND g.slug = 'documentary';

-- Create series data for TV shows
INSERT INTO series (content_id, total_seasons, total_episodes, status)
SELECT id, 2, 20, 'ongoing' FROM content WHERE title = 'Khartoum Nights'
UNION ALL
SELECT id, 1, 12, 'completed' FROM content WHERE title = 'The Nile Stories';

-- Create seasons for series
INSERT INTO seasons (series_id, season_number, title, title_ar, episode_count, release_date)
SELECT s.id, 1, 'Season 1', 'الموسم الأول', 10, '2023-01-01'
FROM series s 
JOIN content c ON s.content_id = c.id 
WHERE c.title = 'Khartoum Nights'
UNION ALL
SELECT s.id, 2, 'Season 2', 'الموسم الثاني', 10, '2023-06-01'
FROM series s 
JOIN content c ON s.content_id = c.id 
WHERE c.title = 'Khartoum Nights'
UNION ALL
SELECT s.id, 1, 'Season 1', 'الموسم الأول', 12, '2022-01-01'
FROM series s 
JOIN content c ON s.content_id = c.id 
WHERE c.title = 'The Nile Stories';

-- Create episodes for seasons
INSERT INTO episodes (season_id, episode_number, title, title_ar, description, description_ar, video_url, duration_minutes, air_date)
SELECT 
  se.id, 
  generate_series(1, 10) as episode_number,
  'Episode ' || generate_series(1, 10),
  'الحلقة ' || generate_series(1, 10),
  'Episode description for episode ' || generate_series(1, 10),
  'وصف الحلقة للحلقة ' || generate_series(1, 10),
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  45,
  '2023-01-01'::date + (generate_series(1, 10) - 1) * interval '1 week'
FROM seasons se
JOIN series s ON se.series_id = s.id
JOIN content c ON s.content_id = c.id
WHERE c.title = 'Khartoum Nights' AND se.season_number = 1;

-- Add more episodes for other seasons (simplified)
INSERT INTO episodes (season_id, episode_number, title, title_ar, video_url, duration_minutes, air_date)
SELECT 
  se.id, 
  1,
  'Episode 1',
  'الحلقة الأولى',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  45,
  se.release_date
FROM seasons se
JOIN series s ON se.series_id = s.id
JOIN content c ON s.content_id = c.id
WHERE se.id NOT IN (
  SELECT DISTINCT season_id FROM episodes WHERE season_id IS NOT NULL
);

-- Create sample collections with content
INSERT INTO collection_items (collection_id, content_id, sort_order)
SELECT 
  col.id,
  c.id,
  ROW_NUMBER() OVER (PARTITION BY col.id ORDER BY c.rating DESC)
FROM collections col
CROSS JOIN content c
WHERE col.name = 'Trending Now' AND c.is_trending = true
UNION ALL
SELECT 
  col.id,
  c.id,
  ROW_NUMBER() OVER (PARTITION BY col.id ORDER BY c.created_at DESC)
FROM collections col
CROSS JOIN content c
WHERE col.name = 'New Releases' AND c.is_new_release = true
UNION ALL
SELECT 
  col.id,
  c.id,
  ROW_NUMBER() OVER (PARTITION BY col.id ORDER BY c.rating DESC)
FROM collections col
CROSS JOIN content c
WHERE col.name = 'Sudanese Spotlight' AND c.country = 'SD'
LIMIT 10;