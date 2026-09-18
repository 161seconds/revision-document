using System;
using System.Collections.Generic;

/**
 * .NET & C# MODULE 03: GENERICS & COLLECTIONS DEMO
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file GenericsDemo.cs
 */

public class GenericsDemo {
    public static void Main() {
        Console.WriteLine("=== 1. GENERIC STACK DATA STRUCTURE ===");
        var stack = new CustomStack<string>();
        stack.Push("First");
        stack.Push("Second");
        stack.Push("Third");
        Console.WriteLine($"Top element: {stack.Peek()}, Total Count: {stack.Count}");
        Console.WriteLine($"Popped: {stack.Pop()}");

        Console.WriteLine("\n=== 2. LAZY ENUMERABLE WITH YIELD RETURN ===");
        Console.Write("Fibonacci sequence (first 7): ");
        foreach (int fib in GenerateFibonacci(7)) {
            Console.Write($"{fib} ");
        }
        Console.WriteLine();

        Console.WriteLine("\n=== 3. DELEGATES, LAMBDAS & EVENTS ===");
        var publisher = new StockTicker();
        publisher.PriceAlert += (sender, price) => {
            Console.WriteLine($"[Subscriber Notification]: Stock alert triggered at ${price}!");
        };

        publisher.UpdatePrice(150.0m);
        publisher.UpdatePrice(95.0m); // Trigger event (< 100)

        Console.WriteLine("\n=== 4. EXCEPTION FILTERS WITH WHEN ===");
        SimulateErrorHandling(404);
        SimulateErrorHandling(500);

        Console.WriteLine("\n>>> MODULE 03 DEMO FINISHED SUCCESSFULLY <<<");
    }

    // 1. Generic Class với Constraint
    public class CustomStack<T> where T : class {
        private readonly List<T> _items = [];
        public void Push(T item) => _items.Add(item);
        public T Pop() {
            if (_items.Count == 0) throw new InvalidOperationException("Stack is empty");
            T val = _items[^1];
            _items.RemoveAt(_items.Count - 1);
            return val;
        }
        public T Peek() => _items.Count > 0 ? _items[^1] : throw new InvalidOperationException("Stack is empty");
        public int Count => _items.Count;
    }

    // 2. Yield return iterator
    public static IEnumerable<int> GenerateFibonacci(int count) {
        int a = 0, b = 1;
        for (int i = 0; i < count; i++) {
            yield return a;
            int next = a + b;
            a = b;
            b = next;
        }
    }

    // 3. Event Publisher
    public class StockTicker {
        public event EventHandler<decimal>? PriceAlert;

        public void UpdatePrice(decimal newPrice) {
            if (newPrice < 100.0m) {
                PriceAlert?.Invoke(this, newPrice);
            }
        }
    }

    // 4. Exception Filter
    public static void SimulateErrorHandling(int httpCode) {
        try {
            throw new HttpRequestException($"Failed with code {httpCode}", null, (System.Net.HttpStatusCode)httpCode);
        } catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound) {
            Console.WriteLine($"[Caught by 404 filter]: {ex.Message}");
        } catch (HttpRequestException ex) {
            Console.WriteLine($"[Caught by general filter]: {ex.Message}");
        }
    }
}
