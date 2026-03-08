"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gavel, AlertCircle, Scale, CheckCircle2 } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black font-headline mb-4">Terms of Service</h1>
          <p className="text-muted-foreground italic text-sm">Effective Date: October 2026</p>
        </div>

        <div className="grid gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              < Scale className="h-6 w-6" />
              <h2 className="text-2xl font-bold font-headline">Acceptance of Terms</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Dial A Tutor, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services. Our platform provides AI-driven oral education and blockchain-verified credentials.
            </p>
          </section>

          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                < CheckCircle2 className="h-5 w-5 text-accent" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>You must provide accurate information when registering your phone number and grade level.</li>
                <li>You are responsible for the content of your oral responses and must not use offensive or inappropriate language.</li>
                <li>You acknowledge that AI evaluations are automated and intended for educational guidance.</li>
                <li>You understand that blockchain transactions are irreversible once minted.</li>
              </ul>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              < Gavel className="h-6 w-6" />
              <h2 className="text-2xl font-bold font-headline">Intellectual Property</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The AI models, curriculum design, and software infrastructure are the property of Metaschool AI. Students retain ownership of their individual learning records, while Dial A Tutor is granted a license to process this data for educational and verification purposes.
            </p>
          </section>

          <Card className="border-none shadow-xl bg-destructive/5 border-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                < AlertCircle className="h-5 w-5" />
                Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our services are provided "as is." We do not guarantee that the platform will be error-free or that blockchain transactions will always be processed immediately. We reserve the right to modify or discontinue services at any time for maintenance or updates.
              </p>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-headline">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Dial A Tutor or Metaschool AI be liable for any indirect, incidental, or consequential damages arising out of your use of the platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
