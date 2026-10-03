import { useLayoutEffect, useRef } from 'react'
import { useWindows } from '@/os/WindowManager'
import type { Bounds } from '@/os/types'

/**
 * True macOS-style genie minimize/restore effect.
 *
 * When a window minimizes, its live DOM node is cloned and sliced into vertical
 * strips. Each strip is then animated with the Web Animations API so the window
 * funnels into its Dock icon: slices nearest the icon collapse first, the bottom
 * edge accelerates toward the Dock while the top lags, and a skewX shear gives
 * the curved "suck" shape. Restoring plays the same curve in reverse (farthest
 * slices leading) with a soft settle at the end.
 *
 * The real window hides instantly while this runs; WindowManager applies the
 * final minimized/restored state when the animation completes.
 */

const SLICE_TARGET_PX = 56
const STEPS = 24

function outKeyframes(
  rect: Bounds,
  cx: number,
  tx: number,
  ty: number,
  dirSign: number,
  maxSkew: number,
): Keyframe[] {
  const bottom0 = rect.y + rect.h
  const frames: Keyframe[] = []
  for (let s = 0; s <= STEPS; s++) {
    const p = s / STEPS
    const e = Math.pow(p, 2.3) // accelerating suck into the Dock
    const eTop = Math.pow(p, 1.35) * 0.985 // top edge lags behind
    const newBottom = bottom0 + (ty - bottom0) * e
    const newTop = rect.y + (ty - rect.y) * eTop
    const dx = (tx - cx) * Math.pow(p, 2) * 0.94
    const dy = newBottom - bottom0
    const sx = Math.max(0.05, 1 - 0.92 * Math.pow(p, 1.7))
    const sy = Math.max(0.02, (newBottom - newTop) / rect.h)
    const skew = dirSign * maxSkew * Math.sin(p * Math.PI) // curved funnel, peaks mid-flight
    const opacity = p > 0.8 ? Math.max(0, 1 - (p - 0.8) / 0.2) : 1
    frames.push({
      transform:
        `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) ` +
        `scaleX(${sx.toFixed(4)}) scaleY(${sy.toFixed(4)}) skewX(${skew.toFixed(2)}deg)`,
      opacity: opacity.toFixed(3),
    })
  }
  return frames
}

const IDENTITY =
  'translate3d(0px, 0px, 0) scaleX(1) scaleY(1) skewX(0deg)'

export default function GenieOverlay() {
  const { genie, finishGenie } = useWindows()
  const hostRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!genie || !host) return

    let done = false
    const finish = () => {
      if (done) return
      done = true
      host.innerHTML = ''
      finishGenie()
    }

    // Respect reduced-motion: apply the end state with no animation.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    const { rect, target, direction, winId } = genie
    const node = document.querySelector(
      `#window-layer [data-window-id="${winId}"]`,
    ) as HTMLElement | null
    if (!node || rect.w < 8 || rect.h < 8) {
      finish()
      return
    }

    const tx = target.x
    const ty = target.y
    const n = Math.max(10, Math.min(20, Math.round(rect.w / SLICE_TARGET_PX)))
    const sliceW = rect.w / n
    const centers = Array.from({ length: n }, (_, i) => rect.x + (i + 0.5) * sliceW)
    const maxDist = Math.max(1, ...centers.map((c) => Math.abs(c - tx)))

    // One clean clone of the live window; each slice shows a vertical strip of it.
    const base = node.cloneNode(true) as HTMLElement
    base.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
    base.removeAttribute('data-window-id')

    const anims: Animation[] = []

    for (let i = 0; i < n; i++) {
      const cx = centers[i]
      const dist = Math.abs(cx - tx)
      const dirSign = Math.sign(tx - cx)
      const maxSkew = Math.min(20, (20 * dist) / (rect.w * 0.6))

      const slice = document.createElement('div')
      slice.setAttribute('aria-hidden', 'true')
      const sliceLeft = rect.x + i * sliceW
      Object.assign(slice.style, {
        position: 'absolute',
        left: `${sliceLeft - 0.5}px`,
        top: `${rect.y}px`,
        width: `${sliceW + 1}px`,
        height: `${rect.h}px`,
        overflow: 'hidden',
        pointerEvents: 'none',
        transformOrigin: '50% 100%',
      } satisfies Partial<CSSStyleDeclaration>)
      // Keep the window's rounded corners on the outer slices.
      if (i === 0) {
        slice.style.borderTopLeftRadius = '12px'
        slice.style.borderBottomLeftRadius = '12px'
      }
      if (i === n - 1) {
        slice.style.borderTopRightRadius = '12px'
        slice.style.borderBottomRightRadius = '12px'
      }

      const inner = base.cloneNode(true) as HTMLElement
      Object.assign(inner.style, {
        position: 'absolute',
        left: `${-(i * sliceW - 0.5)}px`,
        top: '0px',
        width: `${rect.w}px`,
        height: `${rect.h}px`,
        transform: 'none',
        opacity: '1',
        margin: '0',
        pointerEvents: 'none',
      } satisfies Partial<CSSStyleDeclaration>)
      slice.appendChild(inner)
      host.appendChild(slice)

      let frames: Keyframe[]
      let delay: number
      let duration: number
      if (direction === 'out') {
        frames = outKeyframes(rect, cx, tx, ty, dirSign, maxSkew)
        // Slices nearest the Dock icon collapse first.
        delay = 170 * Math.pow(dist / maxDist, 1.25)
        duration = 480
      } else {
        // Restore: the suck in reverse, farthest slices leading, soft settle.
        frames = outKeyframes(rect, cx, tx, ty, dirSign, maxSkew)
          .reverse()
          .map((f) => ({ ...f, opacity: 1 }))
        frames.push(
          {
            transform:
              'translate3d(0px, 0px, 0) scaleX(1.035) scaleY(1.035) skewX(0deg)',
            opacity: 1,
          },
          { transform: IDENTITY, opacity: 1 },
        )
        delay = 150 * Math.pow(1 - dist / maxDist, 1.2)
        duration = 520
      }

      anims.push(slice.animate(frames, { duration, delay, easing: 'linear', fill: 'forwards' }))
    }

    Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(finish)

    return () => {
      if (!done) {
        done = true
        anims.forEach((a) => {
          try {
            a.cancel()
          } catch {
            /* already finished */
          }
        })
        host.innerHTML = ''
      }
    }
  }, [genie, finishGenie])

  return <div ref={hostRef} aria-hidden className="pointer-events-none fixed inset-0 z-[140]" />
}
