# Bài 04: Cài Đặt Danh Sách Liên Kết Đơn (Singly Linked List) & Ngăn Xếp Bằng C Thuần

Khảo sát cấu trúc dữ liệu tự trỏ (Self-referential struct), cách cấp phát và nối các nút (Nodes) trên Heap, thao tác chèn đầu, chèn đuôi, xóa nút và giải phóng toàn bộ danh sách liên kết.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Struct & Typedef](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/01-structures-and-typedef.md).
- **Trọng tâm hiện tại**:
  - Cấu trúc tự trỏ `struct Node { int data; struct Node *next; }`.
  - Thao tác chèn vào đầu danh sách (`push_front` $O(1)$) qua con trỏ cấp 2 `Node **head`.
  - Thao tác chèn vào đuôi danh sách (`append` $O(N)$).
  - Duyệt và in danh sách liên kết.
  - Giải phóng bộ nhớ toàn bộ danh sách an toàn không để rò rỉ RAM.
  - Hiện thực Ngăn xếp (Stack) LIFO dựa trên Linked List.
- **Tiếp theo**: [Module 04: Xử Lý Tập Tin File I/O Streams](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Kiến Trúc Bộ Nhớ Của Danh Sách Liên Kết
Mỗi phần tử (Node) là một đối tượng độc lập được cấp phát rải rác trên **Heap**, kết nối với nhau thông qua con trỏ địa chỉ `next`:

```
Stack                     Heap
+---------+         +--------------+         +--------------+
|  head   |=======> | data: 10     | ======> | data: 20     | ======> NULL
+---------+         | next: 0x2000 |         | next: NULL   |
                    +--------------+         +--------------+
                     Địa chỉ: 0x1000          Địa chỉ: 0x2000
```

### 2.2. Thao Tác Thêm Vào Đầu (Push Front)
```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;

void push_front(Node **head_ref, int new_data) {
    Node *new_node = (Node*) malloc(sizeof(Node));
    new_node->data = new_data;
    new_node->next = *head_ref; // Trỏ tới head hiện tại
    *head_ref = new_node;       // Cập nhật head mới
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Giải Phóng Danh Sách Liên Kết Sai Cách (Dangling Dereference)
```c
// ❌ SAI: Truy cập con trỏ đã bị free!
Node *curr = head;
while (curr != NULL) {
    free(curr);          // Vừa giải phóng curr...
    curr = curr->next;   // ❌ LỖI: Đọc trường 'next' từ ô nhớ vừa bị hủy!
}

// ✅ ĐÚNG: Luôn lưu tạm con trỏ kế tiếp trước khi free
Node *curr = head;
while (curr != NULL) {
    Node *next = curr->next; // Lưu lại
    free(curr);
    curr = next;
}
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [structs_demo.c](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/structs_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao hàm `push_front` lại nhận tham số là `Node **head_ref` thay vì `Node *head`?**
   *Trả lời*: Vì trong C, mọi tham số đều truyền theo giá trị (Pass-by-value). Nếu chỉ truyền `Node *head`, việc gán `head = new_node;` chỉ làm thay đổi bản sao cục bộ của con trỏ trong hàm, biến `head` gốc ở hàm `main` sẽ không hề thay đổi. Truyền con trỏ cấp 2 `Node **head_ref` cho phép hàm thay đổi trực tiếp con trỏ `head` ngoài `main`.
2. **So sánh ưu nhược điểm giữa Danh sách liên kết (Linked List) và Mảng (Array)?**
   *Trả lời*:
   - **Mảng**: Truy xuất ngẫu nhiên cực nhanh $O(1)$, tận dụng tối đa CPU Cache do ô nhớ liên tiếp. Nhược điểm: Kích thước cố định hoặc tốn công mở rộng mảng, chèn/xóa ở đầu/giữa tốn $O(N)$.
   - **Linked List**: Thêm/xóa ở đầu cực nhanh $O(1)$, kích thước co giãn động linh hoạt không cần tái cấp phát mảng. Nhược điểm: Truy xuất tuần tự $O(N)$, tốn thêm bộ nhớ cho các con trỏ `next`, không tận dụng được CPU Cache do các node nằm rải rác trên Heap.
