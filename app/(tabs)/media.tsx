import MediaCard from '@/_components/MediaCard';
import { WPPost } from '@/hooks/useArticles';
import { useMedia } from '@/hooks/useMedia';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MediaList() {
  const { media, loading, error } = useMedia(100);
  const [showHymns, setShowHymns] = useState(true);
  const [oldestFirst, setOldestFirst] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    return media.filter((m: WPPost) =>
      m._embedded?.['wp:term']?.flat().some((t: any) =>
        showHymns ? t.name === 'Hymns' : t.name === 'Sermons'
      )
    );
  }, [media, showHymns]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) =>
      oldestFirst
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filtered, oldestFirst]);

  const renderBody = () => {
    if (loading && media.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (error && media.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center mt-10">Failed to load media.</Text>
        </View>
      );
    }

    return (
      <>
        <View className="flex-row justify-center mb-4">
          <ToggleBtn
            label="Hymns"
            active={showHymns}
            onPress={() => setShowHymns(true)}
          />
          <ToggleBtn
            label="Sermons"
            active={!showHymns}
            onPress={() => setShowHymns(false)}
          />
        </View>

        <View className="flex-row justify-end mb-3">
          <TouchableOpacity
            onPress={() => setOldestFirst((v) => !v)}
            className="bg-gray-100 px-3 py-2 rounded"
          >
            <Text className="text-sm text-gray-800">
              {oldestFirst ? 'Newest First' : 'Oldest First'}
            </Text>
          </TouchableOpacity>
        </View>

        {sorted.map((item) => (
          <MediaCard
            key={item.id}
            date={item.date}
            title={item.title.rendered}
            imageUrl={item._embedded?.['wp:featuredmedia']?.[0]?.source_url}
            onPress={() => router.push(`/(media)/${item.id}`)}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
}

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
