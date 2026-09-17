"use client"

import { useState, useCallback } from "react"

export interface CartLine {
  id?: string
  productId?: string | null
  customName?: string | null
  productName: string // Nom affiché (produit ou customName)
  category?: string
  quantity: number
  width?: number | null
  height?: number | null
  selectedOption?: string | null
  unitPriceHT: number
  totalPriceHT: number
  pricingType: "UNIT" | "SQM"
  isOutOfCatalogue?: boolean
  attachmentUrl?: string | null
}

export function useCart(initialLines: CartLine[] = []) {
  const [lines, setLines] = useState<CartLine[]>(initialLines)

  const totalHT = lines.reduce((sum, l) => sum + l.totalPriceHT, 0)

  const computeTotal = (line: Omit<CartLine, "totalPriceHT">) => {
    if (line.pricingType === "SQM" && line.width && line.height) {
      return line.width * line.height * line.unitPriceHT * line.quantity
    }
    return line.unitPriceHT * line.quantity
  }

  const addLine = useCallback((line: Omit<CartLine, "totalPriceHT">) => {
    const totalPriceHT = computeTotal(line)
    setLines((prev) => [...prev, { ...line, totalPriceHT }])
  }, [])

  const updateLine = useCallback((index: number, updates: Partial<CartLine>) => {
    setLines((prev) => {
      const updated = [...prev]
      const line = { ...updated[index], ...updates }
      line.totalPriceHT = computeTotal(line)
      updated[index] = line
      return updated
    })
  }, [])

  const removeLine = useCallback((index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearCart = useCallback(() => {
    setLines([])
  }, [])

  return {
    lines,
    setLines,
    totalHT,
    addLine,
    updateLine,
    removeLine,
    clearCart,
  }
}
