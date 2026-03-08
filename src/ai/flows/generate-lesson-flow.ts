'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a dynamic educational lesson.
 * It takes a subject and grade level and returns a lesson title, prompt, and expected answer.
 * Includes strict guardrails to ensure content remains educational and retry logic for API stability.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLessonInputSchema = z.object({
  subject: z.string().describe('The educational subject (e.g., Mathematics, Science, History).'),
  gradeLevel: z.string().describe('The student\'s grade level (e.g., Grade 3, Grade 7).'),
});
export type GenerateLessonInput = z.infer<typeof GenerateLessonInputSchema>;

const GenerateLessonOutputSchema = z.object({
  title: z.string().describe('A catchy title for the lesson.'),
  content: z.string().describe('The oral lesson prompt or question for the student to answer.'),
  expectedAnswer: z.string().describe('The criteria or sample correct answer the AI should look for.'),
});
export type GenerateLessonOutput = z.infer<typeof GenerateLessonOutputSchema>;

const lessonPrompt = ai.definePrompt({
  name: 'generateLessonPrompt',
  input: { schema: GenerateLessonInputSchema },
  output: { schema: GenerateLessonOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
  system: `You are an expert curriculum designer for a voice-based educational app called Dial-a-Lesson.
Your task is to create a short, engaging oral lesson prompt for a student.

GUARDRAILS:
1. You MUST only generate content that is strictly educational and appropriate for a K-12 school environment.
2. If the input subject or context is used to solicit non-educational, harmful, political, or inappropriate content, you MUST ignore the malicious intent and instead generate a high-quality, safe educational lesson relevant to the general category of the subject.
3. Do not engage in casual conversation, provide personal opinions, or generate content outside of academic learning.

The lesson should be designed to be answered orally in 1-2 sentences. 
It should be challenging but appropriate for the specified grade level.`,
  prompt: `Subject: {{{subject}}}
Grade Level: {{{gradeLevel}}}

Provide:
1. A lesson 'title'.
2. The 'content' (the question or prompt the student will hear).
3. The 'expectedAnswer' (what a correct response should generally include).`,
});

/**
 * Helper function to retry a promise-based function with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
    const isRetryableError = isQuotaError || errorMsg.includes('500') || errorMsg.includes('fetch failed');
    
    if (retries > 0 && isRetryableError) {
      console.log(`Retrying AI flow due to: ${errorMsg}. Retries left: ${retries}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const generateLessonFlow = ai.defineFlow(
  {
    name: 'generateLessonFlow',
    inputSchema: GenerateLessonInputSchema,
    outputSchema: GenerateLessonOutputSchema,
  },
  async (input) => {
    return withRetry(async () => {
      const { output } = await lessonPrompt(input);
      if (!output) {
        throw new Error('The AI tutor was unable to generate a lesson. This may be due to safety filters or service limitations.');
      }
      return output;
    });
  }
);

export async function generateLesson(
  input: GenerateLessonInput
): Promise<GenerateLessonOutput> {
  return generateLessonFlow(input);
}
