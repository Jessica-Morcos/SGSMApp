// app/(tabs)/calendar.tsx
import { useEvents } from '@/hooks/useEvents'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { Calendar, CalendarProps, DateData } from 'react-native-calendars'
import { SafeAreaView } from 'react-native-safe-area-context'
type MarkedDates = CalendarProps['markedDates']

function toLocalDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

export default function CalendarScreen() {
  const { events, loading } = useEvents()

  // what month is showing
  const [displayMonth, setDisplayMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  // what day is selected
  const [selectedDate, setSelectedDate] = useState(toLocalDateKey(new Date()))

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {}
    events.forEach(e => {
      const key = toLocalDateKey(e.start)
      ;(map[key] || (map[key] = [])).push(e)
    })
    return map
  }, [events])

  const markedDates: MarkedDates = useMemo(() => {
    const m: MarkedDates = {}
    Object.keys(eventsByDate).forEach(day => {
      m[day] = { marked: true, dotColor: '#dc2626' }
    })
    m[selectedDate] = {
      ...(m[selectedDate] || {}),
      selected: true,
      selectedColor: '#000',
      selectedTextColor: '#fff',
    }
    return m
  }, [eventsByDate, selectedDate])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#dc2626" />
      </SafeAreaView>
    )
  }

  const todaysEvents = eventsByDate[selectedDate] || []

  return (
    <>
      
      <SafeAreaView className="flex-1 bg-primary">
        <ScrollView contentContainerStyle={{ padding: 16 }} className='bg-white'>
          <Text className="text-center text-2xl font-bold mb-4">
            {displayMonth.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <View className="overflow-hidden rounded-2xl shadow-md">
            <Calendar
              current={displayMonth.toISOString().split('T')[0]}
              onMonthChange={m =>
                setDisplayMonth(new Date(m.year, m.month - 1, 1))
              }
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
                <View key={evt.id} className="flex-row justify-between mb-3">
                  <Text className="font-bold">
                    {formatTime(evt.start)} – {formatTime(evt.end)}
                  </Text>
                  <Text className="font-medium ml-2 flex-1">{evt.title}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
