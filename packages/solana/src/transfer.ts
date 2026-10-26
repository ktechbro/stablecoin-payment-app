import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction, type TransactionInstruction } from "@solana/web3.js";
import { assertTokenAmountMinor } from "@stablecoin/domain";

export interface BuildTransferInput {
  connection: Connection;
  feePayer: PublicKey;
  sender: PublicKey;
  recipient: PublicKey;
  mint: PublicKey;
  amountMinor: bigint;
  decimals: number;
  reference: PublicKey;
  createRecipientAta?: boolean;
}

export interface BuiltTransfer {
  transaction: Transaction;
  sourceAta: PublicKey;
  destinationAta: PublicKey;
  blockhash: string;
  lastValidBlockHeight: number;
}

export function createTransferInstructions(
  input: Omit<BuildTransferInput, "connection">,
): { instructions: TransactionInstruction[]; sourceAta: PublicKey; destinationAta: PublicKey } {
  assertTokenAmountMinor(input.amountMinor);

  if (!Number.isInteger(input.decimals) || input.decimals < 0 || input.decimals > 18) {
    throw new Error("Token decimals must be an integer between 0 and 18");
  }

  const sourceAta = getAssociatedTokenAddressSync(input.mint, input.sender);
  const destinationAta = getAssociatedTokenAddressSync(input.mint, input.recipient);
  const instructions: TransactionInstruction[] = [];

  if (input.createRecipientAta) {
    instructions.push(
      createAssociatedTokenAccountIdempotentInstruction(
        input.feePayer,
        destinationAta,
        input.recipient,
        input.mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  const transfer = createTransferCheckedInstruction(
    sourceAta,
    input.mint,
    destinationAta,
    input.sender,
    input.amountMinor,
    input.decimals,
    [],
    TOKEN_PROGRAM_ID,
  );

  transfer.keys.push({ pubkey: input.reference, isSigner: false, isWritable: false });
  instructions.push(transfer);

  return { instructions, sourceAta, destinationAta };
}

export async function buildTransferTransaction(input: BuildTransferInput): Promise<BuiltTransfer> {
  const { instructions, sourceAta, destinationAta } = createTransferInstructions(input);
  const { blockhash, lastValidBlockHeight } = await input.connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({ feePayer: input.feePayer, blockhash, lastValidBlockHeight });
  transaction.add(...instructions);

  return { transaction, sourceAta, destinationAta, blockhash, lastValidBlockHeight };
}

export function serializeUnsignedTransaction(transaction: Transaction): Uint8Array {
  return transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
}
