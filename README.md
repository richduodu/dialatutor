# Dial A Tutor - Immutable Proof of Learning

Dial A Tutor is a voice-first educational platform designed to bridge the digital learning divide. It allows students in low-connectivity regions to receive oral lessons via any phone and earn immutable, database-backed "Proof of Learning" credentials.

## Project Structure & Assets

### Logo & Images
To ensure the logo loads correctly, your folder structure MUST look like this:
```
/root
  /public
    /images
      metaschool.png
```
**DO NOT** place the `images` folder inside `src`. The application references assets starting from the `public` folder, so `/images/metaschool.png` in code points to `public/images/metaschool.png`.

## Setup & Environment Variables

To transition from **Simulation Mode** to **Live Mode**, you must set the following variables in your `.env` file:

### 1. AI Integration (Gemini)
- `GOOGLE_GENAI_API_KEY`: Your API key from [Google AI Studio](https://aistudio.google.com/). Already set for you.

### 2. Blockchain Integration (Polygon Amoy)

#### A. Get your RPC URL (Alchemy)
1. Sign in to [Alchemy](https://www.alchemy.com/).
2. Click **Create App**.
3. Select **Polygon PoS** as the **Chain**.
4. Select **Amoy** as the **Network**.
5. Once created, click **API Key** and copy the **HTTPS** URL. Paste this into `.env` as `BLOCKCHAIN_RPC_URL`.

#### B. Get your Private Key (MetaMask Extension)
**IMPORTANT:** You must use the **MetaMask Browser Extension** (the fox icon in your browser toolbar), not the web portfolio dashboard.
1. Open the **MetaMask Extension** from your browser toolbar.
2. Click the **three dots (⋮)** in the top right of the account card.
3. Select **Account details**.
4. Click **Show private key**, enter your password, and hold to reveal.
5. Copy the long string of characters and paste it into `.env` as `MINTER_PRIVATE_KEY`.
   - **Note:** Do NOT share this key. It is different from your public address.

#### C. Get Test MATIC (Faucet)
- Your wallet needs gas to pay for transactions. Go to the [Polygon Faucet](https://faucet.polygon.technology/) or [Alchemy Faucet](https://www.alchemy.com/faucets/polygon-amoy), paste your public address (`0x73f14Eb76Ba653f3f89CF532632Df16b49A85535`), and request "Amoy MATIC".

### 3. SMS Integration (Twilio)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`: (Optional) For sending automated SMS reports.

---

© 2026 Dial A Tutor. Built by Metaschool AI.
