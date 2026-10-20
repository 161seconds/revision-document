# 02. Debug, test và xác minh

## Vòng làm việc tối thiểu

1. Ghi branch, commit, file đang thay đổi và lệnh baseline.
2. Tái hiện lỗi bằng đầu vào nhỏ nhất. Đọc traceback và luồng dữ liệu trước khi sửa.
3. Viết hoặc chọn test phân biệt hành vi sai với hành vi đúng. Chạy để thấy lỗi đúng nguyên nhân.
4. Sửa tại điểm dùng chung, giữ contract. Chạy lại chính test đó, sau đó bộ test liên quan.
5. Review diff, kiểm tra whitespace và ghi bằng chứng trước khi commit theo quyền đã cấp.

Lỗi thiếu Python hoặc đường dẫn sai là lỗi setup, không phải RED chứng minh bug nghiệp vụ. Một test chỉ check “không throw” cũng chưa chứng minh payload giữ nguyên ký tự đặc biệt.

## Prompt debug

```text
$systematic-debugging
Điều tra lỗi JSON trong task đã mô tả. Đọc script và test liên quan.
Trước khi sửa: báo đầu vào tái hiện, vị trí lỗi, giả thuyết và phép kiểm tra.
Giữ nguyên API hiện có. Không sửa assertion để che lỗi.
Sau sửa: chạy lại cùng test; chỉ báo kết quả có output thực tế.
```

Với generator của lab, phân biệt ba việc: parse template JSON, nội suy giá trị và serialize JSON. `str.format` trên toàn chuỗi JSON coi dấu ngoặc của object là placeholder; thay trực tiếp chuỗi cũng có thể làm mất escaping.

## Prompt trước khi hoàn thành

```text
$verification-before-completion
Đối chiếu acceptance criteria với diff cuối. Chạy test liên quan và
git diff --check. Báo lệnh, exit code, số test, phần chưa kiểm tra.
Chỉ commit/push nếu quyền của task hiện tại cho phép.
```

Không dùng “build đạt” thay cho “integration test đạt”. Không dùng “push thành công” thay cho “CI xanh”. Khi commit và push được phép, kiểm tra branch đích, stage đúng file, push thường; không force-push để vượt qua thay đổi của người khác.

## Khi kết quả không ổn định

Lưu seed, phiên bản công cụ, dữ liệu và thời điểm. Với race, dựng lịch chạy bằng barrier hoặc tín hiệu DB; tăng thời gian ngủ thường chỉ làm lỗi khó thấy hơn. Với model, chạy nhiều mẫu và nhiều lần; một output đẹp không đại diện cho cả pipeline.
