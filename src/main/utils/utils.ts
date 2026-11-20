export const toDateStr = (d: Date | string): string => {
  if (typeof d === 'string') return d.slice(0, 10)
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
