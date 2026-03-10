
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Loader2, BookOpen, Sparkles, RefreshCw, Database, WifiOff, Info, ShieldCheck, AlertCircle, Award, ChevronRight, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { generateLesson } from "@/ai/flows/generate-lesson-flow"
import { notifyStudent } from "@/ai/flows/notify-student-flow"
import { mintProof } from "@/ai/flows/mint-proof-flow"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

const LESSONS_REQUIRED_FOR_MINT = 3

export default function LessonPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  // 0: Selection, 1: Lesson, 2: Minting, 3: Success, 4: Interim Progress
  const [step, setStep] = useState(0) 
  const [subject, setSubject] = useState<string>("")
  const [gradeLevel, setGradeLevel] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'minting' | 'completed'>('idle')
  const [txHash, setTxHash] = useState<string>("")
  const [mintMode, setMintMode] = useState<'live' | 'simulated' | null>(null)
  const [lesson, setLesson] = useState<{ id: string, title: string, content: string, expectedAnswer: string } | null>(null)
  
  // Session tracking
  const [sessionLessons, setSessionLessons] = useState<{id: string, title: string, score: number}[]>([])

  const studentRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'students', user.uid)
  }, [db, user])

  const { data: studentProfile } = useDoc(studentRef)

  const subjects = [
    "Mathematics",
    "Science",
    "History",
    "Geography",
    "Language Arts",
    "General Knowledge"
  ]

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)

  useEffect(() => {
    if (studentProfile?.gradeLevel && !gradeLevel) {
      setGradeLevel(studentProfile.gradeLevel)
    }
  }, [studentProfile, gradeLevel])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const handleStartLesson = async () => {
    if (!subject || !gradeLevel) {
      toast({
        title: "Selection Required",
        description: "Please pick a subject and your grade level to continue.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      if (user && db && !studentProfile) {
        const profileRef = doc(db, 'students', user.uid)
        setDocumentNonBlocking(profileRef, {
          id: user.uid,
          externalAuthId: user.uid,
          phoneNumber: user.phoneNumber || "Google Authenticated",
          name: user.displayName || `Learner ${user.uid.slice(0, 5)}`,
          gradeLevel: gradeLevel,
          createdAt: new Date().toISOString()
        }, { merge: true })
      }

      const generatedLesson = await generateLesson({ subject, gradeLevel })
      setLesson({
        id: crypto.randomUUID(),
        title: generatedLesson.title,
        content: generatedLesson.content,
        expectedAnswer: generatedLesson.expectedAnswer
      })
      setStep(1)
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      toast({
        title: isQuotaError ? "Curriculum Designer Busy" : "Generation Failed",
        description: isQuotaError 
          ? "Our AI tutors are currently at capacity. Please try again in a minute." 
          : "We couldn't prepare your lesson. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEvaluationComplete = async (evaluation: any) => {
    if (!user || !lesson || !db) return

    const studentId = user.uid
    const attemptId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    // Save individual Lesson Attempt for history
    const attemptRef = doc(db, 'students', studentId, 'lessonAttempts', attemptId)
    setDocumentNonBlocking(attemptRef, {
      id: attemptId,
      studentId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      subject: subject,
      startTime: now,
      endTime: now,
      transcribedText: evaluation.transcription,
      aiEvaluationResult: evaluation.evaluation,
      grade: evaluation.score,
      isCompleted: evaluation.isCorrect,
    }, { merge: true })

    if (evaluation.isCorrect) {
      // Celebrate single lesson completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Check if this lesson is unique in this session
      const isUnique = !sessionLessons.find(l => l.title === lesson.title)
      const newSessionLessons = isUnique 
        ? [...sessionLessons, { id: lesson.id, title: lesson.title, score: evaluation.score }]
        : sessionLessons

      setSessionLessons(newSessionLessons)

      if (newSessionLessons.length < LESSONS_REQUIRED_FOR_MINT) {
        // Show progress UI
        setStep(4)
      } else {
        // Goal reached! Proceed to minting
        handleFinalMinting(newSessionLessons)
      }
    }
  }

  const handleFinalMinting = async (finalLessons: {id: string, title: string, score: number}[]) => {
    if (!user || !db) return
    
    setStep(2)
    setMintingStatus('minting')
    const now = new Date().toISOString()
    const avgScore = Math.round(finalLessons.reduce((acc, l) => acc + l.score, 0) / finalLessons.length)

    try {
      const mintResult = await mintProof({
        studentId: user.uid,
        lessonTitle: `${finalLessons.length} Lesson Mastery Bundle`,
        grade: avgScore
      })

      const proofId = crypto.randomUUID()
      const proofData = {
        id: proofId,
        studentId: user.uid,
        lessonTitle: "3-Lesson Mastery Achievement",
        grade: avgScore,
        blockchainNetwork: mintResult.network,
        contractAddress: mintResult.contractAddress,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        mintingDate: now,
        blockExplorerUrl: `https://amoy.polygonscan.com/tx/${mintResult.transactionHash}`,
        mode: mintResult.mode,
        aggregatedLessons: finalLessons
      }
      
      setDocumentNonBlocking(doc(db, 'students', user.uid, 'proofsOfLearning', proofId), proofData, { merge: true })
      setDocumentNonBlocking(doc(db, 'proofsOfLearning_public', proofId), proofData, { merge: true })

      // Create Report
      const reportId = crypto.randomUUID()
      setDocumentNonBlocking(doc(db, 'students', user.uid, 'studentReports', reportId), {
        id: reportId,
        studentId: user.uid,
        generatedDate: now,
        reportContent: `Student mastered 3 unique lessons with an average score of ${avgScore}%. Completed modules: ${finalLessons.map(l => l.title).join(', ')}.`,
        lessonAttemptIds: finalLessons.map(l => l.id),
        overallGrade: avgScore,
        sentViaSms: !!studentProfile?.phoneNumber,
        sentDate: now
      }, { merge: true })

      if (studentProfile?.phoneNumber) {
        notifyStudent({
          phoneNumber: studentProfile.phoneNumber,
          lessonTitle: "3-Lesson Mastery",
          score: avgScore
        }).catch(err => console.error("[BACKEND] Notification Flow failed:", err));
      }

      setTxHash(mintResult.transactionHash)
      setMintMode(mintResult.mode)
      setMintingStatus('completed')
      setStep(3)

      // Grand finale celebration
      const end = Date.now() + 3 * 1000;
      const colors = ["#3b82f6", "#06b6d4", "#ffffff"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

    } catch (err) {
      console.error("[BLOCKCHAIN] Minting Flow failed:", err)
      toast({
        title: "Blockchain Link Failed",
        description: "We couldn't record your achievement on-chain. Progress saved locally.",
        variant: "destructive"
      })
      setStep(0)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Identifying learner...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Dial A Tutor</h1>
            <p className="text-muted-foreground">Personalized AI Oral Instruction</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-white px-3 py-1 font-mono uppercase">
              Learner: {studentProfile?.name || user?.displayName || user?.uid.slice(0, 5)}
            </Badge>
          </div>
        </div>

        {/* Global Session Progress Tracker */}
        {sessionLessons.length > 0 && step !== 3 && (
          <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> Session Goal: Proof of Learning
              </p>
              <span className="text-xs font-bold text-primary">{sessionLessons.length}/{LESSONS_REQUIRED_FOR_MINT} Lessons</span>
            </div>
            <Progress value={(sessionLessons.length / LESSONS_REQUIRED_FOR_MINT) * 100} className="h-1.5" />
          </div>
        )}

        {step === 0 && (
          <Card className="border-none shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold font-headline">What will you learn today?</CardTitle>
              <CardDescription>Select your subject and educational level.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Subject</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Pick a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Grade Level</label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger className="h-12 rounded-xl border-2">
                      <SelectValue placeholder="Select your grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full h-14 rounded-full text-lg font-bold gap-2 shadow-xl bg-primary hover:bg-primary/90 transition-all active:scale-95" 
                onClick={handleStartLesson}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Preparing Lesson...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" /> Start Learning
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && lesson && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="text-muted-foreground hover:text-primary">
                ← Change Selection
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleStartLesson} 
                disabled={isGenerating}
                className="text-muted-foreground hover:text-primary gap-2"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                New Question
              </Button>
            </div>
            <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BookOpen className="h-24 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                      {subject}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">
                      {gradeLevel}
                    </Badge>
                  </div>
                  <span className="text-2xl mt-2 font-headline">{lesson.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-medium leading-relaxed italic border-l-4 border-white/20 pl-4 py-2">
                  "{lesson.content}"
                </p>
              </CardContent>
            </Card>

            <VoiceRecorder 
              key={lesson.id}
              lessonContent={lesson.content} 
              expectedAnswer={lesson.expectedAnswer} 
              onComplete={handleEvaluationComplete}
              isDemoMode={isOfflineMode}
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center">
             <div className="mx-auto w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-accent" />
             </div>
             <div className="space-y-2">
                <h2 className="text-3xl font-black font-headline">Lesson Complete!</h2>
                <p className="text-muted-foreground">You are {LESSONS_REQUIRED_FOR_MINT - sessionLessons.length} unique lessons away from your next Proof of Learning.</p>
             </div>

             <div className="grid gap-4 max-w-sm mx-auto">
                {sessionLessons.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border shadow-sm">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold truncate">{l.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Accuracy: {l.score}%</p>
                    </div>
                  </div>
                ))}
                {Array.from({length: LESSONS_REQUIRED_FOR_MINT - sessionLessons.length}).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/20">
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20" />
                    <p className="text-sm font-bold text-muted-foreground italic">Upcoming Module</p>
                  </div>
                ))}
             </div>

             <div className="flex flex-col gap-3">
                <Button className="w-full h-14 rounded-full text-lg font-bold gap-2 shadow-xl" onClick={handleStartLesson} disabled={isGenerating}>
                   {isGenerating ? (
                     <>
                       <Loader2 className="h-5 w-5 animate-spin" /> Preparing Next Lesson...
                     </>
                   ) : (
                     <>
                       Continue to Next Lesson <ChevronRight className="h-5 w-5" />
                     </>
                   )}
                </Button>
                <Button variant="ghost" className="text-xs text-muted-foreground font-bold" onClick={() => {
                  setStep(0)
                  setLesson(null)
                }}>
                  Change Subject / Level
                </Button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-8 py-20 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div className="relative h-24 w-24 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-xl">
                <ShieldCheck className="h-12 w-12 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Securing Mastery Proof</h2>
              <p className="text-muted-foreground">Recording your 3-lesson achievement on Polygon Amoy.</p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
              <p className="text-[10px] uppercase font-bold mt-2 text-muted-foreground">
                Broadcasting Master Record...
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <Card className="border-none shadow-2xl bg-white overflow-hidden">
              <div className="h-2 bg-accent w-full" />
              <CardContent className="pt-10 pb-8 px-8 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle className="h-10 w-10 text-accent" />
                </div>
                <h2 className="text-3xl font-extrabold mb-2 font-headline">Mastery Achieved!</h2>
                <p className="text-muted-foreground mb-8">
                  You've successfully completed {LESSONS_REQUIRED_FOR_MINT} modules. Your consolidated Proof of Learning is now secure.
                </p>

                <div className="space-y-4 text-left">
                  <div className="p-5 rounded-2xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Aggregated Proof</p>
                      </div>
                      <Badge variant="secondary" className="text-[8px] h-4 border-none bg-primary/10 text-primary uppercase">
                        {mintMode === 'simulated' ? 'SIMULATED' : 'AMOY TESTNET'}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Lessons Completed</span>
                        <span className="font-bold text-sm">{LESSONS_REQUIRED_FOR_MINT}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Tx Hash</span>
                        <span className="font-mono text-[10px] truncate max-w-[120px]">{txHash}</span>
                      </div>
                      <Button 
                        className="w-full mt-2 gap-2 rounded-xl h-10 text-xs font-bold" 
                        variant="outline" 
                        disabled={mintMode === 'simulated'}
                        asChild
                      >
                        <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                          Verify on AmoyScan <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                  <Button className="w-full rounded-full h-12 text-lg shadow-lg" asChild>
                    <a href="/my-progress">View My Progress</a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full h-12" onClick={() => {
                    setStep(0)
                    setLesson(null)
                    setSessionLessons([])
                    setTxHash("")
                  }}>
                    Start New Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
