// app/(media)/[id].tsx
import { WPPost } from '@/hooks/useArticles';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import {
  AudioPlayer as ExpoAudioPlayer,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { decode } from 'html-entities';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

function formatTime(seconds: number): string {
  const sec = Math.floor(seconds);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`;
}

function AudioPlayer({
  src,
  index,
  onPlay,
  onRef,
}: {
  src: string;
  index: number;
  onPlay: (idx: number) => void;
  onRef?: (player: ExpoAudioPlayer | null) => void;
}) {
  const player = useAudioPlayer({ uri: src });
  const status = useAudioPlayerStatus(player);
  const [seeking, setSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Expose the player instance upstream
  useEffect(() => {
    onRef?.(player);
    return () => {
      onRef?.(null);
    };
  }, [player]);

  // Sync sliderValue → status.currentTime when not dragging
  useEffect(() => {
    if (!seeking && typeof status.currentTime === 'number') {
      setSliderValue(status.currentTime);
    }
  }, [status.currentTime, seeking]);

  const onTogglePlay = async () => {
    if (status.playing) {
      player.pause();
    } else {
      try {
        onPlay(index);
        await player.play();
      } catch (e: any) {
        console.warn('AudioPlayer.play() failed:', e);
        // You could set some local UI‐state here if you want to show an error message
      }
    }
  };

  const onSkipBackward = () => {
    if (typeof status.currentTime === 'number') {
      player.seekTo(Math.max(status.currentTime - 15, 0));
    }
  };

  const onSkipForward = () => {
    if (
      typeof status.currentTime === 'number' &&
      typeof status.duration === 'number'
    ) {
      player.seekTo(Math.min(status.currentTime + 15, status.duration));
    }
  };

  // 1) If src is empty, show a placeholder
  if (!src) {
    return (
      <View className="mx-4 my-2 p-3 bg-gray-100 rounded-lg">
        <Text className="text-center text-gray-500">No audio source</Text>
      </View>
    );
  }

  // 2) While the audio hasn’t loaded yet, show a spinner
  if (!status.isLoaded) {
    return (
      <View className="mx-4 my-2 p-3 bg-gray-200 rounded-lg flex-row items-center justify-center">
        <ActivityIndicator size="small" color="#DD3333" />
        <Text className="ml-2 text-gray-700">Loading…</Text>
      </View>
    );
  }

  // 3) Once isLoaded === true, we know status.duration is (or should be) a number.
  return (
    <View className="mx-4 my-2 p-3 bg-gray-200 rounded-lg">
      <Text className="text-sm font-semibold">{`Track ${index + 1}`}</Text>
      <View className="flex-row items-center justify-center mt-1">
        <TouchableOpacity onPress={onSkipBackward}>
          <FontAwesome name="fast-backward" size={24} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity onPress={onTogglePlay} className="mx-4">
          {status.playing ? (
            <FontAwesome name="pause" size={30} color="#333" />
          ) : (
            <FontAwesome name="play" size={30} color="#333" />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkipForward}>
          <FontAwesome name="fast-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Only render the Slider when status.duration is a valid number */}
      {typeof status.duration === 'number' && (
        <>
          <Slider
            className="mt-2"
            minimumValue={0}
            maximumValue={status.duration}
            value={sliderValue}
            minimumTrackTintColor="#DD3333"
            maximumTrackTintColor="#999"
            thumbTintColor="#DD3333"
            onValueChange={(val: number) => {
              if (!seeking) setSeeking(true);
              setSliderValue(val);
            }}
            onSlidingComplete={(val: number) => {
              setSeeking(false);
              player.seekTo(val);
            }}
          />

          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-gray-600">
              {formatTime(status.currentTime ?? 0)}
            </Text>
            <Text className="text-xs text-gray-600">
              {formatTime(status.duration ?? 0)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

export default function MediaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const playersRef = useRef<Array<ExpoAudioPlayer | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const STORAGE_KEY = `cached_wp_media_${id}`;

  // Fetch or load cached “project” (post) by ID
  useEffect(() => {
    if (!id) return;
    (async () => {
      // 1) Try AsyncStorage first
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        setItem(JSON.parse(json));
        setLoading(false);
      }

      setError(false);
      try {
        const res = await fetch(
          `https://stgeorge-stmercurius.com/wp-json/wp/v2/project/${id}?_embed`
        );
        if (!res.ok) throw new Error();
        const data: WPPost = await res.json();
        setItem(data);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Parse out <audio> or <video> sources from the post content
  useEffect(() => {
    setAudioUrls([]);
    setVideoUrls([]);
    playersRef.current = [];
    setActiveIndex(null);

    if (!item) return;
    const rawHtml = item.content.rendered;

    // 1) Find all <audio src="…"> matches
    const audioMatches = Array.from(
      rawHtml.matchAll(/<audio[^>]*src=['"]([^'"]+)['"]/g)
    ).map((m: RegExpExecArray) => m[1]);

    // 2) Also find nested <audio>→<source src="…"> inside the <audio> tag
    const nestedAudioMatches = Array.from(
      rawHtml.matchAll(/<audio[\s\S]*?<source[^>]*src=['"]([^'"]+)['"]/g)
    ).map((m: RegExpExecArray) => m[1]);

    const allAudios = Array.from(new Set([...audioMatches, ...nestedAudioMatches]));

    // 3) Find all <video src="…"> matches
    const videoMatches = Array.from(
      rawHtml.matchAll(/<video[^>]*src=['"]([^'"]+)['"]/g)
    ).map((m: RegExpExecArray) => m[1]);

    // 4) Also find nested <video>→<source src="…">
    const nestedVideoMatches = Array.from(
      rawHtml.matchAll(/<video[\s\S]*?<source[^'"]+[^>]*src=['"]([^'"]+)['"]/g)
    ).map((m: RegExpExecArray) => m[1]);

    const allVideos = Array.from(new Set([...videoMatches, ...nestedVideoMatches]));

    if (allAudios.length > 0) {
      setAudioUrls(allAudios);
    } else if (allVideos.length > 0) {
      setVideoUrls(allVideos);
    } else {
      // Fallback: fetch attachments and filter by mime_type
      fetch(
        `https://stgeorge-stmercurius.com/wp-json/wp/v2/media?parent=${item.id}`
      )
        .then((res) => (res.ok ? res.json() : []))
        .then((mediaList: any[]) => {
          const audioAttachments = mediaList
            .filter((m) => m.mime_type?.startsWith('audio'))
            .map((m) => m.source_url);
          setAudioUrls(audioAttachments);
        })
        .catch(() => setAudioUrls([]));
    }
  }, [item]);

  const handlePlayTrack = (trackIndex: number) => {
    // Pause the previously‐playing track
    if (activeIndex !== null && activeIndex !== trackIndex) {
      playersRef.current[activeIndex]?.pause();
    }
    setActiveIndex(trackIndex);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#DD3333" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Media item not found.</Text>
      </View>
    );
  }

  const title = decode(item.title.rendered.replace(/<[^>]+>/g, ''));
  const date = new Date(item.date).toLocaleDateString();
  const img = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const cleanHtml = item.content.rendered.replace(/\[[^\]]*?\]/g, '').trim();
  const inlineDoc = `
    <!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin:0; padding:16px; font-family: -apple-system, Roboto; }
        img, video, audio { width:100%; margin-bottom:16px; border-radius:8px; }
        p { margin-bottom:12px; }
        a { color:#DD3333; text-decoration: underline; }
      </style>
    </head><body>${cleanHtml}</body></html>
  `;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="pb-20">
        <TouchableOpacity onPress={() => router.back()} className="p-4">
          <Text className="text-primary text-base">← Back</Text>
        </TouchableOpacity>

        {img && (
          <Image
            source={{ uri: img }}
            className="w-full h-48 rounded-lg mb-4"
            resizeMode="cover"
          />
        )}

        <View className="px-4 mb-4">
          <Text className="text-2xl font-bold mb-1">{title}</Text>
          <Text className="text-gray-600 mb-2">{date}</Text>
        </View>

        {audioUrls.length > 0 ? (
          audioUrls.map((src, i) => (
            <AudioPlayer
              key={i}
              src={src}
              index={i}
              onPlay={handlePlayTrack}
              onRef={(player) => {
                playersRef.current[i] = player;
              }}
            />
          ))
        ) : videoUrls.length > 0 ? (
          videoUrls.map((src, i) => (
            <WebView
              key={i}
              originWhitelist={['*']}
              source={{
                html: `
                <!DOCTYPE html>
                <html>
                  <body style="margin:0;padding:0;">
                    <video
                      src="${src}"
                      controls
                      class="w-full h-56 rounded-lg mb-4"
                    />
                  </body>
                </html>
              `,
              }}
              className="h-56 my-2"
            />
          ))
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: inlineDoc }}
            className="w-full min-h-[100px] my-2"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
