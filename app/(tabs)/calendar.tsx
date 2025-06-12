import { EventType, useEvents } from '@/hooks/useEvents';
import * as ExpoCalendar from 'expo-calendar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, CalendarProps, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

function toLocalDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

export default function CalendarScreen() {
  const { events, loading } = useEvents();
  const [displayMonth, setDisplayMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(new Date()));

  const eventsByDate = useMemo<Record<string, EventType[]>>(() => {
    const map: Record<string, EventType[]> = {};
    events.forEach(e => {
      const key = toLocalDateKey(e.start);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const calendarEventExists = async (
    calendarId: string,
    e: EventType
  ): Promise<boolean> => {
    try {
      const existing = await ExpoCalendar.getEventsAsync(
        [calendarId],
        new Date(e.start.getTime() - 60 * 1000),
        new Date(e.end.getTime() + 60 * 1000)
      );
      return existing.some(
        ev =>
          ev.title === e.title &&
          new Date(ev.startDate).getTime() === e.start.getTime()
      );
    } catch {
      return false;
    }
  };

  const askSeriesChoice = (
    count: number,
    title: string,
    lastDate: Date
  ): Promise<'single' | 'series' | 'cancel'> =>
    new Promise(resolve => {
      Alert.alert(
        'Add series?',
        `There are ${count} upcoming occurrences of "${title}" until ${lastDate.toLocaleDateString()}.`,
        [
          { text: 'Only this', onPress: () => resolve('single') },
          { text: `All ${count}`, onPress: () => resolve('series') },
          { text: 'Cancel', style: 'cancel', onPress: () => resolve('cancel') },
        ],
        { cancelable: true }
      );
    });

  const addEventToCalendar = async (evt: EventType) => {
    try {
      const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Calendar permission is needed to add events.'
        );
        return;
      }

      const calendars = await ExpoCalendar.getCalendarsAsync(
        ExpoCalendar.EntityTypes.EVENT
      );
      const writable = calendars.find(c => c.allowsModifications);
      if (!writable) {
        Alert.alert('Error', 'No writable calendar found');
        return;
      }

      const MAX_SERIES_SPAN_DAYS = 180;
      const related = events
        .filter(
          e =>
            e.title === evt.title &&
            e.start >= evt.start &&
            e.start.getTime() - evt.start.getTime() <=
              MAX_SERIES_SPAN_DAYS * 24 * 60 * 60 * 1000
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      let targets: EventType[] = [evt];
      if (related.length > 1) {
        const last = related[related.length - 1].start;
        const choice = await askSeriesChoice(
          related.length,
          evt.title,
          last
        );
        if (choice === 'cancel') return;
        if (choice === 'series') targets = related;
      }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      for (const e of targets) {
        const exists = await calendarEventExists(writable.id, e);
        if (exists) continue;
        await ExpoCalendar.createEventAsync(writable.id, {
          title: e.title,
          startDate: e.start,
          endDate: e.end,
          timeZone: tz,
        });
      }

      Alert.alert(
        'Added',
        targets.length > 1
          ? 'Events added to your calendar'
          : 'Event added to your calendar'
      );
    } catch (err) {
      console.warn('Failed to add event', err);
      Alert.alert('Error', 'Could not add event to calendar');
    }
  };

  const markedDates: CalendarProps['markedDates'] = useMemo(() => {
    const m: CalendarProps['markedDates'] = {};
    Object.keys(eventsByDate).forEach(day => {
      m[day] = { marked: true, dotColor: '#dc2626' };
    });
    m[selectedDate] = {
      ...(m[selectedDate] || {}),
      selected: true,
      selectedColor: '#000',
      selectedTextColor: '#fff',
    };
    return m;
  }, [eventsByDate, selectedDate]);

  if (loading && events.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#dc2626" />
      </SafeAreaView>
    );
  }

  const todaysEvents = eventsByDate[selectedDate] || [];

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView contentContainerStyle={{ padding: 16 }} className='bg-white'>
      
          <View className="overflow-hidden rounded-2xl shadow-md">
          <Calendar
            current={toLocalDateKey(displayMonth)}
            onMonthChange={date => setDisplayMonth(new Date(date.year, date.month - 1, 1))}
            markingType="dot"
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            style={{ backgroundColor: '#dc2626' }}
            theme={{
              calendarBackground: '#fff',
              monthTextColor: '#fff',
              arrowColor: '#fff',
              textMonthFontSize: 18,
              textSectionTitleColor: '#fef2f2',
              dayTextColor: '#000',
              todayTextColor: '#dc2626',
              textDisabledColor: '#d3d3d3',
              dotColor: '#dc2626',
              selectedDayBackgroundColor: '#000',
              selectedDayTextColor: '#fff',
            }}
          />
        </View>

        <View className="bg-gray-100 h-full rounded-t-2xl p-4 mt-3 shadow-md">
          {todaysEvents.length === 0 ? (
            <Text className="text-gray-500 italic">No events</Text>
          ) : (
            todaysEvents.map(evt => (
              <View key={evt.id} className="flex-row items-center justify-between mb-3">
                <View className="flex-1 pr-2">
                  <Text className="font-bold">
                    {formatTime(evt.start)} – {formatTime(evt.end)}
                  </Text>
                  <Text className="font-medium">{evt.title}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => addEventToCalendar(evt)}
                  className="bg-red-600 px-4 py-1 rounded"
                >
                  <Text className="text-white text-sm">Add</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
