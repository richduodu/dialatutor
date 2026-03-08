"use client"

import Link from "next/link"
import { ShieldCheck, BookOpen, BarChart3, Phone, User, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUser, useAuth } from "@/firebase"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"

export function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const auth = useAuth()

  const links = [
    { href: "/", label: "Home", icon: ShieldCheck },
    { href: "/lesson", label: "Dial A Tutor", icon: Phone },
    { href: "/my-progress", label: "My Progress", icon: User },
    { href: "/dashboard", label: "Impact Verifier", icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">Dial A Tutor</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex gap-6">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary",
                  pathname === href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>

          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground"
              onClick={() => signOut(auth)}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          ) : (
            <Button size="sm" className="rounded-full px-6" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
