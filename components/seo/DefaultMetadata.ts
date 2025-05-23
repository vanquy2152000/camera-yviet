import { Metadata } from "next";

type MetadataProps = {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
    url?: string;
};

export const getMetadata = ({
    title = "YViet - Giải pháp công nghệ cho doanh nghiệp",
    description = "YViet cung cấp giải pháp công nghệ giúp doanh nghiệp tối ưu vận hành, từ giải pháp phần mềm đến thiết kế app mobile và website theo yêu cầu.",
    keywords = "YViet",
    ogImage = "/opengraph-image.png",
    url = `${process.env.NEXT_PUBLIC_URL_WEBSITE}`,
}: MetadataProps): Metadata => ({
    title,
    description,
    keywords,
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_URL_WEBSITE}`), // 👈 base URL cho tất cả metadata
    alternates: {
        canonical: url, // 👈 canonical URL
        languages: {
            "vi-VN": "/vi",
            "en-US": "/en",
        },
    },
    openGraph: {
        title,
        description,
        url,
        siteName: "FOSO",
        images: [
            {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: "FOSO Logo",
            },
        ],
        locale: "vi_VN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        site: "@foso",
        creator: "@foso",
        title,
        description,
        images: [
            {
                url: ogImage,
                alt: "FOSO Logo",
            },
        ],
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
        },
    },
    other: {
        "googlebot": "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    // viewport: {
    //     width: "device-width",
    //     initialScale: 1,
    //     maximumScale: 5,
    // },
    category: "technology",
    applicationName: "YViet",
    generator: "Next.js 14",
});
