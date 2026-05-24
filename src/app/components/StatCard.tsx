import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "./ui/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: "blue" | "green" | "purple" | "orange";
  onClick?: () => void;
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-teal-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
};

export function StatCard({ title, value, icon: Icon, trend, trendUp, color = "blue", onClick }: StatCardProps) {
  return (
    <Card 
      className={cn(
        "p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm mt-2",
              trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
          colorClasses[color]
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
