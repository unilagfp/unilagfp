import type { Severity } from '@/types/dpms'

export const SEVERITY_COLOUR: Record<Severity, string> = {
  CRITICAL: '#FF2D2D',
  HIGH:     '#FF6B00',
  MEDIUM:   '#FFB800',
  LOW:      '#4FC3F7',
  INFO:     '#22C55E',
  SILENT:   '#6B7280',
}

export const SEVERITY_BG: Record<Severity, string> = {
  CRITICAL: 'bg-red-600',
  HIGH:     'bg-orange-500',
  MEDIUM:   'bg-yellow-500',
  LOW:      'bg-sky-400',
  INFO:     'bg-green-500',
  SILENT:   'bg-gray-500',
}

export const SEVERITY_ORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO', 'SILENT']

export function severityFromFaultType(fault_type: string): Severity {
  const f = fault_type.toLowerCase()
  if (f.includes('l-l-l') || f.includes('arcing') || f.includes('line break') || f.includes('blackout')) return 'CRITICAL'
  if (f.includes('phase failure') || f.includes('l-l') || f.includes('theft') || f.includes('overload')) return 'HIGH'
  if (f.includes('l-g') || f.includes('undervoltage') || f.includes('overvoltage')) return 'MEDIUM'
  if (f.includes('incipient')) return 'LOW'
  return 'INFO'
}
