export interface User {
  id: string;
  email: string;
  name: string;
  language: 'en' | 'ar';
}

export interface Content {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  video_url: string;
  type: 'movie' | 'series' | 'documentary' | 'youtube';
  genre: string[];
  year: number;
  runtime?: number;
  featured?: boolean;
  trending?: boolean;
  new_release?: boolean;
}

export interface Episode {
  id: string;
  series_id: string;
  title: string;
  episode_number: number;
  season_number: number;
  video_url: string;
  description?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}