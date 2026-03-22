import { Html } from '@react-three/drei'

export default function TransformerNode() {
  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#4b5563" metalness={0.8} roughness={0.3} />
      </mesh>
      <Html position={[0, 1.4, 0]} center>
        <div className="bg-gray-800 border border-gray-600 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
          Transformer
        </div>
      </Html>
    </group>
  )
}
