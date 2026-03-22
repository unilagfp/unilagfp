'use client'
import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { FaultEvent } from '@/types/dpms'
import { format, subMinutes, startOfMinute } from 'date-fns'

export default function FaultRateChart({ events }: { events: FaultEvent[] }) {
  const data = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 60 }, (_, i) => {
      const minute = startOfMinute(subMinutes(now, 59 - i))
      const count = events.filter((e) => {
        const t = startOfMinute(new Date(e.timestamp))
        return t.getTime() === minute.getTime()
      }).length
      return { time: format(minute, 'HH:mm'), count }
    })
  }, [events])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Fault Rate — Last 60 min</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} interval={9} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#f9fafb', fontSize: 12 }} />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
