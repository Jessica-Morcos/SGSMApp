// src/hooks/useMedia.ts
import { useState, useEffect } from 'react';
import { WPPost } from './useArticles';

// These are the correct child categories
const HYMN_CAT_ID = 16;
const SERMON_CAT_ID = 17;

export function useMedia(perPage = 100) {
  const [media, setMedia]     = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(
      `https://stgeorge-stmercurius.com/wp-json/wp/v2/project?project_category=${HYMN_CAT_ID},${SERMON_CAT_ID}&per_page=${perPage}&_embed`
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
