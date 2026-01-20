import { StatCard } from "@/components/dashboard/stat-card";
import { Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react";

export default function MainStats() {
	return (
		<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
	)
}