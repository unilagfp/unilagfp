'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Severity } from '@/types/dpms'

interface Props {
  position: [number, number, number]
  colour: string
  spduId: string
  severity?: Severity
  onClick: () => void
  onPointerOver: () => void
  onPointerOut: () => void
}

export default function SPDUNode({ position, colour, severity, onClick, onPointerOver, onPointerOut }: Props) {
  const ringRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ringRef.current) return
    if (severity === 'CRITICAL') {
      ringRef.current.scale.setScalar(1 + 0.3 * Math.abs(Math.sin(clock.elapsedTime * 4)))
    } else if (severity === 'HIGH') {
      ringRef.current.scale.setScalar(1 + 0.2 * Math.abs(Math.sin(clock.elapsedTime * 2)))
    }
  })

  return (
    <group position={position}>
      {/* Pole */}
      <mesh castShadow onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <cylinderGeometry args={[0.12, 0.15, 2, 8]} />
        <meshStandardMaterial color={colour} metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Pulse ring for HIGH/CRITICAL */}
      {(severity === 'CRITICAL' || severity === 'HIGH') && (
        <mesh ref={ringRef} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.04, 8, 32]} />
          <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}
