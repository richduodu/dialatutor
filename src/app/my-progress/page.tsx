"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Smartphone, BookOpen, Clock, Send, Loader2, Award } from "lucide-react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MyProgressPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const attemptsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'students', user.uid, 'lessonAttempts'),
      orderBy('startTime', 'desc')
    )
  }, [db, user])

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'students', user.uid, 'studentReports'),
      orderBy('generatedDate', 'desc')
    )
  }, [db, user])

  const { data: attempts, isLoading: attemptsLoading } = useCollection(attemptsQuery)
  const { data: reports, isLoading: reportsLoading } = useCollection(reportsQuery)

  if (isUserLoading || attemptsLoading || reportsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Loading your achievements...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight font-headline">My Learning Journey</h1>
              <p className="text-muted-foreground text-lg">Your immutable educational history.</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
              <Award className="h-5 w-5 text-accent" />
              <span className="font-bold">{attempts?.length || 0} Lessons Mastered</span>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reports && reports.length > 0 ? (
            reports.slice(0, 3).map((report) => (
              <Card key={report.id} className="border-none shadow-xl bg-card overflow-hidden">
                <div className="h-1.5 bg-accent w-full" />
                <CardHeader className="pb-2">
                  <CardDescription className="font-bold uppercase text-[10px] flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(report.generatedDate).toLocaleDateString()}
                  </CardDescription>
                  <CardTitle className="text-lg font-bold">Report #{report.id.slice(0, 4)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm line-clamp-2 text-muted-foreground">{report.reportContent}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      Score: {report.overallGrade}%
                    </Badge>
                    {report.sentViaSms && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase">
                        <Smartphone className="h-3 w-3" /> SMS Sent
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="md:col-span-3 text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-bold">No reports yet</p>
              <p className="text-muted-foreground mb-6">Complete your first lesson to see your evaluation.</p>
              <Button asChild rounded-full>
                <a href="/lesson">Start Lesson #1</a>
              </Button>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6 font-headline">Recent Attempts</h2>
        <div className="space-y-4">
          {attempts?.map((attempt) => (
            <Card key={attempt.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Multiplication Mastery</h3>
                      <p className="text-sm text-muted-foreground italic">"{attempt.transcribedText}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{attempt.grade}%</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Accuracy</p>
                    </div>
                    {attempt.isCompleted ? (
                      <Badge className="bg-accent hover:bg-accent h-8 px-4 rounded-full">Completed</Badge>
                    ) : (
                      <Badge variant="destructive" className="h-8 px-4 rounded-full">Retake Required</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
