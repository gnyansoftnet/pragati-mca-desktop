import { ParserType } from '@shared/dtos/connection/serial-com-port.dto'

export type ParsedReading = Record<string, string | number>
export interface SerialParser {
  // return null if the line is not a valid reading (noise, header, unstable value ...)
  parse(line: string): ParsedReading | null
}

// no parsing, UI gets the line as-is
const raw: SerialParser = {
  parse: (line) => ({ value: line })
}

// PLACEHOLDER: change to your scale's real output.
// "ST,GS,  12.50kg" -> { weight: 12.5 }     (ST = stable, US = unstable)
const weight: SerialParser = {
  parse(line) {
    if (/^US\b/i.test(line)) return null // ignore unstable readings
    const m = line.match(/-?\d+(?:\.\d+)?/)
    return m ? { weight: parseFloat(m[0]) } : null
  }
}

// PLACEHOLDER: change to your analyzer's real output.
// "FAT=4.5 SNF=8.6 CLR=28.1" -> { fat: 4.5, snf: 8.6, clr: 28.1 }

const milkAnalyzer: SerialParser = {
  parse(line) {
    const out: ParsedReading = {}
    for (const m of line.matchAll(/([A-Za-z]+)\s*[=:]\s*(-?\d+(?:\.\d+)?)/g)) {
      const key = m[1].toLowerCase()
      if (key === 'fat' || key === 'snf' || key === 'clr') out[key] = parseFloat(m[2])
    }
    return Object.keys(out).length ? out : null
  }
}

export const PARSERS: Record<ParserType, SerialParser> = { raw, weight, milkAnalyzer }
