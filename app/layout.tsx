import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WLYO - Who Let You Online?",
  description: "Sprint through meme-recognition gates, land in your era room, and discover what generation of internet you belong to. A chaotic phonk arcade experience.",
  keywords: ["meme", "quiz", "brainrot", "gen z", "internet culture", "phonk", "wlyo"],
  authors: [{ name: "WLYO" }],
  openGraph: {
    title: "WLYO - Who Let You Online?",
    description: "Sprint through meme-recognition gates and discover what era of internet you belong to.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WLYO - Who Let You Online?",
    description: "Sprint through meme-recognition gates and discover what era of internet you belong to.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-void">
      <body className="font-sans antialiased scanlines noise">
        {children}
      </body>
    </html>
  );
}
