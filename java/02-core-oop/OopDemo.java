package com.revision.oop;

public class OopDemo {

    // 1. Abstract Class
    public abstract static class Shape {
        protected String color;
        public Shape(String color) { this.color = color; }
        public abstract double area();
        public void display() {
            System.out.println("Hình màu: " + color + ", diện tích: " + area());
        }
    }

    // 2. Interface với default & static methods
    public interface Drawable {
        void draw();
        default void printInfo() {
            System.out.println("Mặc định có thể vẽ đối tượng lên màn hình.");
        }
        static void version() {
            System.out.println("Drawable Interface v2.0");
        }
    }

    // 3. Concrete Class kế thừa và hiện thực
    public static class Circle extends Shape implements Drawable {
        private final double radius;

        public Circle(String color, double radius) {
            super(color); // Constructor chaining lên cha
            this.radius = radius;
        }

        @Override
        public double area() {
            return Math.PI * radius * radius;
        }

        @Override
        public void draw() {
            System.out.println("Vẽ hình tròn bán kính " + radius);
        }
    }

    // 4. Enum nâng cao với Constructor & Field
    public enum Role {
        ADMIN(1, "Quản trị viên"),
        USER(2, "Người dùng chuẩn"),
        GUEST(3, "Khách vãng lai");

        private final int id;
        private final String title;

        Role(int id, String title) {
            this.id = id;
            this.title = title;
        }

        public int getId() { return id; }
        public String getTitle() { return title; }
    }

    public static void main(String[] args) {
        System.out.println("=== MODULE 02: DEMO CORE OOP ===");

        // Đa hình
        Shape s = new Circle("Đỏ", 5.0);
        s.display();

        Circle c = (Circle) s;
        c.draw();
        c.printInfo();
        Drawable.version();

        // Enum nâng cao
        Role r = Role.ADMIN;
        System.out.println("Role: " + r.name() + ", ID: " + r.getId() + ", Title: " + r.getTitle());

        // Anonymous Inner Class
        Drawable anon = new Drawable() {
            @Override
            public void draw() {
                System.out.println("Vẽ bởi Anonymous Inner Class tại runtime!");
            }
        };
        anon.draw();

        System.out.println("=== HOÀN THÀNH DEMO MODULE 02 ===");
    }
}
