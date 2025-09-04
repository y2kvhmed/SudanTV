import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEnhancedStore } from '../../lib/enhanced-store';
import i18n from '../../locales';
import { useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function BroadcastScreen() {
  const { language } = useEnhancedStore();
  const isRTL = language === 'ar';
  const webViewRef = useRef(null);

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
      </style>
    </head>
    <body>
      <iframe 
        src="https://www.elahmad.com/tv/arabic-tv-online.php?id=sudan" 
        sandbox="allow-scripts allow-same-origin allow-presentation"
        allowfullscreen>
      </iframe>
    </body>
    </html>
  `;



  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlHeader]}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {i18n.t('broadcast')} - Sudan TV
        </Text>
      </View>
      
      <View style={styles.playerContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://www.elahmad.com/tv/arabic-tv-online.php?id=sudan' }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          originWhitelist={['*']}
          cacheEnabled={true}
          incognito={false}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
          onError={() => {
            setTimeout(() => {
              webViewRef.current?.reload();
            }, 3000);
          }}
          injectedJavaScript={`
            window.addEventListener('error', function(e) {
              if (e.message && e.message.includes('hls.js')) {
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            });
          `}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  rtlHeader: {
    alignItems: 'flex-end',
  },
  title: {
    color: '#FFFAE5',
    fontSize: 24,
    fontWeight: 'bold',
  },
  rtlText: {
    textAlign: 'right',
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    marginBottom: 88,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});