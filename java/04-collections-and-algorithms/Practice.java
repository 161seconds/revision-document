import java.util.*;

public class Practice {

    // Thử thách 1: Khử trùng lặp và sắp xếp danh sách
    public static List<Integer> challenge1_deduplicateAndSort(List<Integer> list) {
        Set<Integer> set = new TreeSet<>(list);
        return new ArrayList<>(set);
    }

    // Thử thách 2: Hợp đồng equals và hashCode
    public static class Student {
        private final int id;
        private final String name;

        public Student(int id, String name) {
            this.id = id;
            this.name = name;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Student student = (Student) o;
            return id == student.id && Objects.equals(name, student.name);
        }

        @Override
        public int hashCode() {
            return Objects.hash(id, name);
        }
    }

    public static int challenge2_testSetSize(Student s1, Student s2) {
        Set<Student> set = new HashSet<>();
        set.add(s1);
        set.add(s2);
        return set.size();
    }

    // Thử thách 3: Đếm tần suất từ (Word Frequency)
    public static Map<String, Integer> challenge3_wordFrequency(String text) {
        Map<String, Integer> freq = new HashMap<>();
        String[] words = text.toLowerCase().split("\\s+");
        for (String w : words) {
            if (!w.isEmpty()) {
                freq.put(w, freq.getOrDefault(w, 0) + 1);
            }
        }
        return freq;
    }

    // Thử thách 4: Sắp xếp Map theo Key tăng dần và lấy danh sách key
    public static List<String> challenge4_sortedKeys(Map<String, Integer> map) {
        TreeMap<String, Integer> sortedMap = new TreeMap<>(map);
        return new ArrayList<>(sortedMap.keySet());
    }

    // Thử thách 5: Xóa các số chẵn an toàn bằng Iterator
    public static List<Integer> challenge5_removeEvenNumbers(List<Integer> list) {
        Iterator<Integer> it = list.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) {
                it.remove();
            }
        }
        return list;
    }

    public static void main(String[] args) {
        System.out.println("Đang kiểm thử Module 04: Collections Framework & Algorithms...");

        // Kiểm thử 1: Khử trùng lặp & sắp xếp qua TreeSet
        List<Integer> raw = List.of(9, 3, 5, 3, 9, 1, 5);
        List<Integer> processed = challenge1_deduplicateAndSort(raw);
        assert processed.equals(List.of(1, 3, 5, 9)) : "Thử thách 1 Thất bại! Kết quả: " + processed;
        System.out.println("✅ Thử thách 1: Khử trùng lặp & Sắp xếp tự động qua TreeSet - VƯỢT QUA");

        // Kiểm thử 2: equals & hashCode contract
        Student st1 = new Student(101, "Nguyen Van A");
        Student st2 = new Student(101, "Nguyen Van A");
        int setSize = challenge2_testSetSize(st1, st2);
        assert setSize == 1 : "Thử thách 2 Thất bại! Cùng id và name phải được coi là 1 phần tử duy nhất trong HashSet";
        System.out.println("✅ Thử thách 2: Hợp đồng bất biến giữa equals() và hashCode() - VƯỢT QUA");

        // Kiểm thử 3: Đếm tần suất từ
        Map<String, Integer> freq = challenge3_wordFrequency("Java is cool and Java is fast");
        assert freq.get("java") == 2 : "Thử thách 3 Thất bại đếm từ 'java'";
        assert freq.get("is") == 2 : "Thử thách 3 Thất bại đếm từ 'is'";
        assert freq.get("fast") == 1 : "Thử thách 3 Thất bại đếm từ 'fast'";
        System.out.println("✅ Thử thách 3: Đếm tần suất từ bằng HashMap - VƯỢT QUA");

        // Kiểm thử 4: TreeMap Key Sorting
        Map<String, Integer> unsorted = Map.of("Banana", 10, "Apple", 20, "Cherry", 30);
        List<String> sortedKeys = challenge4_sortedKeys(unsorted);
        assert sortedKeys.equals(List.of("Apple", "Banana", "Cherry")) : "Thử thách 4 Thất bại sắp xếp key!";
        System.out.println("✅ Thử thách 4: Sắp xếp Key tự động với TreeMap O(log N) - VƯỢT QUA");

        // Kiểm thử 5: Xóa số chẵn an toàn bằng Iterator
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8));
        List<Integer> odds = challenge5_removeEvenNumbers(nums);
        assert odds.equals(List.of(1, 3, 5, 7)) : "Thử thách 5 Thất bại xóa số chẵn!";
        System.out.println("✅ Thử thách 5: Xóa an toàn phần tử bằng Iterator tránh ConcurrentModificationException - VƯỢT QUA");

        System.out.println("\n🎉 5/5 THỬ THÁCH MODULE 04 ĐÃ VƯỢT QUA 100%!");
    }
}
