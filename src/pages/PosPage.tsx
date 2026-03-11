import { useState, useCallback, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  Check,
  Volume2,
  Loader2,
  XCircle,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import { getProgram } from "@/lib/anchor";
import api from "@/lib/api";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";

type PosState = "input" | "waiting" | "success" | "error";

interface PaymentResult {
  txSignature: string;
  amount: number;
  token: string;
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export default function PosPage() {
  const wallet = useWallet();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("SOL");
  const [state, setState] = useState<PosState>("input");

  // ── Vault state — derived exactly like Settings.tsx ──────────────────────
  const [vaultAddress, setVaultAddress] = useState<string | null>(null);
  const [vaultBalance, setVaultBalance] = useState<number>(0);
  const [loadingVault, setLoadingVault] = useState(true);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [solanaPayUrl, setSolanaPayUrl] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState("");

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preBalanceRef = useRef<number>(0);

  // ── 1. Derive vault exactly like Settings.tsx ─────────────────────────────
  useEffect(() => {
    const deriveVault = async () => {
      if (!wallet.publicKey) return;

      try {
        const program = getProgram(wallet);

        // Same two-step derivation as Settings.tsx
        const [merchantPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("merchant"), wallet.publicKey.toBuffer()],
          program.programId,
        );

        const [vaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), merchantPda.toBuffer()],
          program.programId,
        );

        const vaultStr = vaultPda.toBase58();
        setVaultAddress(vaultStr);

        console.log("Merchant PDA:", merchantPda.toBase58());
        console.log("Vault PDA:   ", vaultStr);

        // Fetch current balance using program.provider.connection like Settings.tsx
        const balance = await program.provider.connection.getBalance(vaultPda);
        setVaultBalance(balance / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error("Failed to derive vault:", err);
        toast({
          title: "Could not load vault",
          description: "Make sure you have completed merchant onboarding.",
          variant: "destructive",
        });
      } finally {
        setLoadingVault(false);
      }
    };

    deriveVault();
  }, [wallet.publicKey]);

  // ── 2. Generate QR ────────────────────────────────────────────────────────
  const generateQr = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0 || !vaultAddress) return;

    try {
      setState("waiting");

      const vaultPubKey = new PublicKey(vaultAddress);

      // Snapshot balance BEFORE so we can detect the increase
      const balance = await connection.getBalance(vaultPubKey);
      preBalanceRef.current = balance;

      const parsedAmount = parseFloat(amount);

      // ✅ Correct Solana Pay URL:
      // solana:<ADDRESS>?amount=<SOL_AMOUNT>&label=<NAME>&message=<MSG>
      // The address must be the RECIPIENT — which is your vault PDA
      const payUrl = [
        `solana:${vaultAddress}`,
        `?amount=${parsedAmount}`,
        `&label=BlingsPay`,
        `&message=Merchant+payment`,
      ].join("");

      setSolanaPayUrl(payUrl);
      console.log("✅ Solana Pay URL:", payUrl);

      const qr = await QRCode.toDataURL(payUrl, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });

      setQrDataUrl(qr);

      startPolling(vaultPubKey, parsedAmount);
    } catch (err) {
      console.error("QR generation error:", err);
      setState("error");
      setErrorMsg("Failed to generate QR code. Please try again.");
    }
  }, [amount, token, vaultAddress]);

  // ── 3. Poll Solana every 3s for payment ───────────────────────────────────
  const startPolling = useCallback(
    (vaultPubKey: PublicKey, expectedAmount: number) => {
      pollingRef.current = setInterval(async () => {
        try {
          const currentBalance = await connection.getBalance(vaultPubKey);
          const receivedLamports = currentBalance - preBalanceRef.current;
          const receivedSol = receivedLamports / LAMPORTS_PER_SOL;

          console.log(
            `Polling → received: ${receivedSol.toFixed(6)} SOL (expected: ${expectedAmount})`,
          );

          if (receivedSol >= expectedAmount * 0.98) {
            clearInterval(pollingRef.current!);

            // Get the tx signature just for display purposes
            const sigs = await connection.getSignaturesForAddress(vaultPubKey, {
              limit: 1,
            });
            const txSig = sigs[0]?.signature ?? "unknown";

            // ✅ DO NOT call /payments/record here
            // The Solana listener handles saving to the database automatically
            // Calling it here causes duplicates since both race to save the same tx

            setPaymentResult({
              txSignature: txSig,
              amount: receivedSol,
              token,
            });
            setState("success");
            playBeep();
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);

      // Auto-cancel after 5 minutes
      setTimeout(
        () => {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            setState((prev) => {
              if (prev === "waiting") {
                setErrorMsg("Payment timed out after 5 minutes.");
                return "error";
              }
              return prev;
            });
          }
        },
        5 * 60 * 1000,
      );
    },
    [token], // ← removed wallet.publicKey from deps since we no longer need it here
  );
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ── 4. Share the payment link ──────────────────────────────────────────────
  const handleShare = async () => {
    if (!solanaPayUrl) return;

    // Mobile: use native share sheet
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay with Solana",
          text: `Send ${amount} ${token} — tap to open in your Solana wallet`,
          url: solanaPayUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported — fall through to copy
      }
    }

    // Desktop: copy to clipboard
    await navigator.clipboard.writeText(solanaPayUrl);
    toast({
      title: "Payment link copied!",
      description: "Share this link so customers can open it in their wallet.",
    });
  };

  const handleCopyAddress = async () => {
    if (!vaultAddress) return;
    await navigator.clipboard.writeText(vaultAddress);
    toast({ title: "Vault address copied!" });
  };

  const playBeep = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      console.error("Failed to play beep");
    }
  };

  const reset = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setAmount("");
    setQrDataUrl(null);
    setSolanaPayUrl(null);
    setPaymentResult(null);
    setErrorMsg("");
    setState("input");
  };

  const shortenSig = (sig: string) =>
    sig.length > 20 ? `${sig.slice(0, 10)}...${sig.slice(-10)}` : sig;

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="glass-card rounded-2xl p-8 w-full max-w-md space-y-6 text-center animate-slide-up">
          {/* ══ INPUT ══ */}
          {state === "input" && (
            <>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  POS Terminal
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter amount — customer scans QR to pay
                </p>
              </div>

              {loadingVault ? (
                <div className="flex items-center justify-center gap-2 text-muted-foreground py-6">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading vault...</span>
                </div>
              ) : !vaultAddress ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  Vault not found. Please complete merchant onboarding first.
                </div>
              ) : (
                <>
                  {/* Vault info card */}
                  <div className="rounded-lg bg-secondary px-3 py-2 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">
                        Receiving Vault
                      </p>
                      <button
                        onClick={handleCopyAddress}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-mono text-foreground truncate">
                      {vaultAddress}
                    </p>
                    {/* <p className="text-xs text-muted-foreground mt-1">
                      Balance: {vaultBalance.toFixed(6)} SOL
                    </p> */}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                        ◎
                      </span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.000"
                        min="0"
                        step="0.001"
                        className="text-center text-3xl font-bold h-16 pl-10 bg-secondary border-border"
                      />
                    </div>

                    <Select value={token} onValueChange={setToken}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOL">SOL (Native)</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={generateQr}
                      className="w-full h-12 text-base gap-2"
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      <QrCode className="h-5 w-5" /> Generate QR Code
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ══ WAITING ══ */}
          {state === "waiting" && (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Charge Amount</p>
                <p className="text-3xl font-bold text-foreground">
                  {parseFloat(amount).toFixed(4)} {token}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scan with Phantom, Backpack, or any Solana wallet
                </p>
              </div>

              {qrDataUrl ? (
                <div className="mx-auto w-64 h-64 rounded-xl overflow-hidden border-4 border-border shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt="Solana Pay QR Code"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="mx-auto w-64 h-64 rounded-xl bg-secondary flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Share button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" /> Share Payment Link
              </Button>

              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  Waiting for payment on Solana devnet...
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Checking every 3s · Times out after 5 minutes
              </p>

              <Button variant="outline" onClick={reset} className="w-full">
                Cancel
              </Button>
            </div>
          )}

          {/* ══ SUCCESS ══ */}
          {state === "success" && paymentResult && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 glow-primary">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  Payment Received!
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {paymentResult.amount.toFixed(6)} {paymentResult.token}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  <p className="text-xs">Confirmed on Solana</p>
                </div>
              </div>

              <div className="rounded-lg bg-secondary p-3 space-y-2 text-left">
                <p className="text-xs text-muted-foreground">Transaction</p>
                <p className="text-xs font-mono text-foreground break-all">
                  {shortenSig(paymentResult.txSignature)}
                </p>
                <a
                  href={`https://explorer.solana.com/tx/${paymentResult.txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View on Solana Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <Button onClick={reset} className="w-full">
                New Transaction
              </Button>
            </div>
          )}

          {/* ══ ERROR ══ */}
          {state === "error" && (
            <div className="space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">
                  Something went wrong
                </p>
                <p className="text-sm text-muted-foreground mt-2">{errorMsg}</p>
              </div>
              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
