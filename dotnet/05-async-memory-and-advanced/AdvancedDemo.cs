#pragma warning disable IL2067, IL2075

using System;
using System.Buffers;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

/**
 * ============================================================================
 * .NET & C# MODULE 05: ASYNC, CLR MEMORY & ADVANCED FEATURES DEMO
 * ============================================================================
 * Chạy trực tiếp qua .NET 10:
 * rtk dotnet run --file dotnet/05-async-memory-and-advanced/AdvancedDemo.cs
 */

public class AdvancedDemo {
    public static async Task Main() {
        Console.WriteLine("=== 1. ASYNC CONCURRENCY & CANCELLATION ===");
        await RunAsyncPipeline();

        Console.WriteLine("\n=== 2. CLR MEMORY & ARRAYPOOL ===");
        DemonstrateMemoryManagement();

        Console.WriteLine("\n=== 3. DEPENDENCY INJECTION LIFETIMES ===");
        DemonstrateDiLifetimes();

        Console.WriteLine("\n=== 4. REFLECTION & CUSTOM ATTRIBUTES ===");
        DemonstrateReflectionValidator();

        Console.WriteLine("\n>>> MODULE 05 DEMO COMPLETED SUCCESSFULLY <<<");
    }

    // ------------------------------------------------------------------------
    // 1. TAP & Cancellation
    // ------------------------------------------------------------------------
    private static async Task RunAsyncPipeline() {
        using var cts = new CancellationTokenSource(TimeSpan.FromMilliseconds(500));

        try {
            var task1 = FetchTaskAsync("WeatherService", 100, cts.Token);
            var task2 = FetchTaskAsync("StockService", 150, cts.Token);

            string[] results = await Task.WhenAll(task1, task2);
            Console.WriteLine("Concurrent tasks completed: " + string.Join(", ", results));
        }
        catch (OperationCanceledException) {
            Console.WriteLine("Task was cancelled by timeout!");
        }
    }

    private static async Task<string> FetchTaskAsync(string name, int delayMs, CancellationToken token) {
        await Task.Delay(delayMs, token);
        return $"{name}:SUCCESS";
    }

    // ------------------------------------------------------------------------
    // 2. Memory & ArrayPool
    // ------------------------------------------------------------------------
    private static void DemonstrateMemoryManagement() {
        var obj = new object();
        Console.WriteLine($"Object generation in CLR: Gen {GC.GetGeneration(obj)}");

        // ArrayPool to avoid LOH allocation
        byte[] buffer = ArrayPool<byte>.Shared.Rent(100_000); // 100KB buffer
        try {
            buffer[0] = 0xAA;
            buffer[1] = 0xBB;
            Console.WriteLine($"Rented {buffer.Length} bytes from ArrayPool.Shared (Zero LOH pressure)");
        }
        finally {
            ArrayPool<byte>.Shared.Return(buffer);
            Console.WriteLine("Buffer safely returned to ArrayPool");
        }
    }

    // ------------------------------------------------------------------------
    // 3. DI Lifetimes Simulation
    // ------------------------------------------------------------------------
    private static void DemonstrateDiLifetimes() {
        var container = new MiniContainer();
        container.RegisterSingleton<ISingletonService, SingletonService>();
        container.RegisterScoped<IScopedService, ScopedService>();
        container.RegisterTransient<ITransientService, TransientService>();

        // Scope 1
        using (var scope1 = container.CreateScope()) {
            var s1_a = scope1.Resolve<IScopedService>();
            var s1_b = scope1.Resolve<IScopedService>();
            var t1_a = scope1.Resolve<ITransientService>();
            var t1_b = scope1.Resolve<ITransientService>();
            var single1 = scope1.Resolve<ISingletonService>();

            Console.WriteLine($"[Scope 1] Scoped instance same? {ReferenceEquals(s1_a, s1_b)} (True expected)");
            Console.WriteLine($"[Scope 1] Transient instance same? {ReferenceEquals(t1_a, t1_b)} (False expected)");
        }

        // Scope 2
        using (var scope2 = container.CreateScope()) {
            var s2 = scope2.Resolve<IScopedService>();
            var single2 = scope2.Resolve<ISingletonService>();

            var single1 = container.Resolve<ISingletonService>();
            Console.WriteLine($"[Scope 2 vs Root] Singleton instance same? {ReferenceEquals(single1, single2)} (True expected)");
        }
    }

    // ------------------------------------------------------------------------
    // 4. Reflection Validator
    // ------------------------------------------------------------------------
    private static void DemonstrateReflectionValidator() {
        var account = new UserAccount {
            Email = "", // Invalid
            Age = 15    // Invalid (< 18)
        };

        var errors = SimpleValidator.Validate(account);
        Console.WriteLine($"Validation found {errors.Count} errors:");
        foreach (var err in errors) {
            Console.WriteLine($" - {err}");
        }
    }
}

// Mini DI Container for Demonstration
public interface ITransientService { Guid Id { get; } }
public interface IScopedService { Guid Id { get; } }
public interface ISingletonService { Guid Id { get; } }

public class TransientService : ITransientService { public Guid Id { get; } = Guid.NewGuid(); }
public class ScopedService : IScopedService { public Guid Id { get; } = Guid.NewGuid(); }
public class SingletonService : ISingletonService { public Guid Id { get; } = Guid.NewGuid(); }

public class MiniContainer {
    private readonly Dictionary<Type, Type> _transients = new();
    private readonly Dictionary<Type, Type> _scoped = new();
    private readonly Dictionary<Type, object> _singletons = new();
    private readonly Dictionary<Type, Type> _singletonTypes = new();

    public void RegisterTransient<TInterface, TImpl>() where TImpl : TInterface => _transients[typeof(TInterface)] = typeof(TImpl);
    public void RegisterScoped<TInterface, TImpl>() where TImpl : TInterface => _scoped[typeof(TInterface)] = typeof(TImpl);
    public void RegisterSingleton<TInterface, TImpl>() where TImpl : TInterface => _singletonTypes[typeof(TInterface)] = typeof(TImpl);

    public MiniScope CreateScope() => new(this);

    public T Resolve<T>() => (T)Resolve(typeof(T), null);

    public object Resolve(Type serviceType, MiniScope? scope) {
        if (_singletonTypes.TryGetValue(serviceType, out var sType)) {
            if (!_singletons.TryGetValue(serviceType, out var instance)) {
                instance = Activator.CreateInstance(sType)!;
                _singletons[serviceType] = instance;
            }
            return instance;
        }

        if (_scoped.TryGetValue(serviceType, out var scType)) {
            if (scope == null) throw new InvalidOperationException("Cannot resolve Scoped service outside a scope!");
            return scope.GetOrCreateScoped(serviceType, scType);
        }

        if (_transients.TryGetValue(serviceType, out var trType)) {
            return Activator.CreateInstance(trType)!;
        }

        throw new KeyNotFoundException($"Service {serviceType.Name} not registered");
    }
}

public class MiniScope : IDisposable {
    private readonly MiniContainer _container;
    private readonly Dictionary<Type, object> _scopedInstances = new();

    public MiniScope(MiniContainer container) => _container = container;

    public T Resolve<T>() => (T)_container.Resolve(typeof(T), this);

    internal object GetOrCreateScoped(Type serviceType, Type implType) {
        if (!_scopedInstances.TryGetValue(serviceType, out var instance)) {
            instance = Activator.CreateInstance(implType)!;
            _scopedInstances[serviceType] = instance;
        }
        return instance;
    }

    public void Dispose() {
        foreach (var inst in _scopedInstances.Values) {
            if (inst is IDisposable d) d.Dispose();
        }
        _scopedInstances.Clear();
    }
}

// Custom Attributes & Reflection
[AttributeUsage(AttributeTargets.Property)]
public class RequiredPropertyAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class RangeLimitAttribute(int min, int max) : Attribute {
    public int Min { get; } = min;
    public int Max { get; } = max;
}

public class UserAccount {
    [RequiredProperty]
    public string Email { get; set; } = "";

    [RangeLimit(18, 120)]
    public int Age { get; set; }
}

public static class SimpleValidator {
    public static List<string> Validate(object target) {
        var errors = new List<string>();
        var type = target.GetType();

        foreach (var prop in type.GetProperties()) {
            var val = prop.GetValue(target);

            if (prop.GetCustomAttribute<RequiredPropertyAttribute>() != null) {
                if (val is string s && string.IsNullOrWhiteSpace(s)) {
                    errors.Add($"Field '{prop.Name}' is required and cannot be empty.");
                }
            }

            var range = prop.GetCustomAttribute<RangeLimitAttribute>();
            if (range != null && val is int num) {
                if (num < range.Min || num > range.Max) {
                    errors.Add($"Field '{prop.Name}' must be between {range.Min} and {range.Max}.");
                }
            }
        }
        return errors;
    }
}
