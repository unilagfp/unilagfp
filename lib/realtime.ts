import { supabase } from './supabase'
import type { FaultEvent, SPDUReading, TransformerStatus } from '@/types/dpms'

export function subscribeFaultEvents(onInsert: (row: FaultEvent) => void) {
  return supabase
    .channel('fault_events')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fault_events' },
      (payload) => onInsert(payload.new as FaultEvent))
    .subscribe()
}

export function subscribeSPDUReadings(onInsert: (row: SPDUReading) => void) {
  return supabase
    .channel('spdu_readings')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spdu_readings' },
      (payload) => onInsert(payload.new as SPDUReading))
    .subscribe()
}

export function subscribeTransformerStatus(onInsert: (row: TransformerStatus) => void) {
  return supabase
    .channel('transformer_status')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transformer_status' },
      (payload) => onInsert(payload.new as TransformerStatus))
    .subscribe()
}
