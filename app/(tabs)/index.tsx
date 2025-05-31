// app/(tabs)/index.tsx
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnnouncementCard from "@/src/_components/AnnouncementCard";
import DailyVerse from "@/src/_components/DailyVerse";
import { TodayHeader } from "@/src/_components/TodayHeader";
import { useAnnouncements } from "@/src/hooks/useAnnouncements";
import { useEvents } from "@/src/hooks/useEvents";
import headerIMG from "../../assets/images/HomeHeader.png";

function toLocalDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HomeTab() {
  const opacity = useRef(new Animated.Value(0)).current;
  const { events } = useEvents();
  const router = useRouter();
  const announcements = useAnnouncements(3);

  // Whenever this tab is focused, fade in from opacity 0 → 1
  useFocusEffect(
    useCallback(() => {
      // Reset opacity to 0
      opacity.setValue(0);
      // Animate to opacity = 1 over 300ms
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [opacity])
  );

  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const todaysEvents = events.filter(
    (evt) => toLocalDateKey(evt.start) === todayKey
  );
  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Top red safe area */}
      <SafeAreaView className="bg-primary">
        <StatusBar style="light" backgroundColor="#DD3333" />
      </SafeAreaView>

      {/* Main white content area */}
      <SafeAreaView className="flex-1 bg-white" edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <Image
            source={headerIMG}
            className="w-full h-[18rem] mb-5"
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
                {today.toLocaleDateString(undefined, { weekday: "long" })}
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
            </View>
            <View className="mt-4">
              <Text
                className="text-center text-red-600 font-semibold"
                onPress={() => router.push({ pathname: "/announcements" })}
              >
                See More
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
