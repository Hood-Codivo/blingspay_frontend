import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockPayments, PaymentRecord } from "@/lib/mock-data";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Payments() {
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = mockPayments.filter((p) => {
    if (tokenFilter !== "all" && p.token !== tokenFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.id.includes(search) && !p.txSignature.includes(search)) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground">All incoming transactions.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by ID or signature..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          <Select value={tokenFilter} onValueChange={setTokenFilter}>
            <SelectTrigger className="w-32 bg-secondary border-border"><SelectValue placeholder="Token" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-secondary border-border"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
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
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{p.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.txSignature}</td>
                    <td className="px-4 py-3 text-foreground font-medium">${p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">${p.fee.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{p.token}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "confirmed" ? "bg-primary/10 text-primary" :
                        p.status === "pending" ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No payments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
