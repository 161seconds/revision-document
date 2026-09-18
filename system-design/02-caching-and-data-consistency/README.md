# Module 02: Caching Architectures & Data Consistency

Chào mừng bạn đến với **Module 02: Caching Architectures & Data Consistency**. Caching là thành phần tối thượng quyết định tốc độ và khả năng chịu tải của mọi hệ thống phân tán hiện đại, giúp giảm tải hàng triệu truy vấn xuống cơ sở dữ liệu và hạ độ trễ từ hàng chục mili-giây xuống micro-giây.

---

## 📚 Danh Mục Bài Học

1. **[01-caching-layers-and-topologies.md](file:///d:/my-project/revision-document/system-design/02-caching-and-data-consistency/01-caching-layers-and-topologies.md)**:
   - Các tầng Caching trong vòng đời request: Trình duyệt $\rightarrow$ CDN Edge $\rightarrow$ API Gateway $\rightarrow$ In-Memory App Cache $\rightarrow$ Distributed Cache (Redis/Memcached).
   - In-Process Cache (Guava, Caffeine) vs Distributed Cache (Redis Cluster): Đánh đổi độ trễ mạng vs tính nhất quán.

2. **[02-caching-strategies-and-patterns.md](file:///d:/my-project/revision-document/system-design/02-caching-and-data-consistency/02-caching-strategies-and-patterns.md)**:
   - Cache-Aside (Lazy Loading): Quy trình Đọc/Ghi, nguy cơ Stale Data và cách khắc phục.
   - Read-Through: Tích hợp cache như một nguồn dữ liệu trong suốt.
   - Write-Through: Ghi đồng thời vào Cache và DB (Đảm bảo nhất quán, chịu thêm độ trễ ghi).
   - Write-Behind / Write-Back: Ghi vào Cache trước, bất đồng bộ gom lô (Batching) ghi xuống DB (Hiệu năng ghi khủng khiếp, rủi ro mất dữ liệu khi crash).

3. **[03-cache-invalidation-and-anomalies.md](file:///d:/my-project/revision-document/system-design/02-caching-and-data-consistency/03-cache-invalidation-and-anomalies.md)**:
   - "Có hai điều khó nhất trong khoa học máy tính: Đặt tên biến và Hủy bỏ bộ nhớ đệm (Cache Invalidation)".
   - **Cache Stampede / Thundering Herd**: Hiện tượng và giải pháp Khóa Mutex (`SETNX`) & Thuật toán XFetch.
   - **Cache Penetration**: Truy vấn ID rác phá vỡ cache $\rightarrow$ Giải pháp **Bloom Filter** & Cache Null Values.
   - **Cache Breakdown**: Khóa Hot-Key hết hạn $\rightarrow$ Mutex lock hoặc Background refresh worker.
   - **Cache Avalanche**: Hàng triệu keys hết hạn cùng lúc $\rightarrow$ Kỹ thuật **TTL Jitter** (Random hóa thời gian sống).

4. **[04-eviction-policies-lru-lfu-arc.md](file:///d:/my-project/revision-document/system-design/02-caching-and-data-consistency/04-eviction-policies-lru-lfu-arc.md)**:
   - Khi bộ nhớ RAM đầy: Các chiến lược đẩy dữ liệu cũ ra ngoài.
   - LRU (Least Recently Used): Triển khai $O(1)$ bằng Doubly Linked List + Hash Map.
   - LFU (Least Frequently Used): Đếm tần suất truy cập, bẫy Starvation và Decay.
   - FIFO & ARC (Adaptive Replacement Cache).

---

## 🛠️ Thực Hành & Đánh Giá

- **Cài đặt thuật toán**: [caching_patterns.mjs](file:///d:/my-project/revision-document/system-design/02-caching-and-data-consistency/caching_patterns.mjs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/system-design/02-caching-and-data-consistency/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node system-design/02-caching-and-data-consistency/practice.mjs
```
