
'use server';
/**
 * @fileOverview This file defines a Genkit flow for notifying a student via SMS.
 * It uses Twilio if environment variables are provided, otherwise falls back to simulation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import twilio from 'twilio';

const NotifyStudentInputSchema = z.object({
  phoneNumber: z.string().describe("The student's phone number in E.164 format (e.g., +1234567890)."),
  lessonTitle: z.string().describe('The title of the completed lesson.'),
  score: z.number().describe("The student's score achieved."),
});
export type NotifyStudentInput = z.infer<typeof NotifyStudentInputSchema>;

const NotifyStudentOutputSchema = z.object({
  success: z.boolean().describe('Whether the notification was dispatched successfully.'),
  messageSid: z.string().optional().describe('The unique identifier for the SMS message from Twilio.'),
  mode: z.enum(['live', 'simulated']).describe('Indicates if the message was sent via live Twilio or simulated.'),
});
export type NotifyStudentOutput = z.infer<typeof NotifyStudentOutputSchema>;

const notifyStudentFlow = ai.defineFlow(
  {
    name: 'notifyStudentFlow',
    inputSchema: NotifyStudentInputSchema,
    outputSchema: NotifyStudentOutputSchema,
  },
  async (input) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    const messageBody = `Dial A Tutor: Congrats! You completed "${input.lessonTitle}" with a score of ${input.score}%. View your Proof of Learning in your profile!`;

    // Check if live credentials are provided
    if (accountSid && authToken && fromPhone) {
      try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
          body: messageBody,
          to: input.phoneNumber,
          from: fromPhone,
        });

        console.log(`[BACKEND] Live SMS sent via Twilio: ${message.sid}`);
        return {
          success: true,
          messageSid: message.sid,
          mode: 'live'
        };
      } catch (error) {
        console.error('[BACKEND] Twilio dispatch failed:', error);
        throw new Error('Failed to send live SMS. Check Twilio configuration.');
      }
    }

    // Fallback: Simulation mode for development/demo
    console.log(`[BACKEND SIMULATION] SMS to ${input.phoneNumber}: ${messageBody}`);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

    return {
      success: true,
      messageSid: `SM_SIM_${Math.random().toString(36).substring(7).toUpperCase()}`,
      mode: 'simulated'
    };
  }
);

export async function notifyStudent(input: NotifyStudentInput): Promise<NotifyStudentOutput> {
  return notifyStudentFlow(input);
}
