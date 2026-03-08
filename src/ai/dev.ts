
import { config } from 'dotenv';
config();

import '@/ai/flows/student-spoken-answer-evaluation.ts';
import '@/ai/flows/generate-lesson-flow.ts';
import '@/ai/flows/notify-student-flow.ts';
import '@/ai/flows/mint-proof-flow.ts';
