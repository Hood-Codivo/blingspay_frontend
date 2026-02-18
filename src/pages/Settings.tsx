import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your merchant account.</p>
        </div>

        {/* Business Info */}
        <div className="glass-card rounded-xl p-6 space-y-4 animate-slide-up">
          <h2 className="font-semibold text-foreground">Business Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Business Name</Label>
              <Input defaultValue="Acme Store" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <Input defaultValue="admin@acmestore.com" className="bg-secondary border-border" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-muted-foreground">Wallet Address</Label>
              <Input defaultValue="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" className="bg-secondary border-border font-mono text-xs" readOnly />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="glass-card rounded-xl p-6 space-y-4 animate-slide-up">
          <h2 className="font-semibold text-foreground">Payment Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Accept SOL</p>
                <p className="text-xs text-muted-foreground">Allow payments in native SOL</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Accept USDC</p>
                <p className="text-xs text-muted-foreground">Accept USD Coin payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Accept USDT</p>
                <p className="text-xs text-muted-foreground">Accept Tether payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Auto-withdraw</p>
                <p className="text-xs text-muted-foreground">Automatically withdraw to your wallet daily</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card rounded-xl p-6 space-y-4 animate-slide-up">
          <h2 className="font-semibold text-foreground">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Email notifications</p>
                <p className="text-xs text-muted-foreground">Receive payment confirmations via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Large payment alerts</p>
                <p className="text-xs text-muted-foreground">Get alerted for payments over $500</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full sm:w-auto">Save Settings</Button>
      </div>
    </DashboardLayout>
  );
}
