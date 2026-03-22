'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { subscribeTransformerStatus } from '@/lib/realtime'
import type { TransformerStatus } from '@/types/dpms'

export function useTransformerStatus(limit = 100) {
  const [rows, setRows] = useState<TransformerStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('transformer_status')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (data) setRows((data as TransformerStatus[]).reverse())
        setLoading(false)
      })

    const channel = subscribeTransformerStatus((row) =>
      setRows((prev) => [...prev.slice(-(limit - 1)), row])
    )
    return () => { supabase.removeChannel(channel) }
  }, [limit])

  return { rows, latest: rows[rows.length - 1] ?? null, loading }
}
