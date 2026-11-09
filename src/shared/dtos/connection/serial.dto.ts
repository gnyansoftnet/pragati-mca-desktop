export interface SerialConnectDto {
  path: string
  baudRate: number
  // parity: 'none' | 'even' | 'odd' | 'mark' | 'space'
  // dataBits: 5 | 6 | 7 | 8
  // stopBits: 1 | 1.5 | 2
  parity: string
  dataBits: number
  stopBits: number
}

export interface SerialResultDto {
  ok: boolean
  error?: string
}
