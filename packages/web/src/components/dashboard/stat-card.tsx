import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden border-none shadow-md bg-background/60 backdrop-blur-xl transition-all hover:shadow-lg hover:scale-[1.02]", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="rounded-full bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
                <div className="mt-2">
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                    {trend && (
                        <div className={cn(
                            "flex items-center text-xs mt-2 font-medium",
                            trend.isPositive ? "text-emerald-500" : "text-destructive"
                        )}>
                            {trend.isPositive ? "↑" : "↓"} {trend.value}
                            <span className="text-muted-foreground ml-1 font-normal">from last month</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
