import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import api from "@/lib/api";
import { getProgram } from "@/lib/anchor";

interface MerchantForm {
  businessName: string;
  email: string;
  website: string;
  webhookUrl: string;
  acceptedTokens: string[];
  wallet: string;
}

export default function Settings() {
  const { toast } = useToast();
  const wallet = useWallet();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vaultBalance, setVaultBalance] = useState<number | null>(null);
  const [vaultAddress, setVaultAddress] = useState<string | null>(null);
  const [merchantPdaAddress, setMerchantPdaAddress] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState<MerchantForm>({
    businessName: "",
    email: "",
    website: "",
    webhookUrl: "",
    acceptedTokens: [],
    wallet: "",
  });

  // ── Fetch backend profile + derive on-chain addresses ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.publicKey) return;

      try {
        // 1. Fetch merchant profile from backend
        const res = await api.get("/merchant/profile", {
          headers: { "x-wallet-address": wallet.publicKey.toBase58() },
        });

        setForm({
          businessName: res.data.businessName || "",
          email: res.data.email || "",
          website: res.data.website || "",
          webhookUrl: res.data.webhookUrl || "",
          acceptedTokens: res.data.acceptedTokens || [],
          wallet: wallet.publicKey.toBase58(),
        });

        // 2. Derive on-chain addresses (same pattern as POS and Dashboard)
        const program = getProgram(wallet);

        const [merchantPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("merchant"), wallet.publicKey.toBuffer()],
          program.programId,
        );

        const [vaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), merchantPda.toBuffer()],
          program.programId,
        );

        setMerchantPdaAddress(merchantPda.toBase58());
        setVaultAddress(vaultPda.toBase58());

        // 3. Fetch live vault balance from Solana
        const balance = await program.provider.connection.getBalance(vaultPda);
        setVaultBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error(error);
        toast({ title: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [wallet.publicKey]);

  // ── Save settings to backend ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!wallet.publicKey) return;
    setSaving(true);

    try {
      await api.put(
        "/merchant/profile",
        {
          businessName: form.businessName,
          email: form.email,
          website: form.website,
          webhookUrl: form.webhookUrl,
          acceptedTokens: form.acceptedTokens,
        },
        { headers: { "x-wallet-address": wallet.publicKey.toBase58() } },
      );

      toast({
        title: "Settings saved",
        description: "Your profile has been updated.",
      });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast({ title: `${label} copied!` });
  };

  const toggleToken = (token: string) => {
    setForm((prev) => ({
      ...prev,
      acceptedTokens: prev.acceptedTokens.includes(token)
        ? prev.acceptedTokens.filter((t) => t !== token)
        : [...prev.acceptedTokens, token],
    }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-muted-foreground">Loading settings...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your merchant account and preferences.
          </p>
        </div>

        {/* ── Business Information ── */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">
            Business Information
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
                placeholder="Acme Store"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://yourstore.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Webhook URL</Label>
              <Input
                value={form.webhookUrl}
                onChange={(e) =>
                  setForm({ ...form, webhookUrl: e.target.value })
                }
                placeholder="https://yourstore.com/api/webhook"
              />
              <p className="text-xs text-muted-foreground">
                We'll POST to this URL when a payment is confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* ── Wallet & On-Chain Info ── */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">On-Chain Addresses</h2>

          <div className="space-y-3">
            {/* Connected wallet */}
            <div className="space-y-1">
              <Label>Connected Wallet</Label>
              <div className="flex gap-2">
                <Input
                  value={form.wallet}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(form.wallet, "Wallet address")}
                >
                  Copy
                </Button>
              </div>
            </div>

            {/* Merchant PDA
            <div className="space-y-1">
              <Label>Merchant PDA</Label>
              <div className="flex gap-2">
                <Input
                  value={merchantPdaAddress || ""}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(merchantPdaAddress ?? "", "Merchant PDA")
                  }
                >
                  Copy
                </Button>
              </div>
            </div> */}

            {/* Vault PDA */}
            <div className="space-y-1">
              <Label>Vault Address</Label>
              <div className="flex gap-2">
                <Input
                  value={vaultAddress || ""}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(vaultAddress ?? "", "Vault address")
                  }
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is the address customers send payments to.
              </p>
            </div>

            {/* Vault balance
            <div className="rounded-lg bg-secondary px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Live Vault Balance
              </p>
              <p className="text-lg font-bold text-foreground">
                {vaultBalance !== null
                  ? `${vaultBalance.toFixed(6)} SOL`
                  : "Loading..."}
              </p>
            </div> */}
          </div>
        </div>

        {/* ── Payment Preferences ── */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Accepted Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Choose which tokens your customers can pay with.
          </p>

          <Separator />

          {["SOL", "USDC", "USDT"].map((token) => (
            <div key={token} className="flex items-center justify-between py-1">
              <div>
                <p className="font-medium text-foreground">{token}</p>
                <p className="text-xs text-muted-foreground">
                  {token === "SOL"
                    ? "Native Solana"
                    : token === "USDC"
                      ? "USD Coin"
                      : "Tether USD"}
                </p>
              </div>
              <Switch
                checked={form.acceptedTokens.includes(token)}
                onCheckedChange={() => toggleToken(token)}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </DashboardLayout>
  );
}
