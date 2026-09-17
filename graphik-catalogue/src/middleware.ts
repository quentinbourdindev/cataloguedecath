import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Routes publiques (ne nécessitent pas d'authentification)
  const publicRoutes = ["/login", "/api/auth", "/"]
  // On considère la racine (/) comme publique uniquement si c'est exactement "/"
  const isPublic = publicRoutes.some((r) => r === "/" ? pathname === "/" : pathname.startsWith(r))

  if (isPublic) return NextResponse.next()

  // Non authentifié → redirige vers login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = session.user.role

  // Routes admin — réservées aux COMMERCIAL, ADMIN et SUPER_ADMIN
  if (pathname.startsWith("/admin")) {
    if (role !== "COMMERCIAL" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/catalogue", req.url))
    }
  }

  // Routes client — réservées aux CLIENT
  if (pathname.startsWith("/catalogue") || pathname.startsWith("/devis")) {
    if (role !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
