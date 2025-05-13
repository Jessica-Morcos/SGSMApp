import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface BibleVerse { reference: string; text: string; }

// storage + TTL
const STORAGE_KEY = "dailyVerseCache";
const DATE_KEY    = "dailyVerseDate";
const TTL_MS      = 1000 * 60 * 60;

// --- API.Bible config ---
const API_KEY    = process.env.EXPO_PUBLIC_BIBLE_API_KEY || "";
const BIBLE_ID   = "685d1470fe4d5c3b-01";
const SEARCH_QUERY = "strength";
const SEARCH_URL = `https://api.scripture.api.bible/v1/bibles/`
  + `${BIBLE_ID}/search?query=${encodeURIComponent(SEARCH_QUERY)}&limit=1`;

function splitSentences(p: string): string[] {
  const m = p.match(/[^.!?]+[.!?]+/g);
  return m ? m.map(s => s.trim()) : [p];
}

export default function DailyVerse() {
  const [lines, setLines]         = useState<string[]>([]);
  const [reference, setReference] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);


  useEffect(() => {
    (async () => {
      const now   = Date.now();
      const [raw, tsStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(DATE_KEY),
      ]);
      const ts = tsStr ? parseInt(tsStr, 10) : 0;

      if (raw && now - ts < TTL_MS) {
        const { ref, lines } = JSON.parse(raw);
        setReference(ref);
        setLines(lines);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(SEARCH_URL, {
          headers: { "api-key": API_KEY }
        });
        const json = await res.json();
        const verses = (json.data as any).verses as BibleVerse[];

        if (verses.length) {
          const v   = verses[0];
          const ref = v.reference;
          const text = v.text;                 // ← changed here
          const two  = splitSentences(text).slice(0, 2);

          const blob = JSON.stringify({ ref, lines: two });
          await AsyncStorage.multiSet([
            [STORAGE_KEY, blob],
            [DATE_KEY, now.toString()],
          ]);

          setReference(ref);
          setLines(two);
        }
      } catch (e) {
        console.warn("Failed to fetch verse:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View className="w-full px-6 py-8 bg-white rounded-t-3xl items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!reference) {
    return (
      <View className="w-full px-6 py-8 bg-white  items-center">
        <Text className="text-center text-gray-500">
          Couldn’t load today’s verse.
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full px-4 bg-white items-center">
      {lines.map((l,i) => (
        <Text
          key={i}
          className="self-stretch text-center text-lg italic mb-2"
        >
          {l}
        </Text>
      ))}
      <Text className="self-stretch text-center text-sm text-gray-700">
        {reference}
      </Text>
    </View>
  )
  
}
