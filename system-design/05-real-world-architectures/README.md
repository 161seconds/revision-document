# Module 05: Real-World Enterprise System Architectures

Chào mừng bạn đến với **Module 05: Real-World Enterprise System Architectures**. Đây là module đỉnh cao tổng hợp toàn bộ các nguyên lý phân tán (Load Balancing, Caching, Sharding, Replication, Event Streaming, Backpressure) để giải quyết các bài toán thiết kế hệ thống kinh điển trong các vòng phỏng vấn kỹ thuật cấp cao (Staff / Principal Architect).

---

## 📚 Danh Mục Bài Học

1. **[01-designing-a-url-shortener-tinyurl.md](file:///d:/my-project/revision-document/system-design/05-real-world-architectures/01-designing-a-url-shortener-tinyurl.md)**:
   - Ước lượng quy mô (Back-of-the-envelope estimation): QPS, Storage, Bandwidth.
   - Cơ chế sinh ID duy nhất: Twitter Snowflake (64-bit Timestamp + Machine ID + Sequence) vs Ticket Server.
   - Mã hóa Base62 (`[0-9a-zA-Z]`) và toán học không gian địa chỉ $62^7 \approx 3.5$ nghìn tỷ URLs.
   - Kiến trúc Đọc/Ghi với Redis LRU Cache và DB Sharding.

2. **[02-designing-a-distributed-rate-limiter.md](file:///d:/my-project/revision-document/system-design/05-real-world-architectures/02-designing-a-distributed-rate-limiter.md)**:
   - Tại sao API Gateway cần Rate Limiter (Chống DoS, Brute Force, bảo vệ tài nguyên).
   - So sánh thuật toán: Fixed Window, Token Bucket, Leaky Bucket, Sliding Window Log vs Sliding Window Counter.
   - Cài đặt phân tán trên Redis bằng **Lua Scripts** để đảm bảo tính nguyên tử tuyệt đối (Atomic Operation).

3. **[03-designing-a-scalable-web-crawler.md](file:///d:/my-project/revision-document/system-design/05-real-world-architectures/03-designing-a-scalable-web-crawler.md)**:
   - Kiến trúc thu thập dữ liệu hàng tỷ trang web: URL Frontier, Fetcher, Parser, Deduplication.
   - Quản lý mức độ lịch sự (Politeness delay) và ưu tiên (Priority queues).
   - Lọc trùng URL bằng Bloom Filter và phát hiện nội dung trùng lặp bằng SimHash / MinHash.
   - Tuân thủ chuẩn `robots.txt` và phân tích HTML streaming.

4. **[04-designing-chat-and-video-streaming.md](file:///d:/my-project/revision-document/system-design/05-real-world-architectures/04-designing-chat-and-video-streaming.md)**:
   - **Real-Time Chat**: WebSockets song công (Full-duplex), Connection Servers, Presence Servers (Heartbeat ZooKeeper/Redis), Message Fanout qua Kafka.
   - **Video Streaming (YouTube/Netflix)**: Upload Pipeline, Video Transcoding & Chunking, Adaptive Bitrate Streaming (HLS / MPEG-DASH), Phân phối nội dung qua CDN Edge Caching.

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [enterprise_designs.mjs](file:///d:/my-project/revision-document/system-design/05-real-world-architectures/enterprise_designs.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/05-real-world-architectures/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node system-design/05-real-world-architectures/practice.mjs
```
