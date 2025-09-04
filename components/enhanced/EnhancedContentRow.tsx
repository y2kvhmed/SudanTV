import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEnhancedStore } from '../../lib/enhanced-store';
import EnhancedContentCard from './EnhancedContentCard';
import { Content } from '../../types/enhanced';

interface EnhancedContentRowProps {
  title: string;
  content: Content[];
  variant?: 'poster' | 'landscape';
}

export default function EnhancedContentRow({ title, content, variant = 'poster' }: EnhancedContentRowProps) {
  const { language } = useEnhancedStore();
  const isRTL = language === 'ar';

  if (!content || content.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.rtlTitle]}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isRTL && styles.rtlScroll]}
        decelerationRate="fast"
        snapToInterval={variant === 'landscape' ? 320 : 172}
        snapToAlignment="start"
      >
        {content.map((item) => (
          <EnhancedContentCard 
            key={item.id} 
            content={item}
            variant={variant}
            width={variant === 'landscape' ? 300 : 160}
            height={variant === 'landscape' ? 120 : 240}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 20,
  },
  rtlTitle: {
    marginLeft: 0,
    marginRight: 20,
    textAlign: 'right',
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  rtlScroll: {
    paddingLeft: 8,
    paddingRight: 20,
    flexDirection: 'row-reverse',
  },
});