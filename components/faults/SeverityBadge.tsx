import { SEVERITY_BG } from '@/lib/severity'
import type { Severity } from '@/types/dpms'

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${SEVERITY_BG[severity]}`}>
      {severity}
    </span>
  )
}
