# 04. Concurrency, lỗi và CI

## Test cạnh tranh có hai mức bằng chứng

Lab gửi hai request cancel gần như đồng thời và kiểm tra một `204`, một `409`, trạng thái cuối `cancelled`. Nó hữu ích để kiểm tra đường conditional UPDATE, nhưng không ép mọi thứ tự đọc/ghi.

Muốn chứng minh lịch lỗi cụ thể, thêm barrier ở đúng thời điểm hoặc dùng connection/lock quan sát được như [lab PostgreSQL](../postgresql-concurrency/05-lab.md). “Hai Task được tạo” không chứng minh cả hai transaction đã đọc snapshot cũ.

Không dùng nhiều lần `Thread.Sleep` để khiến race có vẻ lặp được. Mỗi chờ cần điều kiện, deadline và log đủ để biết đang đợi gì.

## Các lỗi nên bổ sung trong dự án thật

- DB không sẵn sàng, command timeout và cancellation không trả thành công giả.
- Lỗi sau thay đổi đầu tiên làm rollback toàn unit of work.
- Authorization theo resource và tenant không rò dữ liệu.
- Retry webhook/outbox không tạo tác động lặp; provider timeout sau thành công được đối soát.

Đây là backlog mở rộng; lab hiện tại không giả nhận đã kiểm tra những tình huống đó.

## Ví dụ CI

Workflow dưới đây là mẫu để chép vào repo ứng dụng khi cần; bộ tài liệu không tự bật workflow mới:

```yaml
name: integration
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - run: dotnet test dotnet-integration-testing/lab/Tests/Tests.csproj --configuration Release --logger trx
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: '**/TestResults/*.trx'
```

Runner cần Docker API hoạt động. Tải image/package lần đầu có thể chậm; readiness phải dựa vào dịch vụ sẵn sàng, không một khoảng ngủ cố định. Không đưa DB password hay toàn connection string vào log artifact.

Local test đạt không chứng minh workflow đã chạy. Sau push, phải xem run gắn với đúng SHA nếu muốn báo CI đạt.
