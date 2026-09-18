using System;
using System.Text;

/**
 * .NET & C# MODULE 01: FUNDAMENTALS DEMO
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file FundamentalsDemo.cs
 */

public class FundamentalsDemo {
    public static void Main() {
        Console.WriteLine("=== 1. CTS TYPES & NULLABLE REFERENCE TYPES ===");
        int count = 100;
        int? nullableInt = null;
        string? message = null;

        string display = message ?? "Default Message";
        Console.WriteLine($"count: {count}, nullableInt: {nullableInt ?? -1}, display: {display}");

        Console.WriteLine("\n=== 2. PATTERN MATCHING SWITCH EXPRESSION ===");
        var points = new (int, int)[] { (0, 0), (5, 5), (-3, 4), (0, 7) };
        foreach (var pt in points) {
            string desc = pt switch {
                (0, 0) => "Center Origin",
                ( > 0, > 0) => "Quadrant 1 (Positive)",
                ( < 0, > 0) => "Quadrant 2",
                _ => "Other Coordinate"
            };
            Console.WriteLine($"Point {pt} => {desc}");
        }

        Console.WriteLine("\n=== 3. PARAMETER MODIFIERS (REF & OUT) ===");
        int x = 10, y = 20;
        Console.WriteLine($"Before Swap: x={x}, y={y}");
        Swap(ref x, ref y);
        Console.WriteLine($"After Swap:  x={x}, y={y}");

        if (TryExtractCode("ERR_404_NOT_FOUND", out int errorCode)) {
            Console.WriteLine($"Extracted Error Code: {errorCode}");
        }

        Console.WriteLine("\n=== 4. ZERO-ALLOCATION SPAN<T> SLICING ===");
        string dateString = "2026-09-18";
        ReadOnlySpan<char> dateSpan = dateString.AsSpan();
        ReadOnlySpan<char> yearSpan = dateSpan.Slice(0, 4);
        ReadOnlySpan<char> monthSpan = dateSpan.Slice(5, 2);
        ReadOnlySpan<char> daySpan = dateSpan.Slice(8, 2);

        Console.WriteLine($"Original string: {dateString}");
        Console.WriteLine($"Sliced Year: {yearSpan.ToString()}, Month: {monthSpan.ToString()}, Day: {daySpan.ToString()}");

        Console.WriteLine("\n>>> MODULE 01 DEMO FINISHED SUCCESSFULLY <<<");
    }

    private static void Swap(ref int a, ref int b) {
        int temp = a;
        a = b;
        b = temp;
    }

    private static bool TryExtractCode(string errorKey, out int code) {
        ReadOnlySpan<char> span = errorKey.AsSpan();
        if (span.StartsWith("ERR_")) {
            ReadOnlySpan<char> numPart = span.Slice(4, 3);
            return int.TryParse(numPart, out code);
        }
        code = 0;
        return false;
    }
}
