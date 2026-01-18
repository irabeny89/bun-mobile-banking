import HeroSection from "@/components/home/hero-section";
import Features from "@/components/home/features";
import FAQ from "@/components/home/faq";
import Reference from "@/components/home/reference";
import { createFileRoute } from '@tanstack/react-router'
import "../index.css"

export default function HomePage() {
    return (
        <div className="min-h-screen text-foreground selection:bg-primary/20">
            <HeroSection />
            <Features />
            <FAQ />
            <Reference />
        </div>
    )
}

export const Route = createFileRoute('/')({
    component: HomePage,
})