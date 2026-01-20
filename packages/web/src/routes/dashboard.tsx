import { createFileRoute } from '@tanstack/react-router';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Wallet, TrendingUp, TrendingDown, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth.hook';
import TopBar from '@/components/dashboard/top-bar';
import Greeting from '@/components/dashboard/greeting';
import MainStats from '@/components/dashboard/main-stats';
import AtmCard from '@/components/dashboard/atm-card';
import SavingsGoal from '@/components/dashboard/savings-goal';

export const Route = createFileRoute('/dashboard')({
	component: Dashboard,
})

function Dashboard() {
	const user = useAuth();

	return (
		<div className="flex min-h-screen bg-muted/30">
			<Sidebar />

			<main className="flex-1 overflow-auto">
				<TopBar user={user} />

				<div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
					<Greeting user={user} />
					<MainStats />

					<div className="grid gap-6 xl:grid-cols-3">
						<div className="xl:col-span-2">
							<QuickActions />

							<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
								<AtmCard />
								<SavingsGoal />
							</div>
						</div>

						<div className="xl:col-span-1">
							<RecentTransactions />
						</div>
					</div>
				</div>
			</main>
		</div>
	)
}
