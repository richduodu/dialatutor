
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Search, Filter, ShieldCheck, GraduationCap, Globe, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function FunderDashboard() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [displayLimit, setDisplayLimit] = useState(20)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const publicProofsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(
      collection(db, 'proofsOfLearning_public'),
      orderBy('mintingDate', 'desc'),
      limit(displayLimit)
    )
  }, [db, displayLimit])

  const { data: proofs, isLoading: isProofsLoading } = useCollection(publicProofsQuery)

  // Client-side filtering for search functionality
  const filteredProofs = useMemo(() => {
    if (!proofs) return []
    if (!searchTerm.trim()) return proofs
    
    const term = searchTerm.toLowerCase()
    return proofs.filter(proof => 
      proof.studentId.toLowerCase().includes(term) || 
      proof.transactionHash.toLowerCase().includes(term) ||
      (proof.lessonTitle || "").toLowerCase().includes(term)
    )
  }, [proofs, searchTerm])

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 20)
  }

  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Authorizing access...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight font-headline">Impact Verifier</h1>
              <p className="text-muted-foreground text-lg">Real-time educational achievements on the Polygon network.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-2 pr-4 border-r">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Network</p>
                  <p className="text-sm font-bold">Polygon PoS</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Proofs</p>
                  <p className="text-sm font-bold">{proofs?.length || 0} Mints</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px]">Verified Learning Hours</CardDescription>
              <CardTitle className="text-4xl font-black">{proofs ? (proofs.length * 0.5).toFixed(1) : 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs opacity-80">Calculated from verified attempts</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase text-[10px]">Active Students</CardDescription>
              <CardTitle className="text-4xl font-black">{new Set(proofs?.map(p => p.studentId)).size}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Distinct learners identified</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase text-[10px]">Avg Comprehension</CardDescription>
              <CardTitle className="text-4xl font-black">
                {proofs && proofs.length > 0 
                  ? (proofs.reduce((acc, p) => acc + (p.grade || 0), 0) / proofs.length).toFixed(1) 
                  : "0"}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">AI-evaluated spoken answers</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Recent Learning Transactions</CardTitle>
              <CardDescription>Auditable immutable records of student progress.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students or hashes..." 
                  className="pl-9 w-64 bg-muted/50 border-none h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isProofsLoading && !proofs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold">Student</TableHead>
                    <TableHead className="font-bold">Lesson Module</TableHead>
                    <TableHead className="font-bold text-center">Score</TableHead>
                    <TableHead className="font-bold">Time Verified</TableHead>
                    <TableHead className="font-bold">Transaction Hash</TableHead>
                    <TableHead className="text-right font-bold">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProofs.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2 py-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        Learner #{row.studentId.slice(0, 5)}
                      </TableCell>
                      <TableCell>{row.lessonTitle || "Mathematics Module"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={(row.grade || 0) > 90 ? 'default' : 'secondary'} className={(row.grade || 0) > 90 ? 'bg-accent hover:bg-accent' : ''}>
                          {row.grade || 0}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(row.mintingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                          {row.transactionHash.slice(0, 6)}...{row.transactionHash.slice(-4)}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 h-8 text-primary font-bold" asChild>
                          <a href={row.blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProofs.length === 0 && !isProofsLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                        {searchTerm ? "No records match your search." : "No learning transactions recorded yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {proofs && proofs.length >= displayLimit && (
            <div className="p-4 border-t bg-muted/20 text-center">
              <Button 
                variant="link" 
                className="text-sm font-bold"
                onClick={handleLoadMore}
                disabled={isProofsLoading}
              >
                {isProofsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load More Impact Records
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
