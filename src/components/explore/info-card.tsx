import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, BarChart3, type LucideIcon } from "lucide-react";

type InfoType = "moat" | "risk" | "marketPosition";

const typeConfig: Record<InfoType, { icon: LucideIcon; label: string; color: string }> = {
  moat: { icon: Shield, label: "护城河", color: "text-green-600 dark:text-green-400" },
  risk: { icon: AlertTriangle, label: "风险", color: "text-red-600 dark:text-red-400" },
  marketPosition: { icon: BarChart3, label: "市场地位", color: "text-blue-600 dark:text-blue-400" },
};

export function InfoCard({ type, value }: { type: InfoType; value: string }) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className={`shrink-0 mt-0.5 ${config.color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wide ${config.color}`}>
              {config.label}
            </p>
            <p className="text-sm text-foreground mt-1 leading-relaxed">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
