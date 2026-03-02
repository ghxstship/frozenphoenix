import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { getDefaultLocale, getLanguageTag, getTextDirection } from "@/lib/locale";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: process.env.NEXT_PUBLIC_BRAND_NAME
        ? `${process.env.NEXT_PUBLIC_BRAND_NAME} — ${process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Production Command Center"}`
        : "Playbook — Production Command Center",
    description:
        "End-to-end client ecosystem for technical production, fabrication, and experiential agencies.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang={getLanguageTag()}
            dir={getTextDirection(getDefaultLocale())}
            suppressHydrationWarning
        >
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#6366f1" />
                {/* SECURITY: dangerouslySetInnerHTML is safe here — static string literal with zero user input.
            Purpose: FOUC-free theme initialization before React hydration. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var s=JSON.parse(localStorage.getItem('pb-theme')||'{}');var m=(s.state&&s.state.colorMode)||'dark';if(m==='system'){m=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}document.documentElement.classList.add(m);}catch(e){document.documentElement.classList.add('dark');}})();`,
                    }}
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
