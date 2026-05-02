import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://av.psyverse.fun"),
  title: "Global Autonomous Driving Companies · Ranked | 全球自动驾驶公司排行榜",
  description:
    "27 leading autonomous-driving companies tiered into Leaders, Contenders, Challengers, Followers — Waymo, Tesla, Baidu Apollo, Pony.ai, WeRide, Aurora, Cruise, Mobileye, Zoox, Wayve and more. Bilingual EN/中文.",
  keywords: ["autonomous driving", "robotaxi", "Waymo", "Tesla FSD", "Baidu Apollo", "Pony.ai", "WeRide", "Aurora", "Cruise", "Mobileye", "Zoox", "Wayve", "Mobileye", "AV ranking", "自动驾驶", "Robotaxi", "百度阿波罗", "小马智行", "文远知行"],
  authors: [{ name: "Gewenbo", url: "https://psyverse.fun" }],
  alternates: {
    canonical: "/",
    languages: { en: "/", "zh-CN": "/", "x-default": "/" },
  },
  openGraph: {
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Global Autonomous Driving Companies · Ranked" }],
    title: "Global Autonomous Driving Companies · Ranked",
    description: "27 AV companies tiered Leaders → Followers, scored on tech, deployment, safety, scalability, data. Bilingual EN/中文.",
    url: "https://av.psyverse.fun/",
    siteName: "Psyverse",
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
  },
  twitter: {
    images: ["/twitter-image.png"],
    card: "summary_large_image",
    title: "Global Autonomous Driving Companies · Ranked",
    description: "Waymo, Tesla, Baidu Apollo, Pony.ai, WeRide, Aurora and 21 more — tiered & scored.",
  },
  robots: { index: true, follow: true },
  other: { "theme-color": "#0a0a0a" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Script src="https://analytics-dashboard-two-blue.vercel.app/tracker.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
