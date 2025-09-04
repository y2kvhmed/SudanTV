import { Share } from 'react-native';
import { supabase } from './supabase';

export const sharingService = {
  // Generate shareable link
  async generateShareLink(contentId: string, episodeId?: string, profileId?: string) {
    try {
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      const { error } = await supabase
        .from('shared_content')
        .insert({
          content_id: contentId,
          episode_id: episodeId,
          shared_by: profileId,
          share_token: shareToken,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      // Generate deep link
      const baseUrl = 'https://sudantv.vercel.app';
      const shareUrl = `${baseUrl}/share/${shareToken}`;

      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      return null;
    }
  },

  // Share content
  async shareContent(contentId: string, contentTitle: string, episodeId?: string, episodeTitle?: string, profileId?: string) {
    try {
      const shareUrl = await this.generateShareLink(contentId, episodeId, profileId);
      if (!shareUrl) throw new Error('Failed to generate share link');

      const title = episodeTitle ? `${contentTitle} - ${episodeTitle}` : contentTitle;
      const message = `Check out "${title}" on Sudan TV!\n\n${shareUrl}`;

      await Share.share({
        message,
        url: shareUrl,
        title: `Watch ${title}`
      });

      // Track share analytics
      const { data: analytics } = await supabase
        .from('content_analytics')
        .select('shares_count')
        .eq('content_id', contentId)
        .single();
        
      if (analytics) {
        await supabase
          .from('content_analytics')
          .update({ shares_count: (analytics.shares_count || 0) + 1 })
          .eq('content_id', contentId);
      }

    } catch (error) {
      console.error('Error sharing content:', error);
    }
  },

  // Get shared content by token
  async getSharedContent(shareToken: string) {
    try {
      const { data, error } = await supabase
        .from('shared_content')
        .select(`
          *,
          content (
            id,
            title,
            description,
            poster_url,
            type,
            genre,
            video_url
          ),
          episodes (
            id,
            title,
            episode_number,
            season_number,
            video_url
          )
        `)
        .eq('share_token', shareToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting shared content:', error);
      return null;
    }
  },

  // Handle deep link
  async handleDeepLink(url: string) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      if (pathParts[1] === 'share' && pathParts[2]) {
        const shareToken = pathParts[2];
        const sharedContent = await this.getSharedContent(shareToken);
        
        if (sharedContent) {
          return {
            type: 'shared_content',
            contentId: sharedContent.content_id,
            episodeId: sharedContent.episode_id,
            content: sharedContent.content,
            episode: sharedContent.episodes
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error handling deep link:', error);
      return null;
    }
  },

  // Create web page for shared content (for users without app)
  generateWebPage(sharedContent: any) {
    const { content, episodes } = sharedContent;
    const title = episodes ? `${content.title} - ${episodes.title}` : content.title;
    const videoUrl = episodes?.video_url || content.video_url;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Sudan TV</title>
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${content.description || 'Watch on Sudan TV'}">
    <meta property="og:image" content="${content.poster_url}">
    <meta property="og:type" content="video.movie">
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #000000, #1a1a1a);
            color: #FFFAE5;
            min-height: 100vh;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            text-align: center; 
        }
        .poster { 
            max-width: 300px; 
            border-radius: 12px; 
            margin: 20px 0; 
        }
        .title { 
            font-size: 2em; 
            margin: 20px 0; 
        }
        .description { 
            margin: 20px 0; 
            line-height: 1.6; 
        }
        .download-btn { 
            background: #FFFAE5; 
            color: #000; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 8px; 
            font-size: 1.1em; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            margin: 20px 10px; 
        }
        .play-btn { 
            background: transparent; 
            color: #FFFAE5; 
            border: 2px solid #FFFAE5; 
            padding: 15px 30px; 
            border-radius: 8px; 
            font-size: 1.1em; 
            cursor: pointer; 
            text-decoration: none; 
            display: inline-block; 
            margin: 20px 10px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sudan TV</h1>
        <img src="${content.poster_url}" alt="${title}" class="poster">
        <h2 class="title">${title}</h2>
        <p class="description">${content.description || ''}</p>
        
        <a href="sudantv://watch/${sharedContent.share_token}" class="download-btn">
            Open in Sudan TV App
        </a>
        
        <a href="${videoUrl}" class="play-btn" target="_blank">
            Watch in Browser
        </a>
        
        <p>
            <a href="https://play.google.com/store/apps/details?id=com.sudantv" class="download-btn">
                Download Sudan TV
            </a>
        </p>
    </div>
</body>
</html>`;
  }
};