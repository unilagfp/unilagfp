import { useMemo } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'

interface Props {
  from: [number, number, number]
  to: [number, number, number]
  colour: string
}

export default function FeederLine({ from, to, colour }: Props) {
  const curve = useMemo(
    () => new CatmullRomCurve3([new Vector3(...from), new Vector3(...to)]),
    [from, to]
  )
  return (
    <mesh>
      <tubeGeometry args={[curve, 8, 0.04, 6, false]} />
      <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={0.4} />
    </mesh>
  )
}
