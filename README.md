# SudanTV - Sudanese Streaming Platform

A premium Sudanese streaming platform built with React Native (Expo) and Supabase, designed to showcase movies, series, documentaries, and curated YouTube content.

## Features

- 🎬 **Netflix-like UI** with dark theme and smooth animations
- 🌍 **Bilingual Support** - English and Arabic with RTL layout
- 🔐 **Authentication** - Secure login/signup with Supabase
- 📱 **Cross-platform** - iOS, Android, and Web support
- 🎥 **Video Player** - Custom player supporting multiple sources
- 📺 **Live TV** - Sudan TV broadcast integration
- ⭐ **Favorites** - Personal watchlist functionality
- 🔍 **Search** - Full-text search with filters
- 👤 **User Profiles** - Personal settings and preferences

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database, Storage)
- **Video**: Expo AV + WebView for YouTube
- **Styling**: React Native StyleSheet with dark theme
- **Localization**: i18n-js with English/Arabic support

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Supabase account

### 2. Installation

```bash
# Clone the repository
cd "Sudan TV/SudanTV"

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm start
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the SQL commands from `docs/database-setup.sql` in your Supabase SQL editor
3. Update the Supabase credentials in `lib/supabase.ts` (already configured)

### 4. Database Schema

The app uses the following main tables:
- `profiles` - User profiles with language preferences
- `content` - Movies, series, documentaries, and YouTube content
- `user_favorites` - User's favorite content
- `episodes` - Episodes for series content

### 5. Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## App Structure

```
app/
├── (auth)/          # Authentication screens
├── (tabs)/          # Main app tabs
├── content/         # Content detail screens
├── player/          # Video player screens
components/          # Reusable components
lib/                # Utilities and configurations
types/              # TypeScript type definitions
locales/            # Internationalization
docs/               # Documentation
```

## Key Features Implementation

### Authentication Flow
- Welcome screen with language selection
- Login/Signup with Supabase Auth
- Automatic session management
- Profile creation and management

### Content Management
- Dynamic content loading from Supabase
- Support for multiple content types
- Featured content carousel
- Categorized content rows

### Video Playback
- Native video player for direct video files
- YouTube embed player for YouTube content
- Full-screen support
- Custom controls overlay

### Live TV Integration
- Sudan TV broadcast stream
- WebView-based player
- Full-screen viewing experience

### Localization
- Complete English/Arabic translation
- RTL layout support for Arabic
- Dynamic language switching
- Persistent language preferences

## Content Sources

The app supports multiple video sources:
- **Direct Video URLs** - MP4, MOV, etc.
- **Google Drive** - Direct streaming links
- **YouTube** - Embedded player with custom UI
- **Live Streams** - Sudan TV broadcast

## Deployment

### Mobile Apps
```bash
# Build for production
expo build:android
expo build:ios
```

### Web Deployment
```bash
# Export for web
expo export -p web
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software developed for Bedaya Projects.

## Support

For support and questions, contact the development team at Bedaya Projects.

---

**SudanTV** - Bringing Sudanese entertainment to the digital age 🇸🇩