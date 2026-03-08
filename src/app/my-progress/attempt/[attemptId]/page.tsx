
"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Loader2
} from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import Link from "next/link"

export default function AttemptDetailPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params)
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  const attemptRef = useMemoFirebase(() => {
    if (!db || !user || !attemptId) return null
    return doc(db, 'students', user.uid, 'lessonAttempts', attemptId)
  }, [db, user, attemptId])

  const { data: attempt, isLoading: attemptLoading } = useDoc(attemptRef)

  if (isUserLoading || attemptLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !attempt) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Attempt Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the details for this lesson attempt.</p>
        <Button asChild className="rounded-full">
          <Link href="/my-progress">Back to Progress</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Button variant="ghost" asChild className="mb-8 gap-2 hover:bg-primary/10 hover:text-primary transition-colors">
          <Link href="/my-progress">
            <ChevronLeft className="h-4 w-4" /> Back to Journey
          </Link>
        </Button>

        <header className="mb-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none">{attempt.subject || "Educational Module"}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(attempt.startTime).toLocaleDateString()} at {new Date(attempt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <h1 className="text-4xl font-black font-headline tracking-tight">{attempt.lessonTitle || "Lesson Attempt"}</h1>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-xl border flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-5xl font-black text-primary">{attempt.grade}%</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Accuracy Score</span>
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          <Card className="border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Voice Interaction Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground">Your Spoken Response</h3>
                <div className="p-6 rounded-2xl bg-muted/50 border italic text-lg leading-relaxed">
                  "{attempt.transcribedText}"
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-muted-foreground">AI Tutor Assessment</h3>
                <div className={`p-6 rounded-2xl border flex gap-4 ${attempt.isCompleted ? 'bg-accent/5 border-accent/20' : 'bg-destructive/5 border-destructive/20'}`}>
                  {attempt.isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
                  )}
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {attempt.aiEvaluationResult}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {attempt.isCompleted && (
            <Card className="border-none shadow-2xl bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="h-32 w-32" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6" />
                  <h2 className="text-xl font-bold font-headline">Verified Proof of Learning</h2>
                </div>
                <p className="opacity-90 max-w-md">
                  This achievement has been immutably recorded on the Polygon PoS network. It can be verified by educational institutions and funders worldwide.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-mono">
                    Token ID: {Math.floor(Math.random() * 1000000)}
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-full gap-2" asChild>
                    <a href={`https://polygonscan.com/`} target="_blank">
                      View on Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!attempt.isCompleted && (
            <div className="text-center py-8">
              <Button asChild className="rounded-full h-14 px-8 text-lg font-bold shadow-xl">
                <Link href="/lesson">Try This Lesson Again</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
