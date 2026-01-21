import { Button } from "~/components/ui/button";

export default function SavingsGoal() {
	return (
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
	)
}