# Matt Pocock Skills: mục lục và tóm tắt

Bản sao cục bộ từ [mattpocock/skills](https://github.com/mattpocock/skills), gồm **38 skill**, **132 file Markdown**, **190 file** tổng cộng. README này tóm tắt nội dung và liên kết đến từng file để tra cứu.

## Cách đọc

- **Tên skill** liên kết đến SKILL.md: quy trình và chỉ dẫn dành cho agent.
- **Hướng dẫn** liên kết đến trang docs: giải thích công dụng, lúc nên dùng, câu hỏi thường gặp và dấu hiệu sử dụng hiệu quả của skill tương ứng.
- **Codex** liên kết đến agents/openai.yaml: tên hiển thị, mô tả ngắn và chính sách cho phép agent tự gọi skill.
- **Người dùng gọi**: chỉ chạy khi người dùng chủ động gọi tên skill.
- **Agent hoặc người dùng gọi**: agent có thể tự chọn khi công việc phù hợp; người dùng vẫn có thể gọi trực tiếp.

Các bảng bên dưới mô tả file đang có trong bản sao này. Việc tải tài liệu về chưa đồng nghĩa với cài đặt skill.

## Các nhóm tài liệu

| File mục lục | Số skill | Nội dung |
| --- | ---: | --- |
| [skills/engineering/README.md](./skills/engineering/README.md) | 20 | Các skill kỹ thuật trong plugin: thiết kế, đặc tả, lập trình, kiểm thử và review. |
| [skills/productivity/README.md](./skills/productivity/README.md) | 7 | Các skill trong plugin phục vụ phỏng vấn, bàn giao, học tập và viết tài liệu. |
| [skills/in-progress/README.md](./skills/in-progress/README.md) | 7 | Nhóm thử nghiệm, chưa đưa vào plugin; danh sách thực tế bên dưới được lấy từ các SKILL.md. |
| [skills/misc/README.md](./skills/misc/README.md) | 4 | Các tiện ích ít dùng, đã đóng băng bảo trì và không nằm trong plugin. |
| [skills/deprecated/README.md](./skills/deprecated/README.md) | 0 | Giải thích nhóm ngừng sử dụng; hiện không có skill nào trong nhóm. |

## Engineering: 20 skill kỹ thuật

### Người dùng gọi

| Skill | Tóm tắt | Hướng dẫn | Codex |
| --- | --- | --- | --- |
| [ask-matt](./skills/engineering/ask-matt/SKILL.md) | Chọn skill hoặc chuỗi công việc phù hợp với tình huống hiện tại. | [Hướng dẫn](./docs/engineering/ask-matt.md) | [Codex](./skills/engineering/ask-matt/agents/openai.yaml) |
| [grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md) | Phỏng vấn làm rõ kế hoạch, đồng thời cập nhật thuật ngữ và quyết định thiết kế trong glossary, ADR. | [Hướng dẫn](./docs/engineering/grill-with-docs.md) | [Codex](./skills/engineering/grill-with-docs/agents/openai.yaml) |
| [setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md) | Thiết lập issue tracker, nhãn triage và vị trí tài liệu miền nghiệp vụ cho từng repo. | [Hướng dẫn](./docs/engineering/setup-matt-pocock-skills.md) | [Codex](./skills/engineering/setup-matt-pocock-skills/agents/openai.yaml) |
| [to-spec](./skills/engineering/to-spec/SKILL.md) | Tổng hợp cuộc trao đổi thành đặc tả, đăng lên issue tracker; không phỏng vấn lại. | [Hướng dẫn](./docs/engineering/to-spec.md) | [Codex](./skills/engineering/to-spec/agents/openai.yaml) |
| [to-tickets](./skills/engineering/to-tickets/SKILL.md) | Chia đặc tả thành các phần triển khai xuyên suốt hệ thống, ghi rõ quan hệ phụ thuộc giữa các issue. | [Hướng dẫn](./docs/engineering/to-tickets.md) | [Codex](./skills/engineering/to-tickets/agents/openai.yaml) |
| [implement](./skills/engineering/implement/SKILL.md) | Triển khai công việc từ đặc tả hoặc ticket, áp dụng TDD và review trước khi commit. | [Hướng dẫn](./docs/engineering/implement.md) | [Codex](./skills/engineering/implement/agents/openai.yaml) |
| [implement-spec](./skills/engineering/implement-spec/SKILL.md) | Triển khai toàn bộ đặc tả trên một nhánh tích hợp, phân công agent theo đồ thị phụ thuộc của ticket. | [Hướng dẫn](./docs/engineering/implement-spec.md) | [Codex](./skills/engineering/implement-spec/agents/openai.yaml) |
| [triage](./skills/engineering/triage/SKILL.md) | Phân loại issue và PR, xác minh vấn đề, hỏi bổ sung và chuẩn bị bản giao việc cho agent. | [Hướng dẫn](./docs/engineering/triage.md) | [Codex](./skills/engineering/triage/agents/openai.yaml) |
| [wayfinder](./skills/engineering/wayfinder/SKILL.md) | Lập bản đồ các quyết định cho công việc lớn qua nhiều phiên, giải quyết từng câu hỏi trên issue tracker. | [Hướng dẫn](./docs/engineering/wayfinder.md) | [Codex](./skills/engineering/wayfinder/agents/openai.yaml) |
| [improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md) | Tìm cơ hội đơn giản hóa giao diện module, trình bày báo cáo HTML rồi phân tích phương án được chọn. | [Hướng dẫn](./docs/engineering/improve-codebase-architecture.md) | [Codex](./skills/engineering/improve-codebase-architecture/agents/openai.yaml) |
| [retro](./skills/engineering/retro/SKILL.md) | Nhìn lại phiên lập trình, đề xuất cải thiện công cụ, kiểm tra tự động, tiêu chuẩn và chỉ dẫn cho agent. | [Hướng dẫn](./docs/engineering/retro.md) | [Codex](./skills/engineering/retro/agents/openai.yaml) |

### Agent hoặc người dùng gọi

| Skill | Tóm tắt | Hướng dẫn | Codex |
| --- | --- | --- | --- |
| [codebase-design](./skills/engineering/codebase-design/SKILL.md) | Thiết kế deep module: nhiều hành vi sau giao diện nhỏ, vị trí thay thế hành vi rõ ràng, kiểm thử qua giao diện. | [Hướng dẫn](./docs/engineering/codebase-design.md) | [Codex](./skills/engineering/codebase-design/agents/openai.yaml) |
| [domain-modeling](./skills/engineering/domain-modeling/SKILL.md) | Làm rõ mô hình nghiệp vụ, thống nhất thuật ngữ, thử tình huống biên và ghi lại quyết định. | [Hướng dẫn](./docs/engineering/domain-modeling.md) | [Codex](./skills/engineering/domain-modeling/agents/openai.yaml) |
| [diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md) | Chẩn đoán lỗi khó và suy giảm hiệu năng bằng tái hiện, thu hẹp nguyên nhân, đo đạc và kiểm thử hồi quy. | [Hướng dẫn](./docs/engineering/diagnosing-bugs.md) | [Codex](./skills/engineering/diagnosing-bugs/agents/openai.yaml) |
| [tdd](./skills/engineering/tdd/SKILL.md) | Viết kiểm thử thất bại trước, sửa đủ để đạt rồi refactor theo từng lát cắt hành vi. | [Hướng dẫn](./docs/engineering/tdd.md) | [Codex](./skills/engineering/tdd/agents/openai.yaml) |
| [code-review](./skills/engineering/code-review/SKILL.md) | Review thay đổi từ một mốc Git theo hai hướng độc lập: tiêu chuẩn code và mức độ đáp ứng đặc tả. | [Hướng dẫn](./docs/engineering/code-review.md) | [Codex](./skills/engineering/code-review/agents/openai.yaml) |
| [prototype](./skills/engineering/prototype/SKILL.md) | Dựng bản thử dùng một lần để kiểm chứng logic, trạng thái hoặc so sánh các phương án giao diện. | [Hướng dẫn](./docs/engineering/prototype.md) | [Codex](./skills/engineering/prototype/agents/openai.yaml) |
| [research](./skills/engineering/research/SKILL.md) | Nghiên cứu từ nguồn sơ cấp đáng tin cậy, lưu kết quả có trích dẫn vào file Markdown. | [Hướng dẫn](./docs/engineering/research.md) | [Codex](./skills/engineering/research/agents/openai.yaml) |
| [pr](./skills/engineering/pr/SKILL.md) | Viết mô tả PR với hình thức minh họa phù hợp, bằng chứng trước/sau và đánh giá rủi ro khi merge. | [Hướng dẫn](./docs/engineering/pr.md) | [Codex](./skills/engineering/pr/agents/openai.yaml) |
| [wizard](./skills/engineering/wizard/SKILL.md) | Sinh trình hướng dẫn Bash tương tác cho các bước thủ công cần người dùng thực hiện. | [Hướng dẫn](./docs/engineering/wizard.md) | [Codex](./skills/engineering/wizard/agents/openai.yaml) |

## Productivity: 7 skill hỗ trợ công việc

### Người dùng gọi

| Skill | Tóm tắt | Hướng dẫn | Codex |
| --- | --- | --- | --- |
| [grill-me](./skills/productivity/grill-me/SKILL.md) | Phỏng vấn để làm rõ kế hoạch hoặc thiết kế, giải quyết các nhánh quyết định còn bỏ ngỏ. | [Hướng dẫn](./docs/productivity/grill-me.md) | [Codex](./skills/productivity/grill-me/agents/openai.yaml) |
| [handoff](./skills/productivity/handoff/SKILL.md) | Tóm tắt trạng thái cuộc trao đổi thành tài liệu để agent khác tiếp tục công việc. | [Hướng dẫn](./docs/productivity/handoff.md) | [Codex](./skills/productivity/handoff/agents/openai.yaml) |
| [teach](./skills/productivity/teach/SKILL.md) | Dạy một chủ đề qua nhiều phiên, lưu mục tiêu, thuật ngữ, tài nguyên và tiến độ tại workspace hiện tại. | [Hướng dẫn](./docs/productivity/teach.md) | [Codex](./skills/productivity/teach/agents/openai.yaml) |
| [to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md) | Soạn bảng câu hỏi Markdown để lấy thông tin hoặc quyết định từ người phù hợp. | [Hướng dẫn](./docs/productivity/to-questionnaire.md) | [Codex](./skills/productivity/to-questionnaire/agents/openai.yaml) |
| [wait-what](./skills/productivity/wait-what/SKILL.md) | Diễn giải lại thông điệp chưa rõ bằng ngôn ngữ dễ hiểu, bổ sung bối cảnh còn thiếu. | [Hướng dẫn](./docs/productivity/wait-what.md) | [Codex](./skills/productivity/wait-what/agents/openai.yaml) |

### Agent hoặc người dùng gọi

| Skill | Tóm tắt | Hướng dẫn | Codex |
| --- | --- | --- | --- |
| [grilling](./skills/productivity/grilling/SKILL.md) | Quy trình phỏng vấn dùng chung để kiểm tra giả định và làm rõ ý tưởng, kế hoạch hoặc quyết định. | [Hướng dẫn](./docs/productivity/grilling.md) | [Codex](./skills/productivity/grilling/agents/openai.yaml) |
| [writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md) | Viết tài liệu agent dễ tìm, dễ dùng và ít tốn ngữ cảnh: skill, AGENTS.md, CLAUDE.md và tài liệu tham chiếu. | [Hướng dẫn](./docs/productivity/writing-for-agents.md) | [Codex](./skills/productivity/writing-for-agents/agents/openai.yaml) |

## In-progress: 7 skill thử nghiệm

Các skill này chưa nằm trong plugin, chưa có trang docs riêng và có thể thay đổi hoặc bị loại bỏ. Cả bảy hiện đều do người dùng chủ động gọi.

| Skill | Tóm tắt | Codex |
| --- | --- | --- |
| [chief-of-staff](./skills/in-progress/chief-of-staff/SKILL.md) | Điều phối các agent con để theo đuổi mục tiêu dài hạn trong một phiên. | [Codex](./skills/in-progress/chief-of-staff/agents/openai.yaml) |
| [claude-handoff](./skills/in-progress/claude-handoff/SKILL.md) | Chuyển công việc sang agent nền mới bằng Claude CLI, kèm bản tóm tắt bàn giao. | [Codex](./skills/in-progress/claude-handoff/agents/openai.yaml) |
| [loop-me](./skills/in-progress/loop-me/SKILL.md) | Phỏng vấn qua nhiều phiên để biến các quy trình mong muốn thành đặc tả có thể triển khai trong workspace. | [Codex](./skills/in-progress/loop-me/agents/openai.yaml) |
| [setup-ts-deep-modules](./skills/in-progress/setup-ts-deep-modules/SKILL.md) | Thiết lập dependency-cruiser để package TypeScript chỉ được truy cập qua các entry point công khai. | [Codex](./skills/in-progress/setup-ts-deep-modules/agents/openai.yaml) |
| [writing-beats](./skills/in-progress/writing-beats/SKILL.md) | Xây dựng bài viết theo từng nhịp nội dung, chọn và phát triển nhịp kế tiếp trong quá trình viết. | [Codex](./skills/in-progress/writing-beats/agents/openai.yaml) |
| [writing-fragments](./skills/in-progress/writing-fragments/SKILL.md) | Phỏng vấn để thu thập các mảnh ý tưởng thô làm nguyên liệu viết, chưa ép vào cấu trúc bài. | [Codex](./skills/in-progress/writing-fragments/agents/openai.yaml) |
| [writing-shape](./skills/in-progress/writing-shape/SKILL.md) | Chuyển nguyên liệu thô thành bài viết theo từng đoạn, cân nhắc cấu trúc và cách trình bày. | [Codex](./skills/in-progress/writing-shape/agents/openai.yaml) |

## Misc: 4 tiện ích đã đóng băng bảo trì

Nhóm này được giữ để tham khảo, không nằm trong plugin. Cả bốn cho phép agent hoặc người dùng gọi.

| Skill | Tóm tắt | Codex |
| --- | --- | --- |
| [git-guardrails-claude-code](./skills/misc/git-guardrails-claude-code/SKILL.md) | Thiết lập hook Claude Code để chặn một số lệnh Git nguy hiểm trước khi chạy. | [Codex](./skills/misc/git-guardrails-claude-code/agents/openai.yaml) |
| [migrate-to-shoehorn](./skills/misc/migrate-to-shoehorn/SKILL.md) | Thay ép kiểu bằng as trong dữ liệu kiểm thử TypeScript bằng @total-typescript/shoehorn. | [Codex](./skills/misc/migrate-to-shoehorn/agents/openai.yaml) |
| [scaffold-exercises](./skills/misc/scaffold-exercises/SKILL.md) | Tạo cấu trúc bài tập gồm phần học, đề bài, lời giải và giải thích theo quy ước dự án. | [Codex](./skills/misc/scaffold-exercises/agents/openai.yaml) |
| [setup-pre-commit](./skills/misc/setup-pre-commit/SKILL.md) | Thiết lập Husky, lint-staged, Prettier, kiểm tra kiểu và test trước commit. | [Codex](./skills/misc/setup-pre-commit/agents/openai.yaml) |

## File bổ trợ bên trong các skill

Đường dẫn trong bảng được tính từ thư mục skills/.

| File | Tóm tắt |
| --- | --- |
| [engineering/ask-matt/PHASE-BOUNDARIES.md](./skills/engineering/ask-matt/PHASE-BOUNDARIES.md) | Chọn cách tiếp tục, xóa, nén hoặc bàn giao ngữ cảnh tại ranh giới giữa các giai đoạn công việc. |
| [engineering/codebase-design/DEEPENING.md](./skills/engineering/codebase-design/DEEPENING.md) | Cách hợp nhất các module nông, phân loại phụ thuộc và chọn chiến lược kiểm thử qua giao diện mới. |
| [engineering/codebase-design/DESIGN-IT-TWICE.md](./skills/engineering/codebase-design/DESIGN-IT-TWICE.md) | So sánh nhiều phương án thiết kế giao diện độc lập trước khi chọn cách tổ chức module. |
| [engineering/diagnosing-bugs/scripts/hitl-loop.template.sh](./skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh) | Mẫu vòng lặp tái hiện lỗi có người dùng thao tác và phản hồi trong terminal. |
| [engineering/domain-modeling/ADR-FORMAT.md](./skills/engineering/domain-modeling/ADR-FORMAT.md) | Mẫu ADR ngắn ghi bối cảnh, quyết định và lý do; quy ước vị trí, đánh số file. |
| [engineering/domain-modeling/GLOSSARY-FORMAT.md](./skills/engineering/domain-modeling/GLOSSARY-FORMAT.md) | Mẫu glossary ghi thuật ngữ chuẩn, cách gọi nên tránh, quan hệ và điểm còn mơ hồ. |
| [engineering/improve-codebase-architecture/HTML-REPORT.md](./skills/engineering/improve-codebase-architecture/HTML-REPORT.md) | Mẫu báo cáo HTML minh họa hiện trạng kiến trúc, các ứng viên cải thiện và phương án thiết kế. |
| [engineering/pr/CREDITS.md](./skills/engineering/pr/CREDITS.md) | Ghi nguồn ý tưởng trình bày PR bằng hình thức minh họa từ skill show-me. |
| [engineering/prototype/LOGIC.md](./skills/engineering/prototype/LOGIC.md) | Hướng dẫn dựng một file HTML có thể chia sẻ để thử logic nghiệp vụ, dữ liệu và chuyển trạng thái. |
| [engineering/prototype/UI.md](./skills/engineering/prototype/UI.md) | Hướng dẫn tạo nhiều biến thể giao diện, cho phép chuyển đổi để so sánh và chọn phương án. |
| [engineering/setup-matt-pocock-skills/domain.md](./skills/engineering/setup-matt-pocock-skills/domain.md) | Quy ước đọc và bố trí glossary, bản đồ glossary cùng ADR cho một hoặc nhiều miền nghiệp vụ. |
| [engineering/setup-matt-pocock-skills/issue-tracker-github.md](./skills/engineering/setup-matt-pocock-skills/issue-tracker-github.md) | Mẫu thao tác GitHub Issues và PR bằng gh, gồm nhãn, issue con và quan hệ phụ thuộc. |
| [engineering/setup-matt-pocock-skills/issue-tracker-gitlab.md](./skills/engineering/setup-matt-pocock-skills/issue-tracker-gitlab.md) | Mẫu thao tác GitLab bằng glab để tạo, đọc, cập nhật issue và quản lý nhãn. |
| [engineering/setup-matt-pocock-skills/issue-tracker-local.md](./skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md) | Quy ước lưu đặc tả và từng ticket thành file Markdown trong .scratch/, kèm trạng thái và bình luận. |
| [engineering/setup-matt-pocock-skills/triage-labels.md](./skills/engineering/setup-matt-pocock-skills/triage-labels.md) | Mẫu ánh xạ năm vai trò triage sang nhãn thực tế của issue tracker. |
| [engineering/tdd/mocking.md](./skills/engineering/tdd/mocking.md) | Khi nào nên mock phụ thuộc ngoài hệ thống, khi nào nên dùng thành phần thật hoặc DB kiểm thử. |
| [engineering/tdd/tests.md](./skills/engineering/tdd/tests.md) | Ví dụ kiểm thử tốt và kém; ưu tiên hành vi quan sát được thay vì chi tiết triển khai nội bộ. |
| [engineering/triage/AGENT-BRIEF.md](./skills/engineering/triage/AGENT-BRIEF.md) | Mẫu bản giao việc đủ rõ để agent triển khai issue hoặc hoàn thiện PR mà không phụ thuộc cuộc trao đổi cũ. |
| [engineering/triage/OUT-OF-SCOPE.md](./skills/engineering/triage/OUT-OF-SCOPE.md) | Cách lưu lý do từ chối yêu cầu để giữ quyết định và nhận diện các đề xuất trùng lặp. |
| [engineering/wizard/template.sh](./skills/engineering/wizard/template.sh) | Thư viện Bash và khung các bước cho wizard: nhập dữ liệu, nhập bí mật, ghi biến môi trường và điều hướng. |
| [in-progress/setup-ts-deep-modules/dependency-cruiser.config.cjs](./skills/in-progress/setup-ts-deep-modules/dependency-cruiser.config.cjs) | Mẫu luật dependency-cruiser ngăn truy cập phần triển khai nội bộ của package từ bên ngoài. |
| [misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh](./skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh) | Hook đọc lệnh từ JSON, kiểm tra các mẫu lệnh Git bị chặn và từ chối thực thi khi khớp. |
| [productivity/teach/GLOSSARY-FORMAT.md](./skills/productivity/teach/GLOSSARY-FORMAT.md) | Mẫu sổ thuật ngữ làm ngôn ngữ thống nhất cho giải thích, bài tập và ghi chép học tập. |
| [productivity/teach/LEARNING-RECORD-FORMAT.md](./skills/productivity/teach/LEARNING-RECORD-FORMAT.md) | Mẫu ghi nhận kiến thức đã có, bài học và phát hiện quan trọng để điều chỉnh các buổi học sau. |
| [productivity/teach/MISSION-FORMAT.md](./skills/productivity/teach/MISSION-FORMAT.md) | Mẫu ghi mục tiêu học tập thực tế và tiêu chí thành công quan sát được. |
| [productivity/teach/RESOURCES-FORMAT.md](./skills/productivity/teach/RESOURCES-FORMAT.md) | Mẫu tập hợp tài nguyên đáng tin cậy và cộng đồng tham khảo cho chủ đề đang học. |
| [productivity/writing-for-agents/SKILL-MECHANICS.md](./skills/productivity/writing-for-agents/SKILL-MECHANICS.md) | Quy ước frontmatter, cách gọi skill và thiết kế skill định tuyến; cân nhắc khả năng tìm thấy với chi phí ngữ cảnh. |

## Tài liệu riêng và tài liệu đã lưu trữ

| File | Tóm tắt |
| --- | --- |
| [docs/agents/triage-labels.md](./docs/agents/triage-labels.md) | Ánh xạ nhãn triage đang dùng trong repo nguồn, kèm ý nghĩa của từng trạng thái xử lý issue. |
| [docs/engineering/resolving-merge-conflicts.md](./docs/engineering/resolving-merge-conflicts.md) | Trang tham khảo về giải quyết xung đột merge/rebase. Skill đã bị gỡ khỏi plugin từ v1.3.0, không còn được bảo trì. |

## Tài liệu và cấu hình ở thư mục gốc

| File | Tóm tắt |
| --- | --- |
| [README.md](./README.md) | Mục lục tiếng Việt, tóm tắt và liên kết toàn bộ file trong bản sao cục bộ này. |
| [CHANGELOG.md](./CHANGELOG.md) | Lịch sử phát hành: skill được thêm, đổi tên, thay đổi hành vi hoặc bị loại bỏ. |
| [GLOSSARY.md](./GLOSSARY.md) | Thuật ngữ dùng chung của bộ skill, như issue tracker, issue, decision ticket và triage role. |
| [SCOPE.md](./SCOPE.md) | Tiêu chí tiếp nhận lỗi, đề xuất và PR; giới hạn phạm vi bảo trì của repo nguồn. |
| [CLAUDE.md](./CLAUDE.md) | Quy tắc tổ chức nhóm skill, cập nhật docs, metadata, plugin và các tài liệu liên quan. |
| [AGENTS.md](./AGENTS.md) | Trong repo nguồn là liên kết đến CLAUDE.md; bản tải hiện lưu nội dung đường dẫn đích. |
| [LICENSE](./LICENSE) | Giấy phép MIT và thông tin bản quyền của bộ tài liệu nguồn. |
| [package.json](./package.json) | Metadata gói, công cụ Changesets và các lệnh quản lý phiên bản plugin. |
| [package-lock.json](./package-lock.json) | Khóa phiên bản và cây phụ thuộc npm cho các công cụ phát hành. |
| [.gitignore](./.gitignore) | Loại node_modules và cấu hình .claude cục bộ khỏi việc theo dõi Git của repo nguồn. |

## Hướng dẫn bảo trì, plugin và tự động hóa

### Hướng dẫn trong .agents/

| File | Tóm tắt |
| --- | --- |
| [.agents/install-block.md](./.agents/install-block.md) | Khối hướng dẫn cài đặt chuẩn để tái sử dụng nhất quán trong các tài liệu của repo. |
| [.agents/invocation.md](./.agents/invocation.md) | Phân biệt skill do người dùng gọi với skill agent có thể tự gọi, cách khai báo và liên kết phụ thuộc. |
| [.agents/writing-docs.md](./.agents/writing-docs.md) | Mẫu và tiêu chuẩn viết trang docs cho người dùng: công dụng, tình huống dùng, câu hỏi và kết quả quan sát được. |
| [.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md](./.agents/adr/0001-explicit-setup-pointer-only-for-hard-dependencies.md) | Quyết định chỉ yêu cầu setup rõ ràng với skill thực sự phụ thuộc cấu hình tracker hoặc nhãn. |
| [.agents/adr/0002-ship-as-a-claude-code-plugin.md](./.agents/adr/0002-ship-as-a-claude-code-plugin.md) | Quyết định phân phối bằng plugin Claude Code, phân tích giới hạn chọn đường dẫn skill và các phương án cài đặt. |

### Plugin và script

| File | Tóm tắt |
| --- | --- |
| [.claude-plugin/plugin.json](./.claude-plugin/plugin.json) | Manifest plugin: tên, phiên bản, metadata và danh sách 27 skill thuộc engineering, productivity. |
| [.claude-plugin/marketplace.json](./.claude-plugin/marketplace.json) | Khai báo marketplace mattpocock và gói plugin mà marketplace cung cấp. |
| [scripts/link-skills.sh](./scripts/link-skills.sh) | Script dành cho người bảo trì, tạo symlink skill vào thư mục agent cục bộ; không phải trình cài đặt được hỗ trợ. |
| [scripts/list-skills.sh](./scripts/list-skills.sh) | Tìm và liệt kê các đường dẫn SKILL.md theo thứ tự tên. |
| [scripts/sync-plugin-version.mjs](./scripts/sync-plugin-version.mjs) | Đồng bộ phiên bản từ package.json sang manifest plugin; tùy chọn --check chỉ kiểm tra chênh lệch. |

### GitHub

| File | Tóm tắt |
| --- | --- |
| [.github/ISSUE_TEMPLATE/bug.yml](./.github/ISSUE_TEMPLATE/bug.yml) | Biểu mẫu báo lỗi skill dựa trên vấn đề đã xảy ra trong một phiên sử dụng thực tế. |
| [.github/ISSUE_TEMPLATE/idea.yml](./.github/ISSUE_TEMPLATE/idea.yml) | Biểu mẫu đề xuất cải thiện skill hiện có, yêu cầu nêu lỗi quan sát được và phù hợp phạm vi dự án. |
| [.github/ISSUE_TEMPLATE/config.yml](./.github/ISSUE_TEMPLATE/config.yml) | Tắt issue trống và điều hướng câu hỏi, trao đổi sang GitHub Discussions. |
| [.github/workflows/needs-info.yml](./.github/workflows/needs-info.yml) | Đóng issue needs-info sau 14 ngày không phản hồi; đưa issue có phản hồi trở lại hàng chờ triage. |
| [.github/workflows/release.yml](./.github/workflows/release.yml) | Workflow quản lý phiên bản và phát hành bằng Changesets khi có thay đổi trên main. |
| [.github/workflows/triage-label.yml](./.github/workflows/triage-label.yml) | Tự gắn nhãn needs-triage cho issue mới để mọi yêu cầu đều qua bước phân loại. |

## Changesets: các ghi chú thay đổi chờ phát hành

Các file dưới đây mô tả thay đổi trong repo nguồn, không phải tính năng được bổ sung bởi bản README này.

| File | Tóm tắt |
| --- | --- |
| [.changeset/README.md](./.changeset/README.md) | Giới thiệu Changesets và tài liệu về cách ghi nhận thay đổi, quản lý phiên bản. |
| [.changeset/config.json](./.changeset/config.json) | Cấu hình nhánh cơ sở, tạo changelog GitHub và cách tăng phiên bản gói. |
| [.changeset/ask-matt-read-skill-first.md](./.changeset/ask-matt-read-skill-first.md) | Yêu cầu ask-matt đọc SKILL.md trước khi giải thích chức năng hoặc đề xuất bỏ qua một bước. |
| [.changeset/code-review-standards-and-subagents.md](./.changeset/code-review-standards-and-subagents.md) | Bổ sung tìm tiêu chuẩn repo, nhận báo cáo từ agent review và đọc tracker qua tài liệu cấu hình. |
| [.changeset/diagnosing-bugs-prove-mutation.md](./.changeset/diagnosing-bugs-prove-mutation.md) | Kiểm chứng lần cố ý sửa sai thực sự làm thay đổi code trước khi tin kết quả test thất bại. |
| [.changeset/github-tracker-external-pr-list.md](./.changeset/github-tracker-external-pr-list.md) | Sửa cách liệt kê PR từ người đóng góp bên ngoài trong mẫu tracker GitHub. |
| [.changeset/grilling-yes-accepts-recommendation.md](./.changeset/grilling-yes-accepts-recommendation.md) | Đặt câu hỏi sao cho trả lời đồng ý cũng đồng nghĩa chấp nhận phương án được đề xuất. |
| [.changeset/handoff-temp-dir.md](./.changeset/handoff-temp-dir.md) | Chỉ rõ cách xác định thư mục tạm trên từng hệ điều hành khi tạo tài liệu bàn giao. |
| [.changeset/implement-skill-tool-wording.md](./.changeset/implement-skill-tool-wording.md) | Yêu cầu gọi công cụ skill tường minh cho tdd và code-review thay vì chỉ nhắc tên trong văn bản. |
| [.changeset/implement-ticket-reference.md](./.changeset/implement-ticket-reference.md) | Đọc ticket được truyền vào, xác nhận tiêu đề và làm rõ tham chiếu khi còn mơ hồ. |
| [.changeset/setup-tracker-fixes.md](./.changeset/setup-tracker-fixes.md) | Sửa lệnh tracker, tạo nhãn còn thiếu và cải thiện cách đọc issue, ánh xạ nhãn. |
| [.changeset/tdd-seam-tradeoffs.md](./.changeset/tdd-seam-tradeoffs.md) | Nêu ngắn gọn mỗi vị trí kiểm thử phát hiện được gì và bỏ sót gì khi đề xuất lựa chọn. |
| [.changeset/teach-quiz-answer-position.md](./.changeset/teach-quiz-answer-position.md) | Thay đổi vị trí đáp án đúng trong các câu hỏi kiểm tra kiến thức. |
| [.changeset/teach-workspace-root.md](./.changeset/teach-workspace-root.md) | Ghi dữ liệu học tập vào thư mục gọi skill, tránh ghi nhầm vào thư mục chứa skill. |
| [.changeset/to-tickets-sub-issues.md](./.changeset/to-tickets-sub-issues.md) | Tạo ticket thành issue con; dùng quan hệ phụ thuộc gốc của tracker khi có hỗ trợ. |
| [.changeset/wayfinder-labels-refs-research-prs.md](./.changeset/wayfinder-labels-refs-research-prs.md) | Sửa nhãn, tham chiếu issue, loại quyết định và quy tắc không mở PR từ nhánh nghiên cứu. |
| [.changeset/wizard-template-fixes.md](./.changeset/wizard-template-fixes.md) | Sửa nhập liệu, ghi biến môi trường, xử lý symlink, quyền file và kết thúc đầu vào trong wizard. |
| [.changeset/wizard-template-fixes-2.md](./.changeset/wizard-template-fixes-2.md) | Sửa đọc giá trị .env, an toàn khi script đổi giữa phiên, xóa màn hình và đồng bộ biến shell. |

## Các quyết định ngoài phạm vi

Những file này ghi lại chính sách của repo nguồn và lý do không nhận một số loại yêu cầu.

| File | Tóm tắt |
| --- | --- |
| [.out-of-scope/frozen-misc-skills.md](./.out-of-scope/frozen-misc-skills.md) | Nhóm misc đã đóng băng; không tiếp nhận sửa lỗi, tính năng hoặc PR cho các skill trong nhóm. |
| [.out-of-scope/harness-name-collisions.md](./.out-of-scope/harness-name-collisions.md) | Không đổi tên hoặc thêm bí danh chỉ vì trùng lệnh có sẵn của một công cụ agent. |
| [.out-of-scope/lazy-load-writing-for-agents.md](./.out-of-scope/lazy-load-writing-for-agents.md) | Giải thích vì sao retro luôn nạp writing-for-agents để đánh giá chỉ dẫn, kể cả khi chưa sửa tài liệu. |
| [.out-of-scope/mainstream-issue-trackers-only.md](./.out-of-scope/mainstream-issue-trackers-only.md) | Chỉ hỗ trợ trực tiếp GitHub, GitLab và Markdown cục bộ, không thêm mẫu tracker khác. |
| [.out-of-scope/native-question-tool.md](./.out-of-scope/native-question-tool.md) | Giữ phỏng vấn bằng văn bản hội thoại để dùng được trên nhiều công cụ agent. |
| [.out-of-scope/new-skills.md](./.out-of-scope/new-skills.md) | Không nhận đề xuất hoặc đóng góp skill mới nhằm giữ danh mục nhỏ và kiểm soát chi phí bảo trì. |
| [.out-of-scope/question-limits.md](./.out-of-scope/question-limits.md) | Không đặt trần số câu hỏi phỏng vấn vì số quyết định cần làm rõ tùy từng công việc. |
| [.out-of-scope/setup-skill-verify-mode.md](./.out-of-scope/setup-skill-verify-mode.md) | Không thêm chế độ verify riêng; việc kiểm tra lại cấu hình được xử lý trong quy trình setup hiện có. |
| [.out-of-scope/subagent-recursion.md](./.out-of-scope/subagent-recursion.md) | Không bổ sung giới hạn đệ quy agent trong skill; trách nhiệm kiểm soát thuộc công cụ chạy agent. |
