# Nguồn webhook, outbox và payment recovery

Kiểm tra ngày **2026-10-20**. Nguồn Stripe mô tả Stripe; không mặc định áp dụng nguyên header, retry window hoặc key policy cho provider khác.

- [Stripe webhooks](https://docs.stripe.com/webhooks): signature, raw body, retry, event ordering và acknowledgement.
- [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests): key, request parameter và kết quả replay.
- [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature): kiểm tra endpoint secret và payload nguyên vẹn.
- [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html): atomic local write và publish; vẫn có thể phát trùng.
- [Idempotent Consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html): xử lý message đã nhận bằng transaction và deduplication.
- [Azure Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry): transient fault, backoff và điều kiện retry.
- [Azure Compensating Transaction](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction): phục hồi workflow có tác động ngoài local transaction.
- [CryptographicOperations.FixedTimeEquals](https://learn.microsoft.com/en-us/dotnet/api/system.security.cryptography.cryptographicoperations.fixedtimeequals): primitive so sánh byte cho trường hợp phù hợp.
- [System.Text.Json source generation](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation): context để serialize/deserialize không dựa vào reflection.
- [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html): uniqueness và invariant ở storage.

Lab độc lập, không gọi SDK Stripe hoặc phát HTTP request tới provider. Trước tích hợp thật phải xác minh tài liệu và môi trường test của đúng provider/account.
