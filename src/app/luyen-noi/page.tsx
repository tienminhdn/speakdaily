import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { SpeakingHub } from "@/components/SpeakingHub";

export const metadata: Metadata = { title: "Luyện nói & phản xạ" };

export default function SpeakingPage() {
  return (
    <>
      <PageHeader eyebrow="Luyện nói" title="Nói → Sai → Sửa → Nói lại">
        Máy nghe giọng bạn, so với câu mẫu và tô đỏ từ chưa khớp. Câu nói sai được tự lưu vào Sổ tay lỗi để luyện lại
        cho đến khi đúng. Dùng tốt nhất trên Chrome hoặc Edge, nhớ cho phép micro.
      </PageHeader>
      <Suspense fallback={<div className="card h-64 animate-pulse" />}>
        <SpeakingHub />
      </Suspense>
    </>
  );
}
