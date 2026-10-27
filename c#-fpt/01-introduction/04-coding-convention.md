# CODING CONVENTION

> Tác giả: Ben Trần · Nhóm: Introduction
> Nguồn: [CODING CONVENTION](https://bentran1vn.notion.site/CODING-CONVENTION-1260a458baa64d4e843fed277a67fdc4) · Bản lưu: 27/10/2026

[Mục lục](../README.md)

## Mục lục :

- ÔN LẠI dotNET, dotNET FRAMEWORK, dotNET CORE

- TA PHÂN BIỆT VỚI PROJECT VỚI SOLUTION

- CODING CONVENTION - QUY TẮC ĐẶT TÊN CHUẨN TRONG DỰ ÁN

- KIỂU DỮ LIỆU - DATATYPE ( GIỐNG VÀ KHÁC JAVA )
    - Phân loại theo cách HÀNG GỐC và HÀNG ĐỘ ( Pre-defined, User-defined )
    
    - Phân loại theo cách lưu trữ trong RAM

- CÁCH KIỂU IN RA MÀN HÌNH TRONG C#

- KIỂU DỮ LIỆU TRONG C#

- FUNCTION TRONG C#

- ĐIỂM KHÁC BIỆT CỦA C#
    - ref
    
    - out và Tà Thuật của nó

## **I. ÔN LẠI dotNET, dotNET FRAMEWORK, dotNET CORE**

- Cross Platform - đa nền, app chạy chạy không phụ thuộc OS - WRITE ONCE RUN ANYWHERE

- dotNET là nền tảng môi trường, bộ thư viện cung cấp toàn bộ tài nguyên cho việc chạy app .NET, C#, VB.NET, C++dotNET

- Code thì được dịch ra 1 ngôn ngữ trung gian - IL Intermediate Language ( Bytecode, nó giống như Java )

- Để chơi với .NET thì ta cần dotNET DSK ở C:\\ProgramFiles\\dotnet ( mặc định )

- Khi cài VS thì có sẵn SDK được cài

## II. TA PHÂN BIỆT VỚI PROJECT VỚI SOLUTION

- 1 Solution thì có nhiều Project

## III. CODING CONVENTION - QUY TẮC ĐẶT TÊN CHUẨN TRONG DỰ ÁN

1. **Tên Solution: Pascal Case - Chữ hoa từng đầu từ là danh từ**
    - TênCôngTy ( Hoặc TênThươngHiệu ).TênSolution
        Ví dụ:
        
        - .Microsoft
        
        - .Oracle

2. **Tên Project:** **Pascal Case** **– Chữ hoa từng đầu từ, danh từ, chứa tên Solution**
    - TênCôngTy(Hoặc TênThươngHiệu ).TênSolution.TênProject1
    
    - TênCôngTy(Hoặc TênThươngHiệu ).TênSolution.TênProject2
    
    - TênCôngTy(Hoặc TênThươngHiệu ).TênSolution.TênProject3
        Ví dụ:
        
        - Giaolang.Fap.Student
        
        - Giaolang.Fap.Lecture
        
        - Giaolang.Swp291.Authen
        
        ⇒ Mỗi Project trong dự án FAP sẽ bao gồm các class có liên quan đến từng nhóm chức năng

3. **NAMESPACE: ( Không gian tên, Package, tên gọi chung các class vào 1 cụm Logic nào đó - tương đương với package trong JAVA )**
    …Còn tính tiếp

4. **Tên Class:** **Pascal Case****, chữ hoa từng đầu từ, danh từ, thuộc về namespace**

- DÙNG DANH TỪ SỐ ÍT

5. **Tên Hàm ( Method ): VERB + OBJECT**
    - PASCAL CASE: Chữ hoa ở đầu từng đầu từ, có đồng từ đừng đầu
        - Ví dụ : Print( ), ToString( ), Parse( ), Compare( ), Equals( ) ( Giống và khác JAVA )

6. **Tên biến lưu đặc điểm của OBJECT, INSTANCE VARIABLE, DATA FIELD**
    - Danh từ, camel Case, \_ đứng đầu từ ( NẾU LÀ PRIVATE )
        - Ví dụ:
            - private string \_id 
            private string  \_private
    
    - Danh từ, Pascal Case ( NẾU BIẾN LÀ PUBLIC )
        - Ví dụ:
            - public string Id
            
            - public string Name

7. **Tên Biến Cục Bộ ( Local Variable ), Biến khai báo trong HÀM, trên THAM SỐ HÀM:**
    - NOUN + camelCase
        - Ví dụ : float pi, int yob, string homePhone, string cellPhone

8. Tên hằng số - BiẾN MÀ KHÔNG CHO PHÉP THAY ĐỔI VALUE, PHẢI GÁN VALUE NGAY KHI KHAI BÁO
    NẾU BẠN KHAI BÁO HẰNG SỐ Ở MỨC CLASS ( DƯỚI TÊN CLASS LÀ HẰNG SỐ - KHÔNG NẰM TRONG HÀM )
    
    ⇒ THÌ MẶT NHIÊN C# COI NÓ LÀ STATIC, KHÔNG CẦN DÙNG TỪ KHÓA STATIC
    
    - VÌ MÀY LÀ BIẾN THUỘC CLASS, CHO NÊN QUY TẮC ĐĂT TÊN DÙNG PASCAL CASE NHƯ BÌNH THƯỜNG

VÍ DỤ:

- public static const double Pi = 3.14 tương đương

- public static const double Pi   = 3.14

VỚI JAVA TÊN HẰNG SỐ LÀ CHỮ HOA TOÀN TẬP, VÀ CÓ SHIFT GẠCH PHÂN CÁCH CÁC TỪ !!! KHÁC NHAU

10. Tên Delegate: Danh từ mang ý nghĩa đại diện cho cái xử lí của các hàm mà nó sẽ trỏ đến
    - Vì Delegate Thường dính dáng dến xử lí các event trong lập trình hướng sự kiện
    Vì dụ các nút nhấn trên màn hình - GUI APP
    Nên Delegate thường có suffix - Hậu Tố - ĐUôi là : Handler
    
    - Vì nó cũng hay dính đến CallBack - Hậu tố - Đuôi: Callback
    
    - Nếu chung chung, thì nó có hậu tố : Delegate - em đại diện cho 1 nhóm hàm
    
    BIẾN THUỘC VỀ DELEGATE, vì nó đại diện cho hàm, và nó dùng để gọi hàm nên hay dùng Verb + Object, Verb Phase

11. TÊN CHO CÁC THÀNH PHẦN - COMPONENT ( NÚT NHẤN , CHECKBOX, Ô HỘI THOẠI - DIALOG … ) TRÊN WINDOWS FORMS

- Button (nút nhấn) → btn. Ví dụ: btnSearch, btnExit,

- TextBox (ô nhập) → txt. Ví dụ: txtUser, txtPassword

- DataGridView (lưới/table) → grd???

- RadioButton (nút vặn) → rad???

- CheckBox (tích chọn) → chk???

- ComboBox (hộp xổ) → cmb???

- Form (màn hình, cửa sổ, class) → frm??? Mục đích của Form, frmAddStudent
    - Ví dụ: AddStudentForm
