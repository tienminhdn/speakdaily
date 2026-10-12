import type { Metadata } from "next";
import Link from "next/link";
import { Be_Vietnam_Pro } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { Ambient } from "@/components/Ambient";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import "./globals.css";

const font = Be_Vietnam_Pro({
  variable: "--font-vn",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SpeakDaily – Tiếng Anh giao tiếp mỗi ngày",
    template: "%s · SpeakDaily",
  },
  description:
    "Học tiếng Anh giao tiếp theo cụm từ: từ vựng theo tình huống, mẫu câu, luyện nghe hội thoại, giáo trình 9 bài, luyện đề và ôn tập ngắt quãng.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full font-sans sm:p-4 lg:p-6">
        <Ambient />
        <AnalyticsConsent />
        <div className="shell mx-auto flex min-h-screen max-w-7xl flex-col sm:min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)]">
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
          <footer className="border-t border-line">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between">
              <p>
                <b className="text-ink">SpeakDaily</b>: nghe được, nói được, mỗi ngày một chút.
              </p>
              <p>
                Tiến độ lưu trên trình duyệt này ·{" "}
                <Link href="/tien-do" className="underline hover:text-brand">
                  Sao lưu / khôi phục
                </Link>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
