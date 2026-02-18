import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Building2,
  Globe,
  Key,
  Check,
  Copy,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Step = 1 | 2 | 3 | 4;

const stepInfo = [
  { num: 1, title: "Business Details", icon: Building2 },
  { num: 2, title: "Configure Payments", icon: Wallet },
  { num: 3, title: "Security", icon: ShieldCheck },
  { num: 4, title: "Your API Keys", icon: Key },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    email: "",
    acceptedTokens: ["USDC"] as string[],
    webhookUrl: "",
  });

  const progress = (step / 4) * 100;

  const toggleToken = (t: string) => {
    setForm((f) => ({
      ...f,
      acceptedTokens: f.acceptedTokens.includes(t)
        ? f.acceptedTokens.filter((x) => x !== t)
        : [...f.acceptedTokens, t],
    }));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const generatedKeys = {
    pk: "pk_live_4a8f2c1b9e7d3f6a0b5c8d2e1f4a7b9c",
    sk: "sk_live_9c7b4a1f2e8d3c6b0a5f8d2e1c4b7a9f",
  };

  const slideVariant = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      {/* Background orbs */}
      <motion.div
        className="absolute top-20 left-[10%] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(160, 84%, 39%)15 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-[10%] w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(174, 72%, 40%)15 0%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center gap-2 px-6 py-5 lg:px-16">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">
          Vault<span className="text-primary">Pay</span>
        </span>
      </nav>

      {/* Main */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {stepInfo.map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      step >= s.num
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">{s.title}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-1" />
          </div>

          <Card className="glass-card border-border/50">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="s1" {...slideVariant} transition={{ duration: 0.3 }} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Tell us about your business</h2>
                      <p className="mt-1 text-sm text-muted-foreground">We'll use this to set up your merchant vault.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Business Name</label>
                        <Input
                          placeholder="Acme Store"
                          value={form.businessName}
                          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Website</label>
                        <Input
                          placeholder="https://acme.store"
                          value={form.website}
                          onChange={(e) => setForm({ ...form, website: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                        <Input
                          type="email"
                          placeholder="you@acme.store"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => setStep(2)}
                      className="w-full gap-2"
                      disabled={!form.businessName || !form.email}
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="s2" {...slideVariant} transition={{ duration: 0.3 }} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Configure accepted tokens</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Choose which tokens your customers can pay with.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { symbol: "SOL", name: "Solana", icon: "◎" },
                        { symbol: "USDC", name: "USD Coin", icon: "$" },
                        { symbol: "USDT", name: "Tether", icon: "₮" },
                      ].map((t) => (
                        <button
                          key={t.symbol}
                          onClick={() => toggleToken(t.symbol)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-4 transition-all ${
                            form.acceptedTokens.includes(t.symbol)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg font-bold text-foreground">
                            {t.icon}
                          </span>
                          <div className="text-left">
                            <p className="font-medium text-foreground">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.symbol}</p>
                          </div>
                          {form.acceptedTokens.includes(t.symbol) && (
                            <Check className="ml-auto h-5 w-5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Webhook URL (optional)</label>
                      <Input
                        placeholder="https://acme.store/api/webhook"
                        value={form.webhookUrl}
                        onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1 gap-2"
                        disabled={form.acceptedTokens.length === 0}
                      >
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="s3" {...slideVariant} transition={{ duration: 0.3 }} className="space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Security settings</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Your vault is secured on-chain. Review your setup.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Non-custodial vault (PDA)", status: true },
                        { label: "Automatic ATA creation", status: true },
                        { label: "1% platform fee", status: true },
                        { label: "Instant settlement to wallet", status: true },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border p-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                      </Button>
                      <Button onClick={() => setStep(4)} className="flex-1 gap-2">
                        Generate Keys <Key className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="s4" {...slideVariant} transition={{ duration: 0.3 }} className="space-y-5">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 glow-primary"
                      >
                        <Check className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-foreground">You're all set!</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Here are your API keys. Keep your secret key safe.</p>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Public Key", value: generatedKeys.pk },
                        { label: "Secret Key", value: generatedKeys.sk },
                      ].map((k) => (
                        <div key={k.label} className="rounded-xl border border-border p-4">
                          <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs font-mono text-foreground break-all">{k.value}</code>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0"
                              onClick={() => copyKey(k.value)}
                            >
                              {copied === k.value ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full gap-2 glow-primary"
                    >
                      Go to Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
