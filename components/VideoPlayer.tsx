import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUrl: string;
  onProgress?: (progress: number, duration: number) => void;
}

export default function VideoPlayer({ videoUrl, onProgress }: VideoPlayerProps) {
  if (Platform.OS === 'web') {
    // Web-compatible video player
    return (
      <View style={styles.container}>
        <video
          src={videoUrl}
          controls
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
          }}
          onTimeUpdate={(e) => {
            const video = e.target as HTMLVideoElement;
            onProgress?.(video.currentTime, video.duration);
          }}
        />
      </View>
    );
  }

  // Mobile WebView player
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #000000;
          height: 100vh;
          overflow: hidden;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        video {
          width: 100%;
          height: 100%;
          border: none;
        }
        iframe[src*="drive.google.com"] {
          zoom: 0.7;
        }
        .overlay {
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background-color: #000000;
          z-index: 10;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      ${videoUrl.includes('drive.google.com') || videoUrl.includes('youtube.com') 
        ? `<iframe src="${videoUrl}" allowfullscreen allow="autoplay; fullscreen"></iframe><div class="overlay"></div>`
        : `<video src="${videoUrl}" controls autoplay></video>`
      }
      <script>
        setInterval(() => {
          const video = document.querySelector('video');
          if (video) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'progress',
              progress: video.currentTime,
              duration: video.duration
            }));
          }
        }, 5000);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'progress') {
              onProgress?.(data.progress, data.duration);
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
  },
});