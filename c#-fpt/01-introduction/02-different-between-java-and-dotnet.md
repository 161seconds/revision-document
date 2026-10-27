# DIFFERENT BETWEEN JAVA AND DOTNET

> Tác giả: Ben Trần · Nhóm: Introduction
> Nguồn: [DIFFERENT BETWEEN JAVA AND DOTNET](https://bentran1vn.notion.site/DIFFERENT-BETWEEN-JAVA-AND-DOTNET-94093e7c600744b09757649beb5e231a) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

## Mục Lục:

- Giới thiệu và định hướng cho kì 5, 6

- Đề ra các luật lệ trong lớp

- Demo chuẩn bị CV

- Demo viết email

- Demo các kiến thức đi phỏng vấn

- Bắt đầu vô C#

- Cài đồ chơi C#

### 

### JAVA. MỘT BƯỚC NHẢY VỌT CỦA PHẦN MỀM

**Đuôi của thằng Java**

- . jar ( java archive )

- . war ( web archive )

**Trước khi Java**

- Xài ngôn ngữ C/C++ có điều đặc biệt là khi viết code xong chỉ chạy trên đúng 1 hệ điều hành nào đó ( PLATFORM DEPENDENT ).

- C/C++ nó là một bộ cấu thành của 2 thứ HARDWARE và OS, nó tạo ra cái nơi để app nó chạy. APP viết trên hệ điều hành nào đó thì chỉ chạy trên hệ điều hành nào đó. Gây ra 1 điều dỡ → Nếu Word chạy trên WIN thì không thể chạy trên MAC.

- C vẫn phải viết, khi đến giai đoạn complie thì phải C compiler trên môi trường nào. Nếu WINDOW thì .exe, nếu LINUX thì dot thôi. Thằng nào ở môi trường nào thì thằng đó chạy ngon cơm, nếu đem file .exe qua LINUX thì chịu thua rồi đó bởi vì cơ chế của mỗi hệ điều hành là khác.

**Sự hình thành của Java**

- Muốn là điều đó thì phải sau 1995 gọi là ( PLATFORM INDEPENDENT ) ⇒ JAVA ra đời.

- Làm sao để làm được điều này ? JAVACODE khi viết mấy câu lệnh IF ELSE thì người chỉ hiểu được, máy không hiểu được ⇒ Phải đi qua giai đoạn Compile.

- Đọc lại Dot thứ 3 ( Trước khi Java ) ⇒ Đếch cần hỏi hệ điều hành nào, đẻ ra file .class

- Đem file .class đem qua WINDOW méo chạy, LINUX méo chạy. WHY ?

- Nó cần phải có 1 vùng đệm, vùng đêm này chơi với máy, giao tiếp trung gian với hệ điều hành

- Vùng giao tiếp gọi là JVM, là 1 máy ảo bắt đầu chơi với hệ điều hành ( WINDOW, LINUX đồ đó . Chỉ cần mỗi thằng hệ điều hành cài JVM vô xong lấy file .class thì chạy ở đâu cũng được ⇒ Nói chuyện trung gian thôi không cần nói chuyện trực tiếp với OS

- .exe nó chơi trực tiếp với hệ điều hành gọi là Machine Code, Native Code, Binary ⇒ . Java chơi với máy ảo không gắn với OS cụ thể gọi là Nautial, BYTE CODE ) . Cái bộ trung gian mà giao tiếp giữa . java và OS gọi là JDK ( Bộ đồ chơi phát triển JAVA, nó chứa cả JVM )

### HISTORY OF DOTNET

**Đuôi của thằng dotNet**

- . dll ( dynamic link library - thư viên liên kết tổng )

- . exe ( executetable )

**Nguồn gốc của dotNet**

- Ra đời năm 2001. Lúc đó Msoft đang thống trị hệ điều hành, thấy được ý tưởng của thằng JAVA rất hay, và nó không muốn LINUX tồn tại và muốn lụm thằng đó ⇒ Chế ra thằng dotNet Framework ( dotNet có nghĩa là bước vào thế giới của Internet )

- dotNet là cái gì ? Nó là 1 dàn khung hơi hơi giống JDK, là 1 tầng trung gian chơi với hệ điều hành và được chạy trên hệ điều hành Window. Mirrrroft nó cũng không nó không muốn chạy trên LINUX ngay nên họ đéo làm

- Chế ra dotNet thì cũng phải chế ra ngôn ngữ lập trình ⇒ Chế ra C#, C++ dotNet, VB.NET, F# ( Java nhưng bị độ lại ). Mấy thằng này thì vẫn là viết code thì chỉ có người hiểu và biên dịch ra cái compile xong ra cái trung gian rồi đưa OS chạy ( Gọi là ByteCode lun, MSIL, IL, CIL - Common Intermediate Language ) . Tụi nó gọi là Not Depend on specific Platform

- Cộng đồng nhà LINUX cảm thấy hơi ganh tị với dotNET ⇒ Cộng đồng mạng bắt đầu đục đẻo thằng dotNET xong đổi tên thành MOMO

- MOMO ngày càng lớn mạnh nên dần dần MSOFT phải chính thức hóa MOMO ⇒ dotNet Core ra đời ( mang tính chất dotNet framework nhưng đa nền )

- MSOFT nhận ra mình vừa phải duy trì dotNET CORE ( 5.0 Last Version ) và dotNET Framework ( 4.8 Last Version ) ⇒ Quyết định nhập 2 thằng này lại thành 1.

- dotNet r đời. Nền tảng chạy cho đa hệ điều hành - CROSS PLATFORM ( Version 6 7 ra đời nối tiếp )

### NHỮNG KIỂU DOWNLOAD

Ngày xưa : Dowload file vài trăm MB hoặc cả GB ( SETUP.exe ) xong next next . Cái đó là tải nguyên 1 cục về, gọi là Installer

Ngày nay : Tải phần mềm mồi ( Installer ), và sau đó download tiếp (  ≤20 mb ). Sau đó thì nó mới lên mạng dow thêm về

Cách khác: Portable cài sẵn trong 1 file mở ra xài luôn giống cái thằng ngày xưa nhưng không cần setup
