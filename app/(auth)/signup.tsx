import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useEnhancedStore } from '../../lib/enhanced-store';
import { supabase } from '../../lib/supabase';
import i18n from '../../locales';

export default function SignupScreen() {
  const router = useRouter();
  const { setUser, language } = useEnhancedStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            language,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile manually
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            email: data.user.email!,
            language,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Failed to create user profile');
        }

        setUser({
          id: data.user.id,
          email: data.user.email!,
          name,
          language,
        });

        // Check if admin email
        if (data.user.email?.toLowerCase() === 'bedaya.sdn@gmail.com') {
          router.replace('/admin');
        } else {
          router.replace('/(tabs)/home');
        }
      }
    } catch (error: any) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = language === 'ar';

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {i18n.t('signup')}
        </Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={i18n.t('name')}
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            textAlign={isRTL ? 'right' : 'left'}
          />
          
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
          
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            placeholder={i18n.t('confirmPassword')}
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign={isRTL ? 'right' : 'left'}
          />
          
          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? '...' : i18n.t('signup')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.linkText, isRTL && styles.rtlText]}>
              {i18n.t('login')}
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
    gap: 16,
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
  signupButton: {
    backgroundColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  signupButtonText: {
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