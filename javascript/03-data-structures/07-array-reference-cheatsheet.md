# Bảng Tra Cứu Toàn Tập Về Mảng (JavaScript Array Reference & Big-O Cheatsheet)

Tài liệu tra cứu toàn diện (Master Reference) toàn bộ thuộc tính, phương thức tĩnh, phương thức biến đổi (Mutating), phương thức bất biến (Immutable/ES2023), và ma trận độ phức tạp thuật toán Big-O của `Array` trong JavaScript.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Packed vs Holey Elements).
  - [03-array-methods-mutating-vs-immutable.md](file:///d:/my-project/revision-document/javascript/03-data-structures/03-array-methods-mutating-vs-immutable.md) (Phân loại Mutating vs Immutable).
  - [06-array-iteration-and-higher-order.md](file:///d:/my-project/revision-document/javascript/03-data-structures/06-array-iteration-and-higher-order.md) (Phương thức lặp & Higher-Order).
- **Mở rộng tiếp theo (Next Steps):**
  - [08-objects-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Đối tượng & Object Properties).
  - Cấu trúc dữ liệu nâng cao: Linked List, Stack, Queue, Binary Heap.
- **Khái niệm liên quan (Related):**
  - Big-O Time & Space Complexity.
  - Iterable Protocol (`[Symbol.iterator]`).

---

## 2. Ma Trận Tra Cứu Toàn Diện (Master Big-O Matrix)

### 1. Phương Thức Tĩnh (Static Methods)
| Phương thức | Tham số | Kết quả trả về | Time | Space | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Array.isArray(val)` | `val` | `boolean` | $O(1)$ | $O(1)$ | Nhận diện mảng an toàn tuyệt đối Cross-Realm |
| `Array.from(src, mapFn)` | `Iterable / ArrayLike` | `Array` mới | $O(n)$ | $O(n)$ | Chuyển đổi và map trong 1 bước |
| `Array.of(...items)` | `...items` | `Array` mới | $O(n)$ | $O(n)$ | Không nhập nhằng như `new Array(3)` |

### 2. Phương Thức Biến Đổi (In-Place Mutating Methods)
| Phương thức | Thao tác | Giá trị trả về | Time | Space | Cảnh báo React State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `push(...items)` | Thêm vào cuối | **`length` mới** | $O(1)$ amortized | $O(1)$ | ⚠️ Mutate mảng gốc |
| `pop()` | Xóa ở cuối | **Phần tử bị xóa** | $O(1)$ | $O(1)$ | ⚠️ Mutate mảng gốc |
| `unshift(...items)`| Thêm vào đầu | **`length` mới** | **$O(n)$** | $O(1)$ | ⚠️ Chậm trên mảng lớn |
| `shift()` | Xóa ở đầu | **Phần tử bị xóa** | **$O(n)$** | $O(1)$ | ⚠️ Chậm trên mảng lớn |
| `splice(s, del, ...)`| Thêm/Sửa/Xóa | **Mảng bị xóa** | $O(n)$ | $O(1)$ | ⚠️ Không dùng trực tiếp trong setState |
| `sort(cmp)` | Sắp xếp (TimSort)| **Mảng gốc** | $O(n \log n)$ | $O(n)$ | ⚠️ Mặc định so sánh chuỗi Unicode |
| `reverse()` | Đảo ngược mảng | **Mảng gốc** | $O(n)$ | $O(1)$ | ⚠️ Mutate mảng gốc |
| `fill(val, s, e)` | Điền giá trị | **Mảng gốc** | $O(n)$ | $O(1)$ | ⚠️ Bẫy chia sẻ tham chiếu object |
| `copyWithin(t, s, e)`| Sao chép nội bộ | **Mảng gốc** | $O(n)$ | $O(1)$ | Sao chép khối nhớ trong mảng |

### 3. Phương Thức Bất Biến (Immutable / Change-by-Copy - Khuyên Dùng Cho React)
| Phương thức | Chuẩn | Mục đích | Time | Space |
| :--- | :--- | :--- | :--- | :--- |
| `toSorted(cmp)` | **ES2023** | Sắp xếp trả về mảng mới | $O(n \log n)$ | $O(n)$ |
| `toReversed()` | **ES2023** | Đảo ngược trả về mảng mới | $O(n)$ | $O(n)$ |
| `toSpliced(...)` | **ES2023** | Thêm/Xóa trả về mảng mới | $O(n)$ | $O(n)$ |
| `with(index, val)` | **ES2023** | Gán giá trị mới tại vị trí chỉ định | $O(n)$ | $O(n)$ |
| `slice(start, end)` | ES3 | Cắt mảng con (Shallow Copy) | $O(k)$ | $O(k)$ |
| `concat(...items)` | ES3 | Hợp nhất mảng | $O(n + m)$ | $O(n + m)$ |
| `flat(depth)` | ES2019 | Làm phẳng mảng lồng nhau & dọn holes | $O(n)$ | $O(n)$ |
| `flatMap(fn)` | ES2019 | Ánh xạ và làm phẳng 1 cấp (1-Pass) | $O(n)$ | $O(n)$ |

### 4. Phương Thức Tìm Kiếm & Kiểm Tra (Search & Inspection)
| Phương thức | Thuật toán so khớp | Giá trị trả về | Time | Dừng sớm (Short-circuit) |
| :--- | :--- | :--- | :--- | :--- |
| `indexOf(val, from)` | Strict Equality (`===`) | `index` hoặc `-1` | $O(n)$ | **CÓ** |
| `lastIndexOf(val)` | Strict Equality (`===`) | `index` hoặc `-1` | $O(n)$ | **CÓ** |
| `includes(val)` | **`SameValueZero`** (Hỗ trợ `NaN`) | `true` / `false` | $O(n)$ | **CÓ** |
| `find(predicate)` | Hàm điều kiện (Left-to-Right) | `element` hoặc `undefined` | $O(n)$ | **CÓ** |
| `findIndex(predicate)`| Hàm điều kiện (Left-to-Right) | `index` hoặc `-1` | $O(n)$ | **CÓ** |
| `findLast(predicate)` | **ES2023** (Right-to-Left) | `element` hoặc `undefined` | $O(n)$ | **CÓ** |
| `findLastIndex(pred)` | **ES2023** (Right-to-Left) | `index` hoặc `-1` | $O(n)$ | **CÓ** |
| `some(predicate)` | Hàm điều kiện (Tồn tại ít nhất 1) | `boolean` | $O(n)$ | **CÓ** (Dừng khi gặp true) |
| `every(predicate)` | Hàm điều kiện (Tất cả phần tử) | `boolean` | $O(n)$ | **CÓ** (Dừng khi gặp false) |

### 5. Giao Thức Lặp (Iterators & Conversion)
| Phương thức | Giá trị trả về | Cách sử dụng |
| :--- | :--- | :--- |
| `entries()` | Iterator chứa cặp `[index, element]` | `for (const [i, val] of arr.entries())` |
| `keys()` | Iterator chứa danh sách chỉ số | `for (const index of arr.keys())` |
| `values()` | Iterator chứa danh sách phần tử | `for (const val of arr.values())` hoặc `for...of arr` |
| `join(separator)`| Chuỗi nối các phần tử | `arr.join(", ")` |
| `toString()` | Chuỗi phân cách bởi dấu phẩy | `arr.toString()` |

---

## 3. Bảng Kiểm Tra Nhanh 5 Cạm Bẫy Kinh Điển (Top 5 Gotchas Checklist)

1. **Kiểm tra mảng:** KHÔNG dùng `typeof arr === "object"`. Dùng `Array.isArray(arr)`.
2. **Xóa phần tử:** KHÔNG dùng `delete arr[i]`. Dùng `splice()` hoặc `toSpliced()`.
3. **Sắp xếp số:** KHÔNG dùng `arr.sort()`. Dùng `arr.sort((a, b) => a - b)`.
4. **Tích lũy:** KHÔNG quên `initialValue` trong `reduce()`.
5. **Cập nhật React:** KHÔNG mutate `push/splice` trực tiếp. Dùng Spread `[...arr]` hoặc ES2023 `toSpliced`/`with`.

---

## 4. File Code Thực Hành

- [07-array-reference-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/07-array-reference-demo.js): Code thực nghiệm duyệt iterator `entries()`/`keys()`, bộ tứ bất biến ES2023 (`toSorted`, `toReversed`, `toSpliced`, `with`), và sao chép bộ nhớ nội bộ `copyWithin()`. Chạy bằng: `node 07-array-reference-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Bộ tứ phương thức bất biến (Change-by-Copy) được bổ sung trong ECMAScript 2023 là gì?**
   *Đáp án:* `toReversed()`, `toSorted()`, `toSpliced()`, và `with()`. Cả 4 phương thức này đều không thay đổi mảng gốc mà trả về một bản sao mới đã được áp dụng thay đổi.
2. **Phương thức `copyWithin(target, start, end)` làm gì và có làm thay đổi độ dài của mảng không?**
   *Đáp án:* `copyWithin` sao chép một chuỗi các phần tử bên trong mảng đến một vị trí khác ngay trong chính mảng đó mà **hoàn toàn không làm thay đổi độ dài (`length`)** của mảng.
