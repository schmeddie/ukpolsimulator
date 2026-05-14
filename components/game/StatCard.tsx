import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  icon?: ReactNode;
  colourClass?: string;
  description?: string;
  className?: string;
}

export function StatCard({ label, value, unit, trend, trendValue, icon, colourClass, description, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="fm-stat-label">{label}</p>
            <div className="flex items-baseline gap-1">
              <span className={cn("fm-stat-value", colourClass ?? "text-foreground")}>
                {value}
              </span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            )}
          </div>
          {icon && (
            <div className="shrink-0 h-9 w-9 rounded-md bg-secondary/60 flex items-center justify-center ml-3">
              {icon}
            </div>
          )}
        </div>

        {(trend || trendValue) && (
          <div className="mt-3 flex items-center gap-1.5">
            {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-400" />}
            {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
            {trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            {trendValue && (
              <span className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
              )}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
