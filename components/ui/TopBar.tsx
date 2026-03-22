'use client'
import { usePathname } from 'next/navigation'
import StatusDot from './StatusDot'

const titles: Record<string, string> = {
  '/dashboard':   'Command Overview',
  '/network':     '3D Network View',
  '/map':         'Geospatial Fault Map',
  '/faults':      'Fault Event Log',
  '/accounts':    'Account Management',
  '/transformer': 'Transformer & DCA Panel',
}

export default function TopBar() {
  const path = usePathname()
  const title = Object.entries(titles).find(([k]) => path.startsWith(k))?.[1] ?? 'DPMS'
  return (
    <header className="h-12 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-5 shrink-0">
      <h1 className="text-white text-sm font-semibold">{title}</h1>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <StatusDot status="green" />
        Live
      </div>
    </header>
  )
}
