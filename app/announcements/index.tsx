
import AnnouncementCard from "@/_components/AnnouncementCard";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";

export default function AnnouncementsList() {
  const router = useRouter();
  const all = useAnnouncements(20); // load more

  return (
    <ScrollView className="p-4 bg-white">
      {all.map((a, i) => (
        <AnnouncementCard
          key={a.id}
          date={a.date}
          title={a.title.rendered}
          excerpt={a.excerpt.rendered}
          imageUrl={a._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
          borderColor="border-gray-200"
          onPress={() =>
            router.push({ pathname: "/announcements/[id]", params: { id: a.id.toString() } })
          }
        />
      ))}
    </ScrollView>
  );
}
