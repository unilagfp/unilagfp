'use client'
import { SEVERITY_COLOUR } from '@/lib/severity'
import type { FaultEvent } from '@/types/dpms'
import { formatDistanceToNow } from 'date-fns'

export default function LiveFaultFeed({ events }: { events: FaultEvent[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col h-80">
      <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
        Live Fault Feed
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
        {events.slice(0, 20).map((e) => (
          <div key={e.id} className="px-4 py-2 flex items-center gap-3 text-xs">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: SEVERITY_COLOUR[e.severity] }}
            />
            <span className="text-gray-300 font-mono w-24 shrink-0">{e.spdu_id}</span>
            <span className="text-gray-400 flex-1 truncate">{e.fault_type}</span>
            <span className="text-gray-600 shrink-0">
              {formatDistanceToNow(new Date(e.timestamp), { addSuffix: true })}
            </span>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-gray-600 text-xs text-center py-8">No faults recorded</p>
        )}
      </div>
    </div>
  )
}
