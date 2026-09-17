# Database & SQL Revision Guide

Lộ trình và kho tài liệu ôn tập Cơ sở dữ liệu quan hệ (RDBMS) & SQL toàn diện từ cú pháp truy vấn, thao tác dữ liệu, các phép nối bảng, danh mục toàn bộ các hàm SQL, đến thiết kế lược đồ, chỉ mục B-Tree, giao dịch ACID và bảo mật hệ thống.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/database/summary.md)** | **Bảng tóm tắt toàn diện (Master SQL Cheat Sheet)** bao quát toàn bộ 74+ chủ đề W3Schools | Hoàn thành |
| **[01-sql-basics-and-filtering/](file:///d:/my-project/revision-document/database/01-sql-basics-and-filtering/README.md)** | Cú pháp ANSI SQL, `SELECT`, `DISTINCT`, Bí danh `AS`, Mệnh đề `WHERE`, Toán tử `AND`/`OR`/`NOT`, Độ ưu tiên toán tử, Sắp xếp `ORDER BY`, Phân trang `LIMIT`/`OFFSET`, Wildcards `LIKE`, `ESCAPE`, `IN`, `BETWEEN` | Hoàn thành |
| **[02-crud-and-aggregations/](file:///d:/my-project/revision-document/database/02-crud-and-aggregations/README.md)** | Thao tác DML (`INSERT`, `UPDATE`, `DELETE`), So sánh với `TRUNCATE`, Bản chất toán học của `NULL`, Logic Tam Trị 3VL, `COALESCE`, `IFNULL`, Phòng ngừa chia cho 0 với `NULLIF`, Các hàm tổng hợp (`COUNT`, `SUM`, `AVG`), Gom nhóm `GROUP BY`, Mệnh đề `HAVING`, Thứ tự thực thi logic | Hoàn thành |
| **[03-joins-subqueries-and-sets/](file:///d:/my-project/revision-document/database/03-joins-subqueries-and-sets/README.md)** | Các phép nối (`INNER`, `LEFT`, `RIGHT`, `FULL`, `SELF JOIN`), 3 Thuật toán nối vật lý (`Nested Loop`, `Hash Join`, `Merge Join`), Toán tử tập hợp (`UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`), Subqueries, Correlated Subqueries, Ngắt sớm `EXISTS`, Cấu trúc `CASE WHEN`, Kỹ thuật xoay trục Pivoting, `CTAS` | Hoàn thành |
| **[04-sql-functions-reference/](file:///d:/my-project/revision-document/database/04-sql-functions-reference/README.md)** | **Toàn bộ danh mục các hàm SQL**: Hàm chuỗi (`CONCAT`, `SUBSTRING`, `TRIM`, `INSTR`), Hàm số học & lượng giác (`ROUND`, `CEIL`, `FLOOR`, `ABS`, `MOD`), Hàm ngày giờ (`NOW`, `DATEDIFF`, Date Arithmetic), Ép kiểu `CAST`, và Chuyên đề **Window Functions** (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG`, `LEAD`, Running Total) | Hoàn thành |
| **[05-ddl-constraints-and-schema/](file:///d:/my-project/revision-document/database/05-ddl-constraints-and-schema/README.md)** | Quản trị CSDL (`CREATE`/`DROP DATABASE`, `BACKUP`), Tiến hóa schema (`ALTER TABLE`), Hệ thống ràng buộc toàn vẹn (`PRIMARY KEY`, `FOREIGN KEY` với `CASCADE`/`RESTRICT`, `UNIQUE`, `CHECK`, `DEFAULT`), Khóa tự tăng `AUTOINCREMENT` vs `UUID`, Khung nhìn ảo `VIEW` & Data Masking, Stored Procedures | Hoàn thành |
| **[06-indexes-transactions-and-security/](file:///d:/my-project/revision-document/database/06-indexes-transactions-and-security/README.md)** | Chỉ mục B-Tree, Clustered vs Non-Clustered Index, Quy tắc tiền tố Leftmost Prefix Rule, Covering Index, Đọc kế hoạch thực thi `EXPLAIN QUERY PLAN`, Giao dịch ACID, Điểm lưu `SAVEPOINT`, 4 Mức độ cô lập, Tấn công & Phòng thủ **SQL Injection** bằng Parameterized Queries, Ma trận Datatypes & Dialects | Hoàn thành |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con
Mỗi module đều bao gồm:
1. `README.md`: Lộ trình tóm lược + **Bản đồ liên kết bài học (Knowledge Links)** + Hướng dẫn chạy test.
2. Các file lý thuyết `.md`: Tuân thủ nghiêm ngặt 5 mục chuẩn (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file demo `.js`: Chạy thực tế các câu truy vấn SQL trên SQLite in-memory của Node.js.
4. `practice.js`: Bộ 5 thử thách tự động chấm điểm với 100% assertions thành công.
