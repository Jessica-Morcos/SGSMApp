// app/(tabs)/Articles.tsx
import ArticleCard from '@/_components/ArticleCard';
import { useArticles } from '@/hooks/useArticles';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,

  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ARTICLE_CAT = 14;  // “Written by Fr. Antonius Zikry”
const MEDIA_CAT   = 15;  // Audio & Video (to exclude)
const ENG_CAT     = 22;  // English articles
const AR_CAT      = 23;  // Arabic articles

export default function Articles() {
  const { articles, loading, error } = useArticles(100);
  const [showEnglish, setShowEnglish] = useState(true);
  const [oldestFirst, setOldestFirst] = useState(false);
  const router = useRouter();

  
  const onlyWritten = useMemo(
    () =>
      articles.filter(p => {
        const cats = p.project_category || [];
        return cats.includes(ARTICLE_CAT) && !cats.includes(MEDIA_CAT);
      }),
    [articles]
  );

  
  const byLanguage = useMemo(
    () =>
      onlyWritten.filter(p => {
        const cats = p.project_category || [];
        return showEnglish
          ? cats.includes(ENG_CAT)
          : cats.includes(AR_CAT);
      }),
    [onlyWritten, showEnglish]
  );

  // 3) Sort by date
  const sorted = useMemo(
    () =>
      byLanguage.slice().sort((a, b) => {
        const ad = new Date(a.date).getTime();
        const bd = new Date(b.date).getTime();
        return oldestFirst ? ad - bd : bd - ad;
      }),
    [byLanguage, oldestFirst]
  );

  if (loading)
    return <ActivityIndicator className="flex-1 justify-center" />;
  if (error)
    return <Text className="flex-1 text-center mt-10">
      Failed to load articles.
    </Text>;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

        {/* Language Toggle */}
        <View className="flex-row justify-center mb-4">
          <ToggleBtn
            label="English"
            active={showEnglish}
            onPress={() => setShowEnglish(true)}
          />
          <ToggleBtn
            label="Arabic"
            active={!showEnglish}
            onPress={() => setShowEnglish(false)}
          />
        </View>

  
        <View className="flex-row justify-end mb-3">
          <TouchableOpacity
            onPress={() => setOldestFirst(v => !v)}
            className="bg-gray-100 px-3 py-2 rounded"
          >
            <Text className="text-sm text-gray-800">
              {oldestFirst ? 'Newest First' : 'Oldest First'}
            </Text>
          </TouchableOpacity>
        </View>

   
        {sorted.map(post => (
          <ArticleCard
            key={post.id}
            date={post.date}
            title={post.title.rendered}
            imageUrl={post._embedded?.['wp:featuredmedia']?.[0]?.source_url}
            onPress={() => router.push(`/(articles)/${post.id}`)}
          />
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable toggle button
function ToggleBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 mx-1 rounded-full ${
        active ? 'bg-primary' : 'bg-gray-200'
      }`}
    >
      <Text className={active ? 'text-white font-medium' : 'text-gray-700'}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
