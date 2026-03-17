import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckoutModal from "@/components/CheckoutModal";
import {
  Zap,
  ArrowLeft,
  Code2,
  ShoppingBag,
  Globe,
  Monitor,
} from "lucide-react";

const themes = [
  {
    id: "ecommerce",
    label: "E-Commerce",
    icon: ShoppingBag,
    bg: "from-[#1a1a2e] to-[#16213e]",
    accent: "#e94560",
  },
  {
    id: "saas",
    label: "SaaS",
    icon: Monitor,
    bg: "from-[#0f0f23] to-[#1a1a3e]",
    accent: "#7c3aed",
  },
  {
    id: "agency",
    label: "Agency",
    icon: Globe,
    bg: "from-[#fefefe] to-[#f0f0f5]",
    accent: "#000",
  },
];

export default function CheckoutPreview() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("ecommerce");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-border/50 px-6 py-4 lg:px-16">
        <div className="relative z-20 flex items-center gap-2">
          <img
            src="/images/blingspay_logo_mint_green.png"
            alt="BlingsPay logo"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="text-xl font-bold text-foreground tracking-tight">
            Blings<span className="text-primary">Pay</span>
          </span>
        </div>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Checkout Widget Preview
          </h1>
          <p className="mt-2 text-muted-foreground">
            See how BlingsPay looks embedded on different websites.
          </p>
        </motion.div>

        <Tabs value={activeTheme} onValueChange={setActiveTheme}>
          <TabsList className="mb-8 bg-secondary">
            {themes.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="gap-2 data-[state=active]:bg-card"
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {themes.map((theme) => (
            <TabsContent key={theme.id} value={theme.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-border/50 shadow-2xl"
              >
                {/* Mock browser chrome */}
                <div className="flex items-center gap-2 border-b border-border/30 bg-card/80 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-destructive/50" />
                    <div className="h-3 w-3 rounded-full bg-warning/50" />
                    <div className="h-3 w-3 rounded-full bg-primary/50" />
                  </div>
                  <div className="ml-4 flex-1 rounded-md bg-secondary px-3 py-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {theme.id === "ecommerce"
                        ? "shop.acmestore.com/checkout"
                        : theme.id === "saas"
                          ? "app.cloudsync.io/billing"
                          : "studio.creativelab.co/invoice"}
                    </span>
                  </div>
                </div>

                {/* Mock site content */}
                <div
                  className={`bg-gradient-to-br ${theme.bg} p-8 sm:p-12 min-h-[420px]`}
                >
                  {theme.id === "ecommerce" && (
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                      <div className="flex-1 space-y-4">
                        <div className="h-4 w-24 rounded bg-white/10" />
                        <div className="h-8 w-64 rounded bg-white/15" />
                        <div className="h-3 w-48 rounded bg-white/8" />
                        <div className="mt-6 space-y-3">
                          <div className="flex justify-between rounded-lg bg-white/5 p-3">
                            <div className="flex gap-3 items-center">
                              <div className="h-12 w-12 rounded-lg bg-white/10" />
                              <div className="space-y-1">
                                <div className="h-3 w-28 rounded bg-white/15" />
                                <div className="h-2 w-16 rounded bg-white/8" />
                              </div>
                            </div>
                            <div className="h-3 w-12 rounded bg-white/15 self-center" />
                          </div>
                          <div className="flex justify-between rounded-lg bg-white/5 p-3">
                            <div className="flex gap-3 items-center">
                              <div className="h-12 w-12 rounded-lg bg-white/10" />
                              <div className="space-y-1">
                                <div className="h-3 w-20 rounded bg-white/15" />
                                <div className="h-2 w-14 rounded bg-white/8" />
                              </div>
                            </div>
                            <div className="h-3 w-12 rounded bg-white/15 self-center" />
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-72 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
                        <p className="text-white/60 text-sm">Order Summary</p>
                        <div className="space-y-2 text-sm text-white/80">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>$99.99</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                          </div>
                          <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2">
                            <span>Total</span>
                            <span>$99.99</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setCheckoutOpen(true)}
                          className="w-full gap-2 glow-primary"
                        >
                          <Zap className="h-4 w-4" /> Pay with Crypto
                        </Button>
                      </div>
                    </div>
                  )}

                  {theme.id === "saas" && (
                    <div className="max-w-md mx-auto text-center space-y-6">
                      <div className="h-5 w-32 mx-auto rounded bg-white/10" />
                      <div className="h-10 w-56 mx-auto rounded bg-white/15" />
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">
                        <div className="h-4 w-20 mx-auto rounded bg-white/10" />
                        <div className="text-4xl font-bold text-white/90">
                          $49<span className="text-lg text-white/40">/mo</span>
                        </div>
                        <div className="space-y-2 text-sm text-white/50 text-left">
                          {[
                            "Unlimited projects",
                            "Priority support",
                            "Custom domain",
                            "API access",
                          ].map((f) => (
                            <div key={f} className="flex gap-2 items-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => setCheckoutOpen(true)}
                          className="w-full gap-2 glow-primary mt-4"
                        >
                          <Zap className="h-4 w-4" /> Pay with Crypto
                        </Button>
                      </div>
                    </div>
                  )}

                  {theme.id === "agency" && (
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="space-y-2">
                        <div className="h-4 w-20 rounded bg-black/10" />
                        <div className="h-8 w-48 rounded bg-black/15" />
                        <div className="h-3 w-64 rounded bg-black/8" />
                      </div>
                      <div className="rounded-2xl border border-black/10 bg-white p-6 space-y-4 shadow-lg">
                        <div className="flex justify-between text-sm text-black/60">
                          <span>Brand Identity Package</span>
                          <span className="font-semibold text-black">
                            $2,500.00
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-black/60">
                          <span>Website Design</span>
                          <span className="font-semibold text-black">
                            $4,000.00
                          </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold text-black">
                          <span>Total Due</span>
                          <span>$6,500.00</span>
                        </div>
                        <Button
                          onClick={() => setCheckoutOpen(true)}
                          className="w-full gap-2 glow-primary"
                        >
                          <Zap className="h-4 w-4" /> Pay with Crypto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Integration code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" /> Integration Code
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card rounded-xl p-6">
              <p className="text-sm font-semibold text-foreground mb-3">
                React Component
              </p>
              <pre className="text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">
                {`import { CryptoCheckout } from "@BlingsPay/react"

<CryptoCheckout
  apiKey="pk_live_xxx"
  amount={99.99}
  currency="USDC"
  onSuccess={(receipt) => {
    console.log("Paid!", receipt.txSignature)
  }}
/>`}
              </pre>
            </div>
            <div className="glass-card rounded-xl p-6">
              <p className="text-sm font-semibold text-foreground mb-3">
                Script Tag (Any Website)
              </p>
              <pre className="text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">
                {`<script src="https://cdn.BlingsPay.io/checkout.js"></script>
<div id="crypto-checkout"></div>
<script>
  BlingsPayCheckout.mount({
    apiKey: "pk_live_xxx",
    amount: 99.99,
    currency: "USDC",
    onSuccess: (receipt) => {
      console.log("Paid!", receipt.txSignature)
    }
  })
</script>`}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
}
