import type { Metadata, Viewport } from "next";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-700.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "CSKH Script — Kịch bản hỗ trợ",
  description: "Tra cứu quy trình xử lý và soạn tin nhắn hỗ trợ khách hàng.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/app-icon.svg", apple: "/icons/app-icon.svg" },
  appleWebApp: {
    capable: true,
    title: "CSKH Script",
    statusBarStyle: "default",
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2457d6",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
