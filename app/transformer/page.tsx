'use client'
export const dynamic = 'force-dynamic'
import { useTransformerStatus } from '@/hooks/useTransformerStatus'
import DCAGauge from '@/components/transformer/DCAGauge'
import TransformerChart from '@/components/transformer/TransformerChart'
import KPICard from '@/components/dashboard/KPICard'
import { format } from 'date-fns'

export default function TransformerPage() {
  const { rows, latest, loading } = useTransformerStatus(100)

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>

  const loadPct = latest ? ((latest.i_spdu_sum / (latest.i_transformer || 1)) * 100).toFixed(1) : '—'
  const anomalies = rows.filter((r) => r.dca_anomaly)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Transformer Current" value={latest ? `${latest.i_transformer.toFixed(1)} A` : '—'} />
        <KPICard label="SPDU Sum" value={latest ? `${latest.i_spdu_sum.toFixed(1)} A` : '—'} />
        <KPICard label="Load %" value={`${loadPct}%`} />
        <KPICard label="DCA Anomalies" value={anomalies.length} accent={anomalies.length > 0 ? '#FF2D2D' : undefined} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DCAGauge value={latest?.i_residual ?? 0} />
        <div className="xl:col-span-2">
          <TransformerChart rows={rows} />
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="px-4 py-2 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider">
          DCA Anomaly Log
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-gray-300">
            <thead className="bg-gray-900 text-gray-500 uppercase tracking-wider">
              <tr>
                {['Timestamp','LCU','i_transformer','i_spdu_sum','i_residual','Anomaly'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {anomalies.slice(0, 50).map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/50">
                  <td className="px-3 py-2">{format(new Date(r.timestamp), 'dd/MM HH:mm:ss')}</td>
                  <td className="px-3 py-2 font-mono">{r.lcu_id}</td>
                  <td className="px-3 py-2">{r.i_transformer.toFixed(2)}</td>
                  <td className="px-3 py-2">{r.i_spdu_sum.toFixed(2)}</td>
                  <td className="px-3 py-2 text-red-400 font-semibold">{r.i_residual.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className="bg-red-900 text-red-300 px-2 py-0.5 rounded text-xs">ANOMALY</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {anomalies.length === 0 && <p className="text-center text-gray-600 py-8 text-xs">No DCA anomalies recorded</p>}
        </div>
      </div>
    </div>
  )
}
