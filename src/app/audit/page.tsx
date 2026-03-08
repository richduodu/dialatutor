"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Code, Globe, Lock } from "lucide-react"

export default function AuditPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-headline mb-4">Open-Source & Audit Transparency</h1>
          <p className="text-muted-foreground text-lg">Ensuring the integrity of every learning proof recorded on-chain.</p>
        </div>

        <div className="grid gap-8">
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <ShieldCheck className="h-8 w-8" />
              <h2 className="text-2xl font-bold font-headline">Verification Standards</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Voice2Learn Proof is built on the principle of "Verify, Don't Trust." Our smart contracts and AI evaluation logic are designed to be transparent and auditable by third-party organizations, government bodies, and impact funders.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-accent" />
                  Smart Contract Audit
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Our Proof of Learning (PoL) minting contracts on Polygon are undergoing continuous security audits to prevent manipulation and ensure the immutability of student records.
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-primary" />
                  AI Model Guardrails
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                We utilize Genkit and Google Gemini with strict safety filters and academic evaluation criteria. Our grading logic is open for review to ensure bias-free assessments.
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="bg-primary/20">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Public Ledger Access
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-slate-300">
                Funders can independently verify impact data by querying the Polygon Amoy Testnet directly. Each "Proof of Learning" contains:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
                <li>Authenticated Student ID (Hashed for Privacy)</li>
                <li>Lesson Completion Timestamp</li>
                <li>AI-Verified Comprehension Score</li>
                <li>Immutable Transaction Hash</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
