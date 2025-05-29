// app/articles/[id].tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";

interface WPPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

export default function ArticleDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch("https://stgeorge-stmercurius.com/wp-json/wp/v2/posts?per_page=20&_embed")


      .then((r) => r.json())
      .then((data: WPPost) => setPost(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#DD3333" />
      </View>
    );
  if (error || !post)
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-red-500">Couldn’t load article.</Text>
      </View>
    );

  const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const formattedDate = new Date(post.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const cleanTitle = post.title.rendered.replace(/<\/?[^>]+>/g, "");

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
    >
      <Text
        onPress={() => router.back()}
        className="text-sm text-primary mb-4"
      >
        ← Back
      </Text>

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-48 mb-4 rounded-lg"
          resizeMode="cover"
        />
      )}

      <Text className="text-xs text-gray-400">{formattedDate}</Text>
      <Text className="text-2xl font-bold mt-1 mb-4">{cleanTitle}</Text>

      <RenderHTML
        source={{ html: post.content.rendered }}
        contentWidth={width - 32}
      />
    </ScrollView>
  );
}