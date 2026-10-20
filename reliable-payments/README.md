# Webhook và payment workflow tin cậy

Payment là workflow có trạng thái, retry và kết quả có thể chưa biết. API timeout không chứng minh tiền chưa bị trừ; webhook có thể trùng hoặc đến khác thứ tự. Bộ này tập trung vào giữ dữ liệu đúng và có đường phục hồi.

| Bài | Nội dung |
| --- | --- |
| [01. Trạng thái và idempotency](01-states-and-idempotency.md) | Order/payment attempt, operation ID và fingerprint. |
| [02. Webhook security](02-webhook-security.md) | Raw body, chữ ký, timestamp, account/reference/amount và acknowledgement. |
| [03. Inbox, outbox và transaction](03-inbox-outbox-and-transactions.md) | Atomic local state, publish window và consumer deduplication. |
| [04. Retry, recovery và đối soát](04-retry-recovery-and-reconciliation.md) | Unknown outcome, backoff, DLQ, replay và reconciliation. |
| [05. Lab PostgreSQL](05-lab.md) | Callback giả có chữ ký, cạnh tranh, rollback và phát lại sau failpoint. |

Tra nhanh: [summary.md](summary.md). Nguồn: [sources.md](sources.md).

## Chạy lab

Cần Docker, .NET SDK 10+ và NuGet `Npgsql` 10.0.3. Dùng lại DB dùng thử từ bộ concurrency, không cần tài khoản provider hay API key:

```powershell
rtk proxy docker compose -f postgresql-concurrency/lab/compose.yaml up -d --wait
rtk proxy dotnet run --file reliable-payments/lab/Payments.cs --configuration Release
```

Lab chỉ dùng provider giả `fake`, USD và dữ liệu tự tạo trong schema ngẫu nhiên. Không gọi mạng tới cổng thanh toán, không chuyển tiền, không chứa webhook endpoint production. HMAC của lab không tương thích giao thức Stripe hay một provider cụ thể.

Tiên quyết: [transaction/concurrency](../postgresql-concurrency/README.md), [API contract](../api-contracts/README.md), [integration testing](../dotnet-integration-testing/README.md).
