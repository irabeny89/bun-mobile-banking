import { Zap, Landmark, Code2 } from "lucide-react";

export default function Reference() {
    return (
        <section id="reference" className="py-20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-8">Powered By</h2>
                <div className="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <a href="https://elysia.dev" target="_blank" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
                        <Zap className="size-6" /> Elysia
                    </a>
                    <a href="https://mono.co/" target="_blank" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
                        <Landmark className="size-6" /> Mono
                    </a>
                    <a href="https://garagehq.deuxfleurs.fr/" target="_blank" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
                        <Code2 className="size-6" /> Garage
                    </a>
                </div>
            </div>
        </section>
    )
}