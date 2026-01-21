import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowDownLeft, ShoppingCart, Coffee, Car, Home } from "lucide-react";

import { cn } from "~/lib/utils";


const transactions = [
    {
        id: "1",
        name: "Apple Store",
        amount: "-$129.00",
        date: "Today, 12:45 PM",
        icon: ShoppingCart,
        color: "bg-blue-500/10 text-blue-500",
    },
    {
        id: "2",
        name: "Freelance Payment",
        amount: "+$2,500.00",
        date: "Yesterday, 3:20 PM",
        icon: ArrowDownLeft,
        color: "bg-emerald-500/10 text-emerald-500",
    },
    {
        id: "3",
        name: "Starbucks",
        amount: "-$15.50",
        date: "Dec 20, 9:15 AM",
        icon: Coffee,
        color: "bg-orange-500/10 text-orange-500",
    },
    {
        id: "4",
        name: "Uber",
        amount: "-$32.00",
        date: "Dec 19, 11:30 PM",
        icon: Car,
        color: "bg-gray-500/10 text-gray-500",
    },
    {
        id: "5",
        name: "Rent Payment",
        amount: "-$1,200.00",
        date: "Dec 15, 10:00 AM",
        icon: Home,
        color: "bg-purple-500/10 text-purple-500",
    },
];

export function RecentTransactions() {
    return (
        <Card className="border-none shadow-md bg-background/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-7">
                <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                <button className="text-sm font-medium text-primary hover:underline">View All</button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center gap-4 transition-all hover:translate-x-1">
                            <div className={cn("p-2 rounded-xl", transaction.color)}>
                                <transaction.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.name}</p>
                                <p className="text-xs text-muted-foreground">{transaction.date}</p>
                            </div>
                            <div className={cn(
                                "text-sm font-bold",
                                transaction.amount.startsWith("+") ? "text-emerald-500" : "text-foreground"
                            )}>
                                {transaction.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
