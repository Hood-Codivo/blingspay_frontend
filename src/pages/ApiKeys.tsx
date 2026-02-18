import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockApiKeys, MerchantAPIKey } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, RefreshCw, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiKeys() {
  const [keys, setKeys] = useState<MerchantAPIKey[]>(mockApiKeys);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyKey = (key: string, label: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const maskKey = (key: string) => key.slice(0, 12) + "•".repeat(20) + key.slice(-4);

  const addKey = () => {
    const newKey: MerchantAPIKey = {
      id: `key_${Date.now()}`,
      publicKey: `pk_live_${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`,
      secretKey: `sk_live_${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`,
      label: "New Key",
      active: true,
      createdAt: new Date(),
      lastUsed: null,
    };
    setKeys((prev) => [...prev, newKey]);
    toast({ title: "Key Created", description: "New API key pair generated." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">API Keys</h1>
            <p className="text-sm text-muted-foreground">Manage your integration keys.</p>
          </div>
          <Button onClick={addKey} className="gap-2"><Plus className="h-4 w-4" /> Create Key</Button>
        </div>

        <div className="space-y-4">
          {keys.map((k) => (
            <div key={k.id} className="glass-card rounded-xl p-5 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-foreground">{k.label}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${k.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    {k.active ? "Active" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Created {k.createdAt.toLocaleDateString()}</p>
              </div>

              {/* Public Key */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Publishable Key</p>
                <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                  <code className="flex-1 text-xs font-mono text-foreground break-all">{k.publicKey}</code>
                  <button onClick={() => copyKey(k.publicKey, "Public key")} className="text-muted-foreground hover:text-foreground transition-colors">
                    {copiedId === k.publicKey ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Secret Key</p>
                <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                  <code className="flex-1 text-xs font-mono text-foreground break-all">
                    {revealedKeys.has(k.id) ? k.secretKey : maskKey(k.secretKey)}
                  </code>
                  <button onClick={() => toggleReveal(k.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {revealedKeys.has(k.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => copyKey(k.secretKey, "Secret key")} className="text-muted-foreground hover:text-foreground transition-colors">
                    {copiedId === k.secretKey ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setKeys((prev) => prev.map((key) => key.id === k.id ? { ...key, active: !key.active } : key))}
                >
                  {k.active ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Integration Example */}
        <div className="glass-card rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-foreground">Quick Integration</h3>
          <pre className="rounded-lg bg-secondary p-4 text-xs font-mono text-foreground overflow-x-auto">
{`<script src="https://cdn.vaultpay.io/checkout.js"></script>
<div id="crypto-checkout"></div>
<script>
  VaultPay.mount({
    apiKey: "${keys[0]?.publicKey || "pk_live_xxx"}",
    amount: 49.99,
    currency: "USDC",
    onSuccess: (receipt) => console.log(receipt)
  });
</script>`}
          </pre>
        </div>
      </div>
    </DashboardLayout>
  );
}
