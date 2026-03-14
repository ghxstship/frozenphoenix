import { getActiveBrand } from "@/config/brands";

const brandConfig = getActiveBrand();

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                <h1>Privacy Policy</h1>
                <p className="text-muted-foreground text-sm">
                    Last updated:{" "}
                    {new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>

                <h2>1. Information We Collect</h2>
                <p>
                    We collect information you provide directly, such as your name, email address,
                    and organization details when you create an account. We also collect usage data
                    automatically, including device information, IP address, and interaction
                    patterns.
                </p>

                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                    <li>Provide, maintain, and improve our services</li>
                    <li>Send you technical notices, security alerts, and support messages</li>
                    <li>Respond to your comments, questions, and customer service requests</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                </ul>

                <h2>3. Cookies &amp; Tracking</h2>
                <p>
                    We use essential cookies for authentication and security. Analytics cookies are
                    only enabled with your explicit consent via our cookie banner. You can manage
                    your cookie preferences at any time.
                </p>

                <h2>4. Data Sharing</h2>
                <p>
                    We do not sell your personal information. We may share data with service
                    providers who assist in operating our platform, subject to confidentiality
                    agreements. We may also disclose information when required by law.
                </p>

                <h2>5. Data Security</h2>
                <p>
                    We implement industry-standard security measures, including encryption in
                    transit and at rest, role-based access controls, and regular security audits to
                    protect your data.
                </p>

                <h2>6. Data Retention</h2>
                <p>
                    We retain your data for as long as your account is active or as needed to
                    provide services. You may request deletion of your data at any time by
                    contacting us.
                </p>

                <h2>7. Your Rights</h2>
                <p>
                    Depending on your jurisdiction, you may have the right to access, correct,
                    delete, or port your personal data. We comply with GDPR, CCPA, LGPD, and PIPEDA
                    where applicable.
                </p>

                <h2>8. Changes to This Policy</h2>
                <p>
                    We may update this privacy policy from time to time. We will notify you of
                    material changes by posting the new policy on this page.
                </p>

                <h2>9. Contact</h2>
                <p>
                    For questions about this privacy policy, contact us at{" "}
                    <a
                        href={`mailto:privacy@${brandConfig.name.toLowerCase().replace(/\s+/g, "")}.com`}
                    >
                        privacy@{brandConfig.name.toLowerCase().replace(/\s+/g, "")}.com
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
