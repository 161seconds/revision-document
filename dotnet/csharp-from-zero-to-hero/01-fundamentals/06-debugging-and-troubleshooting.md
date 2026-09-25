# Bài 6: Kỹ Năng Debugging & Troubleshooting Chuyên Nghiệp

> **Trọng tâm bài học:** Làm chủ công cụ gỡ lỗi (Debugger) trong Visual Studio / VS Code, phân biệt Debug mode vs Release mode, nắm bắt các phím tắt cốt tử (F5, F9, F10, F11, Shift+F11) và sử dụng thành thạo các cửa sổ chẩn đoán: Watch, Locals, Call Stack và Immediate Window.

---

## 1. Triết Lý Của Việc Gỡ Lỗi (Debugging)

> *"Nếu việc lập trình là quá trình đưa lỗi vào code, thì gỡ lỗi là quá trình bóc tách từng lớp giả định sai lầm của chính mình."*

Rất nhiều người mới học code sử dụng phương pháp "Console.WriteLine Debugging" (chèn log bừa bãi vào khắp nơi). Phương pháp này tốn thời gian, làm bẩn mã nguồn và không thể kiểm tra được trạng thái bộ nhớ sâu bên trong luồng thực thi phức tạp. Debugger chuyên nghiệp giúp bạn **đóng băng thời gian**, bước từng dòng lệnh và soi rõ từng byte dữ liệu.

---

## 2. Bảng Phím Tắt Debugging "Sống Còn"

| Phím tắt | Lệnh (Command) | Ý nghĩa hoạt động |
| :---: | :--- | :--- |
| **F5** | **Start Debugging / Continue** | Bắt đầu chạy ứng dụng ở chế độ Debug hoặc tiếp tục chạy cho đến khi chạm Breakpoint tiếp theo. |
| **Ctrl + F5**| **Start Without Debugging** | Chạy ứng dụng ở chế độ Release trực tiếp, không gắn Debugger (tốc độ cao nhất). |
| **F9** | **Toggle Breakpoint** | Bật/tắt điểm dừng tại dòng con trỏ đang đứng. |
| **F10** | **Step Over** | Nhảy qua dòng lệnh hiện tại. Nếu dòng đó gọi một hàm khác, hàm đó sẽ thực thi xong toàn bộ mà không nhảy vào bên trong chi tiết. |
| **F11** | **Step Into** | Đi sâu vào bên trong thân hàm được gọi tại dòng hiện tại để kiểm tra chi tiết từng bước. |
| **Shift + F11**| **Step Out** | Thực thi nốt phần còn lại của hàm hiện tại và nhảy ngược ra ngoài hàm gọi cha (Caller). |

---

## 3. Các Cửa Sổ Chẩn Đoán Cốt Tử Trong Visual Studio

```
+-----------------------------------------------------------+
| Call Stack                                                |
|  -> BootCamp.Chapter.dll!Lesson6.FindBug(int[] data)      |
|     BootCamp.Chapter.dll!Program.Main(string[] args)      |
+-----------------------------------------------------------+
| Locals / Autos                        | Watch 1           |
|  - data: int[5] = {1, 2, 3, 4, 5}     |  - data.Length: 5 |
|  - i: 5                               |  - i < data.Length: false
+-----------------------------------------------------------+
| Immediate Window:                                         |
|  > data[0] + 10                                           |
|  11                                                       |
+-----------------------------------------------------------+
```

1. **Locals / Autos:** Hiển thị tự động tất cả các biến trong phạm vi hàm hiện tại và giá trị tức thời của chúng.
2. **Watch Window:** Cho phép bạn tự gõ các biểu thức tùy ý để theo dõi (ví dụ: `numbers.Length`, `index >= 0 && index < numbers.Length`, `user.IsActive`).
3. **Call Stack (Ngăn xếp cuộc gọi):** Hiển thị vết dấu vết các hàm đang lồng nhau. Cho biết luồng thực thi đã đi qua những hàm nào trước khi đến được vị trí hiện tại hoặc trước khi xảy ra sự cố văng Crash (Exception).
4. **Immediate Window:** Cho phép bạn thực thi trực tiếp các câu lệnh C#, gọi hàm, hoặc gán lại giá trị biến ngay tại thời điểm dừng mà không cần biên dịch lại chương trình!

---

## 4. Conditional Breakpoints (Điểm Dừng Có Điều Kiện)

Khi duyệt một mảng có 10,000 phần tử, nếu bạn nhấn F10 để lặp qua từng phần tử thì sẽ mất hàng giờ. Hãy click chuột phải vào dấu chấm đỏ Breakpoint -> Chọn **Conditions**:
- **Conditional Expression:** Ví dụ `i == 9500` hoặc `user.Id == "targeted-bug-user"`. Trình gỡ lỗi sẽ chỉ dừng lại duy nhất khi điều kiện này thỏa mãn!
- **Hit Count:** Dừng lại khi vòng lặp đã chạy qua đúng $N$ lần.
