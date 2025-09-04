import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedStore } from '../../lib/enhanced-store';
import i18n from '../../locales';

export default function TabLayout() {
  const { language } = useEnhancedStore();
  const isRTL = language === 'ar';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: 28,
          height: 88,
          position: 'absolute',
          borderRadius: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarActiveTintColor: '#FFFAE5',
        tabBarInactiveTintColor: 'rgba(255, 250, 229, 0.4)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: i18n.t('home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={focused ? '#FFFAE5' : '#666'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: i18n.t('search'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={24} 
              color={focused ? '#FFFAE5' : '#666'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="broadcast"
        options={{
          title: i18n.t('broadcast'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "tv" : "tv-outline"} 
              size={24} 
              color={focused ? '#FFFAE5' : '#666'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('profile'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={focused ? '#FFFAE5' : '#666'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="continue-watching"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="mylist"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}