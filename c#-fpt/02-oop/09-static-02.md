# STATIC - 02

> Tác giả: Ben Trần · Nhóm: OOP
> Nguồn: [STATIC - 02](https://bentran1vn.notion.site/STATIC-02-4260b2f682dc4e83ba32d7aa68d639b5) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

- TUYỆT ĐỐI KHÔNG DÙNG STATIC CHO NHỮNG BIẾN/PROP, HÀM MÀ NÓ MÔ TẢ ĐẶC TÍNH, HÀNH SỬ CỦA TỪNG OBJECT

- CÁI GÌ ĂN THEO OBJECT THÌ KHÔNG ĐƯỢC LÀ STATIC
    - VÍ DỤ TÊN NGƯỜI, NĂM SINH, MÃ SỐ LÀ ĂN THEO TỪNG NGƯỜI -\> NON - STATIC

- KHI NÀO DÙNG STATIC
    - KHI TA CÓ NHỮNG THỨ XÀI CHUNG GIỮA CÁC OBJECT, NHỮNG TOOL VÀ CÔNG CỤ/HÀM SỬ LÍ RỒI RETURN, KHÔNG LƯU TRỮ VÀ ĐÂU, THÌ LÀ STATIC
        - VÍ DỤ: CÁC HÀM TOÁN HỌC, CÁC TÍNH TOÁN TRẢ VỀ GIÁ TRỊ RỒI THÔI
            - TA HAY ĐẶT NHỮNG THỨ DÙNG CHUNG NÀY VÀO 1 CLASS RIÊNG BIỆT
                - VÍ DỤ: DẠNG LÀ UTILITY, TOOL, ĐỒ CHƠI, ĐỒ NGHỀ DÙNG CHUNG

```
internal class MyToy
{
//public void sayHello { } 
//bị chửi vì hàm này là non-static, instance method
//hàm này ăn theo vùng new thì không vào class này được
public const double Pi = 3.1415;
public const double Vat = 0.08; //QUốc hội vừa mới điều chỉnh từ 10%
public static int C = 300_000; //TỐc độ ánh sáng 300km/s // phân cách phần ngàn cho dễ đọc
/// <summary>
///hàm tính giai thừa n!
///0! = 1! = 1
///n! = 1.2.3.4..n
///không có giai thừa của số âm
/// 20! là vừa đủ với kiểu long, 21! long chứa không nổi gọi là overflow
/// </summary>
/// <param name="n"
/// <returns></returns>
public static long GetFactorial(int n)
{
long sum = 1;
if(n<0 || n > 20)
{
throw new ArgumentOutOfRangeException("Please n in the range 0 to 20");
}
if (n == 0 || n == 1) return 1;
for (int i = 2; i <= n; i++)
{
            sum = sum * i;
}
return sum;
}
}
```

```
static void Main(string[] args)
{
    Console.WriteLine("Test my toy class");
    Console.WriteLine("Test my toy: " + MyToy.Pi);
    Console.WriteLine("Test my toy: 5! = 120" + MyToy.GetFactorial(5));
}
```

## KHÁC BIỆT GIỮA NON-STATIC AND STATIC

#### Non-Static

- Gọi phải new mới

#### Static

- Gọi không cần new mới, gọi trực tiếp qua class luôn
