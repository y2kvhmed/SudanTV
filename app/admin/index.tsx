import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function AdminScreen() {
  const router = useRouter();

  const adminOptions = [
    { title: 'Add Content', icon: 'add-circle', route: '/admin/add-content' },
    { title: 'Analytics Dashboard', icon: 'analytics', route: '/admin/analytics' },
    { title: 'Manage Content', icon: 'list', route: '/admin/manage-content' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {adminOptions.map((option, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.optionCard}
            onPress={() => router.push(option.route)}
          >
            <Ionicons name={option.icon} size={32} color="#FFFAE5" />
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.logoutContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            supabase.auth.signOut();
            router.replace('/');
          }}
        >
          <Ionicons name="log-out" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingBottom: 20,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 28,
    fontWeight: 'bold',
  },
  optionsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '47%',
    minHeight: 120,
    justifyContent: 'center',
  },
  optionText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ff4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
});