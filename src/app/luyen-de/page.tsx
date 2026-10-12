import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Luyện đề" };

export default function QuizPage() {
  return (
    <>
      <PageHeader eyebrow="Luyện đề" title="Kiểm tra nhanh, sai đâu ôn đó">
        Mỗi đề 10 câu được trộn ngẫu nhiên. Câu sai có thể thêm thẳng vào Ôn tập để gặp lại vào ngày mai.
      </PageHeader>
      <Suspense fallback={<div className="card h-64 animate-pulse" />}>
        <Quiz />
      </Suspense>
    </>
  );
}
