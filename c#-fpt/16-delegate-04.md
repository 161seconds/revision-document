# DELEGATE - 04

> Tác giả: Ben Trần · Nhóm: DELEGATE
> Nguồn: [DELEGATE - 04](https://bentran1vn.notion.site/DELEGATE-04-68b3e9549ce24df9bc9b0b7b6deb0fe0) · Bản lưu: 27/10/2026

[Mục lục](README.md)

## ACTION AND FUNC

#### Hàm đa dạng nhưng rơi vào 2 dạng !

- Có trả về giá trị, kết quả

- Không trả về giá trị, kết quả

Quy ước gọi tên cho 2 loại hàm :

| Function | Action |
| --- | --- |
| Làm điều gì đó và có trả về kết quả | Làm điều gì đó thối |

dotNET Tạo Sẵn cho ta 2 loại DELEGATE tương ứng là FUNC và ACTION

| Function | Action |
| --- | --- |
| \<TỐI ĐÃ 16 THAM SỐ ĐẦU VÀO, +1 ĐẦU RA\> | \<TỐI ĐA 16 THAM SỐ ĐẦU VÀO\> |

Ví dụ

Func(string, string, int, double) ⇒ Hàm nhận 3 đầu vào (string, string, int) và trả ra double

## PREDICATES

.NET TÁCH RIÊNG 1 DELEGATE TRẢ VỀ GIÁ TRỊ VÌ TÍNH CHẤT QUAN TRỌNG CỦA LOẠI HÀM NÀY

Có Hàm chỉ nhận vào Một tham số, trả về kiểu Bool

Trích lỏ:  FUNC \< ?, BOOL \>

Cách đúng: PREDICATES ( Nhận vào 1 đầu vào trả về kiểu BOOL )

Initialization

```
static bool CheckGt56(int num)
{
return num >= 56;
}
```

Cách 1: Bộ sưu tập tự tạo

```
delegate bool CheckHang(int num); //Dùng sau đó CheckHang = CHeckGt56;
```

```
static void Main(string[] args)
{
CheckHang chk = CheckGt56;
    Console.WriteLine("Ngoc Trinh > 56 ? " + chk(70));
}
```

Cách 2: Chơi hàng có sẵn FUNC: `Func<int, bool>`

```
static void Main(string[] args)
{
Func<int, bool> chk2 = CheckGt56;
}
```

Cách 3: Chơi hàng xịn PREDICATE !!! : `Predicate<int>`

```
static void Main(string[] args)
{
Predicate<int> chk3 = CheckGt56;
    Console.WriteLine("Ngoc Trinh > 56 ? " + chk3(70))
}
```

ĐẲNG CẤP THÚ CƯNG

```
static void Main(string[] args)
{
Predicate<int> chk5 = (x) => x > 56;
    Console.WriteLine("Ngoc Trinh > 56 ? " + chk5(70));
}
```


---

### Xét loại hàm ĐIỀU GÌ ĐÓ, KHÔNG TRẢ VỀ KẾT QUẢ void ( F...có tham số hoặc không )

Initialization

```
static void SayHello() => Console.WriteLine("From SayHello(): Hello Message");
static void SayHi() => Console.WriteLine("From SayHi(): Hi Message");
static void SayNow() => Console.WriteLine("From SayNow(): Today is Friday");
```

#### Quen tay tạo luôn 1 bộ sưu tập hàm để trỏ 3 thằng này, những thằng Anonymous và cả những thằng trong tương lai chưa nghĩ ra …

```
delegate void DoSomethingDelegate(); //trỏ 3 thằng tren và khác nữa
//và anonymous nữa
```

```
static void UseDoSomethingDelegate()
{
SayHello();
DoSomethingDelegate f = SayHello; //dấu ngoặc tròn là gọi hàm mất tiêu
//đây mới là trỏ, tham chiếu thôi
f();
//dùng anonymos function, trỏ đến hàm thứ 4, không thèm trỏ 3 hàm đã biết
    f = delegate ()
{
        Console.WriteLine("This msg comes from an anonymous function");
};
    f += () => Console.WriteLine("This msg comes from an lambda function");
f();
}
```

## ACTION

Context:

- Giờ lúc nào chẵng lẽ cũng phải tạo một bộ sưu tập hàm trả ra void. dotNET nó thấy mắc công quá, thương lập trình viên quá, cung cấp luôn 1 Delegate tên là Action cho ta xài luôn, y chang như Delegate doSomething.

- Thống nhất tên gọi luôn. Là 1 ACTION !!!

```
delegate void Action()
```

Thằng này nó đã có sẵn rồi, khai báo sẵn rồi ! Lúc này Action xài y chang như xài DoSomeThingDelegate

```
static void UseActionDeletegate()
{
//DoSomethingDelegate ff = SayHi;
Action f = SayHi;
    f += () => Console.WriteLine("This msg comes from a lamba " +
"expression using pre-defined Action Delegaate");
//gọi 2 hàm chạy hoy
f();
}
```

Thử có tham số xem nào :

Initialization

```
static void SayHello(String msg, int number)
{
    Console.WriteLine($"From SayHello(), msg: {msg}, number: {number}");
}
```

Cách cũ: Tạo 1 bộ sưu tập hàm của riêng mình !

```
delegate void FMessage(String msg, int number);
```

```
static void Main(string[] args)
{
FMessage f = SayHello;
    f += (msg, num) => Console.WriteLine($"msg: {msg}, number: {num}");
f("Ngọc Trinh", 8400000);
}
```

Giờ lớn rồi ai xài vầy nữa. ACTION !!! Không thèm tạo DELEGATE LUÔN

```
static void Main(String[] args)
{
//không thèm xài Delegate tự làm ta xài Action có sẵn
Action<string, int> fff = SayHello;
    fff += (msg, num) => Console.WriteLine($"msg: {msg}, number: {num}");
fff("HQuyn Toi Yeu Em", 5);
}
```


---

## FUNC

Ta định nghĩa vài hàm trả về giá trị, sau đó dùng DELEGATE tự tạo và DELEGATE có sẵn FUNC ( CÓ TRẢ VỀ ) chứ không phải là ACTION ( KHÔNG TRẢ VỀ - VOID )

Lưu ý:

- `Func<int>` ít nhất trong Func phải có 1 data thể hiện cho kiểu dữ liệu đầu ra của mình

- Trong cái đám khai báo \<?, ?, ?, ?\> thằng cuối cùng là thằng đầu ra

Initialization

```
static int ComputeNumbers()
{
return 5 * 5;
}
static int SubtractNumbers() => 20 - 10;
```

#### Tạo bộ sưu tập hàm nào !

```
delegate int Fnumber();
```

```
static void Main(string[] args)
{
Fnumber f = SubtractNumbers;
    Console.WriteLine(f());//20 - 10
}
```

2024 rồi xài FUNC của dotNET đi cu

Func không có đầu vào nè

```
static void Main(string[] args)
{
Func<int> ff = SubtractNumbers;
    Console.WriteLine(ff());
}
```

Func Có 3 đầu vào là int và 1 đầu ra là int

```
static void Main(string[] args)
{
Func<int, int, int, int> fff = (a, b, c) => a + b + c;
    Console.WriteLine(fff(3,4,5));
}
```
