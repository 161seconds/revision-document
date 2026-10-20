# 05. Lab: sửa JSON generator bằng một quy trình có bằng chứng

## Kết quả cần đạt

Tái hiện lỗi khi dùng `str.format` trên template JSON, giải thích nguyên nhân, khôi phục bản sửa tối thiểu và chứng minh các ký tự đặc biệt còn nguyên sau `json.loads`.

Lab dùng code và test đã có; không thêm một app minh họa trùng chức năng. Chạy từ gốc repo, cần Python 3.10+ và Git.

## 1. Tạo vùng làm việc riêng

Kiểm tra đường dẫn đích chưa tồn tại rồi tạo worktree. Thư mục lab là thư mục bên cạnh repo; không dùng lại một worktree đang có công việc khác.

```powershell
rtk git status --short --branch
rtk git worktree add -b lab/harness-json ../revision-document-harness-lab HEAD
Set-Location ../revision-document-harness-lab
```

Lệnh không sửa branch `main`. Nếu branch hoặc thư mục đã tồn tại, chọn tên mới; không xóa để ép lệnh chạy.

## 2. Chạy baseline

```powershell
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/tool-design/tests -v
```

Baseline hiện có 2 test method; một method có subtest cho các template và fallback. Đây không phải chỉ có hai input.

## 3. Tạo lỗi có chủ đích trong worktree lab

Mở [.agents/skills/tool-design/scripts/description_generator.py](../.agents/skills/tool-design/scripts/description_generator.py), tìm `ErrorMessageGenerator.generate`. Chỉ trong worktree lab, thay đoạn tạo `message` và `return json.dumps(...)` bằng:

```python
return template.format(**context)
```

Chạy lại đúng lệnh test. Expected: lỗi ở template có dấu ngoặc JSON; không tính lỗi import hoặc chạy nhầm thư mục là kết quả nghiệm thu. Ghi traceback thực tế, không giả định mọi phiên bản Python in cùng chuỗi lỗi.

## 4. Dùng agent điều tra và sửa

Gửi [task và phạm vi](01-routing-and-scope.md), rồi [prompt debug](02-debug-test-verify.md). Đọc test để hiểu yêu cầu: dấu nháy, backslash, xuống dòng, Unicode, fallback khi không có template và lỗi thiếu context.

Bản sửa tham khảo đã có trong repo chính:

```python
message = {key: value.format(**context) for key, value in json.loads(template).items()}
return json.dumps(message, indent=2)
```

Đoạn này phù hợp với template hiện tại có các value dạng chuỗi ở cấp đầu. Nếu schema sau này có object/list lồng nhau, cần cập nhật contract và test; không tự nhận rằng nó xử lý template đệ quy.

## 5. Xác minh và review

```powershell
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/tool-design/tests -v
rtk proxy python -X utf8 -B -m unittest discover -s .agents/skills/context-compression/tests -v
rtk git diff --check
rtk git diff -- .agents/skills/tool-design
```

Khi khôi phục đúng bản gốc, diff có thể rỗng. Đó là kết quả hợp lệ của lab; không tạo commit rỗng. Viết handoff bằng [mẫu ở bài 04](04-context-and-handoff.md).

## Câu hỏi và đáp án

- Vì sao không escape JSON bằng `replace`? Escaping nhiều lớp dễ sai; serializer làm đúng cho ký tự đặc biệt.
- Test đạt có chứng minh agent tốt hơn không? Không; nó chỉ kiểm tra hành vi của script với các case đã chạy.
- Agent có được thay test để GREEN không? Chỉ khi requirement thay đổi có lý do review được; không được xóa điều kiện nghiệm thu.
- Có phải push sau lab? Không. Lab không cấp quyền push; task thật quyết định quyền đó.

Không cần dọn worktree để hoàn thành lab. Có thể giữ lại để xem RED/GREEN và handoff sau này.
