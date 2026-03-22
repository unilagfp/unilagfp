export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'SILENT'

export interface SPDURegistry {
  spdu_id: string
  lcu_id: string
  feeder_id: 1 | 2 | 3 | 4
  feeder_order: number
  lat: number
  lon: number
  created_at: string
}

export interface SPDUReading {
  id: string
  spdu_id: string
  lcu_id: string
  v_a: number
  v_b: number
  v_c: number
  i_a: number
  i_b: number
  i_c: number
  p_active: number
  q_reactive: number
  pf: number
  thd_i: number
  relay_state: 'CLOSED' | 'OPEN'
  last_gasp: boolean
  timestamp: string
  created_at: string
}

export interface FaultEvent {
  id: string
  spdu_id: string
  lcu_id: string
  fault_type: string
  severity: Severity
  v_a: number
  v_b: number
  v_c: number
  i_a: number
  i_b: number
  i_c: number
  thd_i: number
  lat: number
  lon: number
  resolved: boolean
  timestamp: string
  created_at: string
}

export interface TransformerStatus {
  id: string
  lcu_id: string
  i_transformer: number
  i_spdu_sum: number
  i_line_loss: number
  i_residual: number
  dca_anomaly: boolean
  timestamp: string
  created_at: string
}

export interface Account {
  account_id: string
  customer_name: string
  meter_number: string
  spdu_id: string
  tariff_band: 'A' | 'B' | 'C' | 'D' | 'E'
  credit_balance: number
  relay_state: 'CLOSED' | 'OPEN'
  status: 'ACTIVE' | 'DISCONNECTED' | 'SUSPENDED'
  created_at: string
}

export interface SilentEvent {
  id: string
  spdu_id: string
  lcu_id: string
  cause: 'Blackout (Last Gasp confirmed)' | 'Comms Failure (No Last Gasp)'
  timestamp: string
  created_at: string
}
