import { useState } from "react";
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
import { merchantStats } from "@/lib/mock-data";
import {
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronRight,
  X,
} from "lucide-react";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tokens = [
  { symbol: "USDC", balance: 9820.5, icon: "💵" },
  { symbol: "USDT", balance: 2659.5, icon: "💰" },
  { symbol: "SOL",  balance: 0,       icon: "◎"  },
];

type Step = "review" | "confirm" | "processing" | "success";

export default function WithdrawModal({ open, onOpenChange }: WithdrawModalProps) {
  const [step, setStep] = useState<Step>("review");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [walletAddress, setWalletAddress] = useState("");

  const token = tokens.find((t) => t.symbol === selectedToken)!;
  const networkFee = 0.000005; // SOL
  const platformFee = token.balance * 0.001; // 0.1%
  const withdrawable = token.balance - platformFee;

  const handleConfirm = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2800);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStep("review"), 400);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <ArrowDownToLine className="h-4 w-4 text-primary" />
                  </div>
                  Withdraw Funds
                </DialogTitle>
              </DialogHeader>

              {/* Vault Balance Banner */}
              <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Vault Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${merchantStats.vaultBalance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-sm font-semibold text-warning">
                      ${merchantStats.pendingWithdrawals.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Token selection */}
              <div className="mb-5 space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Select Token
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {tokens.map((t) => (
                    <button
                      key={t.symbol}
                      onClick={() => setSelectedToken(t.symbol)}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        selectedToken === t.symbol
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-xs font-semibold">{t.symbol}</div>
                      <div className="text-xs opacity-70">${t.balance.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="mb-5 rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Fee Breakdown
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vault Balance</span>
                    <span className="text-foreground font-medium">
                      ${token.balance.toLocaleString()} {token.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee (SOL)</span>
                    <span className="text-foreground font-medium">~${networkFee.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (0.1%)</span>
                    <span className="text-destructive font-medium">-${platformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">You Receive</span>
                    <span className="font-bold text-primary text-base">
                      ${withdrawable.toFixed(2)} {token.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-6 space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Destination Wallet
                </Label>
                <Input
                  placeholder="Solana wallet address (e.g. 7xKp...)"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-secondary/30 border-border font-mono text-xs"
                />
              </div>

              <Button
                onClick={() => setStep("confirm")}
                disabled={!walletAddress}
                className="w-full gap-2 glow-primary"
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
              className="p-6"
            >
              <DialogHeader className="mb-6">
                <DialogTitle className="flex items-center gap-2 text-foreground">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </div>
                  Confirm Withdrawal
                </DialogTitle>
              </DialogHeader>

              <div className="mb-6 rounded-xl border border-warning/20 bg-warning/5 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">You will receive</p>
                <p className="text-4xl font-extrabold text-foreground">${withdrawable.toFixed(2)}</p>
                <p className="text-sm text-primary font-medium">{token.symbol}</p>
              </div>

              <div className="mb-6 rounded-xl border border-border bg-secondary/20 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="text-foreground font-mono text-xs">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-destructive">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-muted-foreground">~{networkFee} SOL</span>
                </div>
              </div>

              <p className="mb-5 text-xs text-muted-foreground text-center">
                This action is irreversible. Funds will be sent directly to your wallet.
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("review")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleConfirm} className="flex-1 gap-2 glow-primary">
                  <Wallet className="h-4 w-4" /> Confirm &amp; Withdraw
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
              <p className="text-lg font-semibold text-foreground">Processing Withdrawal</p>
              <p className="text-sm text-muted-foreground text-center">
                Submitting transaction to Solana network…
              </p>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/30"
              >
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-2xl font-bold text-foreground">Withdrawal Sent!</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  ${withdrawable.toFixed(2)} {token.symbol} is on its way to your wallet.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-lg border border-border bg-secondary/30 px-4 py-2 font-mono text-xs text-muted-foreground"
              >
                tx: 8Bx3…sG5r{Math.random().toString(36).slice(2, 6)}
              </motion.div>
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
