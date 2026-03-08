
# Dial A Tutor - Immutable Proof of Learning

Dial A Tutor is a voice-first educational platform designed to bridge the digital learning divide. It allows students in low-connectivity regions to receive oral lessons via any phone and earn immutable, database-backed "Proof of Learning" credentials.

## Features

- **Voice-First Interaction:** Simulated IVR (Interactive Voice Response) system using AI for oral lesson delivery and evaluation.
- **AI-Powered Tutoring:** Leverages Google Gemini (via Genkit) to generate dynamic lessons and evaluate student responses with strict academic guardrails.
- **Offline Mode:** A special toggle in the Lesson interface that mocks AI responses and queues writes locally using Firestore persistence, allowing for demonstrations even without active internet.
- **Immutable Proofs:** Every successful lesson completion generates a "Proof of Learning" record. In this version, proofs are secured in a public Firestore ledger, simulating the transparency of a blockchain.
- **Impact Verifier Dashboard:** A public ledger for funders and NGOs to audit educational outcomes in real-time.
- **Universal Accessibility:** Designed to be accessible via simple mobile phones (simulated through the web interface).

## Integration & Keys

### SMS Integration (Twilio)
The platform includes a server-side **Genkit Flow** (`notifyStudentFlow`) that handles SMS dispatching upon lesson completion.
Add your credentials to your `.env.local` file (or as Secrets in Firebase App Hosting):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

*If these are missing, the system defaults to **Simulation Mode**, logging messages to the console.*

### Blockchain Integration (Polygon)
The "Minting" of Proof of Learning tokens is currently **simulated**.
- **Current State:** Records are written to a public, read-only Firestore collection to demonstrate transparency and immutability.
- **Production Migration:** To move to a live blockchain (e.g., Polygon Amoy or Mainnet), you would need to:
  1. Add a Polygon RPC URL (via Alchemy or Infura).
  2. Add a `MINTER_PRIVATE_KEY` to your environment secrets.
  3. Update the `notifyStudentFlow` to trigger an on-chain transaction using a library like `ethers.js` or `viem`.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Backend/Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/products/auth) (Phone + PIN model)
- **AI/LLM:** [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini 2.0 Flash
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/products/app-hosting)

---

© 2026 Dial A Tutor. Built by Metaschool AI.
