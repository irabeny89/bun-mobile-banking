import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { Send, Plus, CreditCard, Banknote } from "lucide-react";


export function QuickActions() {
    const actions = [
        { icon: Send, label: "Transfer", color: "bg-blue-600 hover:bg-blue-700" },
        { icon: Banknote, label: "Pay Bills", color: "bg-emerald-600 hover:bg-emerald-700" },
        { icon: CreditCard, label: "Cards", color: "bg-purple-600 hover:bg-purple-700" },
        { icon: Plus, label: "More", color: "bg-gray-600 hover:bg-gray-700" },
    ];

    return (
        <Card className="border-none shadow-md bg-background/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-center sm:text-left">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 pt-0">
                {actions.map((action) => (
                    <div key={action.label} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className={`p-4 rounded-2xl ${action.color} text-white transition-transform group-hover:scale-110 shadow-lg shadow-black/10`}>
                            <action.icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {action.label}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
