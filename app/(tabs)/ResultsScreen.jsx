import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const ResultsScreen = ({ route }) => {
  const { pageInfo, imageUrl } = route.params || {};
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#939194','#673b70']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" style={styles.goBackIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>{pageInfo.title}</Text>
        </View>
        {pageInfo ? (
          <>
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
              />
            )}
            <Text style={styles.extract}>{pageInfo.extract}</Text>
          </>
        ) : (
          <Text>No data available</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  goBackIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 34, 
  },
  image: {
    width: 300,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  extract: {
    fontSize: 19,
    textAlign: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
});

export default ResultsScreen;
