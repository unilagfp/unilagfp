'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

export default function DCAGauge({ value }: { value: number }) {
  const pct = Math.min((value / 50) * 100, 100)
  const colour = value > 10 ? '#FF2D2D' : value > 5 ? '#FFB800' : '#22C55E'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col items-center">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">DCA Residual Current</p>
      <div className="relative w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
            startAngle={180} endAngle={0} data={[{ value: pct }]}>
            <RadialBar dataKey="value" fill={colour} background={{ fill: '#1f2937' }} cornerRadius={4} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
          <span className="text-3xl font-bold text-white" style={{ color: colour }}>{value.toFixed(1)}</span>
          <span className="text-xs text-gray-500">Amps</span>
        </div>
      </div>
      <p className="text-xs mt-1" style={{ color: colour }}>
        {value > 10 ? '⚠ ANOMALY — Exceeds 10A threshold' : 'Normal'}
      </p>
    </div>
  )
}
