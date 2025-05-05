import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import ICAL from 'ical.js';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

const STORAGE_KEY = 'cached_events_ics';

interface EventType {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description: string;
}

export function useEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) Load cache from storage
  const loadCache = useCallback(async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) setEvents(JSON.parse(json));
  }, []);

  // 2) Fetch ICS, parse, cache
  const fetchAndCache = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('https://stgeorge-stmercurius.com/events/?ical=1');
      const icsText = await res.text();
      const jcal = ICAL.parse(icsText);
      const comp = new ICAL.Component(jcal);
      const vevents = comp.getAllSubcomponents('vevent');

      const parsed: EventType[] = vevents.map(evComp => {
        const ev = new ICAL.Event(evComp);
        return {
          id: ev.uid,
          title: ev.summary,
          start: ev.startDate.toJSDate(),
          end: ev.endDate.toJSDate(),
          description: ev.description,
        };
      });

      setEvents(parsed);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (err) {
      console.warn('Failed to fetch events, using cache', err);
      await loadCache();
    } finally {
      setLoading(false);
    }
  }, [loadCache]);

  // 3) Decide whether to fetch or load cache
  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      await fetchAndCache();
    } else {
      await loadCache();
    }
  }, [fetchAndCache, loadCache]);

  // 4) On mount, load/refresh once
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 5) On screen focus, re-refresh
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // 6) Also on app coming to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (status) => {
      if (status === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { events, loading };
}
