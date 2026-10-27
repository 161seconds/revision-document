# INTERFACE

> Tác giả: Ben Trần · Nhóm: OOP
> Nguồn: [INTERFACE](https://bentran1vn.notion.site/INTERFACE-4b00430a115b45148a77d0d14d537c3e) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

Dead Racer.cs

Interface DeadRacer

```
internal interface DeadRacer
{
public double RunToDeath();
}
```

Phàm đã là đua thủ, thì nhiệm vụ chính là đua

- Ai muốn là đua thủ, thì phải cam kết đua **NHƯNG** đua thế nào tùy mỗi đứa, nhưng phải đua, vì đã tham gia
    - Đua thế nào: bốc đầu, cà chân chống, tung mình ...

- Mỗi đua thủ tự lo - Implement theo cách của mỗi đứa

⇒ Đa hình : Đua( ) đi, mỗi đứa tự Đua( ) Theo Cách Riêng!!!

Hàm ĐUA( ) Ở ĐÂY SẼ LÀ ABTRACT, TAO NÓI Ý LÀ ĐUA HẾT MÌNH, CÒN MỖI ĐỨA HẾT MÌNH THẾ NÀO, TÙY !

` public double RunToDeath();`

- Không cần từ khóa abtract như bên class abtract, mặc định là vậy

- TẤT CẢ AI THAM GIA ĐUA - CLASS "CON" phải IMPLEMENT

- MỘT CLASS NÀO ĐÓ (CONCRETE) CHỈ CÓ TỐI ĐA 1 CLASS CHA - KẾ THỪA

- NHƯNG CÓ THỂ THAM GIA VÀO N ( Nhiều ) INTERFACE - CLB
    - MỖI NGƯỜI CHỈ CÓ 1 DÒNG HỌ - BA MẸ
    
    - VÀ CÓ THỂ THAM GIA NHIỀU CLB, HỘI NHÓM
    
    - Ví Dụ: 
        //JAVA: MOTO EXTENDs cha nào đó implement DeadRacer{}
                //MOTO extends Vehicle implements DeadRacer
    
        //C# : Motor : Cha nào đó: DeadRacer {}
               // Motor : Vehicle, DeadRacer

Moto.cs implement DeadRacer

```
internal class Motor : DeadRacer
{
public string Name { get; set; }
public string Platenumber { get; set; }
public double Volume { get; set; }
//Tốc độ chạy trên đường phố
//public double Run() 
//{ 
//    Random random = new Random();
//    //tạo ra máy sinh số ngẫu nhiên
//    //giống như máy ném trái banh ngẫy nhiên cho 
//    //việc luyện tập phản xạ
//    //Máy-Ngẫu-Nhiên có hành động thảy ra ngẫu nhiên
//    //con số, trái banh, tọa độ,
//    //double speed = random.NextDouble()*120;
//    //return speed;
//    return new Random().NextDouble() * 120;
//}
public double Run() => new Random().NextDouble() * 120;
public double RunToDeath() => Run() * 3;
//{ 
//    return Run() * 3;
//}
//expression bodied. chỉ dùng cho hàm, property có 1 dòng code
//không nhầm với biểu thức lambda
public Motor() { }
}
```

Program.cs

```
internal class Program
{
static void Main(string[] args)
{
Motor ex1 = new Motor()
{
            Platenumber = "53F1 11111",
            Name = "SHY 250cc",
};
        Console.WriteLine("SH speed: " + ex1.Run());
        Console.WriteLine("SH speed supper vip: " + ex1.RunToDeath());
DeadRacer win = new Motor();
        Console.WriteLine("Winner speed supper vip: " + win.RunToDeath());
//muốn xe này đi học với tốc độ bình thường thì phải kéo con trỏ win xuống dưới
//đáy vùng new
        Console.WriteLine("Winner speed : " + ((Motor)win).Run());
}
}
```

Khai cha new Con

```
 DeadRacer win = new Motor();
```

⇒ Con trỏ chuột bị ngắn. Không thấy được Run Phải ép kiểu thì mới thấy được

```
Console.WriteLine("Winner speed : " + ((Motor)win).Run());
```
