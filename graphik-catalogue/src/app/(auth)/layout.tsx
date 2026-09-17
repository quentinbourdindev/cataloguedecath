import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Connexion — Graphik Catalogue",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
