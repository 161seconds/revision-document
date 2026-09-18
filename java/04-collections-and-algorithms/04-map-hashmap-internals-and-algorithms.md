# Bài 04: Bản Chất `HashMap` Dưới Góc Nhìn JVM & Thuật Toán `Collections`

Khảo sát chuyên sâu cấu trúc mảng bucket của `HashMap`, cơ chế giải quyết va chạm băm (Chaining), chuyển đổi Cây Đỏ-Đen (Treeification) và các thuật toán kinh điển trong lớp tiện ích `Collections`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Set & Hợp Đồng equals/hashCode](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/03-set-hashset-treeset-and-contracts.md).
- **Trọng tâm hiện tại**:
  - Giao diện `Map<K, V>`: Bộ từ điển cặp khóa - giá trị.
  - Kiến trúc `HashMap`: Mảng Node[] (Mặc định capacity = 16), Load Factor = 0.75, Threshold.
  - Cơ chế tính chỉ số Bucket: `(n - 1) & hash(key)`.
  - Cơ chế Treeification: Biến đổi từ LinkedList thành Red-Black Tree khi bucket $\ge 8$ phần tử.
  - `LinkedHashMap` (duy trì thứ tự chèn hoặc Access-order làm bộ nhớ đệm LRU Cache).
  - `TreeMap` (sắp xếp key $O(\log N)$).
  - Thuật toán `Collections`: `sort()`, `binarySearch()`, `reverse()`, `shuffle()`, `unmodifiableList()`.
- **Tiếp theo**: [Module 05: Java Nâng Cao, Đa Luồng & Lambdas](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Kiến Trúc Cốt Lõi Của `HashMap`
```
Mảng Node<K,V>[] table (Kích thước luôn là lũy thừa của 2: 16, 32, 64...)
Index:
[0] ──> Node(k1, v1) ──> Node(k2, v2) (Danh sách liên kết đơn)
[1] ──> null
...
[8] ──> TreeNode (Cây Đỏ-Đen Red-Black Tree khi danh sách dài >= 8 phần tử)
```

1. **Tính Hash Code & Chỉ số Bucket**:
   - Hàm hash rút gọn: `static final int hash(Object key) { int h; return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16); }`
   - Chỉ số bucket: `index = (capacity - 1) & hash`. (Phép toán AND bit cực nhanh, tương đương `hash % capacity`).
2. **Cơ chế Treeification (Từ Java 8)**:
   - Khi một bucket có từ **8 phần tử trở lên** VÀ tổng dung lượng mảng $\ge 64$: Danh sách liên kết đơn sẽ được biến đổi thành **Cây Đỏ-Đen (Red-Black Tree)**.
   - Giúp nâng hiệu năng tìm kiếm trường hợp xấu nhất từ $O(N)$ lên **$O(\log N)$**, ngăn chặn hoàn toàn tấn công từ chối dịch vụ (Hash Collision DoS Attack).

### 2.2. Các Thuật Toán Tiện Ích Trong `java.util.Collections`
- `Collections.sort(list)`: Thuật toán Timsort (kết hợp Merge Sort và Insertion Sort), ổn định (stable) với độ phức tạp $O(N \log N)$.
- `Collections.binarySearch(list, key)`: Tìm kiếm nhị phân $O(\log N)$ trên danh sách đã được sắp xếp.
- `Collections.reverse(list)`: Đảo ngược danh sách tại chỗ in-place.
- `Collections.shuffle(list)`: Xáo trộn ngẫu nhiên các phần tử (Fisher-Yates shuffle algorithm).
- `Collections.unmodifiableList(list)`: Bọc danh sách thành chế độ chỉ đọc (Read-only view), ném `UnsupportedOperationException` nếu gọi `.add()`.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Dùng `HashMap` Trong Môi Trường Đa Luồng
- `HashMap` **hoàn toàn không an toàn đa luồng (Not thread-safe)**.
- Trong Java 7, việc gọi `put()` đồng thời giữa nhiều luồng khi mảng đang resize có thể tạo thành **vòng lặp vô tận (Infinite Loop)** làm CPU nhảy lên 100%!
- **Khắc phục**: Luôn dùng **`ConcurrentHashMap`** trong môi trường đa luồng.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [CollectionsDemo.java](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/CollectionsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao dung lượng của mảng trong `HashMap` luôn luôn bắt buộc là lũy thừa của 2 ($2^N$)?**
   *Trả lời*:
   - Khi $C = 2^N$, phép chia lấy dư `hash % C` có thể được tính bằng toán tử bit siêu tốc: `hash & (C - 1)`. Phép toán bit trên CPU nhanh hơn phép chia số học hàng chục lần.
   - Khi dung lượng tăng gấp đôi ($2C$), vị trí bucket của mỗi phần tử chỉ có thể giữ nguyên ở `index` cũ hoặc chuyển sang `index + C`, giúp việc dời vị trí khi resize diễn ra cực kỳ tối ưu và phân bổ đều các bit.
2. **`Hashtable` khác `HashMap` ở những điểm nào? Tại sao không nên dùng `Hashtable`?**
   *Trả lời*:
   - `Hashtable` là class cổ từ Java 1.0, đồng bộ hóa bằng `synchronized` ở toàn bộ các phương thức (khóa toàn bộ bảng), gây nghẽn cổ chai nghiêm trọng.
   - `Hashtable` không cho phép bất kỳ key hoặc value nào là `null`, trong khi `HashMap` cho phép 1 key `null` và nhiều value `null`. Hiện nay, `ConcurrentHashMap` đã thay thế hoàn toàn `Hashtable`.
