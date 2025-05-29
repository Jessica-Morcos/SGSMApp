import { useRouter } from "expo-router";
import React from "react";
import { Button, Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnnouncementCard from "@/src/_components/AnnouncementCard";
import DailyVerse from "@/src/_components/DailyVerse";
import { TodayHeader } from "@/src/_components/TodayHeader";
import { useAnnouncements } from "@/src/hooks/useAnnouncements";
import { useEvents } from "@/src/hooks/useEvents";
import headerIMG from "../../assets/images/HomeHeader.png";

function toLocalDateKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export default function Index() {
  const { events, loading } = useEvents()
  const today = new Date()
  const todayKey = toLocalDateKey(today)
  const todaysEvents = events.filter(evt => toLocalDateKey(evt.start) === todayKey)
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })

  const router = useRouter();
  const announcements = useAnnouncements(3);
  

 

  return (
    <>
      {/* Top red safe area */}
      <SafeAreaView className="bg-primary">
        <StatusBar backgroundColor="#DD3333" barStyle="light-content" />
      </SafeAreaView>

      {/* Main white content area */}
      <SafeAreaView className="flex-1 bg-white" edges={['bottom','left','right']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <Image
            source={headerIMG}
            className="w-full h-[18rem] mt-0 mb-5"
            resizeMode="stretch"
          />

          <View className="items-center">
            <DailyVerse />
          </View>

          <View className="px-4 mt-6 w-full ml-4">
            <View className="flex-col justify-between items-start mb-2">
              <Text className="text-2xl font-bold">Today</Text>
              <View className="w-8 left-8 h-[2px] bg-gray-300 my-1" />
              <Text className="text-red-600 text-xl font-semibold">
                {new Date().toLocaleDateString(undefined, { weekday: 'long' })}
              </Text>
            </View>
          </View>

          <TodayHeader date={today} events={todaysEvents} fmtTime={fmt} />

          <View className="px-4 mt-2">
            <Text className="text-2xl font-bold">Announcements</Text>
            <View className="mt-4">
              {announcements.map((a, i) => (
                <AnnouncementCard
                  key={a.id}
                  date={a.date}
                  title={a.title.rendered}
                  excerpt={a.excerpt.rendered}
                  imageUrl={a._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
                  borderColor={i % 2 === 0 ? "border-blue-300" : "border-red-300"}
                  onPress={() =>
                    router.push({
                      pathname: "/announcements/[id]",
                      params: { id: a.id.toString() },
                    })
                  }
                />
              ))}
              <Button
                title="See More"
                onPress={() => router.push({ pathname: "/announcements" })}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
