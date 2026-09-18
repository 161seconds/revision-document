import java.util.*;
import java.util.function.*;
import java.util.regex.*;

public class Practice {

    // Thử thách 1: Integer Cache Pool
    public static boolean[] challenge1_testIntegerCache() {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        return new boolean[]{ a == b, c == d, c.equals(d) };
    }

    // Thử thách 2: Generics PECS Copy
    public static <T> void challenge2_pecsCopy(List<? super T> dest, List<? extends T> src) {
        for (T item : src) {
            dest.add(item);
        }
    }

    // Thử thách 3: Biểu thức chính quy tách toàn bộ số nguyên trong chuỗi
    public static List<Integer> challenge3_extractNumbers(String input) {
        List<Integer> result = new ArrayList<>();
        Pattern pattern = Pattern.compile("\\d+");
        Matcher matcher = pattern.matcher(input);
        while (matcher.find()) {
            result.add(Integer.parseInt(matcher.group()));
        }
        return result;
    }

    // Thử thách 4: An toàn đa luồng với synchronized
    public static class ThreadSafeAccumulator {
        private int sum = 0;
        public synchronized void add(int val) { sum += val; }
        public synchronized int getSum() { return sum; }
    }

    public static int challenge4_runConcurrentTasks(int threadsCount, int loopsPerThread) throws InterruptedException {
        ThreadSafeAccumulator acc = new ThreadSafeAccumulator();
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < threadsCount; i++) {
            Thread t = new Thread(() -> {
                for (int j = 0; j < loopsPerThread; j++) {
                    acc.add(1);
                }
            });
            threads.add(t);
            t.start();
        }
        for (Thread t : threads) {
            t.join();
        }
        return acc.getSum();
    }

    // Thử thách 5: Pipeline lập trình hàm (Predicate + Function)
    public static List<String> challenge5_filterAndTransform(
            List<String> input, 
            Predicate<String> filter, 
            Function<String, String> mapper) {
        List<String> output = new ArrayList<>();
        for (String item : input) {
            if (filter.test(item)) {
                output.add(mapper.apply(item));
            }
        }
        return output;
    }

    public static void main(String[] args) throws Exception {
        System.out.println("Đang kiểm thử Module 05: Advanced Java & Concurrency...");

        // Kiểm thử 1: Integer Cache
        boolean[] cacheRes = challenge1_testIntegerCache();
        assert cacheRes[0] : "Thử thách 1 Thất bại: 127 == 127 phải là true!";
        assert !cacheRes[1] : "Thử thách 1 Thất bại: 128 == 128 phải là false!";
        assert cacheRes[2] : "Thử thách 1 Thất bại: 128.equals(128) phải là true!";
        System.out.println("✅ Thử thách 1: Integer Cache Pool [-128..127] - VƯỢT QUA");

        // Kiểm thử 2: PECS Generics
        List<Number> numDest = new ArrayList<>();
        List<Integer> intSrc = List.of(1, 2, 3);
        challenge2_pecsCopy(numDest, intSrc);
        assert numDest.size() == 3 && numDest.get(0).intValue() == 1 : "Thử thách 2 Thất bại với PECS copy!";
        System.out.println("✅ Thử thách 2: Nguyên tắc thiết kế Generics PECS - VƯỢT QUA");

        // Kiểm thử 3: RegEx trích xuất số
        List<Integer> nums = challenge3_extractNumbers("Code 404 in room 12 at floor 3");
        assert nums.equals(List.of(404, 12, 3)) : "Thử thách 3 Thất bại trích xuất số!";
        System.out.println("✅ Thử thách 3: Biểu thức chính quy Pattern & Matcher - VƯỢT QUA");

        // Kiểm thử 4: Concurrency Synchronization
        int totalSum = challenge4_runConcurrentTasks(10, 1000);
        assert totalSum == 10000 : "Thử thách 4 Thất bại! Tổng tính được: " + totalSum + ", mong đợi 10000";
        System.out.println("✅ Thử thách 4: Đồng bộ hóa Concurrency tránh Race Condition - VƯỢT QUA");

        // Kiểm thử 5: Lambdas & Functional Interfaces
        List<String> raw = List.of("apple", "banana", "avocado", "cherry");
        List<String> res = challenge5_filterAndTransform(
                raw,
                s -> s.startsWith("a"),
                String::toUpperCase
        );
        assert res.equals(List.of("APPLE", "AVOCADO")) : "Thử thách 5 Thất bại với pipeline Lambda!";
        System.out.println("✅ Thử thách 5: Biểu thức Lambda & Functional Interfaces - VƯỢT QUA");

        System.out.println("\n🎉 5/5 THỬ THÁCH MODULE 05 ĐÃ VƯỢT QUA 100%!");
    }
}
