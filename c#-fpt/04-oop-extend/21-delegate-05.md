# DELEGATE - 05

> Tác giả: Ben Trần · Nhóm: OOP - EXTEND
> Nguồn: [DELEGATE - 05](https://bentran1vn.notion.site/DELEGATE-05-99d8c9be545445cf922f6b5928386f9a) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

## ỨNG DỤNG CỦA DELEGATE – DELEGATE DÙNG ĐỂ LÀM GÌ ???

### DÙNG ĐỂ MỞ RỘNG KHẢ NĂNG CỦA 1 OBJECT BẤT KÌ

TỨC LÀ 1 OBJECT ĐƯỢC THIẾT KẾ TRƯỚC ĐÓ, CÓ THỂ LÀM ĐƯỢC THÊM NHIỀU CÔNG VIỆC MÀ LÚC THIẾT KẾ RA NÓ, NGƯỜI TA CHƯA NGHĨ RA, HOẶC DỰ KIẾN OBJECT SẼ LÀM ĐƯỢC THÊM 1 CÁI GÌ ĐÓ, NHƯNG CHƯA BIẾT CỤ THỂ LÀ GÌ -\> ĐẾN 1 LÚC SẼ LÀM ĐƯỢC ( LOOSELY COUPLING )

### 2     DÙNG ĐỂ XỬ LÍ CÁC SỰ KIỆN – EVENT – ĐIỀU GÌ ĐÓ XẢY RA TRÊN OBJECT – ĐẶC BIỆT LÀ CÁC OBJECT LIÊN QUAN ĐẾN WINDOW – FORMS ( APP DESTKTOP )

CÁC OBJECT TRÊN FORMS, THÌ NÓ LÀ 1 OBJECT GẦN HOÀN CHỈNH

- NÓ CÓ CÁC ĐẶC TÍNH, HÀNH ĐỘNG NHƯ MỌI CLASS

Button Exist;

btnExist = new Button()

btnExist.Text = “Exist”

…

GẦN LÀ NÓ HIỂN THỊ TRÊN MÀN HÌNH NGON LÀNH. NHƯNG NÓ CÒN VÔ DỤNG – CLICK VÀO NÓ KHÔNG BIẾT LÀM GÌ

- VÌ PHẦN NÀY LÀ TÙY THUỘC VÀO AI ĐÓ – DEVELOPER XÀI NÚT NÀY KHI VIẾT CODE

- ĐỂ NÚT BẤM LÀ ĐƯỢC ĐIỀU GÌ, THÌ CẦN DÂN DEV VIẾT NỐT ĐOẠN CODE LÀM GÌ KHI BỊ CLICK

```
- Class Button {

Name: ___

Text:    ___

Color: ___
Click( ) {
//Làm gì đâu biết, chừa sẵn chỗ để nhét cái hàm của AI xài nút này,
//dev nào xài thì đưa code vào
//ĐƯA CODE VÀO, ĐƯA HÀM VÀO, ĐƯA HÀM CỦA CHÚNG TA VÀO
}
```

```
HàmXử LýClick ( )
{

			Code của dev xài nút bấm làm cái gì đó
}
```

### HẬU TRƯỜNG LÚC KÉO THẢ NÚT BẤM, CODE, PROPERTY

- Click += HàmxửlíClick; //gán con trỏ hàm cho sự kiện Click chừa chỗ

- TUI CLICK BUTTION MỞ RỘNG KHẢ NĂNG CỦA TÔI, CHẤP NHẬN XÀI HÀM CỦA CÁC ANH EM BÊN NGOÀI, TUI BUTTION ĐƯA HÀM CHO BUTTON TUI ĐI, TUI GỌI CHO

- WINDOWS KIỂM SOÁT CLICK, GỌI NÚT BẤM CLICK KHI USER NHẤN NÚT, NÚT ĐƯỢC WINDOWS ĐẨY CHẠY CLICK, CLICK CHYAJ THÌ GỌI HÀM DELEGATE MÌNH CHẠY -\> CHUỖI EVER XẢY RA, VÀ NÚT BẤM LÀM ĐƯỢC MỌI VIỆC THEO CÁCH AI ĐÓ MUỐN
