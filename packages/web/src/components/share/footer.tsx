import { APP_NAME } from "@/config";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import { DialogHeader } from "@/components/ui/dialog";

import { useLocation } from "@tanstack/react-router";

export default function Footer() {
    const location = useLocation()
    const isDashboard = location.pathname.startsWith('/dashboard')

    if (isDashboard) return null;

    return (
        <footer className="py-12 border-t bg-background">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Wallet className="size-5 text-primary" />
                    {APP_NAME}
                </div>
                <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                </div>
                <div className="flex items-center gap-6">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Privacy Policy</DialogTitle>
                                <DialogDescription>
                                    Last updated: {new Date().toLocaleDateString()}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto">
                                <p>
                                    <strong>1. Information Collection</strong><br />
                                    We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
                                </p>
                                <p>
                                    <strong>2. Use of Information</strong><br />
                                    We use the information we collect to provide, maintain, and improve our services, such as to process transactions, prevent fraud, and provide customer support.
                                </p>
                                <p>
                                    <strong>3. Sharing of Information</strong><br />
                                    We may share the information we collect with third parties for legal reasons or in connection with a merger or sale.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="text-muted-foreground hover:text-foreground transition-colors">Terms</button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Terms of Service</DialogTitle>
                                <DialogDescription>
                                    Please read these terms carefully before using our service.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto">
                                <p>
                                    <strong>1. Acceptance of Terms</strong><br />
                                    By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
                                </p>
                                <p>
                                    <strong>2. Accounts</strong><br />
                                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.
                                </p>
                                <p>
                                    <strong>3. Termination</strong><br />
                                    We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                </div>
            </div>
        </footer>
    )
}