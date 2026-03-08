
# Dial A Tutor - Immutable Proof of Learning

Dial A Tutor is a voice-first educational platform designed to bridge the digital learning divide. It allows students in low-connectivity regions to receive oral lessons via any phone and earn immutable, database-backed "Proof of Learning" credentials.

## Features

- **Voice-First Interaction:** Simulated IVR (Interactive Voice Response) system using AI for oral lesson delivery and evaluation.
- **AI-Powered Tutoring:** Leverages Google Gemini (via Genkit) to generate dynamic lessons and evaluate student responses with strict academic guardrails.
- **Offline Mode:** A toggle in the Lesson interface that mocks AI responses and queues writes locally using Firestore persistence, allowing for demos even without active internet.
- **Blockchain Verification:** Lessons are minted as Proof of Learning tokens on the **Polygon Amoy Testnet**.
- **Impact Verifier Dashboard:** A public ledger for funders and NGOs to audit educational outcomes in real-time.

## Integration & Setup

### SMS Integration (Twilio)
Add credentials to your `.env.local` or Firebase App Hosting Secrets:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

### Blockchain Integration (Polygon Amoy)
The platform now supports **live minting** to the Polygon Amoy testnet.
Add these environment variables to enable live transactions:
- `BLOCKCHAIN_RPC_URL`: Your Alchemy or Infura RPC URL for Amoy.
- `MINTER_PRIVATE_KEY`: A private key with Amoy MATIC to cover gas.
- `CONTRACT_ADDRESS`: (Optional) The address of your deployed Proof of Learning contract.

*If these are missing, the system defaults to **Simulation Mode**, generating valid-looking hashes for demo purposes.*

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Backend/AI:** [Genkit](https://firebase.google.com/docs/genkit)
- **Blockchain:** [Ethers.js](https://docs.ethers.org/)
- **Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)

---

© 2026 Dial A Tutor. Built by Metaschool AI.
