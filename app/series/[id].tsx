import { View, Text, StyleSheet } from 'react-native';

export default function SeriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Series</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFAE5',
    fontSize: 18,
  },
});