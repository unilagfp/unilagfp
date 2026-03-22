import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: string
  icon?: ReactNode
}

export default function KPICard({ label, value, sub, accent, icon }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between text-gray-400 text-xs uppercase tracking-wider">
        <span>{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white" style={accent ? { color: accent } : {}}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}
