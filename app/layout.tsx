import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Image Compressor | 图片压缩工具",
    template: "%s | Image Compressor"
  },
  description: "Free online image compression tool. Reduce image file size while maintaining quality. Support JPEG, PNG, WebP formats. | 免费在线图片压缩工具，支持JPEG、PNG、WebP格式",
  keywords: "image compression, photo compressor, reduce image size, optimize images, 图片压缩, 照片压缩",
  authors: [{ name: "Image Compressor Team" }],
  creator: "Image Compressor",
  publisher: "Image Compressor",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    url: "https://mycompressor.org",
    title: "Image Compressor | 图片压缩工具",
    description: "Free online image compression tool | 免费在线图片压缩工具",
    siteName: "Image Compressor"
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Compressor | 图片压缩工具",
    description: "Free online image compression tool | 免费在线图片压缩工具"
  },
  alternates: {
    canonical: "https://mycompressor.org",
    languages: {
      'zh-CN': 'https://mycompressor.org',
      'en-US': 'https://mycompressor.org/en'
    }
  }
};

// This is the root layout for the app
// The actual locale-specific layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
