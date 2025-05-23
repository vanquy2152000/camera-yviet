import { getMetadata } from "@/components/seo/DefaultMetadata";

export const metadata = getMetadata({
    title: "YViet - Camera Test",
    description: "YViet cung cấp giải pháp công nghệ giúp doanh nghiệp tối ưu vận hành, từ giải pháp phần mềm đến thiết kế app mobile và website theo yêu cầu.",
    ogImage: "/opengraph-image.png",
    url: `${process.env.NEXT_PUBLIC_URL_WEBSITE}`,
});

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return children
}
