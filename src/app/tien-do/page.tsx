import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { ProgressDashboard } from "@/components/ProgressDashboard";

export const metadata: Metadata = { title: "Tiến độ" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader eyebrow="Tiến độ" title="Đều đặn quan trọng hơn cường độ">
        Mỗi ngày một chút. Giữ chuỗi ngày học quan trọng hơn học dồn một buổi.
      </PageHeader>
      <ProgressDashboard />
    </>
  );
}
