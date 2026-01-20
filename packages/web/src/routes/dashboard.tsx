import { createFileRoute } from '@tanstack/react-router';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth.hook';

export const Route = createFileRoute('/dashboard')({
    component: Dashboard,
})

function Dashboard() {
    const user = useAuth();

    return (
        <div className="flex min-h-screen bg-muted/30">
            <Sidebar />

            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="h-16 border-b bg-background/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="size-5" />
                            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-background" />
                        </Button>
                        <div className="h-8 w-px bg-border mx-2" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold leading-none">{user?.email}</p>
                                <p className="text-xs text-muted-foreground mt-1 lowercase">Personal Account</p>
                            </div>
                            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Greeting Section */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                        <p className="text-muted-foreground">Welcome back, {user?.email}. Here's what's happening with your account today.</p>
                    </div>

                    {/* Main Stats Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Balance"
                            value="$24,560.00"
                            description="Across all accounts"
                            icon={Wallet}
                            trend={{ value: "12%", isPositive: true }}
                            className="bg-primary text-primary-foreground"
                        />
                        <StatCard
                            title="Monthly Income"
                            value="$8,240.50"
                            icon={TrendingUp}
                            trend={{ value: "5.2%", isPositive: true }}
                        />
                        <StatCard
                            title="Monthly Expenses"
                            value="$3,120.00"
                            icon={TrendingDown}
                            trend={{ value: "2.1%", isPositive: false }}
                        />
                        <StatCard
                            title="Active Cards"
                            value="3"
                            description="2 physical, 1 virtual"
                            icon={CreditCard}
                        />
                    </div>

                    {/* Middle Section: Quick Actions & Charts (Simple Placeholder for now) */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <QuickActions />

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Card visualization placeholder */}
                                <div className="aspect-[1.6/1] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 group cursor-pointer transition-transform hover:scale-[1.02]">
                                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                                        <Wallet className="size-32" />
                                    </div>
                                    <div className="flex flex-col h-full justify-between relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Main Balance</p>
                                                <p className="text-4xl font-bold">$18,420.50</p>
                                            </div>
                                            <div className="size-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                <CreditCard className="size-6" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-xl font-mono tracking-[0.2em]">•••• •••• •••• 4291</p>
                                            <div className="flex justify-between items-end">
                                                <p className="text-sm font-medium uppercase opacity-70">Exp: 12/26</p>
                                                <div className="flex -space-x-2">
                                                    <div className="size-8 rounded-full bg-red-500/80" />
                                                    <div className="size-8 rounded-full bg-yellow-500/80" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-background/60 backdrop-blur-xl rounded-3xl p-8 border-none shadow-md flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl">Savings Goal</h3>
                                        <p className="text-sm text-muted-foreground">New Tesla Model 3</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">$42,000 / $55,000</span>
                                            <span className="text-primary font-bold">76%</span>
                                        </div>
                                        <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-[76%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                        </div>
                                        <Button className="w-full mt-2" variant="outline">Add Funds</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <RecentTransactions />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
