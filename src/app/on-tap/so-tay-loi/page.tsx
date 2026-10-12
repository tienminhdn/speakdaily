import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ReviewTabs } from "@/components/ReviewTabs";
import { MistakeNotebook } from "@/components/MistakeNotebook";

export const metadata: Metadata = { title: "Sổ tay lỗi" };

export default function NotebookPage() {
  return (
    <>
      <PageHeader eyebrow="Ôn tập" title="Sổ tay lỗi">
        Mỗi lỗi là một cơ hội. Luyện lại câu sai cho đến khi nói đúng 2 lần liên tiếp.
      </PageHeader>
      <ReviewTabs />
      <MistakeNotebook />
    </>
  );
}
