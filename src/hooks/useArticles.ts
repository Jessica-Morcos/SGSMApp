// src/hooks/useArticles.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

export interface WPPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
  link: string;
  project_category?: number[];
}

const STORAGE_KEY = 'cached_wp_articles';

export function useArticles(perPage = 100) {
  const [articles, setArticles] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const loadFromStorage = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setArticles(JSON.parse(json));
    } catch {}
  }, []);

  const saveToStorage = useCallback(async (list: WPPost[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const url = `https://stgeorge-stmercurius.com/wp-json/wp/v2/project?per_page=${perPage}&_embed`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data: WPPost[] = await res.json();
      setArticles(data);
      await saveToStorage(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [perPage, saveToStorage]);

  useEffect(() => {
    (async () => {
      await loadFromStorage();
      if (articles.length > 0) setLoading(false);
      fetchArticles();
    })();
  }, [loadFromStorage, fetchArticles]);

  return { articles, loading, error };
}
