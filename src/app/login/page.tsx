
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, LogIn, UserPlus, Loader2, User, Globe } from "lucide-react"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInAnonymously } from "firebase/auth"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [fullName, setFullName] = useState("")
  const [grade, setGrade] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)
  
  const countryCodes = [
    { code: "+1", name: "US/CA" },
    { code: "+44", name: "UK" },
    { code: "+234", name: "NG" },
    { code: "+91", name: "IN" },
    { code: "+254", name: "KE" },
    { code: "+27", name: "ZA" },
    { code: "+61", name: "AU" },
    { code: "+33", name: "FR" },
    { code: "+49", name: "DE" },
    { code: "+81", name: "JP" },
  ]

  // Redirect if already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/lesson")
    }
  }, [user, isUserLoading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const fullPhoneNumber = `${countryCode}${phoneNumber.replace(/\D/g, '')}`
    
    try {
      // In this prototype, we use anonymous sign-in to simulate the phone-based identity
      const userCredential = await signInAnonymously(auth)
      const newUser = userCredential.user

      if (mode === 'register' && db) {
        // Save the student profile immediately after registration
        const studentRef = doc(db, 'students', newUser.uid)
        setDocumentNonBlocking(studentRef, {
          id: newUser.uid,
          externalAuthId: newUser.uid,
          phoneNumber: fullPhoneNumber,
          name: fullName,
          gradeLevel: grade, // Store preferred grade
          createdAt: new Date().toISOString()
        }, { merge: true })
        
        toast({
          title: "Account Created!",
          description: `Welcome to Voice2Learn, ${fullName}.`,
        })
      } else {
        toast({
          title: "Logged In",
          description: "Resuming your learning journey.",
        })
      }
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Please try again later.",
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  if (isUserLoading || (user && !isSubmitting)) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow container flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-black font-headline">
              {mode === 'login' ? 'Student Access' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Enter your phone number to continue your learning journey.' 
                : 'Join Dial-a-Lesson and start earning blockchain-backed proofs.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="Jane Doe" 
                      className="pl-10 h-11 rounded-xl"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="w-32 shrink-0">
                    <Select value={countryCode} onValueChange={setCountryCode} disabled={isSubmitting}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="+1" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative flex-1">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="555-000-0000" 
                      className="pl-10 h-11 rounded-xl"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="grade">Your Grade Level</Label>
                  <Select value={grade} onValueChange={setGrade} required>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select your grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full gap-2 rounded-full h-12 shadow-lg mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === 'login' ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )} 
                {isSubmitting ? "Connecting..." : mode === 'login' ? "Start Learning" : "Register & Start"}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground mb-4">
                {mode === 'login' ? "First time here?" : "Already have an account?"}
              </p>
              <Button 
                variant="outline" 
                className="w-full gap-2 rounded-full h-12" 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                disabled={isSubmitting}
              >
                {mode === 'login' ? (
                  <><UserPlus className="h-4 w-4" /> Register Account</>
                ) : (
                  <><LogIn className="h-4 w-4" /> Switch to Login</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
