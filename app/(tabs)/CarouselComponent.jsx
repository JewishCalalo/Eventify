import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Localization from 'expo-localization';
import { Ionicons } from '@expo/vector-icons';
import { EventContext } from './EventContext';

const CarouselComponent = () => {
  const { theme } = useContext(EventContext);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const fetchHistoricalEvents = async () => {
    try {
      // Get the correct local date components
      const now = new Date();
      const localTimeString = now.toLocaleString('en-US', { timeZone: Localization.timezone });
      const [date, time] = localTimeString.split(', ');
      const [month, day, year] = date.split('/').map(Number);

      // Manually create local date object
      const localDate = new Date(year, month - 1, day);

      // Debugging logs
      console.log('now:', now);
      console.log('localTimeString:', localTimeString);
      console.log('localDate:', localDate);

      if (isNaN(localDate.getTime())) {
        throw new Error('Invalid local date');
      }

      console.log('Year:', year);
      console.log('Month:', month);
      console.log('Day:', day);

      if (isNaN(month) || isNaN(day) || isNaN(year)) {
        throw new Error('Invalid date parameters');
      }

      // Fetch events from Wikipedia
      const wikiResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`
      );
      const wikiResponseText = await wikiResponse.text();
      console.log('Wikipedia response:', wikiResponse);
      console.log('Wikipedia response text:', wikiResponseText);

      if (!wikiResponse.ok) {
        throw new Error(`Wikipedia API error: ${wikiResponse.statusText}`);
      }
      const wikiData = JSON.parse(wikiResponseText);
      const wikiEvents = wikiData?.events || [];

      // Fetch events from API Ninjas
      const apiNinjasResponse = await fetch(
        `https://api.api-ninjas.com/v1/historicalevents?year=${year}&month=${month}&day=${day}`, {
          headers: { 'X-Api-Key': '5BqI1qe1V/uNhMmI8uoOSQ==Bjg9NLhABhBi6dme' }
        }
      );
      console.log('API Ninjas response:', apiNinjasResponse);

      if (!apiNinjasResponse.ok) {
        const errorText = await apiNinjasResponse.text();
        throw new Error(`API Ninjas error: ${errorText}`);
      }
      const apiNinjasData = await apiNinjasResponse.json();
      const apiNinjasEvents = Array.isArray(apiNinjasData) ? apiNinjasData : [];

      // Combine events from both sources
      const combinedEvents = [...wikiEvents, ...apiNinjasEvents];

      // Fetch images from Unsplash if not available in events
      const fetchUnsplashImages = combinedEvents.map(async (event) => {
        if (!event.pages || !event.pages[0] || !event.pages[0].thumbnail) {
          const unsplashResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${event.title || event.text}&client_id=1E14TICTN8P-6KlO9eK3rkIigaJ52wxFa2Kbd1Vze0k`
          );
          if (!unsplashResponse.ok) {
            const errorText = await unsplashResponse.text();
            throw new Error(`Unsplash API error: ${errorText}`);
          }
          const unsplashData = await unsplashResponse.json();
          event.imageUrl = unsplashData.results?.[0]?.urls?.small || null;
        }
        return event;
      });

      const eventsWithImages = await Promise.all(fetchUnsplashImages);
      setEvents(eventsWithImages);
    } catch (err) {
      console.error('Error fetching historical events:', err);
      setError(`Failed to fetch events: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchHistoricalEvents();
  }, []);

  const visibleEvents = showMore ? events : events.slice(0, 5);

  return (
    <View>
      <ScrollView horizontal style={styles.container}>
        {error ? (
          <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
        ) : (
          <>
            {visibleEvents.map((event, index) => (
              <View key={index} style={styles.slide}>
                {event.pages && event.pages[0] && event.pages[0].thumbnail ? (
                  <Image source={{ uri: event.pages[0].thumbnail.source }} style={styles.image} />
                ) : event.imageUrl ? (
                  <Image source={{ uri: event.imageUrl }} style={styles.image} />
                ) : (
                  <Text>No Image Available</Text>
                )}
                <Text style={[styles.label, { color: theme.text }]}>
                  {event.text ? `${event.text}` : event.title || event.description}
                </Text>
              </View>
            ))}
            {!showMore && events.length > 5 && (
              <TouchableOpacity style={styles.arrowButton} onPress={() => setShowMore(true)}>
                <Ionicons name="arrow-forward-circle" size={32} color={theme.icon} />
              </TouchableOpacity>
            )}
            {showMore && (
              <TouchableOpacity style={styles.collapseButton} onPress={() => setShowMore(false)}>
                <Ionicons name="remove-circle" size={32} color={theme.icon} />
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    height: 350,
  },
  slide: {
    width: 200,
    height: 250,
    margin: 5,
    padding: 10,
    justifyContent: 'space-between',
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 15,
    aspectRatio: 1,
  },
  label: {
    marginTop: 5,
    textAlign: 'auto',
    lineHeight: 20,
    fontSize: 16,
  },
  arrowButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
  },
  collapseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -30,
  },
  errorText: {
    fontSize: 16,
    margin: 5,
  },
});

export default CarouselComponent;
