import { TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RadarChart } from "@/components/charts/RadarChart";
import { iconSize } from "@/constants/icons";
import type { BodyBalance } from "@/types/score";

export interface BodyBalanceCardProps {
  bodyBalance: BodyBalance;
  className?: string;
}

export function BodyBalanceCard({ bodyBalance, className }: BodyBalanceCardProps) {
  const weakest = bodyBalance.points.find(
    (point) => point.id === bodyBalance.weakestAxisId,
  );

  return (
    <Card padding="lg" className={className}>
      <RadarChart points={bodyBalance.points} />
      {weakest && (
        <p className="mt-4 flex items-center gap-2 text-sm">
          <TrendingDown size={iconSize.xs} aria-hidden className="text-warning" />
          <span>
            <span className="font-semibold text-warning">{weakest.label}</span>{" "}
            <span className="text-foreground-secondary">
              is your weakest link this week.
            </span>
          </span>
        </p>
      )}
    </Card>
  );
}
