#pragma warning disable IL2067, IL2075

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

/**
 * ============================================================================
 * .NET & C# MODULE 05: ASYNC, MEMORY & ADVANCED - SELF-TEST PRACTICE SUITE
 * ============================================================================
 * Chạy trực tiếp qua .NET 10:
 * rtk dotnet run --file dotnet/05-async-memory-and-advanced/Practice.cs
 *
 * Yêu cầu: Tất cả 5 Challenges phải vượt qua mọi Debug.Assert mà không có Exception.
 */

public class Practice {
    public static async Task Main() {
        Console.WriteLine("=================================================");
        Console.WriteLine("  C# MODULE 05: ADVANCED .NET TEST SUITE");
        Console.WriteLine("=================================================");

        await TestChallenge1_AsyncPipelineAndCancellation();
        await TestChallenge2_ValueTaskZeroAllocationCache();
        TestChallenge3_StandardDisposePattern();
        TestChallenge4_DiLifetimeSemantics();
        TestChallenge5_CustomAttributeValidationEngine();

        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("\n[SUCCESS] All 5 Advanced .NET Challenges Passed Successfully! (5/5)");
        Console.ResetColor();
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 1: Asynchronous Task Pipeline & Cooperative Cancellation
    // ------------------------------------------------------------------------
    private static async Task TestChallenge1_AsyncPipelineAndCancellation() {
        Console.Write("[Test 1] Testing TAP Pipeline & Cooperative Cancellation... ");

        using var cts = new CancellationTokenSource();

        // 1. Task succeeds normally
        var normalTask = FetchMockDataAsync("Worker-1", 50, cts.Token);
        var result = await normalTask;
        Debug.Assert(result == "Worker-1:OK", "Normal task should complete successfully");

        // 2. Cancellation triggers OperationCanceledException
        cts.Cancel(); // Cancel immediately
        var cancelledTask = FetchMockDataAsync("Worker-Cancelled", 100, cts.Token);

        bool caughtCancellation = false;
        try {
            await cancelledTask;
        }
        catch (OperationCanceledException) {
            caughtCancellation = true;
        }
        Debug.Assert(caughtCancellation, "Cancelled task must throw OperationCanceledException");
        Debug.Assert(cancelledTask.IsCanceled, "Task status must be Canceled");

        Console.WriteLine("PASSED");
    }

    private static async Task<string> FetchMockDataAsync(string name, int delayMs, CancellationToken token) {
        token.ThrowIfCancellationRequested();
        await Task.Delay(delayMs, token);
        return $"{name}:OK";
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 2: ValueTask Optimization on Synchronous Hot Path
    // ------------------------------------------------------------------------
    private static async Task TestChallenge2_ValueTaskZeroAllocationCache() {
        Console.Write("[Test 2] Testing ValueTask Synchronous Cache Optimization... ");

        var cacheService = new TokenCacheService();

        // First call: Cache miss -> runs asynchronously
        var valTask1 = cacheService.GetTokenAsync();
        // Since it performs Task.Delay, it is not completed synchronously immediately
        string token1 = await valTask1;
        Debug.Assert(token1 == "AUTH_TOKEN_SECRET_123", "First call should fetch token");

        // Second call: Cache hit -> returns ValueTask synchronously (Zero Heap Allocation)
        var valTask2 = cacheService.GetTokenAsync();
        Debug.Assert(valTask2.IsCompletedSuccessfully, "ValueTask must complete synchronously on cache hit");
        string token2 = await valTask2;
        Debug.Assert(token2 == token1, "Cached token must match first token");

        Console.WriteLine("PASSED");
    }

    private class TokenCacheService {
        private string? _cachedToken;

        public ValueTask<string> GetTokenAsync() {
            if (_cachedToken != null) {
                // Synchronous completion -> no Task allocation on Managed Heap
                return ValueTask.FromResult(_cachedToken);
            }
            return new ValueTask<string>(FetchRemoteTokenAsync());
        }

        private async Task<string> FetchRemoteTokenAsync() {
            await Task.Delay(10);
            _cachedToken = "AUTH_TOKEN_SECRET_123";
            return _cachedToken;
        }
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 3: Standard Dispose Pattern & Idempotency
    // ------------------------------------------------------------------------
    private static void TestChallenge3_StandardDisposePattern() {
        Console.Write("[Test 3] Testing Standard Dispose Pattern & Idempotency... ");

        MockFileStreamResource? resource = null;
        using (resource = new MockFileStreamResource("test.bin")) {
            Debug.Assert(!resource.IsDisposed, "Resource should not be disposed inside using block");
            resource.WriteData(new byte[] { 1, 2, 3 });
            Debug.Assert(resource.BytesWritten == 3, "Should have written 3 bytes");
        }

        // After using block: must be disposed
        Debug.Assert(resource.IsDisposed, "Resource must be disposed after leaving using scope");

        // Calling Dispose second time must be safe (idempotent, no exception)
        resource.Dispose();
        Debug.Assert(resource.DisposeCallCount == 2, "Second dispose call count recorded");

        // Attempting to use disposed resource must throw ObjectDisposedException
        bool threwDisposed = false;
        try {
            resource.WriteData(new byte[] { 4 });
        }
        catch (ObjectDisposedException) {
            threwDisposed = true;
        }
        Debug.Assert(threwDisposed, "Writing to disposed resource must throw ObjectDisposedException");

        Console.WriteLine("PASSED");
    }

    private class MockFileStreamResource : IDisposable {
        public string FileName { get; }
        public bool IsDisposed { get; private set; }
        public int DisposeCallCount { get; private set; }
        public int BytesWritten { get; private set; }

        public MockFileStreamResource(string fileName) {
            FileName = fileName;
        }

        public void WriteData(byte[] bytes) {
            ObjectDisposedException.ThrowIf(IsDisposed, this);
            BytesWritten += bytes.Length;
        }

        public void Dispose() {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing) {
            DisposeCallCount++;
            if (!IsDisposed) {
                if (disposing) {
                    // Release managed state
                }
                // Release unmanaged state
                IsDisposed = true;
            }
        }
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 4: Dependency Injection Lifetimes (Transient, Scoped, Singleton)
    // ------------------------------------------------------------------------
    private static void TestChallenge4_DiLifetimeSemantics() {
        Console.Write("[Test 4] Testing DI Container Lifetimes (Transient, Scoped, Singleton)... ");

        var container = new TestDiContainer();
        container.RegisterTransient<ITransientToken, ServiceImplementation>();
        container.RegisterScoped<IScopedToken, ServiceImplementation>();
        container.RegisterSingleton<ISingletonToken, ServiceImplementation>();

        ISingletonToken singletonFromRoot = container.Resolve<ISingletonToken>();

        using (var scope1 = container.CreateScope()) {
            // Transient: each resolve must produce a NEW distinct instance
            var t1 = scope1.Resolve<ITransientToken>();
            var t2 = scope1.Resolve<ITransientToken>();
            Debug.Assert(!ReferenceEquals(t1, t2), "Transient must create distinct instances on each resolve");

            // Scoped: same scope must produce the EXACT same instance
            var s1_a = scope1.Resolve<IScopedToken>();
            var s1_b = scope1.Resolve<IScopedToken>();
            Debug.Assert(ReferenceEquals(s1_a, s1_b), "Scoped must return the identical instance within the same scope");

            // Singleton: same instance as resolved from root
            var s1_sing = scope1.Resolve<ISingletonToken>();
            Debug.Assert(ReferenceEquals(singletonFromRoot, s1_sing), "Singleton inside scope must match root instance");

            using (var scope2 = container.CreateScope()) {
                // Different scopes must have DIFFERENT scoped instances
                var s2_a = scope2.Resolve<IScopedToken>();
                Debug.Assert(!ReferenceEquals(s1_a, s2_a), "Different scopes must create different Scoped instances");

                // But Singleton remains identical
                var s2_sing = scope2.Resolve<ISingletonToken>();
                Debug.Assert(ReferenceEquals(singletonFromRoot, s2_sing), "Singleton must be identical across all scopes");
            }
        }

        Console.WriteLine("PASSED");
    }

    public interface ITransientToken { Guid Id { get; } }
    public interface IScopedToken { Guid Id { get; } }
    public interface ISingletonToken { Guid Id { get; } }

    public class ServiceImplementation : ITransientToken, IScopedToken, ISingletonToken {
        public Guid Id { get; } = Guid.NewGuid();
    }

    public class TestDiContainer {
        private readonly Dictionary<Type, Type> _transients = new();
        private readonly Dictionary<Type, Type> _scoped = new();
        private readonly Dictionary<Type, object> _singletons = new();
        private readonly Dictionary<Type, Type> _singletonTypes = new();

        public void RegisterTransient<TInterface, TImpl>() => _transients[typeof(TInterface)] = typeof(TImpl);
        public void RegisterScoped<TInterface, TImpl>() => _scoped[typeof(TInterface)] = typeof(TImpl);
        public void RegisterSingleton<TInterface, TImpl>() => _singletonTypes[typeof(TInterface)] = typeof(TImpl);

        public TestDiScope CreateScope() => new(this);
        public T Resolve<T>() => (T)Resolve(typeof(T), null);

        public object Resolve(Type serviceType, TestDiScope? scope) {
            if (_singletonTypes.TryGetValue(serviceType, out var sType)) {
                if (!_singletons.TryGetValue(serviceType, out var instance)) {
                    instance = Activator.CreateInstance(sType)!;
                    _singletons[serviceType] = instance;
                }
                return instance;
            }

            if (_scoped.TryGetValue(serviceType, out var scType)) {
                if (scope == null) throw new InvalidOperationException("Cannot resolve Scoped service without an active scope");
                return scope.GetOrCreate(serviceType, scType);
            }

            if (_transients.TryGetValue(serviceType, out var trType)) {
                return Activator.CreateInstance(trType)!;
            }

            throw new KeyNotFoundException($"Service {serviceType.Name} not found");
        }
    }

    public class TestDiScope : IDisposable {
        private readonly TestDiContainer _container;
        private readonly Dictionary<Type, object> _scopedInstances = new();

        public TestDiScope(TestDiContainer container) => _container = container;
        public T Resolve<T>() => (T)_container.Resolve(typeof(T), this);

        public object GetOrCreate(Type serviceType, Type implType) {
            if (!_scopedInstances.TryGetValue(serviceType, out var instance)) {
                instance = Activator.CreateInstance(implType)!;
                _scopedInstances[serviceType] = instance;
            }
            return instance;
        }

        public void Dispose() => _scopedInstances.Clear();
    }

    // ------------------------------------------------------------------------
    // CHALLENGE 5: Custom Attribute Dynamic Validation Engine via Reflection
    // ------------------------------------------------------------------------
    private static void TestChallenge5_CustomAttributeValidationEngine() {
        Console.Write("[Test 5] Testing Custom Attribute Dynamic Validation Engine... ");

        // Valid model
        var validUser = new RegisterUserDto {
            Email = "admin@enterprise.com",
            DisplayName = "SuperAdmin",
            Score = 85
        };
        var validErrors = AttributeValidatorEngine.Validate(validUser);
        Debug.Assert(validErrors.Count == 0, "Valid user should produce 0 errors");

        // Invalid model
        var invalidUser = new RegisterUserDto {
            Email = "not-an-email",  // Missing '@'
            DisplayName = "Al",      // Length 2 < 3
            Score = 150              // > 100
        };
        var invalidErrors = AttributeValidatorEngine.Validate(invalidUser);
        Debug.Assert(invalidErrors.Count == 3, "Invalid user should trigger 3 validation errors");
        Debug.Assert(invalidErrors.Exists(e => e.Contains("Email")), "Should report email error");
        Debug.Assert(invalidErrors.Exists(e => e.Contains("DisplayName")), "Should report length error");
        Debug.Assert(invalidErrors.Exists(e => e.Contains("Score")), "Should report score range error");

        Console.WriteLine("PASSED");
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class SimpleEmailAttribute : Attribute { }

    [AttributeUsage(AttributeTargets.Property)]
    public class StringLengthRangeAttribute(int min, int max) : Attribute {
        public int Min { get; } = min;
        public int Max { get; } = max;
    }

    [AttributeUsage(AttributeTargets.Property)]
    public class IntegerRangeAttribute(int min, int max) : Attribute {
        public int Min { get; } = min;
        public int Max { get; } = max;
    }

    public class RegisterUserDto {
        [SimpleEmail]
        public string Email { get; set; } = "";

        [StringLengthRange(3, 20)]
        public string DisplayName { get; set; } = "";

        [IntegerRange(0, 100)]
        public int Score { get; set; }
    }

    public static class AttributeValidatorEngine {
        public static List<string> Validate(object entity) {
            var errors = new List<string>();
            var type = entity.GetType();

            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance)) {
                var value = prop.GetValue(entity);

                // SimpleEmail validation
                if (prop.GetCustomAttribute<SimpleEmailAttribute>() != null) {
                    if (value is not string s || !s.Contains('@')) {
                        errors.Add($"Property '{prop.Name}' must be a valid email containing '@'.");
                    }
                }

                // StringLengthRange validation
                var strRange = prop.GetCustomAttribute<StringLengthRangeAttribute>();
                if (strRange != null && value is string strVal) {
                    if (strVal.Length < strRange.Min || strVal.Length > strRange.Max) {
                        errors.Add($"Property '{prop.Name}' length must be between {strRange.Min} and {strRange.Max}.");
                    }
                }

                // IntegerRange validation
                var intRange = prop.GetCustomAttribute<IntegerRangeAttribute>();
                if (intRange != null && value is int intVal) {
                    if (intVal < intRange.Min || intVal > intRange.Max) {
                        errors.Add($"Property '{prop.Name}' value must be between {intRange.Min} and {intRange.Max}.");
                    }
                }
            }
            return errors;
        }
    }
}
