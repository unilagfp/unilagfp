'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import nextDynamic from 'next/dynamic'
import { useFaultEvents } from '@/hooks/useFaultEvents'
import { useSPDUReadings } from '@/hooks/useSPDUReadings'
import { supabase } from '@/lib/supabase'
import type { SPDURegistry, FaultEvent } from '@/types/dpms'
import { format } from 'date-fns'
import SeverityBadge from '@/components/faults/SeverityBadge'

const NetworkScene = nextDynamic(() => import('@/components/network/NetworkScene'), { ssr: false })

export default function NetworkPage() {
  const [registry, setRegistry] = useState<SPDURegistry[]>([])
  const { events } = useFaultEvents(200)
  const { readings } = useSPDUReadings()
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('spdu_registry').select('*').then(({ data }) => {
      if (data) setRegistry(data as SPDURegistry[])
    })
  }, [])

  const faultMap: Record<string, FaultEvent> = {}
  events.filter((e) => !e.resolved).forEach((e) => {
    if (!faultMap[e.spdu_id]) faultMap[e.spdu_id] = e
  })

  const selectedReading = selected ? readings[selected] : null
  const selectedFault = selected ? faultMap[selected] : null
  const selectedSPDU = selected ? registry.find((s) => s.spdu_id === selected) : null

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      <div className="flex-1 rounded-lg overflow-hidden border border-gray-800">
        <NetworkScene registry={registry} faultMap={faultMap} onSelectSPDU={setSelected} />
      </div>
      {selected && (
        <div className="w-72 bg-gray-900 border border-gray-800 rounded-lg p-4 flex flex-col gap-3 overflow-y-auto shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">{selected}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          {selectedSPDU && (
            <div className="text-xs text-gray-400 space-y-1">
              <p>Feeder: <span className="text-white">{['','North','East','South','West'][selectedSPDU.feeder_id]}</span></p>
              <p>Order: <span className="text-white">{selectedSPDU.feeder_order}</span></p>
              <p>Coords: <span className="text-white">{selectedSPDU.lat.toFixed(4)}, {selectedSPDU.lon.toFixed(4)}</span></p>
            </div>
          )}
          {selectedFault && (
            <div className="bg-gray-800 rounded p-3 space-y-1 text-xs">
              <p className="text-gray-400 uppercase tracking-wider text-xs mb-1">Active Fault</p>
              <SeverityBadge severity={selectedFault.severity} />
              <p className="text-gray-300 mt-1">{selectedFault.fault_type}</p>
              <p className="text-gray-500">{format(new Date(selectedFault.timestamp), 'dd/MM/yyyy HH:mm:ss')}</p>
            </div>
          )}
          {selectedReading && (
            <div className="bg-gray-800 rounded p-3 text-xs space-y-1">
              <p className="text-gray-400 uppercase tracking-wider mb-1">Last Reading</p>
              {[['Va', selectedReading.v_a], ['Vb', selectedReading.v_b], ['Vc', selectedReading.v_c],
                ['Ia', selectedReading.i_a], ['Ib', selectedReading.i_b], ['Ic', selectedReading.i_c],
                ['PF', selectedReading.pf], ['THD%', selectedReading.thd_i]].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-white">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-500">Relay</span>
                <span className={selectedReading.relay_state === 'CLOSED' ? 'text-green-400' : 'text-red-400'}>
                  {selectedReading.relay_state}
                </span>
              </div>
            </div>
          )}
          {!selectedFault && <p className="text-xs text-green-500">✓ No active faults</p>}
        </div>
      )}
    </div>
  )
}
