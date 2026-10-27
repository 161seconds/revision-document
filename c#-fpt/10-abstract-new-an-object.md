# ABSTRACT - NEW AN OBJECT

> Tác giả: Ben Trần · Nhóm: OOP
> Nguồn: [ABSTRACT - NEW AN OBJECT](https://bentran1vn.notion.site/ABSTRACT-NEW-AN-OBJECT-6fd6cdc3ffef42adb1fc59d52569162a) · Bản lưu: 27/10/2026

[Mục lục](README.md)

Initialization

```
internal abstract class Shape
{
public String Name { get; set; }
public String Description { get; set; }
public abstract double getArea();
}
class Rectangle : Shape
{
public double Width { get; set; }
public double Height { get; set; }
public override double getArea()
{
return Width * Height;
}
}
```

## Khai Báo Và Tạo Đối Tượng HCN

#### Có 2 cách Khai Báo

- Khai Cha New Con

- Khai Con New Con

#### Bình thường

```
Rectangle r1 = new Rectangle();
```

Thêm Value cho Backed Field

```
Rectangle r2 = new Rectangle() { Width = 15,
    Height = 8,
    Name = "Rectangle",
    Description = " " };
```

#### Trong C# Không Thể New Mới 1 Abstract Class

```
Shape shape = new Shape()
// Cấm C#, Java chính là Anonymus Class
```

Khai Cha New Con

```
Shape r3 = new Rectangle()
{
    Width = 15,
    Height = 8
};
```

```
Console.WriteLine(
" Rectangle 3 > W: " + ((Rectangle)r3).Width +
" Rectangle 3 > H: " + ((Rectangle)r3).Height +
" Dien tich 3 > S: " + r3.getArea()
);
```

Gọi Cha nhưng Con xung phong - override

⇒ Đa hình đã xuất hiện

Thằng con xài getArea của nó

⇒ Nhưng lúc này r3 không thể getWidth, getHeight tại vì khai Cha. Dẫn đến con trỏ chuột bị ngắn

⇒ Phải ép kiểu

hoặc như này

```
Rectangle r4 = (Rectangle)r3;
Console.WriteLine(
" Rectangle 4 > W: " + r4.Width +
" Rectangle 4 > H: " + r4.Height +
" Dien tich 4 > S: " + r4.getArea()
);
```
