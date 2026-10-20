# 05. Lab race trên PostgreSQL thật

## Môi trường và an toàn dữ liệu

[compose.yaml](lab/compose.yaml) tạo project `revision-doc-concurrency`, DB `revision_lab`, user `lab`, cổng loopback `55432`. Đây là dữ liệu dùng thử; không trỏ script vào database làm việc.

[Races.cs](lab/Races.cs) chỉ chấp nhận host loopback, port `55432` và DB `revision_lab`. Mỗi lần chạy tạo schema tên ngẫu nhiên; `finally` xóa schema đó sau khi đã dispose các connection làm việc. Nếu process bị kill, schema có thể còn lại; chỉ dọn đúng schema lab đã xác minh.

```powershell
rtk proxy docker compose -f postgresql-concurrency/lab/compose.yaml up -d --wait
rtk proxy dotnet run --file postgresql-concurrency/lab/Races.cs --configuration Release
```

`Npgsql` 9.0.4 tải từ NuGet khi build lần đầu. File-based app cần SDK 10+. Nếu phải đổi port, cập nhật cả compose, cấu hình kết nối và guard trong code sau khi xác minh đó vẫn là DB lab.

## Các kịch bản

| Kịch bản | Lịch chạy | Expected |
| --- | --- | --- |
| Ghi dựa trên trạng thái cũ | A/B đọc pending; A hủy; B ship không điều kiện | B ghi đè cancellation, chứng minh đường sai. |
| Compare-and-swap | A/B đọc cùng version; A tăng version; B dùng version cũ | A đổi 1 hàng, B đổi 0 hàng. |
| Row lock + conditional UPDATE | A khóa; quan sát B đang chờ lock; A hủy rồi commit | B kiểm tra lại điều kiện và không ship. |
| Serializable | A/B thực sự đọc để pin snapshot; A đổi rồi commit | B nhận SQLSTATE `40001`; winner giữ nguyên. |
| Rollback | UPDATE trong transaction rồi rollback | Trạng thái trước transaction còn nguyên. |

Lab không dùng barrier báo “sắp SELECT” để thay cho SELECT thật. Nó pin snapshot bằng query hoàn tất và quan sát lock waiter ở DB. Statement có command timeout; vòng chờ lock có deadline để test không treo vô hạn.

## Bằng chứng của snapshot

Ngày 2026-10-20, lệnh Release đạt **9 PostgreSQL checks** sau khi đường ghi không điều kiện đã thể hiện lỗi ghi đè. Các test dùng connection độc lập, quan sát lock wait thật và pin snapshot trước khi bên thắng commit. Chưa chạy bài deadlock hai hàng, benchmark, backup/restore hoặc kiểm tra trên PostgreSQL major khác.

## Khi lỗi setup

Docker daemon tắt, port bận, image chưa tải hoặc NuGet lỗi là lỗi môi trường. Không báo đó là test phát hiện concurrency bug. Không đổi assertion hoặc bỏ kịch bản để khiến lab đạt.

Muốn ghi nhận môi trường tái hiện chính xác, lưu `SELECT version()`, SDK version, package version và image digest thực dùng. Tag major `postgres:18` có thể trỏ patch mới ở lần pull sau.

## Dừng và dọn riêng lab

```powershell
rtk proxy docker compose -f postgresql-concurrency/lab/compose.yaml down --volumes
```

Lệnh này xóa container và volume của project lab, mất toàn bộ dữ liệu lab. Chỉ chạy với file compose đúng ở trên; không dùng để dọn database của dự án khác.
