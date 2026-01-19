import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import { LogIn, UserPlus, LifeBuoy } from "lucide-react"
import Login from '@/components/auth/login'
import Register from '@/components/auth/register'
import Recovery from '@/components/auth/recovery'

export const Route = createFileRoute('/auth')({
	component: AuthPage,
})

function AuthPage() {
	const [activeTab, setActiveTab] = useState("login")

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8 sm:py-12">
			<div className="w-full max-w-[450px]">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
						<TabsTrigger value="login" className="flex items-center gap-2 text-xs sm:text-sm">
							<LogIn className="size-3 sm:size-4" />
							<span>Login</span>
						</TabsTrigger>
						<TabsTrigger value="register" className="flex items-center gap-2 text-xs sm:text-sm">
							<UserPlus className="size-3 sm:size-4" />
							<span>Register</span>
						</TabsTrigger>
						<TabsTrigger value="recovery" className="flex items-center gap-2 text-xs sm:text-sm">
							<LifeBuoy className="size-3 sm:size-4" />
							<span>Recovery</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="login" className="animate-in fade-in zoom-in duration-300">
						<Login setActiveTab={setActiveTab} />
					</TabsContent>

					<TabsContent value="register" className="animate-in fade-in zoom-in duration-300">
						<Register />
					</TabsContent>

					<TabsContent value="recovery" className="animate-in fade-in zoom-in duration-300">
						<Recovery setActiveTab={setActiveTab} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
