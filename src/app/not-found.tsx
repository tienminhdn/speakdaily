import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold">I&apos;m lost. (Tôi bị lạc rồi.)</h1>
      <p className="mt-2 text-muted">Trang bạn tìm không tồn tại.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Về trang chủ
      </Link>
    </div>
  );
}
