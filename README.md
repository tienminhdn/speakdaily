# SpeakDaily – Tiếng Anh giao tiếp mỗi ngày

Trang học tiếng Anh giao tiếp cho người Việt mất gốc: lộ trình 30 ngày, học theo cụm từ, luyện nói có chấm điểm bằng giọng nói, phát âm & shadowing, sổ tay lỗi và ôn tập lặp lại ngắt quãng.

## Chạy trên máy

```bash
npm install
cp .env.example .env.local   # điền cấu hình Firebase (tuỳ chọn, chỉ dùng cho analytics)
npm run dev                  # http://localhost:3000
```

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/data/` | Nội dung khoá học: chủ đề & cụm từ, mẫu câu, hội thoại, phát âm, lộ trình 30 ngày |
| `src/app/` | Các trang (App Router): giáo trình, từ vựng, mẫu câu, phát âm, luyện nghe, luyện nói, luyện đề, ôn tập, tiến độ |
| `src/components/` | Giao diện: chấm giọng nói, phản xạ, flashcard, kiểm tra mốc, bong bóng từ vựng… |
| `src/lib/` | Lưu tiến độ (localStorage), nhận diện & chấm giọng nói, đọc phát âm, analytics |

## Ghi chú

- Tiến độ học lưu trên trình duyệt (localStorage), không có máy chủ.
- Chấm giọng nói dùng Web Speech API, chạy tốt nhất trên Chrome / Edge.
- Analytics: Firebase (GA4), cấu hình ở `.env.production`; không gửi dữ liệu khi chạy ở `localhost`.
- Deploy: mỗi lần push lên `main`, GitHub Actions (`.github/workflows/deploy.yml`) build bản tĩnh (`output: "export"`) và đưa lên GitHub Pages.
