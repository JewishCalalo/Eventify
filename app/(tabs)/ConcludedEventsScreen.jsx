import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { EventContext } from './EventContext';
import { theme } from './theme';
import { LinearGradient } from 'expo-linear-gradient';

const ConcludedEventsScreen = () => {
  const { events } = useContext(EventContext);
  const navigation = useNavigation();

  const concludedEvents = events.filter(event => event.concluded);

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.eventDate, { color: theme.text }]}>{item.date.toString()}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#939194','#673b70']} style={styles.container}>
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
        <Text style={[styles.goBackText, { color: theme.text }]}>Go Back</Text>
      </TouchableOpacity>
      {concludedEvents.length === 0 ? (
        <View style={styles.noEventsView}>
          <Text style={[styles.noEventsText, { color: theme.text }]}>No concluded events yet.</Text>
        </View>
      ) : (
        <FlatList
          data={concludedEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goBackText: {
    marginLeft: 10,
    fontSize: 18,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  noEventsView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 18,
    fontStyle: 'italic',
  },
  eventItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderColor: 'lightgray',
    borderWidth: 1,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 16,
  },
});

export default ConcludedEventsScreen;
