using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

/**
 * ============================================================================
 * .NET & C# MODULE 04: LINQ & FUNCTIONAL C# - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua .NET 10:
 * rtk dotnet run --file dotnet/04-linq-and-functional/Practice.cs
 *
 * Yêu cầu: Tất cả 5 Challenges phải vượt qua mọi Debug.Assert mà không có Exception.
 */

public record Product(int Id, string Name, string Category, decimal Price);
public record OrderItem(int ProductId, int Quantity, decimal UnitPrice);
public record CustomerOrder(int OrderId, string CustomerName, List<OrderItem> Items);
public record Employee(int Id, string Name, string Department, decimal Salary);
public record Department(int Id, string Name);

public class Practice {
    public static void Main() {
        Console.WriteLine("=================================================");
        Console.WriteLine("  C# MODULE 04: LINQ & FUNCTIONAL TEST SUITE");
        Console.WriteLine("=================================================");

        TestChallenge1_DeferredExecution();
        TestChallenge2_SelectManyAndGroupBy();
        TestChallenge3_ModernAggregations();
        TestChallenge4_LeftOuterJoin();
        TestChallenge5_ChunkingAndPagination();

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("\n[SUCCESS] All 5 LINQ Challenges Passed Successfully! (5/5)");
        Console.ResetColor();
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 1: Deferred Execution vs Immediate Materialization
    // ------------------------------------------------------------------------
    private static void TestChallenge1_DeferredExecution() {
        Console.Write("[Test 1] Testing Deferred Execution & Materialization... ");

        var numbers = new List<int> { 1, 2, 3, 4, 5 };

        // 1. Deferred query: unmaterialized
        var lazyQuery = numbers.Where(n => n % 2 == 0).Select(n => n * 10);

        // 2. Eager query: materialized immediately into list
        var eagerSnapshot = numbers.Where(n => n % 2 == 0).Select(n => n * 10).ToList();

        // Mutate source list
        numbers.Add(6);
        numbers.Add(8);

        // lazyQuery re-evaluates dynamically against modified source
        var lazyResult = lazyQuery.ToList();

        Debug.Assert(eagerSnapshot.Count == 2, "Eager snapshot must only contain original 2 elements");
        Debug.Assert(eagerSnapshot.SequenceEqual(new[] { 20, 40 }), "Eager result must be [20, 40]");

        Debug.Assert(lazyResult.Count == 4, "Lazy query re-evaluated should find 4 even numbers");
        Debug.Assert(lazyResult.SequenceEqual(new[] { 20, 40, 60, 80 }), "Lazy result must reflect mutations");

        Console.WriteLine("PASSED");
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 2: Flattening with SelectMany & Category Grouping
    // ------------------------------------------------------------------------
    private static void TestChallenge2_SelectManyAndGroupBy() {
        Console.Write("[Test 2] Testing SelectMany & GroupBy Order Processing... ");

        var orders = new List<CustomerOrder> {
            new(101, "Alice", new List<OrderItem> {
                new(1, 2, 50.0m),  // 100.0m
                new(2, 1, 150.0m)  // 150.0m
            }),
            new(102, "Bob", new List<OrderItem> {
                new(1, 3, 50.0m),  // 150.0m
                new(3, 2, 30.0m)   // 60.0m
            }),
            new(103, "Charlie", new List<OrderItem> {
                new(2, 2, 150.0m), // 300.0m
                new(3, 5, 30.0m)   // 150.0m
            })
        };

        // Flatten all items across all customer orders using SelectMany
        var totalQuantitySold = orders
            .SelectMany(o => o.Items)
            .Sum(item => item.Quantity);

        Debug.Assert(totalQuantitySold == (2 + 1 + 3 + 2 + 2 + 5), "Total items sold must be 15");

        // Calculate total sales revenue grouped by ProductId
        var revenueByProduct = orders
            .SelectMany(o => o.Items)
            .GroupBy(item => item.ProductId)
            .Select(g => new {
                ProductId = g.Key,
                TotalRevenue = g.Sum(item => item.Quantity * item.UnitPrice)
            })
            .OrderByDescending(r => r.TotalRevenue)
            .ToList();

        // Product 2: (1 * 150) + (2 * 150) = 450.0m
        // Product 1: (2 * 50) + (3 * 50) = 250.0m
        // Product 3: (2 * 30) + (5 * 30) = 210.0m
        Debug.Assert(revenueByProduct[0].ProductId == 2 && revenueByProduct[0].TotalRevenue == 450.0m);
        Debug.Assert(revenueByProduct[1].ProductId == 1 && revenueByProduct[1].TotalRevenue == 250.0m);
        Debug.Assert(revenueByProduct[2].ProductId == 3 && revenueByProduct[2].TotalRevenue == 210.0m);

        Console.WriteLine("PASSED");
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 3: Modern Aggregations (MinBy, MaxBy, DistinctBy & Aggregate)
    // ------------------------------------------------------------------------
    private static void TestChallenge3_ModernAggregations() {
        Console.Write("[Test 3] Testing MinBy, MaxBy, DistinctBy & Aggregate... ");

        var staff = new List<Employee> {
            new(1, "Alice", "IT", 95000m),
            new(2, "Bob", "HR", 62000m),
            new(3, "Charlie", "IT", 120000m),
            new(4, "Diana", "Finance", 110000m),
            new(5, "Evan", "HR", 68000m),
            new(6, "Fiona", "IT", 88000m)
        };

        // .NET 6+ MaxBy & MinBy
        var highestEarner = staff.MaxBy(e => e.Salary);
        var lowestEarner = staff.MinBy(e => e.Salary);

        Debug.Assert(highestEarner != null && highestEarner.Name == "Charlie");
        Debug.Assert(lowestEarner != null && lowestEarner.Name == "Bob");

        // DistinctBy: First employee seen per Department
        var firstPerDept = staff.DistinctBy(e => e.Department).OrderBy(e => e.Department).ToList();
        Debug.Assert(firstPerDept.Count == 3, "There should be exactly 3 unique departments");
        Debug.Assert(firstPerDept.Select(e => e.Department).SequenceEqual(new[] { "Finance", "HR", "IT" }));

        // Custom Fold using Aggregate: calculate total payroll in IT department
        var itPayroll = staff
            .Where(e => e.Department == "IT")
            .Aggregate(0.0m, (accum, emp) => accum + emp.Salary);

        Debug.Assert(itPayroll == (95000m + 120000m + 88000m), "IT payroll should match sum of 3 IT staff");

        Console.WriteLine("PASSED");
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 4: Left Outer Join with GroupJoin and DefaultIfEmpty
    // ------------------------------------------------------------------------
    private static void TestChallenge4_LeftOuterJoin() {
        Console.Write("[Test 4] Testing Left Outer Join Simulation... ");

        var departments = new List<Department> {
            new(1, "Engineering"),
            new(2, "Human Resources"),
            new(3, "Legal") // No employees assigned
        };

        var employees = new List<Employee> {
            new(101, "Grace", "Engineering", 100000m),
            new(102, "Henry", "Engineering", 90000m),
            new(103, "Isabel", "Human Resources", 75000m)
        };

        // Simulate LEFT OUTER JOIN: All departments preserved even if employee list is empty
        var leftJoin = departments
            .GroupJoin(
                employees,
                dept => dept.Name,
                emp => emp.Department,
                (dept, empGroup) => new { Dept = dept, Employees = empGroup }
            )
            .SelectMany(
                d => d.Employees.DefaultIfEmpty(),
                (d, emp) => new {
                    DeptName = d.Dept.Name,
                    EmployeeName = emp != null ? emp.Name : "N/A"
                }
            )
            .OrderBy(r => r.DeptName)
            .ThenBy(r => r.EmployeeName)
            .ToList();

        Debug.Assert(leftJoin.Count == 4, "Should have 4 rows (2 Engineering + 1 HR + 1 Legal N/A)");

        var legalRow = leftJoin.FirstOrDefault(r => r.DeptName == "Legal");
        Debug.Assert(legalRow != null, "Legal department must exist in left outer join");
        Debug.Assert(legalRow.EmployeeName == "N/A", "Legal employee should be mapped to N/A fallback");

        Console.WriteLine("PASSED");
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 5: Partitioning with Chunk, Skip and Take
    // ------------------------------------------------------------------------
    private static void TestChallenge5_ChunkingAndPagination() {
        Console.Write("[Test 5] Testing Batching (Chunk) & Pagination... ");

        var data = Enumerable.Range(1, 23).ToList(); // 23 elements

        // Chunking into batches of 5 elements (.NET 6+)
        var chunks = data.Chunk(5).ToList();
        Debug.Assert(chunks.Count == 5, "23 items with chunk size 5 must produce 5 chunks");
        Debug.Assert(chunks[0].Length == 5, "First chunk size must be 5");
        Debug.Assert(chunks[4].Length == 3, "Last chunk size must be 3 (23 - 20)");
        Debug.Assert(chunks[4].SequenceEqual(new[] { 21, 22, 23 }), "Last chunk elements must be 21, 22, 23");

        // Pagination simulation: Page 3, PageSize 7 (1-indexed: Skip (3-1)*7, Take 7)
        int pageNumber = 3;
        int pageSize = 7;
        var page3 = data.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        // Items skipped: 14. Items taken: 15, 16, 17, 18, 19, 20, 21
        Debug.Assert(page3.Count == 7, "Page 3 should have 7 items");
        Debug.Assert(page3.First() == 15, "Page 3 first element should be 15");
        Debug.Assert(page3.Last() == 21, "Page 3 last element should be 21");

        Console.WriteLine("PASSED");
    }
}
