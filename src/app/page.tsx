
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Phone, ShieldCheck, Cpu } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container px-4 mx-auto relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
              Learning is Personal. <br />
              <span className="text-primary font-headline">Verification is Immutable.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Complete oral lessons via voice interaction. Receive a gasless, tamper-proof Proof of Learning token on the Polygon Amoy Testnet. No smartphone needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full px-8 gap-2 bg-primary hover:bg-primary/90" asChild>
                <Link href="/lesson">
                  Take a Lesson <Phone className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 gap-2 border-primary text-primary hover:bg-primary/5" asChild>
                <Link href="/dashboard">
                  Verify Impacts <ShieldCheck className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-xl bg-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">Voice First (IVR)</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Students interact with DialATutor using simple voice commands. Perfect for regions with low data connectivity or basic feature phones.
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                    <Cpu className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="font-headline">AI Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Speech-to-Text transcribes student answers in real-time. GPT-4o evaluates comprehension against lesson criteria instantly.
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-card">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">Blockchain Proofs</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Successful completion triggers an automatic gasless record on the Polygon Amoy Testnet, verifiable by funders globally.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Funder Section */}
        <section className="py-20">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 font-headline">Trusted Verification for Funders</h2>
            <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-primary text-primary-foreground text-left flex flex-col md:flex-row items-center gap-8 shadow-2xl">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">Real-Time Impact Tracking</h3>
                <p className="opacity-90 mb-6">
                  Every lesson completed is recorded on the Polygon Amoy network. Funders like UNICEF can audit educational impact with 100% transparency and zero overhead.
                </p>
                <Button variant="secondary" className="gap-2" asChild>
                  <Link href="/dashboard">Access Dashboard <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="w-full md:w-1/3 aspect-video bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-sm font-mono opacity-80">Amoy Testnet Explorer</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 bg-muted/50">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          © 2024 Voice2Learn Proof. High-fidelity demo built for DialATutor.
        </div>
      </footer>
    </div>
  )
}
