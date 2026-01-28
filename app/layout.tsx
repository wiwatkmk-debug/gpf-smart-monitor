import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPF Smart Monitor - ผู้ช่วยติดตามพอร์ต กบข. อัจฉริยะ",
  description: "ติดตามพอร์ต กบข. แบบ Real-time วิเคราะห์สถานการณ์ตลาดโลก ให้คำแนะนำ Rebalancing อัจฉริยะ และช่วยวางแผนเกษียณ",
  keywords: "กบข, GPF, พอร์ตโฟลิโอ, การลงทุน, เกษียณ, วางแผนการเงิน",
  authors: [{ name: "GPF Smart Monitor" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
