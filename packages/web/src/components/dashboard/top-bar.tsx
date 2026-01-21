import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "~/components/ui/sheet";
import { Sidebar } from '~/components/dashboard/sidebar';
import type { TokenPayloadT } from '~/types';

type Props = {
	user: TokenPayloadT | null
}
export default function TopBar({ user }: Props) {
	return (
		<header className="h-16 border-b bg-background/50 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-8 flex items-center justify-between gap-4">
			<div className="flex items-center gap-4 lg:hidden">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="size-9">
							<Menu className="size-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="p-0 w-72">
						<Sidebar className="flex lg:flex" />
					</SheetContent>
				</Sheet>
			</div>

			<div className="flex items-center gap-4 flex-1 max-w-md">
				<div className="relative w-full">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						placeholder="Search transactions..."
						className="pl-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
					/>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="size-5" />
					<span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-background" />
				</Button>
				<div className="h-8 w-px bg-border mx-2" />
				<div className="flex items-center gap-3">
					<div className="text-right hidden sm:block">
						<p className="text-sm font-semibold leading-none">{user?.email}</p>
						<p className="text-xs text-muted-foreground mt-1 lowercase">Personal Account</p>
					</div>
					<div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
						{user?.email?.[0].toUpperCase()}
					</div>
				</div>
			</div>
		</header>
	)
}