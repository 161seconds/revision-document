# Tổng Hợp Bài Tập & Thử Thách Chapter 1 (Homework & Challenges)

> Toàn bộ 10 đề bài thực hành lớn và 2 dự án thử thách (Challenges) trích xuất trực tiếp từ các nhánh git của repo `Almantask/CSharp-From-Zero-To-Hero`.

---

## 🎯 Bài Tập 1 & 2: Console I/O, Biến & Git (`Chapter1/Homework/1And2`)

### Đề bài:
Đọc từ bàn phím họ tên, tuổi, cân nặng (kg) và chiều cao (cm) của 2 người.
1. In thông báo theo định dạng chuẩn:
   ```text
   Tom Jefferson is 19 years old, his weight is 50 kg and his height is 156.5 cm.
   ```
2. Tính toán và in chỉ số BMI:
   $$\text{BMI} = \frac{\text{Cân nặng (kg)}}{(\text{Chiều cao (m)})^2}$$
3. Lặp lại cho người thứ 2.
4. Tạo Pull Request trên GitHub vào nhánh `Chapter1/Homework/1And2`.

---

## 🎯 Bài Tập 3: Clean Code & Trích Xuất Hàm (`Chapter1/Homework/3`)

### Đề bài:
Tái cấu trúc (Refactor) lại toàn bộ mã nguồn của Bài 1 & 2:
- Không viết code trùng lặp (DRY).
- Tạo lớp `Lesson3` với các hàm độc lập:
  - `PromptString(string message)`
  - `PromptInt(string message)`
  - `PromptFloat(string message)`
  - `CalculateBmi(float weightKg, float heightM)`

---

## 🎯 Bài Tập 4: Validation & Xử Lý Dữ Liệu Rác (`Chapter1/Homework/4`)

### Đề bài:
Bổ sung kiểm tra tính hợp lệ của dữ liệu đầu vào. Người dùng có thể nhập ký tự lạ, số âm hoặc để trống:
- Nếu nhập tên rỗng: Trả về `"-"` và in lỗi: `"Name cannot be empty."`
- Nếu tuổi `<= 0`: Trả về `-1` và in lỗi: `"{age} is not a valid age."`
- Nếu cân nặng hoặc chiều cao `<= 0`: Trả về `-1` và in lỗi tương ứng.
- Đảm bảo toàn bộ 100% Unit Tests trong dự án test của repo đều Pass (Xanh lá).

---

## 🎯 Bài Tập 5: Thao Tác Mảng & Xử Lý Số Liệu (`Chapter1/Homework/5`)

### Đề bài:
Đọc một mảng số nguyên từ người dùng hoặc file và thực hiện các thuật toán:
1. `FindMax(int[] numbers)`: Tìm số lớn nhất.
2. `FindMin(int[] numbers)`: Tìm số nhỏ nhất.
3. `CalculateAverage(int[] numbers)`: Tính trung bình cộng.
4. `SortAscending(int[] numbers)`: Cài đặt thuật toán sắp xếp (ví dụ: Bubble Sort hoặc Selection Sort).

---

## 🎯 Bài Tập 6: Debugging & Truy Tìm Lỗi (`Chapter1/Homework/6`)

### Đề bài:
Kho chứa cung cấp một đoạn mã có sẵn chứa 5 lỗi logic tiềm ẩn (Off-by-one, sai thứ tự ưu tiên toán tử, Null Reference khi chuỗi rỗng).
- Sử dụng Visual Studio Debugger (F9, F10, F11, Watch Window).
- Định vị chính xác dòng gây lỗi, giải thích nguyên nhân và sửa lại cho đúng.

---

## 🎯 Bài Tập 7: Phân Tích & Thao Tác Chuỗi (`Chapter1/Homework/7`)

### Đề bài:
Viết chương trình phân tích văn bản:
- Đếm số từ, số nguyên âm, số phụ âm trong một chuỗi.
- Đảo ngược chuỗi mà không dùng thư viện có sẵn `Array.Reverse`.
- Kiểm tra một chuỗi có phải là Palindrome (chuỗi đối xứng) hay không (ví dụ: `"radar"`, `"level"`).

---

## 🎯 Bài Tập 8: Xử Lý File Bảng Dữ Liệu (`Chapter1/Homework/8`)

### Đề bài:
Đọc file văn bản chứa dữ liệu người dùng phân tách bằng dấu phẩy:
```csv
Tom,19,50,156.5
Alice,24,55,165.0
Bob,30,85,180.2
```
1. Đọc từng dòng bằng `File.ReadAllLines`.
2. Dùng `.Split(',')` để bóc tách thông tin.
3. Tính toán BMI cho từng người và ghi ra file kết quả `bmi_results.txt`.
4. Bọc toàn bộ trong khối `try-catch-finally` để bắt ngoại lệ file không tồn tại hoặc dữ liệu lỗi dòng.

---

## 🎯 Bài Tập 9 & 10: Mã Hóa & Mô Phỏng Ngẫu Nhiên (`Chapter1/Homework/9`, `10`)

- **Bài 9 (Mã hóa Caesar Cipher):** Dịch chuyển mỗi chữ cái trong chuỗi đi $K$ vị trí theo bảng mã ASCII.
- **Bài 10 (Mô phỏng Xúc xắc & Tần suất):** Tung 2 con xúc xắc 10,000 lần bằng `System.Random`. Tính xác suất xuất hiện của các tổng từ 2 đến 12 và kiểm chứng quy luật phân phối chuẩn.

---

## 🚀 Thử Thách Lớn: Game Hangman (`Chapter1/Challenges/Hangman`)

### Luật chơi:
- Máy tính chọn ngẫu nhiên một từ bí mật từ danh sách từ khóa.
- Người chơi đoán từng chữ cái một.
- Nếu đoán đúng: hiển thị chữ cái đó tại tất cả các vị trí trùng khớp trong từ (ví dụ: `_ a _ _ a _`).
- Nếu đoán sai: người chơi mất 1 mạng (tối đa 6 mạng).
- Thắng cuộc khi đoán hết các chữ cái, thua cuộc khi hết mạng.
- **Cấu trúc kỹ thuật:** Sử dụng mảng ký tự `char[]`, vòng lặp `while`, xử lý chuỗi và `StringBuilder`.
