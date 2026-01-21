import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { Dispatch, SetStateAction } from "react"
import { AuthTabs } from "~/types"

export default function Login({ setActiveTab }: { setActiveTab: Dispatch<SetStateAction<string>> }) {
	return (
		<Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl">
			<CardHeader className="space-y-1 py-4 sm:py-6 text-center">
				<CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
				<CardDescription className="text-sm">
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4 py-4 sm:py-6">
				<div className="grid gap-2">
					<Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
					<Input id="email" type="email" placeholder="name@example.com" className="bg-background/50" />
				</div>
				<div className="grid gap-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="password" className="text-sm font-medium">Password</Label>
						<Button
							variant="link"
							className="px-0 font-normal h-auto text-xs text-muted-foreground hover:text-primary"
							onClick={() => setActiveTab(AuthTabs.RECOVERY)}
						>
							Forgot password?
						</Button>
					</div>
					<Input id="password" type="password" className="bg-background/50" />
				</div>
			</CardContent>
			<CardFooter className="py-4 sm:py-6">
				<Button className="w-full font-semibold shadow-lg shadow-primary/20">Sign In</Button>
			</CardFooter>
		</Card>
	)
}