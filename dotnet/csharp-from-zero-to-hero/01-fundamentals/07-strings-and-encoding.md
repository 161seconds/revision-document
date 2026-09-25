# Bài 7: Chuỗi Ký Tự & Mã Hóa (Strings & Encoding)

> **Trọng tâm bài học:** Tính bất biến của chuỗi (`String Immutability`), vùng nhớ String Intern Pool, tối ưu hóa ghép chuỗi bằng `StringBuilder`, định dạng chuỗi nội suy (String Interpolation) và bản chất bảng mã ASCII, UTF-8, UTF-16.

---

## 1. Bản Chất Bất Biến (Immutability) Của `string` Trong C#

Trong .NET, `string` là một kiểu tham chiếu (Reference Type), nhưng nó được thiết kế **bất biến (Immutable)**.
- Khi bạn gán lại hoặc thực hiện phép nối chuỗi (`+` hoặc `+=`), chuỗi ban đầu **không bị thay đổi**.
- Thay vào đó, CLR sẽ tạo ra một vùng nhớ hoàn toàn mới trên Heap để chứa chuỗi kết quả mới, và chuỗi cũ trở thành rác (Garbage) chờ Garbage Collector thu hồi.

```csharp
string text = "Hello";
text += " World"; // Tạo ra 1 object string mới trên Heap! "Hello" cũ trở thành rác.
```

> [!WARNING]
> **Bẫy hiệu năng kinh điển:** Nối chuỗi trong vòng lặp lớn bằng toán tử `+`:
> ```csharp
> // ❌ Cực kỳ chậm, gây áp lực khủng khiếp lên Garbage Collector (O(N^2) memory allocations)
> string result = "";
> for (int i = 0; i < 10000; i++)
> {
>     result += i.ToString();
> }
> 
> // ✅ Sử dụng StringBuilder (Cấp phát buffer có thể thay đổi kích thước)
> var sb = new System.Text.StringBuilder();
> for (int i = 0; i < 10000; i++)
> {
>     sb.Append(i);
> }
> string result = sb.ToString();
> ```

---

## 2. Các Phương Thức Chuỗi Phổ Biến & String Interpolation

- **Nội suy chuỗi (String Interpolation - Cú pháp `$""`):** Trực quan và an toàn hơn `string.Format`.
  ```csharp
  string name = "Almantas";
  int age = 30;
  string message = $"Xin chào, tôi là {name}, năm nay {age} tuổi.";
  ```
- **Các hàm phân tích dữ liệu văn bản:**
  - `text.Split(',')`: Cắt chuỗi thành mảng các chuỗi con theo ký tự phân cách (rất quan trọng trong xử lý file CSV/text).
  - `text.Trim()`: Loại bỏ khoảng trắng thừa ở 2 đầu.
  - `text.ToUpper()`, `text.ToLower()`: Chuyển đổi chữ hoa / chữ thường.
  - `text.Contains("keyword")`, `text.StartsWith("prefix")`, `text.EndsWith("suffix")`.
  - `string.IsNullOrEmpty(text)`, `string.IsNullOrWhiteSpace(text)`: Kiểm tra chuỗi rỗng an toàn.

---

## 3. Bản Chất Bảng Mã Ký Tự (Encoding: ASCII vs UTF-8 vs UTF-16)

- **ASCII:** Sử dụng 7 bits (0 -> 127) để biểu diễn các ký tự tiếng Anh cơ bản, số và ký tự điều khiển.
- **Unicode (UCS):** Tiêu chuẩn toàn cầu gán cho mỗi ký tự trong mọi ngôn ngữ trên thế giới một số định danh duy nhất (Code Point).
- **UTF-8:** Mã hóa Unicode có độ dài biến đổi (1 byte cho ASCII, 2-4 bytes cho các ngôn ngữ khác như tiếng Việt, Nhật, Trung). Cực kỳ phổ biến trên Web và truyền nhận dữ liệu mạng.
- **UTF-16:** C# và .NET sử dụng UTF-16 bên trong bộ nhớ cho kiểu `char` (mỗi `char` chiếm 2 bytes).

### Chuyển đổi chuỗi thành mảng byte và ngược lại:
```csharp
using System.Text;

string original = "Lập trình C# Từ Zero Đến Hero";

// Mã hóa chuỗi sang mảng byte UTF-8
byte[] bytes = Encoding.UTF8.GetBytes(original);

// Giải mã mảng byte trở lại chuỗi
string decoded = Encoding.UTF8.GetString(bytes);
```
