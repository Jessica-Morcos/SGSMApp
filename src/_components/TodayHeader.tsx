import React from 'react';
import { Text, View } from 'react-native';

type Event = { id: string; title: string; start: Date; end: Date }
interface Props {
  date: Date
  events: Event[]
  fmtTime: (d: Date) => string
}

export function TodayHeader({ date, events, fmtTime }: Props) {
  const day = date.getDate()
  const year = date.getFullYear()
  const month = date.toLocaleString('default', { month: 'long' }).toUpperCase()

  return (
    <View className="flex-row items-start ml-4 px-4 py-3">
      <View className="flex-shrink-0 items mr-[15%]">
        <Text allowFontScaling={false} className="text-[30px] font-bold">
          {day}.{year}
        </Text>
        <Text allowFontScaling={false} className="text-[45px] ios:text-[50px] font-medium">
          {month}
        </Text>
      </View>

      <View className="w-px bg-gray-300 mx-3 self-stretch" />

      <View className="flex-1 justify-center">
        {events.length === 0 ? (
          <Text allowFontScaling={false} className="text-gray-500 text-lg">
            No services
          </Text>
        ) : (
          events.map(evt => (
            <View key={evt.id} className="flex-col items-end mb-3">
              <Text allowFontScaling={false} className=" text-s font-bold">
                {fmtTime(evt.start)}–{fmtTime(evt.end)}
              </Text>
              <Text allowFontScaling className="  text-s font-medium">
                {evt.title}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}
