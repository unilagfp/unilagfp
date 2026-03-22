'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Account } from '@/types/dpms'
import { format } from 'date-fns'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [bandFilter, setBandFilter] = useState('')
  const [selected, setSelected] = useState<Account | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('accounts').select('*').order('customer_name')
    if (data) setAccounts(data as Account[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleRelay(acc: Account) {
    const next = acc.relay_state === 'CLOSED' ? 'OPEN' : 'CLOSED'
    const nextStatus = next === 'OPEN' ? 'DISCONNECTED' : 'ACTIVE'
    await supabase.from('accounts').update({ relay_state: next, status: nextStatus }).eq('account_id', acc.account_id)
    load()
  }

  const filtered = accounts.filter((a) => {
    if (search && !a.customer_name.toLowerCase().includes(search.toLowerCase()) && !a.meter_number.includes(search)) return false
    if (statusFilter && a.status !== statusFilter) return false
    if (bandFilter && a.tariff_band !== bandFilter) return false
    return true
  })

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <input className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700 w-48"
          placeholder="Search name or meter..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['ACTIVE','DISCONNECTED','SUSPENDED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          value={bandFilter} onChange={(e) => setBandFilter(e.target.value)}>
          <option value="">All Bands</option>
          {['A','B','C','D','E'].map((b) => <option key={b} value={b}>Band {b}</option>)}
        </select>
        <span className="text-xs text-gray-500 self-center">{filtered.length} accounts</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-xs text-gray-300">
          <thead className="bg-gray-900 text-gray-500 uppercase tracking-wider">
            <tr>
              {['Customer','Meter','SPDU','Band','Balance','Relay','Status','Action'].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((acc) => (
              <tr key={acc.account_id} className="hover:bg-gray-800/50 cursor-pointer" onClick={() => setSelected(acc)}>
                <td className="px-3 py-2 font-medium text-white">{acc.customer_name}</td>
                <td className="px-3 py-2 font-mono">{acc.meter_number}</td>
                <td className="px-3 py-2">{acc.spdu_id}</td>
                <td className="px-3 py-2">{acc.tariff_band}</td>
                <td className="px-3 py-2">₦{acc.credit_balance?.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <span className={`font-semibold ${acc.relay_state === 'CLOSED' ? 'text-green-400' : 'text-red-400'}`}>
                    {acc.relay_state}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    acc.status === 'ACTIVE' ? 'bg-green-900 text-green-300' :
                    acc.status === 'DISCONNECTED' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>{acc.status}</span>
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleRelay(acc)}
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      acc.relay_state === 'CLOSED'
                        ? 'bg-red-800 hover:bg-red-700 text-white'
                        : 'bg-green-800 hover:bg-green-700 text-white'
                    }`}
                  >
                    {acc.relay_state === 'CLOSED' ? 'Disconnect' : 'Reconnect'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-600 py-8 text-xs">No accounts found</p>}
      </div>

      {/* Account detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-96 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold">{selected.customer_name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="text-xs space-y-2 text-gray-300">
              {[
                ['Meter', selected.meter_number],
                ['SPDU', selected.spdu_id],
                ['Tariff Band', selected.tariff_band],
                ['Credit Balance', `₦${selected.credit_balance?.toFixed(2)}`],
                ['Relay', selected.relay_state],
                ['Status', selected.status],
                ['Since', format(new Date(selected.created_at), 'dd/MM/yyyy')],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-gray-800 pb-1">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
