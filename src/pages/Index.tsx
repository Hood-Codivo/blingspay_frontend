import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import CheckoutModal from "@/components/CheckoutModal";
import WithdrawModal from "@/components/WithdrawModal";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Percent,
  Eye,
  ArrowDownToLine,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getProgram } from "@/lib/anchor";

interface Payment {
  _id: string;
  paymentId: string;
  amount: number;
  token: string;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  vaultBalance: number;
  pendingWithdrawals: number;
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  totalFees: number;
  payments: Payment[];
}

export default function Dashboard() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveVaultBalance, setLiveVaultBalance] = useState<number>(0);
  const wallet = useWallet();

  // ── Fetch vault balance LIVE from Solana chain ────────────────────────────
  const fetchVaultBalance = async () => {
    if (!wallet.publicKey) return;

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

      const balance = await program.provider.connection.getBalance(vaultPda);
      const sol = balance / LAMPORTS_PER_SOL;
      setLiveVaultBalance(sol);
      console.log("Live vault balance:", sol, "SOL");
    } catch (err) {
      console.error("Failed to fetch vault balance:", err);
    }
  };

  // ── Fetch payment stats from backend ─────────────────────────────────────
  const fetchDashboard = async (isRefresh = false) => {
    if (!wallet.publicKey) return;
    if (isRefresh) setRefreshing(true);

    try {
      const res = await api.get("/dashboard", {
        headers: { "x-wallet-address": wallet.publicKey.toBase58() },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!wallet.publicKey) return;
    fetchDashboard();
    fetchVaultBalance();
  }, [wallet.publicKey]);

  // ── Build chart data from payments ───────────────────────────────────────
  const buildChartData = (payments: Payment[]) => {
    return payments.reduce(
      (
        acc: { date: string; sol: number; usdc: number; usdt: number }[],
        payment,
      ) => {
        const date = new Date(payment.createdAt).toLocaleDateString();
        let existing = acc.find((d) => d.date === date);

        if (!existing) {
          existing = { date, sol: 0, usdc: 0, usdt: 0 };
          acc.push(existing);
        }

        if (payment.status === "confirmed") {
          if (payment.token === "SOL") existing.sol += payment.amount;
          if (payment.token === "USDC") existing.usdc += payment.amount;
          if (payment.token === "USDT") existing.usdt += payment.amount;
        }

        return acc;
      },
      [],
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-20 text-muted-foreground">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  // If backend has no data yet, still show vault balance from chain
  const revenueData = stats ? buildChartData(stats.payments) : [];
  const payments = stats?.payments ?? [];
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalTransactions = stats?.totalTransactions ?? 0;
  const successRate = stats?.successRate ?? 0;
  const totalFees = stats?.totalFees ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Your payment overview at a glance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDashboard(true);
                fetchVaultBalance();
              }}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(true)}
              className="gap-2"
            >
              <ArrowDownToLine className="h-4 w-4" /> Withdraw
            </Button>
            <Button onClick={() => setCheckoutOpen(true)} className="gap-2">
              <Eye className="h-4 w-4" /> Preview Checkout
            </Button>
          </div>
        </div>

        {/* ── Vault Balance — fetched LIVE from Solana ──
        <div className="rounded-xl border p-6 space-y-1">
          <p className="text-sm text-muted-foreground">Vault Balance (Live)</p>
          <p className="text-4xl font-bold">
            {liveVaultBalance.toFixed(6)} SOL
          </p>
          <p className="text-xs text-muted-foreground">
            Balance read directly from Solana devnet
          </p>
        </div> */}

        {/* ── Stats Grid ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={`${totalRevenue.toFixed(4)} SOL`}
            change="Confirmed payments"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Transactions"
            value={totalTransactions.toString()}
            change="All time"
            changeType="positive"
            icon={CreditCard}
          />
          <StatsCard
            title="Success Rate"
            value={`${successRate.toFixed(1)}%`}
            change="Confirmed / total"
            changeType="positive"
            icon={TrendingUp}
          />
          {/* <StatsCard
            title="Total Fees"
            value={`${totalFees.toFixed(4)} SOL`}
            change="1.5% platform fee"
            changeType="neutral"
            icon={Percent}
          /> */}
        </div>

        {/* ── Revenue Chart ── */}
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Revenue Over Time</h2>

          {revenueData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
              No confirmed payments yet. Send SOL to your vault to see data
              here.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sol"
                    stroke="#9945ff"
                    fill="#9945ff33"
                    name="SOL"
                  />
                  <Area
                    type="monotone"
                    dataKey="usdc"
                    stroke="#10b981"
                    fill="#10b98133"
                    name="USDC"
                  />
                  <Area
                    type="monotone"
                    dataKey="usdt"
                    stroke="#14b8a6"
                    fill="#14b8a633"
                    name="USDT"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ── Recent Payments ── */}
        <div className="rounded-xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Payments</h2>

          {payments.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No payments recorded yet. Use the POS terminal or share your vault
              address to receive payments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Token</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 hidden sm:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 10).map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="py-3 font-mono text-xs">{p.paymentId}</td>
                      <td className="py-3 font-medium">
                        {p.amount.toFixed(6)} {p.token}
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {p.token}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.status === "confirmed"
                              ? "bg-green-100 text-green-600"
                              : p.status === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 hidden sm:table-cell text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </DashboardLayout>
  );
}
