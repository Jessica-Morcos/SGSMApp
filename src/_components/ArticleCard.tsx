// src/_components/ArticleCard.tsx
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { GestureResponderEvent, Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  date: string;
  title: string;
  imageUrl?: string;
  onPress: (e: GestureResponderEvent) => void;
  borderColor?: string;
};

export default function ArticleCard({
  date,
  title,
  imageUrl,
  onPress,
  borderColor = "border-gray-200",
}: Props) {
  // Determine if title text is Arabic (basic check for Arabic Unicode range)
  const isArabic = /[\u0600-\u06FF]/.test(title);

  // Remove any HTML tags from the title (WordPress API may include some tags)
  const plainTitle = title.replace(/<\/?[^>]+>/g, "");

  // Format date (e.g. "Jan 1, 2024"), using device locale
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity 
      onPress={onPress} 
      className={`flex-row items-center p-4 mb-4 rounded-lg border ${borderColor} bg-white`}>
      {/* Article Image Thumbnail (if available) */}
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          className="w-16 h-16 mr-3 rounded-md" 
          resizeMode="cover" 
        />
      ) : null}
      {/* Text content (date and title) */}
      <View className="flex-1 pr-2">
        <Text 
          className={`text-xs text-gray-400 ${isArabic ? "text-right" : "text-left"}`}>
          {formattedDate}
        </Text>
        <Text 
          className={`text-lg font-semibold mt-1 ${isArabic ? "text-right" : "text-left"}`}>
          {plainTitle}
        </Text>
      </View>
      {/* Right-facing arrow icon */}
      <FontAwesome 
        name="chevron-right" 
        size={20} 
        color="#9ca3af"  /* Tailwind gray-400 */ 
      />
    </TouchableOpacity>
  );
}
