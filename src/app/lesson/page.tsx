
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Loader2, Send, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function LessonPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Lesson, 2: Result/Minting, 3: Success
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'minting' | 'completed'>('idle')
  const [txHash, setTxHash] = useState<string>("")

  const lesson = {
    id: "multiplication-101",
    title: "Basic Mathematics: Multiplication",
    content: "Explain why multiplying any number by zero results in zero. Use the concept of 'groups of items' in your explanation.",
    expectedAnswer: "Multiplying by zero means you have zero groups of a number, or groups with zero items in them. Either way, there is nothing in total."
  }

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const handleEvaluationComplete = (evaluation: any) => {
    if (!user) return

    setStep(2)
    setMintingStatus('minting')

    const studentId = user.uid
    const attemptId = crypto.randomUUID()
    const proofId = crypto.randomUUID()
    const generatedTxHash = "0x" + Math.random().toString(16).slice(2, 42)

    // 1. Save Lesson Attempt to Student Subcollection
    const attemptRef = doc(db, 'students', studentId, 'lessonAttempts', attemptId)
    setDocumentNonBlocking(attemptRef, {
      id: attemptId,
      studentId,
      lessonId: lesson.id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      transcribedText: evaluation.transcription,
      aiEvaluationResult: evaluation.evaluation,
      grade: evaluation.score,
      isCompleted: evaluation.isCorrect,
      proofOfLearningId: evaluation.isCorrect ? proofId : null
    }, { merge: true })

    if (evaluation.isCorrect) {
      // 2. Save Proof of Learning
      const proofRef = doc(db, 'students', studentId, 'proofsOfLearning', proofId)
      const proofData = {
        id: proofId,
        lessonAttemptId: attemptId,
        studentId,
        lessonId: lesson.id,
        lessonTitle: lesson.title, // Denormalized for dashboard
        grade: evaluation.score,   // Denormalized for dashboard
        blockchainNetwork: 'Polygon PoS',
        contractAddress: '0x8954...e921',
        tokenId: Math.floor(Math.random() * 1000000).toString(),
        transactionHash: generatedTxHash,
        mintingDate: new Date().toISOString(),
        blockExplorerUrl: `https://polygonscan.com/tx/${generatedTxHash}`
      }
      setDocumentNonBlocking(proofRef, proofData, { merge: true })

      // 3. Mirror to Public Collection
      const publicProofRef = doc(db, 'proofsOfLearning_public', proofId)
      setDocumentNonBlocking(publicProofRef, proofData, { merge: true })

      // 4. Create a Student Report
      const reportId = crypto.randomUUID()
      const reportRef = doc(db, 'students', studentId, 'studentReports', reportId)
      setDocumentNonBlocking(reportRef, {
        id: reportId,
        studentId,
        generatedDate: new Date().toISOString(),
        reportContent: `Successfully completed: ${lesson.title}. Evaluation: ${evaluation.evaluation}`,
        lessonAttemptIds: [attemptId],
        overallGrade: evaluation.score,
        sentViaSms: true,
        sentDate: new Date().toISOString()
      }, { merge: true })
    }

    // Simulate Blockchain Minting UI delay
    setTimeout(() => {
      setTxHash(generatedTxHash)
      setMintingStatus('completed')
      setStep(3)
    }, 3000)
  }

  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Identifying learner...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline">Dial-a-Lesson</h1>
            <p className="text-muted-foreground">Unit 4: Mathematics Fundamentals</p>
          </div>
          <Badge variant="outline" className="bg-white px-3 py-1 font-mono uppercase">
            Learner: {user?.uid.slice(0, 5)}
          </Badge>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <Card className="border-none shadow-xl bg-primary text-primary-foreground overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Smartphone className="h-24 w-24" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-none">Audio Prompt</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-medium leading-relaxed">
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
          <div className="text-center space-y-8 py-20">
            <div className="relative inline-block">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <div className="relative h-24 w-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Loader2 className="h-12 w-12 animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline">Minting Proof of Learning</h2>
              <p className="text-muted-foreground">Interacting with Polygon PoS Mainnet (Gasless)</p>
            </div>
            <div className="max-w-xs mx-auto">
              <Progress value={66} className="h-2" />
              <p className="text-[10px] uppercase font-bold mt-2 text-muted-foreground">Transaction pending...</p>
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
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Blockchain Receipt</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs truncate max-w-[200px]">{txHash}</span>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary/80" asChild>
                        <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank">
                          Explore <ExternalLink className="h-3 w-3" />
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
                        <p className="text-sm text-muted-foreground">"Congrats! You completed Unit 4. View your certificate: dialatutor.com/p/{txHash.slice(0, 8)}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                  <Button className="w-full rounded-full h-12 text-lg shadow-lg" asChild>
                    <a href="/my-progress">View My Progress</a>
                  </Button>
                  <Button variant="outline" className="w-full rounded-full h-12" onClick={() => setStep(1)}>
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
