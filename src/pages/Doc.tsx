import { Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

type PaymentState =
  | "idle"
  | "connecting"
  | "awaiting"
  | "confirming"
  | "success"
  | "error";

type CalloutType = "info" | "warning" | "success" | "danger";

type NavItem = {
  id: string;
  label: string;
};

type PropsRow = [string, string, string, "Yes" | "No", string];

type CodeBlockProps = {
  code: string;
  language?: string;
  filename?: string;
};

type InlineCodeProps = {
  children: React.ReactNode;
};

type PropsTableProps = {
  rows: PropsRow[];
};

type CalloutProps = {
  type?: CalloutType;
  children: React.ReactNode;
};

type HeadingProps = {
  children: React.ReactNode;
  id?: string;
};

type StateBadgeProps = {
  state: PaymentState;
};

// ─── Syntax Highlighter (lightweight, no deps) ────────────────────────────────
function highlight(code: string) {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(\/\/.*)/g, '<span class="text-slate-500 italic">$1</span>')
    .replace(
      /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span class="text-primary">$1</span>',
    )
    .replace(
      /\b(import|export|from|const|let|var|function|return|default|async|await|new|if|else|try|catch|type|interface|extends|implements|typeof|class)\b/g,
      '<span class="text-primary font-semibold">$1</span>',
    )
    .replace(
      /\b(true|false|null|undefined|void)\b/g,
      '<span class="text-orange-400">$1</span>',
    )
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-amber-400">$1</span>')
    .replace(
      /\b(CryptoCheckout|blingsPayReceipt|CryptoCheckoutProps|PaymentState|ConnectionProvider|WalletProvider|WalletModalProvider)\b/g,
      '<span class="text-cyan-400 font-medium">$1</span>',
    );
}

function CodeBlock({ code, language = "tsx", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/60 my-5 shadow-xl shadow-black/30">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-slate-400 font-mono">
              {filename}
            </span>
          </div>
          <button
            onClick={copy}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-mono"
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      )}
      {!filename && (
        <div className="flex justify-end px-4 py-2 bg-slate-800/50 border-b border-slate-700/40">
          <button
            onClick={copy}
            className="text-xs text-slate-500 hover:text-white transition-colors font-mono"
          >
            {copied ? "✓ copied" : "copy"}
          </button>
        </div>
      )}
      <pre className="p-5 overflow-x-auto bg-slate-900/80 text-sm leading-relaxed">
        <code
          className="font-mono text-slate-300"
          dangerouslySetInnerHTML={{ __html: highlight(code) }}
        />
      </pre>
    </div>
  );
}

// ─── Inline Code ──────────────────────────────────────────────────────────────
function IC({ children }: InlineCodeProps) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-primary font-mono text-sm border border-slate-700/50">
      {children}
    </code>
  );
}

// ─── Props Table ──────────────────────────────────────────────────────────────
function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50 my-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/50 bg-slate-800/60">
            {["Prop", "Type", "Default", "Required", "Description"].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([prop, type, def, req, desc], i) => (
            <tr
              key={prop}
              className={`border-b border-slate-700/30 ${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"} hover:bg-slate-700/20 transition-colors`}
            >
              <td className="px-4 py-3 font-mono text-primary text-xs">
                {prop}
              </td>
              <td className="px-4 py-3 font-mono text-primary text-xs">
                {type}
              </td>
              <td className="px-4 py-3 font-mono text-amber-400 text-xs">
                {def}
              </td>
              <td className="px-4 py-3">
                {req === "Yes" ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/30 font-medium">
                    required
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700/50 text-slate-400 border border-slate-600/30">
                    optional
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-300 text-xs leading-relaxed">
                {desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Callout ─────────────────────────────────────────────────────────────────
function Callout({ type = "info", children }: CalloutProps) {
  const styles = {
    info: {
      bg: "bg-blue-950/40",
      border: "border-blue-500/30",
      icon: "ℹ",
      text: "text-blue-300",
    },
    warning: {
      bg: "bg-amber-950/40",
      border: "border-amber-500/30",
      icon: "⚠",
      text: "text-amber-300",
    },
    success: {
      bg: "bg-success/10",
      border: "border-success/30",
      icon: "✓",
      text: "text-success",
    },
    danger: {
      bg: "bg-red-950/40",
      border: "border-red-500/30",
      icon: "✕",
      text: "text-red-300",
    },
  };
  const s = styles[type];
  return (
    <div
      className={`flex gap-3 p-4 rounded-xl border ${s.bg} ${s.border} my-4`}
    >
      <span className={`text-base mt-0.5 ${s.text}`}>{s.icon}</span>
      <div className={`text-sm leading-relaxed ${s.text}`}>{children}</div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function H2({ children, id }: HeadingProps) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-white mt-12 mb-4 flex items-center gap-3 scroll-mt-24"
    >
      <span className="w-1 h-7 rounded-full bg-gradient-to-b from-primary to-accent flex-shrink-0" />
      {children}
    </h2>
  );
}
function H3({ children }: HeadingProps) {
  return (
    <h3 className="text-lg font-semibold text-slate-200 mt-8 mb-3">
      {children}
    </h3>
  );
}

// ─── State badge ──────────────────────────────────────────────────────────────
function StateBadge({ state }: StateBadgeProps) {
  const colors: Record<PaymentState, string> = {
    idle: "bg-slate-700 text-slate-300",
    connecting: "bg-blue-900/60 text-blue-300 border border-blue-500/30",
    awaiting: "bg-amber-900/60 text-amber-300 border border-amber-500/30",
    confirming: "bg-primary/10 text-primary border border-primary/30",
    success: "bg-success/10 text-success border border-success/30",
    error: "bg-red-900/60 text-red-300 border border-red-500/30",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-medium ${colors[state]}`}
    >
      "{state}"
    </span>
  );
}

// ─── Sidebar nav ─────────────────────────────────────────────────────────────
const NAV: NavItem[] = [
  { id: "overview", label: "Overview" },
  { id: "installation", label: "Installation" },
  { id: "setup", label: "Wallet Setup" },
  { id: "quickstart", label: "Quick Start" },
  { id: "api", label: "API Reference" },
  { id: "receipt", label: "Receipt Object" },
  { id: "states", label: "Payment States" },
  { id: "examples", label: "Examples" },
  { id: "nextjs", label: "Next.js" },
  { id: "typescript", label: "TypeScript" },
  { id: "verification", label: "Backend Verify" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "security", label: "Security" },
];

const PAYMENT_STATES: Array<{
  state: PaymentState;
  arrow: string | null;
  desc: string;
}> = [
  {
    state: "idle",
    arrow: null,
    desc: "Ready. Pay button is active.",
  },
  {
    state: "connecting",
    arrow: "→",
    desc: "No wallet detected — Solana wallet selector modal has opened.",
  },
  {
    state: "awaiting",
    arrow: "→",
    desc: "Calling the BlingsPay API to create a checkout session and resolve your vault address.",
  },
  {
    state: "confirming",
    arrow: "→",
    desc: "Transaction signed and submitted to Solana. Awaiting block confirmation.",
  },
  {
    state: "success",
    arrow: "→",
    desc: "On-chain confirmed. Receipt displayed. onSuccess callback fires.",
  },
  {
    state: "error",
    arrow: "→ or error",
    desc: "Any failure (user rejection, network error, amount mismatch). onError fires.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DOCS PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function BlingspayDocs() {
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="min-h-screen bg-black text-slate-200 font-sans"
      style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { font-family: 'IBM Plex Sans', system-ui, sans-serif; }
        code, pre, .font-mono { font-family: 'IBM Plex Mono', monospace !important; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .gradient-text { background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent))); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glow { box-shadow: 0 0 40px hsl(var(--primary) / 0.16); }
      `}</style>

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <Link to="/">
              <span className="font-bold text-white text-base tracking-tight">
                BlingsPay
              </span>
            </Link>
            <span className="hidden sm:block text-slate-600">·</span>
            <span className="hidden sm:block text-sm text-slate-400">
              React SDK Docs
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-mono">
              v0.1.1
            </span>
            <a
              href="https://www.npmjs.com/package/@blingspay/react"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-700/50 hover:border-slate-600 bg-slate-800/50"
            >
              npm ↗
            </a>
            <button
              className="sm:hidden text-slate-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-16 px-6 overflow-y-auto">
          <nav className="space-y-1">
            {NAV.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm transition-colors ${active === id ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-white"}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* ── Sidebar ── */}
        <aside className="hidden sm:flex flex-col w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-4 border-r border-slate-800/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 px-3">
            Documentation
          </p>
          <nav className="space-y-0.5">
            {NAV.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  active === id
                    ? "bg-primary/10 text-primary font-medium border-l-2 border-primary pl-[10px]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main
          ref={contentRef}
          className="flex-1 min-w-0 px-6 sm:px-10 py-10 max-w-3xl"
        >
          {/* ══ OVERVIEW ══ */}
          <section id="overview" className="scroll-mt-24">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-mono">
                  @blingspay/react
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700/50 font-mono">
                  MIT License
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                <span className="gradient-text">BlingsPay</span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                Drop-in Solana crypto checkout for React. Accept SOL, USDC, and
                USDT in minutes.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              {[
                {
                  icon: "⚡",
                  title: "One Component",
                  desc: "Single <CryptoCheckout /> handles the entire payment flow",
                },
                {
                  icon: "🔗",
                  title: "On-Chain",
                  desc: "Transactions submitted directly to Solana — no custodians",
                },
                {
                  icon: "🎨",
                  title: "Themeable",
                  desc: "Dark & light themes, className override for full control",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="font-semibold text-white text-sm mb-1">
                    {title}
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    {desc}
                  </div>
                </div>
              ))}
            </div>

            <H3>How it works</H3>
            <div className="space-y-2 mb-6">
              {[
                [
                  "1",
                  "Customer clicks Pay",
                  "The checkout card is rendered in your React app",
                ],
                [
                  "2",
                  "Wallet connect",
                  "If no wallet, the Solana wallet selector modal opens",
                ],
                [
                  "3",
                  "Session created",
                  "BlingsPay API resolves your merchant vault address",
                ],
                [
                  "4",
                  "Transaction signed",
                  "Solana tx built and sent to customer's wallet",
                ],
                [
                  "5",
                  "Confirmed on-chain",
                  "Network confirms the block; receipt emitted",
                ],
                [
                  "6",
                  "onSuccess fires",
                  "Your callback receives the txSignature and receipt",
                ],
              ].map(([n, title, sub]) => (
                <div
                  key={n}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {n}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">
                      {title}
                    </span>
                    <span className="text-sm text-slate-400"> — {sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ INSTALLATION ══ */}
          <section id="installation" className="scroll-mt-24">
            <H2 id="installation">Installation</H2>
            <CodeBlock
              filename="terminal"
              code={`npm install @blingspay/react

# or
yarn add @blingspay/react

# or
pnpm add @blingspay/react`}
            />

            <H3>Peer Dependencies</H3>
            <p className="text-slate-400 text-sm mb-3">
              These are installed automatically. If you already use Solana
              Wallet Adapter, they'll be shared.
            </p>
            <CodeBlock
              code={`@solana/wallet-adapter-react         ^0.15.39
@solana/wallet-adapter-react-ui      ^0.9.39
@solana/wallet-adapter-wallets       ^0.19.37
@solana/web3.js                      ^1.98.4`}
            />
            <Callout type="info">
              If your project already uses Solana Wallet Adapter,{" "}
              <IC>@blingspay/react</IC> will reuse your existing context — no
              duplicate providers needed.
            </Callout>
          </section>

          {/* ══ WALLET SETUP ══ */}
          <section id="setup" className="scroll-mt-24">
            <H2 id="setup">Wallet Adapter Setup</H2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              <IC>CryptoCheckout</IC> reads from Solana Wallet Adapter context.
              Wrap your app (or at least the checkout page) with these three
              providers.
            </p>
            <Callout type="warning">
              Don't forget{" "}
              <IC>import '@solana/wallet-adapter-react-ui/styles.css'</IC> —
              without it the wallet modal won't render correctly.
            </Callout>
            <CodeBlock
              filename="src/main.tsx"
              code={`import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import '@solana/wallet-adapter-react-ui/styles.css'
import App from './App'

const network = 'devnet' // 'mainnet-beta' for production

function Root() {
  const endpoint = useMemo(() => clusterApiUrl(network), [])
  const wallets  = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)`}
            />
          </section>

          {/* ══ QUICK START ══ */}
          <section id="quickstart" className="scroll-mt-24">
            <H2 id="quickstart">Quick Start</H2>
            <p className="text-slate-400 text-sm mb-4">
              Once providers are in place, drop the component into any page:
            </p>
            <CodeBlock
              filename="CheckoutPage.tsx"
              code={`import { CryptoCheckout } from '@blingspay/react'

export default function CheckoutPage() {
  return (
    <CryptoCheckout
      apiKey="pk_live_your_key_here"
      amount={9.99}
      currency="USDC"
      onSuccess={(receipt) => {
        console.log('Payment confirmed!', receipt.txSignature)
      }}
      onError={(err) => {
        console.error('Payment failed:', err.message)
      }}
    />
  )
}`}
            />
            <Callout type="success">
              That's all that's needed for a working crypto checkout. The
              component handles wallet connection, transaction building,
              signing, and on-chain confirmation.
            </Callout>
          </section>

          {/* ══ API ══ */}
          <section id="api" className="scroll-mt-24">
            <H2 id="api">API Reference</H2>
            <p className="text-slate-400 text-sm mb-5">
              All props for the <IC>{"<CryptoCheckout />"}</IC> component.
            </p>
            <PropsTable
              rows={[
                [
                  "apiKey",
                  "string",
                  "—",
                  "Yes",
                  "Your publishable API key from the BlingsPay dashboard",
                ],
                ["amount", "number", "—", "Yes", "Amount to charge"],
                [
                  "currency",
                  "'SOL' | 'USDC' | 'USDT'",
                  "'SOL'",
                  "No",
                  "Token to accept. USDC/USDT support is in progress",
                ],
                [
                  "buttonLabel",
                  "string",
                  "'Pay X SOL'",
                  "No",
                  "Override the default button label",
                ],
                [
                  "onSuccess",
                  "(receipt) => void",
                  "—",
                  "No",
                  "Fires when payment is confirmed on-chain",
                ],
                [
                  "onError",
                  "(error: Error) => void",
                  "—",
                  "No",
                  "Fires when payment fails or user cancels",
                ],
                [
                  "theme",
                  "'dark' | 'light'",
                  "'dark'",
                  "No",
                  "Visual color theme",
                ],
                [
                  "className",
                  "string",
                  "—",
                  "No",
                  "Extra CSS class on the root element",
                ],
              ]}
            />
          </section>

          {/* ══ RECEIPT ══ */}
          <section id="receipt" className="scroll-mt-24">
            <H2 id="receipt">Receipt Object</H2>
            <p className="text-slate-400 text-sm mb-4">
              The <IC>onSuccess</IC> callback receives a{" "}
              <IC>blingsPayReceipt</IC> object:
            </p>
            <CodeBlock
              code={`interface blingsPayReceipt {
  txSignature:    string             // Solana transaction ID
  amount:         number             // Amount paid
  currency:       'SOL'|'USDC'|'USDT'
  timestamp:      number             // Unix ms — Date.now() at confirmation
  merchantblings: string             // Your merchant vault PDA address
}`}
            />
            <div className="overflow-x-auto rounded-xl border border-slate-700/50 mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/60">
                    <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Field
                    </th>
                    <th className="text-left px-4 py-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "txSignature",
                      "Unique Solana tx ID. Verify this on your backend or Solana Explorer.",
                    ],
                    [
                      "amount",
                      "The exact amount paid, as passed via the amount prop.",
                    ],
                    ["currency", "The token used — SOL, USDC, or USDT."],
                    [
                      "timestamp",
                      "JavaScript Date.now() at moment of on-chain confirmation.",
                    ],
                    [
                      "merchantblings",
                      "The Program Derived Address (PDA) of your merchant vault.",
                    ],
                  ].map(([f, d], i) => (
                    <tr
                      key={f}
                      className={`border-b border-slate-700/30 ${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-800/20"}`}
                    >
                      <td className="px-4 py-3 font-mono text-primary text-xs">
                        {f}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ══ STATES ══ */}
          <section id="states" className="scroll-mt-24">
            <H2 id="states">Payment States</H2>
            <p className="text-slate-400 text-sm mb-5">
              The component cycles through these internal states. Exported as{" "}
              <IC>PaymentState</IC> type.
            </p>
            <div className="space-y-2">
              {PAYMENT_STATES.map(({ state, desc }) => (
                <div
                  key={state}
                  className="flex items-start gap-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
                >
                  <StateBadge state={state} />
                  <p className="text-sm text-slate-300 leading-relaxed flex-1">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 text-center">
              <p className="text-xs font-mono text-slate-500">
                <StateBadge state="idle" /> → <StateBadge state="connecting" />{" "}
                → <StateBadge state="awaiting" /> →{" "}
                <StateBadge state="confirming" /> →{" "}
                <StateBadge state="success" />
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Any step can transition to <StateBadge state="error" />
              </p>
            </div>
          </section>

          {/* ══ EXAMPLES ══ */}
          <section id="examples" className="scroll-mt-24">
            <H2 id="examples">Examples</H2>

            <H3>Minimal — SOL payment</H3>
            <CodeBlock
              filename="App.tsx"
              code={`import { CryptoCheckout } from '@blingspay/react'

export default function App() {
  return (
    <CryptoCheckout
      apiKey="pk_live_abc123"
      amount={0.05}
      currency="SOL"
      onSuccess={(r) => alert('Tx: ' + r.txSignature)}
    />
  )
}`}
            />

            <H3>Light theme + custom button label</H3>
            <CodeBlock
              filename="ProductPage.tsx"
              code={`import { CryptoCheckout } from '@blingspay/react'

export default function ProductPage() {
  return (
    <CryptoCheckout
      apiKey="pk_live_abc123"
      amount={49.99}
      currency="USDC"
      theme="light"
      buttonLabel="Buy Now — 49.99 USDC"
      onSuccess={(receipt) => {
        window.location.href = '/success?tx=' + receipt.txSignature
      }}
      onError={(err) => console.error(err.message)}
    />
  )
}`}
            />

            <H3>E-commerce cart checkout with backend verify</H3>
            <CodeBlock
              filename="CheckoutPage.tsx"
              code={`import { useState } from 'react'
import { CryptoCheckout } from '@blingspay/react'
import type { blingsPayReceipt } from '@blingspay/react'

interface CartItem { id: string; name: string; price: number }

export default function CheckoutPage({ cart }: { cart: CartItem[] }) {
  const [paid, setPaid] = useState(false)
  const [txId, setTxId] = useState('')
  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const handleSuccess = async (receipt: blingsPayReceipt) => {
    // Always verify on your backend before fulfilling
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txSignature: receipt.txSignature,
        amount: receipt.amount,
        currency: receipt.currency,
      }),
    })
    if (res.ok) {
      setTxId(receipt.txSignature)
      setPaid(true)
    }
  }

  if (paid) return <p>Confirmed! Tx: {txId}</p>

  return (
    <CryptoCheckout
      apiKey={import.meta.env.VITE_BLINGSPAY_KEY}
      amount={total}
      currency="USDC"
      theme="dark"
      onSuccess={handleSuccess}
      onError={(err) => alert('Error: ' + err.message)}
    />
  )
}`}
            />

            <H3>Custom styling with className</H3>
            <CodeBlock
              filename="StyledCheckout.tsx"
              code={`import { CryptoCheckout } from '@blingspay/react'

// className is added to the root element of the checkout card.
// Use it alongside Tailwind or CSS modules.
export default function StyledCheckout() {
  return (
    <div className="flex justify-center p-10">
      <CryptoCheckout
        apiKey="pk_live_abc123"
        amount={25}
        currency="SOL"
        theme="light"
        className="max-w-sm shadow-2xl shadow-primary/20 ring-1 ring-primary/30"
        onSuccess={(r) => console.log(r)}
      />
    </div>
  )
}`}
            />
          </section>

          {/* ══ NEXT.JS ══ */}
          <section id="nextjs" className="scroll-mt-24">
            <H2 id="nextjs">Next.js Integration</H2>
            <p className="text-slate-400 text-sm mb-4">
              The component uses browser-only Web3 APIs. In Next.js you must
              prevent server-side rendering.
            </p>

            <H3>App Router (Next.js 13+)</H3>
            <p className="text-slate-400 text-xs mb-2">
              Add <IC>'use client'</IC> to the top of the file.
            </p>
            <CodeBlock
              filename="app/checkout/page.tsx"
              code={`'use client'

import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { CryptoCheckout } from '@blingspay/react'
import '@solana/wallet-adapter-react-ui/styles.css'

export default function CheckoutPage() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])
  const wallets  = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <CryptoCheckout
            apiKey={process.env.NEXT_PUBLIC_BLINGSPAY_KEY!}
            amount={10}
            currency="SOL"
            onSuccess={(r) => console.log(r)}
          />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}`}
            />

            <H3>Pages Router (Next.js 12)</H3>
            <CodeBlock
              filename="pages/checkout.tsx"
              code={`import dynamic from 'next/dynamic'

const CheckoutWidget = dynamic(
  () => import('../components/CheckoutWidget'),
  { ssr: false }  // disable server-side render
)

export default function CheckoutPage() {
  return <CheckoutWidget />
}`}
            />

            <H3>Environment variables</H3>
            <CodeBlock
              filename=".env.local"
              code={`# Vite
VITE_BLINGSPAY_KEY=pk_live_your_key_here

# Next.js
NEXT_PUBLIC_BLINGSPAY_KEY=pk_live_your_key_here

# Create React App
REACT_APP_BLINGSPAY_KEY=pk_live_your_key_here`}
            />
          </section>

          {/* ══ TYPESCRIPT ══ */}
          <section id="typescript" className="scroll-mt-24">
            <H2 id="typescript">TypeScript</H2>
            <p className="text-slate-400 text-sm mb-4">
              Full TypeScript definitions ship with the package. No{" "}
              <IC>@types</IC> install needed.
            </p>
            <H3>All exports</H3>
            <CodeBlock
              code={`import {
  CryptoCheckout,           // React component
} from '@blingspay/react'

import type {
  CryptoCheckoutProps,      // Component prop types
  blingsPayReceipt,         // onSuccess receipt shape
  PaymentState,             // 'idle'|'connecting'|'awaiting'|'confirming'|'success'|'error'
} from '@blingspay/react'`}
            />

            <H3>Typed handler example</H3>
            <CodeBlock
              code={`import type { blingsPayReceipt } from '@blingspay/react'

const handleSuccess = (receipt: blingsPayReceipt) => {
  const { txSignature, amount, currency, timestamp, merchantblings } = receipt
  console.log(\`\${amount} \${currency} received at \${new Date(timestamp).toISOString()}\`)
  // txSignature → verify on your backend
}`}
            />
          </section>

          {/* ══ BACKEND VERIFY ══ */}
          <section id="verification" className="scroll-mt-24">
            <H2 id="verification">Backend Verification</H2>
            <Callout type="warning">
              Always verify <IC>txSignature</IC> on your server before
              fulfilling orders. Never trust client-side receipt data alone.
            </Callout>
            <p className="text-slate-400 text-sm my-4">
              Example using <IC>@solana/web3.js</IC> in a Node.js / Express
              backend:
            </p>
            <CodeBlock
              filename="server/verify-payment.ts"
              code={`import { Connection, clusterApiUrl } from '@solana/web3.js'

const connection    = new Connection(clusterApiUrl('devnet'), 'confirmed')
const MERCHANT_VAULT = 'YOUR_VAULT_PDA_ADDRESS'

app.post('/api/verify-payment', async (req, res) => {
  const { txSignature, amount, currency } = req.body

  // 1. Fetch transaction from Solana
  const tx = await connection.getTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
  })
  if (!tx)        return res.status(404).json({ error: 'Transaction not found' })
  if (tx.meta?.err) return res.status(400).json({ error: 'Transaction failed on-chain' })

  // 2. Verify vault received funds
  const accounts    = tx.transaction.message.staticAccountKeys
  const vaultIndex  = accounts.findIndex(k => k.toBase58() === MERCHANT_VAULT)
  if (vaultIndex === -1) return res.status(400).json({ error: 'Vault not in transaction' })

  // 3. Verify amount (SOL)
  const lamports    = tx.meta.postBalances[vaultIndex] - tx.meta.preBalances[vaultIndex]
  const solReceived = lamports / 1_000_000_000
  if (Math.abs(solReceived - amount) > 0.0001)
    return res.status(400).json({ error: 'Amount mismatch' })

  // 4. Prevent replay — store signature in DB
  await db.payments.create({ txSignature, amount, currency, verified: true })

  return res.json({ success: true })
})`}
            />
          </section>

          {/* ══ TROUBLESHOOTING ══ */}
          <section id="troubleshooting" className="scroll-mt-24">
            <H2 id="troubleshooting">Troubleshooting</H2>
            <div className="space-y-6">
              {[
                {
                  problem: "Wallet modal doesn't open",
                  cause: "Missing WalletModalProvider in the provider tree.",
                  fix: `// Ensure all three providers are nested correctly:
<ConnectionProvider endpoint={...}>
  <WalletProvider wallets={[...]} autoConnect>
    <WalletModalProvider>       {/* ← required */}
      <CryptoCheckout ... />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>`,
                },
                {
                  problem: "Styles look broken",
                  cause: "Missing wallet adapter CSS.",
                  fix: `// Add to your entry file:
import '@solana/wallet-adapter-react-ui/styles.css'`,
                },
                {
                  problem: '"Failed to create checkout session"',
                  cause: "Invalid or missing apiKey.",
                  fix: `// Use pk_test_ for testing, pk_live_ for production.
// Verify your key in the BlingsPay dashboard.
apiKey="pk_test_..."   // testing
apiKey="pk_live_..."   // production`,
                },
                {
                  problem: '"USDC token payments coming soon"',
                  cause: "USDC/USDT support is not yet released in v0.1.1.",
                  fix: `// Use SOL for now. Watch npm for v0.2.x.
<CryptoCheckout currency="SOL" ... />`,
                },
                {
                  problem: '"window is not defined" in Next.js',
                  cause: "Component is being server-rendered.",
                  fix: `// App Router — add to top of file:
'use client'

// Pages Router — wrap with dynamic:
const Checkout = dynamic(() => import('./Checkout'), { ssr: false })`,
                },
              ].map(({ problem, cause, fix }) => (
                <div
                  key={problem}
                  className="rounded-xl border border-slate-700/50 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700/50">
                    <p className="font-semibold text-white text-sm">
                      {problem}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cause: {cause}
                    </p>
                  </div>
                  <CodeBlock code={fix} />
                </div>
              ))}
            </div>
          </section>

          {/* ══ SECURITY ══ */}
          <section id="security" className="scroll-mt-24">
            <H2 id="security">Security</H2>
            <H3>API keys</H3>
            <div className="space-y-2 mb-6">
              {[
                [
                  "✓",
                  "pk_live_ / pk_test_ keys are publishable — safe in frontend code",
                  "text-success",
                ],
                [
                  "✓",
                  "Store keys in environment variables, never hard-code in source",
                  "text-success",
                ],
                [
                  "✕",
                  "Never expose sk_live_ secret keys on the frontend",
                  "text-red-400",
                ],
              ].map(([icon, text, color]) => (
                <div
                  key={text}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30"
                >
                  <span className={`font-bold text-sm ${color}`}>{icon}</span>
                  <span className="text-sm text-slate-300">{text}</span>
                </div>
              ))}
            </div>
            <H3>Payment verification checklist</H3>
            <div className="space-y-2 mb-6">
              {[
                "Verify txSignature on your backend using @solana/web3.js",
                "Check that the recipient address matches your vault PDA",
                "Validate the transferred amount against the expected value",
                "Store confirmed signatures in your DB to prevent replay attacks",
                "Only fulfill orders after server-side verification passes",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30"
                >
                  <span className="text-primary font-bold text-sm">→</span>
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <Callout type="info">
              Always serve your production app over <IC>https://</IC>. Solana
              wallet extensions refuse to connect on insecure origins.
            </Callout>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-400">
                  @blingspay/react
                </span>{" "}
                · v0.1.1 · MIT License
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://blingspay.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-300 transition-colors"
                >
                  blingspay.com ↗
                </a>
                <a
                  href="https://www.npmjs.com/package/@blingspay/react"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-300 transition-colors"
                >
                  npm ↗
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
