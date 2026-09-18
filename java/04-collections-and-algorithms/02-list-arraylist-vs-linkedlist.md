# Bài 02: Giao Diện `List`: So Sánh Chuyên Sâu `ArrayList` vs `LinkedList`

Phân tích sâu về cơ chế quản lý mảng động bên trong của `ArrayList`, kiến trúc nút liên kết đôi của `LinkedList` và ma trận so sánh độ phức tạp Big-O trong các tình huống thực tế.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Tổng Quan Collections & Iterator](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/01-collections-framework-overview-and-iterator.md).
- **Trọng tâm hiện tại**:
  - Giao diện `List<E>`: Duy trì thứ tự chèn, truy cập theo chỉ số `get(index)`, cho phép trùng lặp.
  - `ArrayList`: Mảng động `Object[] elementData`, dung lượng ban đầu (Default Capacity = 10), công thức mở rộng mảng ($1.5\times$).
  - `LinkedList`: Danh sách liên kết đôi (Doubly-Linked List) gồm các Node (`prev`, `item`, `next`).
  - Ma trận so sánh Big-O: Truy xuất ngẫu nhiên, Thêm/Xóa ở đầu, giữa và cuối danh sách.
- **Tiếp theo**: [Bài 03: Set: HashSet, TreeSet & Hợp Đồng equals/hashCode](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/03-set-hashset-treeset-and-contracts.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cơ Chế Tăng Trưởng Của `ArrayList`
- `ArrayList` lưu trữ các phần tử trong một mảng liên tiếp trên Heap: `transient Object[] elementData;`.
- Khi mảng bị đầy (vượt quá `capacity`), phương thức `grow()` được kích hoạt:
  $$\text{newCapacity} = \text{oldCapacity} + (\text{oldCapacity} >> 1) \approx 1.5 \times \text{oldCapacity}$$
- JVM cấp phát mảng mới lớn gấp 1.5 lần và sao chép toàn bộ phần tử cũ sang bằng hàm cấp thấp `Arrays.copyOf()` (sử dụng `System.arraycopy`).

### 2.2. Ma Trận So Sánh Hiệu Năng Big-O

| Thao Tác Nghiệp Vụ | `ArrayList` | `LinkedList` | Phân Tích Kỹ Thuật |
| :--- | :---: | :---: | :--- |
| **Truy xuất ngẫu nhiên `get(i)`** | **$O(1)$** | **$O(N)$** | `ArrayList` tính trực tiếp địa chỉ offset bộ nhớ; `LinkedList` phải duyệt từng node từ đầu hoặc đuôi. |
| **Thêm vào cuối danh sách `add()`** | **$O(1)$ amortized** | **$O(1)$** | `ArrayList` tốn chi phí mở rộng mảng khi đầy, nhưng trung bình là $O(1)$. |
| **Thêm/Xóa ở đầu danh sách** | **$O(N)$** | **$O(1)$** | `ArrayList` phải dịch chuyển toàn bộ $N$ phần tử sang phải 1 bước (`System.arraycopy`). |
| **Thêm/Xóa ở giữa danh sách** | **$O(N)$** | **$O(N)$** | Cả hai đều tốn $O(N)$ (ArrayList tốn công dịch mảng, LinkedList tốn công duyệt tìm vị trí). |
| **Chi phí tiêu tốn bộ nhớ (Memory Overhead)** | **Thấp** | **Cao** | `LinkedList` mỗi phần tử tốn thêm 1 Node Object chứa 2 con trỏ `prev` và `next` (tốn thêm 24 byte/node trên JVM 64-bit). |

> [!TIP]
> **Quy Tắc Thực Tế**: Trong hơn 95% trường hợp thực tế, **luôn luôn chọn `ArrayList`**! Tính chất liên tục trong bộ nhớ của mảng tận dụng tối đa cơ chế **CPU Cache Line / Locality of Reference**, khiến `ArrayList` chạy nhanh hơn `LinkedList` ngay cả với một số thao tác chèn.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Tái Cấp Phát Mảng Quá Nhiều Lần Với `ArrayList`
- Nếu bạn cần lưu trữ 1.000.000 phần tử mà chỉ khởi tạo `new ArrayList<>()` (capacity = 10), danh sách sẽ phải mở rộng và sao chép mảng hàng chục lần, gây tốn CPU và phân mảnh Heap.
- **Khắc phục**: Luôn khởi tạo trước kích thước ước lượng nếu biết trước: `new ArrayList<>(1_000_000)`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [CollectionsDemo.java](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/CollectionsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **`LinkedList` ngoài hiện thực `List` còn hiện thực giao diện nào khác? Ứng dụng thực tế là gì?**
   *Trả lời*: `LinkedList` còn hiện thực giao diện `Deque<E>` (Double-ended Queue) và `Queue<E>`. Nó có thể được sử dụng làm ngăn xếp **Stack** (`push()`, `pop()`) hoặc hàng đợi hai đầu **Deque** (`addFirst()`, `removeLast()`) với hiệu năng $O(1)$ ở hai đầu.
2. **Tại sao `Vector` ít còn được sử dụng trong các dự án Java hiện đại?**
   *Trả lời*: `Vector` là một class di sản (legacy) từ Java 1.0. Hầu như mọi phương thức của nó đều được đánh dấu `synchronized`, dẫn đến suy giảm hiệu năng nghiêm trọng trong môi trường đơn luồng. Khi cần an toàn đa luồng hiện đại, lập trình viên sử dụng `CopyOnWriteArrayList` hoặc `Collections.synchronizedList()`.
