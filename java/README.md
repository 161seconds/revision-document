# Java Revision Guide

Lộ trình và kho tài liệu ôn tập Java toàn diện từ cú pháp nền tảng, kiến trúc bộ nhớ JVM (Heap/Stack/Metaspace), 4 tính chất OOP, Xử lý ngoại lệ, File I/O Streams, Cấu trúc dữ liệu & Collections Framework, đến Concurrency đa luồng và Lập trình hàm (Lambdas).

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/java/summary.md)** | **Bảng tóm tắt toàn diện (Master Java Cheat Sheet)** bao quát hơn 80+ chủ đề W3Schools | Hoàn thành |
| **[01-basics-and-syntax/](file:///d:/my-project/revision-document/java/01-basics-and-syntax/README.md)** | Cú pháp Java, 8 kiểu nguyên thủy, Ép kiểu, `var`, Toán tử & Độ ưu tiên, Xử lý Chuỗi (Immutability & Pool), Điều khiển luồng, Switch Expressions, Mảng & Mảng đa chiều, Phương thức & Đệ quy, `Scanner` & `java.time` | Sẵn sàng |
| **[02-core-oop/](file:///d:/my-project/revision-document/java/02-core-oop/README.md)** | Lập trình hướng đối tượng chuyên sâu: 4 trụ cột (Đóng gói, Kế thừa, Đa hình, Trừu tượng), `this` & `super`, Bổ từ truy cập & Phi truy cập, Interface vs Abstract Class, Lớp ẩn danh (Anonymous Class), Enums có Constructor | Sẵn sàng |
| **[03-exceptions-and-io/](file:///d:/my-project/revision-document/java/03-exceptions-and-io/README.md)** | Phân cấp ngoại lệ (`Throwable` -> `Error` / `Exception`), Checked vs Unchecked, `try-catch-finally`, Multi-catch, `try-with-resources` (`AutoCloseable`), Thao tác File, Byte Streams vs Character Streams, `BufferedReader`/`BufferedWriter` | Sẵn sàng |
| **[04-collections-and-algorithms/](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/README.md)** | Java Collections Framework: `List` (ArrayList vs LinkedList), `Set` (HashSet, LinkedHashSet, TreeSet), `Map` (HashMap, LinkedHashMap, TreeMap), Cơ chế Hashing & Cây Đỏ-Đen, Hợp đồng `equals`/`hashCode`, `Iterator` & `ConcurrentModificationException` | Sẵn sàng |
| **[05-advanced-and-concurrency/](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/README.md)** | Generics & Nguyên tắc PECS, Wrapper Classes & Integer Cache, Annotations, Lập trình đa luồng (Thread & Runnable, Lifecycle, Synchronization), Biểu thức Lambda & Functional Interfaces, So sánh nâng cao (`Comparable` vs `Comparator`) | Sẵn sàng |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module trong hệ thống ôn tập bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. Các bài học lý thuyết `.md`: Tuân thủ 5 mục chuẩn (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file demo `.java`: Code mẫu thực nghiệm chuẩn xác, biên dịch và chạy độc lập bằng máy ảo JVM.
4. `Practice.java`: Bộ câu hỏi và bài tập thử thách tự động kiểm tra logic.

---

## Bản Đồ Liên Kết
- **Tiên quyết:** Tư duy lập trình căn bản, Cấu trúc dữ liệu và giải thuật cơ bản.
- **Tiếp theo:** Spring Framework, Spring Boot, Hibernate / JPA, Microservices Architecture.
