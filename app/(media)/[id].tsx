// app/media/[id].tsx
import { WPPost } from '@/src/hooks/useArticles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { decode } from 'html-entities';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

function AudioPlayer({ src, index }: { src: string; index?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const toggle = () => setIsPlaying(p => !p);

  const label = index != null
    ? `Track ${index + 1}`
    : src.split('/').pop()?.replace(/\.\w+$/, '') || 'Play';

  return (
    <TouchableOpacity onPress={toggle} style={styles.audioButton}>
      <Text style={styles.audioButtonText}>
        {isPlaying ? '⏸︎' : '▶️'} {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function MediaDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [item,    setItem]    = useState<WPPost | null>(null);
  const [loading,setLoading] = useState(true);
  const [error,  setError]   = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`https://stgeorge-stmercurius.com/wp-json/wp/v2/project/${id}?_embed`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: WPPost) => setItem(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#DD3333"/></View>;
  if (error || !item) return <View style={styles.center}><Text style={{color:'red'}}>Media item not found.</Text></View>;

  // Title, date, image
  const title = decode(item.title.rendered.replace(/<[^>]+>/g, ''));
  const date  = new Date(item.date).toLocaleDateString();
  const img   = item._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  // Raw HTML
  const rawHtml = item.content.rendered;

  // 1) Extract audio sources
  const audioSrcs       = Array.from(rawHtml.matchAll(/<audio[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
  const nestedAudioSrcs = Array.from(rawHtml.matchAll(/<audio[\s\S]*?<source[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
  const audios = Array.from(new Set([...audioSrcs, ...nestedAudioSrcs]));

  // 2) Extract video sources (only if no audios)
  const videoSrcs       = Array.from(rawHtml.matchAll(/<video[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
  const nestedVideoSrcs = Array.from(rawHtml.matchAll(/<video[\s\S]*?<source[^>]*src=['"]([^'"]+)['"]/g), m => m[1]);
  const videos = Array.from(new Set([...videoSrcs, ...nestedVideoSrcs]));

  // 3) Prepare inline HTML fallback
  const cleanHtml = rawHtml.replace(/\[[^\]]*?\]/g, '').trim();
  const inlineDoc = `
    <!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body{margin:0;padding:16px;font-family:-apple-system,Roboto;}
        img,video,audio{width:100%;margin-bottom:16px;border-radius:8px;}
        p{margin-bottom:12px;}
        a{color:#DD3333;text-decoration:underline;}
      </style>
    </head><body>${cleanHtml}</body></html>
  `;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom:80 }}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Image */}
        {img && <Image source={{uri:img}} style={[styles.image,{width}]} resizeMode="cover" />}

        {/* Title & Date */}
        <View style={styles.meta}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        {/* 4) AUDIO first, then VIDEO, else FALLBACK */}
        {audios.length > 0 ? (
          audios.map((src,i) => <AudioPlayer key={i} src={src} index={i} />)
        ) : videos.length > 0 ? (
          videos.map((src,i) => (
            <WebView
              key={i}
              originWhitelist={['*']}
              source={{ html: `
                <!DOCTYPE html><html><body style="margin:0;padding:0">
                  <video src="${src}" controls style="width:100%;height:200px;border-radius:8px;" />
                </body></html>
              `}}
              style={{ height:240, marginVertical:8 }}
            />
          ))
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html:inlineDoc }}
            style={{flex:1,width}}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1,backgroundColor:'#fff'},
  center:    {flex:1,justifyContent:'center',alignItems:'center'},
  back:      {padding:16},
  backText:  {color:'#DD3333',fontSize:16},
  image:     {height:200},
  meta:      {paddingHorizontal:16,marginBottom:16},
  title:     {fontSize:24,fontWeight:'700',marginBottom:4},
  date:      {color:'#666',marginBottom:16},
  audioButton: {
    marginHorizontal:16,
    marginVertical:8,
    padding:12,
    backgroundColor:'#f3f3f3',
    borderRadius:8,
    flexDirection:'row',
    alignItems:'center',
  },
  audioButtonText: {fontSize:16},
});
