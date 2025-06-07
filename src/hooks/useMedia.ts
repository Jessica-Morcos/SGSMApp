// src/hooks/useMedia.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import { WPPost } from './useArticles';

const STORAGE_KEY = 'cached_wp_media_list';
const HYMN_CAT_ID = 16;
const SERMON_CAT_ID = 17;

export function useMedia(perPage = 100) {
  const [media, setMedia] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadFromStorage = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setMedia(JSON.parse(json));
    } catch (e) {}
  }, []);

  const saveToStorage = useCallback(async (list: WPPost[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }, []);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const url = `https://stgeorge-stmercurius.com/wp-json/wp/v2/project?project_category=${HYMN_CAT_ID},${SERMON_CAT_ID}&per_page=${perPage}&_embed`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data: WPPost[] = await res.json();
      setMedia(data);
      await saveToStorage(data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [perPage, saveToStorage]);

  useEffect(() => {
    (async () => {
      await loadFromStorage();
      if (media.length > 0) setLoading(false);
      fetchMedia();
    })();
  }, [loadFromStorage, fetchMedia]);

  return { media, loading, error };
}
