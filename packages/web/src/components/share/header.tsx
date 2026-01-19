import { APP_NAME } from "@/config";
import { Wallet, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function Header() {
	const location = useLocation()
	const isHome = location.pathname === '/'

	const NavLinks = () => (
		<>
			<a href="#features" className="hover:text-primary transition-colors py-2 md:py-0">Features</a>
			<a href="#api" className="hover:text-primary transition-colors py-2 md:py-0">API</a>
			<a href="#faq" className="hover:text-primary transition-colors py-2 md:py-0">FAQ</a>
			<a href="#reference" className="hover:text-primary transition-colors py-2 md:py-0">Reference</a>
		</>
	)

	return (
		<nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center gap-2 font-bold text-xl shrink-0">
					<div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
						<Wallet className="size-5" />
					</div>
					<Link to="/">
						{APP_NAME}
					</Link>
				</div>

				{isHome && (
					<div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
						<NavLinks />
					</div>
				)}

				<div className="flex items-center gap-2 sm:gap-4">
					<Link to="/auth">
						<Button variant="ghost" size="sm" className="hidden sm:flex">
							Log in
						</Button>
					</Link>
					<Link to="/auth">
						<Button size="sm">
							Get Started
						</Button>
					</Link>

					{isHome && (
						<div className="md:hidden ml-1">
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" className="size-9">
										<Menu className="size-5" />
										<span className="sr-only">Toggle menu</span>
									</Button>
								</SheetTrigger>
								<SheetContent side="right" className="w-[80%] sm:w-[350px] bg-background/95 backdrop-blur-xl">
									<SheetHeader className="text-left">
										<SheetTitle className="flex items-center gap-2 font-bold text-xl">
											<Wallet className="size-6 text-primary" />
											{APP_NAME}
										</SheetTitle>
									</SheetHeader>
									<Separator className="my-6" />
									<div className="flex flex-col gap-4 text-lg font-medium">
										<NavLinks />
									</div>
									<Separator className="my-6" />
									<div className="flex flex-col gap-3">
										<Link to="/auth">
											<Button variant="outline" className="w-full justify-center">Log in</Button>
										</Link>
										<Link to="/auth">
											<Button className="w-full justify-center">Get Started</Button>
										</Link>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					)}
				</div>
			</div>
		</nav>
	)
}