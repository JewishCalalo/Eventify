import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import { EventContext } from '/React Native/Eventify/app/(tabs)/EventContext';
import { LinearGradient } from 'expo-linear-gradient'; 
import Ionicons from '@expo/vector-icons/Ionicons'; 

const YearViewTab = ({ setView, setSelectedDate }) => {
  const { theme } = useContext(EventContext);
  const [currentYear, setCurrentYear] = useState(moment().year());
  const months = moment.months();

  const handleMonthPress = (monthIndex) => {
    const selectedDate = moment().year(currentYear).month(monthIndex).startOf('month').format('YYYY-MM-DD');
    setSelectedDate(selectedDate);
    setView('month');
  };

  const renderMonth = (monthIndex) => {
    const startOfMonth = moment().year(currentYear).month(monthIndex).startOf('month');
    const daysInMonth = startOfMonth.daysInMonth();
    const firstDay = startOfMonth.day();
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let dates = Array(firstDay).fill(''); 
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(i.toString());
    }

    while (dates.length % 7 !== 0) {
      dates.push('');
    }

    return (
      <View key={monthIndex} style={[styles.monthContainer, { backgroundColor: theme.icon }]}>
        <Text style={[styles.monthText, { color: theme.text }]}>{months[monthIndex]}</Text>
        <View style={styles.daysOfWeekContainer}>
          {daysOfWeek.map((day, index) => (
            <Text key={index} style={[styles.dayOfWeekText, { color: theme.text }]}>{day}</Text>
          ))}
        </View>
        <View style={styles.datesContainer}>
          {dates.map((date, index) => (
            <View key={index} style={styles.dateBox}>
              <Text style={[styles.dateText, { color: theme.text }]}>{date}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#939194' , '#673b70' ]} style={styles.linearGradient}>
      <View style={styles.yearHeader}>
        <TouchableOpacity onPress={() => setCurrentYear(currentYear - 1)}>
          <Ionicons name="chevron-back-outline" size={30} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: theme.text }]}>{currentYear}</Text>
        <TouchableOpacity onPress={() => setCurrentYear(currentYear + 1)}>
          <Ionicons name="chevron-forward-outline" size={30} color={theme.icon} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {months.map((month, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleMonthPress(index)}
              style={styles.monthTouchable}
            >
              {renderMonth(index)}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  yearText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 1,
  },
  monthTouchable: {
    width: '85%', 
    marginVertical: 10,
  },
  monthContainer: {
    borderRadius: 28,
    padding: 5,
    height: 250, 
  },
  monthText: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dayOfWeekText: {
    fontSize: 15,
    textAlign: 'center',
    flex: 1,
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dateBox: {
    width: '14.28%', 
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

export default YearViewTab;
