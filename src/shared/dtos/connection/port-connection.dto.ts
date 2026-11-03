export interface PortConnectionDto {
  id: number
  portName: string
  parity: string
  stopBits: string
  braudRate: string
  dataBits: string
}

export interface CreatePortConnectionDto {
  portName: string
  parity?: string
  stopBits?: string
  braudRate?: string
  dataBits?: string
}

export interface UpdatePortConnectionDto {
  portName: string
  parity?: string
  stopBits?: string
  braudRate?: string
  dataBits?: string
}
