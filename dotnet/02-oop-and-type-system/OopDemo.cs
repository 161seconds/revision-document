using System;

/**
 * .NET & C# MODULE 02: OOP & TYPE SYSTEM DEMO
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file OopDemo.cs
 */

public class OopDemo {
    public static void Main() {
        Console.WriteLine("=== 1. PRIMARY CONSTRUCTORS & INHERITANCE ===");
        var dev = new SeniorDeveloper("Alice", 30, "Cloud Architecture");
        Console.WriteLine(dev.GetSummary());

        Console.WriteLine("\n=== 2. POLYMORPHISM & VIRTUAL METHODS ===");
        Employee emp = dev;
        emp.Work(); // Đa hình: Gọi đúng phương thức của SeniorDeveloper qua vTable

        Console.WriteLine("\n=== 3. EXPLICIT INTERFACE IMPLEMENTATION ===");
        var multiService = new MultiOperationService();
        // multiService.Execute(); // Lỗi biên dịch nếu gọi trực tiếp
        ((IReader)multiService).Execute();
        ((IWriter)multiService).Execute();

        Console.WriteLine("\n=== 4. RECORDS & VALUE EQUALITY & WITH EXPRESSION ===");
        var book1 = new BookRecord("C# in Depth", "Jon Skeet", 45.0m);
        var book2 = new BookRecord("C# in Depth", "Jon Skeet", 45.0m);

        Console.WriteLine($"book1 == book2 (Value Equality): {book1 == book2}"); // True!

        var discountedBook = book1 with { Price = 35.0m };
        Console.WriteLine($"Original Price: {book1.Price}, Discounted Price: {discountedBook.Price}");

        Console.WriteLine("\n>>> MODULE 02 DEMO FINISHED SUCCESSFULLY <<<");
    }
}

// 1. Primary Constructor Base Class
public class Employee(string name, int age) {
    public string Name { get; } = name;
    public int Age { get; } = age;

    public virtual void Work() => Console.WriteLine($"{Name} is performing generic tasks.");
    public virtual string GetSummary() => $"Employee: {Name}, Age: {Age}";
}

// Subclass kế thừa với primary constructor chaining
public class SeniorDeveloper(string name, int age, string specialty) : Employee(name, age) {
    public string Specialty { get; } = specialty;

    public override void Work() => Console.WriteLine($"{Name} is architecting {Specialty} systems.");
    public override string GetSummary() => $"{base.GetSummary()} | Specialty: {Specialty}";
}

// 2. Explicit Interface Implementation
public interface IReader { void Execute(); }
public interface IWriter { void Execute(); }

public class MultiOperationService : IReader, IWriter {
    void IReader.Execute() => Console.WriteLine("[Reader]: Reading data stream...");
    void IWriter.Execute() => Console.WriteLine("[Writer]: Writing data stream...");
}

// 3. Positional Record
public record BookRecord(string Title, string Author, decimal Price);
