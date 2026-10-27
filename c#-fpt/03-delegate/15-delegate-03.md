# DELEGATE - 03

> Tác giả: Ben Trần · Nhóm: DELEGATE
> Nguồn: [DELEGATE - 03](https://bentran1vn.notion.site/DELEGATE-03-bab5e23ef5d74a36b95f1210a1669237) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

Initialization

```
//Hàm nhận vào 1 số nguyên và in ra con số đó
static void F1(int x)
{
    Console.WriteLine("F1 Method with x = " + x);
}
//Hàm nhận vào 1 con số nguyên và in ra con số đó bình phương
static void F2(int x)
{
    Console.WriteLine("F2 Method with x = " + Math.Pow(x,2));
}
//Hàm nhận vào 1 con số nguyên và in ra con số đó mũ 3
static void F3(int x)
{
    Console.WriteLine("F3 Method with x = " + Math.Pow(x, 3));
}
```

#### Tạo ra một bộ sưu tập hàm, Nhận vào một con Int và Ói ra 1 suy luận Console.WriteLine gì đó  !!!

```
//Một cái tên đại diện cho 3 hàm, và còn nhiều hàm nữa cùng style
delegate void FDelegate(int x);
```

#### Nhớ là truyền cho bộ sưu tập hàm là một cái tên

```
FDelegate f = F1;
```

Dấu ngoặc là gọi làm mất tiêu rồi, trong khi đây mới chỉ là tớ là f, sẽ trỏ tới cậu F1, tớ thay cho cậu là F1

#### Gọi hàm thông qua thằng khác

```
 f(10)
```

Đồng nghĩa với F1( 10 ). Gọi hàm thông qua ng khác, Gọi là Ủy Quyền

#### Bộ sưu tập hàm, có thể trỏ nhiều thằng cùng lúc

```
FDelegate f = F1;
f += F2;
f += F3;
//gọi cả 3 thằng
f(20);
// 20 400 8000
```

Vì là một bộ sưu tập hàm, f hay hơn biến thường có thể trỏ cùng lúc nhiều hàm  bằng toán tử `+=`

#### Thêm vào bộ sưu tập một hàm On-The-Go

NẾU TUI MUỐN f trỏ đến hàm F5(int x) Trả về mũ 5

Tranditional

⇒ Ta phải tạo hàm f5() riêng rồi gán =

2024 rồi ai còn làm thế, hiện đại lên, lười biếng lên

⇒ Làm biếng tạo hàm riêng, tạo hàm On-The-Go, Takeaway, không tạo hàm F5 Ghế

```
f += delegate (int ahihi) //tao trỏ đến hàm có đầu vào ahihi
{
    Console.WriteLine("Anonymos ^ 5 = " + Math.Pow(ahihi, 5));
};
Console.WriteLine("Invoke functions with x =30");
f(30);
```

#### LAMBDA EXPRESSION

Định nghĩa

KĨ THUẬT RÚT GỌN 1 HÀM ẨN DANH ĐẾNM ỨC TỐI THIỂU

NÂNG CẤP TIẾP ANONYMOS METHOD, RÚT GỌN ANONYMOS METHOD CHO GỌN GÀNG HƠN - CHỈ CÒN CÁI NỊT

TUI MÚN TRỎ ĐẾN HÀM MŨI MƯỜI ĐẦU VÀO X, hủy hết các con trỏ ở trên luôn, chỉ trỏ 1 hàm duy nhất cho dễ quan sát

```
f = ahihi => Console.WriteLine("Anonymoust method ^ 10:" + Math.Pow(ahihi, 10));
```

Main

```
static void Main(string[] args)
{
FDelegate f = F1; //dấu ngoặc là gọi hàm mất tiêu, trong khi đây mới chỉ
//là tớ là f, sẽ trỏ tới cậu F1, tớ thay cho cậu là F1
f(10); //-- F1(10) // Gọi hàm thông qua ng khác, Gọi là Ủy Quyền
//f hay hơn biến thường có thể trỏ cùng lúc nhiều hàm = toán tử +=
    f += F2;
    f += F3;
//gọi cả 3 thằng
f(20);// 20 400 8000
//NẾU TUI MUỐN f trỏ đến hàm F5(int x) Trả về mũ 5, thì cách truyền thống
//Ta phải tạo hàm f5() riêng rồi gán = 
//Làm biếng tạo hàm riêng, tạo hàm On-The-Go, Takeaway, không tạo hàm F5 Ghế

    f += delegate (int ahihi) //tao trỏ đến hàm có đầu vào ahihi
{
        Console.WriteLine("Anonymos ^ 5 = " + Math.Pow(ahihi, 5));
};
    Console.WriteLine("Invoke functions with x =30");
f(30);
//NÂNG CẤP TIẾP ANONYMOS METHOD, RÚT GỌN ANONYMOS METHOD CHO GỌN GÀNG HƠN - CHỈ CÒN CÁI NÍT
//TUI MÚN TRỎ ĐẾN HÀM MŨI MƯỜI ĐẦU VÀO X
//hủy hết các con trỏ ở trên luôn, chỉ trỏ 1 hàm duy nhất cho dễ quan sát
    f = ahihi => Console.WriteLine("Anonymoust method ^ 10:" + Math.Pow(ahihi, 10));
//LAMBDA EXPRESSION - KĨ THUẬT RÚT GỌN 1 HÀM ẨN DANH ĐẾNM ỨC TỐI THIỂU
f(2);
}
```
