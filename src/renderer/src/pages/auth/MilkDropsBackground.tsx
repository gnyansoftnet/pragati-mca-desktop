
import { useEffect, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

interface MilkDropsBackgroundProps {}

const MilkDropsBackground: React.FC<MilkDropsBackgroundProps> = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Helper: Create a single milk drop ripple at (x, y)
    const spawnDrop = (
      x: number,
      y: number,
      scale: number = 1,
      duration: number = 3.8
    ): void => {
      const dropEl = document.createElement('div')

      dropEl.className = 'milk-drop'
      dropEl.style.left = `${x}px`
      dropEl.style.top = `${y}px`
      dropEl.style.setProperty('--drop-scale', String(scale))
      dropEl.style.setProperty('--drop-dur', `${duration}s`)

      container.appendChild(dropEl)

      // Remove element after animation completes
      window.setTimeout(() => {
        dropEl.remove()
      }, duration * 1000)
    }

    // 1. Initial burst
    const rect = container.getBoundingClientRect()
    const w = rect.width || window.innerWidth / 2
    const h = rect.height || window.innerHeight

    spawnDrop(w * 0.3, h * 0.25, 0.85, 3.5)

    const initialTimeouts: number[] = []

    initialTimeouts.push(
      window.setTimeout(() => {
        spawnDrop(w * 0.75, h * 0.65, 1.1, 4.0)
      }, 900)
    )

    initialTimeouts.push(
      window.setTimeout(() => {
        spawnDrop(w * 0.45, h * 0.8, 0.75, 3.4)
      }, 1800)
    )

    // 2. Continuous rain of milk drops
    const interval = window.setInterval(() => {
      const activeRect = container.getBoundingClientRect()

      const randomX = Math.random() * activeRect.width
      const randomY = Math.random() * activeRect.height
      const randomScale = 0.6 + Math.random() * 0.6
      const randomDur = 3.2 + Math.random() * 1.2

      spawnDrop(randomX, randomY, randomScale, randomDur)
    }, 1400)

    // 3. User click
    const handleClick = (e: MouseEvent): void => {
      const bounds = container.getBoundingClientRect()

      const clickX = e.clientX - bounds.left
      const clickY = e.clientY - bounds.top

      spawnDrop(clickX, clickY, 1.15, 3.6)
    }

    // Listen on parent element
    const parent = container.parentElement

    if (parent) {
      parent.addEventListener('click', handleClick)
    }

    // Cleanup
    return () => {
      window.clearInterval(interval)

      initialTimeouts.forEach((timeout) => {
        window.clearTimeout(timeout)
      })

      if (parent) {
        parent.removeEventListener('click', handleClick)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      <style>{`
        /* ================= NEUOMORPHIC MILK DROP STYLES ================= */

        :root {
          --milk-base-light: #e4e7f2;
          --milk-lighten: rgba(255, 255, 255, 0.95);
          --milk-darken: rgba(180, 186, 206, 0.65);
          --milk-border: rgba(255, 255, 255, 0.8);
        }

        .dark {
          --milk-base-light: #18181b;
          --milk-lighten: rgba(255, 255, 255, 0.12);
          --milk-darken: rgba(0, 0, 0, 0.65);
          --milk-border: rgba(255, 255, 255, 0.15);
        }

        .milk-drop {
          position: absolute;
          transform: translate(-50%, -50%) scale(var(--drop-scale, 1));
          border-radius: 50%;
          filter: blur(1.5px);
          pointer-events: none;
          animation: milkExpand var(--drop-dur, 3.8s)
            cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }

        /* Outer Ripple */
        @keyframes milkExpand {
          0% {
            width: 0;
            height: 0;
            opacity: 0.95;
            box-shadow:
              -15px -15px 25px var(--milk-lighten),
              15px 15px 25px var(--milk-darken),
              inset -15px -15px 25px var(--milk-lighten),
              inset 15px 15px 25px var(--milk-darken);
            border: 0 solid var(--milk-border);
          }

          6% {
            box-shadow:
              -15px -15px 25px var(--milk-lighten),
              15px 15px 25px var(--milk-darken),
              inset -15px -15px 25px var(--milk-lighten),
              inset 15px 15px 25px var(--milk-darken);
            border: 5px solid var(--milk-border);
          }

          85% {
            box-shadow: none;
            border: 3px solid var(--milk-border);
          }

          100% {
            width: 450px;
            height: 450px;
            opacity: 0;
            box-shadow: none;
            border: 0 solid transparent;
          }
        }

        /* Inner Concentric Secondary Ripple */
        .milk-drop::before {
          content: '';
          position: absolute;
          margin: auto;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          animation: milkExpandInner var(--drop-dur, 3.8s)
            cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }

        @keyframes milkExpandInner {
          0% {
            width: 0%;
            height: 0%;
            opacity: 0.9;
            box-shadow:
              -10px -10px 18px var(--milk-lighten),
              10px 10px 18px var(--milk-darken),
              inset -10px -10px 18px var(--milk-lighten),
              inset 10px 10px 18px var(--milk-darken);
            border: 0 solid var(--milk-border);
          }

          20% {
            box-shadow:
              -10px -10px 18px var(--milk-lighten),
              10px 10px 18px var(--milk-darken),
              inset -10px -10px 18px var(--milk-lighten),
              inset 10px 10px 18px var(--milk-darken);
          }

          100% {
            width: 65%;
            height: 65%;
            opacity: 0;
            box-shadow: none;
            border: 2px solid var(--milk-border);
          }
        }
      `}</style>
    </div>
  )
}

export default MilkDropsBackground
