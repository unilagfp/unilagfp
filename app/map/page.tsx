'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import nextDynamic from 'next/dynamic'
import { useFaultEvents } from '@/hooks/useFaultEvents'
import { useSPDUReadings } from '@/hooks/useSPDUReadings'
import { supabase } from '@/lib/supabase'
import type { SPDURegistry, FaultEvent, Severity } from '@/types/dpms'
import SeverityBadge from '@/components/faults/SeverityBadge'
import { format } from 'date-fns'

const FaultMap = nextDynamic(() => import('@/components/map/FaultMap'), { ssr: false })

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

export default function MapPage() {
  const [registry, setRegistry] = useState<SPDURegistry[]>([])
  const { events } = useFaultEvents(200)
  const { readings } = useSPDUReadings()
  const [selected, setSelected] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('')
  const [feederFilter, setFeederFilter] = useState<number | 0>(0)

  useEffect(() => {
    supabase.from('spdu_registry').select('*').then(({ data }) => {
      if (data) setRegistry(data as SPDURegistry[])
    })
  }, [])

  const faultMap: Record<string, FaultEvent> = {}
  events.filter((e) => !e.resolved).forEach((e) => {
    if (!faultMap[e.spdu_id]) faultMap[e.spdu_id] = e
  })

  const filteredRegistry = registry.filter((s) => {
    if (feederFilter && s.feeder_id !== feederFilter) return false
    if (severityFilter) {
      const fault = faultMap[s.spdu_id]
      if (!fault || fault.severity !== severityFilter) return false
    }
    return true
  })

  const selectedReading = selected ? readings[selected] : null
  const selectedFault = selected ? faultMap[selected] : null
  const selectedSPDU = selected ? registry.find((s) => s.spdu_id === selected) : null

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-8rem)]">
      <div className="flex gap-2 flex-wrap shrink-0">
        <select className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          value={feederFilter} onChange={(e) => setFeederFilter(Number(e.target.value))}>
          <option value={0}>All Feeders</option>
          {[1,2,3,4].map((f) => <option key={f} value={f}>{['','North','East','South','West'][f]} Feeder</option>)}
        </select>
        <select className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as Severity | '')}>
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-500 self-center">{filteredRegistry.length} SPDUs shown</span>
      </div>
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 rounded-lg overflow-hidden border border-gray-800">
          <FaultMap registry={filteredRegistry} faultMap={faultMap} onSelectSPDU={setSelected} />
        </div>
        {selected && (
          <div className="w-64 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">{selected}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
            </div>
            {selectedSPDU && (
              <p className="text-xs text-gray-400">
                Feeder {['','North','East','South','West'][selectedSPDU.feeder_id]} · Order {selectedSPDU.feeder_order}
              </p>
            )}
            {selectedFault && (
              <div className="bg-gray-800 rounded p-3 space-y-1 text-xs">
                <SeverityBadge severity={selectedFault.severity} />
                <p className="text-gray-300 mt-1">{selectedFault.fault_type}</p>
                <p className="text-gray-500">{format(new Date(selectedFault.timestamp), 'dd/MM HH:mm:ss')}</p>
              </div>
            )}
            {selectedReading && (
              <div className="bg-gray-800 rounded p-3 text-xs space-y-1">
                {[['Va', selectedReading.v_a], ['Ia', selectedReading.i_a], ['PF', selectedReading.pf], ['THD%', selectedReading.thd_i]].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                  </div>
                ))}
              </div>
            )}
            {!selectedFault && <p className="text-xs text-green-500">✓ No active faults</p>}
          </div>
        )}
      </div>
    </div>
  )
}
