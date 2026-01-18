import { ShieldCheck, LineChart, Zap, Smartphone, CreditCard, Banknote, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";


function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Card className="border-muted/50 hover:border-primary/50 transition-colors bg-background/50 backdrop-blur-sm h-full">
            <CardHeader>
                <div className="mb-4 w-fit p-3 rounded-xl bg-muted/50">
                    {icon}
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base leading-relaxed">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
}

export default function Features() {
    return (
        <section id="features" className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Comprehensive Features</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        From onboarding to analytics, we have everything you need to run a modern financial application.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<ShieldCheck className="size-6 text-green-500" />}
                        title="User Onboarding"
                        description="Complete KYC/KYB with NIN/Bank verification, photo ID, document uploads, and OTP verification."
                    />
                    <FeatureCard
                        icon={<LineChart className="size-6 text-blue-500" />}
                        title="Account Management"
                        description="Dashboard overview, balance viewing, transaction history, and PDF statement generation."
                    />
                    <FeatureCard
                        icon={<Zap className="size-6 text-yellow-500" />}
                        title="Transactions"
                        description="Intra-bank & Inter-bank transfers, wallet transfers, scheduled payments, and beneficiaries."
                    />
                    <FeatureCard
                        icon={<Smartphone className="size-6 text-indigo-500" />}
                        title="Payments & Top-ups"
                        description="Airtime & data recharge, utility bill payments (DSTV, PHCN), and USSD payment support."
                    />
                    <FeatureCard
                        icon={<CreditCard className="size-6 text-pink-500" />}
                        title="Card Management"
                        description="Request physical/virtual cards, manage activation, PIN changes, and freeze cards instantly."
                    />
                    <FeatureCard
                        icon={<Banknote className="size-6 text-emerald-500" />}
                        title="Loans & Investment"
                        description="Request loans with repayment tracking and manage fixed deposit investments easily."
                    />
                    <FeatureCard
                        icon={<Lock className="size-6 text-red-500" />}
                        title="Advanced Security"
                        description="Biometric auth, 2FA, auto-logout, transaction PINs, and comprehensive audit logs."
                    />
                </div>
            </div>
        </section>
    )
}