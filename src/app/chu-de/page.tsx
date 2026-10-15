import type { Metadata } from "next";
import { themes } from "@/data/themes";
import { PageHeader } from "@/components/ui";
import { ThemeCards, ThemeOverview } from "@/components/theme/ThemeCards";

export const metadata: Metadata = { title: "10 Chủ đề từ vựng" };

export default function ThemesPage() {
  return (
    <>
      <PageHeader eyebrow="10 Chủ đề" title="Nhớ từ, rồi dùng được từ">
        10 bài theo chủ đề quen thuộc, từ Gia đình đến Cảm xúc. Mỗi bài có 24 từ, đi theo 7 bước:{" "}
        <b>Học từ → Ghi nhớ → Nghe → Dùng từ → Ngữ pháp → Nói về bạn → Kiểm tra</b>. Một từ chỉ thật sự là của bạn khi
        bạn tự nói ra được trong câu chuyện của mình.
      </PageHeader>
      <ThemeOverview themes={themes} />
      <ThemeCards themes={themes} />
    </>
  );
}
