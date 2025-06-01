import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MediaCard from '@/_components/MediaCard';
import { useMedia } from '@/hooks/useMedia';

export default function MediaList() {
  const { media, loading, error } = useMedia(100);
  const [hymnsOldest, setHymnsOldest]   = useState(false);
  const [sermonsOldest, setSermonsOldest] = useState(false);
  const router = useRouter();

  if (loading) return <ActivityIndicator className="flex-1 justify-center" />;
  if (error)   return <Text className="flex-1 text-center">Failed to load.</Text>;

  
  const hymns = media.filter(m =>
    m._embedded?.['wp:term']?.flat().some((t:any) => t.name === 'Hymns')
  );
  const sermons = media.filter(m =>
    m._embedded?.['wp:term']?.flat().some((t:any) => t.name === 'Sermons')
  );


  const sortByDate = (arr:any[], oldest:boolean) =>
    [...arr].sort((a,b)=>
      oldest
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const hymnsSorted = sortByDate(hymns, hymnsOldest);
  const sermonsSorted = sortByDate(sermons, sermonsOldest);

  return (
    <SafeAreaView edges={['bottom' , 'top']} className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:100 }}>
        {/* Hymns header */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-bold">Hymns</Text>
          <TouchableOpacity
            onPress={()=>setHymnsOldest(v=>!v)}
            className="bg-gray-100 px-3 py-2 rounded"
          >
            <Text className="text-sm">
              {hymnsOldest ? 'Newest First' : 'Oldest First'}
            </Text>
          </TouchableOpacity>
        </View>
        {hymnsSorted.map(item=>(
          <MediaCard
            key={item.id}
            date={item.date}
            title={item.title.rendered}
            imageUrl={item._embedded?.['wp:featuredmedia']?.[0]?.source_url}
            onPress={()=>router.push(`/(media)/${item.id}`)}
          />
        ))}

       
        <View className="flex-row justify-between items-center mt-6 mb-3">
          <Text className="text-xl font-bold">Sermons</Text>
          <TouchableOpacity
            onPress={()=>setSermonsOldest(v=>!v)}
            className="bg-gray-100 px-3 py-2 rounded"
          >
            <Text className="text-sm">
              {sermonsOldest ? 'Newest First' : 'Oldest First'}
            </Text>
          </TouchableOpacity>
        </View>
        {sermonsSorted.map(item=>(
          <MediaCard
            key={item.id}
            date={item.date}
            title={item.title.rendered}
            imageUrl={item._embedded?.['wp:featuredmedia']?.[0]?.source_url}
            onPress={()=>router.push(`/(media)/${item.id}`)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
