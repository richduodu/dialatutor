"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Search, Filter, ShieldCheck, GraduationCap, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"

const MOCK_TRANSITIONS = [
  { id: 1, student: "User #48912", lesson: "Mathematics Unit 4", status: "Verified", date: "2 mins ago", hash: "0x7d...a1b2", score: 95 },
  { id: 2, student: "User #12093", lesson: "English Literacy Level 1", status: "Verified", date: "15 mins ago", hash: "0x3f...c4d5", score: 88 },
  { id: 3, student: "User #33910", lesson: "Civic Education Intro", status: "Verified", date: "1 hour ago", hash: "0x9a...e6f7", score: 100 },
  { id: 4, student: "User #88219", lesson: "Basic Health & Sanitation", status: "Verified", date: "3 hours ago", hash: "0x12...b3c4", score: 92 },
  { id: 5, student: "User #55401", lesson: "Mathematics Unit 3", status: "Verified", date: "5 hours ago", hash: "0xbc...d9e0", score: 78 },
]

export default function FunderDashboard() {
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
                  <p className="text-sm font-bold">12,482 Mints</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-primary text-primary-foreground border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-foreground/70 font-bold uppercase text-[10px]">Verified Learning Hours</CardDescription>
              <CardTitle className="text-4xl font-black">48,291</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs opacity-80">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase text-[10px]">Active Students</CardTitle>
              <CardTitle className="text-4xl font-black">4,912</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Spanning 12 remote districts</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase text-[10px]">Avg Comprehension</CardTitle>
              <CardTitle className="text-4xl font-black">89.4%</CardTitle>
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
                <Input placeholder="Search students or hashes..." className="pl-9 w-64 bg-muted/50 border-none h-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
                {MOCK_TRANSITIONS.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="font-medium flex items-center gap-2 py-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      {row.student}
                    </TableCell>
                    <TableCell>{row.lesson}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.score > 90 ? 'default' : 'secondary'} className={row.score > 90 ? 'bg-accent hover:bg-accent' : ''}>
                        {row.score}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.date}</TableCell>
                    <TableCell>
                      <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{row.hash}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1 h-8 text-primary font-bold">
                        View <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-4 border-t bg-muted/20 text-center">
            <Button variant="link" className="text-sm font-bold">Load More Impact Records</Button>
          </div>
        </Card>
      </main>
    </div>
  )
}