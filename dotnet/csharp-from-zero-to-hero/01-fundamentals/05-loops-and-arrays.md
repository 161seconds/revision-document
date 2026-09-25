# Bài 5: Vòng Lặp & Mảng 1 Chiều (Loops & Arrays)

> **Trọng tâm bài học:** Cấu trúc dữ liệu mảng liên tục trên bộ nhớ (`T[]`), các loại vòng lặp (`for`, `while`, `do-while`, `foreach`), lỗi biên kinh điển (Off-by-one, `IndexOutOfRangeException`) và các mẫu thuật toán thao tác mảng (tìm Max, Min, tính tổng, lọc dữ liệu).

---

## 1. Bản Chất Mảng 1 Chiều (`Array`) Trên Bộ Nhớ

Trong C#, mảng (`T[]`) là kiểu tham chiếu (Reference Type), nhưng các phần tử của nó được cấp phát **liên tục liền kề nhau** trên Managed Heap.
- **Kích thước cố định (Fixed Size):** Sau khi khởi tạo, kích thước của mảng không thể thay đổi.
- **Chỉ số (0-based Indexing):** Phần tử đầu tiên ở vị trí `0`, phần tử cuối cùng ở vị trí `Length - 1`.
- **Truy xuất ngẫu nhiên cực nhanh:** Độ phức tạp thời gian là $O(1)$ nhờ công thức tính địa chỉ: $\text{Address}(i) = \text{BaseAddress} + i \times \text{SizeOf}(T)$.

```csharp
// Khởi tạo mảng có 5 phần tử số nguyên (mặc định giá trị là 0)
int[] numbers = new int[5];

// Khởi tạo và gán giá trị trực tiếp
int[] scores = new int[] { 85, 92, 78, 90, 88 };
string[] names = { "Alice", "Bob", "Charlie" };
```

---

## 2. Các Loại Vòng Lặp Trong C#

| Loại vòng lặp | Cú pháp đặc trưng | Khi nào nên dùng? |
| :--- | :--- | :--- |
| `for` | `for (int i = 0; i < n; i++)` | Khi biết trước số lần lặp, hoặc cần truy cập chỉ số `i` để hoán đổi, biến đổi phần tử. |
| `foreach` | `foreach (var item in collection)` | Lặp qua từng phần tử một cách an toàn, dễ đọc (chỉ đọc, không sửa cấu trúc mảng). |
| `while` | `while (condition)` | Lặp khi chưa biết trước số lần lặp, kiểm tra điều kiện trước khi vào vòng lặp. |
| `do-while` | `do { ... } while (condition);` | Luôn thực thi thân vòng lặp **ít nhất 1 lần** trước khi kiểm tra điều kiện. |

---

## 3. Các Thuật Toán Thao Tác Mảng Thực Chiến (Trích Từ Repo)

### 1. Tìm giá trị lớn nhất (Find Maximum)
```csharp
public static int FindMax(int[] numbers)
{
    if (numbers == null || numbers.Length == 0)
    {
        throw new ArgumentException("Mảng rỗng hoặc null!");
    }

    int max = numbers[0];
    for (int i = 1; i < numbers.Length; i++)
    {
        if (numbers[i] > max)
        {
            max = numbers[i];
        }
    }
    return max;
}
```

### 2. Tính trung bình cộng (Average)
```csharp
public static double CalculateAverage(int[] numbers)
{
    if (numbers == null || numbers.Length == 0) return 0;

    int sum = 0;
    foreach (var num in numbers)
    {
        sum += num;
    }
    return (double)sum / numbers.Length;
}
```

---

## 4. Bẫy Kinh Điển Cần Tránh

1. **Lỗi Off-by-one:** Dùng toán tử `<= Length` thay vì `< Length`:
   ```csharp
   for (int i = 0; i <= numbers.Length; i++) // VĂNG LỖI: IndexOutOfRangeException ở bước cuối!
   ```
2. **Sửa mảng khi đang duyệt bằng `foreach`:** `foreach` sử dụng Enumerator bên dưới. Mặc dù bạn có thể sửa giá trị của một thuộc tính bên trong object, bạn không thể thay thế đối tượng hoặc thay đổi kích thước danh sách trong lúc duyệt.
