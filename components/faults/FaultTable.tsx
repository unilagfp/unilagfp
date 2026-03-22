'use client'
import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, flexRender,
  type ColumnDef, type SortingState,
} from '@tanstack/react-table'
import type { FaultEvent, Severity } from '@/types/dpms'
import SeverityBadge from './SeverityBadge'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'

const SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']

export default function FaultTable({ events, onUpdate }: { events: FaultEvent[], onUpdate: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [severityFilter, setSeverityFilter] = useState('')
  const [feederFilter, setFeederFilter] = useState('')

  const filtered = useMemo(() =>
    events.filter((e) =>
      (!severityFilter || e.severity === severityFilter) &&
      (!feederFilter || e.lcu_id.includes(feederFilter))
    ), [events, severityFilter, feederFilter])

  const columns = useMemo<ColumnDef<FaultEvent>[]>(() => [
    { accessorKey: 'timestamp', header: 'Time', cell: (i) => format(new Date(i.getValue() as string), 'dd/MM HH:mm:ss') },
    { accessorKey: 'spdu_id', header: 'SPDU' },
    { accessorKey: 'lcu_id', header: 'LCU' },
    { accessorKey: 'fault_type', header: 'Fault Type' },
    { accessorKey: 'severity', header: 'Severity', cell: (i) => <SeverityBadge severity={i.getValue() as Severity} /> },
    { accessorKey: 'v_a', header: 'Va', cell: (i) => (i.getValue() as number)?.toFixed(1) },
    { accessorKey: 'i_a', header: 'Ia', cell: (i) => (i.getValue() as number)?.toFixed(2) },
    { accessorKey: 'thd_i', header: 'THD%', cell: (i) => (i.getValue() as number)?.toFixed(1) },
    {
      accessorKey: 'resolved', header: 'Status',
      cell: (i) => i.getValue()
        ? <span className="text-green-500 text-xs">Resolved</span>
        : <button
            className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-0.5 rounded"
            onClick={async () => {
              await supabase.from('fault_events').update({ resolved: true }).eq('id', i.row.original.id)
              onUpdate()
            }}
          >Resolve</button>
    },
  ], [onUpdate])

  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel() })

  function exportCSV() {
    const header = ['timestamp', 'spdu_id', 'lcu_id', 'fault_type', 'severity', 'v_a', 'i_a', 'thd_i', 'resolved']
    const rows = filtered.map((e) => header.map((k) => (e as unknown as Record<string, unknown>)[k]).join(','))
    const blob = new Blob([header.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'faults.csv'; a.click()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        <select className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700"
          value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="">All Severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="bg-gray-800 text-gray-300 text-xs rounded px-2 py-1 border border-gray-700 w-32"
          placeholder="Filter LCU..." value={feederFilter} onChange={(e) => setFeederFilter(e.target.value)} />
        <button onClick={exportCSV} className="ml-auto text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-xs text-gray-300">
          <thead className="bg-gray-900 text-gray-500 uppercase tracking-wider">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2 text-left cursor-pointer select-none"
                    onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-800">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-800/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-600 py-8 text-xs">No fault events</p>}
      </div>
    </div>
  )
}
