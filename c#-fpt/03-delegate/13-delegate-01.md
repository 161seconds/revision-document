# DELEGATE - 01

> Tác giả: Ben Trần · Nhóm: DELEGATE
> Nguồn: [DELEGATE - 01](https://bentran1vn.notion.site/DELEGATE-01-5002b734dbfa489f898f268136d2213e) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

## DELEGATE LÀ GÌ

- Một dạng class đặc biệt; chứa infor là TÊN CỦA HÀM NÀO ĐÓ TỒN TẠI NGOÀI KIA

- Khác hoàn toàn interface, abtract class CHỨA HÀM CÓ CODE, KHÔNG CODE VÀ CẦN IMPLEMENT

- Một dạng class đặc biệt này chứa info là TÊN CỦA CÁC HÀM ĐÃ Ở ĐÂU ĐÓ TRONG CÁC CLASS KHÁC

- CLASS NÀY NẮM DANH SÁCH CÁC HÀM Ở NƠI KHÁC
    - THAM CHIẾU ĐẾN CÁC HÀM NƠI KHÁC
    
    - TRỎ ĐẾN CÁC HÀM KHÁC Ở NƠI KHÁC

- BẢNG PHONG THẦN, NIÊM YẾT, THÔNG BÁO CÓ CÁC HÀNH ĐỘNG GÌ ĐÓ Ở ĐÂU ĐÓ, CODE CÓ Ở ĐÂU ĐÓ RỒI

Initialization

Ban.cs

```
internal class Ban
{
public static void NhanEm() => Console.WriteLine("Chuc em hanh phuc ben nguoi");
}
```

Tui.cs

```
internal class Tui
{
public static void TellHer() => Console.WriteLine("Cuoc song em on ko");
}
```

Program.cs

```
internal class Program
{
public delegate void BoCauDuaThu();
static void Main(string[] args)
{
BoCauDuaThu ThangKia = Tui.TellHer;
        ThangKia += Ban.NhanEm;
ThangKia();
//Cuoc song em on ko
//Chuc em hanh phuc ben nguoi
}
}
```

```
public delegate void BoCauDuaThu();
```

- ĐẠI DIỆN CHO TẤT CẢ CÁC HÀM VOID TRÊN CUỘC ĐỜI NÀY VÀ KHÔNG ĐẦU VÀO

⇒ DO ĐÓ 2 HÀM TellHer() và GuiEm() thỏa tiêu chí BoCauDuaThu

⇒ Nó là 1 loại bản tin chứa tất các các hàm VOID F(VOID)
