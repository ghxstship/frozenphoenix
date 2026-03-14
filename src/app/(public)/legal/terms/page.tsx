import { getActiveBrand } from "@/config/brands";

const brandConfig = getActiveBrand();

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                <h1>Terms of Service</h1>
                <p className="text-muted-foreground text-sm">
                    Last updated:{" "}
                    {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using the {brandConfig.name} platform, you agree to be bound by
                    these Terms of Service. If you do not agree, do not use the platform.
                </p>

                <h2>2. Use of Services</h2>
                <p>
                    You may use our services only in compliance with these terms and all applicable
                    laws. You are responsible for maintaining the confidentiality of your account
                    credentials.
                </p>

                <h2>3. User Responsibilities</h2>
                <p>
                    You agree not to misuse the platform, interfere with its operation, or attempt
                    to access it using a method other than the provided interface. You are
                    responsible for all activity that occurs under your account.
                </p>

                <h2>4. Intellectual Property</h2>
                <p>
                    All content, trademarks, and data on this platform are the property of{" "}
                    {brandConfig.name} or its licensors. You may not reproduce, distribute, or
                    create derivative works without prior written consent.
                </p>

                <h2>5. Limitation of Liability</h2>
                <p>
                    To the fullest extent permitted by law, {brandConfig.name} shall not be liable
                    for any indirect, incidental, special, consequential, or punitive damages
                    arising from your use of or inability to use the platform.
                </p>

                <h2>6. Termination</h2>
                <p>
                    We may terminate or suspend your access immediately, without prior notice, for
                    any breach of these Terms of Service.
                </p>

                <h2>7. Changes to Terms</h2>
                <p>
                    We reserve the right to modify these terms at any time. Continued use of the
                    platform after changes constitutes acceptance of the new terms.
                </p>

                <h2>8. Contact</h2>
                <p>
                    For questions about these terms, contact us at{" "}
                    <a
                        href={`mailto:legal@${brandConfig.name.toLowerCase().replace(/\s+/g, "")}.com`}
                    >
                        legal@{brandConfig.name.toLowerCase().replace(/\s+/g, "")}.com
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
