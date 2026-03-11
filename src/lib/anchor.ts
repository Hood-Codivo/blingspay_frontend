import { AnchorProvider, Program, Idl, setProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/merchant_vault.json";

export const PROGRAM_ID = new PublicKey(
  "2vm8xz2TFAQH2N6ijqLNRt6J7bh8h7hy92hYM19Vy4SD",
);

export function getProgram(wallet: AnchorProvider["wallet"]) {
  const connection = new Connection("https://api.devnet.solana.com");

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  setProvider(provider);

  return new Program(idl as Idl, provider);
}
