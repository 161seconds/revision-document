using System;
using System.Collections.Generic;
using System.Linq;

/**
 * .NET & C# MODULE 04: LINQ & FUNCTIONAL DEMO
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file LinqDemo.cs
 */

public class LinqDemo {
    public static void Main() {
        Console.WriteLine("=== 1. FILTERING, PROJECTION & FLATTENING ===");
        var developers = new[] {
            new { Name = "Alice", Skills = new[] { "C#", "Docker", "PostgreSQL" }, ExpYears = 6 },
            new { Name = "Bob", Skills = new[] { "React", "TypeScript" }, ExpYears = 3 },
            new { Name = "Charlie", Skills = new[] { "C#", "Kubernetes", "AWS" }, ExpYears = 8 }
        };

        // SelectMany: Flatten skills
        var uniqueSkills = developers.SelectMany(d => d.Skills).Distinct().OrderBy(s => s);
        Console.WriteLine("All unique skills across team: " + string.Join(", ", uniqueSkills));

        // Grouping
        var byExp = developers.GroupBy(d => d.ExpYears > 5 ? "Senior" : "Junior");
        foreach (var group in byExp) {
            Console.WriteLine($"Tier [{group.Key}]: {string.Join(", ", group.Select(d => d.Name))}");
        }

        Console.WriteLine("\n=== 2. MODERN AGGREGATIONS (MAXBY & CHUNK) ===");
        var topDev = developers.MaxBy(d => d.ExpYears);
        Console.WriteLine($"Most experienced developer: {topDev?.Name} ({topDev?.ExpYears} years)");

        var numbers = Enumerable.Range(1, 10);
        Console.WriteLine("Chunking numbers into batches of 3:");
        foreach (var batch in numbers.Chunk(3)) {
            Console.WriteLine(" - Batch: [" + string.Join(", ", batch) + "]");
        }

        Console.WriteLine("\n=== 3. INNER JOIN & GROUP JOIN ===");
        var departments = new[] {
            new { DeptId = 1, DeptName = "Engineering" },
            new { DeptId = 2, DeptName = "Design" },
            new { DeptId = 3, DeptName = "Marketing" }
        };

        var staff = new[] {
            new { Name = "David", DeptId = 1 },
            new { Name = "Eva", DeptId = 1 },
            new { Name = "Frank", DeptId = 2 }
        };

        var joined = departments.GroupJoin(
            staff,
            d => d.DeptId,
            s => s.DeptId,
            (dept, members) => new {
                dept.DeptName,
                MemberCount = members.Count(),
                Names = string.Join(", ", members.Select(m => m.Name))
            }
        );

        foreach (var j in joined) {
            Console.WriteLine($"Dept: {j.DeptName} | Count: {j.MemberCount} | Members: [{j.Names}]");
        }

        Console.WriteLine("\n>>> MODULE 04 DEMO FINISHED SUCCESSFULLY <<<");
    }
}
