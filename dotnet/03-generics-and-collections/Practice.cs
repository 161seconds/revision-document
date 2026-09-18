using System;
using System.Collections.Generic;
using System.Diagnostics;

/**
 * MODULE 03: GENERICS & COLLECTIONS - PRACTICE & SELF-TESTING SUITE
 * Chạy trực tiếp qua .NET 10:
 * dotnet run --file Practice.cs
 */

public class Practice {
    /* ========================================================================= */
    /* CHALLENGE 1: GENERIC LRU-STYLE MEMORY CACHE                               */
    /* ========================================================================= */
    public class SimpleCache<TKey, TValue> where TKey : notnull {
        private readonly Dictionary<TKey, TValue> _storage = [];

        public void Set(TKey key, TValue value) => _storage[key] = value;

        public bool TryGet(TKey key, out TValue? value) => _storage.TryGetValue(key, out value);

        public int Count => _storage.Count;
    }

    public static void TestChallenge1() {
        Console.Write("[Test 1] Generic Dictionary Cache... ");

        var cache = new SimpleCache<string, int>();
        cache.Set("A", 100);
        cache.Set("B", 200);

        Debug.Assert(cache.Count == 2);

        bool found = cache.TryGet("A", out int val);
        Debug.Assert(found && val == 100);

        bool notFound = cache.TryGet("Z", out _);
        Debug.Assert(!notFound);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 2: YIELD RETURN LAZY RANGE GENERATOR                            */
    /* ========================================================================= */
    public static IEnumerable<int> GenerateEvens(int start, int count) {
        int current = (start % 2 == 0) ? start : start + 1;
        for (int i = 0; i < count; i++) {
            yield return current;
            current += 2;
        }
    }

    public static void TestChallenge2() {
        Console.Write("[Test 2] Lazy Yield Return Evens... ");

        var evens = new List<int>(GenerateEvens(3, 4));
        Debug.Assert(evens.Count == 4);
        Debug.Assert(evens[0] == 4);
        Debug.Assert(evens[1] == 6);
        Debug.Assert(evens[2] == 8);
        Debug.Assert(evens[3] == 10);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 3: DELEGATE MULTICAST PIPELINE                                  */
    /* ========================================================================= */
    public static void TestChallenge3() {
        Console.Write("[Test 3] Delegate Function Composition... ");

        Func<int, int> doubleVal = x => x * 2;
        Func<int, int> addFive = x => x + 5;

        // Pipeline helper
        int Compose(int input, params Func<int, int>[] steps) {
            int current = input;
            foreach (var step in steps) {
                current = step(current);
            }
            return current;
        }

        int result = Compose(10, doubleVal, addFive); // (10 * 2) + 5 = 25
        Debug.Assert(result == 25);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 4: EVENT PUBLISHER AND SUBSCRIBER                               */
    /* ========================================================================= */
    public class OrderPlacedEventArgs(int orderId) : EventArgs {
        public int OrderId { get; } = orderId;
    }

    public class OrderDispatcher {
        public event EventHandler<OrderPlacedEventArgs>? OrderPlaced;

        public void PlaceOrder(int id) {
            OrderPlaced?.Invoke(this, new OrderPlacedEventArgs(id));
        }
    }

    public static void TestChallenge4() {
        Console.Write("[Test 4] Event Subscription & Dispatch... ");

        var dispatcher = new OrderDispatcher();
        int receivedOrderId = 0;
        int notificationCount = 0;

        EventHandler<OrderPlacedEventArgs> handler = (sender, args) => {
            notificationCount++;
            receivedOrderId = args.OrderId;
        };

        dispatcher.OrderPlaced += handler;
        dispatcher.PlaceOrder(505);

        Debug.Assert(notificationCount == 1);
        Debug.Assert(receivedOrderId == 505);

        // Unsubscribe
        dispatcher.OrderPlaced -= handler;
        dispatcher.PlaceOrder(999);

        Debug.Assert(notificationCount == 1); // Not incremented

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* CHALLENGE 5: IDISPOSABLE RESOURCE CLEANUP TRACKER                         */
    /* ========================================================================= */
    public class TrackedResource : IDisposable {
        public bool IsDisposed { get; private set; } = false;

        public void Dispose() {
            IsDisposed = true;
        }
    }

    public static void TestChallenge5() {
        Console.Write("[Test 5] IDisposable Resource Lifecycle... ");

        TrackedResource res;
        using (res = new TrackedResource()) {
            Debug.Assert(res.IsDisposed == false);
        }

        // Out of using scope
        Debug.Assert(res.IsDisposed == true);

        Console.WriteLine("PASSED");
    }

    /* ========================================================================= */
    /* MAIN RUNNER                                                               */
    /* ========================================================================= */
    public static void Main() {
        Console.WriteLine("=== RUNNING .NET C# MODULE 03 TESTS ===\n");

        TestChallenge1();
        TestChallenge2();
        TestChallenge3();
        TestChallenge4();
        TestChallenge5();

        Console.WriteLine("\n>>> ALL 5 MODULE 03 TESTS PASSED SUCCESSFULLY! <<<");
    }
}
