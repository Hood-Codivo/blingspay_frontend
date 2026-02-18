import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import CheckoutModal from "@/components/CheckoutModal";
import { merchantStats, revenueData, mockPayments } from "@/lib/mock-data";
import { DollarSign, TrendingUp, CreditCard, Percent, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your payment overview at a glance.</p>
          </div>
          <Button onClick={() => setCheckoutOpen(true)} className="gap-2">
            <Eye className="h-4 w-4" /> Preview Checkout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Revenue" value={`$${merchantStats.totalRevenue.toLocaleString()}`} change="+18.2% from last month" changeType="positive" icon={DollarSign} />
          <StatsCard title="Transactions" value={merchantStats.totalTransactions.toString()} change="+42 this week" changeType="positive" icon={CreditCard} />
          <StatsCard title="Success Rate" value={`${merchantStats.successRate}%`} change="+0.3% from last month" changeType="positive" icon={TrendingUp} />
          <StatsCard title="Total Fees" value={`$${merchantStats.totalFees.toLocaleString()}`} change="1% platform fee" changeType="neutral" icon={Percent} />
        </div>

        {/* Revenue Chart */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Revenue Over Time</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorUsdc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsdt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
                <XAxis dataKey="date" stroke="hsl(215, 14%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(215, 14%, 50%)" fontSize={12} tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(220, 18%, 7%)", border: "1px solid hsl(220, 14%, 14%)", borderRadius: "8px", color: "hsl(210, 20%, 92%)" }}
                  labelStyle={{ color: "hsl(215, 14%, 50%)" }}
                />
                <Area type="monotone" dataKey="usdc" stroke="hsl(160, 84%, 39%)" fill="url(#colorUsdc)" strokeWidth={2} name="USDC" />
                <Area type="monotone" dataKey="usdt" stroke="hsl(174, 72%, 40%)" fill="url(#colorUsdt)" strokeWidth={2} name="USDT" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass-card rounded-xl p-6 animate-slide-up">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Token</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="py-3 font-mono text-xs text-foreground">{p.id}</td>
                    <td className="py-3 text-foreground">${p.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{p.token}</span>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === "confirmed" ? "bg-primary/10 text-primary" :
                        p.status === "pending" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>{p.status}</span>
                    </td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell text-xs">
                      {new Date(p.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </DashboardLayout>
  );
}
