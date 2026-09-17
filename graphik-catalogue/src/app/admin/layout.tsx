import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) redirect("/login")
  if (session.user.role === "CLIENT") redirect("/catalogue")

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session.user} />
        <main className="flex-1 px-6 py-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
