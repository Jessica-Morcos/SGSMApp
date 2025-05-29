import ArticleCard from "@/src/_components/ArticleCard";
import { useArticles } from "@/src/hooks/useArticles";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ArticlesList() {
  const router = useRouter();
  const { articles, loading, error } = useArticles(20);
  const [oldestFirst, setOldestFirst] = useState(false);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#DD3333" />
      </View>
    );

  if (error)
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-red-500">Failed to load articles.</Text>
      </View>
    );

  const sorted = [...articles].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return oldestFirst ? da - db : db - da;
  });

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
    >
      <View className="flex-row justify-end mb-3">
        <TouchableOpacity
          onPress={() => setOldestFirst((v) => !v)}
          className="bg-gray-100 px-3 py-2 rounded"
        >
          <Text className="text-sm text-gray-800">
            {oldestFirst ? "Newest First" : "Oldest First"}
          </Text>
        </TouchableOpacity>
      </View>

      {sorted.map((art) => (
        <ArticleCard
          key={art.id}
          date={art.date}
          title={art.title.rendered}
          imageUrl={art._embedded?.["wp:featuredmedia"]?.[0]?.source_url}
          onPress={() => router.push(`/articles/${art.id}`)}
        />
      ))}
    </ScrollView>
  );
}
