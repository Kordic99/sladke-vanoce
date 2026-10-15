import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./readability.css";
import "./christmas.css";
import "./calendar.css";
import "./mobile.css";

export const metadata: Metadata = {
  title: "Sladké Vánoce · Plánovač cukroví",
  description: "Vaše vánoční cukroví, všechny suroviny a jeden přehledný nákupní seznam.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Sladké Vánoce", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#761f32" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
