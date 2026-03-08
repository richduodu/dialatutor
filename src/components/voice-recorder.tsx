
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { evaluateSpokenAnswer } from "@/ai/flows/student-spoken-answer-evaluation"

interface VoiceRecorderProps {
  lessonContent: string
  expectedAnswer: string
  onComplete: (data: any) => void
  onProcessingChange?: (isProcessing: boolean) => void
}

export function VoiceRecorder({ lessonContent, expectedAnswer, onComplete, onProcessingChange }: VoiceRecorderProps) {
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
    onProcessingChange?.(true)
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
        onProcessingChange?.(false)
        onComplete(evaluation)
      }
    } catch (error) {
      setIsProcessing(false)
      onProcessingChange?.(false)
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
    onProcessingChange?.(false)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed rounded-3xl bg-muted/20">
      {!result && !isProcessing && (
        <div className="text-center space-y-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Voice Input Simulation</p>
          <div className="flex flex-col items-center gap-4">
            {!isRecording ? (
              <Button 
                size="lg" 
                className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90 shadow-xl"
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
        <div className="text-center space-y-4 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-1">
            <p className="text-xl font-bold">Transcribing & Evaluating...</p>
            <p className="text-muted-foreground">AI is checking your comprehension</p>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`p-6 rounded-2xl flex items-start gap-4 ${result.isCorrect ? 'bg-accent/10 border border-accent/20' : 'bg-destructive/10 border border-destructive/20'}`}>
            {result.isCorrect ? (
              <CheckCircle2 className="h-6 w-6 text-accent shrink-0 mt-1" />
            ) : (
              <AlertCircle className="h-6 w-6 text-destructive shrink-0 mt-1" />
            )}
            <div className="space-y-1">
              <p className="font-bold text-lg">
                {result.isCorrect ? "Excellent! Answer Verified." : "Needs Review"}
              </p>
              <p className="text-sm opacity-90">{result.evaluation}</p>
            </div>
            <div className="ml-auto text-right">
              <span className="text-2xl font-black text-primary">{result.score}%</span>
              <p className="text-[10px] uppercase font-bold opacity-60">Score</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">What you said:</p>
            <p className="italic text-sm text-foreground bg-white/50 p-3 rounded-lg border">
              "{result.transcription}"
            </p>
          </div>

          {!result.isCorrect && (
            <Button variant="outline" className="w-full rounded-full gap-2" onClick={reset}>
              <RefreshCcw className="h-4 w-4" /> Try Again
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
