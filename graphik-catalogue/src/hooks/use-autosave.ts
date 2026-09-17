"use client"

import { useEffect, useRef, useCallback } from "react"

/**
 * Autosave debounced — sauvegarde les données après un délai d'inactivité
 * @param data Les données à sauvegarder
 * @param saveFn La fonction de sauvegarde async
 * @param delay Délai en ms (défaut: 1200ms)
 */
export function useAutosave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  delay = 1200
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dataRef = useRef<T>(data)
  const saveFnRef = useRef(saveFn)

  useEffect(() => {
    dataRef.current = data
    saveFnRef.current = saveFn
  })

  const debouncedSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await saveFnRef.current(dataRef.current)
      } catch (err) {
        console.error("Autosave failed:", err)
      }
    }, delay)
  }, [delay])

  useEffect(() => {
    debouncedSave()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, debouncedSave])
}
