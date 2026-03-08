'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a dynamic educational lesson.
 * It takes a subject and grade level and returns a lesson title, prompt, and expected answer.
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
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert curriculum designer for a voice-based educational app called Dial-a-Lesson.
Your task is to create a short, engaging oral lesson prompt for a student.

Subject: {{{subject}}}
Grade Level: {{{gradeLevel}}}

The lesson should be designed to be answered orally in 1-2 sentences. 
It should be challenging but appropriate for the specified grade level.

Provide:
1. A lesson 'title'.
2. The 'content' (the question or prompt the student will hear).
3. The 'expectedAnswer' (what a correct response should generally include).

Your response MUST be a valid JSON object. Do not include markdown formatting or backticks.`,
});

const generateLessonFlow = ai.defineFlow(
  {
    name: 'generateLessonFlow',
    inputSchema: GenerateLessonInputSchema,
    outputSchema: GenerateLessonOutputSchema,
  },
  async (input) => {
    const { output } = await lessonPrompt(input);
    if (!output) {
      throw new Error('Failed to generate lesson content from AI tutor.');
    }
    return output;
  }
);

export async function generateLesson(
  input: GenerateLessonInput
): Promise<GenerateLessonOutput> {
  return generateLessonFlow(input);
}
