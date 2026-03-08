"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, Zap, Database, Smartphone } from "lucide-react"

export default function ApiDocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-headline mb-4">Partner API Documentation</h1>
          <p className="text-muted-foreground text-lg">Integrating Voice2Learn Proof into your educational ecosystem.</p>
        </div>

        <div className="grid gap-8">
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Zap className="h-8 w-8" />
              <h2 className="text-2xl font-bold font-headline">Seamless Integration</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Our API allows educational institutions, NGOs, and government agencies to automate student enrollment, trigger voice lessons via IVR systems, and retrieve blockchain-verified learning outcomes.
            </p>
          </section>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <Smartphone className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-sm font-bold">Voice Triggers</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Initiate automated voice calls or SMS lesson prompts to students in low-connectivity areas.
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <Database className="h-6 w-6 text-accent mb-2" />
                <CardTitle className="text-sm font-bold">Proof Retrieval</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Fetch immutable learning proofs directly via student ID or transaction hash for your own dashboards.
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-2">
                <Cpu className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-sm font-bold">Impact Analytics</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Aggregate comprehension data and completion rates across geographical and demographic segments.
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Example Endpoint</h2>
            <div className="p-6 rounded-2xl bg-slate-900 text-slate-300 font-mono text-sm overflow-x-auto">
              <p className="text-accent mb-2">// GET learning proof by hash</p>
              <p>GET /api/v1/proofs/0x89542...e921</p>
              <p className="mt-4 text-primary">{"{"}</p>
              <p className="pl-4">"studentId": "learner_5923",</p>
              <p className="pl-4">"lesson": "Basic Geometry",</p>
              <p className="pl-4">"score": 92,</p>
              <p className="pl-4">"mintedAt": "2026-10-14T12:00:00Z"</p>
              <p className="">{"}"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
