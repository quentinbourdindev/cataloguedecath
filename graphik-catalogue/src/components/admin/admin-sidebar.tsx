"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Store,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/briefs", label: "Briefs", icon: FileText },
  { href: "/admin/produits", label: "Catalogue", icon: Package },
  { href: "/admin/stores", label: "Magasins & Clients", icon: Store },
  { href: "/admin/connexions", label: "Journal de co.", icon: Users },
  { href: "/admin/demandes-acces", label: "Demandes d'accès", icon: FileText },
]

interface AdminSidebarProps {
  role: string
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-neutral-950 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
            <span className="text-neutral-950 font-black text-xs">G</span>
          </div>
          <div>
            <p className="font-semibold text-sm tracking-tight">GRAPHIK</p>
            <p className="text-neutral-500 text-xs">Administration</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-neutral-950"
                  : "text-neutral-400 hover:text-white hover:bg-white/10"
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          )
        })}
      </nav>

      {/* Badge rôle */}
      <div className="px-5 py-4 border-t border-white/10">
        <span className="text-xs text-neutral-500 uppercase tracking-wider">{role}</span>
      </div>
    </aside>
  )
}
