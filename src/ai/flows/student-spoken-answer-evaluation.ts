'use server';
/**
 * @fileOverview This file defines a Genkit flow for evaluating a student's spoken answer.
 * It uses a multimodal AI model to transcribe the audio and evaluate comprehension
 * against lesson content in a single efficient step.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudentSpokenAnswerEvaluationInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The student's spoken answer as an audio data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  lessonContent: z.string().describe('The content or context of the lesson.'),
  expectedAnswer: z
    .string()
    .describe('The expected correct answer or criteria for evaluation.'),
});
export type StudentSpokenAnswerEvaluationInput = z.infer<
  typeof StudentSpokenAnswerEvaluationInputSchema
>;

const StudentSpokenAnswerEvaluationOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the spoken answer.'),
  evaluation: z.string().describe('A detailed AI evaluation of the answer.'),
  isCorrect: z
    .boolean()
    .describe('True if the answer is correct and comprehended, false otherwise.'),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'A score from 0 to 100 indicating the correctness and comprehension of the answer.'
    ),
});
export type StudentSpokenAnswerEvaluationOutput = z.infer<
  typeof StudentSpokenAnswerEvaluationOutputSchema
>;

const evaluatePrompt = ai.definePrompt({
  name: 'evaluateSpokenAnswerPrompt',
  input: { schema: StudentSpokenAnswerEvaluationInputSchema },
  output: { schema: StudentSpokenAnswerEvaluationOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an AI tutor designed to evaluate student spoken answers.
The student provided an oral response to the following lesson.

Lesson Content: {{{lessonContent}}}
Expected Answer/Criteria: {{{expectedAnswer}}}

First, transcribe the provided audio precisely. 
Then, evaluate the transcription for correctness and comprehension against the lesson content and expected answer.

Audio: {{media url=audioDataUri}}

Evaluation instructions:
- Provide a clear 'transcription' of exactly what the student said.
- Provide a detailed 'evaluation' explaining your assessment and how they can improve.
- Set 'isCorrect' to true if the answer demonstrates understanding and matches the criteria, false otherwise.
- Assign a 'score' from 0 to 100 based on accuracy, vocabulary usage, and comprehension.

Your response MUST be a JSON object following the StudentSpokenAnswerEvaluationOutputSchema.`,
});

const studentSpokenAnswerEvaluationFlow = ai.defineFlow(
  {
    name: 'studentSpokenAnswerEvaluationFlow',
    inputSchema: StudentSpokenAnswerEvaluationInputSchema,
    outputSchema: StudentSpokenAnswerEvaluationOutputSchema,
  },
  async (input) => {
    const { output } = await evaluatePrompt(input);

    if (!output) {
      throw new Error('Failed to get evaluation output from AI tutor.');
    }

    return output;
  }
);

export async function evaluateSpokenAnswer(
  input: StudentSpokenAnswerEvaluationInput
): Promise<StudentSpokenAnswerEvaluationOutput> {
  return studentSpokenAnswerEvaluationFlow(input);
}
