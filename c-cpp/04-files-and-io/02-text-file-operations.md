# Bài 02: Thao Tác Tệp Văn Bản (Text I/O: `fgets`, `fputs`, `fprintf`, `fscanf`)

Khảo sát chuyên sâu các hàm đọc/ghi tệp văn bản theo ký tự, theo dòng và theo định dạng, cùng với mẫu thiết kế chuẩn đọc file từng dòng (Line-by-line Processing).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Con Trỏ FILE* & Chế Độ Mở File](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/01-file-pointers-and-modes.md).
- **Trọng tâm hiện tại**:
  - Ghi văn bản: `fputc()` (1 ký tự), `fputs()` (chuỗi), `fprintf()` (chuỗi định dạng).
  - Đọc văn bản: `fgetc()` (1 ký tự), `fgets()` (1 dòng an toàn), `fscanf()` (đọc theo định dạng).
  - Mẫu code đọc từng dòng chuẩn với `fgets()`.
  - Loại bỏ ký tự xuống dòng `\n` còn sót lại trong bộ đệm.
- **Tiếp theo**: [Bài 03: Thao Tác Tệp Nhị Phân & Điều Hướng](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/03-binary-file-operations.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Mẫu Đọc Từng Dòng Chuẩn Với `fgets()`
```c
FILE *fp = fopen("notes.txt", "r");
if (fp == NULL) {
    perror("Khong the mo file de doc");
    return -1;
}

char line[256];
// fgets trả về con trỏ buffer nếu đọc được, trả về NULL khi chạm EOF hoặc lỗi
while (fgets(line, sizeof(line), fp) != NULL) {
    // Xóa ký tự '\n' ở cuối dòng nếu có
    line[strcspn(line, "\r\n")] = '\0';
    printf("Line: [%s]\n", line);
}

fclose(fp);
```

### 2.2. So Sánh `fgets()` vs `fscanf()`
- **`fgets()`**: Đọc **trọn vẹn một dòng văn bản** (kể cả chứa khoảng trắng dấu cách). Cực kỳ an toàn vì nhận tham số kích thước `sizeof(buffer)`.
- **`fscanf()`**: Đọc dữ liệu phân tách theo khoảng trắng (whitespace-delimited) và tự động ép kiểu sang số nguyên, số thực. Nhược điểm: Dễ bị tràn bộ đệm nếu đọc chuỗi mà không giới hạn độ rộng format (ví dụ `%50s`).

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Dùng `feof()` Làm Điều Kiện Dừng Của Vòng Lặp Đọc File
```c
// ❌ SAI KINH ĐIỂN: Lặp thừa 1 lần ở cuối file!
while (!feof(fp)) {
    fgets(buffer, sizeof(buffer), fp);
    printf("%s", buffer); // Dòng cuối cùng sẽ bị in 2 lần!
}
```
- **Bản chất**: Cờ `feof()` chỉ được bật lên **SAU KHI** một thao tác đọc đã thực sự chạm vào điểm kết thúc tệp và thất bại.
- **Giải pháp**: Luôn kiểm tra **kết quả trả về trực tiếp** của hàm đọc: `while (fgets(...) != NULL)`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [files_demo.c](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/files_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Hàm `fgetc()` trả về kiểu `int` chứ không phải `char`. Tại sao?**
   *Trả lời*: Hằng số báo hiệu kết thúc tệp `EOF` (End-of-File) thường có giá trị là `-1`. Kiểu `char` (đặc biệt là `unsigned char` trên một số kiến trúc ARM) không thể biểu diễn giá trị `-1` một cách an toàn mà không bị nhầm lẫn với ký tự byte `0xFF` (ký tự `ÿ` trong bảng mã ISO-8859-1). Do đó, `fgetc()` trả về `int` 32-bit: Chứa giá trị $0 \dots 255$ khi đọc thành công và trả về `-1` khi chạm `EOF`.
2. **`fputs()` khác gì với `puts()`?**
   *Trả lời*:
   - `puts(str)`: Tự động ghi chuỗi ra `stdout` và **tự động thêm ký tự xuống dòng `\n`** vào cuối.
   - `fputs(str, fp)`: Ghi chuỗi ra luồng chỉ định `fp` và **KHÔNG tự động thêm `\n`**, giữ nguyên vẹn nội dung chuỗi.
