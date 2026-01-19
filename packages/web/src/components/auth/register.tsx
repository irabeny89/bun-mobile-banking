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
import { Switch } from "@/components/ui/switch"

export default function Register() {
	return (
		<Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl">
			<CardHeader className="space-y-1 py-4 sm:py-6 text-center">
				<CardTitle className="text-xl sm:text-2xl font-bold">Create an account</CardTitle>
				<CardDescription className="text-sm">
					Enter your details to start your banking journey
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-5 py-4 sm:py-6">
				<div className="grid gap-2">
					<Label htmlFor="reg-email" className="text-sm font-medium">Email Address</Label>
					<Input id="reg-email" type="email" placeholder="name@example.com" className="bg-background/50" />
				</div>
				<div className="grid gap-2">
					<Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
					<Input id="reg-password" type="password" placeholder="••••••••" className="bg-background/50" />
				</div>
				<div className="flex items-center justify-between space-x-2 py-2 px-1">
					<div className="flex flex-col space-y-1">
						<Label htmlFor="mfa-toggle" className="text-sm font-semibold leading-none cursor-pointer">
							Enable MFA
						</Label>
						<p className="text-xs text-muted-foreground leading-tight">
							Secure your account with multi-factor authentication
						</p>
					</div>
					<Switch id="mfa-toggle" />
				</div>
			</CardContent>
			<CardFooter className="py-4 sm:py-6">
				<Button className="w-full font-semibold shadow-lg shadow-primary/20">Create Account</Button>
			</CardFooter>
		</Card>
	)
}