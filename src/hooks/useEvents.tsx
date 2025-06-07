// src/hooks/useEvents.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { decode } from 'html-entities';
import { useCallback, useEffect, useState } from 'react';

export interface EventType {
  id:    string;
  title: string;
  start: Date;
  end:   Date;
}

const STORAGE_KEY = 'cached_tribe_events';

function toIsoNoMs(d: Date) {
  return d.toISOString().split('.')[0] + 'Z';
}

export function useEvents() {
  const [events,  setEvents]  = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1) Helper to load from AsyncStorage
  const loadFromStorage = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const parsed: EventType[] = JSON.parse(json).map((e: any) => ({
          id:    e.id,
          title: e.title,
          start: new Date(e.start),
          end:   new Date(e.end),
        }));
        setEvents(parsed);
      }
    } catch (e) {
      console.warn('Error reading events from storage', e);
    }
  }, []);

  // 2) Helper to save to AsyncStorage
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

    const now    = Date.now();
    const yearMs = (365 * 24 * 60 * 60 * 1000) / 2;
    const start  = toIsoNoMs(new Date(now - yearMs));
    const end    = toIsoNoMs(new Date(now + yearMs));

    const perPage = 100;
    let page      = 1;
    let allEvents: EventType[] = [];

    try {
      while (true) {
        const url = new URL(
          'https://stgeorge-stmercurius.com/wp-json/tribe/events/v1/events'
        );
        url.searchParams.set('start_date', start);
        url.searchParams.set('end_date',   end);
        url.searchParams.set('per_page',   String(perPage));
        url.searchParams.set('page',       String(page));

        const res = await fetch(url.toString());
        if (!res.ok) break;

        const json = await res.json();
        const batch: EventType[] = (json.events || []).map((e: any) => ({
          id:    String(e.id),
          title: decode(e.title),
          start: new Date(e.start_date),
          end:   new Date(e.end_date),
        }));

        allEvents = allEvents.concat(batch);

        const totalPages = parseInt(json.total_pages, 10) || 1;
        if (page >= totalPages) break;
        page += 1;
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
