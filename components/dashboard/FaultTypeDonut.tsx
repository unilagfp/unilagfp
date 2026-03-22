'use client'
import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SEVERITY_COLOUR } from '@/lib/severity'
import type { FaultEvent } from '@/types/dpms'

export default function FaultTypeDonut({ events }: { events: FaultEvent[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {}
    events.filter((e) => !e.resolved).forEach((e) => {
      counts[e.severity] = (counts[e.severity] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [events])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Active Faults by Severity</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={SEVERITY_COLOUR[entry.name as keyof typeof SEVERITY_COLOUR] ?? '#6b7280'} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#f9fafb', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
