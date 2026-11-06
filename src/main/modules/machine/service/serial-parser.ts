import { ParserType } from '@shared/dtos/connection/serial-com-port.dto'

export type ParsedReading = Record<string, string | number>

export interface ParseResult {
  data: ParsedReading | null // latest values found in the text, or null
  rest: string // unfinished text, kept for the next chunk
  raw?: string // last complete frame seen (shown on the connection page)
}

export interface SerialParser {
  parse(text: string): ParseResult
}

// ---------------------------------------------------------------
// helpers: you normally only write the function that reads ONE frame
// ---------------------------------------------------------------

const LINE_END = /\r\n|\n|\r/ // frames end with Enter
const BRACKET_END = /\)/ // frames end with ")"

// cut the text into complete frames; the unfinished tail is returned as "rest"
function cut(text: string, end: RegExp): { frames: string[]; rest: string } {
  const re = new RegExp(end.source, 'g')
  const frames: string[] = []
  let start = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const stop = m.index + m[0].length
    const frame = text.slice(start, stop).trim()
    if (frame) frames.push(frame)
    start = stop
  }
  return { frames, rest: text.slice(start) }
}

function makeParser(
  end: RegExp,
  parseFrame: (frame: string) => ParsedReading | null
): SerialParser {
  return {
    parse(text) {
      const { frames, rest } = cut(text, end)
      let data: ParsedReading | null = null
      for (const frame of frames) data = parseFrame(frame) ?? data // keep the latest good frame
      return { data, rest, raw: frames[frames.length - 1] }
    }
  }
}

// ---------------------------------------------------------------
// no parsing, UI gets the line as-is
// ---------------------------------------------------------------
const raw = makeParser(LINE_END, (frame) => ({ value: frame }))

// ---------------------------------------------------------------
// PLACEHOLDER: change to your scale's real output.
// "ST,GS,  12.50kg" -> { weight: 12.5 }     (ST = stable, US = unstable)
// ---------------------------------------------------------------
const weight = makeParser(LINE_END, (frame) => {
  if (/^US\b/i.test(frame)) return null // ignore unstable readings
  const m = frame.match(/-?\d+(?:\.\d+)?/)
  return m ? { weight: parseFloat(m[0]) } : null
})

// ---------------------------------------------------------------
// Milk analyzer: frames like (0380...) with digits only, no labels.
//
// start    = position of the first digit of the value (0 = first digit after the "(")
// length   = how many digits the value uses
// decimals = how many of those digits come after the decimal point
// min/max  = sanity range, a value outside it means the position is wrong
//
// FIELDS is empty on purpose: until you fill it in, nothing is read, so a wrong value
// can't reach the form. Example only (NOT your machine): digits 4 to 7 hold 0450,
// the display shows FAT 4.50 ->  fat: { start: 4, length: 4, decimals: 2, min: 0, max: 15 }
// ---------------------------------------------------------------
interface Field {
  start: number
  length: number
  decimals: number
  min: number
  max: number
}

const FRAME_DIGITS = 29 // exact number of digits in one frame; 0 = do not check the length

const FIELDS: Record<string, Field> = {
  fat: { start: 0, length: 4, decimals: 2, min: 0, max: 15 },
  snf: { start: 5, length: 3, decimals: 2, min: 0, max: 15 },
  wtr: { start: 12, length: 2, decimals: 0, min: 0, max: 100 },
  temp: { start: 20, length: 4, decimals: 2, min: 0, max: 100 }
}

const milkAnalyzer = makeParser(BRACKET_END, (frame) => {
  const m = frame.match(/\((\d+)\)$/)
  if (!m) return null
  const digits = m[1]

  // a frame damaged on the cable (parity error, half frame) is rejected
  if (FRAME_DIGITS && digits.length !== FRAME_DIGITS) return null

  const out: ParsedReading = {}
  for (const [key, f] of Object.entries(FIELDS)) {
    const part = digits.slice(f.start, f.start + f.length)
    if (part.length !== f.length) return null
    const value = Number(part) / 10 ** f.decimals
    if (!Number.isFinite(value) || value < f.min || value > f.max) return null
    out[key] = value
  }
  return Object.keys(out).length ? out : null
})

export const PARSERS: Record<ParserType, SerialParser> = { raw, weight, milkAnalyzer }
