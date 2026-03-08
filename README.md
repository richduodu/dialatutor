# Dial A Tutor - Immutable Proof of Learning

Dial A Tutor is a high-fidelity prototype of a voice-first educational platform designed to bridge the digital learning divide. It allows students in low-connectivity regions to receive oral lessons via any phone and earn immutable, blockchain-backed "Proof of Learning" credentials on the Polygon Amoy Testnet.

## 🚀 Features

- **Voice-First Interaction:** Simulated IVR (Interactive Voice Response) system using AI for oral lesson delivery and evaluation.
- **AI-Powered Tutoring:** Leverages Google Gemini (via Genkit) to generate dynamic lessons and evaluate student responses with strict academic guardrails.
- **Blockchain Verification:** Automatically mints "Proof of Learning" tokens on the Polygon Amoy Testnet for every successful lesson completion.
- **Impact Verifier Dashboard:** A public ledger for funders and NGOs to audit educational outcomes in real-time.
- **Universal Accessibility:** Designed to be accessible via simple mobile phones (simulated through the web interface).

## 🛠 Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend/Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth) (Anonymous & Phone simulation)
- **AI/LLM:** [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini 2.0 Flash
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/products/app-hosting)

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Firebase Account](https://console.firebase.google.com/)
- [Google Cloud Project](https://console.cloud.google.com/) with Gemini API access enabled.

## 💻 Local Development

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

5. **Run Genkit UI (Optional for AI testing):**
   ```bash
   npm run genkit:dev
   ```

## ☁️ Deployment Instructions

### 1. Firebase Setup
- Go to the [Firebase Console](https://console.firebase.google.com/).
- Create a new project or select an existing one.
- **Enable Authentication:** Activate the "Anonymous" sign-in provider.
- **Enable Firestore:** Create a database in "Production" or "Test" mode.
- **Deploy Security Rules:** Copy the rules from `firestore.rules` and publish them in the Firebase Console.

### 2. Genkit/Gemini API
- Ensure you have a valid API Key from [Google AI Studio](https://aistudio.google.com/).
- In the Firebase Console, go to **Project Settings > Cloud Messaging** or use the Google Cloud Console to ensure the Gemini API is enabled for your project.

### 3. Deploy via Firebase App Hosting
Firebase App Hosting is the recommended way to deploy this Next.js 15 application.

1.  **Connect your GitHub Repository:** In the Firebase Console, navigate to **App Hosting** and connect your repository.
2.  **Configure Environment Variables:** During the setup, add `GOOGLE_GENAI_API_KEY` as a secret or environment variable.
3.  **Deploy:** Firebase will automatically detect the Next.js build and deploy your application.

## 📄 License

Built by Metaschool AI. This project is for educational and prototyping purposes.

---

© 2026 Dial A Tutor. All rights reserved.