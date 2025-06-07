// components/MediaCard.tsx
import { decode } from 'html-entities';
import { PlayCircle } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  title: string;
  date: string;
  imageUrl?: string;
  onPress: () => void;
}

export default function MediaCard({ title, date, imageUrl, onPress }: Props) {
  const raw = title.replace(/<[^>]+>/g, '');
  const cleanTitle = decode(raw);
  const isArabic = /[\u0600-\u06FF]/.test(cleanTitle);
  console.log("Rendering MediaCard:", cleanTitle, "→ imageUrl =", imageUrl);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-lg border border-gray-200 p-0.5 mb-4 pr-4"
    >
      {imageUrl && (
        <View className="mr-4 relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-20 h-20 rounded-lg left-3 top-4 "
          />
          <PlayCircle
            size={32}
            color="rgba(255,255,255,0.8)"
            className="absolute left-2 top-2 "
          />
        </View>
      )}
      <View className="flex-1 p-2">
        <Text className="text-gray-400 text-xs ">
          {new Date(date).toLocaleDateString()}
        </Text>
        <Text
          className={`text-base font-medium ${
            isArabic ? 'text-right' : 'text-left'
          }`}
          numberOfLines={3}
        >
          {cleanTitle}
        </Text>
      </View>
      <PlayCircle size={20} color="#888" />
    </TouchableOpacity>
  );
}
