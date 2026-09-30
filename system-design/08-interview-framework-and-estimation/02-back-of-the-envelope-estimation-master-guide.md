# 02. Back-of-the-Envelope Estimation Master Guide

Ước lượng nhanh trên phong bì (Back-of-the-envelope estimation) giúp kiến trúc sư hệ thống trả lời các câu hỏi nền tảng: **Cần bao nhiêu máy chủ? Cần bao nhiêu dung lượng đĩa cho 5 năm tới? Cần bao nhiêu RAM cho bộ nhớ đệm? Băng thông mạng có bị nghẽn không?**

---

## 1. Bảng Lũy Thừa Của 2 & Đơn Vị Lưu Trữ

$$\begin{aligned}
2^{10} &= 1{,}024 \approx 1{,}000 = 1 \text{ Kilobyte (KB)} \\
2^{20} &= 1{,}048{,}576 \approx 1{,}000{,}000 = 1 \text{ Megabyte (MB)} \\
2^{30} &= 1{,}073{,}741{,}824 \approx 1{,}000{,}000{,}000 = 1 \text{ Gigabyte (GB)} \\
2^{40} &= 1{,}099{,}511{,}627{,}776 \approx 10^{12} = 1 \text{ Terabyte (TB)} \\
2^{50} &= 1{,}125{,}899{,}906{,}842{,}624 \approx 10^{15} = 1 \text{ Petabyte (PB)}
\end{aligned}$$

---

## 2. Hằng Số Vàng Về Thời Gian: 1 Ngày $\approx 10^5$ Giây

Một ngày có chính xác:
$$24 \times 60 \times 60 = 86{,}400 \text{ giây} \approx 10^5 \text{ giây (làm tròn để tính nhẩm)}$$

### Quy đổi QPS sang Khối lượng/Ngày:
- **100 QPS** $\approx 100 \times 86{,}400 \approx 8.64 \text{ triệu requests / ngày}$ ($\approx 10\text{M}$)
- **1,000 QPS** $\approx 86.4 \text{ triệu requests / ngày}$ ($\approx 100\text{M}$)
- **10,000 QPS** $\approx 864 \text{ triệu requests / ngày}$ ($\approx 1\text{ tỷ requests / ngày}$)
- **100,000 QPS** $\approx 8.64 \text{ tỷ requests / ngày}$ ($\approx 10\text{ tỷ}$)

---

## 3. Các Công Thức Ước Lượng Cốt Lõi

### 3.1 Tính toán QPS & Peak QPS
$$\text{Average QPS} = \frac{\text{Daily Active Users (DAU)} \times \text{Requests per user per day}}{86{,}400}$$

$$\text{Peak QPS} = \text{Average QPS} \times \text{Traffic Spike Multiplier (thường lấy } 2\times \text{ đến } 5\times)$$

### 3.2 Ước lượng Dung lượng Lưu trữ trong 5 Năm (Storage Capacity)
$$\text{Daily Ingestion} = \text{Daily Write Requests} \times \text{Average Payload Size}$$

$$\text{Storage (5 Years)} = \text{Daily Ingestion} \times 365 \times 5 \times \text{Replication Factor (thường là 3)} \times \text{Headroom Buffer (1.4)}$$

### 3.3 Ước lượng Băng thông Mạng (Network Bandwidth)
$$\text{Ingress Throughput (MB/s)} = \text{Write QPS} \times \text{Write Payload Size}$$

$$\text{Egress Throughput (MB/s)} = \text{Read QPS} \times \text{Read Payload Size}$$

$$\text{Network Bandwidth (Gbps)} = \text{Throughput (MB/s)} \times 8 \div 1{,}000$$

### 3.4 Ước lượng RAM cho Bộ nhớ Đệm Caching (Quy luật Pareto 80/20)
Quy luật 80/20: **$20\%$ số bài viết / sản phẩm phổ biến nhất tạo ra $80\%$ tổng lưu lượng đọc của hệ thống.**

$$\text{Cache RAM Required} = \text{Daily Read Data Volume} \times 20\%$$

---

## 4. Ví Dụ Thực Chiến Toàn Diện: Thiết Kế Nền Tảng Video (YouTube / TikTok Scale)

### Dữ kiện đầu vào:
- **DAU:** 500 triệu người dùng hoạt động mỗi ngày.
- Trung bình mỗi người xem **5 video / ngày**.
- Tỷ lệ người sáng tạo tải video: $1\%$ số người dùng tải **1 video / ngày**.
- Dung lượng video trung bình sau nén: **100 MB**.

### Tính toán:
1. **QPS Đọc & Ghi:**
   - Số video xem/ngày: $500\text{M} \times 5 = 2.5\text{ tỷ views/ngày}$.
   - $\text{Read QPS} = \frac{2.5 \times 10^9}{86{,}400} \approx 28{,}935 \text{ QPS} \implies \text{Peak Read QPS} \approx 60{,}000 \text{ QPS}$.
   - Số video tải lên/ngày: $500\text{M} \times 1\% = 5\text{ triệu uploads/ngày}$.
   - $\text{Write QPS} = \frac{5 \times 10^6}{86{,}400} \approx 58 \text{ QPS} \implies \text{Peak Write QPS} \approx 120 \text{ QPS}$.
2. **Dung lượng lưu trữ:**
   - Dữ liệu video mới mỗi ngày: $5 \times 10^6 \times 100\text{ MB} = 500\text{ TB / ngày}$.
   - Lưu trữ trong 5 năm (kèm hệ số nhân bản $3\times$):
     $$\text{Storage} = 500\text{ TB/ngày} \times 365 \times 5 \times 3 \approx 2{,}737{,}500\text{ TB} \approx 2.74\text{ Petabytes (PB)}$$
3. **Băng thông mạng chiều phát video (Egress):**
   - $\text{Egress Bandwidth} = 28{,}935 \text{ QPS} \times 100\text{ MB} = 2{,}893{,}500\text{ MB/s} \approx 2.89\text{ TB/s}$.
   - Quy đổi sang bit: $2.89 \times 8 \approx 23.1\text{ Terabits per second (Tbps)}$.
   - $\implies$ **Bắt buộc phải sử dụng mạng lưới CDN toàn cầu (Edge Caching)**, không thể phát trực tiếp từ máy chủ gốc!
