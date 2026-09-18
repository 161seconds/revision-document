package com.revision.collections;

import java.util.*;

public class CollectionsDemo {

    public static void main(String[] args) {
        System.out.println("=== MODULE 04: DEMO COLLECTIONS FRAMEWORK & ALGORITHMS ===");

        // 1. List Demo: ArrayList vs LinkedList
        List<String> arrayList = new ArrayList<>(List.of("Java", "Kotlin", "Scala"));
        List<String> linkedList = new LinkedList<>(arrayList);
        System.out.println("1. List items: " + arrayList + " | LinkedList size: " + linkedList.size());

        // 2. Set Demo: HashSet (ngẫu nhiên) vs LinkedHashSet (thứ tự chèn) vs TreeSet (sắp xếp)
        Set<Integer> hashSet = new HashSet<>(List.of(50, 10, 30, 20, 40));
        Set<Integer> linkedHashSet = new LinkedHashSet<>(List.of(50, 10, 30, 20, 40));
        Set<Integer> treeSet = new TreeSet<>(List.of(50, 10, 30, 20, 40));
        System.out.println("2. HashSet: " + hashSet);
        System.out.println("   LinkedHashSet (Bảo toàn chèn): " + linkedHashSet);
        System.out.println("   TreeSet (Sắp xếp tăng dần): " + treeSet);

        // 3. Map Demo: HashMap vs TreeMap
        Map<String, Integer> hashMap = new HashMap<>();
        hashMap.put("Banana", 3);
        hashMap.put("Apple", 5);
        hashMap.put("Orange", 2);

        Map<String, Integer> treeMap = new TreeMap<>(hashMap);
        System.out.println("3. HashMap: " + hashMap);
        System.out.println("   TreeMap (Sắp xếp theo key A-Z): " + treeMap);

        // 4. Safe Iterator Removal
        List<String> tech = new ArrayList<>(List.of("Spring", "Quarkus", "Micronaut", "EJB"));
        tech.removeIf(item -> item.equals("EJB"));
        System.out.println("4. Sau khi lọc removeIf (bỏ EJB): " + tech);

        // 5. Collections Utility Algorithms
        List<Integer> numbers = new ArrayList<>(List.of(9, 2, 7, 4, 5, 1));
        Collections.sort(numbers);
        System.out.println("5. Sắp xếp Collections.sort(): " + numbers);
        int index = Collections.binarySearch(numbers, 5);
        System.out.println("   Tìm kiếm nhị phân số 5 tại index: " + index);
        Collections.reverse(numbers);
        System.out.println("   Đảo ngược Collections.reverse(): " + numbers);

        System.out.println("=== HOÀN THÀNH DEMO MODULE 04 ===");
    }
}
