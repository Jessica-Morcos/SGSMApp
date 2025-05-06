import React from "react";
import { Text, View } from "react-native";

type Event = { id: string; title: string; start: Date; end: Date };
interface Props {
  date: Date;
  events: Event[];
  fmtTime: (d: Date) => string;
}

export function TodayHeader({ date, events, fmtTime }: Props) {
  const day   = date.getDate();
  const year  = date.getFullYear();
  const month = date
    .toLocaleString("default", { month: "long" })
    .toUpperCase();

  return (
    <View className="flex-row items-start ml-4 px-4 py-3">
      {/* LEFT: big date */}
      <View className="flex-shrink-0 items mr-[15%]">
        <Text
          allowFontScaling={false}
          className="text-[30px] font-bold"
        >
          {day}.{year}
        </Text>
        <Text
          allowFontScaling={false}
          className="text-[45px] ios:text-[50px] font-medium "
        >
          {month}
        </Text>
      </View>

      {/* DIVIDER */}
      <View className="w-px bg-gray-300 mx-6 self-stretch" />

      {/* RIGHT: event list */}
      <View className="flex-1 justify-center">
        {events.length === 0 ? (
          <Text allowFontScaling={false} className="text-gray-500 text-lg">
            No services
          </Text>
        ) : (
          events.map(evt => (
            <View key={evt.id} className="flex-col items-center mb-2">
              <Text allowFontScaling={false} className="w-24 text-right text-xl font-bold">
                {fmtTime(evt.start)}–{fmtTime(evt.end)}
              </Text>
              <Text allowFontScaling={false} className="ml-4 text-xl font-medium">
                {evt.title}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
