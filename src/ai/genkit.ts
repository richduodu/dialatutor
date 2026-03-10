import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const model = process.env.GOOGLE_GENAI_MODEL?.trim() || 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model,
});
