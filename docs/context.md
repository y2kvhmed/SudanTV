# SudanTV – App Context

## Overview
**SudanTV** is a premium Sudanese streaming platform designed to showcase movies, series, documentaries, and curated YouTube content in a cinematic, user-friendly experience. The app draws design inspiration from **Netflix, Hulu, and Disney+**, but is tailored for **iOS-like smoothness, modern curvy UI elements, and a dark aesthetic**.  

The goal is to provide a **scalable enterprise-grade streaming platform** that can handle authentication, dynamic content management, and seamless video playback from multiple sources (Google Drive, YouTube) while ensuring localization (English & Arabic).

---

## Tech Stack

- **Frontend:**  
  - React Native (with Expo & TypeScript)  
  - Expo Router for navigation  
  - Context API / Zustand for state management  
  - iOS-inspired UI with rounded, fluid components  
  - Dark mode first (`#000000`) with accents (`#FFFAE5`)  

- **Backend & Database:**  
  - Supabase (Authentication, Storage, Database, Real-time sync)  

- **Video Handling:**  
  - Google Drive (direct video streaming links)  
  - YouTube (via embedded player but fully re-skinned with a custom UI layer to avoid default YouTube branding)  
  - Future-proof: add support for HLS/DASH streaming  

---

## App Flow

### 1. Onboarding
- **Welcome Screen:**  
  - Animated logo + tagline.  
  - Black background with smooth transitions.  
  - Call to action → “Continue” button.  

- **Language Selection:**  
  - English or Arabic.  
  - Stored in user preferences.  
  - All text + layout adapts (RTL for Arabic).  

---

### 2. Authentication
- **Login Page:**  
  - Email + Password form.  
  - Supabase-powered authentication.  
  - “Forgot Password” option → triggers password reset email.  

- **Signup Page:**  
  - Name, Email, Password, Confirm Password.  
  - Language preference saved.  
  - Validation & error handling (enterprise-grade security).  

- **Auth Handling:**  
  - Supabase JWT tokens.  
  - Persistent sessions with automatic refresh.  
  - Role-based access ready (scalable for future admin/moderator dashboards).  

---

### 3. Home Page (Main UI)
- **Layout:**  
  - Netflix/Disney+ inspired UI.  
  - Featured hero banner at the top with “Play Now” + “More Info.”  
  - Horizontal carousels categorized as:  
    - Trending Now  
    - New Releases  
    - Sudanese Spotlight  
    - Movies  
    - Series  
    - Documentaries  
    - Curated YouTube Imports  

- **Design:**  
  - Black background (`#000000`).  
  - Curved cards with accent glow (`#FFFAE5`).  
  - Smooth scroll + snapping animations.  

- **Performance Considerations:**  
  - Lazy loading content.  
  - Caching with pagination.  
  - Optimized image thumbnails with CDN (future upgrade).  
  - DONT SHOW ANY FAKE/DEMO/SAMPLE SHOWS OR MOVIES OR SERIES! I WANT ALL OF THEM TO BE REAL WHEN I SAY SO

---

### 4. Search
- **Search Bar at top of screen.**  
- **Filters:** Movies / Series / Documentaries / YouTube.  
- **Auto-suggestions:** Display top 5 matches as user types.  
- **Supabase full-text search** integration for efficiency.  

---

### 5. Video Player
- **Custom Player (enterprise-level):**  
  - Play / Pause.  
  - Seek bar with thumbnail previews.  
  - Volume + mute toggle.  
  - Fullscreen toggle (landscape enforced).  
  - Subtitle support (multi-language, optional).  
  - Picture-in-Picture support (Expo AV / Native Modules).  
  - Chromecast / AirPlay support (future roadmap).  

- **Supported Sources:**  
  - Google Drive direct streaming.  
  - YouTube embedded stream with custom UI wrapper.  
  - Expandable to HLS/DASH adaptive streaming.  

---

### 6. Content Details Page
- Poster / Hero Image.  
- Title, Year, Runtime, Genre(s).  
- Play button → launches custom player.  
- Overview/Description.  
- Cast & Crew (optional).  
- “Add to Favorites” button.  

---

### 7. My List
- Saved favorites per user.  
- Synced with Supabase.  
- Sorted by most recently added.  

---

### 8. Profile & Settings
- **Profile:**  
  - User info: Name, Email, Preferred Language.  
  - Option to edit details.  

- **Settings:**  
  - Change Password.  
  - Switch Language (English ↔ Arabic).  
  - Notification Preferences (future).  
  - Logout.  

---

## Enterprise Features

1. **Scalability:**  
   - Modular React Native codebase with Expo Router.  
   - Supabase scaling for authentication and real-time sync.  
   - Future integration with CDN for content delivery.  

2. **Localization & RTL Support:**  
   - Full app available in English & Arabic.  
   - RTL layout for Arabic automatically enabled.  

3. **Security:**  
   - Supabase Auth with secure JWT.  
   - Role-based access control (users, admins, moderators).  
   - Secure streaming links (signed URLs for Google Drive).  

4. **Offline Resilience:**  
   - Cached browsing of thumbnails.  
   - Watch history stored locally & synced when online.  

5. **Future-Proof:**  
   - Multi-profile support (like Netflix).  
   - “Continue Watching” section.  
   - Downloads for offline playback.  
   - Integration with Bedaya ecosystem apps.  

---

## UI Inspiration & Styling

- **Onboarding:** Apple Music inspired – bold typography, animations.  
- **Home Page:** Netflix + Disney+ hybrid – cinematic carousels with smooth scroll.  
- **Player:** Clean and distraction-free, black overlay controls.  
- **Profile:** Curved UI cards, accent highlights.  

---

## Future Roadmap
- **Multi-profile support** → multiple users per account.  
- **Watch history** → Continue Watching section.  
- **Content ratings & parental controls.**  
- **Recommendation engine** (Supabase + ML in future).  
- **Offline downloads.**  
- **Web & Smart TV app versions.**  

---

# ✅ Summary
SudanTV is a **cinematic streaming app** built with **React Native (Expo) + Supabase**, designed to scale into an **enterprise-grade media platform**. Its Netflix-like design, custom video player, and dual-language support (English/Arabic) make it the first of its kind for Sudanese entertainment.  also add a sudanTV broadcast show which is <iframe width="560" height="315" src="https://www.elahmad.com/tv/arabic-tv-online.php?id=sudan" style="border:none;" allowfullscreen allow="autoplay; fullscreen; picture-in-picture; xr-spatial-tracking; encrypted-media"></iframe>

supabase url: https://jdfavuugeqnjyrlxcyim.supabase.co

supabase anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZmF2dXVnZXFuanlybHhjeWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzUxOTUsImV4cCI6MjA3MjA1MTE5NX0.tGIycdDEc9wNgi9s24PO19ulpoqidtaRlsSvFK5gJfc