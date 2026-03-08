
'use server';
/**
 * @fileOverview This file defines a Genkit flow for minting a Proof of Learning on Polygon.
 * It uses ethers.js to interact with the blockchain if keys are provided.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ethers } from 'ethers';

const MintProofInputSchema = z.object({
  studentId: z.string(),
  lessonTitle: z.string(),
  grade: z.number(),
});
export type MintProofInput = z.infer<typeof MintProofInputSchema>;

const MintProofOutputSchema = z.object({
  success: z.boolean(),
  transactionHash: z.string(),
  tokenId: z.string(),
  network: z.string(),
  mode: z.enum(['live', 'simulated']),
});
export type MintProofOutput = z.infer<typeof MintProofOutputSchema>;

const mintProofFlow = ai.defineFlow(
  {
    name: 'mintProofFlow',
    inputSchema: MintProofInputSchema,
    outputSchema: MintProofOutputSchema,
  },
  async (input) => {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const privateKey = process.env.MINTER_PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS || "0x89542654019213892301923019230192301e921";

    // If live keys are present, attempt a real transaction
    if (rpcUrl && privateKey) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        // For this demo, we'll send a zero-value transaction to the contract address
        // to generate a real transaction hash on the Amoy Testnet.
        // In production, you would call the .mint() function of your ERC-721 contract.
        const tx = await wallet.sendTransaction({
          to: contractAddress,
          value: 0,
          data: ethers.hexlify(ethers.toUtf8Bytes(`PoL:${input.studentId}:${input.lessonTitle}:${input.grade}`))
        });

        console.log(`[BLOCKCHAIN] Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`[BLOCKCHAIN] Transaction confirmed: ${receipt?.hash}`);

        return {
          success: true,
          transactionHash: tx.hash,
          tokenId: Math.floor(Math.random() * 1000000).toString(),
          network: 'Polygon Amoy Testnet',
          mode: 'live'
        };
      } catch (error) {
        console.error('[BLOCKCHAIN] Live minting failed:', error);
        throw new Error('Failed to mint on-chain. Check RPC URL and Private Key.');
      }
    }

    // Fallback: Simulation mode
    console.log(`[BLOCKCHAIN SIMULATION] Minting Proof for ${input.studentId}...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate chain latency
    
    const simulatedHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      success: true,
      transactionHash: simulatedHash,
      tokenId: Math.floor(Math.random() * 1000000).toString(),
      network: 'Polygon Amoy (Simulated)',
      mode: 'simulated'
    };
  }
);

export async function mintProof(input: MintProofInput): Promise<MintProofOutput> {
  return mintProofFlow(input);
}
