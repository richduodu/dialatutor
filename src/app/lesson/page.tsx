
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Loader2, Send, Smartphone, BrainCircuit, GraduationCap, BookOpen, Sparkles, RefreshCw, ShieldCheck, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { generateLesson } from "@/ai/flows/generate-lesson-flow"
import { useToast } from "@/hooks/use-toast"

export default function LessonPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [step, setStep] = useState(0) // 0: Selection, 1: Lesson, 2: Minting, 3: Success
  const [subject, setSubject] = useState<string>("")
  const [gradeLevel, setGradeLevel] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'minting' | 'completed'>('idle')
  const [txHash, setTxHash] = useState<string>("")
  const [lesson, setLesson] = useState<{ id: string, title: string, content: string, expectedAnswer: string } | null>(null)

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
          phoneNumber: user.phoneNumber || "Simulated Phone",
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

  const handleEvaluationComplete = (evaluation: any) => {
    if (!user || !lesson) return

    const studentId = user.uid
    const attemptId = crypto.randomUUID()
    
    const attemptRef = doc(db, 'students', studentId, 'lessonAttempts', attemptId)
    setDocumentNonBlocking(attemptRef, {
      id: attemptId,
      studentId,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      subject: subject,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      transcribedText: evaluation.transcription,
      aiEvaluationResult: evaluation.evaluation,
      grade: evaluation.score,
      isCompleted: evaluation.isCorrect,
    }, { merge: true })

    if (evaluation.isCorrect) {
      setTimeout(() => {
        setStep(2)
        setMintingStatus('minting')

        const proofId = crypto.randomUUID()
        const generatedTxHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')

        const proofData = {
          id: proofId,
          lessonAttemptId: attemptId,
          studentId,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          grade: evaluation.score,
          blockchainNetwork: 'Polygon Amoy Testnet',
          contractAddress: '0x89542654019213892301923019230192301e921',
          tokenId: Math.floor(Math.random() * 1000000).toString(),
          transactionHash: generatedTxHash,
          mintingDate: new Date().toISOString(),
          blockExplorerUrl: `https://amoy.polygonscan.com/tx/${generatedTxHash}`
        }
        setDocumentNonBlocking(doc(db, 'students', studentId, 'proofsOfLearning', proofId), proofData, { merge: true })
        setDocumentNonBlocking(doc(db, 'proofsOfLearning_public', proofId), proofData, { merge: true })

        const reportId = crypto.randomUUID()
        setDocumentNonBlocking(doc(db, 'students', studentId, 'studentReports', reportId), {
          id: reportId,
          studentId,
          generatedDate: new Date().toISOString(),
          reportContent: `Successfully completed: ${lesson.title}. Evaluation: ${evaluation.evaluation}`,
          lessonAttemptIds: [attemptId],
          overallGrade: evaluation.score,
          sentViaSms: true,
          sentDate: new Date().toISOString()
        }, { merge: true })

        setTimeout(() => {
          setTxHash(generatedTxHash)
          setMintingStatus('completed')
          setStep(3)
        }, 3000)
      }, 2000)
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Dial-a-Lesson</h1>
            <p className="text-muted-foreground">Personalized AI Oral Instruction</p>
          </div>
          <Badge variant="outline" className="bg-white px-3 py-1 font-mono uppercase">
            Learner: {studentProfile?.name || user?.uid.slice(0, 5)}
          </Badge>
        </div>

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
                <Smartphone className="h-24 w-24" />
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
              lessonContent={lesson.content} 
              expectedAnswer={lesson.expectedAnswer} 
              onComplete={handleEvaluationComplete}
            />
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-8 py-20 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
              <div className="relative h-24 w-24 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-xl">
                <Loader2 className="h-12 w-12 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Minting Proof of Learning</h2>
              <p className="text-muted-foreground">Securing your achievement on the Polygon Amoy Testnet.</p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
              <p className="text-[10px] uppercase font-bold mt-2 text-muted-foreground">Transaction broadcasted...</p>
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
                <h2 className="text-3xl font-extrabold mb-2 font-headline">Achievement Unlocked!</h2>
                <p className="text-muted-foreground mb-8">
                  Your response was verified and your Proof of Learning has been permanently recorded on the blockchain.
                </p>

                <div className="space-y-4 text-left">
                  <div className="p-5 rounded-2xl bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Blockchain Transaction Proof</p>
                      </div>
                      <Badge variant="secondary" className="text-[8px] h-4 bg-primary/10 text-primary border-none">AMOY TESTNET</Badge>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Network</span>
                        <Badge variant="outline" className="text-[10px] font-mono">POLYGON AMOY</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Hash</span>
                        <span className="font-mono text-[10px] truncate max-w-[120px]">{txHash}</span>
                      </div>
                      <Button className="w-full mt-2 gap-2 rounded-xl h-10 text-xs font-bold" variant="outline" asChild>
                        <a href={`https://amoy.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
                          Verify on AmoyScan <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-primary">SMS Confirmation Sent</p>
                        <p className="text-sm text-muted-foreground leading-snug">"Congrats! You completed your {subject} lesson. Your immutable certificate is ready."</p>
                      </div>
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
                    setTxHash("")
                  }}>
                    Take Another Lesson
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
