import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Globe,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/lib/api";

interface Webhook {
  _id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  lastStatus?: "success" | "failed";
}

const EVENT_TYPES = [
  "payment.completed",
  "payment.failed",
  "payment.pending",
  "withdrawal.completed",
  "merchant.updated",
];

export default function Webhooks() {
  const wallet = useWallet();
  const { toast } = useToast();

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "payment.completed",
  ]);

  // ── Fetch webhooks from backend ───────────────────────────────────────────
  const fetchWebhooks = async () => {
    if (!wallet.publicKey) return;
    try {
      const res = await api.get("/webhooks", {
        headers: { "x-wallet-address": wallet.publicKey.toBase58() },
      });
      setWebhooks(res.data);
    } catch {
      toast({ title: "Failed to load webhooks", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, [wallet.publicKey]);

  // ── Add webhook ───────────────────────────────────────────────────────────
  const addWebhook = async () => {
    if (!newUrl || !wallet.publicKey) return;
    setAdding(true);

    try {
      const res = await api.post(
        "/webhooks",
        { url: newUrl, events: selectedEvents },
        { headers: { "x-wallet-address": wallet.publicKey.toBase58() } },
      );
      setWebhooks((prev) => [res.data, ...prev]);
      setNewUrl("");
      setSelectedEvents(["payment.completed"]);
      toast({ title: "Webhook added", description: "Endpoint is now active." });
    } catch {
      toast({ title: "Failed to add webhook", variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const toggleWebhook = async (wh: Webhook) => {
    if (!wallet.publicKey) return;
    try {
      await api.patch(
        `/webhooks/${wh._id}`,
        { active: !wh.active },
        { headers: { "x-wallet-address": wallet.publicKey.toBase58() } },
      );
      setWebhooks((prev) =>
        prev.map((w) => (w._id === wh._id ? { ...w, active: !w.active } : w)),
      );
    } catch {
      toast({ title: "Failed to update webhook", variant: "destructive" });
    }
  };

  // ── Delete webhook ────────────────────────────────────────────────────────
  const removeWebhook = async (id: string) => {
    if (!wallet.publicKey) return;
    try {
      await api.delete(`/webhooks/${id}`, {
        headers: { "x-wallet-address": wallet.publicKey.toBase58() },
      });
      setWebhooks((prev) => prev.filter((w) => w._id !== id));
      toast({ title: "Webhook removed" });
    } catch {
      toast({ title: "Failed to remove webhook", variant: "destructive" });
    }
  };

  const toggleEvent = (evt: string, checked: boolean) => {
    setSelectedEvents((prev) =>
      checked ? [...prev, evt] : prev.filter((e) => e !== evt),
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Webhooks
            </h1>
            <p className="text-sm text-muted-foreground">
              Get notified about payment events in real time.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWebhooks}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* ── Add new endpoint ── */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Add Endpoint</h3>

          <Input
            placeholder="https://yoursite.com/api/webhook"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="bg-secondary border-border"
          />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Listen for events</p>
            <div className="flex flex-wrap gap-3">
              {EVENT_TYPES.map((evt) => (
                <label
                  key={evt}
                  className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none"
                >
                  <Checkbox
                    checked={selectedEvents.includes(evt)}
                    onCheckedChange={(checked) => toggleEvent(evt, !!checked)}
                  />
                  <span className="font-mono text-xs">{evt}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={addWebhook}
            disabled={!newUrl || adding || selectedEvents.length === 0}
            className="gap-2"
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Webhook
              </>
            )}
          </Button>
        </div>

        {/* ── Webhook list ── */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading webhooks...
          </div>
        ) : webhooks.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center text-muted-foreground text-sm">
            No webhooks configured yet. Add your first endpoint above.
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh._id} className="glass-card rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-mono text-foreground truncate">
                      {wh.url}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs font-mono text-muted-foreground"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                    {wh.lastTriggered && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {wh.lastStatus === "success" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                        )}
                        Last triggered:{" "}
                        {new Date(wh.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        wh.active
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {wh.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pl-9">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => toggleWebhook(wh)}
                  >
                    {wh.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive gap-1.5"
                    onClick={() => removeWebhook(wh._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Payload example ── */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Payload Example</h3>
          <pre className="rounded-lg bg-secondary p-4 text-xs font-mono text-foreground overflow-x-auto">
            {`// POST to your endpoint when a payment completes
{
  "event": "payment.completed",
  "timestamp": 1708901234567,
  "data": {
    "paymentId": "pay_abc123",
    "txSignature": "5Xk9qR7m...",
    "amount": 49.99,
    "token": "USDC",
    "merchantVault": "GWfR...Zfbt"
  }
}`}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}
