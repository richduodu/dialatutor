"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Smartphone, LogIn, UserPlus, Loader2, User, Lock, HelpCircle, ArrowLeft, ShieldAlert, AlertTriangle } from "lucide-react"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
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
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)

  useEffect(() => {
    if (!isUserLoading && user && !isSubmitting && !isGoogleSubmitting) {
      router.push("/lesson")
    }
  }, [user, isUserLoading, router, isSubmitting, isGoogleSubmitting])

  const getEmailFromPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\+/g, '')
    return `${cleanPhone}@dialatutor.com`
  }

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true)
    const provider = new GoogleAuthProvider()
    
    try {
      const result = await signInWithPopup(auth, provider)
      const loggedUser = result.user

      if (db) {
        const studentRef = doc(db, 'students', loggedUser.uid)
        const docSnap = await getDoc(studentRef)
        
        // If profile doesn't exist, create a basic one
        if (!docSnap.exists()) {
          await setDoc(studentRef, {
            id: loggedUser.uid,
            externalAuthId: loggedUser.uid,
            name: loggedUser.displayName || "Google User",
            createdAt: new Date().toISOString()
          }, { merge: true })
        }
      }

      toast({
        title: "Welcome!",
        description: `Logged in as ${loggedUser.displayName}`,
      })
      router.push("/lesson")
    } catch (error: any) {
      console.error("Google Auth Error:", error)
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Could not connect to Google.",
        variant: "destructive"
      })
    } finally {
      setIsGoogleSubmitting(false)
    }
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

    if (mode !== 'forgot' && pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Your security PIN must be exactly 6 digits.",
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
      console.error("Firebase Auth Error:", error.code, error.message)
      
      let title = "Access Denied"
      let message = "Please check your credentials and try again."
      
      if (error.message?.includes('signup-are-blocked') || error.code === 'auth/operation-not-allowed') {
        title = "Sign-up Blocked"
        message = "New registrations are currently restricted. Please ensure 'Enable create (sign-up)' is ON in your Firebase Console (Settings > User sign-up)."
      } else if (error.code === 'auth/user-not-found') {
        message = "No account found with this phone number. Please register first."
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Incorrect PIN. Please try again or contact a coordinator."
      } else if (error.code === 'auth/email-already-in-use') {
        message = "This phone number is already registered. Try logging in instead."
      } else if (error.code === 'auth/weak-password') {
        message = "Your PIN is too weak. Please use a unique 6-digit number."
      }

      toast({
        title,
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
              <div className="space-y-6">
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
                        disabled={isSubmitting || isGoogleSubmitting}
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
                        placeholder="6 Digit PIN" 
                        className="pl-10 h-11 rounded-xl"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        disabled={isSubmitting || isGoogleSubmitting}
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="grade">Your Grade Level</Label>
                      <Select value={grade} onValueChange={setGrade} required disabled={isSubmitting || isGoogleSubmitting}>
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

                  <Button type="submit" className="w-full gap-2 rounded-full h-12 shadow-lg mt-2" disabled={isSubmitting || isGoogleSubmitting}>
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-full gap-2 border-2 hover:bg-muted/50 transition-all" 
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || isGoogleSubmitting}
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {isGoogleSubmitting ? "Authenticating..." : "Sign in with Google"}
                </Button>
                
                {mode === 'register' && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <strong>Admin Note:</strong> If registration fails, ensure "Enable create (sign-up)" is ON in the Firebase Auth Settings console.
                    </p>
                  </div>
                )}
              </div>
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
                  disabled={isSubmitting || isGoogleSubmitting}
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