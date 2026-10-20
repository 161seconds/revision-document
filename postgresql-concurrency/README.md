# PostgreSQL concurrency thực chiến

Transaction không tự bảo đảm mọi quy tắc nghiệp vụ dưới cạnh tranh. Bộ này dùng tình huống hủy đơn và giao hàng cùng đọc trạng thái `pending` để phân biệt MVCC, optimistic concurrency, row lock và Serializable.

| Bài | Nội dung |
| --- | --- |
| [01. MVCC và isolation](01-mvcc-and-isolation.md) | Snapshot theo statement/transaction, lost update và write skew. |
| [02. Conditional write và version](02-conditional-write-and-version.md) | Đặt điều kiện ngay trong UPDATE, xử lý số hàng bị tác động. |
| [03. Lock, deadlock và timeout](03-locks-and-deadlocks.md) | `FOR UPDATE`, thứ tự khóa, quan sát waiter và retry. |
| [04. Retry, constraint và vận hành](04-retry-constraints-and-operations.md) | Retry toàn transaction, invariant ở DB, index và migration. |
| [05. Lab race có lịch chạy kiểm soát](05-lab.md) | Chạy các kịch bản trên PostgreSQL thật, không dùng sleep để đoán thứ tự. |

Tra nhanh: [summary.md](summary.md). Nguồn: [sources.md](sources.md). Tiên quyết: [SQL/transaction nền tảng](../database/README.md).

## Chạy lab

Cần Docker đang chạy, .NET SDK 10+, mạng để tải image và NuGet `Npgsql` 9.0.4. Chạy từ gốc repo:

```powershell
rtk proxy docker compose -f postgresql-concurrency/lab/compose.yaml up -d --wait
rtk proxy dotnet run --file postgresql-concurrency/lab/Races.cs --configuration Release
```

Image `postgres:18` theo major version, không cố định digest; xem bài lab nếu cần tái hiện byte-for-byte. Cổng `55432` chỉ bind loopback, password là fixture công khai dùng riêng cho lab. Không dùng cấu hình này cho production.

Lab tạo schema ngẫu nhiên và xóa chính schema đó trong `finally`. Nó không đo throughput, không kiểm tra mọi anomaly và không thay cho test tích hợp của nghiệp vụ thật.
