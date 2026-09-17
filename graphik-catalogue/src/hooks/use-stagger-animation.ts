"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export function useStaggerAnimation(dependency?: any) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const items = containerRef.current.querySelectorAll("[data-animate]")
    if (items.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      )
    })
    return () => ctx.revert()
  }, [dependency])

  return containerRef
}
