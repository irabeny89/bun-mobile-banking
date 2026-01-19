import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Dispatch, SetStateAction } from "react"

export default function Recovery({ setActiveTab }: { setActiveTab: Dispatch<SetStateAction<string>> }) {
	return (
		<Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl">
			<CardHeader className="space-y-1 py-4 sm:py-6 text-center">
				<CardTitle className="text-xl sm:text-2xl font-bold">Recovery</CardTitle>
				<CardDescription className="text-sm">
					Enter your email to receive a recovery link
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 py-4 sm:py-6">
				<div className="grid gap-2">
					<Label htmlFor="recover-email" className="text-sm font-medium">Email Address</Label>
					<Input
						id="recover-email"
						type="email"
						placeholder="name@example.com"
						className="bg-background/50"
					/>
				</div>
			</CardContent>
			<CardFooter className="py-4 sm:py-6 flex flex-col gap-3">
				<Button className="w-full font-semibold shadow-lg shadow-primary/20">
					Send Recovery Link
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs text-muted-foreground"
					onClick={() => setActiveTab("login")}
				>
					Back to Login
				</Button>
			</CardFooter>
		</Card>
	)
}