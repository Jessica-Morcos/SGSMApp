// app/(media)/[id].tsx
import { WPPost } from '@/hooks/useArticles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { decode } from 'html-entities';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
// Import Expo Audio hooks and types, and community Slider for progress bar
import Slider from '@react-native-community/slider';
import { AudioPlayer as ExpoAudioPlayer, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
// Import vector icons for play/pause and skip buttons
import { FontAwesome } from '@expo/vector-icons';

function formatTime(seconds: number): string {
  // Format seconds as M:SS or H:MM:SS if over an hour
  const sec = Math.floor(seconds);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
  } else {
    return `${mins}:${secs.toString().padStart(2,'0')}`;
  }
}

// AudioPlayer component for a single audio track
function AudioPlayer({ src, index, onPlay, onRef }: { 
  src: string; 
  index: number; 
  onPlay: (idx: number) => void; 
  onRef?: (player: ExpoAudioPlayer | null) => void; 
}) {
  // Initialize the audio player for this source
  const player = useAudioPlayer({ uri: src });  // create player with given audio URL
  const status = useAudioPlayerStatus(player);  // subscribe to playback status updates
  const [seeking, setSeeking] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  // Register this player's instance with the parent via ref callback
  useEffect(() => {
    onRef?.(player);
    return () => { onRef?.(null); };  // cleanup on unmount
  }, [player]);

  // Whenever playback status updates (and user is not actively seeking), update slider position
  useEffect(() => {
    if (!seeking) {
      setSliderValue(status.currentTime ?? 0);
    }
  }, [status.currentTime, seeking]);

  // Determine track label (Track 1, Track 2, or file name if available)
  const label = `Track ${index + 1}`;

  // Handler: Play or pause when tapping the play/pause button
  const onTogglePlay = () => {
    if (status.playing) {
      // Currently playing, so pause
      player.pause();
    } else {
      // Not playing, so inform parent to pause any other track, then play this one
      onPlay(index);
      player.play();
    }
  };

  // Handler: skip 15 seconds backward
  const onSkipBackward = () => {
    const newTime = Math.max((status.currentTime ?? 0) - 15, 0);
    player.seekTo(newTime);
  };

  // Handler: skip 15 seconds forward
  const onSkipForward = () => {
    const newTime = Math.min((status.currentTime ?? 0) + 15, status.duration ?? 0);
    player.seekTo(newTime);
  };

  return (
    <View style={styles.audioPlayerContainer}>
      {/* Track label */}
      <Text style={styles.audioLabel}>{label}</Text>

      {/* Controls: Skip backward, Play/Pause, Skip forward */}
      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={onSkipBackward}>
          <FontAwesome name="fast-backward" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onTogglePlay} style={{ marginHorizontal: 20 }}>
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

      {/* Progress bar slider */}
      <Slider
        style={{ marginTop: 8 }}
        minimumValue={0}
        maximumValue={status.duration ?? 0}
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

      {/* Time indicators: current time (left) and total duration (right) */}
      <View style={styles.timeRow}>
        <Text style={styles.audioTime}>{formatTime(status.currentTime ?? 0)}</Text>
        <Text style={styles.audioTime}>{formatTime(status.duration ?? 0)}</Text>
      </View>
    </View>
  );
}

export default function MediaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // State for audio and video source URLs extracted
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  // Ref to keep track of all audio players (to manage stopping others when one plays)
  const playersRef = useRef<Array<ExpoAudioPlayer | null>>([]);
  // Track the currently playing audio index (if any)
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    // Fetch the media post data (hymn or sermon post)
    fetch(`https://stgeorge-stmercurius.com/wp-json/wp/v2/project/${id}?_embed`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data: WPPost) => setItem(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Once the post data is loaded, extract audio/video sources or fetch attachments if needed
  useEffect(() => {
    // Reset sources and players when item changes
    setAudioUrls([]);
    setVideoUrls([]);
    playersRef.current = [];
    setActiveIndex(null);
    if (!item) return;
    const rawHtml = item.content.rendered;
    // Extract audio sources from HTML content (including <audio src> and <audio><source> tags)
    const audioSrcs = Array.from(rawHtml.matchAll(/<audio[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
    const nestedAudioSrcs = Array.from(rawHtml.matchAll(/<audio[\\s\\S]*?<source[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
    const allAudios = Array.from(new Set([...audioSrcs, ...nestedAudioSrcs]));
    // Extract video sources from HTML content (including <video src> and <video><source> tags)
    const videoSrcs = Array.from(rawHtml.matchAll(/<video[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
    const nestedVideoSrcs = Array.from(rawHtml.matchAll(/<video[\\s\\S]*?<source[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
    const allVideos = Array.from(new Set([...videoSrcs, ...nestedVideoSrcs]));

    if (allAudios.length > 0) {
      // We found audio tags in the content
      setAudioUrls(allAudios);
    } else if (allVideos.length > 0) {
      // No audio in content, but video present
      setVideoUrls(allVideos);
    } else {
      // No audio/video in content – try fetching media attachments for this post
      fetch(`https://stgeorge-stmercurius.com/wp-json/wp/v2/media?parent=${item.id}`)
        .then(res => res.ok ? res.json() : [])
        .then((mediaList: any[]) => {
          const audioAttachments = mediaList
            .filter(m => m.mime_type && m.mime_type.startsWith('audio'))
            .map(m => m.source_url);
          if (audioAttachments.length > 0) {
            setAudioUrls(audioAttachments);
          } else {
            // Still no audio found; no need to setAudioUrls (will remain empty and trigger fallback UI)
            setAudioUrls([]);
          }
        })
        .catch(() => {
          setAudioUrls([]);
        });
    }
  }, [item]);

  // Callback to handle when a track is started, ensuring only one audio plays at a time
  const handlePlayTrack = (trackIndex: number) => {
    // Pause any previously playing track
    if (activeIndex !== null && activeIndex !== trackIndex) {
      playersRef.current[activeIndex]?.pause();
    }
    setActiveIndex(trackIndex);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#DD3333" /></View>;
  }
  if (error || !item) {
    return <View style={styles.center}><Text style={{ color: 'red' }}>Media item not found.</Text></View>;
  }

  // Prepare title, date, featured image (if any)
  const title = decode(item.title.rendered.replace(/<[^>]+>/g, ''));
  const date = new Date(item.date).toLocaleDateString();
  const img = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  // Clean HTML content for fallback rendering (strip any shortcodes [])
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Featured image */}
        {img && (
          <Image source={{ uri: img }} style={[styles.image, { width: '100%' }]} resizeMode="cover" />
        )}

        {/* Title & date */}
        <View style={styles.meta}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* Audio players (if any), otherwise video player(s), otherwise fallback HTML */}
        {audioUrls.length > 0 ? (
          audioUrls.map((src, i) => (
            <AudioPlayer 
              key={i} 
              src={src} 
              index={i} 
              onPlay={handlePlayTrack} 
              onRef={(player) => { playersRef.current[i] = player; }} 
            />
          ))
        ) : videoUrls.length > 0 ? (
          videoUrls.map((src, i) => (
            <WebView
              key={i}
              originWhitelist={['*']}
              source={{ html: `
                <!DOCTYPE html><html><body style="margin:0;padding:0;">
                  <video src="${src}" controls style="width:100%;height:220px;border-radius:8px;" />
                </body></html>
              ` }}
              style={{ height: 240, marginVertical: 8 }}
            />
          ))
        ) : (
          <WebView 
            originWhitelist={['*']} 
            source={{ html: inlineDoc }} 
            style={{ flex: 1, width: '100%', minHeight: 100 }} 
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  back:           { padding: 16 },
  backText:       { color: '#DD3333', fontSize: 16 },
  image:          { height: 200 },
  meta:           { paddingHorizontal: 16, marginBottom: 16 },
  title:          { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  date:           { color: '#666', marginBottom: 16 },
  // Styles for the audio player UI
  audioPlayerContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f3f3f3',
    borderRadius: 8
  },
  controlsRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  audioLabel:     { fontSize: 14, fontWeight: '600' },
  timeRow:        { flexDirection: 'row', justifyContent: 'space-between' },
  audioTime:      { fontSize: 12, color: '#666' }
});
