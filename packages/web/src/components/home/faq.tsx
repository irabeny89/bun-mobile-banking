import { APP_NAME } from "~/config";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/components/ui/accordion";

export default function FAQ() {
    return (
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
    )
}