import { useRouter } from "expo-router";
import React from "react";
import { Button, Image, SafeAreaView, ScrollView, Text, View } from "react-native";


import AnnouncementCard from "@/src/_components/AnnouncementCard";
import DailyVerse from "@/src/_components/DailyVerse";
import { TodayHeader } from "@/src/_components/TodayHeader";
import { useAnnouncements } from "@/src/hooks/useAnnouncements";
import { useEvents } from "@/src/hooks/useEvents";

import headerIMG from "../../assets/images/HomeHeader.png";

export default function Index() {
  const router        = useRouter();
  const announcements = useAnnouncements(3);
  const { events }    = useEvents();

  const todayKey = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(e =>
    e.start.toISOString().startsWith(todayKey)
  );
  const fmt = (date: Date) =>
    date.toLocaleTimeString([], {
      hour:   'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
  return (
    <SafeAreaView className="flex-1 dark:bg-black bg-primary">
     
      <ScrollView className='bg-white '  contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className=" bg-primary flex-0 w-full absolute h-[10%] "></View> 
        <Image
              source={headerIMG}
              className="w-full h-[18rem] android:mt-[10%]  mb-5"
              resizeMode="stretch"
            />
        

        <View className="items-center ">
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
        <TodayHeader date={new Date()} events={todaysEvents} fmtTime={fmt} />
        
        <View className="px-4 mt-2">
              <Text className="text-2xl font-bold">Announcements</Text>
              <View className="mt-4">
                {announcements.map((a, i) => (
                  <AnnouncementCard
                    key={a.id}
                    date={a.date}
                    title={a.title.rendered}
                    excerpt={a.excerpt.rendered}
                    imageUrl={
                      a._embedded?.["wp:featuredmedia"]?.[0]?.source_url
                    }
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
  );
}
