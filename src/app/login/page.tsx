
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, LogIn, UserPlus, Loader2, User, Lock, HelpCircle, ArrowLeft, ShieldAlert } from "lucide-react"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>("")
  const [pin, setPin] = useState("")
  const [fullName, setFullName] = useState("")
  const [grade, setGrade] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)

  useEffect(() => {
    if (!isUserLoading && user && !isSubmitting) {
      router.push("/lesson")
    }
  }, [user, isUserLoading, router, isSubmitting])

  const getEmailFromPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\+/g, '')
    return `${cleanPhone}@dialatutor.com`
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

    if (mode !== 'forgot' && pin.length < 4) {
      toast({
        title: "PIN Too Short",
        description: "Your security PIN must be at least 4 digits.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    const email = getEmailFromPhone(phoneNumber)
    
    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pin)
        const newUser = userCredential.user

        if (db) {
          const studentRef = doc(db, 'students', newUser.uid)
          await setDoc(studentRef, {
            id: newUser.uid,
            externalAuthId: newUser.uid,
            phoneNumber: phoneNumber,
            name: fullName,
            gradeLevel: grade,
            createdAt: new Date().toISOString()
          }, { merge: true })
        }
        
        toast({
          title: "Account Created!",
          description: `Welcome to Dial A Tutor, ${fullName}.`,
        })
        router.push("/lesson")
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, pin)
        toast({
          title: "Logged In",
          description: "Resuming your learning journey.",
        })
        router.push("/lesson")
      }
    } catch (error: any) {
      console.error("Auth error:", error)
      let message = "Please check your credentials and try again."
      
      if (error.code === 'auth/user-not-found') {
        message = "No account found with this phone number. Please register."
      } else if (error.code === 'auth/wrong-password') {
        message = "Incorrect PIN. Please try again."
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This phone number is already registered. Please login."
      }

      toast({
        title: "Access Denied",
        description: message,
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black font-headline">
                {mode === 'login' ? 'Student Access' : mode === 'register' ? 'Create Account' : 'Recover Access'}
              </CardTitle>
              {mode === 'forgot' && (
                <Button variant="ghost" size="icon" onClick={() => setMode('login')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </div>
            <CardDescription>
              {mode === 'login' 
                ? 'Enter your phone and PIN to continue your learning journey.' 
                : mode === 'register'
                ? 'Join Dial A Tutor and start earning blockchain-backed proofs.'
                : 'Lost your security PIN? Follow the steps below.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode !== 'forgot' ? (
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
                      defaultCountry="GH"
                      disabled={isSubmitting}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pin">Security PIN</Label>
                    {mode === 'login' && (
                      <button 
                        type="button" 
                        onClick={() => setMode('forgot')}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Forgot PIN?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="pin" 
                      type="password"
                      inputMode="numeric"
                      placeholder="4-6 digit PIN" 
                      className="pl-10 h-11 rounded-xl"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
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
            ) : (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center">
                  <ShieldAlert className="h-12 w-12 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2">Manual Verification Required</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To maintain the integrity of your **Proof of Learning** history, security PINs cannot be reset automatically via this interface.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                    <p className="text-sm">Locate your local **Dial A Tutor Coordinator** or community learning center.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                    <p className="text-sm">Provide your registered phone number for identity verification.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                    <p className="text-sm">Once verified, they will provide you with a temporary PIN to regain access.</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-full h-12" onClick={() => setMode('login')}>
                  Back to Login
                </Button>
              </div>
            )}
            
            {mode !== 'forgot' && (
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  {mode === 'login' ? "First time here?" : "Already have an account?"}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 rounded-full h-12" 
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setPin("")
                  }}
                  disabled={isSubmitting}
                >
                  {mode === 'login' ? (
                    <><UserPlus className="h-4 w-4" /> Create New Account</>
                  ) : (
                    <><LogIn className="h-4 w-4" /> Already Registered? Login</>
                  )}
                </Button>
              </div>
            )}
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
