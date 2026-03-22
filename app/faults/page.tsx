'use client'
export const dynamic = 'force-dynamic'
import { useState, useCallback } from 'react'
import { useFaultEvents } from '@/hooks/useFaultEvents'
import FaultTable from '@/components/faults/FaultTable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ScatterChart, Scatter, ZAxis } from 'recharts'
import { SEVERITY_COLOUR } from '@/lib/severity'
import { format } from 'date-fns'

export default function FaultsPage() {
  const { events, loading } = useFaultEvents(1000)
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const typeCounts: Record<string, number> = {}
  events.forEach((e) => { typeCounts[e.fault_type] = (typeCounts[e.fault_type] ?? 0) + 1 })
  const barData = Object.entries(typeCounts).map(([name, count]) => ({ name: name.split('(')[0].trim(), count }))

  const scatterData = events.map((e) => ({
    x: new Date(e.timestamp).getTime(),
    y: 1,
    severity: e.severity,
  }))

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Faults by Type</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} width={120} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#f9fafb', fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Fault Timeline</p>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={(v) => format(new Date(v), 'HH:mm')} tick={{ fill: '#6b7280', fontSize: 10 }} />
              <YAxis dataKey="y" hide />
              <ZAxis range={[30, 30]} />
              <Tooltip
                cursor={false}
                contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#f9fafb', fontSize: 12 }}
                formatter={(_, __, props) => [props.payload.severity, 'Severity']}
                labelFormatter={(v) => format(new Date(v), 'dd/MM HH:mm:ss')}
              />
              {(['CRITICAL','HIGH','MEDIUM','LOW'] as const).map((s) => (
                <Scatter
                  key={s}
                  name={s}
                  data={scatterData.filter((d) => d.severity === s)}
                  fill={SEVERITY_COLOUR[s]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <FaultTable key={version} events={events} onUpdate={refresh} />
    </div>
  )
}
