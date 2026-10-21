import type { Metadata, Viewport } from "next";
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
  themeColor: "#2563eb",
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
