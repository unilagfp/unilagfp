'use client'
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { SPDURegistry, FaultEvent } from '@/types/dpms'
import { SEVERITY_COLOUR } from '@/lib/severity'

interface Props {
  registry: SPDURegistry[]
  faultMap: Record<string, FaultEvent>
  onSelectSPDU: (id: string) => void
}

export default function FaultMap({ registry, faultMap, onSelectSPDU }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [3.40, 6.50],
      zoom: 13,
    })
    map.on('load', () => { mapRef.current = map; setReady(true) })
    return () => map.remove()
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready || registry.length === 0) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Transformer marker (diamond)
    const txEl = document.createElement('div')
    txEl.style.cssText = 'width:16px;height:16px;background:#60a5fa;transform:rotate(45deg);border:2px solid #fff'
    new mapboxgl.Marker({ element: txEl }).setLngLat([3.40, 6.50]).addTo(map)

    // SPDU markers
    registry.forEach((spdu) => {
      const fault = faultMap[spdu.spdu_id]
      const colour = fault ? SEVERITY_COLOUR[fault.severity] : SEVERITY_COLOUR.INFO
      const el = document.createElement('div')
      el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${colour};border:2px solid rgba(255,255,255,0.4);cursor:pointer`
      el.title = spdu.spdu_id
      el.addEventListener('click', () => onSelectSPDU(spdu.spdu_id))
      const marker = new mapboxgl.Marker({ element: el }).setLngLat([spdu.lon, spdu.lat]).addTo(map)
      markersRef.current.push(marker)
    })

    // Feeder lines per feeder_id
    const byFeeder: Record<number, SPDURegistry[]> = {}
    registry.forEach((s) => { byFeeder[s.feeder_id] = [...(byFeeder[s.feeder_id] ?? []), s] })
    Object.entries(byFeeder).forEach(([fid, spduList]) => {
      const sorted = [...spduList].sort((a, b) => a.feeder_order - b.feeder_order)
      const coords: [number, number][] = [[3.40, 6.50], ...sorted.map((s) => [s.lon, s.lat] as [number, number])]
      const sourceId = `feeder-${fid}`
      const layerId = `feeder-line-${fid}`
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      map.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} } })
      map.addLayer({ id: layerId, type: 'line', source: sourceId, paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-opacity': 0.7 } })
    })
  }, [ready, registry, faultMap, onSelectSPDU])

  return <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />
}
