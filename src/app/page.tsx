import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, ShieldCheck, Cpu, Globe, Zap, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-abstract')
  const studentImage = PlaceHolderImages.find(img => img.id === 'student-voice')
  const logoImage = PlaceHolderImages.find(img => img.id === 'app-logo')

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary rounded-full animate-in fade-in slide-in-from-top-4 duration-700">
                <Globe className="mr-2 h-3.5 w-3.5" /> Bridging the Digital Learning Divide
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Voice-First Learning. <br />
                <span className="text-primary font-headline italic">Dial A Tutor.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                Empowering students with oral lessons via any phone. Secure, immutable Proof of Learning on the Polygon Amoy Testnet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg font-bold gap-2 bg-primary hover:bg-primary/90 shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1" asChild>
                  <Link href="/lesson">
                    Start Learning <Zap className="h-5 w-5 fill-current" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg font-bold gap-2 border-primary/20 text-black hover:bg-primary/5 transition-all hover:-translate-y-1" asChild>
                  <Link href="/dashboard">
                    View Live Ledger <ShieldCheck className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />
          </div>
        </section>

        {/* Impact Visual Section */}
        <section className="py-20 bg-white/50 backdrop-blur-sm border-y">
          <div className="container px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl">
                  {studentImage && (
                    <Image 
                      src={studentImage.imageUrl} 
                      alt={studentImage.description} 
                      width={600} 
                      height={400} 
                      className="w-full object-cover transform transition duration-700 group-hover:scale-105"
                      data-ai-hint={studentImage.imageHint}
                    />
                  )}
                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary uppercase tracking-tighter">Voice Interactive</p>
                        <p className="text-xs text-muted-foreground font-medium">No smartphone or data connection required for basic access.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <h2 className="text-4xl font-black font-headline leading-tight">Closing the Education Gap with Voice & AI</h2>
                <div className="space-y-6">
                  {[
                    { title: "Universal Accessibility", desc: "Designed for regions with limited internet. Any feature phone becomes a portal to high-quality education." },
                    { title: "Real-time AI Tutoring", desc: "Advanced LLMs provide instant evaluation and feedback on oral responses, simulating a private tutor." },
                    { title: "Immutable Credentials", desc: "Every completed lesson is minted as a Proof of Learning, giving students a verifiable digital history." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="mt-1 bg-accent/10 rounded-full p-1 h-fit">
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Transparency Section */}
        <section className="py-32 overflow-hidden">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-black font-headline mb-6 tracking-tight">Radical Transparency for Global Impact</h2>
              <p className="text-muted-foreground text-lg">We provide funders and organizations with auditable, real-time data on educational outcomes verified by the blockchain.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: ShieldCheck, 
                  title: "Immutable Proofs", 
                  color: "primary",
                  desc: "Every lesson result is hashed and secured on the Polygon Amoy Testnet, making it impossible to forge or alter." 
                },
                { 
                  icon: Globe, 
                  title: "Public Ledger", 
                  color: "accent",
                  desc: "A public-facing dashboard allows partners to track real-time learning hours and comprehension scores across demographics." 
                },
                { 
                  icon: Cpu, 
                  title: "Scalable Infrastructure", 
                  color: "primary",
                  desc: "Built on Genkit and Firebase, the platform handles thousands of simultaneous oral lessons with zero latency." 
                }
              ].map((feature, i) => (
                <Card key={i} className="group border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white overflow-hidden">
                  <div className="h-1.5 w-full bg-primary" />
                  <CardHeader>
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container px-4 mx-auto">
          <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden p-12 md:p-24 text-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              {heroImage && (
                <Image 
                  src={heroImage.imageUrl} 
                  alt="Background" 
                  fill 
                  className="object-cover grayscale"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Ready to verify the next million learners?</h2>
              <p className="text-slate-400 text-lg">Join forward-thinking organizations using Dial A Tutor to deliver and track verifiable educational impact.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-14 px-10" asChild>
                  <Link href="/lesson">Get Started Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 font-bold h-14 px-10" asChild>
                  <Link href="/dashboard">View Live Ledger</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-20">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="relative h-8 w-8 overflow-hidden rounded-md bg-primary/10">
                   <Image 
                    src="/images/metaschool.png" 
                    alt="Metaschool Logo" 
                    fill
                    className="object-contain"
                    placeholder="blur"
                    blurDataURL={logoImage?.imageUrl}
                  />
                </div>
                <span className="text-2xl font-black tracking-tighter text-primary">Dial A Tutor</span>
              </Link>
              <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                Empowering the next generation of global learners through voice-first technology and blockchain-backed transparency.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/lesson" className="hover:text-primary transition-colors">Take a Lesson</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Impact Ledger</Link></li>
                <li><Link href="/my-progress" className="hover:text-primary transition-colors">Student Profile</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground">Verification</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://amoy.polygonscan.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Polygon Amoy Scan</a></li>
                <li><Link href="/audit" className="hover:text-primary transition-colors">Open-Source Audit</Link></li>
                <li><Link href="/api-docs" className="hover:text-primary transition-colors">Partner API</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted-foreground">
            <p>© 2026 Dial A Tutor. Built by Metaschool AI on Polygon Amoy Testnet.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
