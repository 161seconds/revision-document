# 08. Ad Click Event Aggregator & Stream Processing (Kafka + Flink + ClickHouse)

Trong các nền tảng quảng cáo trực tuyến (Google Ads, Facebook Ads, TikTok), mỗi lượt bấm quảng cáo (Ad Click) trực tiếp quy đổi thành doanh thu tài chính (Pay-Per-Click). Hệ thống tính toán sự kiện bấm quảng cáo (Ad Click Aggregator) phải đáp ứng:
1. **Khả năng mở rộng cực đại:** Hấp thụ hàng tỷ lượt bấm mỗi ngày từ toàn cầu.
2. **Độ chính xác cao:** Không được tính tiền hai lần khi người dùng bấm liên tục (Click Fraud / Double-click).
3. **Độ trễ thấp:** Nhà quảng cáo cần xem báo cáo số liệu sau vài giây để kịp thời điều chỉnh ngân sách chiến dịch.

---

## 1. Kiến Trúc Luồng Sự Kiện Bất Đồng Bộ (Stream Processing Pipeline)

```mermaid
graph TD
    Client["Trình duyệt / Ứng dụng di động"] --> CDN["Edge CDN / Load Balancer"]
    CDN --> IngestSvc["Ad Ingestion Gateway"]
    
    IngestSvc --> Kafka["Apache Kafka Cluster<br/>(Topic: ad-clicks, Sharded by ad_id)"]
    
    subgraph Stream Computation Tier
        Kafka --> Flink["Apache Flink Cluster (Stateful Stream Processing)"]
        Flink --> Dedup["Bộ lọc trùng lặp (Bloom Filter + RocksDB State)"]
        Dedup --> Window["Cửa sổ tính toán (Tumbling Window 1 phút)"]
    end
    
    subgraph Real-Time Analytics Storage (OLAP)
        Window --> ClickHouse[("ClickHouse Cluster<br/>(AggregatingMergeTree Table Engine)")]
    end
    
    subgraph Query API
        Advertiser["Bảng điều khiển nhà quảng cáo"] --> QuerySvc["Analytics Query Service"]
        QuerySvc --> ClickHouse
    end
```

---

## 2. Các Loại Cửa Sổ Thời Gian (Time Windowing Strategies)

Khi xử lý luồng sự kiện liên tục (Continuous Streams), dữ liệu cần được đóng gói vào các khung thời gian:

```
Tumbling Window (Cố định, không chồng lấn - ví dụ 1 phút):
[00:00 - 00:01) | [00:01 - 00:02) | [00:02 - 00:03)

Sliding Window (Trượt liên tục, có chồng lấn - ví dụ 5 phút, trượt mỗi 1 phút):
[00:00 ------- 00:05]
      [00:01 ------- 00:06]
            [00:02 ------- 00:07]

Session Window (Dựa trên khoảng lặng không hoạt động của người dùng - Gap > 15 phút):
[Event...Event] --- (Lặng 20m) ---> Kết thúc Session 1 | Bắt đầu Session 2
```

---

## 3. Thời Gian Sự Kiện vs Thời Gian Xử Lý (Event Time vs Processing Time & Watermarks)

- **Event Time:** Thời điểm người dùng thực sự click vào quảng cáo trên thiết bị di động (được gắn vào payload sự kiện).
- **Processing Time:** Thời điểm máy chủ Flink nhận và bắt đầu tính toán sự kiện đó.
- Khi người dùng đi tàu điện ngầm mất mạng 10 phút, hàng loạt click cũ sẽ đổ dồn về cùng một lúc.
- **Watermark (Mốc phân thủy thời gian):** Một cơ chế báo hiệu trong Apache Flink: "Tại thời điểm này, hệ thống giả định rằng toàn bộ các sự kiện có Event Time $\le T$ đã cập bến. Hãy đóng cửa sổ và xuất kết quả".
  - Cho phép cấu hình độ trễ tối đa (Bounded-out-of-orderness, ví dụ cho phép trễ 1 phút).

---

## 4. Kiến Trúc Dữ Liệu: Lambda vs Kappa

| Tiêu chuẩn | Kiến trúc Lambda | Kiến trúc Kappa |
| :--- | :--- | :--- |
| **Số tầng xử lý** | **2 tầng riêng biệt:** Batch Layer (Hadoop/Spark chạy ban đêm) + Speed Layer (Storm/Flink chạy ban ngày). | **1 tầng duy nhất:** Stream Layer (Apache Flink/Kafka Streams) xử lý cho cả quá khứ lẫn hiện tại. |
| **Bảo trì mã nguồn** | Rất phức tạp: Phải viết 2 phiên bản logic (một bằng SQL/Java cho Batch, một bằng Stream code). | Đơn giản: Một mã nguồn duy nhất. Khi cần tính lại quá khứ, chỉ cần tua lại Offset của Kafka. |
| **Tính nhất quán** | Tầng Batch ghi đè tầng Speed vào cuối ngày để sửa sai. | Dựa vào cơ chế Checkpointing và Idempotent Sink của Flink. |
