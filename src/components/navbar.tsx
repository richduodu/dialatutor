"use client"

import Link from "next/link"
import { ShieldCheck, BookOpen, BarChart3, Phone } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home", icon: ShieldCheck },
    { href: "/lesson", label: "Dial-a-Lesson", icon: Phone },
    { href: "/dashboard", label: "Verifier Dashboard", icon: BarChart3 },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Voice2Learn</span>
        </div>
        <div className="flex gap-6">
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
      </div>
    </nav>
  )
}