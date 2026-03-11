import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Check, Loader2, Wallet, ArrowRight } from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount?: number;
}

type Step = "select" | "confirm" | "processing" | "success";

const tokens = [
  { symbol: "SOL", name: "Solana", rate: 148.5, icon: "◎" },
  { symbol: "USDC", name: "USD Coin", rate: 1.0, icon: "$" },
  { symbol: "USDT", name: "Tether", rate: 1.0, icon: "₮" },
];

export default function CheckoutModal({
  open,
  onOpenChange,
  amount = 99.99,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedToken, setSelectedToken] = useState(tokens[1]);

  const tokenAmount =
    selectedToken.symbol === "SOL"
      ? (amount / selectedToken.rate).toFixed(4)
      : amount.toFixed(2);
  const platformFee = (amount * 0.01).toFixed(2);
  const networkFee =
    selectedToken.symbol === "SOL" ? "~0.000005 SOL" : "~0.00025 SOL";

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2500);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => setStep("select"), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            BlingsPay Checkout
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl bg-secondary p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount Due</p>
              <p className="text-3xl font-bold text-foreground">
                ${amount.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pay with</p>
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-all ${
                    selectedToken.symbol === token.symbol
                      ? "border-primary bg-primary/5 glow-primary"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                    {token.icon}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {token.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {token.symbol}
                    </p>
                  </div>
                  {selectedToken.symbol === token.symbol && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <Button onClick={() => setStep("confirm")} className="w-full gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-3 rounded-xl bg-secondary p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-foreground">
                  {tokenAmount} {selectedToken.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform fee (1%)</span>
                <span className="text-foreground">${platformFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network fee</span>
                <span className="text-foreground">{networkFee}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-medium">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">
                  ${(amount + parseFloat(platformFee)).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handlePay} className="flex-1 gap-2">
                <Wallet className="h-4 w-4" /> Pay Now
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-medium text-foreground">
                Confirming Transaction
              </p>
              <p className="text-sm text-muted-foreground">
                Waiting for blockchain confirmation...
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 glow-primary">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                Payment Successful!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {tokenAmount} {selectedToken.symbol} sent
              </p>
            </div>
            <div className="w-full rounded-lg bg-secondary p-3 text-center">
              <p className="text-xs text-muted-foreground">Transaction ID</p>
              <p className="text-xs font-mono text-foreground mt-0.5">
                5Xk9qR7m...vN8kL2p
              </p>
            </div>
            <Button onClick={handleClose} variant="outline" className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
