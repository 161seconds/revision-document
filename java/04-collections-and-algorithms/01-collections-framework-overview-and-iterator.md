# Bài 01: Tổng Quan Collections Framework & Cơ Chế Con Trỏ `Iterator`

Phân tích kiến trúc tổng thể của Java Collections Framework, phân biệt `Collection` vs `Map`, cơ chế con trỏ duyệt dữ liệu `Iterator` và bản chất của lỗi sửa đổi đồng thời `ConcurrentModificationException`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Core OOP](file:///d:/my-project/revision-document/java/02-core-oop/README.md).
- **Trọng tâm hiện tại**:
  - Gốc rễ giao diện: `java.lang.Iterable<T>` và `java.util.Collection<T>`.
  - 3 nhánh chính của Collection: `List`, `Set`, `Queue`.
  - Nhánh độc lập: `java.util.Map<K, V>` (không kế thừa `Collection`).
  - Giao diện con trỏ: `Iterator<E>` (`hasNext()`, `next()`, `remove()`) và `ListIterator<E>`.
  - Cơ chế Fail-fast và biến đếm trạng thái thay đổi `modCount`.
- **Tiếp theo**: [Bài 02: List: ArrayList vs LinkedList](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/02-list-arraylist-vs-linkedlist.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cây Phân Cấp Khung Bộ Sưu Tập (JCF Hierarchy)
```
             Iterable<T>
                 │
           Collection<T>                      Map<K, V> (Độc lập)
      ┌──────────┼──────────┐                      │
      ▼          ▼          ▼                      ▼
   List<T>    Set<T>     Queue<T>        HashMap, TreeMap, LinkedHashMap
```
- Mọi collection hiện thực `Iterable<T>` đều có thể sử dụng được cú pháp vòng lặp enhanced `for (T item : collection)`.

### 2.2. Cơ Chế Fail-Fast & `ConcurrentModificationException`
- Bên trong các collection như `ArrayList`, `HashMap`, JVM duy trì một trường nội bộ gọi là **`modCount`** (số lần cấu trúc danh sách bị thêm/xóa phần tử).
- Khi một `Iterator` được khởi tạo, nó ghi nhớ giá trị: `expectedModCount = modCount`.
- Trong mỗi bước gọi `it.next()`, Iterator luôn kiểm tra:
  ```java
  if (modCount != expectedModCount)
      throw new ConcurrentModificationException();
  ```
- Nếu bạn gọi trực tiếp `list.remove()` hoặc `list.add()` trong khi vòng lặp for-each đang chạy, `modCount` tăng lên nhưng `expectedModCount` không được cập nhật $\rightarrow$ Ném ngoại lệ ngay lập tức để bảo vệ tính toàn vẹn dữ liệu.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Xóa Phần Tử Sai Cách Trong Vòng Lặp
```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

// ❌ SAI: Gây ConcurrentModificationException
for (String n : names) {
    if (n.equals("Bob")) names.remove(n);
}

// ✅ ĐÚNG: Dùng Iterator.remove() (Tự động đồng bộ expectedModCount = modCount)
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().equals("Bob")) it.remove();
}

// ✅ ĐÚNG: Dùng Predicate removeIf() (Java 8+)
names.removeIf(n -> n.equals("Bob"));
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [CollectionsDemo.java](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/CollectionsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao `Map` lại không kế thừa từ giao diện `Collection`?**
   *Trả lời*: `Collection` làm việc với một tập hợp các phần tử đơn lẻ (`E`), trong khi `Map` làm việc với các cặp khóa - giá trị (`<K, V>`). Các phương thức của `Collection` như `add(E e)`, `contains(Object o)` không tương thích về mặt ngữ nghĩa với `Map` (vốn cần `put(K key, V value)` và phân biệt giữa `containsKey` vs `containsValue`).
2. **`Iterator` khác `ListIterator` ở những điểm nào?**
   *Trả lời*:
   - `Iterator`: Áp dụng cho mọi `Collection` (List, Set, Queue), chỉ duyệt theo một chiều từ đầu đến cuối (`next()`), chỉ có thao tác `remove()`.
   - `ListIterator`: Chỉ áp dụng riêng cho `List`, duyệt được hai chiều tiến và lùi (`next()`, `previous()`), hỗ trợ thêm phần tử (`add()`) và thay thế phần tử (`set()`) trực tiếp tại vị trí con trỏ.
