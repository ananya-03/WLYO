import type { Metadata, Viewport } from "next";
import { Inter, Anton } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "BRAINROT MAZE - How Brainrotted Are You?",
  description: "Sprint through meme-recognition gates, land in your era room, and discover your true brainrot level. A chaotic phonk arcade experience.",
  keywords: ["meme", "quiz", "brainrot", "gen z", "internet culture", "phonk"],
  authors: [{ name: "BRAINROT MAZE" }],
  openGraph: {
    title: "BRAINROT MAZE - How Brainrotted Are You?",
    description: "Sprint through meme-recognition gates and discover your true brainrot level.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "BRAINROT MAZE - How Brainrotted Are You?",
    description: "Sprint through meme-recognition gates and discover your true brainrot level.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff2bd6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} bg-void`}>
      <body className="font-sans antialiased scanlines noise">
        {children}
      </body>
    </html>
  );
}
