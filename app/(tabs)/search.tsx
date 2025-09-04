import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useEnhancedStore } from '../../lib/enhanced-store';
import { supabase } from '../../lib/supabase';
import ContentCard from '../../components/ContentCard';
import { Content } from '../../types';
import i18n from '../../locales';

export default function SearchScreen() {
  const { language, content } = useEnhancedStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const isRTL = language === 'ar';

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'movie', label: i18n.t('movies') },
    { key: 'series', label: i18n.t('series') },
    { key: 'show', label: i18n.t('shows') },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedFilter]);

  const performSearch = async () => {
    try {
      let query = supabase
        .from('content')
        .select('*')
        .ilike('title', `%${searchQuery}%`);

      if (selectedFilter !== 'all') {
        query = query.eq('type', selectedFilter);
      }
      


      const { data, error } = await query;

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      // No fallback for child profiles - show empty if no Kids content
      setSearchResults([]);
    }
  };

  const renderContentItem = ({ item }: { item: Content }) => (
    <ContentCard content={item} width={150} height={220} />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && styles.rtlHeader]}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>
          {i18n.t('search')}
        </Text>
        
        <TextInput
          style={[styles.searchInput, isRTL && styles.rtlInput]}
          placeholder={i18n.t('searchPlaceholder')}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign={isRTL ? 'right' : 'left'}
        />
        
        <View style={[styles.filtersContainer, isRTL && styles.rtlFilters]}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.activeFilter,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.activeFilterText,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {searchQuery.trim() ? (
          <FlatList
            data={searchResults}
            renderItem={renderContentItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, isRTL && styles.rtlText]}>
                No results found
              </Text>
            }
          />
        ) : (
          <Text style={[styles.placeholderText, isRTL && styles.rtlText]}>
            Start typing to search for content
          </Text>
        )}
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
    paddingBottom: 20,
  },
  rtlHeader: {
    alignItems: 'flex-end',
  },
  title: {
    color: '#FFFAE5',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rtlText: {
    textAlign: 'right',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFAE5',
    fontSize: 16,
    marginBottom: 20,
    minHeight: 50,
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rtlFilters: {
    flexDirection: 'row-reverse',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeFilter: {
    backgroundColor: '#FFFAE5',
    borderColor: '#FFFAE5',
  },
  filterText: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#000000',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});