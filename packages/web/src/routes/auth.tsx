import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { LogIn, UserPlus, LifeBuoy } from "lucide-react"

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
                                            onClick={() => setActiveTab("recovery")}
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
                    </TabsContent>

                    <TabsContent value="register" className="animate-in fade-in zoom-in duration-300">
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
                    </TabsContent>

                    <TabsContent value="recovery" className="animate-in fade-in zoom-in duration-300">
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
                                    <Input id="recover-email" type="email" placeholder="name@example.com" className="bg-background/50" />
                                </div>
                            </CardContent>
                            <CardFooter className="py-4 sm:py-6 flex flex-col gap-3">
                                <Button className="w-full font-semibold shadow-lg shadow-primary/20">Send Recovery Link</Button>
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
