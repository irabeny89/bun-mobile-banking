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
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRegister, registerBodySchema, type RegisterBodyT, useRegisterComplete } from "@/hooks/auth.hook"
import { useState } from "react"
import { toast } from "sonner"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { useNavigate } from "@tanstack/react-router"
import { ACCESS_TOKEN_KEY } from "@/config"

export default function Register() {
	const navigate = useNavigate()
	const [showOtpModal, setShowOtpModal] = useState(false)
	const [otp, setOtp] = useState("")
	const { mutate: registerUser, isPending } = useRegister()
	const { mutate: completeRegister, isPending: isCompletePending } = useRegisterComplete()

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<RegisterBodyT>({
		resolver: zodResolver(registerBodySchema),
		defaultValues: {
			email: "",
			password: "",
			mfaEnabled: false,
		},
	})

	const onSubmit = (data: RegisterBodyT) => {
		registerUser(data, {
			onSuccess: ({ data }) => {
				setShowOtpModal(true)
				toast.success(data.message)
			},
			onError: (error: any) => {
				toast.error(error?.message || "Something went wrong")
			}
		})
	}

	const handleVerifyOtp = (e: React.FormEvent) => {
		e.preventDefault()
		completeRegister({ otp }, {
			onSuccess: ({ data }) => {
				setShowOtpModal(false)
				toast.success(data.message)
				// ! for security reasons
				// * store only access token in session storage
				sessionStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
				navigate({ to: "/dashboard" })
			},
			onError: (error: any) => {
				toast.error(error?.message || "Something went wrong")
			}
		})
	}

	return (
		<>
			<Card className="border-none shadow-2xl bg-background/60 backdrop-blur-xl">
				<CardHeader className="space-y-1 py-4 sm:py-6 text-center">
					<CardTitle className="text-xl sm:text-2xl font-bold">Create an account</CardTitle>
					<CardDescription className="text-sm">
						Enter your details to start your banking journey
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="grid gap-5 py-4 sm:py-6">
						<div className="grid gap-2">
							<Label htmlFor="reg-email" className="text-sm font-medium">Email Address</Label>
							<Input
								id="reg-email"
								type="email"
								placeholder="name@example.com"
								className="bg-background/50"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-xs text-destructive">{errors.email.message}</p>
							)}
						</div>
						<div className="grid gap-2">
							<Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
							<Input
								id="reg-password"
								type="password"
								placeholder="••••••••"
								className="bg-background/50"
								{...register("password")}
							/>
							{errors.password && (
								<p className="text-xs text-destructive">{errors.password.message}</p>
							)}
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
							<Controller
								name="mfaEnabled"
								control={control}
								render={({ field }) => (
									<Switch
										id="mfa-toggle"
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
						</div>
					</CardContent>
					<CardFooter className="py-4 sm:py-6">
						<Button
							type="submit"
							className="w-full font-semibold shadow-lg shadow-primary/20"
							disabled={isPending}
						>
							{isPending ? "Creating Account..." : "Create Account"}
						</Button>
					</CardFooter>
				</form>
			</Card>

			<Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Verify your account</DialogTitle>
						<DialogDescription>
							We've sent a 6-digit code to your email. Enter it below to continue.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleVerifyOtp} className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="otp">Verification Code</Label>
							<Input
								id="otp"
								placeholder="000000"
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								className="text-center text-2xl tracking-[0.5em] font-bold"
								maxLength={6}
							/>
						</div>
						<Button
							type="submit"
							className="w-full"
							disabled={isCompletePending}
						>
							{isCompletePending ? "Verifying..." : "Verify & Complete"}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</>
	)
}