"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Smartphone, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/firebase"
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // For this prototype, we'll use anonymous sign-in to represent a quick IVR-style phone login
    initiateAnonymousSignIn(auth)
    toast({
      title: "Logging in...",
      description: "Verifying your simulated identity.",
    })
    router.push("/lesson")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow container flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black font-headline">Student Access</CardTitle>
            <CardDescription>
              Enter your phone number to continue your learning journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    placeholder="+1 (555) 000-0000" 
                    className="pl-10"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full gap-2 rounded-full h-12 shadow-lg">
                <LogIn className="h-4 w-4" /> Start Learning
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground mb-4">First time here?</p>
              <Button variant="outline" className="w-full gap-2 rounded-full h-12" onClick={handleLogin}>
                <UserPlus className="h-4 w-4" /> Register Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
