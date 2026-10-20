# Open-source Agent Harness Skills

Hướng dẫn sử dụng theo task, prompt mẫu và lab RED/GREEN: [Harness thực chiến](harness-practice/README.md).

Bổ sung 6 skill vào `.agents/skills/`, chọn từ hai dự án MIT. `AGENTS.md` nạp bảng định tuyến này; chỉ đọc `SKILL.md` phù hợp với công việc, không nạp toàn bộ bộ sưu tập.

## Định tuyến

| Skill | Khi sử dụng |
| --- | --- |
| [harness-engineering](.agents/skills/harness-engineering/SKILL.md) | Thiết kế vòng lặp agent, giới hạn vùng được sửa, evaluator cố định, rollback và nhật ký bền vững. |
| [context-compression](.agents/skills/context-compression/SKILL.md) | Tóm tắt hoặc bàn giao phiên dài, giữ nguyên quyết định, đường dẫn, trạng thái kiểm thử và việc còn lại. |
| [tool-design](.agents/skills/tool-design/SKILL.md) | Thiết kế schema, mô tả, kết quả và lỗi của tool/MCP; loại bỏ tool trùng chức năng. |
| [evaluation](.agents/skills/evaluation/SKILL.md) | Đánh giá kết quả agent bằng baseline, rubric nhiều chiều và kiểm tra hồi quy. |
| [systematic-debugging](.agents/skills/systematic-debugging/SKILL.md) | Điều tra nguyên nhân gốc khi gặp bug, test thất bại hoặc hành vi bất thường. |
| [verification-before-completion](.agents/skills/verification-before-completion/SKILL.md) | Kiểm tra bằng chứng hiện tại trước khi báo hoàn thành, sửa xong hoặc kiểm thử đạt. |

Có thể gọi trực tiếp bằng tên, ví dụ `$systematic-debugging` hoặc `$harness-engineering`. Skill mới có thể được nhận diện từ lượt chat tiếp theo.

## Nguồn và giấy phép

Snapshot được nhập ngày **2026-10-20**; đường dẫn trong nguồn là `skills/<tên-skill>/`.

| Nguồn | Commit cố định | Skill đã nhập |
| --- | --- | --- |
| [obra/superpowers](https://github.com/obra/superpowers) | [`bb92a77741419a4ab5f06e711a283343f1ada0c3`](https://github.com/obra/superpowers/tree/bb92a77741419a4ab5f06e711a283343f1ada0c3/skills) | `systematic-debugging`, `verification-before-completion` |
| [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | [`9ff0c99108b36d3b886defd825d8ac1f47dba374`](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/9ff0c99108b36d3b886defd825d8ac1f47dba374/skills) | `harness-engineering`, `context-compression`, `tool-design`, `evaluation` |

Mỗi thư mục skill giữ bản `LICENSE` MIT của nguồn cùng tài liệu và script đi kèm. Giấy phép ISC ở gốc repo không thay thế giấy phép của các nội dung này.

## Điều chỉnh cho repo

- `systematic-debugging` dùng `tdd-workflow` và `verification-before-completion` đã có tại đây, thay cho tên plugin Superpowers.
- Tài liệu `researcher/` trong `harness-engineering` trỏ về commit nguồn; không giả định repo này có hệ thống nghiên cứu đó.
- `tool-design` dùng đúng tên tool do host cung cấp; không áp đặt một kiểu namespace MCP cho mọi host.
- `tool-design/scripts/description_generator.py` sửa lỗi định dạng JSON: thay placeholder trong từng giá trị trước khi serialize, giữ đúng dấu nháy, xuống dòng và ký tự đặc biệt. Test hồi quy nằm trong `tool-design/tests/`.
- Các skill khác được nguồn nhắc đến là tham khảo tùy chọn. Chỉ đọc khi đã có sẵn hoặc khi nhiệm vụ cần truy cập nguồn.

Các skill bổ sung không tự cấp quyền commit, push, deploy, gửi tin nhắn, sửa memory hoặc chạy agent nền. Phạm vi và quyền đã được người dùng cấp vẫn quyết định hành động.

## Script đi kèm

Script đánh giá là ví dụ offline: phần chấm bằng LLM còn dùng stub hoặc heuristic; không đại diện cho benchmark agent thật. `find-polluter.sh` cần Bash và công cụ Unix.

Chạy bộ kiểm thử của context compression và test hồi quy bằng Python chuẩn:

```powershell
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/context-compression/tests -v
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/tool-design/tests -v
```
