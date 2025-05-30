// hooks/useArticles.ts
import { useEffect, useState } from 'react';

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

export function useArticles(perPage = 100) {
  const [articles, setArticles] = useState<WPPost[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    fetch(
      `https://stgeorge-stmercurius.com/wp-json/wp/v2/project?per_page=${perPage}&_embed`
    )
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: WPPost[]) => setArticles(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [perPage]);

  return { articles, loading, error };
}
