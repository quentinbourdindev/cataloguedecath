"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 1.2, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const obj = useRef({ val: 0 })

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.to(obj.current, {
        val: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.current.val).toString()
          }
        },
      })
    })
    return () => ctx.revert()
  }, [value, duration])

  return <span ref={ref} className={className}>0</span>
}
