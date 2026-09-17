# Kiến Trúc Nội Tại Của Git & Hệ Thống Lưu Trữ Hướng Nội Dung (Git Internals)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - Hệ điều hành & Hệ thống tập tin (File System, I/O, Đường dẫn tương đối/tuyệt đối).
  - Khái niệm hàm băm mật mã học (Cryptographic Hash Functions: SHA-1, SHA-256).
- **Khái niệm tương quan**:
  - **Content-Addressable Storage (CAS)**: Git không quản lý file theo tên hay thư mục, mà quản lý dữ liệu thuần túy theo mã băm nội dung của chính file đó.
  - **Directed Acyclic Graph (DAG)**: Lịch sử commit của Git là một đồ thị có hướng không chu trình, trong đó mỗi commit trỏ ngược về commit cha (parent commit).
- **Điểm đến tiếp theo**:
  - [02-basic-commands-and-staging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/02-basic-commands-and-staging.md) (Quy trình làm việc với Working Tree, Staging Area và Commit).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Kiến Trúc 3 Cây (The Three Trees Architecture)
Git quản lý trạng thái dự án thông qua sự dịch chuyển dữ liệu giữa 3 khu vực độc lập:

```
+-------------------------------------------------------------------------------+
|                             KIẾN TRÚC 3 CÂY CỦA GIT                           |
|                                                                               |
|   1. WORKING TREE            2. INDEX (STAGING)         3. REPOSITORY (HEAD)  |
|  (Thư mục làm việc)         (Vùng chuẩn bị commit)       (Lịch sử đã ghi lại) |
|                                                                               |
|   [ File thực tế trên đĩa ]                                                   |
|             |                                                                 |
|             |=== git add ====>  [ Binary Index File ]                         |
|             |                   (.git/index)                                  |
|             |                            |                                    |
|             |                            |=== git commit ===>  [ Commit DAG ] |
|             |                            |                     (.git/objects) |
|             |<====== git checkout / restore ==========================|       |
+-------------------------------------------------------------------------------+
```

1. **Working Tree**: Không gian làm việc trên ổ đĩa chứa các file bạn có thể trực tiếp mở và chỉnh sửa bằng code editor.
2. **Index (Staging Area)**: Một file nhị phân duy nhất tại `.git/index`. Đây là bản phác thảo chính xác của commit tiếp theo.
3. **Repository (HEAD)**: Cơ sở dữ liệu đối tượng được lưu vĩnh viễn trong thư mục `.git/objects`, được trỏ tới bởi con trỏ `HEAD`.

### 2.2. Bốn Đối Tượng Cốt Lõi Của Git (The 4 Object Types)
Trong thư mục `.git/objects/`, mọi thứ đều là một trong 4 loại đối tượng bất biến được nén bằng `zlib` và định danh bằng mã băm SHA-1 (40 ký tự hexa):

| Loại Object | Vai trò kỹ thuật | Cấu trúc nội dung |
| :--- | :--- | :--- |
| **`blob`** (Binary Large Object) | Lưu nội dung thuần túy của một file (không lưu tên file hay quyền thực thi). | `blob <size>\0<content>` |
| **`tree`** | Đại diện cho một thư mục. Lưu danh sách con trỏ trỏ tới các `blob` và các `tree` con kèm tên và quyền file (chmod). | `tree <size>\0<mode> <type> <hash>\t<name>` |
| **`commit`** | Snapshot của toàn bộ dự án tại một thời điểm. Trỏ tới một Top-level `tree`, commit cha (`parent`), tác giả (`author`), người commit (`committer`) và thông điệp commit. | `commit <size>\0tree <hash>\nparent <hash>\n...` |
| **`tag`** (Annotated) | Con trỏ vĩnh viễn trỏ tới một commit cụ thể kèm chữ ký, tagger và ghi chú phát hành. | `tag <size>\0object <hash>\ntype commit\n...` |

```
[Commit Object: 4a2b1c...]
  ├── tree: 8f9e0d... (Thư mục gốc)
  │     ├── blob: a1b2c3...  "README.md"
  │     └── tree: 123456...  "src/"
  │           └── blob: 789abc...  "index.js"
  ├── parent: 1f2e3d... (Commit trước đó)
  └── author/committer: Dev <dev@company.com>
```

### 2.3. Giải Phẫu Thư Mục `.git/`
- `HEAD`: File văn bản chứa tham chiếu đến branch hiện tại (ví dụ: `ref: refs/heads/main`) hoặc mã hash commit trực tiếp (nếu rơi vào trạng thái Detached HEAD).
- `config`: File cấu hình riêng của repository (remote URLs, branch tracking, user email cục bộ).
- `index`: Binary staging file lưu trữ danh sách file, SHA-1 checksum và timestamps để kiểm tra thay đổi siêu tốc.
- `objects/`: Kho lưu trữ đối tượng Content-Addressable. 2 ký tự đầu của mã hash làm tên thư mục con, 38 ký tự còn lại làm tên file.
- `refs/`: Thư mục chứa các con trỏ:
  - `refs/heads/`: Chứa các local branches (mỗi branch chỉ là một file text chứa đúng 40 ký tự SHA-1 của commit đầu nhánh).
  - `refs/remotes/`: Chứa các tracking branches từ remote server.
  - `refs/tags/`: Chứa các tag định danh phiên bản.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Nghĩ Rằng Git Lưu Trữ Dạng Delta (Hiệu số thay đổi dòng code)
Nhiều người lầm tưởng Git lưu trữ từng diff `+` và `-` giữa các commit giống SVN.
- **Sự thật**: Git lưu trữ **toàn bộ ảnh chụp (Full Snapshot)** của cây thư mục tại mỗi commit.
- Nếu một file 10MB không hề thay đổi qua 100 commit, Git không nhân bản file đó 100 lần mà cả 100 commit đều trỏ chung về cùng 1 mã hash `blob` duy nhất!
- Git chỉ nén delta khi chạy cơ chế dọn rác tối ưu `git gc` (Packfiles `.pack`).

### Bẫy 2: Xóa Thư Mục Trống Nhận Thấy Git Không Theo Dõi
Git là hệ thống theo dõi **nội dung file (Blobs)**, không theo dõi thư mục. Thư mục chỉ tồn tại khi nó chứa ít nhất một `blob`.
- **Giải pháp**: Tạo file rỗng quy ước `.gitkeep` (hoặc `.gitignore`) bên trong thư mục trống để Git tạo `blob` và lưu trữ `tree` của thư mục đó.

### Bẫy 3: Sửa Trực Tiếp Các File Trong `.git/` Bằng Text Editor
Can thiệp thủ công vào `.git/index` hoặc các file object trong `.git/objects/` có thể làm hỏng SHA-1 checksum, khiến repository rơi vào trạng thái `corrupt object` và mất dữ liệu. Luôn sử dụng lệnh Plumbing (`git hash-object`, `git update-ref`, `git cat-file`) nếu muốn thao tác tầng thấp.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [01-architecture-demo.js](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-architecture-demo.js).

Tóm tắt các lệnh cấp thấp (Plumbing Commands) khám phá V8 của Git:
```bash
# 1. Tính toán mã băm SHA-1 của một chuỗi mà không cần tạo commit
echo "hello world" | git hash-object --stdin
# Output: 3b18e512dba79e4c8300dd08aeb37f8e728b8dad

# 2. Kiểm tra kiểu đối tượng của một mã băm
git cat-file -t 3b18e512d

# 3. Đọc nội dung thực tế giải nén từ object database
git cat-file -p 3b18e512d

# 4. Kiểm tra con trỏ HEAD đang tham chiếu tới branch nào
cat .git/HEAD
# Output: ref: refs/heads/main
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao hai file hoàn toàn khác tên nằm ở hai thư mục khác nhau nhưng có nội dung giống hệt nhau thì Git chỉ tạo đúng MỘT `blob` duy nhất trong `.git/objects`?
**Đáp án chi tiết**:
- Git sử dụng cơ chế **Content-Addressable Storage**. Khóa định danh của một `blob` được tính toán thuần túy bằng hàm băm mật mã học: `SHA-1("blob " + content.length + "\0" + content)`.
- Tên file và đường dẫn thư mục **không** nằm trong đối tượng `blob` mà được lưu trong đối tượng `tree`.
- Do đó, bất kể file có tên là `a.txt` hay `sub/b.txt`, miễn là nội dung từng byte trùng nhau 100%, mã hash SHA-1 sinh ra sẽ giống hệt nhau. Hai bản ghi trong đối tượng `tree` sẽ cùng trỏ tới duy nhất một địa chỉ hash `blob` này, giúp tiết kiệm dung lượng lưu trữ tối đa.

### Câu 2: Một branch trong Git thực chất là gì dưới góc độ hệ thống tập tin (File System)?
**Đáp án chi tiết**:
- Dưới góc độ hệ điều hành, một branch trong Git chỉ đơn giản là **một file văn bản nhỏ 41 bytes** (40 ký tự hexa SHA-1 + 1 ký tự xuống dòng `\n`) nằm tại thư mục `.git/refs/heads/<tên-branch>`.
- File này chứa mã băm SHA-1 trỏ trực tiếp đến commit mới nhất (đỉnh) của nhánh đó.
- Việc tạo nhánh mới (`git branch feature`) diễn ra gần như tức thời ($O(1)$) vì Git chỉ cần ghi đúng 40 ký tự SHA-1 của commit hiện tại vào một file văn bản mới, hoàn toàn không cần sao chép bất kỳ file mã nguồn nào của dự án.
