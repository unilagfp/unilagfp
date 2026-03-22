'use client'
export const dynamic = 'force-dynamic'
import { useFaultEvents } from '@/hooks/useFaultEvents'
import { useSPDUReadings } from '@/hooks/useSPDUReadings'
import { useTransformerStatus } from '@/hooks/useTransformerStatus'
import KPICard from '@/components/dashboard/KPICard'
import LiveFaultFeed from '@/components/dashboard/LiveFaultFeed'
import FaultRateChart from '@/components/dashboard/FaultRateChart'
import FaultTypeDonut from '@/components/dashboard/FaultTypeDonut'
import { Zap, AlertTriangle, Activity, Radio, Gauge, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { events } = useFaultEvents(500)
  const { readings } = useSPDUReadings()
  const { latest } = useTransformerStatus()

  const active = events.filter((e) => !e.resolved)
  const critical = active.filter((e) => e.severity === 'CRITICAL').length
  const totalSPDU = Object.keys(readings).length
  const faultRate = totalSPDU > 0 ? ((active.length / totalSPDU) * 100).toFixed(1) : '0.0'

  const voltages = Object.values(readings).flatMap((r) => [r.v_a, r.v_b, r.v_c]).filter(Boolean)
  const avgVoltage = voltages.length > 0 ? (voltages.reduce((a, b) => a + b, 0) / voltages.length).toFixed(1) : '—'

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard label="Total SPDUs" value={totalSPDU} icon={<Radio size={14} />} />
        <KPICard label="Active Faults" value={active.length} accent={active.length > 0 ? '#FF6B00' : undefined} icon={<Zap size={14} />} />
        <KPICard label="Critical" value={critical} accent={critical > 0 ? '#FF2D2D' : undefined} icon={<AlertTriangle size={14} />} />
        <KPICard label="Fault Rate" value={`${faultRate}%`} icon={<TrendingUp size={14} />} />
        <KPICard label="Avg Voltage" value={`${avgVoltage} V`} icon={<Activity size={14} />} />
        <KPICard
          label="DCA Residual"
          value={latest ? `${latest.i_residual.toFixed(1)} A` : '—'}
          accent={latest && latest.i_residual > 10 ? '#FF2D2D' : undefined}
          icon={<Gauge size={14} />}
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <FaultRateChart events={events} />
        </div>
        <FaultTypeDonut events={events} />
      </div>
      <LiveFaultFeed events={events} />
    </div>
  )
}
