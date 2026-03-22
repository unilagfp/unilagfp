'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import type { TransformerStatus } from '@/types/dpms'
import { format } from 'date-fns'

export default function TransformerChart({ rows }: { rows: TransformerStatus[] }) {
  const data = rows.map((r) => ({
    time: format(new Date(r.timestamp), 'HH:mm:ss'),
    transformer: r.i_transformer,
    spdu_sum: r.i_spdu_sum,
    residual: r.i_residual,
  }))
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Current Balance — Last 100 Cycles</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} interval={Math.floor(data.length / 6)} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#f9fafb', fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          <Line type="monotone" dataKey="transformer" stroke="#3b82f6" strokeWidth={2} dot={false} name="Transformer" />
          <Line type="monotone" dataKey="spdu_sum" stroke="#22c55e" strokeWidth={2} dot={false} name="SPDU Sum" />
          <Line type="monotone" dataKey="residual" stroke="#FF2D2D" strokeWidth={1.5} dot={false} name="Residual" strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
