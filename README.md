
# Dial A Tutor - Immutable Proof of Learning

Dial A Tutor is a voice-first educational platform designed to bridge the digital learning divide. It allows students in low-connectivity regions to receive oral lessons via any phone and earn immutable, blockchain-backed "Proof of Learning" credentials on the Polygon Amoy Testnet.

## Features

- **Voice-First Interaction:** Simulated IVR (Interactive Voice Response) system using AI for oral lesson delivery and evaluation.
- **AI-Powered Tutoring:** Leverages Google Gemini (via Genkit) to generate dynamic lessons and evaluate student responses with strict academic guardrails.
- **Offline Mode:** A special toggle in the Lesson interface that mocks AI responses and queues blockchain writes locally using Firestore persistence, allowing for demonstrations even without active internet.
- **Blockchain Verification:** Automatically mints "Proof of Learning" tokens on the Polygon Amoy Testnet for every successful lesson completion.
- **Impact Verifier Dashboard:** A public ledger for funders and NGOs to audit educational outcomes in real-time.
- **Universal Accessibility:** Designed to be accessible via simple mobile phones (simulated through the web interface).

## Backend & SMS Architecture

The student interaction model is designed to be "asynchronous-first" to handle spotty connectivity.

1. **Phone-Based Identity:** Students authenticate using their phone numbers.
2. **IVR Simulation:** The web interface simulates an IVR call where the AI "speaks" the lesson and the student "speaks" back.
3. **Backend Notifications (Server Actions):** 
    - Upon lesson completion, a `notifyStudentFlow` (Genkit Flow) is triggered on the server.
    - This backend action acts as the equivalent of a Firebase Cloud Function, handling the logic for dispatching an automated SMS.
    - **Current State:** The dispatch logic is implemented as a server-side action with simulated Twilio integration for demonstration purposes.
4. **Offline Synchronization:** Achievements are cached locally via Firestore. Once the device syncs with the cloud, the backend trigger is activated automatically.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend/Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth) (Anonymous & Phone simulation)
- **AI/LLM:** [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini 2.0 Flash
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/products/app-hosting)

## Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd dial-a-tutor
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add your Google AI API Key:
   ```env
   GOOGLE_GENAI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) in your browser.

## Deployment Instructions

### 1. Firebase Setup
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Create a new project.
- **Enable Authentication:** Activate "Anonymous" sign-in.
- **Enable Firestore:** Create a database.

### 2. Deploy via Firebase App Hosting
Firebase App Hosting is the recommended way to deploy this Next.js 15 application.

1. **Connect your GitHub Repository:** In the Firebase Console, navigate to **App Hosting** and connect your repo.
2. **Configure Environment Variables:** Add `GOOGLE_GENAI_API_KEY` as a secret.
3. **Deploy:** Firebase will automatically detect the Next.js build and deploy your application.

---

© 2026 Dial A Tutor. Built by Metaschool AI.
