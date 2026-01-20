import { Wallet, CreditCard } from "lucide-react";

export default function AtmCard() {
	return (
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
	)
}