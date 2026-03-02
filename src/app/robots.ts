import type { MetadataRoute } from "next";

/**
 * H-005: robots.txt — allow indexing of public pages, block dashboard.
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://app.playbook.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/login", "/signup"],
                disallow: ["/dashboard/", "/api/", "/auth/", "/onboarding/", "/settings/"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
