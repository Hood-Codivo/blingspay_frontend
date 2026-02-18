import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { mockWebhooks, WebhookEndpoint } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const eventTypes = [
  "payment.completed",
  "payment.failed",
  "payment.pending",
  "withdrawal.completed",
  "merchant.updated",
];

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["payment.completed"]);
  const { toast } = useToast();

  const addWebhook = () => {
    if (!newUrl) return;
    setWebhooks((prev) => [
      ...prev,
      { id: `wh_${Date.now()}`, url: newUrl, events: selectedEvents, active: true, createdAt: new Date() },
    ]);
    setNewUrl("");
    toast({ title: "Webhook Added", description: "New endpoint configured." });
  };

  const removeWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast({ title: "Webhook Removed" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground">Get notified about payment events.</p>
        </div>

        {/* Add new */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Add Endpoint</h3>
          <Input placeholder="https://yoursite.com/api/webhook" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="bg-secondary border-border" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Events</p>
            <div className="flex flex-wrap gap-3">
              {eventTypes.map((evt) => (
                <label key={evt} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox
                    checked={selectedEvents.includes(evt)}
                    onCheckedChange={(checked) =>
                      setSelectedEvents((prev) => checked ? [...prev, evt] : prev.filter((e) => e !== evt))
                    }
                  />
                  {evt}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={addWebhook} className="gap-2"><Plus className="h-4 w-4" /> Add Webhook</Button>
        </div>

        {/* Existing webhooks */}
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <div key={wh.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <Globe className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-foreground truncate">{wh.url}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{wh.events.join(", ")}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs shrink-0 ${wh.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                {wh.active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => removeWebhook(wh.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
