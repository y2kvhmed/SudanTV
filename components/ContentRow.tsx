import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ContentCard from './ContentCard';
import { Content } from '../types';
import { useStore } from '../lib/store';

interface ContentRowProps {
  title: string;
  content: Content[];
}

export default function ContentRow({ title, content }: ContentRowProps) {
  const { language } = useStore();
  const isRTL = language === 'ar';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && styles.rtlTitle]}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isRTL && styles.rtlScroll]}
      >
        {content.map((item) => (
          <ContentCard key={item.id} content={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 20,
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