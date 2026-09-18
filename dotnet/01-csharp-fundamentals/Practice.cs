using System;
using System.Diagnostics;

/**
 * MODULE 01: C# FUNDAMENTALS - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file Practice.cs
 */

public class Practice {
    /* ========================================================================= */
    /* CHALLENGE 1: NULLABLE COALESCING & VALUE ASSIGNMENT                       */
    /* ========================================================================= */
    public static string ResolveConfig(string? primary, string? fallback, string defaultVal) {
        return primary ?? fallback ?? defaultVal;
    }

    public static void TestChallenge1() {
        Console.Write("[Test 1] Nullable Coalescing Resolution... ");

        Debug.Assert(ResolveConfig("Custom", "Fallback", "Default") == "Custom");
        Debug.Assert(ResolveConfig(null, "Fallback", "Default") == "Fallback");
        Debug.Assert(ResolveConfig(null, null, "Default") == "Default");

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 2: PATTERN MATCHING TOLL CALCULATOR                             */
    /* ========================================================================= */
    public record Car(int Passengers);
    public record Truck(int WeightKg);
    public record Motorcycle(bool HasSidecar);

    public static decimal CalculateToll(object vehicle) => vehicle switch {
        Car { Passengers: > 3 } => 5.00m,
        Car => 10.00m,
        Truck { WeightKg: > 5000 } => 25.00m,
        Truck => 15.00m,
        Motorcycle { HasSidecar: true } => 4.00m,
        Motorcycle => 3.00m,
        _ => throw new ArgumentException("Unknown vehicle type")
    };

    public static void TestChallenge2() {
        Console.Write("[Test 2] Pattern Matching Toll Calculator... ");

        Debug.Assert(CalculateToll(new Car(Passengers: 4)) == 5.00m);
        Debug.Assert(CalculateToll(new Car(Passengers: 1)) == 10.00m);
        Debug.Assert(CalculateToll(new Truck(WeightKg: 8000)) == 25.00m);
        Debug.Assert(CalculateToll(new Truck(WeightKg: 3000)) == 15.00m);
        Debug.Assert(CalculateToll(new Motorcycle(HasSidecar: false)) == 3.00m);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 3: REF, OUT, AND IN MODIFIERS                                   */
    /* ========================================================================= */
    public readonly struct FeePolicy {
        public decimal Percentage { get; init; }
        public decimal FlatFee { get; init; }
    }

    public static bool TryProcessWithdrawal(ref decimal balance, decimal amount, in FeePolicy policy, out decimal totalDeducted) {
        decimal fee = (amount * policy.Percentage) + policy.FlatFee;
        totalDeducted = amount + fee;

        if (balance >= totalDeducted) {
            balance -= totalDeducted;
            return true;
        }
        return false;
    }

    public static void TestChallenge3() {
        Console.Write("[Test 3] Ref, Out and In Modifiers... ");

        decimal balance = 1000m;
        var policy = new FeePolicy { Percentage = 0.02m, FlatFee = 5m };

        bool success = TryProcessWithdrawal(ref balance, 100m, in policy, out decimal deducted);
        Debug.Assert(success == true);
        Debug.Assert(deducted == 107m); // 100 + (100*0.02 + 5) = 107
        Debug.Assert(balance == 893m);  // 1000 - 107 = 893

        bool failed = TryProcessWithdrawal(ref balance, 2000m, in policy, out decimal failedDeducted);
        Debug.Assert(failed == false);
        Debug.Assert(balance == 893m); // Unchanged

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 4: ZERO-ALLOCATION SPAN IP PARSER                               */
    /* ========================================================================= */
    public static bool TryParseIpAddress(string ipStr, out byte b1, out byte b2, out byte b3, out byte b4) {
        b1 = b2 = b3 = b4 = 0;
        ReadOnlySpan<char> span = ipStr.AsSpan();

        int dot1 = span.IndexOf('.');
        if (dot1 == -1) return false;
        if (!byte.TryParse(span.Slice(0, dot1), out b1)) return false;

        ReadOnlySpan<char> rem1 = span.Slice(dot1 + 1);
        int dot2 = rem1.IndexOf('.');
        if (dot2 == -1) return false;
        if (!byte.TryParse(rem1.Slice(0, dot2), out b2)) return false;

        ReadOnlySpan<char> rem2 = rem1.Slice(dot2 + 1);
        int dot3 = rem2.IndexOf('.');
        if (dot3 == -1) return false;
        if (!byte.TryParse(rem2.Slice(0, dot3), out b3)) return false;

        ReadOnlySpan<char> rem3 = rem2.Slice(dot3 + 1);
        if (!byte.TryParse(rem3, out b4)) return false;

        return true;
    }

    public static void TestChallenge4() {
        Console.Write("[Test 4] Span-based Zero Allocation IP Parser... ");

        bool valid = TryParseIpAddress("192.168.1.100", out byte o1, out byte o2, out byte o3, out byte o4);
        Debug.Assert(valid == true);
        Debug.Assert(o1 == 192 && o2 == 168 && o3 == 1 && o4 == 100);

        bool invalid = TryParseIpAddress("256.1.1.1", out _, out _, out _, out _);
        Debug.Assert(invalid == false);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 5: JAGGED ARRAY ROW SUMS                                        */
    /* ========================================================================= */
    public static int[] CalculateRowSums(int[][] matrix) {
        int[] sums = new int[matrix.Length];
        for (int i = 0; i < matrix.Length; i++) {
            int rowSum = 0;
            for (int j = 0; j < matrix[i].Length; j++) {
                rowSum += matrix[i][j];
            }
            sums[i] = rowSum;
        }
        return sums;
    }

    public static void TestChallenge5() {
        Console.Write("[Test 5] Jagged Array Row Sums... ");

        int[][] jagged = new int[][] {
            new int[] { 1, 2, 3 },
            new int[] { 10, 20 },
            new int[] { 100 }
        };

        int[] sums = CalculateRowSums(jagged);
        Debug.Assert(sums.Length == 3);
        Debug.Assert(sums[0] == 6);
        Debug.Assert(sums[1] == 30);
        Debug.Assert(sums[2] == 100);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* MAIN RUNNER                                                               */
    /* ========================================================================= */
    public static void Main() {
        Console.WriteLine("=== RUNNING .NET C# MODULE 01 TESTS ===\n");

        TestChallenge1();
        TestChallenge2();
        TestChallenge3();
        TestChallenge4();
        TestChallenge5();

        Console.WriteLine("\n>>> ALL 5 MODULE 01 TESTS PASSED SUCCESSFULLY! <<<");
    }
}
