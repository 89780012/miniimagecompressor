import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  robots: "index, follow",
  verification: {
    google: "12h-5YPuL_fTEsRcfcn5zTWvBF7qiyd8tF4d9P4Env4"
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
