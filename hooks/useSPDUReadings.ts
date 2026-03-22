'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subscribeSPDUReadings } from '@/lib/realtime'
import type { SPDUReading } from '@/types/dpms'

export function useSPDUReadings() {
  const [readings, setReadings] = useState<Record<string, SPDUReading>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('spdu_readings')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, SPDUReading> = {}
          for (const r of data as SPDUReading[]) {
            if (!map[r.spdu_id]) map[r.spdu_id] = r
          }
          setReadings(map)
        }
        setLoading(false)
      })

    const channel = subscribeSPDUReadings((row) =>
      setReadings((prev) => ({ ...prev, [row.spdu_id]: row }))
    )
    return () => { supabase.removeChannel(channel) }
  }, [])

  return { readings, loading }
}
