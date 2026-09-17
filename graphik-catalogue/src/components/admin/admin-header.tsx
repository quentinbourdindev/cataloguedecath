"use client"

import { signOut } from "next-auth/react"
import { LogOut, Bell } from "lucide-react"

interface AdminHeaderProps {
  user: {
    email: string
    firstName?: string | null
    lastName?: string | null
    role: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between h-14 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-neutral-900">{displayName}</p>
          <p className="text-xs text-neutral-400">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Déconnexion</span>
        </button>
      </div>
    </header>
  )
}
