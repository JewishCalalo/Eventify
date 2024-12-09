import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const navigation = useNavigation();

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json&origin=*`
      );
      const data = await response.json();
      if (data.query && data.query.search && data.query.search.length > 0) {
        const pageId = data.query.search[0].pageid;

        const detailsResponse = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&pageids=${pageId}&exintro&explaintext&format=json&origin=*`
        );
        const detailsData = await detailsResponse.json();
        const pageInfo = detailsData.query.pages[pageId];

        // Fetch image from Unsplash
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${query}&client_id=1E14TICTN8P-6KlO9eK3rkIigaJ52wxFa2Kbd1Vze0k`
        );
        const unsplashData = await unsplashResponse.json();
        const imageUrl = unsplashData.results?.[0]?.urls?.small || null;

        navigation.navigate('ResultsScreen', { pageInfo, imageUrl });
      } else {
        console.error('No search results found');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search historical events..."
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={handleSearch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default SearchComponent;
