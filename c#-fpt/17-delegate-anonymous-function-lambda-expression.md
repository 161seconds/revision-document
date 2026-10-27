# DELEGATE - ANONYMOUS FUNCTION - LAMBDA EXPRESSION

> Tác giả: Ben Trần · Nhóm: DELEGATE
> Nguồn: [DELEGATE - ANONYMOUS FUNCTION - LAMBDA EXPRESSION](https://bentran1vn.notion.site/DELEGATE-ANONYMOUS-FUNCTION-LAMBDA-EXPRESSION-ac6798077c1e48a2b97f9e18bcfe9bd0) · Bản lưu: 27/10/2026

[Mục lục](README.md)

## DELEGATE & EVENT

Deletegate là tên gọi chung cho 1 nhóm hàm có cùng format/style/ cùng signature

- Đầu vào và đầu ra giống nhau

- Vì là tên gọi chung, cho nên khi ta muốn nói về 1 hàm cụ thể nào đó, ta khai báo 1 biến thuộc tên gọi chung = tên hàm muốn nói đến

- void F1(int x)
{
code bt
}

- void F2(int y)
{
code bt
}

- void F3(int y)
{
code bt
}

- void F4(int xx)
{
code bt
}

```
delegate void F(int xxx)
```

- tên gọi chung cho các hàm ở trên và còn nhiều hàm khác nữa cùng style

- F : Trở thành Data Type như Int, Long, Double

⇒ vậy nếu có data type thì sẽ có variable : int x, double y, FDelegate f

- FDelegate map với F1 F2 F3 F4
​

Để nói về 1 hàm hay nhiều hàm cụ thể - khai báo biến

- FDelegate fnaodo = 1 TRong những hàm cùng kiểu

- FDelegate fNaoDo = F1 : //trỏ tới, hay nói tới hàm F1

- FDelegate fNaoDo = F2

- FDelegate fNaoDo += F3 //biến này nó có quyền giữu nhiều hơn 1 giá trị
//khác biến int x 1 chút, chỉ lưu 1 giá trị

- FNaoDo(10) ~ GỌi hàm F3(10) gọi hàm F2(10)

- Tên biến Ứng với tên Hàm, Thì tên biến( ) Ứng với gọi hàm () tương ứng

## ANONYMOUS FUNCTION

- Vì delegate sinh ra để trỏ, lưu trữ tên hàm nào đó = Tên-Hàm-nào-đó
VÀ SAU ĐÓ NÓ GỌI HÀM THAY CHO GỌI HÀM TRỰC TIẾP

- Có tình huống ta làm biếng tạo sẵn hàm, với 1 cái tên nào đó, nhưng nó có xử lí và để cho delegate gọi giùm - Làm biếng đặt tên hàm nhưng vẫn muốn nhờ Delegate gọi giùm -\> Annonymos FUnction
​

```
FDelegate fNaoDo = delegate(int x)
{
			nội dung hàm nằm ở đây, xử lí hàm
}
```

## LAMBDA EXPRESSION - NHÌN HÀM MÀ GIỐNG NHƯ BIỂU THỨC TÍNH TOÁN

- LÀ trường hợp đặc biệt của ANONYMOS FUNCTION, tức là nó cũng là hàm ẩn danh nhưng viết ở mức độ rút gọn nhất có thể

```
FDelegate fNaoDo = Biểu thức Lambda
FDelegate fNaoDo = (int x)
```

#### Căn đầu vào của biểu thức y chang đầu vào của hàm đang được trỏ

- Nếu hàm đang trỏ có tham số đầu vào ví dụ (int x)
Thì biểu thức lambda khởi đầu = tham số hàm
Nếu hàm không có tham số đầu vào, thì vẫn cần cặp ngoặc ( )

```
FDelegate fNaoDo = Biểu thức Lambda

FDelegate fNaoDo = ( int x )

FDelegate! fNaoDo = ( )
```

#### Sau tham số hàm là mũi tên =\> Trỏ đến thân hàm
​

```
FDelegate fNaoDo = (int x) =>

FDelegate! fNaoDo = () =>
FDelegate fNaoDo = (int x, int y) =>
```

#### Nếu thân hàm chỉ có 1 lệnh duy nhất, thì không cần ngoặc nhọn {}

Còn thân hàm có nhiều hơn 1 lệnh , thì bắt buộc phải có {Body Hàm}
​

```
FDelegate fNaoDo = (int x) => 1 Lệnh nào đó

FDelegate fNaoDo = (int x) => {
		Nhiều lệnh viết như hàm bth
}
```


---

#### Sau khi hoàn thiện biểu thức lambda

Chính là làm 1 hàm làm biếng đặt tên, thì gọi DELEGATE như bình thường !!! BẢN CHẤT VẪN LÀ TRỎ HÀM
TRỎ HÀM LÀM BIẾN ĐẶT TÊN; VẪN GỌI HÀM QUA DELEGATE() NHƯ BTH


---

#### QUY TẮC RÚT GỌN CHỈ CÒN CÁI DÂY NỊT

- NẾU THÂN HÀM CHỈ CÓ 1 LỆNH THÌ KO CẦN DÙNG {}. NẾU LỆNH CÓ RETURN BỎ RETURN LUÔN

- NẾU HÀM CÓ TỪ 2 LỆNH TRỞ LÊN BẮT BUỘC PHẢI {} VÀ RETURN NHƯ BTH

- NẾU ĐẦU VÀO KHÔNG CÓ GÌ CẢ, THÌ SẼ LÀ () =\>

- NẾU ĐẦU VÀO CÓ 1 THAM SỐ, BỎ LUÔN DẤU NGOẶC, BỎ LUÔN CẢ KIỂU DỮ LIỆU
CHỈ GHI s =\> x =\> a =\>

- NẾU ĐẦU VÀO TỪ 2, 3 THAM SỐ, BỎ LUÔN KIỂU DỮ LIỆU, NHƯNG PHẢI GHI TÊN THAM SỐ TRONG NGOẶC
( a, b) =\>
(a, b, c) =\>
