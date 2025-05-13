
import React from "react";
import {
    GestureResponderEvent,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  date: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  onPress: (e: GestureResponderEvent) => void;
  borderColor?: string; 
};

export default function AnnouncementCard({
  date,
  title,
  excerpt,
  imageUrl,
  onPress,
  borderColor = "border-gray-200",
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} className={`flex-row items-center p-4 mb-4 rounded-lg border ${borderColor}`}>
      <View className="flex-1 pr-2">
        <Text className="text-xs text-gray-400">
          {new Date(date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        <Text className="text-lg font-semibold mt-1">
          {title.replace(/<\/?[^>]+(>|$)/g, "")}
        </Text>
        <Text className="text-red-400 mt-2">read more…</Text>
      </View>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-16 h-16 rounded-md"
          resizeMode="cover"
        />
      ) : null}
    </TouchableOpacity>
  );
}
