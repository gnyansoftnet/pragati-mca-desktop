const pos1 = 0 // same as your VB pos1
const pos2 = 0 // same as your VB pos2

export function parseWeight(raw: string): number {
  const part = raw.split('.')[0]
  const cut = part.substring(pos1)
  const value = cut.substring(0, cut.length - pos2)
  const num = parseFloat(value.replace(/[^\d.\-]/g, ''))
  return isNaN(num) ? 0 : num
}