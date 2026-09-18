import java.io.*;
import java.nio.charset.StandardCharsets;

public class Practice {

    // Thử thách 1: Phân loại ngoại lệ
    public static String challenge1_classifyException(Exception e) {
        if (e instanceof RuntimeException) {
            return "UNCHECKED";
        }
        return "CHECKED";
    }

    // Thử thách 2: Custom Exception chứa mã lỗi nghiệp vụ
    public static class ValidationException extends RuntimeException {
        private final int errorCode;
        public ValidationException(String msg, int code) {
            super(msg);
            this.errorCode = code;
        }
        public int getErrorCode() { return errorCode; }
    }

    public static void challenge2_validateAge(int age) {
        if (age < 0 || age > 150) {
            throw new ValidationException("Tuổi không hợp lệ", 1001);
        }
    }

    // Thử thách 3: try-with-resources & AutoCloseable verification
    public static class MockResource implements AutoCloseable {
        private boolean closed = false;
        public void doWork() {}
        public boolean isClosed() { return closed; }

        @Override
        public void close() {
            this.closed = true;
        }
    }

    public static boolean challenge3_testAutoClose() {
        MockResource res;
        try (MockResource r = new MockResource()) {
            res = r;
            r.doWork();
        }
        return res.isClosed();
    }

    // Thử thách 4: Ghi và đọc đếm số dòng
    public static int challenge4_writeAndCountLines(String[] lines) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            for (String line : lines) {
                writer.write(line);
                writer.newLine();
            }
        }

        // Đọc lại từ byte array stream
        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(bais, StandardCharsets.UTF_8))) {
            while (reader.readLine() != null) {
                count++;
            }
        }
        return count;
    }

    // Thử thách 5: Xử lý Multi-catch
    public static String challenge5_multiCatchTest(String input) {
        try {
            if (input == null) throw new NullPointerException("Null input");
            int val = Integer.parseInt(input);
            return "SUCCESS:" + val;
        } catch (NumberFormatException | NullPointerException e) {
            return "HANDLED:" + e.getClass().getSimpleName();
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("Đang kiểm thử Module 03: Exceptions & I/O...");

        // Kiểm thử 1: Phân loại ngoại lệ
        assert "UNCHECKED".equals(challenge1_classifyException(new NullPointerException())) : "Thử thách 1 Thất bại với NPE!";
        assert "CHECKED".equals(challenge1_classifyException(new IOException())) : "Thử thách 1 Thất bại với IOException!";
        System.out.println("✅ Thử thách 1: Phân loại Checked vs Unchecked Exceptions - VƯỢT QUA");

        // Kiểm thử 2: Custom Exception
        try {
            challenge2_validateAge(200);
            assert false : "Thử thách 2 Thất bại! Phải ném ngoại lệ với age=200";
        } catch (ValidationException e) {
            assert e.getErrorCode() == 1001 : "Thử thách 2 Thất bại sai errorCode!";
        }
        System.out.println("✅ Thử thách 2: Thiết kế & Xử lý Custom Exception - VƯỢT QUA");

        // Kiểm thử 3: try-with-resources AutoCloseable
        assert challenge3_testAutoClose() : "Thử thách 3 Thất bại! Tài nguyên chưa được close tự động";
        System.out.println("✅ Thử thách 3: Cơ chế tự động đóng tài nguyên try-with-resources - VƯỢT QUA");

        // Kiểm thử 4: Ghi & Đọc đếm số dòng
        String[] testLines = {"Header", "Body Line 1", "Body Line 2", "Footer"};
        int linesCount = challenge4_writeAndCountLines(testLines);
        assert linesCount == 4 : "Thử thách 4 Thất bại! Số dòng phải là 4, thực tế: " + linesCount;
        System.out.println("✅ Thử thách 4: Character Streams & BufferedReader/Writer - VƯỢT QUA");

        // Kiểm thử 5: Multi-catch
        assert "HANDLED:NullPointerException".equals(challenge5_multiCatchTest(null)) : "Thử thách 5 Thất bại với null!";
        assert "HANDLED:NumberFormatException".equals(challenge5_multiCatchTest("abc")) : "Thử thách 5 Thất bại với abc!";
        assert "SUCCESS:42".equals(challenge5_multiCatchTest("42")) : "Thử thách 5 Thất bại với 42!";
        System.out.println("✅ Thử thách 5: Cú pháp Multi-catch xử lý ngoại lệ đồng cấp - VƯỢT QUA");

        System.out.println("\n🎉 5/5 THỬ THÁCH MODULE 03 ĐÃ VƯỢT QUA 100%!");
    }
}
