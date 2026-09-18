package com.revision.basics;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;

public class BasicsDemo {

    static class Person {
        String name;
        Person(String name) { this.name = name; }
    }

    public static void main(String[] args) {
        System.out.println("=== MODULE 01: DEMO JAVA BASICS & SYNTAX ===");

        // 1. Primitive & Type Casting
        int maxInt = Integer.MAX_VALUE;
        long wider = maxInt; // Widening (tự động)
        int backToInt = (int) wider; // Narrowing (tường minh)
        System.out.println("1. Type Casting: maxInt=" + maxInt + ", back=" + backToInt);

        // 2. String Pool & Immutability
        String s1 = "Java";
        String s2 = "Java";
        String s3 = new String("Java");
        System.out.println("2. String Pool: s1 == s2 is " + (s1 == s2) + ", s1 == s3 is " + (s1 == s3));
        System.out.println("   String Content: s1.equals(s3) is " + s1.equals(s3));

        // 3. Switch Expression (Java 14+)
        int day = 3;
        String dayType = switch (day) {
            case 1, 7 -> "Cuối tuần";
            case 2, 3, 4, 5, 6 -> "Ngày trong tuần";
            default -> "Không hợp lệ";
        };
        System.out.println("3. Switch Expression: Day 3 là " + dayType);

        // 4. Ragged Arrays (Mảng răng cưa)
        int[][] jagged = new int[2][];
        jagged[0] = new int[]{1, 2};
        jagged[1] = new int[]{3, 4, 5, 6};
        System.out.println("4. Jagged Array Row 1 len: " + jagged[0].length + ", Row 2 len: " + jagged[1].length);

        // 5. Pass-by-value test
        Person p = new Person("Original");
        int num = 100;
        testPassByValue(p, num);
        System.out.println("5. Pass-by-value: p.name=" + p.name + " (bị đổi), num=" + num + " (không đổi)");

        // 6. java.time Modern API
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        System.out.println("6. java.time: Ngày hiện tại định dạng: " + today.format(fmt));

        System.out.println("=== DEMO HOÀN THÀNH THÀNH CÔNG ===");
    }

    private static void testPassByValue(Person p, int x) {
        x = 999;
        p.name = "ModifiedInsideMethod";
        p = new Person("Reassigned"); // Không đổi đối tượng ngoài main
    }
}
