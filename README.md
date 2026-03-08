
# Dial A Tutor - Immutable Proof of Learning

Dial A Tutor is a voice-first educational platform designed to bridge the digital learning divide. It allows students in low-connectivity regions to receive oral lessons via any phone and earn immutable, blockchain-backed "Proof of Learning" credentials on the Polygon Amoy Testnet.

## Features

- **Voice-First Interaction:** Simulated IVR (Interactive Voice Response) system using AI for oral lesson delivery and evaluation.
- **AI-Powered Tutoring:** Leverages Google Gemini (via Genkit) to generate dynamic lessons and evaluate student responses with strict academic guardrails.
- **Offline Mode:** A special toggle in the Lesson interface that mocks AI responses and queues blockchain writes locally using Firestore persistence, allowing for demonstrations even without active internet.
- **Blockchain Verification:** Automatically mints "Proof of Learning" tokens on the Polygon Amoy Testnet for every successful lesson completion.
- **Impact Verifier Dashboard:** A public ledger for funders and NGOs to audit educational outcomes in real-time.
- **Universal Accessibility:** Designed to be accessible via simple mobile phones (simulated through the web interface).

## SMS Integration (Twilio)

The platform includes a server-side **Genkit Flow** (`notifyStudentFlow`) that handles SMS dispatching upon lesson completion.

### Local Configuration
Add your credentials to your `.env.local` file:
```env
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_number_here
```
If these variables are missing, the system automatically defaults to **Simulation Mode**, logging the message content to the console without consuming Twilio credits.

### Production Configuration (Firebase App Hosting)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **App Hosting** and select your backend.
3. Under **Secrets**, add the `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` as environment variables.
4. Redeploy your application for the changes to take effect.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend/Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth) (Phone + PIN model)
- **AI/LLM:** [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini 2.0 Flash
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/products/app-hosting)

---

© 2026 Dial A Tutor. Built by Metaschool AI.
