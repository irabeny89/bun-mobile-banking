import { Link, useLocation } from "@tanstack/react-router";
import {
    BarChart3,
    CreditCard,
    Home,
    Settings,
    Wallet,
    User,
    LogOut,
    Banknote,
    TrendingUp,
    LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: BarChart3, label: "Transactions", to: "/dashboard" },
    { icon: Wallet, label: "Payments", to: "/dashboard" },
    { icon: CreditCard, label: "Card Management", to: "/dashboard" },
    { icon: Banknote, label: "Loans", to: "/dashboard" },
    { icon: TrendingUp, label: "Investments", to: "/dashboard" },
    { icon: Settings, label: "Settings", to: "/dashboard" },
    { icon: LifeBuoy, label: "Support", to: "/dashboard" },
];

export function Sidebar({ className }: { className?: string }) {
    const location = useLocation();

    return (
        <div className={cn("hidden lg:flex flex-col w-64 border-r bg-background/50 h-screen sticky top-0 backdrop-blur-xl transition-all", className)}>
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-2xl text-primary">
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Wallet className="size-5" />
                    </div>
                    <span>MoBa</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                            location.pathname === item.to
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
                        )}
                    >
                        <item.icon className={cn("size-5", location.pathname === item.to ? "" : "text-muted-foreground group-hover:text-primary")} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t bg-muted/30">
                <div className="flex items-center gap-3 px-2 py-3 rounded-xl">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-none">John Doe</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">Free Plan</p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                        <LogOut className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
