import type { Metadata, Viewport } from "next";
import { t } from "@ayahloop/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: t("common.appName"),
  description: t("common.tagline"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf9f5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
