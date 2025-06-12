// src/hooks/useEvents.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { decode } from 'html-entities';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'events';

export type EventType = {
  id: string;
  title: string;
  start: Date;
  end: Date;
};


function toIsoNoMs(date: Date): string {
  return date.toISOString().split('.')[0] + 'Z';
}

export function useEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFromStorage = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed: Array<{ id: string; title: string; start: string; end: string }> =
          JSON.parse(json);
        const restored = parsed.map(e => ({
          id: e.id,
          title: e.title,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(restored);
      }
    } catch (e) {
      console.warn('Error reading events from storage', e);
    }
  }, []);


  const saveToStorage = useCallback(async (list: EventType[]) => {
    try {
      const toStore = list.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Error saving events to storage', e);
    }
  }, []);

 
  const fetchAll = useCallback(async () => {
    setLoading(true);

    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    const halfYearMs = (365 * 24 * 60 * 60 * 1000) / 2;
    const start = toIsoNoMs(new Date(now - halfYearMs));
    const end = toIsoNoMs(new Date(now + halfYearMs));
    const perPage = 100;
    const baseURL = 'https://stgeorge-stmercurius.com/wp-json/tribe/events/v1/events';

    try {
     
      const firstURL = new URL(baseURL);
      firstURL.searchParams.set('start_date', start);
      firstURL.searchParams.set('end_date', end);
      firstURL.searchParams.set('per_page', String(perPage));
      firstURL.searchParams.set('page', '1');

      const firstRes = await fetch(firstURL.toString());
      if (!firstRes.ok) throw new Error('Failed to fetch events');
      const firstJson = await firstRes.json();

      let allEvents: EventType[] = (firstJson.events || []).map((e: any) => ({
        id: String(e.id),
        title: decode(e.title),
        start: new Date(e.start_date),
        end: new Date(e.end_date),
      }));

      const totalPages = parseInt(firstJson.total_pages, 10) || 1;

    
      if (totalPages > 1) {
        const fetches: Promise<Response>[] = [];
        for (let page = 2; page <= totalPages; page++) {
          const url = new URL(baseURL);
          url.searchParams.set('start_date', start);
          url.searchParams.set('end_date', end);
          url.searchParams.set('per_page', String(perPage));
          url.searchParams.set('page', String(page));
          fetches.push(fetch(url.toString()));
        }
        const results = await Promise.all(fetches);
        const jsons = await Promise.all(results.map(r => r.json()));
        jsons.forEach(json => {
          const batch: EventType[] = (json.events || []).map((e: any) => ({
            id: String(e.id),
            title: decode(e.title),
            start: new Date(e.start_date),
            end: new Date(e.end_date),
          }));
          allEvents = allEvents.concat(batch);
        });
      }

      setEvents(allEvents);
      await saveToStorage(allEvents);

    } catch (err) {
      console.warn('Failed to fetch Tribe events', err);
    } finally {
      setLoading(false);
    }
  }, [saveToStorage]);

  useEffect(() => {
    (async () => {
      await loadFromStorage();
      setLoading(false);
      fetchAll();
    })();
  }, [loadFromStorage, fetchAll]);

  return { events, loading };
}
