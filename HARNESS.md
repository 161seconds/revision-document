# Open-source Agent Skills

Hướng dẫn sử dụng theo task, prompt mẫu và lab RED/GREEN: [Harness thực chiến](harness-practice/README.md).

Bổ sung 12 skill vào `.agents/skills/`, chọn từ bốn dự án MIT. `AGENTS.md` nạp bảng định tuyến này; chỉ đọc `SKILL.md` phù hợp với công việc, không nạp toàn bộ bộ sưu tập.

## Định tuyến

| Skill | Khi sử dụng |
| --- | --- |
| [harness-engineering](.agents/skills/harness-engineering/SKILL.md) | Thiết kế vòng lặp agent, giới hạn vùng được sửa, evaluator cố định, rollback và nhật ký bền vững. |
| [context-compression](.agents/skills/context-compression/SKILL.md) | Tóm tắt hoặc bàn giao phiên dài, giữ nguyên quyết định, đường dẫn, trạng thái kiểm thử và việc còn lại. |
| [tool-design](.agents/skills/tool-design/SKILL.md) | Thiết kế schema, mô tả, kết quả và lỗi của tool/MCP; loại bỏ tool trùng chức năng. |
| [evaluation](.agents/skills/evaluation/SKILL.md) | Đánh giá kết quả agent bằng baseline, rubric nhiều chiều và kiểm tra hồi quy. |
| [systematic-debugging](.agents/skills/systematic-debugging/SKILL.md) | Điều tra nguyên nhân gốc khi gặp bug, test thất bại hoặc hành vi bất thường. |
| [verification-before-completion](.agents/skills/verification-before-completion/SKILL.md) | Kiểm tra bằng chứng hiện tại trước khi báo hoàn thành, sửa xong hoặc kiểm thử đạt. |
| [security-audit](.agents/skills/security-audit/SKILL.md) | Điều tra lỗ hổng theo ranh giới tin cậy; audit 6 pha với coverage ledger, verifier độc lập và báo cáo JSON/Markdown khi được yêu cầu rõ ràng. |
| [dotnet-backend-patterns](.agents/skills/dotnet-backend-patterns/SKILL.md) | Phát triển/review backend C#: async/await, DI, EF Core, Dapper, caching và xUnit. |
| [postgresql-table-design](.agents/skills/postgresql-table-design/SKILL.md) | Thiết kế/review schema PostgreSQL: kiểu dữ liệu, khóa, constraints, index và partitioning. |
| [sql-optimization-patterns](.agents/skills/sql-optimization-patterns/SKILL.md) | Điều tra truy vấn chậm bằng EXPLAIN, tối ưu index, N+1 và pagination theo workload thực tế. |
| [github-actions-templates](.agents/skills/github-actions-templates/SKILL.md) | Tạo/sửa GitHub Actions: test/build, matrix, reusable workflow, cache và permissions. |
| [openapi-spec-generation](.agents/skills/openapi-spec-generation/SKILL.md) | Sinh/kiểm tra OpenAPI 3.1, tài liệu API, SDK và tính tương thích của contract. |

Có thể gọi trực tiếp bằng tên, ví dụ `$systematic-debugging`, `$harness-engineering` hoặc `$dotnet-backend-patterns`. Skill mới có thể được nhận diện từ lượt chat tiếp theo.

`security-review` của ECC dùng để phòng ngừa lỗi khi phát triển; `security-audit` của Cloudflare dùng để điều tra và xác minh lỗ hổng. `security-audit` mặc định chỉ hướng dẫn theo câu hỏi; chỉ chạy toàn bộ quy trình khi người dùng yêu cầu audit/pentest codebase, review bảo mật toàn diện hoặc tạo báo cáo. Ví dụ: `$security-audit audit toàn bộ repo này, profile quick`. Full audit cần agent hỗ trợ subagent độc lập; chạy mã của mục tiêu cần sandbox cô lập ở cấp hệ điều hành, không có mạng ngoài, giới hạn tài nguyên và quyền ghi. Thiếu điều kiện thực thi thì giữ kết luận `needs_validation` cùng thông tin còn thiếu.

## Nguồn và giấy phép

Các snapshot Superpowers và Context Engineering được nhập ngày **2026-10-20**; Cloudflare và wshobson được nhập ngày **2026-10-22**. Ba nguồn đầu dùng `skills/<tên-skill>/`; wshobson dùng `plugins/<plugin>/skills/<tên-skill>/`.

| Nguồn | Commit cố định | Skill đã nhập |
| --- | --- | --- |
| [obra/superpowers](https://github.com/obra/superpowers) | [`bb92a77741419a4ab5f06e711a283343f1ada0c3`](https://github.com/obra/superpowers/tree/bb92a77741419a4ab5f06e711a283343f1ada0c3/skills) | `systematic-debugging`, `verification-before-completion` |
| [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | [`9ff0c99108b36d3b886defd825d8ac1f47dba374`](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/9ff0c99108b36d3b886defd825d8ac1f47dba374/skills) | `harness-engineering`, `context-compression`, `tool-design`, `evaluation` |
| [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) | [`c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`](https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit) | `security-audit` |
| [wshobson/agents](https://github.com/wshobson/agents) | [`0874a27b17a22e2b7c2e2bcd725768e0803cad06`](https://github.com/wshobson/agents/tree/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins) | `dotnet-backend-patterns`, `postgresql-table-design`, `sql-optimization-patterns`, `github-actions-templates`, `openapi-spec-generation` |

Mỗi thư mục skill giữ bản `LICENSE` MIT của nguồn cùng tài liệu và script đi kèm. Giấy phép ISC ở gốc repo không thay thế giấy phép của các nội dung này.

## Điều chỉnh cho repo

- `systematic-debugging` dùng `tdd-workflow` và `verification-before-completion` đã có tại đây, thay cho tên plugin Superpowers.
- Tài liệu `researcher/` trong `harness-engineering` trỏ về commit nguồn; không giả định repo này có hệ thống nghiên cứu đó.
- `tool-design` dùng đúng tên tool do host cung cấp; không áp đặt một kiểu namespace MCP cho mọi host.
- `tool-design/scripts/description_generator.py` sửa lỗi định dạng JSON: thay placeholder trong từng giá trị trước khi serialize, giữ đúng dấu nháy, xuống dòng và ký tự đặc biệt. Test hồi quy nằm trong `tool-design/tests/`.
- `security-audit` giữ nguyên toàn bộ 20 file trong thư mục skill nguồn; `README.md` và `LICENSE` ở gốc upstream được đặt cùng thư mục skill để giữ hướng dẫn và giấy phép.
- wshobson nhập chọn lọc 5 thư mục skill, giữ đủ `references/`, `assets/` và thêm `LICENSE` MIT vào từng thư mục. Plugin nguồn tương ứng: `dotnet-contribution`, `database-design`, `developer-essentials`, `cicd-automation`, `documentation-generation`.
- Các template wshobson là tài liệu tham khảo, chưa phải project chạy độc lập. Kiểm tra phiên bản framework, action và DB trước khi áp dụng; giữ kiến trúc, contract và kiểu ID hiện có nếu nhiệm vụ không yêu cầu đổi. Chỉ nhập skill, không cài marketplace, agent, command, hook hay cấu hình cho harness khác.
- Các skill khác được nguồn nhắc đến là tham khảo tùy chọn. Chỉ đọc khi đã có sẵn hoặc khi nhiệm vụ cần truy cập nguồn.

Các skill bổ sung không tự cấp quyền commit, push, deploy, gửi tin nhắn, sửa memory hoặc chạy agent nền. Phạm vi và quyền đã được người dùng cấp vẫn quyết định hành động.

## Script đi kèm

Script đánh giá là ví dụ offline: phần chấm bằng LLM còn dùng stub hoặc heuristic; không đại diện cho benchmark agent thật. `find-polluter.sh` cần Bash và công cụ Unix.

Chạy bộ kiểm thử của context compression và test hồi quy bằng Python chuẩn:

```powershell
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/context-compression/tests -v
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/tool-design/tests -v
```

`security-audit` có hai validator Node.js không cần dependency. CLI yêu cầu `O_NOFOLLOW` và `O_NONBLOCK`; nếu Node.js/hệ điều hành không hỗ trợ thì validator từ chối đọc đầu vào. Trên Windows, dùng Node.js trong Linux/WSL hỗ trợ các cờ này, không bỏ kiểm tra an toàn. Chạy hai bộ test từ gốc repo trong môi trường đó:

```bash
node --test .agents/skills/security-audit/validate-findings.test.cjs .agents/skills/security-audit/validate-coverage-ledger.test.cjs
```

Kết quả khi nhập ngày **2026-10-22**, trên Windows với Node.js `v22.17.0`: **46 test đạt, 7 lỗi, 12 bỏ qua**. Cả 7 lỗi CLI đều dừng ở thông báo `OS no-follow and nonblocking input protection is unavailable`. WSL Ubuntu hiện chưa có Node.js nên chưa xác minh bộ test đầy đủ trên Linux. Cả 22 file đã được đối chiếu và khớp Git blob hash của commit nguồn ở trên.
