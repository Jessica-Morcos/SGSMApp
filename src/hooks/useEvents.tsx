// src/hooks/useEvents.ts
import NetInfo from '@react-native-community/netinfo';
import { decode } from 'html-entities'; // ← import the decoder
import { useCallback, useEffect, useState } from 'react';

export interface EventType {
  id:    string
  title: string
  start: Date
  end:   Date
}

function toIsoNoMs(d: Date) {
  return d.toISOString().split('.')[0] + 'Z'
}


export function useEvents() {
  const [events,  setEvents]  = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const net = await NetInfo.fetch()
    if (!net.isConnected) {
      setLoading(false)
      return
    }

    const now    = Date.now()
    const yearMs = 365 * 24 * 60 * 60 * 1000
    const start  = toIsoNoMs(new Date(now - yearMs))
    const end    = toIsoNoMs(new Date(now + yearMs))

    const perPage = 100
    let page      = 1
    let allEvents: EventType[] = []

    try {
      while (true) {
        const url = new URL(
          'https://stgeorge-stmercurius.com/wp-json/tribe/events/v1/events'
        )
        url.searchParams.set('start_date', start)
        url.searchParams.set('end_date',   end)
        url.searchParams.set('per_page',   String(perPage))
        url.searchParams.set('page',       String(page))

        const res = await fetch(url.toString())
        if (!res.ok) break

        const json = await res.json()
        const batch: EventType[] = (json.events || []).map((e: any) => ({
          id:    String(e.id),
          // decode any HTML Entities in the title
          title: decode(e.title),
          start: new Date(e.start_date),
          end:   new Date(e.end_date),
        }))

        allEvents = allEvents.concat(batch)

        const totalPages = parseInt(json.total_pages, 10) || 1
        if (page >= totalPages) break
        page += 1
      }

      setEvents(allEvents)
    } catch (err) {
      console.warn('Failed to fetch Tribe events', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { events, loading }
}
