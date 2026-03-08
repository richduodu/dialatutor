
'use server';
/**
 * @fileOverview This file defines a Genkit flow for notifying a student via SMS.
 * This acts as the "backend function" that dispatches communications to students.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NotifyStudentInputSchema = z.object({
  phoneNumber: z.string().describe('The student\'s phone number.'),
  lessonTitle: z.string().describe('The title of the completed lesson.'),
  score: z.number().describe('The student\'s score achieved.'),
});
export type NotifyStudentInput = z.infer<typeof NotifyStudentInputSchema>;

const NotifyStudentOutputSchema = z.object({
  success: z.boolean().describe('Whether the notification was dispatched successfully.'),
  messageSid: z.string().optional().describe('The unique identifier for the SMS message from the provider.'),
});
export type NotifyStudentOutput = z.infer<typeof NotifyStudentOutputSchema>;

/**
 * Note: In a production environment, you would use a real SMS provider like Twilio.
 * 
 * Example:
 * import twilio from 'twilio';
 * const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
 */

const notifyStudentFlow = ai.defineFlow(
  {
    name: 'notifyStudentFlow',
    inputSchema: NotifyStudentInputSchema,
    outputSchema: NotifyStudentOutputSchema,
  },
  async (input) => {
    // 1. Log the backend event (this would be captured in server logs)
    console.log(`[BACKEND NOTIFICATION] Sending SMS to ${input.phoneNumber}`);
    
    // 2. Simulate the SMS Dispatch logic
    // In a live app, this would be: 
    // await client.messages.create({ body: `...`, to: input.phoneNumber, from: '...' })
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency

    return {
      success: true,
      messageSid: `SM${Math.random().toString(36).substring(7).toUpperCase()}`,
    };
  }
);

export async function notifyStudent(input: NotifyStudentInput): Promise<NotifyStudentOutput> {
  return notifyStudentFlow(input);
}
