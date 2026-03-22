'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Suspense, useState } from 'react'
import type { SPDURegistry, FaultEvent } from '@/types/dpms'
import { SEVERITY_COLOUR } from '@/lib/severity'
import TransformerNode from './TransformerNode'
import SPDUNode from './SPDUNode'
import FeederLine from './FeederLine'

const FEEDER_DIRS: Record<number, [number, number, number]> = {
  1: [0, 0, -1],   // North
  2: [1, 0, 0],    // East
  3: [0, 0, 1],    // South
  4: [-1, 0, 0],   // West
}
const SPACING = 4

interface Props {
  registry: SPDURegistry[]
  faultMap: Record<string, FaultEvent>
  onSelectSPDU: (id: string) => void
}

export default function NetworkScene({ registry, faultMap, onSelectSPDU }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const byFeeder: Record<number, SPDURegistry[]> = { 1: [], 2: [], 3: [], 4: [] }
  registry.forEach((s) => byFeeder[s.feeder_id]?.push(s))
  Object.values(byFeeder).forEach((arr) => arr.sort((a, b) => a.feeder_order - b.feeder_order))

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [12, 12, 12], fov: 50 }} style={{ background: '#030712' }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
        <Suspense fallback={null}>
          <TransformerNode />
          {Object.entries(byFeeder).map(([fid, spduList]) => {
            const dir = FEEDER_DIRS[Number(fid)]
            const nodes: [number, number, number][] = [[0, 0, 0]]
            spduList.forEach((_, i) => {
              nodes.push([dir[0] * SPACING * (i + 1), 0, dir[2] * SPACING * (i + 1)])
            })
            return (
              <group key={fid}>
                {nodes.slice(1).map((pos, i) => {
                  const spdu = spduList[i]
                  const fault = faultMap[spdu.spdu_id]
                  const colour = fault ? SEVERITY_COLOUR[fault.severity] : '#22C55E'
                  return (
                    <group key={spdu.spdu_id}>
                      <FeederLine from={nodes[i]} to={pos} colour={colour} />
                      <SPDUNode
                        position={pos}
                        colour={colour}
                        spduId={spdu.spdu_id}
                        severity={fault?.severity}
                        onClick={() => onSelectSPDU(spdu.spdu_id)}
                        onPointerOver={() => setHovered(spdu.spdu_id)}
                        onPointerOut={() => setHovered(null)}
                      />
                      {hovered === spdu.spdu_id && (
                        <Html position={[pos[0], pos[1] + 2.5, pos[2]]} center>
                          <div className="bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            {spdu.spdu_id} {fault ? `· ${fault.severity}` : '· Normal'}
                          </div>
                        </Html>
                      )}
                    </group>
                  )
                })}
              </group>
            )
          })}
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
      {/* Legend */}
      <div className="absolute top-3 right-3 bg-gray-900/90 border border-gray-700 rounded-lg p-3 text-xs space-y-1">
        {(['CRITICAL','HIGH','MEDIUM','LOW','INFO','SILENT'] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SEVERITY_COLOUR[s] }} />
            <span className="text-gray-300">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
