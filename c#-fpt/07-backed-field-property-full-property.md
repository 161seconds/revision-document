# BACKED FIELD - PROPERTY - FULL PROPERTY

> Tác giả: Ben Trần · Nhóm: OOP
> Nguồn: [BACKED FIELD - PROPERTY - FULL PROPERTY](https://bentran1vn.notion.site/BACKED-FIELD-PROPERTY-FULL-PROPERTY-d93562059f614194a0d6e340f64d0c66) · Bản lưu: 27/10/2026

[Mục lục](README.md)

## LẬP TRÌNH HƯỚNG ĐỐI TƯỢNG GỒM 4 NGUYÊN LÍ

OOP - OBJECT ORIENTED PARADIGN ( TƯ DUY HƯỚNG VỀ ĐỐI TƯỢNG )
- Gồm 2 nguyên lí đó là 4 + 5

- 4
    - Abtraction
    
    Nhận diện đối tượng
    
    - Encapsulation
    
    Biểu diễn lại đối tượng
    
    | Student |
    | --- |
    | - id |
    | - name |
    | - age |
    
    - Inheritance
    
    - Polymorphism

## NAMESPACE

- Là 1 khái niệm logic đặt tên cho một 1 nhóm class có cùng chung 1 không gian

- Dùng để chia khu vực

### CLASS DIAGRAM

| Student |
| --- |
| - id |
| - name |
| - age |
| + showInfor( ) |
| + cuoiHaha( ) |

C# nếu ko ghi public | private thì mặc định là private

## INSTANCE Variable

- BIẾN MÀ DÙNG ĐỂ LƯU INFO CỦA 1 OBJECT

## BACKED-FIELD, DATA FIELD

Những biến mà dùng để lưu info của 1 object thì gọi là instance variable - C# còn gọi là backed-field, data field

```
string _id;
string _name;
int _yob;
string _email;
```

- Nếu không ghi public, private thì mặc định là private

## DEFAULT VALUE

KHI MÌNH KHỞI TẠO 1 SINH VIÊN MÀ KHÔNG GÁN INFO GÌ CẢ, CÁC FIELD NÀY ĐƯỢC MANG GIÁ TRỊ DEFAULT:

- SỐ → 0

- BOOLEAN → FALSE

- OBJECT → NULL

## CREATE A CONSTRUCTOR

```
public Student(string id, string name, int yob, string email)
{
_id = id;
_name = name;
_yob = yob;
_email = email;
}
```

### Empty Constructor

- Dùng để new( ) không tham số đưa vào !!!

- Nếu 1 class không có 1 ctor nào, thì .NET tự tạo giùm

- Nếu 1 class bất kì đã có sẵn 1 ctor bất kì, thì ctor rỗng không được tạo ra nữa, trừ khi bạn chủ động tạo bằng tay

## GET A DATA FIELD

### Tranditional

```
public string GetId()
{
return _id;
}//style JAVA
```

### Expression Body

Nếu chỉ có 1 câu lệnh duy nhất, ta dẹp luôn return và { }, nối lệnh với tên hàm qua dấu ⇒

```
public string GetId() => _id;
```

## SET A DATA FIELD

### Tranditional

```
public void SetName(string name)
{ 
		_name = name;
}//style JAVA
```

### Expression Body

```
public string SetName(string name) => _name = name;
```

## TRANSFORM A NORMAL FUNCTION TO EXPRESSION LANGUAGE

### Tranditional

```
public void ShowProfile() //Chuyển thành Expression Body được luôn
{
    Console.WriteLine("ID " + _id +
" | Name: " + _name +
" | Name: " + _yob);
}
```

### Expression Body

```
public void ShowProfile () => Console.WriteLine("ID " + _id +
" | Name: " + _name +
" | Name: " + _yob);
```

## NEW AN OBJECT

```
Student s1 = new Student("SE171757", "EmTanIT", 2003, "email@");
```

```
Student s2 = new Student(id: "SE171758", name: "EmTanHuHu",
yob: 2004, email: "email@");
```

```
Student s3 = new ("SE171759", "EmTanHaha", 2005, "email@");
```

```
var s4 = new Student(id: "SE171760", name: "EmTanHehe",
yob: 2006, email: "email@");
```

## PROPERTY OF CLASS

Nó là 1 đại diện cho Backed-field

```
string _name;
public string Name
{
get { return _name; }
set { _name = value; }
}
```

- Value chính ra đầu vào cho hàm SetName()

Expression Body

```
public int Yob
{
//get { return _yob; }
get => _yob;
//set { _yob = value; }
set => _yob = value;
}
```

Nếu mà không muốn mã số sinh viên chỉ đọc xem, chứ không cho thay đổi

```
public string Id { get => _id; }
```

## CREATE OBJECT WITH FULL PROPERTY

```
internal class Student
{
//string _id; => Không cần tạo Backed Field
public int Id { get; set; }
public string Name { get; set; }
public int Yob { get; set; } = 2005;
// Instace create has default Yob is 2005
}
```

```
static void Main(string[] args)
{
Student s1 = new Student { Id = 1, Name = "TAN TRAN", Yob = 2003 };
//cái này là tạo constructor
//sau đó s1.setName( TAN TRAN )
}
```

- Không cần tạo thêm Data Field là nó vẫn tự hiểu luôn ngầm mặc định là đá tạo sẵn thằng private int \_id
