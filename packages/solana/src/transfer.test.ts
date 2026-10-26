import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Keypair, type Connection } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { buildTransferTransaction, serializeUnsignedTransaction } from "./transfer.js";

function setup(createRecipientAta = false) {
  const sender = Keypair.generate().publicKey;
  const recipient = Keypair.generate().publicKey;
  const mint = Keypair.generate().publicKey;
  const reference = Keypair.generate().publicKey;
  const blockhash = Keypair.generate().publicKey.toBase58();
  const connection = {
    getLatestBlockhash: async () => ({ blockhash, lastValidBlockHeight: 12345 }),
  } as unknown as Connection;

  return {
    input: {
      connection,
      feePayer: sender,
      sender,
      recipient,
      mint,
      amountMinor: 2_500_000n,
      decimals: 6,
      reference,
      createRecipientAta,
    },
    sender,
    reference,
    blockhash,
  };
}

describe("buildTransferTransaction", () => {
  it("builds an unsigned SPL transferChecked transaction with a read-only reference", async () => {
    const { input, sender, reference, blockhash } = setup();
    const built = await buildTransferTransaction(input);

    expect(built.transaction.instructions).toHaveLength(1);
    expect(built.transaction.feePayer?.equals(sender)).toBe(true);
    expect(built.transaction.recentBlockhash).toBe(blockhash);
    expect(built.lastValidBlockHeight).toBe(12345);

    const instruction = built.transaction.instructions[0]!;
    expect(instruction.programId.equals(TOKEN_PROGRAM_ID)).toBe(true);
    expect(instruction.keys.at(-1)?.pubkey.equals(reference)).toBe(true);
    expect(instruction.keys.at(-1)?.isSigner).toBe(false);
    expect(instruction.keys.at(-1)?.isWritable).toBe(false);
    expect(serializeUnsignedTransaction(built.transaction).length).toBeGreaterThan(0);
  });

  it("optionally creates the recipient associated token account idempotently", async () => {
    const { input } = setup(true);
    const built = await buildTransferTransaction(input);

    expect(built.transaction.instructions).toHaveLength(2);
    expect(built.transaction.instructions[0]!.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true);
    expect(built.transaction.instructions[1]!.programId.equals(TOKEN_PROGRAM_ID)).toBe(true);
  });

  it("rejects zero before requesting a blockhash", async () => {
    const { input } = setup();
    await expect(buildTransferTransaction({ ...input, amountMinor: 0n })).rejects.toThrow("greater than zero");
  });
});
