import { Button } from "~/components/ui/button";
import { ShieldCheck, FileText } from "lucide-react";
import type { TokenPayloadT } from "~/types";

type Props = {
	user: TokenPayloadT | null
}
export default function Greeting({ user }: Props) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
			<div className="flex flex-col gap-1">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
				<p className="text-muted-foreground flex items-center gap-2">
					Welcome back, {user?.email}.
					<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
						<ShieldCheck className="size-3" />
						KYC Verified
					</span>
				</p>
			</div>
			<div className="flex items-center gap-3">
				<Button variant="outline" size="sm" className="hidden sm:flex border-primary/20 hover:bg-primary/5">
					<FileText className="mr-2 h-4 w-4" />
					Get Statement
				</Button>
			</div>
		</div>
	)
}