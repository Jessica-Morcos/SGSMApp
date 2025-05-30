// app/announcements/[id].tsx
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AnnouncementDetail() {
  // — routing & focus —
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isFocused = useIsFocused();

  // — for RenderHTML & sizing —
  const { width } = useWindowDimensions();

  // — post + gallery state —
  const [post, setPost] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [safeHtml, setSafeHtml] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
      
        const p = await fetch(
          `https://stgeorge-stmercurius.com/wp-json/wp/v2/posts/${id}?_embed`
        ).then((r) => r.json());
        setPost(p);

  
        let html = p.content.rendered as string;
        html = html
          // remove any WP “figure” blocks
          .replace(/<figure[\s\S]*?<\/figure>/gi, "")
          // remove any <ul>…</ul> (drop stray bullets)
          .replace(/<ul[\s\S]*?<\/ul>/gi, "")
          // then strip standalone <img>, <iframe>, <script>
          .replace(/<img[\s\S]*?>/gi, "")
          .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
          .replace(/<script[\s\S]*?<\/script>/gi, "");
        setSafeHtml(html);

        // 3) fetch _all_ attached media (paginated)
        const allMedia: any[] = [];
        let page = 1;
        while (true) {
          const batch: any[] = await fetch(
            `https://stgeorge-stmercurius.com/wp-json/wp/v2/media?parent=${id}&per_page=100&page=${page}`
          ).then((r) => r.json());
          if (!Array.isArray(batch) || batch.length === 0) break;
          allMedia.push(...batch);
          if (batch.length < 100) break;  // no more pages
          page++;
        }
        setGallery(allMedia);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  if (!post) {
    return <Text className="p-4">Loading post…</Text>;
  }


  const featuredUrl =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  const featuredDetails =
    post._embedded?.["wp:featuredmedia"]?.[0]?.media_details;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white dark:bg-black">
      <ScrollView className="pb-8 bg-white">
        {/* FRAME CONTAINER */}
        <View className="border border-gray-300 rounded-lg overflow-hidden">

          {/* HEADER: back button + title + date */}
          <View className="px-4 py-3 bg-gray-50">
            <TouchableOpacity
              onPress={() => router.back()}
              className="self-start mb-2 px-3 py-1 bg-gray-200 rounded"
            >
              <Text>{"← Back to announcements"}</Text>
            </TouchableOpacity>

         
          </View>

          {/* FEATURED IMAGE */}
          {featuredUrl && featuredDetails && (
            <Image
              source={{ uri: featuredUrl }}
              style={{
                width: width, // account for px-4 on either side
                aspectRatio:
                  featuredDetails.width / featuredDetails.height,
              }}
              resizeMode="contain"
            />
          )}
          <View className="px-4 py-3 bg-gray-50">
            

            <Text className="text-2xl font-bold">
              {post.title.rendered.replace(/<\/?[^>]+(>|$)/g, "")}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {new Date(post.date).toLocaleDateString()}
            </Text>
          </View>
          {/* HTML CONTENT */}
          {isFocused ? (
            <View className="px-4 py-4">
              <RenderHTML
                contentWidth={width - 32}
                source={{ html: safeHtml }}
                ignoredDomTags={[
                  "iframe",
                  "script",
                  "img",
                  "ul",
                  "li",
                  "figure",
                ]}
                baseStyle={{ lineHeight: 20 }}
              />
            </View>
          ) : (
            <Text className="p-4">Preparing content…</Text>
          )}

     
          {gallery.map((img) => {
            const md = img.media_details;
            return (
              <Image
                key={img.id}
                source={{ uri: img.source_url }}
                style={{
                  width: width,
                  aspectRatio: md.width / md.height,
                }}
                resizeMode="contain"
                className=""
              />
            );
          })}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
