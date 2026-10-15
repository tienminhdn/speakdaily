import type { Metadata } from "next";
import { themes } from "@/data/themes";
import { PageHeader } from "@/components/ui";
import { ThemeDueReview } from "@/components/theme/ThemeCards";

export const metadata: Metadata = { title: "Ôn từ 10 chủ đề" };

export default function ThemeReviewPage() {
  return (
    <>
      <PageHeader eyebrow="10 Chủ đề" title="Ôn từ đến hạn" back={{ href: "/chu-de", label: "10 Chủ đề" }}>
        Từ của cả 10 bài, từ yếu nhất lên trước. Nhớ đúng thì lần sau gặp lại thưa hơn (1 → 2 → 4 → 8 → 16 ngày), quên
        thì gặp lại ngay.
      </PageHeader>
      <ThemeDueReview themes={themes} />
    </>
  );
}
