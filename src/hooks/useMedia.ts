// src/hooks/useMedia.ts
import { useState, useEffect } from 'react';
import { WPPost } from './useArticles';

const MEDIA_CAT = 15;

export function useMedia(perPage = 100) {
  const [media, setMedia]     = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(
      `https://stgeorge-stmercurius.com/wp-json/wp/v2/project?categories=${MEDIA_CAT}&per_page=${perPage}&_embed`
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data: WPPost[]) => setMedia(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [perPage]);

  return { media, loading, error };
}
