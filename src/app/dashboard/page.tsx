
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Search, Globe, Loader2, Database, Info, ShieldAlert } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FunderDashboard() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [displayLimit, setDisplayLimit] = useState(20)

  // Strict routing check: Redirect to login if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  const publicProofsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'proofsOfLearning_public'),
      orderBy('mintingDate', 'desc'),
      limit(displayLimit)
    )
  }, [db, user, displayLimit])

  const { data: proofs, isLoading: isProofsLoading } = useCollection(publicProofsQuery)

  const filteredProofs = useMemo(() => {
    if (!proofs) return []
    if (!searchTerm.trim()) return proofs
    
    const term = searchTerm.toLowerCase()
    return proofs.filter(proof => 
      (proof.studentId || "").toLowerCase().includes(term) || 
      (proof.transactionHash || "").toLowerCase().includes(term) ||
      (proof.lessonTitle || "").toLowerCase().includes(term)
    )
  }, [proofs, searchTerm])

  // Gate the dashboard content while authorizing
  if (isUserLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 font-bold text-muted-foreground">Authorizing Access...</p>
      </div>
    )
  }

  // Final gate: If user is not present (e.g. during redirect), show restricted notice
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-black">Restricted Access</CardTitle>
            <CardDescription>You must be a registered partner or coordinator to view the impact ledger.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full rounded-full h-12 shadow-lg" onClick={() => router.push("/login")}>
              Sign In to Verify
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight font-headline">Public Impact Ledger</h1>
              <p className="text-muted-foreground text-lg">Real-time learning outcomes verified on Polygon Amoy Testnet.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-2 pr-4 border-r">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Network</p>
                  <p className="text-sm font-bold">Polygon Amoy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <Database className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Verified Proofs</p>
                  <p className="text-sm font-bold">{proofs?.length || 0} Records</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Alert className="mb-12 bg-primary/5 border-primary/20 rounded-2xl">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs text-primary/80 font-medium">
            <strong>Blockchain Transparency:</strong> This dashboard displays learning transactions currently recorded on the Polygon Amoy Testnet. In a production environment, these represent immutable proofs of educational impact.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px]">Verified Learning Hours</CardDescription>
              <CardTitle className="text-4xl font-black">{proofs ? (proofs.length * 0.5).toFixed(1) : 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs opacity-80">Auditable hours based on completion</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase text-[10px]">Active Students</CardDescription>
              <CardTitle className="text-4xl font-black">{new Set(proofs?.map(p => p.studentId)).size}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Unique learners with on-chain proofs</p>
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
              <p className="text-xs text-muted-foreground">Aggregated from verified responses</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">On-Chain Proofs</CardTitle>
              <CardDescription>Publicly verifiable transactions with explorer links.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by hash or student..." 
                  className="pl-9 w-64 bg-muted/50 border-none h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                    <TableHead className="font-bold">Lesson</TableHead>
                    <TableHead className="font-bold text-center">Score</TableHead>
                    <TableHead className="font-bold">Minted At</TableHead>
                    <TableHead className="font-bold">Tx Hash</TableHead>
                    <TableHead className="text-right font-bold">Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProofs.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-medium py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Database className="h-4 w-4 text-primary" />
                          </div>
                          <span className="truncate max-w-[100px]">Learner #{row.studentId.slice(0, 5)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">{row.lessonTitle || "Module Completion"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                          {row.grade || 0}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(row.mintingDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                          {row.transactionHash.slice(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" className="gap-1 h-8 text-[10px] font-bold border-primary text-primary hover:bg-primary hover:text-white" asChild>
                          <a href={`https://amoy.polygonscan.com/tx/${row.transactionHash}`} target="_blank" rel="noopener noreferrer">
                            AmoyScan <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProofs.length === 0 && !isProofsLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                        No learning transactions found on Amoy Testnet.
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
                onClick={() => setDisplayLimit(prev => prev + 20)}
                disabled={isProofsLoading}
              >
                {isProofsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load More Public Records
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
