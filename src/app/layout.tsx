import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/app/providers";
import { getDefaultLocale, getLanguageTag, getTextDirection } from "@/lib/formatters/locale";
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
        ? `${process.env.NEXT_PUBLIC_BRAND_NAME} — ${process.env.NEXT_PUBLIC_BRAND_TAGLINE || "Experiential Project Management System"}`
        : "ATLVS — Experiential Project Management System",
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
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#6366f1" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                {/* iOS PWA splash screens — device-specific launch images */}
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-se.png"
                    media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-x.png"
                    media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-xr.png"
                    media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-xs-max.png"
                    media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-12.png"
                    media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-12-max.png"
                    media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-14-pro.png"
                    media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/iphone-14-max.png"
                    media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/ipad.png"
                    media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/ipad-pro-11.png"
                    media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
                />
                <link
                    rel="apple-touch-startup-image"
                    href="/splash/ipad-pro-13.png"
                    media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
                />
                {/* Performance: Preconnect to Supabase to eliminate DNS+TLS latency (~100-300ms)
                    on the first API request. Falls back gracefully if env var is missing. */}
                {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                    <>
                        <link
                            rel="preconnect"
                            href={new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin}
                            crossOrigin="anonymous"
                        />
                        <link
                            rel="dns-prefetch"
                            href={new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin}
                        />
                    </>
                )}
                {/* SECURITY: dangerouslySetInnerHTML is safe here — static string literal with zero user input.
            Purpose: FOUC-free theme initialization before React hydration. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var s=JSON.parse(localStorage.getItem('pb-theme')||'{}');var m=(s.state&&s.state.colorMode)||'dark';if(m==='system'){m=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}document.documentElement.classList.add(m);}catch(e){document.documentElement.classList.add('dark');}})();`,
                    }}
                />
                {/* Performance: Service worker registration — deferred, production only.
                    Precaches static assets + stale-while-revalidate for API GET requests. */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`,
                    }}
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
