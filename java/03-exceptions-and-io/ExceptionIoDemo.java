package com.revision.exceptions;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;

public class ExceptionIoDemo {

    // 1. Custom Exception
    public static class BankException extends Exception {
        private final int errorCode;
        public BankException(String message, int errorCode) {
            super(message);
            this.errorCode = errorCode;
        }
        public int getErrorCode() { return errorCode; }
    }

    // 2. Custom AutoCloseable Resource
    public static class DatabaseConnection implements AutoCloseable {
        public void query() {
            System.out.println("Đang thực thi truy vấn cơ sở dữ liệu...");
        }

        @Override
        public void close() {
            System.out.println("Đóng kết nối CSDL an toàn tự động qua AutoCloseable!");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== MODULE 03: DEMO EXCEPTIONS & FILE I/O ===");

        // 1. Demo try-with-resources
        try (DatabaseConnection db = new DatabaseConnection()) {
            db.query();
        }

        // 2. Demo Custom Exception
        try {
            validateTransaction(-50);
        } catch (BankException e) {
            System.out.println("Bắt Custom Exception: " + e.getMessage() + " (Mã lỗi: " + e.getErrorCode() + ")");
        }

        // 3. Demo File I/O: Ghi và Đọc với BufferedReader & BufferedWriter
        File tempFile = new File("temp_demo.txt");
        try {
            // Ghi file
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(tempFile))) {
                writer.write("Dòng 1: Java Core Revision");
                writer.newLine();
                writer.write("Dòng 2: I/O Streams Demo");
            }

            // Đọc file
            try (BufferedReader reader = new BufferedReader(new FileReader(tempFile))) {
                String line;
                System.out.println("Nội dung file đọc được:");
                while ((line = reader.readLine()) != null) {
                    System.out.println("  -> " + line);
                }
            }
        } catch (IOException e) {
            System.err.println("Lỗi I/O: " + e.getMessage());
        } finally {
            if (tempFile.exists()) {
                tempFile.delete(); // Dọn dẹp
            }
        }

        System.out.println("=== HOÀN THÀNH DEMO MODULE 03 ===");
    }

    private static void validateTransaction(double amount) throws BankException {
        if (amount <= 0) {
            throw new BankException("Số tiền giao dịch không hợp lệ", 4001);
        }
    }
}
