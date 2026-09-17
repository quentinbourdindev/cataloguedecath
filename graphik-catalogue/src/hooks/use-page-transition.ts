"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export function usePageTransition() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
    })
    return () => ctx.revert()
  }, [])

  return containerRef
}
