import { ArrowRight } from "lucide-react";
import { InstallPWA } from "@/components/share/pwa";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <InstallPWA />
            <div className="container mx-auto px-4 text-center relative z-10">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground mb-8 bg-muted/50 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                    Mobile Banking for Everyone
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Built with <span className="text-primary">Elysia</span> <br className="hidden md:block" />
                    for Individuals & Businesses
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                    A complete mobile banking solution featuring KYC/KYB, account management, payments, loans, investments, and robust security.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button size="lg" className="h-12 px-8 text-base">
                        Start Banking
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}>
                        FAQs
                    </Button>
                </div>
            </div>

            {/* Abstract Background Gradient */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 dark:opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-full blur-[100px] animate-pulse"></div>
            </div>
        </section>
    )
}