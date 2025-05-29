// src/hooks/useArticles.ts
import { useEffect, useState } from "react";

interface Project {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

export function useArticles(perPage: number = 20) {
  const [articles, setArticles] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(
      `https://stgeorge-stmercurius.com/wp-json/wp/v2/project?per_page=${perPage}&_embed`
    )
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: Project[]) => {
        if (!cancelled) {
          setArticles(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [perPage]);

  return { articles, loading, error };
}
