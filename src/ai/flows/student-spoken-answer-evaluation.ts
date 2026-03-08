'use server';
/**
 * @fileOverview This file defines a Genkit flow for evaluating a student's spoken answer.
 * It transcribes the audio input and then uses an AI model to evaluate the correctness
 * and comprehension of the transcribed answer against lesson content and expected answers.
 *
 * - evaluateSpokenAnswer - A function that handles the spoken answer evaluation process.
 * - StudentSpokenAnswerEvaluationInput - The input type for the evaluateSpokenAnswer function.
 * - StudentSpokenAnswerEvaluationOutput - The return type for the evaluateSpokenAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Input Schema
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

// 2. Output Schema
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

// 3. Evaluation Prompt Definition
const evaluatePrompt = ai.definePrompt({
  name: 'evaluateSpokenAnswerPrompt',
  input: { schema: z.object({
    transcription: z.string().describe('The student\'s transcribed spoken answer.'),
    lessonContent: z.string().describe('The lesson content or context.'),
    expectedAnswer: z.string().describe('The expected correct answer or criteria.'),
  })},
  output: { schema: StudentSpokenAnswerEvaluationOutputSchema },
  prompt: `You are an AI tutor designed to evaluate student spoken answers.
The student provided the following spoken answer, which has been transcribed:
Transcription: {{{transcription}}}

The lesson content was:
Lesson Content: {{{lessonContent}}}

The expected answer or evaluation criteria is:
Expected Answer/Criteria: {{{expectedAnswer}}}

Evaluate the student's transcription for correctness and comprehension against the lesson content and expected answer.
Provide a detailed 'evaluation' explaining your assessment.
Determine if the answer is 'isCorrect' (true or false).
Assign a 'score' from 0 to 100 based on correctness and comprehension.
Your response MUST be a JSON object following the StudentSpokenAnswerEvaluationOutputSchema.`,
});

// 4. Flow Definition
const studentSpokenAnswerEvaluationFlow = ai.defineFlow(
  {
    name: 'studentSpokenAnswerEvaluationFlow',
    inputSchema: StudentSpokenAnswerEvaluationInputSchema,
    outputSchema: StudentSpokenAnswerEvaluationOutputSchema,
  },
  async (input) => {
    // Step 1: Transcribe the audio data URI
    // Referencing the model by its string ID to ensure compatibility with the Google AI plugin.
    const transcriptionResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash', 
      prompt: [
        { text: 'Transcribe the following audio precisely. Do not add any extra commentary or punctuation that is not directly spoken:' },
        {
          media: {
            url: input.audioDataUri,
          },
        },
      ],
      config: {
        maxOutputTokens: 2048,
      }
    });

    if (!transcriptionResponse.text) {
      throw new Error('Failed to transcribe audio or transcription is empty.');
    }
    const transcription = transcriptionResponse.text;

    // Step 2: Evaluate the transcribed answer
    const evaluationInput = {
      transcription: transcription,
      lessonContent: input.lessonContent,
      expectedAnswer: input.expectedAnswer,
    };

    const { output } = await evaluatePrompt(evaluationInput);

    if (!output) {
      throw new Error('Failed to get evaluation output.');
    }

    return {
      transcription: transcription,
      evaluation: output.evaluation,
      isCorrect: output.isCorrect,
      score: output.score,
    };
  }
);

// 5. Wrapper function
export async function evaluateSpokenAnswer(
  input: StudentSpokenAnswerEvaluationInput
): Promise<StudentSpokenAnswerEvaluationOutput> {
  return studentSpokenAnswerEvaluationFlow(input);
}
