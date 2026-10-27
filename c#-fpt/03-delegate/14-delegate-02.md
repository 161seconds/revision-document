# DELEGATE - 02

> Tác giả: Ben Trần · Nhóm: DELEGATE
> Nguồn: [DELEGATE - 02](https://bentran1vn.notion.site/DELEGATE-02-a7c7425d089441d7ac8d31bec77f13eb) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

#### Delegate liên quan đến tạo ra 1 kiểu dữ liệu mới

Nó sánh ngang với class, interface

- Ví dụ: class student là kiểu dữ liệu mới dùng lưu trữ các Student x nào đó
    - An, Bình, Cường, Dũng, ... là các một loại Student-Datatype
        - Nếu muốn nói 1 bạn cụ thể thì gọi bạn ấy là Student x = ???
    
    - Exciter, Winner, RGV, Kawwasaki,... -\> Deadracer
        - Deadracer win = con xe cụ thể nào đó ...

#### CÁI STYLE CHUNG

| Kiểu-Dữ-Liệu | biến-x | = | Value Cụ thể |
| --- | --- | --- | --- |

Ví dụ:

| Interface | Deadracer | = | … |
| --- | --- | --- | --- |
| Class | Student | = | … |
| Delegate | void F() | = | … |

DELEGATE: TÊN GỌI CHO 1 ĐÁM HÀM

HÀM CỤ THỂ NÀO ĐÓ        F x = hàm nào ???;

Delegate ~ class ~ interface để tạo ra kiểu dữ liệu mới, tao lưu tên hàm

Nó được quyền khai báo ở ngoài class, trong NAMESPACE/ PACKAGE

#### TUI MUỐN ĐẶT TÊN GỌI CHUNG CHO 1 LOẠT CÁC HÀM STYLE VOID - VOID

```
static void SayHer()
{
    Console.WriteLine("Cuộc sống em ổn không ?");
}
static void TellHer()
{
    Console.WriteLine("Chúc em hạnh phúc bên người!");
}
static void TellThaoMai()
{
    Console.WriteLine("Xa anh em phải hạnh phúc!");
}
```

#### Delegate bắt đầu, 3 hàm trên cùng style void F(void) voidF()

```
delegate void F();
```

⇒ Nói về F là nói về n hàm cùng void void và còn những hàm void void khác chưa kịp nghĩ ra

F đại diên cho tất cả các hàm void void

Có kiểu Student, F rồi, ta khai báo biến để nói về 1 cái cụ thể nào đó

Thay vì int x = lưu con số

⇒ Bây giờ F = tên hàm - lưu tên hàm =\> TRỎ TỚI HÀM, CON TRỎ HÀM

⇒ Ngoài đời Lưu danh bạ, trỏ đến con người, Delegate Lưu tên hàm, con trỏ hàm

Lưu TellThaoMai ( Void Void ) vào bộ sưu tập hàm

```
static void Main(string[] args)
{
F x = TellThaoMai;
// Gọi hàm bằng cách tellThaoMai(); x()
x();
TellThaoMai();
// Reset bộ sưu tập hàm
		x = TellHer;
x();
}
```

Lưu cả 3 thằng vào bộ sưu tập hàm và gọi cùng 1 lúc

```
static void Main(string[] args)
{
//in cùng lúc cả 3 hàm, 3 câu, gọi cả 3 hàm vì đã ủy quyền, đã có đại diện
F x = SayHer;
    x += TellHer;
    x += TellThaoMai;
x();
}
```

### Thử tạo ra bộ sưu tập hàm Int Int

Initialization

```
//Hàm nhận vào 1 con số và nhân đôi
static int DoubleNumber(int x) => x * 2;
//Hàm nhận vào 1 con số và nhân 3
static int TripleNumber(int x)
{
    Console.WriteLine("Triple here");
return x * 3;
}
//Hàm nhận vào 1 con số và giảm 1/2, lấy phần nguyên
static int DecreaseHalf(int x) => x / 2;
//Hàm nhận vào 1 con số và trừ 10
static int Subtract10(int x) => x - 10;
```

#### Delegate xuất hiện, tạo ra 1 thằng đại diện định nghĩa chung cho cái đám int - int này

```
// định nghĩa tên gọi chung cho đám hàm mới này
delegate int CalculateNumber(int x);// Đại diện cho 1 đám hàm int-int
```

Như vầy là hỏng liền, vì F là bộ sưu tập Void Void mà mình lại bỏ Int Int vào là chết cơm

```
F x = Subtract10;//Gẫy do khác style
```

#### Bỏ 1 thằng vào 1 bộ sưu tập Hàm

Tranditional

```
CalculateNumber x = new CalculateNumber(TripleNumber);
```

Short Hand

```
CalculateNumber x = Subtract10;
//String msg = "hello", String msg = new String("hello")
```

#### Thử add 2 thằng vào bộ sưu tập, và gọi cái bộ sưu tập nó ra

```
static void Main(string[] args)
{
CalculateNumber x = new CalculateNumber(TripleNumber);

    x += Subtract10;
    Console.WriteLine("Excute x");
    Console.WriteLine(x(10));
//x.Invoke(100)
//Console.WriteLine(x.Invoke(100));//TRiệu hồn các hàm với data đưa vào
// là 100
}
```

Cái luồng nó chạy làm sao

- Khởi tạo 1 bộ sưu tập hàm CalculateNumber tên là x

- Add TripleNumber vào bộ sưu tập hàm

- Add thêm Subtract10 vào bộ sưu tập hàm

- Gọi bộ sưu tập hàm x ( 10 )

- Gọi hàm TripleNumber ( 10 )

- In ra Triple here, return 10 \* 3 = 30 console log không hứng

- Gọi hàm Subtract10( 10 )

- return 10 - 10 = 0 console log ra 0 vì nó là thằng cuối cùng

#### x ( ) và x.Invoke ( ) Không khác gì nhau, nó chỉ là cách viết tắt !!!

### Anonymous Function

Context:

Bây giờ muốn add một hàm vừa nghĩ ra tức thì vào 1 Bộ sưu tập hàm mà không biết đặt nó ở class nào ???? → Anonymous Function thoi

Định nghĩa:

Hàm ẩn danh, tức là không cần đưa tên hàm, chỉ cần có xử lí trên đầu vào

Làm ngay, tạo ra tức thì

#### Đẳng cấp thú cưng khi chơi với CalculateNumber(int x)

```
static void Main(string[] args)
{
//CalculateNumber x = trỏ 1 hàm cụ thể nào đó kiểu là int f (int)
CalculateNumber troHam = delegate (int x)
{
return (int)Math.Pow(10, x);
};//Anonymous Function

    Console.WriteLine(troHam(3));
//Đẩy Lên tới hạn - EXHAUSTIVE
    troHam = x => (int)Math.Pow(10, x);
}
```
