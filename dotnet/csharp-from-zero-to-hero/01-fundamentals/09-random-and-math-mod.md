# Bài 9: Số Ngẫu Nhiên & Phép Toán Modulo (Random & Modulo)

> **Trọng tâm bài học:** Bản chất của số giả ngẫu nhiên (Pseudo-Random Numbers) trong `System.Random`, bẫy tái tạo hạt giống (Seed Collision) trong vòng lặp, và ứng dụng của toán tử chia lấy dư (`%`) trong thuật toán xoay vòng (Round-robin) và bảng băm.

---

## 1. Bản Chất Của `System.Random`

Máy tính không thể tự tạo ra sự ngẫu nhiên thực sự; nó sử dụng một công thức toán học xác định để sinh ra một chuỗi số **giả ngẫu nhiên (Pseudo-random)** dựa trên một giá trị khởi tạo gọi là **Hạt giống (Seed)**.
- Mặc định, nếu không truyền Seed, .NET sử dụng xung thời gian hệ thống (`Environment.TickCount`).

### ❌ Bẫy kinh điển: Khởi tạo `new Random()` bên trong vòng lặp:
```csharp
// SAI LẦM: Do vòng lặp chạy quá nhanh (trong cùng 1 mili-giây), 
// các instance Random nhận cùng 1 hạt giống -> Sinh ra các số giống hệt nhau!
for (int i = 0; i < 5; i++)
{
    var rng = new Random();
    Console.WriteLine(rng.Next(1, 100)); // In ra cùng 1 số!
}

// ✅ CHUẨN: Tái sử dụng một đối tượng Random duy nhất
var random = new Random(); // Trong .NET 6+ có thể dùng Random.Shared
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(random.Next(1, 100)); // Các số ngẫu nhiên thực sự
}
```

---

## 2. Các Phương Thức Của `Random`

- `random.Next()`: Sinh số nguyên không âm ngẫu nhiên từ `0` đến `int.MaxValue`.
- `random.Next(int max)`: Sinh số nguyên trong khoảng `[0, max)` (Không bao gồm `max`).
- `random.Next(int min, int max)`: Sinh số nguyên trong khoảng `[min, max)` (Bao gồm `min`, không bao gồm `max`).
- `random.NextDouble()`: Sinh số thực dấu phẩy động trong khoảng `[0.0, 1.0)`.

---

## 3. Sức Mạnh Của Phép Toán Modulo (`%`)

Toán tử chia lấy dư `%` trả về phần dư của phép chia 2 số nguyên.
- Kiểm tra tính chẵn lẻ: `if (number % 2 == 0) // Số chẵn`.
- **Kỹ thuật xoay vòng danh sách (Cyclic Array / Round-Robin):**
  ```csharp
  string[] days = { "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật" };
  // Lấy thứ trong tuần sau n ngày bất kỳ mà không bao giờ bị vượt quá biên mảng!
  int currentDay = 0; // Thứ 2
  int nextDayIndex = (currentDay + daysToAdd) % days.Length;
  ```
- **Ánh xạ vào bảng kích thước cố định (Hashing):**
  $\text{SlotIndex} = \text{HashCode} \% \text{TableSize}$.
