# COLLECTION - GENERIC

> Tác giả: Ben Trần · Nhóm: OOP
> Nguồn: [COLLECTION - GENERIC](https://bentran1vn.notion.site/COLLECTION-GENERIC-bd9d93e52c0842c595ea4db7fa40d28f) · Bản lưu: 27/10/2026

[Mục lục](README.md)

Initialization

Course.cs

```
internal class Course
{
public string Id { get; set; }
public string Name { get; set; }
public string Description { get; set; }
public int Credit { get; set; }
//hàm in thông tin môn học
public void PrintCourseInfo()
{
        Console.WriteLine("|{0}|{1}|{2}|{3}|", Id,Name,Description,Credit);
        Console.WriteLine($"|{Id}|{Name}|{Description}|{Credit}|");
        Console.WriteLine("Id: " + Id +
"Name: " + Name +
"Description: " + Description +
"Credit: " + Credit);
}
public override string? ToString()
{
String courseInfo = $"|{Id}|{Name}|{Credit}|";
return courseInfo;
}
}
```

## Generic

MyList.cs

```
internal class MyList<T>
{
T[] _list = new T[10]; //hard code 1 chút lưu 10 gì đó
int _i = 0;//biến đếm số Object đã đc đưa vào mảng
public void AddNew (T item)
{
        _list[_i++] = item;
}
public void PrintAll()
{
if(_i == 0)
{
            Console.WriteLine("There is nothing to print");
return;
}
        Console.WriteLine("There is/are " + _list.Length + "elements");
foreach(T item in _list)
{
            Console.WriteLine(value: item.ToString()); //gọi hàm toString
}
}
}
```

Program.cs

Add New Course

```
public static void AddNewCourse()
{
Course c1 = new Course()
{
        Id = "PRN211",
        Name = ".NET CROSS PLATFORM",
        Credit = 3,
        Description = "Giaolang"
};
    c1.PrintCourseInfo();
//khai báo biến lẻ để nhập từ bàn phím sau đó new
//biến cục bộ của hàm, quy tắc con lạc đà
//không có _
string id, name, description;
int credit;

    Console.WriteLine("Input the course info");
    Console.Write("Id: "); //In và không xuống hàng để dấu nháy ngay
    id = Console.ReadLine();

    Console.Write("Name: ");
    name = Console.ReadLine();

    Console.Write("Description: ");
    description = Console.ReadLine();
//mặc định nhập từ bàn phím và luôn là String, dù yêu cầu gõ số
//vậy ta cần convert về số như bên Java

    Console.Write("Credit: ");
    credit = System.Convert.ToInt32(Console.ReadLine());
//Java chính là Integer.parseInt
//newthoy
Course c2 = new Course() { Id = id, Name = name, Credit = credit, Description = description };
    c2.PrintCourseInfo();
}
```

#### Để nhận dữ liệu từ bàn phím

```
    Console.WriteLine("Input the course info");
    Console.Write("Id: "); //In và không xuống hàng để dấu nháy ngay
    id = Console.ReadLine();
```

#### Để ép kiểu từ String sang Int

```
Console.Write("Credit: ");
credit = System.Convert.ToInt32(Console.ReadLine());
//Java chính là Integer.parseInt
```

### Little Array ( Dont care if you know )

```
public static void PlayWithArray()
{
//int[] list = new int[10]; list[0] = 5; list[1] = 6;
int[] list1 = { 5, 10, 15, 20 }; // new ngắn
int[] list = new int[4] { 5, 10, 15, 20 };
//in mảng
for (int i = 0; i < list.Length; i++)
{
        Console.WriteLine(list[i]);
}
    Console.WriteLine(" ");
foreach (var item in list)
{
        Console.WriteLine(item);
}
}
```

Play Course List: Using Collection, Generic

```
public static void PlayCourseList()
{
//mình sẽ dùng class List<T> vừa tạo
//với cource là danh sách các môn học
MyList<Course> list = new();
Course prn211 = new Course()
{
        Id = "PRN211",
        Name = "Cross Platform Programming With C#",
        Credit = 3
};
    list.AddNew(item: prn211);//named argument, truyen tham số cho hàm
//và ghi luôn tên tham số cho rõ nghĩa

    list.AddNew(item: new Course()
{
        Id = "SWT301",
        Name = "Software testing",
        Credit = 3
});
    list.AddNew(new Course()
{
        Id = "SWT302",
        Name = "Requirement",
        Credit = 3
});
    list.PrintAll();
}
```

## Chơi Với Collection Có Sẵn .NET

CHƠI VỚI COLLECTION CÓ SẴN TRONG .NET

GIỐNG NHƯ CHƠI VỚI COLLECTION TRONG JAVA

⇒ COLLECTIONS LÀ TẬP HỢP CỦA NHỮNG CLASS - TÚI - THÙNG CHỨA CHỨA BÊN TRONG CÁC MÓN ĐỒ - OBJECT

- NHÉT ĐỒ VÀO TRONG, THƯỜNG GỌI LÀ ADD ( ) PUT ( )

- LẤY ĐỒ RA KHỎI TÚI, BỎ ĐI THƯỜNG GỌI LÀ REMOVE( ) DELETET( )

- LẤY RA XEM RỒI BỎ VÀO TRỞ LẠI \[ VỊ TRÍ \] GET( VỊ TRÍ ), VIEW( )

- TÚI CHỈ CÓ 2 LOẠI ĐỒ:
    - ĐỰNG LUNG TUNG, HỖN TẠP
    
    - TÚI CHỈ ĐỰNG 1 LOẠI ĐỒ : TÚI GENERIC

Play With Generic Collection ( )

```
public static void PlayWithGenericCollection()
{
List<Course> list = new();
//list hàng chuẩn của .NET có sẵn khi cài VS, hoặc .Net framework
//Java phải viết như này
//List<Course> lisst1 = new ArrayList();
//Bên java ko lưu list vì list abtract và interface
Course prn211 = new Course()
{
         Id = "PRN211",
         Name = "Cross Platform Programming With C#",
         Credit = 3
};
     list.Add(item: prn211);

     list.Add(item: new Course()
{
         Id = "SWT301",
         Name = "Software testing",
         Credit = 3
});
     list.Add(new Course()
{
         Id = "SWT302",
         Name = "Requirement",
         Credit = 3
});
     Console.WriteLine("Testing" + list.Count);
foreach (Course course in list)
{
         Console.WriteLine(course.ToString());
}
//print list theo mảng for []
}
```
