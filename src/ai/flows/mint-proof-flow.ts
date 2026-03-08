'use server';
/**
 * @fileOverview This file defines a Genkit flow for minting a Proof of Learning on Polygon.
 * It uses ethers.js to interact with the blockchain if keys are provided.
 * 
 * - mintProof - The main function to trigger a blockchain transaction.
 * - MintProofInput - Student and lesson details for the proof.
 * - MintProofOutput - Transaction details including hash, network, and mode.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ethers } from 'ethers';

const MintProofInputSchema = z.object({
  studentId: z.string().describe('The unique ID of the student.'),
  lessonTitle: z.string().describe('The title of the lesson completed.'),
  grade: z.number().describe('The grade achieved by the student.'),
});
export type MintProofInput = z.infer<typeof MintProofInputSchema>;

const MintProofOutputSchema = z.object({
  success: z.boolean().describe('Whether the minting was initiated successfully.'),
  transactionHash: z.string().describe('The hash of the blockchain transaction.'),
  tokenId: z.string().describe('The unique identifier of the minted token.'),
  network: z.string().describe('The name of the blockchain network.'),
  contractAddress: z.string().describe('The address of the smart contract used.'),
  mode: z.enum(['live', 'simulated']).describe('Whether this was a live or simulated transaction.'),
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
    const fallbackContract = "0x89542654019213892301923019230192301e921";
    const contractAddress = process.env.CONTRACT_ADDRESS || fallbackContract;

    // If live keys are present, attempt a real transaction on Polygon Amoy
    if (rpcUrl && privateKey) {
      try {
        console.log(`[BLOCKCHAIN] Attempting live mint for Student: ${input.studentId}...`);
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        // We broadcast a transaction containing the proof metadata in the data field.
        // This is an immutable way to record the learning achievement on-chain.
        const tx = await wallet.sendTransaction({
          to: contractAddress,
          value: 0,
          data: ethers.hexlify(ethers.toUtf8Bytes(`PoL|Learner:${input.studentId}|Lesson:${input.lessonTitle}|Grade:${input.grade}%`))
        });

        console.log(`[BLOCKCHAIN] Live transaction broadcast: ${tx.hash}`);
        // We return immediately after broadcast to maintain a responsive UI, per optimistic patterns.
        
        return {
          success: true,
          transactionHash: tx.hash,
          tokenId: Math.floor(Math.random() * 1000000).toString(),
          network: 'Polygon Amoy Testnet',
          contractAddress,
          mode: 'live'
        };
      } catch (error: any) {
        console.error('[BLOCKCHAIN] Live minting failed:', error);
        throw new Error(`On-chain minting failed: ${error.message || 'Check RPC and Private Key'}`);
      }
    }

    // Fallback: Simulation mode for development/demo
    console.log(`[BLOCKCHAIN SIMULATION] Minting Proof for ${input.studentId}...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate chain latency
    
    // Generate a high-fidelity simulated hash
    const simulatedHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      success: true,
      transactionHash: simulatedHash,
      tokenId: Math.floor(Math.random() * 1000000).toString(),
      network: 'Polygon Amoy (Simulated)',
      contractAddress: fallbackContract,
      mode: 'simulated'
    };
  }
);

export async function mintProof(input: MintProofInput): Promise<MintProofOutput> {
  return mintProofFlow(input);
}
