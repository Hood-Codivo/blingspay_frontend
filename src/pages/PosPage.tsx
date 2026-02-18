import { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Check, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PosState = "input" | "waiting" | "success";

export default function PosPage() {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDC");
  const [state, setState] = useState<PosState>("input");

  const generateQr = useCallback(() => {
    if (!amount || parseFloat(amount) <= 0) return;
    setState("waiting");
    // Simulate payment confirmation
    setTimeout(() => {
      setState("success");
      // Play a beep
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.frequency.value = 800;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch {}
    }, 4000);
  }, [amount]);

  const reset = () => {
    setAmount("");
    setState("input");
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md space-y-6 text-center animate-slide-up">
          {state === "input" && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-foreground">POS Terminal</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter the amount to charge</p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-center text-3xl font-bold h-16 pl-10 bg-secondary border-border"
                  />
                </div>
                <Select value={token} onValueChange={setToken}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={generateQr} className="w-full h-12 text-base gap-2" disabled={!amount}>
                  <QrCode className="h-5 w-5" /> Generate QR Code
                </Button>
              </div>
            </>
          )}

          {state === "waiting" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <p className="text-sm text-muted-foreground">Charge Amount</p>
                <p className="text-3xl font-bold text-foreground">${parseFloat(amount).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-1">{token}</p>
              </div>
              {/* Mock QR Code */}
              <div className="mx-auto w-48 h-48 rounded-xl bg-foreground p-3">
                <div className="w-full h-full rounded-lg bg-background flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                <p className="text-sm text-muted-foreground">Waiting for payment...</p>
              </div>
              <Button variant="outline" onClick={reset}>Cancel</Button>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-6 animate-fade-in">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 glow-primary">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">Payment Received!</p>
                <p className="text-2xl font-bold text-primary mt-1">${parseFloat(amount).toFixed(2)}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  <p className="text-xs">Notification sent</p>
                </div>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground">Transaction</p>
                <p className="text-xs font-mono text-foreground">5Xk9qR7m...vN8kL2p</p>
              </div>
              <Button onClick={reset} className="w-full">New Transaction</Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
