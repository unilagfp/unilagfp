'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subscribeFaultEvents } from '@/lib/realtime'
import type { FaultEvent } from '@/types/dpms'

export function useFaultEvents(limit = 100) {
  const [events, setEvents] = useState<FaultEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('fault_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data) setEvents(data as FaultEvent[])
        setLoading(false)
      })

    const channel = subscribeFaultEvents((row) =>
      setEvents((prev) => [row, ...prev].slice(0, limit))
    )
    return () => { supabase.removeChannel(channel) }
  }, [limit])

  return { events, loading }
}
