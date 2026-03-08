
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, LogIn, UserPlus, Loader2, User, Globe, AlertCircle } from "lucide-react"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInAnonymously, signOut } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("")
  const [fullName, setFullName] = useState("")
  const [grade, setGrade] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)

  // Redirect if already logged in and not in the middle of a submission
  useEffect(() => {
    if (!isUserLoading && user && !isSubmitting) {
      router.push("/lesson")
    }
  }, [user, isUserLoading, router, isSubmitting])

  const checkUserExists = async (phone: string) => {
    if (!db) return null
    const studentsRef = collection(db, "students")
    const q = query(studentsRef, where("phoneNumber", "==", phone))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter a valid phone number.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // 1. Sign in anonymously FIRST to establish a context for checking existence
      // Firestore rules require isSignedIn() for collection queries.
      const userCredential = await signInAnonymously(auth)
      const newUser = userCredential.user

      // 2. Check if the phone number is already registered
      const exists = await checkUserExists(phoneNumber)

      if (mode === 'login' && !exists) {
        toast({
          title: "Account Not Found",
          description: "This phone number isn't registered. Please create an account first.",
          variant: "destructive"
        })
        setMode('register')
        setIsSubmitting(false)
        return
      }

      if (mode === 'register' && exists) {
        toast({
          title: "Account Already Exists",
          description: "This phone number is already registered. Please login instead.",
        })
        setMode('login')
        setIsSubmitting(false)
        return
      }

      // 3. Handle Profile Creation for new users
      if (mode === 'register' && db) {
        const studentRef = doc(db, 'students', newUser.uid)
        await setDoc(studentRef, {
          id: newUser.uid,
          externalAuthId: newUser.uid,
          phoneNumber: phoneNumber,
          name: fullName,
          gradeLevel: grade,
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

      // After successful profile creation/verification, navigate
      router.push("/lesson")
    } catch (error: any) {
      console.error("Auth error:", error)
      toast({
        title: "Authentication Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isUserLoading) {
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
                <Label>Phone Number</Label>
                <div className="phone-input-container">
                   <PhoneInput
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    defaultCountry="US"
                    disabled={isSubmitting}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
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
      <style jsx global>{`
        .PhoneInputCountry {
          display: flex;
          align-items: center;
          margin-right: 0.5rem;
        }
        .PhoneInputCountrySelect {
          opacity: 0;
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .PhoneInputInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: inherit;
        }
      `}</style>
    </div>
  )
}
