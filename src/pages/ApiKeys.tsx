import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import api from "@/lib/api";

interface ApiKey {
  id: string;
  label: string;
  publicKey: string;
  secretKey: string; // masked in list, full only on creation
  active: boolean;
  lastUsed: string | null;
  createdAt: string;
}

export default function ApiKeys() {
  const wallet = useWallet();
  const { toast } = useToast();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Fetch keys from backend ───────────────────────────────────────────────
  const fetchKeys = async () => {
    if (!wallet.publicKey) return;
    try {
      const res = await api.get("/keys", {
        headers: { "x-wallet-address": wallet.publicKey.toBase58() },
      });
      setKeys(res.data);
    } catch (err) {
      toast({ title: "Failed to load API keys", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, [wallet.publicKey]);

  // ── Create a new key pair ────────────────────────────────────────────────
  const addKey = async () => {
    if (!wallet.publicKey) return;
    setCreating(true);

    try {
      const res = await api.post(
        "/keys",
        { label: "New Key" },
        { headers: { "x-wallet-address": wallet.publicKey.toBase58() } },
      );

      // The full secret key is only returned on creation — add to list
      setKeys((prev) => [res.data, ...prev]);

      // Auto-reveal the secret key so user sees it
      setRevealedKeys((prev) => new Set([...prev, res.data.id]));

      toast({
        title: "API Key Created",
        description: "⚠️ Copy your secret key now — it won't be shown again.",
      });
    } catch {
      toast({ title: "Failed to create key", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // ── Toggle active/disabled ────────────────────────────────────────────────
  const toggleActive = async (key: ApiKey) => {
    if (!wallet.publicKey) return;
    try {
      await api.patch(
        `/keys/${key.id}`,
        { active: !key.active },
        { headers: { "x-wallet-address": wallet.publicKey.toBase58() } },
      );
      setKeys((prev) =>
        prev.map((k) => (k.id === key.id ? { ...k, active: !k.active } : k)),
      );
    } catch {
      toast({ title: "Failed to update key", variant: "destructive" });
    }
  };

  // ── Delete / revoke a key ─────────────────────────────────────────────────
  const deleteKey = async (key: ApiKey) => {
    if (!wallet.publicKey) return;
    try {
      await api.delete(`/keys/${key.id}`, {
        headers: { "x-wallet-address": wallet.publicKey.toBase58() },
      });
      setKeys((prev) => prev.filter((k) => k.id !== key.id));
      toast({ title: "Key revoked" });
    } catch {
      toast({ title: "Failed to revoke key", variant: "destructive" });
    }
  };

  // ── Copy to clipboard ────────────────────────────────────────────────────
  const copyKey = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(value);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Secret key is already masked by backend in list — only reveal if it was
  // just created (full key in state) or show mask
  const displaySecret = (key: ApiKey) => {
    if (revealedKeys.has(key.id)) return key.secretKey;
    return `sk_live_${"•".repeat(24)}${key.secretKey.slice(-4)}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              API Keys
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your integration keys.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchKeys}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={addKey} disabled={creating} className="gap-2">
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Key
            </Button>
          </div>
        </div>

        {/* Keys list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center space-y-3">
            <p className="text-muted-foreground">No API keys yet.</p>
            <Button onClick={addKey} disabled={creating} className="gap-2">
              <Plus className="h-4 w-4" /> Create your first key
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((k) => (
              <div
                key={k.id}
                className="glass-card rounded-xl p-5 space-y-4 animate-slide-up"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{k.label}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        k.active
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {k.active ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Publishable Key */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Publishable Key — safe for frontend
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                    <code className="flex-1 text-xs font-mono text-foreground break-all">
                      {k.publicKey}
                    </code>
                    <button
                      onClick={() => copyKey(k.publicKey, "Publishable key")}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {copiedId === k.publicKey ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Secret Key */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Secret Key — never expose publicly
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                    <code className="flex-1 text-xs font-mono text-foreground break-all">
                      {displaySecret(k)}
                    </code>
                    <button
                      onClick={() => toggleReveal(k.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {revealedKeys.has(k.id) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyKey(k.secretKey, "Secret key")}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      {copiedId === k.secretKey ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {k.lastUsed && (
                  <p className="text-xs text-muted-foreground">
                    Last used: {new Date(k.lastUsed).toLocaleString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => toggleActive(k)}
                  >
                    {k.active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-destructive hover:text-destructive gap-1.5"
                    onClick={() => deleteKey(k)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Integration snippet using first active key */}
        {keys.length > 0 && (
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Quick Integration</h3>
            <pre className="rounded-lg bg-secondary p-4 text-xs font-mono text-foreground overflow-x-auto">
              {`import { CryptoCheckout } from "@blingspay/react";

<CryptoCheckout
  apiKey="${keys.find((k) => k.active)?.publicKey ?? "pk_live_xxx"}"
  amount={49.99}
  currency="USDC"
  onSuccess={(receipt) => console.log(receipt.txSignature)}
/>`}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
