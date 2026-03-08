
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RefreshCcw, BrainCircuit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { evaluateSpokenAnswer } from "@/ai/flows/student-spoken-answer-evaluation"

interface VoiceRecorderProps {
  lessonContent: string
  expectedAnswer: string
  onComplete: (data: any) => void
}

export function VoiceRecorder({ lessonContent, expectedAnswer, onComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        processAudio(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setResult(null)
    } catch (err) {
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone permissions to simulate the voice interaction.",
        variant: "destructive"
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        
        const evaluation = await evaluateSpokenAnswer({
          audioDataUri: base64Audio,
          lessonContent,
          expectedAnswer,
        })

        setResult(evaluation)
        setIsProcessing(false)
        onComplete(evaluation)
      }
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Processing Failed",
        description: "There was an error analyzing your answer. Please try again.",
        variant: "destructive"
      })
    }
  }

  const reset = () => {
    setResult(null)
    setAudioURL(null)
    setIsRecording(false)
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed rounded-3xl bg-muted/20 min-h-[300px] justify-center transition-all duration-300">
      {!result && !isProcessing && (
        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Voice Input Simulation</p>
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <Button 
                size="lg" 
                className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90 shadow-xl transition-transform active:scale-90"
                onClick={startRecording}
              >
                <Mic className="h-10 w-10" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="destructive"
                className="h-24 w-24 rounded-full shadow-xl animate-pulse"
                onClick={stopRecording}
              >
                <Square className="h-10 w-10" />
              </Button>
            )}
            <p className="text-lg font-semibold">
              {isRecording ? "Listening... Speak now" : "Tap to speak your answer"}
            </p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center space-y-8 py-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative inline-block">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 scale-150" />
            <div className="relative h-24 w-24 rounded-full bg-white shadow-2xl flex items-center justify-center">
              <BrainCircuit className="h-12 w-12 text-primary animate-bounce" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold font-headline">AI Tutor Grading...</p>
            <p className="text-muted-foreground">Analyzing your comprehension and speech patterns</p>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`p-6 rounded-2xl flex items-start gap-4 shadow-sm ${result.isCorrect ? 'bg-accent/10 border border-accent/20' : 'bg-destructive/10 border border-destructive/20'}`}>
            {result.isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
            )}
            <div className="space-y-1 flex-1">
              <p className="font-bold text-lg">
                {result.isCorrect ? "Excellent! Answer Verified." : "Needs Review"}
              </p>
              <p className="text-sm opacity-90 leading-relaxed">{result.evaluation}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-primary">{result.score}%</span>
              <p className="text-[10px] uppercase font-bold opacity-60">Score</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Transcription Preview</p>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-inner">
              <p className="italic text-sm text-foreground leading-relaxed">
                "{result.transcription}"
              </p>
            </div>
          </div>

          {!result.isCorrect && (
            <Button variant="outline" className="w-full rounded-full h-12 gap-2 font-bold transition-all hover:bg-primary hover:text-white" onClick={reset}>
              <RefreshCcw className="h-4 w-4" /> Try Again
            </Button>
          )}

          {result.isCorrect && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <p className="text-xs font-bold text-accent uppercase tracking-widest">Preparing Proof of Learning...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
