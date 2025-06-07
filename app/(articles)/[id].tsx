// app/articles/[id].tsx
import { WPPost } from '@/hooks/useArticles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { decode } from 'html-entities';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();
  const width = Dimensions.get('window').width;
  const STORAGE_KEY = `cached_wp_article_${id}`;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setPost(JSON.parse(json));
        setLoading(false);
      }
      setError(false);
      try {
        const res = await fetch(
          `https://stgeorge-stmercurius.com/wp-json/wp/v2/project/${id}?_embed`
        );
        if (!res.ok) throw new Error();
        const data: WPPost = await res.json();
        setPost(data);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#DD3333" />
      </View>
    );
  }
  if (error || !post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Article not found.</Text>
      </View>
    );
  }

  const rawTitle = post.title.rendered.replace(/<[^>]+>/g, '');
  const cleanTitle = decode(rawTitle);
  const isArabic = /[\u0600-\u06FF]/.test(cleanTitle);
  const imgUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView className="px-4 pb-24">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary mb-4">← Back</Text>
        </TouchableOpacity>

        {imgUrl && (
          <Image
            source={{ uri: imgUrl }}
            className="w-full h-48 rounded-lg mb-4"
          />
        )}

        <Text
          className={`text-2xl font-bold mb-2 ${
            isArabic ? 'text-right' : 'text-left'
          }`}
        >
          {cleanTitle}
        </Text>

        <Text className="text-gray-400 text-sm mb-6">
          {new Date(post.date).toLocaleDateString()}
        </Text>

        <RenderHTML
          contentWidth={width - 32}
          source={{ html: post.content.rendered }}
          baseStyle={{
            fontSize: 16,
            lineHeight: 24,
            color: isArabic ? '#000' : '#333',
            writingDirection: isArabic ? 'rtl' : 'ltr',
            textAlign: isArabic ? 'right' : 'left',
          }}
          tagsStyles={{
            p: { marginBottom: 12 },
            h1: { fontSize: 24, fontWeight: '700', marginVertical: 16 },
            h2: { fontSize: 20, fontWeight: '600', marginVertical: 14 },
            h3: { fontSize: 18, fontWeight: '600', marginVertical: 12 },
            ul: { marginVertical: 12, paddingLeft: 20 },
            ol: { marginVertical: 12, paddingLeft: 20 },
            li: { marginBottom: 6 },
            a: { color: '#DD3333', textDecorationLine: 'underline' },
            strong: { fontWeight: '700' },
            em: { fontStyle: 'italic' },
            blockquote: {
              borderLeftWidth: 4,
              borderLeftColor: '#ddd',
              paddingLeft: 12,
              marginVertical: 12,
              fontStyle: 'italic',
            },
            img: { marginVertical: 16, borderRadius: 8 },
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
