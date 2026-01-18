import { APP_NAME } from "@/config";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
    return <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Wallet className="size-5" />
                </div>
                {APP_NAME}
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                <a href="#api" className="hover:text-foreground transition-colors">API</a>
                <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
                <a href="#reference" className="hover:text-foreground transition-colors">Reference</a>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="hidden sm:flex">Log in</Button>
                <Button size="sm">Get Started</Button>
            </div>
        </div>
    </nav>
}