import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export default function StatsCard({ title, value, change, changeType = "neutral", icon: Icon }: StatsCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {change && (
            <p className={`mt-1 text-xs ${
              changeType === "positive" ? "text-primary" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-secondary p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
