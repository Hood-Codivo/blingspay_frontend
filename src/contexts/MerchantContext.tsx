import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useNavigate } from "react-router-dom";
import { getProgram } from "@/lib/anchor";

type MerchantContextType = {
  merchantPda: PublicKey | null;
  merchantAccount: string | null;
  isMerchant: boolean;
  loading: boolean;
  refreshMerchant: () => Promise<void>;
};

const MerchantContext = createContext<MerchantContextType | null>(null);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const { publicKey, wallet } = useWallet();
  const navigate = useNavigate();

  const [merchantPda, setMerchantPda] = useState<PublicKey | null>(null);
  const [merchantAccount, setMerchantAccount] = useState<string | null>(null);
  const [isMerchant, setIsMerchant] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkMerchant = async () => {
    if (!publicKey || !wallet) return;

    setLoading(true);

    try {
      const program = getProgram(wallet.adapter);

      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("merchant"), publicKey.toBuffer()],
        program.programId,
      );

      const account = await program.account.merchant.fetchNullable(pda);

      setMerchantPda(pda);
      setMerchantAccount(account);
      setIsMerchant(!!account);
    } catch (err) {
      console.error("Merchant check failed:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!publicKey) {
      setMerchantPda(null);
      setMerchantAccount(null);
      setIsMerchant(false);
      return;
    }

    checkMerchant();
  }, [publicKey]);

  return (
    <MerchantContext.Provider
      value={{
        merchantPda,
        merchantAccount,
        isMerchant,
        loading,
        refreshMerchant: checkMerchant,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error("useMerchant must be used inside MerchantProvider");
  }
  return context;
}
