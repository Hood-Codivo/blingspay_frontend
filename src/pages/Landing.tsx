import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HeroParticles from "@/components/HeroParticles";
import {
  Zap,
  ArrowRight,
  Shield,
  Globe,
  BarChart3,
  Code2,
  CreditCard,
  Wallet,
  Check,
} from "lucide-react";

const floatingOrbs = [
  { size: 300, x: "10%", y: "20%", color: "hsl(160, 84%, 39%)", delay: 0 },
  { size: 200, x: "70%", y: "10%", color: "hsl(174, 72%, 40%)", delay: 1 },
  { size: 250, x: "80%", y: "60%", color: "hsl(199, 89%, 48%)", delay: 2 },
  { size: 180, x: "20%", y: "70%", color: "hsl(280, 65%, 60%)", delay: 0.5 },
  { size: 150, x: "50%", y: "40%", color: "hsl(38, 92%, 50%)", delay: 1.5 },
];

const features = [
  { icon: Shield, title: "Non-Custodial", desc: "Funds go directly to your vault. No middlemen. No trust required." },
  { icon: Globe, title: "Global Payments", desc: "Accept crypto from anyone, anywhere. No borders, no limits." },
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Track revenue, fees, and transactions with a live dashboard." },
  { icon: Code2, title: "Developer First", desc: "Drop-in React component or simple script tag. Integrate in minutes." },
  { icon: CreditCard, title: "Multi-Token", desc: "Accept SOL, USDC, USDT with automatic token detection." },
  { icon: Wallet, title: "Instant Settlement", desc: "No holding periods. Withdraw to your wallet whenever you want." },
];

const stats = [
  { value: "$2.4M+", label: "Volume Processed" },
  { value: "1,200+", label: "Merchants" },
  { value: "99.9%", label: "Uptime" },
  { value: "<1s", label: "Settlement" },
];

export default function Landing() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Animated gradient orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}20 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 30 * (i % 2 === 0 ? 1 : -1), -20, 0],
            y: [0, -20, 25 * (i % 2 === 0 ? -1 : 1), 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* Solana particle canvas */}
      <HeroParticles />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-16"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Vault<span className="text-primary">Pay</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
          <Link to="/onboarding">
            <Button size="sm" className="gap-2">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center px-6 pt-20 pb-28 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Built on Solana · Sub-second finality
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          Accept Crypto{" "}
          <span className="gradient-text">Payments</span>
          <br />
          Like It's Stripe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
        >
          A plug-and-play checkout for Solana. Drop in a component, accept SOL & stablecoins,
          and get instant settlement — no blockchain knowledge required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/onboarding">
            <Button size="lg" className="gap-2 text-base px-8 h-12 glow-primary">
              Start Accepting Payments <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/checkout-preview">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12">
              <Code2 className="h-4 w-4" /> View Widget Demo
            </Button>
          </Link>
        </motion.div>

        {/* Code snippet preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            transform: `perspective(1000px) rotateY(${(mousePos.x - 0.5) * 4}deg) rotateX(${(0.5 - mousePos.y) * 4}deg)`,
          }}
          className="mt-16 w-full max-w-2xl rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl p-6 text-left shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-warning/60" />
            <div className="h-3 w-3 rounded-full bg-primary/60" />
            <span className="ml-3 text-xs text-muted-foreground font-mono">checkout.tsx</span>
          </div>
          <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
            <code>
              <span className="text-muted-foreground">{"// "}</span>
              <span className="text-primary/70">Add payments in 3 lines</span>
              {"\n"}
              <span className="text-accent">{"import "}</span>
              <span className="text-foreground">{"{ CryptoCheckout } "}</span>
              <span className="text-accent">from </span>
              <span className="text-primary">"@vaultpay/react"</span>
              {"\n\n"}
              <span className="text-accent">{"<"}</span>
              <span className="text-foreground">CryptoCheckout</span>
              {"\n"}
              {"  "}
              <span className="text-warning">apiKey</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-primary">"pk_live_xxx"</span>
              {"\n"}
              {"  "}
              <span className="text-warning">amount</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-foreground">{"{99.99}"}</span>
              {"\n"}
              {"  "}
              <span className="text-warning">currency</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-primary">"USDC"</span>
              {"\n"}
              <span className="text-accent">{"/>"}</span>
            </code>
          </pre>
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative z-10 border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl font-bold gradient-text">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to accept <span className="gradient-text">crypto</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Built for merchants who want the power of blockchain without the complexity.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group glass-card rounded-2xl p-6 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-12 text-center"
        >
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
          <h2 className="relative text-3xl font-bold text-foreground sm:text-4xl">
            Ready to go <span className="gradient-text">trustless</span>?
          </h2>
          <p className="relative mt-4 text-muted-foreground max-w-lg mx-auto">
            Set up your merchant vault in under 5 minutes. No blockchain expertise needed.
          </p>
          <Link to="/onboarding" className="relative inline-block mt-8">
            <Button size="lg" className="gap-2 px-10 h-12 text-base glow-primary">
              Create Merchant Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Vault<span className="text-primary">Pay</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 VaultPay. Decentralized payments for everyone.</p>
        </div>
      </footer>
    </div>
  );
}
