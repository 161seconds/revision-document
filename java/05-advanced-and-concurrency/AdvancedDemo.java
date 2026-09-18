package com.revision.advanced;

import java.lang.annotation.*;
import java.lang.reflect.Method;
import java.util.*;
import java.util.function.*;

public class AdvancedDemo {

    // 1. Custom Annotation
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    public @interface ExecutionTrack {
        String description() default "Tracked";
    }

    // 2. Generic Box
    public static class Box<T> {
        private T value;
        public Box(T value) { this.value = value; }
        public T getValue() { return value; }
    }

    // 3. Thread-safe Counter
    public static class SafeCounter {
        private int count = 0;
        public synchronized void increment() { count++; }
        public synchronized int getCount() { return count; }
    }

    @ExecutionTrack(description = "Chạy thử nghiệm phương thức có Annotation")
    public static void sampleAnnotatedMethod() {
        System.out.println("Thực thi phương thức có gắn Annotation.");
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== MODULE 05: DEMO ADVANCED JAVA & CONCURRENCY ===");

        // 1. Integer Cache
        Integer i1 = 127, i2 = 127;
        Integer i3 = 128, i4 = 128;
        System.out.println("1. Integer Cache [-128..127]: 127==127 is " + (i1 == i2) + ", 128==128 is " + (i3 == i4));

        // 2. Generics
        Box<String> stringBox = new Box<>("Java 21");
        System.out.println("2. Generic Box value: " + stringBox.getValue());

        // 3. Reflection đọc Annotation
        Method method = AdvancedDemo.class.getMethod("sampleAnnotatedMethod");
        if (method.isAnnotationPresent(ExecutionTrack.class)) {
            ExecutionTrack track = method.getAnnotation(ExecutionTrack.class);
            System.out.println("3. Đọc Annotation qua Reflection: " + track.description());
        }

        // 4. Multithreading & Synchronization
        SafeCounter counter = new SafeCounter();
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 500; i++) counter.increment();
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 500; i++) counter.increment();
        });
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("4. Multithreading Counter (Mong đợi 1000): " + counter.getCount());

        // 5. Lambdas & Comparator
        List<String> fruits = new ArrayList<>(List.of("banana", "fig", "apple", "date"));
        fruits.sort(Comparator.comparingInt(String::length).thenComparing(String::compareTo));
        System.out.println("5. Sắp xếp theo độ dài rồi theo bảng chữ cái: " + fruits);

        System.out.println("=== HOÀN THÀNH DEMO MODULE 05 ===");
    }
}
