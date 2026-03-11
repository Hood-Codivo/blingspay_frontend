import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { getProgram } from "@/lib/anchor";
import { BN } from "@coral-xyz/anchor";
import {
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "review" | "confirm" | "processing" | "success";

export default function WithdrawModal({
  open,
  onOpenChange,
}: WithdrawModalProps) {
  const wallet = useWallet();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("review");
  const [amountSol, setAmountSol] = useState("");
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  const fetchVaultBalance = async () => {
    if (!wallet.publicKey) return;
    setLoadingBalance(true);
    setVaultBalance(null);

    try {
      const program = getProgram(wallet);

      const [merchantPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("merchant"), wallet.publicKey.toBuffer()],
        program.programId,
      );
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), merchantPda.toBuffer()],
        program.programId,
      );

      console.log("Fetching balance for vault:", vaultPda.toBase58());
      const balance = await program.provider.connection.getBalance(vaultPda);
      setVaultBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Failed to fetch vault balance:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  // ✅ Key fix: useEffect watches BOTH open state and wallet.publicKey
  // This ensures we fetch whenever the modal opens and wallet is ready
  useEffect(() => {
    if (open && wallet.publicKey) {
      fetchVaultBalance();
    }
  }, [open, wallet.publicKey]);

  const handleWithdraw = async () => {
    if (!wallet.publicKey || !amountSol) return;
    setStep("processing");

    try {
      const program = getProgram(wallet);

      const [merchantPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("merchant"), wallet.publicKey.toBuffer()],
        program.programId,
      );
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), merchantPda.toBuffer()],
        program.programId,
      );

      const lamports = Math.floor(parseFloat(amountSol) * LAMPORTS_PER_SOL);

      const sig = await program.methods
        .withdrawSol(new BN(lamports))
        .accounts({
          authority: wallet.publicKey,
          merchant: merchantPda,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setTxSignature(sig);
      setStep("success");
      await fetchVaultBalance();
    } catch (err: unknown) {
      console.error("Withdraw failed:", err);
      toast({
        title: "Withdrawal failed",
        description: err instanceof Error ? err.message : "Transaction failed",
        variant: "destructive",
      });
      setStep("review");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("review");
      setAmountSol("");
      setTxSignature(null);
      setVaultBalance(null);
    }, 400);
  };

  const parsedAmount = parseFloat(amountSol) || 0;
  const networkFee = 0.000005;
  const isAmountValid =
    parsedAmount > 0 &&
    vaultBalance !== null &&
    parsedAmount <= vaultBalance - networkFee;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6 space-y-5"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <ArrowDownToLine className="h-4 w-4 text-primary" />
                  </div>
                  Withdraw from Vault
                </DialogTitle>
              </DialogHeader>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">
                    Available in Vault
                  </p>
                  <button
                    onClick={fetchVaultBalance}
                    disabled={loadingBalance}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${loadingBalance ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>
                {loadingBalance ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Fetching balance...</span>
                  </div>
                ) : vaultBalance !== null ? (
                  <p className="text-2xl font-bold text-foreground">
                    {vaultBalance.toFixed(6)} SOL
                  </p>
                ) : (
                  <button
                    onClick={fetchVaultBalance}
                    className="text-sm text-primary hover:underline"
                  >
                    Failed to load — tap to retry
                  </button>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Funds sent to your connected wallet
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Amount (SOL)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ◎
                  </span>
                  <Input
                    type="number"
                    placeholder="0.000000"
                    min="0"
                    step="0.001"
                    value={amountSol}
                    onChange={(e) => setAmountSol(e.target.value)}
                    className="pl-8 bg-secondary border-border"
                  />
                </div>
                {vaultBalance !== null && vaultBalance > 0 && (
                  <button
                    onClick={() =>
                      setAmountSol(Math.max(0, vaultBalance - 0.001).toFixed(6))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Max: {Math.max(0, vaultBalance - 0.001).toFixed(6)} SOL
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Destination Wallet
                </Label>
                <div className="rounded-lg bg-secondary border border-border px-3 py-2">
                  <p className="text-xs font-mono text-foreground break-all">
                    {wallet.publicKey?.toBase58() ?? "Connect wallet"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your connected wallet (vault authority)
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You withdraw</span>
                  <span className="text-foreground font-medium">
                    {parsedAmount.toFixed(6)} SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network fee</span>
                  <span className="text-muted-foreground">
                    ~{networkFee} SOL
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">
                    You receive
                  </span>
                  <span className="font-bold text-primary">
                    ~{Math.max(0, parsedAmount - networkFee).toFixed(6)} SOL
                  </span>
                </div>
              </div>

              {!isAmountValid && parsedAmount > 0 && vaultBalance !== null && (
                <p className="text-xs text-destructive">
                  Amount exceeds vault balance ({vaultBalance.toFixed(6)} SOL).
                </p>
              )}

              <Button
                onClick={() => setStep("confirm")}
                disabled={!isAmountValid || loadingBalance}
                className="w-full gap-2"
              >
                Review Withdrawal <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-5"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  Confirm Withdrawal
                </DialogTitle>
              </DialogHeader>
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  You will receive approximately
                </p>
                <p className="text-4xl font-extrabold text-foreground">
                  {parsedAmount.toFixed(6)}
                </p>
                <p className="text-sm text-primary font-medium">SOL</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To wallet</span>
                  <span className="text-foreground font-mono text-xs">
                    {wallet.publicKey?.toBase58().slice(0, 8)}...
                    {wallet.publicKey?.toBase58().slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network fee</span>
                  <span className="text-muted-foreground">
                    ~{networkFee} SOL
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This calls your on-chain{" "}
                <code className="bg-secondary px-1 rounded">withdraw_sol</code>{" "}
                instruction. Irreversible.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("review")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleWithdraw} className="flex-1 gap-2">
                  <Wallet className="h-4 w-4" /> Confirm & Withdraw
                </Button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-16 px-6"
            >
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20 animate-pulse" />
                <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-primary animate-spin" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Processing Withdrawal
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Approve the transaction in Phantom...
              </p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/30"
              >
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-2xl font-bold text-foreground">
                  Withdrawal Sent!
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {parsedAmount.toFixed(6)} SOL sent to your wallet.
                </p>
              </motion.div>
              {txSignature && (
                <motion.a
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/30 px-4 py-2 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {txSignature.slice(0, 12)}...{txSignature.slice(-8)}
                  <ExternalLink className="h-3 w-3" />
                </motion.a>
              )}
              <Button onClick={handleClose} className="mt-2 w-full">
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
