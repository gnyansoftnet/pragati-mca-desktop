// Types shared by main, preload and renderer.

// 'weight' = weighing scale, 'milkAnalyzer' = FAT/SNF/CLR analyzer
export type ParserType = 'raw' | 'weight' | 'milkAnalyzer'

export interface PortConfig {
  path: string // COM3, COM4 ... (or SIM-SCALE / SIM-ANALYZER in dev)
  baudRate: number
  parity: string // 0 none, 1 odd, 2 even, 3 mark, 4 space
  dataBits: number // 5-8
  stopBits: number // 1, 1.5, 2
  parserType: ParserType // which machine is on this port
}

export interface PortListItem {
  path: string
  friendlyName?: string
  manufacturer?: string
}

export type PortStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

export interface PortState {
  path: string
  parserType: ParserType
  status: PortStatus
  error?: string
  lastLine?: string // last raw line the machine sent (great for debugging parsers)
  lastLineParsed?: boolean // false = parser did not understand that line
}

export interface SerialResult {
  ok: boolean
  error?: string
}

export interface SerialSnapshot {
  // latest good value per key (weight, fat, snf, clr) with the time it arrived
  readings: Record<string, { value: string | number; at: number }>
  ports: PortState[]
}


