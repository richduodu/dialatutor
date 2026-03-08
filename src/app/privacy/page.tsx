"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-headline mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground italic text-sm">Last Updated: October 2026</p>
        </div>

        <div className="grid gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              < Shield className="h-6 w-6" />
              <h2 className="text-2xl font-bold font-headline">Introduction</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At Voice2Learn Proof, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information as you interact with our voice-first educational platform and blockchain-backed verification services.
            </p>
          </section>

          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                < Eye className="h-5 w-5 text-accent" />
                Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We collect information necessary to provide our educational services, including:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li><strong>Voice Data:</strong> Audio recordings of your oral responses for AI evaluation and transcription.</li>
                <li><strong>Contact Information:</strong> Phone numbers used for account access and SMS progress reports.</li>
                <li><strong>Educational Data:</strong> Lesson attempts, scores, and grade levels to track your learning journey.</li>
                <li><strong>On-Chain References:</strong> Public transaction hashes associated with your Proof of Learning tokens.</li>
              </ul>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              < Lock className="h-6 w-6" />
              <h2 className="text-2xl font-bold font-headline">How We Use Your Data</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your data is primarily used to provide immediate feedback on your lessons. Transcriptions and scores are analyzed by our AI tutors to generate personalized progress reports. Publicly, only hashed transaction data is stored on the Polygon blockchain to maintain privacy while ensuring immutability.
            </p>
          </section>

          <Card className="border-none shadow-xl bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                < FileText className="h-5 w-5 text-primary" />
                Blockchain Transparency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By using our platform, you acknowledge that "Proof of Learning" records are stored on a public blockchain ledger (Polygon Amoy Testnet). While these records are hashed to protect identity, they are immutable and publicly verifiable by design to ensure the integrity of educational credentials.
              </p>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact our support team at privacy@metaschool.ai.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
