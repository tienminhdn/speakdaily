import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { Flashcards } from "@/components/Flashcards";
import { ReviewTabs } from "@/components/ReviewTabs";

export const metadata: Metadata = { title: "Ôn tập" };

export default function ReviewPage() {
  return (
    <>
      <PageHeader eyebrow="Ôn tập" title="Ôn đúng lúc sắp quên">
        Flashcard lặp lại ngắt quãng: mỗi ngày chỉ ôn những thẻ đến hạn, thẻ yếu được đưa lên trước. Hãy <b>nói to</b>{" "}
        đáp án trước khi lật thẻ, hoặc bấm 🎤 để máy chấm.
      </PageHeader>
      <ReviewTabs />
      <Flashcards />
    </>
  );
}
