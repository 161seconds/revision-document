# Bài 03: Thao Tác Tệp Nhị Phân & Điều Hướng Ngẫu Nhiên (`fread`, `fwrite`, `fseek`, `ftell`)

Khảo sát cơ chế đọc/ghi khối byte nhị phân trực tiếp từ RAM xuống đĩa bằng `fread()` và `fwrite()`, lưu trữ Struct nhị phân, và kỹ thuật nhảy con trỏ đọc/ghi ngẫu nhiên với `fseek()`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: Thao Tác Tệp Văn Bản Text I/O](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/02-text-file-operations.md).
- **Trọng tâm hiện tại**:
  - Ghi khối byte nhị phân: `fwrite(ptr, size, count, fp)`.
  - Đọc khối byte nhị phân: `fread(ptr, size, count, fp)`.
  - Tuần tự hóa trực tiếp Struct thô xuống đĩa.
  - Điều hướng vị trí con trỏ: `fseek(fp, offset, whence)` (`SEEK_SET`, `SEEK_CUR`, `SEEK_END`).
  - Lấy vị trí byte hiện tại: `ftell(fp)`.
  - Tua lại đầu file: `rewind(fp)`.
  - Thuật toán đo chính xác kích thước file bằng `fseek` + `ftell`.
- **Tiếp theo**: [Bài 04: Kiểm Tra Lỗi & Dọn Dẹp Tập Tin](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/04-error-handling-and-cleanup.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Đọc Ghi Struct Nhị Phân Thô
Thay vì phải chuyển đổi số thành chuỗi văn bản (gây tốn CPU và phình to dung lượng), ta có thể ghi **bản sao nguyên vẹn từng byte từ RAM** xuống đĩa:

```c
typedef struct {
    int id;
    char name[30];
    double balance;
} Account;

// Ghi 1 struct xuống file nhị phân
Account acc1 = {1001, "Nguyen Van A", 50000.0};
FILE *fp = fopen("accounts.bin", "wb");
fwrite(&acc1, sizeof(Account), 1, fp);
fclose(fp);

// Đọc lại từ file nhị phân
Account loaded_acc;
fp = fopen("accounts.bin", "rb");
fread(&loaded_acc, sizeof(Account), 1, fp);
fclose(fp);
```

### 2.2. Điều Hướng Con Trỏ File Ngẫu Nhiên (Random Access)
- `fseek(fp, offset, whence)`:
  - `SEEK_SET`: Tính từ **đầu file** (`offset` $\ge 0$).
  - `SEEK_CUR`: Tính từ **vị trí hiện tại** (tiến hoặc lùi).
  - `SEEK_END`: Tính từ **cuối file** (`offset` thường $\le 0$).

```c
// Thuật toán kinh điển đo kích thước tệp (File Size)
fseek(fp, 0, SEEK_END);    // Nhảy con trỏ xuống tận cùng cuối file
long file_size = ftell(fp); // Đọc vị trí byte hiện tại -> Chính là kích thước file!
rewind(fp);                // Đưa con trỏ quay lại đầu file để sẵn sàng đọc
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Ghi Struct Chứa Con Trỏ Xuống File Nhị Phân
```c
typedef struct {
    int id;
    char *name; // ❌ CHỈ LƯU ĐỊA CHỈ CON TRỎ RAM (8 BYTES)!
} BadRecord;
```
- Nếu dùng `fwrite` để ghi `BadRecord` xuống đĩa, bạn chỉ lưu một con số địa chỉ RAM tạm thời (`0x7FFF...`). Khi chương trình tắt đi hoặc mang file sang máy tính khác, địa chỉ này trở nên vô nghĩa, gây Segmentation Fault khi cố giải tham chiếu!
- **Quy tắc**: Dùng mảng cố định `char name[50];` hoặc ghi độ dài chuỗi trước rồi ghi nội dung chuỗi sau.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [files_demo.c](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/files_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Giá trị trả về của `fread()` và `fwrite()` có ý nghĩa gì?**
   *Trả lời*: Chúng trả về **số lượng phần tử (`count`) được đọc hoặc ghi thành công**, chứ không phải số bytes! Nếu bạn gọi `fread(arr, sizeof(int), 10, fp)` mà giá trị trả về nhỏ hơn 10 (ví dụ bằng 6), nghĩa là chương trình đã chạm đến cuối file (EOF) hoặc gặp lỗi đọc I/O giữa chừng.
2. **`rewind(fp)` tương đương với lệnh `fseek` nào? Điểm khác biệt là gì?**
   *Trả lời*: `rewind(fp)` tương đương với `(void)fseek(fp, 0L, SEEK_SET);`. Điểm khác biệt duy nhất là `rewind(fp)` còn tự động **xóa sạch cờ báo lỗi (`clearerr(fp)`)** của luồng tệp.
