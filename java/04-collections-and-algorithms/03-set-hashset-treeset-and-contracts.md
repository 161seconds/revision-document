# Bài 03: Giao Diện `Set`: So Sánh `HashSet`, `TreeSet` & Hợp Đồng `equals()` / `hashCode()`

Phân tích sâu về cấu trúc tập hợp không trùng lặp, kiến trúc ngầm định của `HashSet`, `LinkedHashSet`, `TreeSet` và quy tắc sống còn của hợp đồng giữa `equals()` và `hashCode()`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: List: ArrayList vs LinkedList](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/02-list-arraylist-vs-linkedlist.md).
- **Trọng tâm hiện tại**:
  - Giao diện `Set<E>`: Tập hợp các phần tử duy nhất, không trùng lặp (Uniqueness).
  - `HashSet`: Sử dụng bảng băm (Hash Table), không đảm bảo thứ tự, thao tác $O(1)$.
  - `LinkedHashSet`: Bảng băm kết hợp danh sách liên kết đôi, bảo toàn thứ tự chèn phần tử (Insertion Order).
  - `TreeSet`: Hiện thực dựa trên Cây Đỏ-Đen (Red-Black Tree), sắp xếp phần tử tự động theo thứ tự tự nhiên hoặc qua `Comparator`, độ phức tạp $O(\log N)$.
  - Hợp đồng bất biến (The Contract) giữa `equals()` và `hashCode()`.
- **Tiếp theo**: [Bài 04: Map: Bản Chất HashMap, TreeMap & Algorithms](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/04-map-hashmap-internals-and-algorithms.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Ngầm Định Của `HashSet`
- Bên trong mã nguồn JDK, **`HashSet` thực chất là một chiếc vỏ bọc (Wrapper) quanh một đối tượng `HashMap`**:
  ```java
  private transient HashMap<E, Object> map;
  private static final Object PRESENT = new Object(); // Đối tượng hằng số giả lập làm value

  public boolean add(E e) {
      return map.put(e, PRESENT) == null; // Lưu phần tử của Set vào làm KEY của HashMap
  }
  ```
- Do các `Key` trong `HashMap` không bao giờ được trùng lặp, `HashSet` tự động kế thừa tính chất duy nhất này!

### 2.2. Hợp Đồng Giữa `equals()` và `hashCode()`

```
  Nếu a.equals(b) == true
  ────────── BẮT BUỘC ──────────► a.hashCode() == b.hashCode()

  Nếu a.hashCode() == b.hashCode()
  ──────── CHƯA CHẮC ───────────► a.equals(b) == true (Đây là va chạm băm - Hash Collision)
```

- Nếu ghi đè `equals()` mà **không ghi đè `hashCode()`**: Hai đối tượng có cùng thuộc tính logic sẽ sinh ra hai mã `hashCode()` khác nhau (do dùng mã hash mặc định dựa trên địa chỉ bộ nhớ từ lớp `Object`). Kết quả là `HashSet` hoặc `HashMap` sẽ lưu trữ cả hai đối tượng này vào hai bucket khác nhau, **phá vỡ quy tắc tập hợp không trùng lặp**!

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Biến Đổi Thuộc Tính Của Đối Tượng Đã Nằm Trong `HashSet`
Nếu bạn thêm một đối tượng có thuộc tính mutable vào `HashSet`, sau đó thay đổi thuộc tính đó (vốn tham gia vào việc tính `hashCode`):
```java
Person p = new Person("Alice");
set.add(p);
p.setName("Bob"); // Đổi tên làm thay đổi hashCode của p!
System.out.println(set.contains(p)); // ❌ Trả về FALSE! Đối tượng bị "lạc trôi" vĩnh viễn trong Set!
```
- **Quy tắc**: Chỉ dùng các đối tượng **bất biến (Immutable)** làm phần tử trong `Set` hoặc làm `Key` trong `Map`.

### Bẫy 2: Thêm `null` vào `TreeSet`
- `HashSet` cho phép chứa 1 phần tử `null`.
- `TreeSet` **tuyệt đối cấm `null`** (ném ra `NullPointerException` ngay lập tức) vì nó cần gọi `compareTo()` để xác định vị trí trên cây nhị phân.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [CollectionsDemo.java](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/CollectionsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **So sánh sự khác nhau về cơ chế sắp xếp giữa `LinkedHashSet` và `TreeSet`?**
   *Trả lời*:
   - `LinkedHashSet`: Lưu trữ theo **thứ tự thời gian được chèn vào (Insertion-order)** bằng danh sách liên kết đôi giữa các node. Không sắp xếp độ lớn bé.
   - `TreeSet`: Sắp xếp các phần tử theo **độ lớn giá trị (Sorted-order)** theo thứ tự tự nhiên (thông qua `Comparable`) hoặc qua tiêu chí tùy chỉnh (thông qua `Comparator`).
2. **Nếu hai đối tượng có `hashCode()` trùng nhau thì chuyện gì xảy ra khi lưu vào `HashSet`?**
   *Trả lời*: Xảy ra hiện tượng **Va chạm băm (Hash Collision)**. Cả hai đối tượng sẽ rơi vào cùng một ngăn chứa (Bucket). JVM tiếp tục gọi phương thức `equals()` để so sánh:
   - Nếu `equals() == true`: Đối tượng mới bị coi là trùng lặp và bị loại bỏ.
   - Nếu `equals() == false`: Cả hai đối tượng cùng được lưu trong bucket đó (dưới dạng danh sách liên kết hoặc Cây Đỏ-Đen).
