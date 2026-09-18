import java.time.LocalDate;
import java.time.Month;
import java.util.Arrays;

public class Practice {

    // Thử thách 1: Tính toán tràn số byte (Narrowing cast)
    public static byte challenge1_byteOverflow(int val) {
        return (byte) val;
    }

    // Thử thách 2: Kiểm tra String Pool & intern
    public static boolean[] challenge2_stringPoolTest() {
        String a = "Revision";
        String b = new String("Revision");
        String c = b.intern();
        return new boolean[]{ a == b, a == c, a.equals(b) };
    }

    // Thử thách 3: Switch expression phân loại quý trong năm
    public static String challenge3_getQuarter(int month) {
        return switch (month) {
            case 1, 2, 3 -> "Q1";
            case 4, 5, 6 -> "Q2";
            case 7, 8, 9 -> "Q3";
            case 10, 11, 12 -> "Q4";
            default -> "INVALID";
        };
    }

    // Thử thách 4: Đảo ngược mảng số nguyên tại chỗ (In-place reverse)
    public static int[] challenge4_reverseArray(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
        return arr;
    }

    // Thử thách 5: Đệ quy tính số Fibonacci thứ n (F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2))
    public static long challenge5_fibonacci(int n) {
        if (n <= 0) return 0;
        if (n == 1) return 1;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }

    public static void main(String[] args) {
        System.out.println("Đang kiểm thử Module 01: Basics & Syntax...");

        // Kiểm thử 1: Ép kiểu tràn số
        assert challenge1_byteOverflow(130) == -126 : "Thử thách 1 Thất bại! 130 ép kiểu byte phải là -126";
        assert challenge1_byteOverflow(256) == 0 : "Thử thách 1 Thất bại! 256 ép kiểu byte phải là 0";
        System.out.println("✅ Thử thách 1: Ép kiểu & Tràn số nguyên - VƯỢT QUA");

        // Kiểm thử 2: String Pool & Intern
        boolean[] spResults = challenge2_stringPoolTest();
        assert !spResults[0] : "Thử thách 2 Thất bại! 'new String' không được trỏ chung SCP";
        assert spResults[1] : "Thử thách 2 Thất bại! intern() phải trả về tham chiếu từ SCP";
        assert spResults[2] : "Thử thách 2 Thất bại! Hai chuỗi cùng nội dung phải equals()";
        System.out.println("✅ Thử thách 2: Bản chất String Constant Pool - VƯỢT QUA");

        // Kiểm thử 3: Switch Expression
        assert "Q1".equals(challenge3_getQuarter(2)) : "Thử thách 3 Thất bại! Tháng 2 phải thuộc Q1";
        assert "Q3".equals(challenge3_getQuarter(8)) : "Thử thách 3 Thất bại! Tháng 8 phải thuộc Q3";
        assert "INVALID".equals(challenge3_getQuarter(13)) : "Thử thách 3 Thất bại! Tháng 13 phải INVALID";
        System.out.println("✅ Thử thách 3: Cấu trúc Switch Expression - VƯỢT QUA");

        // Kiểm thử 4: Đảo ngược mảng
        int[] original = {1, 2, 3, 4, 5};
        int[] reversed = challenge4_reverseArray(original);
        assert Arrays.equals(reversed, new int[]{5, 4, 3, 2, 1}) : "Thử thách 4 Thất bại!";
        System.out.println("✅ Thử thách 4: Thao tác Mảng In-place - VƯỢT QUA");

        // Kiểm thử 5: Fibonacci
        assert challenge5_fibonacci(10) == 55 : "Thử thách 5 Thất bại! F(10) phải là 55";
        assert challenge5_fibonacci(20) == 6765 : "Thử thách 5 Thất bại! F(20) phải là 6765";
        System.out.println("✅ Thử thách 5: Thuật toán & Hàm đệ quy - VƯỢT QUA");

        System.out.println("\n🎉 5/5 THỬ THÁCH MODULE 01 ĐÃ VƯỢT QUA 100%!");
    }
}
