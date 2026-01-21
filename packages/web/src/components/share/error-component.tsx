import { Button } from "~/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ErrorComponentProps {
    error: Error;
    reset: () => void;
}

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-in fade-in zoom-in duration-500 py-12">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative bg-background border-2 border-destructive/30 rounded-full p-8 shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Something went wrong
            </h1>

            <p className="text-muted-foreground max-w-md mb-10 text-lg leading-relaxed">
                {error.message || "An unexpected error occurred. Please try again or return to the home page."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                    variant="default"
                    size="lg"
                    onClick={() => reset()}
                    className="group relative overflow-hidden transition-all hover:scale-105 active:scale-95 px-8"
                >
                    <RotateCcw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                    Try Again
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="transition-all hover:scale-105 active:scale-95 px-8"
                >
                    <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        Go to Home
                    </Link>
                </Button>
            </div>

            {import.meta.env.DEV && (
                <div className="mt-16 text-left bg-muted/50 p-6 rounded-xl overflow-auto max-w-3xl w-full border border-border/50 backdrop-blur-sm shadow-inner group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest font-bold">Debug Information</p>
                        <div className="h-1 w-12 bg-destructive/30 rounded-full" />
                    </div>
                    <pre className="text-xs font-mono break-words whitespace-pre-wrap text-destructive/80 leading-relaxed">
                        {error.stack}
                    </pre>
                </div>
            )}
        </div>
    );
}
