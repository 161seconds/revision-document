# Bài 2: Tham Số `in`, `out`, `ref` & Quản Trị Bộ Nhớ Con Trỏ

> **Trọng tâm bài học:** Cơ chế truyền tham trị (Pass by Value) vs Truyền tham chiếu (Pass by Reference), sự khác biệt cốt tử giữa `ref`, `out`, `in`, và kỹ thuật tối ưu hóa hiệu năng với `in` parameter và `ref struct`.

---

## 1. Cơ Chế Mặc Định: Truyền Tham Trị (Pass By Value)

- Đối với kiểu giá trị (`struct`, `int`, `double`): C# tạo ra một bản sao (copy) độc lập trên Stack. Sửa đổi trong hàm **không làm ảnh hưởng** đến biến ban đầu ngoài hàm.
- Đối với kiểu tham chiếu (`class`, `string`): C# sao chép **con trỏ tham chiếu** (Copy of Reference). Sửa thuộc tính bên trong object sẽ tác động tới object thật, nhưng gán `param = new Object()` thì con trỏ gốc bên ngoài không bị đổi.

---

## 2. Bảng So Sánh Cốt Tử: `ref`, `out` và `in`

| Từ khóa | Chiều dữ liệu | Biến bên ngoài có cần gán giá trị trước khi truyền? | Thân hàm có bắt buộc phải gán giá trị? | Thân hàm có được phép sửa giá trị? |
| :---: | :---: | :---: | :---: | :---: |
| **`ref`** | Hai chiều ($\leftrightarrow$) | **Bắt buộc có** | Không bắt buộc | **Có** |
| **`out`** | Một chiều ra ($\rightarrow$) | Không cần | **Bắt buộc 100% phải gán** | **Có** |
| **`in`** | Một chiều vào ($\leftarrow$) | **Bắt buộc có** | Không được gán | **KHÔNG** (Chỉ đọc - Read-only) |

---

## 3. Minh Họa Code Thực Tế

```csharp
public class MemoryDemo
{
    // 1. ref: Hoán đổi trực tiếp giá trị của 2 biến bộ nhớ
    public static void Swap(ref int a, ref int b)
    {
        int temp = a;
        a = b;
        b = temp;
    }

    // 2. out: Trả về nhiều giá trị từ một phương thức (như Int32.TryParse)
    public static bool TryDivide(int numerator, int denominator, out double result)
    {
        if (denominator == 0)
        {
            result = 0; // BẮT BUỘC phải gán trước khi thoát hàm!
            return false;
        }

        result = (double)numerator / denominator;
        return true;
    }

    // 3. in: Tối ưu hiệu năng cho struct kích thước lớn (tránh chi phí copy byte trên Stack)
    public struct BigMatrix
    {
        public fixed double Data[100]; // Struct lớn
    }

    public static void ProcessMatrix(in BigMatrix matrix)
    {
        // matrix.Data[0] = 10; // LỖI BIÊN DỊCH: "in" bảo vệ biến ở trạng thái chỉ đọc (Read-only)
        Console.WriteLine("Đọc ma trận mà không tốn chi phí copy bộ nhớ!");
    }
}
```

### Sử dụng:
```csharp
int x = 10, y = 20;
MemoryDemo.Swap(ref x, ref y); // x = 20, y = 10

if (MemoryDemo.TryDivide(10, 2, out double res))
{
    Console.WriteLine($"Kết quả chia: {res}"); // 5.0
}
```
