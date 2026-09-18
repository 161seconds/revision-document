using System;
using System.Diagnostics;

/**
 * MODULE 02: OOP & TYPE SYSTEM - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file Practice.cs
 */

public class Practice {
    /* ========================================================================= */
    /* CHALLENGE 1: OVERRIDE VS NEW METHOD HIDING                                */
    /* ========================================================================= */
    public class Animal {
        public virtual string MakeSound() => "Generic Sound";
    }

    public class DogOverride : Animal {
        public override string MakeSound() => "Woof (Override)";
    }

    public class CatNew : Animal {
        public new string MakeSound() => "Meow (New)";
    }

    public static void TestChallenge1() {
        Console.Write("[Test 1] Override vs New Method Hiding... ");

        Animal a1 = new DogOverride();
        Debug.Assert(a1.MakeSound() == "Woof (Override)"); // vTable dispatches to subclass

        Animal a2 = new CatNew();
        Debug.Assert(a2.MakeSound() == "Generic Sound");   // Bound to base class!

        CatNew directCat = (CatNew)a2;
        Debug.Assert(directCat.MakeSound() == "Meow (New)"); // Directly called

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 2: PRIMARY CONSTRUCTORS & INHERITANCE CHAINING                 */
    /* ========================================================================= */
    public class Account(string accountNumber, decimal initialBalance) {
        public string AccountNumber { get; } = accountNumber;
        public decimal Balance { get; protected set; } = initialBalance;
    }

    public class InterestAccount(string accountNumber, decimal initialBalance, decimal interestRate) 
        : Account(accountNumber, initialBalance) {
        public decimal InterestRate { get; } = interestRate;

        public void ApplyInterest() {
            Balance += Balance * InterestRate;
        }
    }

    public static void TestChallenge2() {
        Console.Write("[Test 2] Primary Constructors & Chaining... ");

        var acc = new InterestAccount("ACC-99", 1000m, 0.05m);
        Debug.Assert(acc.AccountNumber == "ACC-99");
        Debug.Assert(acc.Balance == 1000m);
        Debug.Assert(acc.InterestRate == 0.05m);

        acc.ApplyInterest();
        Debug.Assert(acc.Balance == 1050m);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 3: EXPLICIT INTERFACE IMPLEMENTATION                            */
    /* ========================================================================= */
    public interface ISqlLogger { string Log(); }
    public interface IFileLogger { string Log(); }

    public class DualLogger : ISqlLogger, IFileLogger {
        string ISqlLogger.Log() => "SQL_LOG";
        string IFileLogger.Log() => "FILE_LOG";
    }

    public static void TestChallenge3() {
        Console.Write("[Test 3] Explicit Interface Disambiguation... ");

        var logger = new DualLogger();
        ISqlLogger sql = logger;
        IFileLogger file = logger;

        Debug.Assert(sql.Log() == "SQL_LOG");
        Debug.Assert(file.Log() == "FILE_LOG");

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 4: RECORD VALUE EQUALITY & WITH EXPRESSION                      */
    /* ========================================================================= */
    public record GeoLocation(double Latitude, double Longitude, string City);

    public static void TestChallenge4() {
        Console.Write("[Test 4] Record Value Equality & With Expression... ");

        var loc1 = new GeoLocation(10.8231, 106.6297, "Ho Chi Minh City");
        var loc2 = new GeoLocation(10.8231, 106.6297, "Ho Chi Minh City");

        // Reference equality is false, but Value equality is true
        Debug.Assert(!object.ReferenceEquals(loc1, loc2));
        Debug.Assert(loc1 == loc2);
        Debug.Assert(loc1.Equals(loc2));

        // Non-destructive mutation
        var loc3 = loc1 with { City = "Saigon" };
        Debug.Assert(loc3.City == "Saigon");
        Debug.Assert(loc3.Latitude == 10.8231);
        Debug.Assert(loc1.City == "Ho Chi Minh City"); // Original unchanged

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 5: READONLY STRUCT ARITHMETIC                                   */
    /* ========================================================================= */
    public readonly struct ComplexNumber(double real, double imaginary) {
        public double Real { get; } = real;
        public double Imaginary { get; } = imaginary;

        public ComplexNumber Add(ComplexNumber other) =>
            new ComplexNumber(Real + other.Real, Imaginary + other.Imaginary);
    }

    public static void TestChallenge5() {
        Console.Write("[Test 5] Readonly Struct Arithmetic... ");

        var c1 = new ComplexNumber(3.0, 4.0);
        var c2 = new ComplexNumber(1.0, 2.0);
        var sum = c1.Add(c2);

        Debug.Assert(sum.Real == 4.0);
        Debug.Assert(sum.Imaginary == 6.0);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* MAIN RUNNER                                                               */
    /* ========================================================================= */
    public static void Main() {
        Console.WriteLine("=== RUNNING .NET C# MODULE 02 TESTS ===\n");

        TestChallenge1();
        TestChallenge2();
        TestChallenge3();
        TestChallenge4();
        TestChallenge5();

        Console.WriteLine("\n>>> ALL 5 MODULE 02 TESTS PASSED SUCCESSFULLY! <<<");
    }
}
