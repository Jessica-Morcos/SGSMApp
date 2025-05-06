import { useEffect, useState } from "react";

export interface Announcement {
    id: number;
    date: string;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
   
    _embedded?: {
      "wp:featuredmedia"?: Array<{
        source_url: string;
      }>;
    };
  }

export function useAnnouncements(perPage = 3) {
const [items, setItems] = useState<Announcement[]>([]);
useEffect(() => {
    fetch(
    `https://stgeorge-stmercurius.com/wp-json/wp/v2/posts?per_page=${perPage}&_embed`
    )
    .then((r) => r.json())
    .then(setItems)
    .catch(console.error);
}, [perPage]);
return items;
}