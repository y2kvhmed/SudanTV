import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useEnhancedStore } from '../../lib/enhanced-store';
import { supabase } from '../../lib/supabase';
import i18n from '../../locales';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, language } = useEnhancedStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: data.user.email!,
            name: profile.name,
            language: profile.language || 'en',
          });
        }

        // Redirect to admin if bedaya.sdn@gmail.com, otherwise to home
        if (data.user.email?.toLowerCase() === 'bedaya.sdn@gmail.com') {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)/home');
        }
      }
    } catch (error: any) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = language === 'ar';

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {i18n.t('login')}
        </Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={i18n.t('email')}
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={i18n.t('password')}
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? '...' : i18n.t('login')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={[styles.linkText, isRTL && styles.rtlText]}>
              {i18n.t('signup')}
            </Text>
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
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 40,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 40,
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'right',
  },
  form: {
    gap: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFAE5',
    fontSize: 16,
  },
  rtlInput: {
    textAlign: 'right',
  },
  loginButton: {
    backgroundColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    color: '#FFFAE5',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});