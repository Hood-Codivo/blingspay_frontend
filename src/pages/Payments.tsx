import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, RefreshCw, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/lib/api";

interface Payment {
  _id: string;
  paymentId: string;
  txSignature: string | null;
  amount: number;
  fee: number;
  token: string;
  status: "confirmed" | "pending" | "failed";
  createdAt: string;
  confirmedAt?: string;
}

export default function Payments() {
  const wallet = useWallet();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenFilter, setTokenFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ── Fetch real payments from backend ──────────────────────────────────────
  const fetchPayments = async (isRefresh = false) => {
    if (!wallet.publicKey) return;
    if (isRefresh) setRefreshing(true);

    try {
      const res = await api.get("/dashboard", {
        headers: { "x-wallet-address": wallet.publicKey.toBase58() },
      });
      setPayments(res.data.payments ?? []);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [wallet.publicKey]);

  // ── Filter payments ───────────────────────────────────────────────────────
  const filtered = payments.filter((p) => {
    if (tokenFilter !== "all" && p.token !== tokenFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchesId = p.paymentId?.toLowerCase().includes(q);
      const matchesSig = p.txSignature?.toLowerCase().includes(q);
      if (!matchesId && !matchesSig) return false;
    }
    return true;
  });

  const shortenSig = (sig: string) =>
    sig.length > 16 ? `${sig.slice(0, 8)}...${sig.slice(-6)}` : sig;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Payments
            </h1>
            <p className="text-sm text-muted-foreground">
              All incoming transactions from your vault.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by payment ID or TX signature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>

          <Select value={tokenFilter} onValueChange={setTokenFilter}>
            <SelectTrigger className="w-36 bg-secondary border-border">
              <SelectValue placeholder="Token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-secondary border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Table ── */}
        <div className="glass-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              Loading payments...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground bg-secondary/50">
                    <th className="px-4 py-3 font-medium">Payment ID</th>
                    <th className="px-4 py-3 font-medium">TX Signature</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Fee</th>
                    <th className="px-4 py-3 font-medium">Token</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      {/* Payment ID */}
                      <td className="px-4 py-3 font-mono text-xs text-foreground">
                        {p.paymentId}
                      </td>

                      {/* TX Signature — links to Solana Explorer */}
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {p.txSignature ? (
                          <a
                            href={`https://explorer.solana.com/tx/${p.txSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            {shortenSig(p.txSignature)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-foreground font-medium">
                        {p.amount.toFixed(6)} {p.token}
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.fee ? `${p.fee.toFixed(6)} ${p.token}` : "—"}
                      </td>

                      {/* Token badge */}
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                          {p.token}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.status === "confirmed"
                              ? "bg-primary/10 text-primary"
                              : p.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        {payments.length === 0
                          ? "No payments yet. Use the POS terminal or share your vault address to receive payments."
                          : "No payments match your filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Summary ── */}
        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {filtered.length} of {payments.length} payments
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
