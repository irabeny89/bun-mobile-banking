import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { ArrowRight, ShieldCheck, Zap, Code2, LineChart, Wallet, CreditCard, Banknote, Landmark, Smartphone, Lock } from "lucide-react";
import "./index.css";
import { APP_NAME } from "./config";

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground mb-8 bg-muted/50 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Mobile Banking for Everyone
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Built with <span className="text-primary">Elysia</span> <br className="hidden md:block" />
            for Individuals & Business
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete mobile banking solution featuring KYC/KYB, account management, payments, and robust security.
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

      {/* Features Grid */}
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

      {/* Reference Section */}
      <section id="reference" className="py-20 bg-background">
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about getting started with {APP_NAME}.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Who can open an account?</AccordionTrigger>
              <AccordionContent>
                We support both individual and business accounts. Individuals need to complete KYC verification with their NIN and Bank ID, while businesses can complete KYB with their registration documents.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is my money safe?</AccordionTrigger>
              <AccordionContent>
                Yes, absolutely. We use bank-grade AES-256 encryption, biometric authentication, and Two-Factor Authentication (2FA) to secure your account. Your deposits are also insured where applicable.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What are the fees?</AccordionTrigger>
              <AccordionContent>
                Opening an account is free. We pride ourselves on transparent pricing with zero monthly maintenance fees. Transaction fees are competitive and clearly displayed before you confirm any transfer.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I use this for international payments?</AccordionTrigger>
              <AccordionContent>
                Yes, our cards support international transactions. We also plan to introduce FX Swap features and multi-currency wallets in upcoming updates.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I contact support?</AccordionTrigger>
              <AccordionContent>
                You can reach our support team directly through the in-app chat or via email. We are available 24/7 to assist with any issues or inquiries.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
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
    </div>
  );
}

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

export default App;
