import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEnhancedStore } from '../../lib/enhanced-store';
import i18n from '../../locales';

export default function LanguageScreen() {
  const router = useRouter();
  const { setLanguage } = useEnhancedStore();

  const selectLanguage = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    i18n.locale = lang;
    router.push('/(auth)/login');
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose Language / اختر اللغة</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.languageButton} 
            onPress={() => selectLanguage('en')}
          >
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.languageButton} 
            onPress={() => selectLanguage('ar')}
          >
            <Text style={styles.buttonText}>العربية</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 60,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 20,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 2,
    borderColor: '#FFFAE5',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFAE5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});