#:package Npgsql@9.0.4

using System.Data;
using System.Diagnostics;
using Npgsql;

var settings = new NpgsqlConnectionStringBuilder(Environment.GetEnvironmentVariable("PG_LAB_CONNECTION") ??
    "Host=127.0.0.1;Port=55432;Database=revision_lab;Username=lab;Password=lab-local-only;Timeout=5;Command Timeout=10");
if (settings.Host is not ("127.0.0.1" or "localhost") || settings.Database != "revision_lab" || settings.Port != 55432)
    throw new InvalidOperationException("This lab only accepts the local revision_lab database on port 55432.");
settings.Timeout = 5;
settings.CommandTimeout = 10;

var schema = "concurrency_" + Guid.NewGuid().ToString("N");
await using var admin = new NpgsqlConnection(settings.ConnectionString);
await admin.OpenAsync();
await Execute(admin, $"CREATE SCHEMA {schema}");
var checks = 0;
try
{
    settings.SearchPath = schema;
    await using var a = new NpgsqlConnection(settings.ConnectionString);
    await using var b = new NpgsqlConnection(settings.ConnectionString);
    await a.OpenAsync();
    await b.OpenAsync();
    await Execute(a, "CREATE TABLE orders (id int PRIMARY KEY, status text NOT NULL CHECK (status IN ('pending','cancelled','shipped')), version int NOT NULL DEFAULT 0); INSERT INTO orders VALUES (1,'pending',0)");

    var readA = await Scalar(a, "SELECT status FROM orders WHERE id=1");
    var readB = await Scalar(b, "SELECT status FROM orders WHERE id=1");
    await Execute(a, "UPDATE orders SET status='cancelled' WHERE id=1");
    await Execute(b, "UPDATE orders SET status='shipped' WHERE id=1");
    Check((string)readA! == "pending" && (string)readB! == "pending" && (string)(await Scalar(a, "SELECT status FROM orders WHERE id=1"))! == "shipped", "Unsafe stale write must demonstrate the overwritten transition");
    Console.WriteLine("UNSAFE: both readers saw pending; the second write overwrote cancellation.");

    await Reset(a);
    var versionA = (int)(await Scalar(a, "SELECT version FROM orders WHERE id=1"))!;
    var versionB = (int)(await Scalar(b, "SELECT version FROM orders WHERE id=1"))!;
    var first = await Execute(a, $"UPDATE orders SET status='cancelled', version=version+1 WHERE id=1 AND version={versionA}");
    var second = await Execute(b, $"UPDATE orders SET status='shipped', version=version+1 WHERE id=1 AND version={versionB}");
    Check(first == 1 && second == 0, "Compare-and-swap must reject the stale writer");
    Check((string)(await Scalar(a, "SELECT status FROM orders WHERE id=1"))! == "cancelled", "Optimistic concurrency must preserve the winner");

    await Reset(a);
    await using (var tx = await a.BeginTransactionAsync(IsolationLevel.ReadCommitted))
    {
        await Scalar(a, "SELECT status FROM orders WHERE id=1 FOR UPDATE");
        var waiting = Execute(b, "UPDATE orders SET status='shipped' WHERE id=1 AND status='pending'");
        var timer = Stopwatch.StartNew();
        bool blocked;
        do
        {
            blocked = (bool)(await Scalar(admin, $"SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE pid={b.ProcessID} AND wait_event_type='Lock')"))!;
            if (!blocked) await Task.Delay(10);
        } while (!blocked && timer.Elapsed < TimeSpan.FromSeconds(5) && !waiting.IsCompleted);
        Check(blocked, "Observe the real lock wait before releasing the winner");
        await Execute(a, "UPDATE orders SET status='cancelled' WHERE id=1");
        await tx.CommitAsync();
        Check(await waiting == 0, "Waiting conditional UPDATE must re-check pending after lock release");
    }
    Check((string)(await Scalar(a, "SELECT status FROM orders WHERE id=1"))! == "cancelled", "Locking path must preserve cancellation");

    await Reset(a);
    await using (var txA = await a.BeginTransactionAsync(IsolationLevel.Serializable))
    await using (var txB = await b.BeginTransactionAsync(IsolationLevel.Serializable))
    {
        await Scalar(a, "SELECT status FROM orders WHERE id=1");
        await Scalar(b, "SELECT status FROM orders WHERE id=1");
        await Execute(a, "UPDATE orders SET status='cancelled' WHERE id=1");
        await txA.CommitAsync();
        var rejected = false;
        try { await Execute(b, "UPDATE orders SET status='shipped' WHERE id=1"); }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.SerializationFailure) { rejected = true; }
        await txB.RollbackAsync();
        Check(rejected, "Pinned serializable snapshots must reject the stale writer with 40001");
    }
    Check((string)(await Scalar(a, "SELECT status FROM orders WHERE id=1"))! == "cancelled", "Serialization failure must not overwrite the winner");

    await using (var tx = await a.BeginTransactionAsync())
    {
        await Execute(a, "UPDATE orders SET status='shipped' WHERE id=1");
        await tx.RollbackAsync();
    }
    Check((string)(await Scalar(a, "SELECT status FROM orders WHERE id=1"))! == "cancelled", "Rollback must undo the write");
    Console.WriteLine($"PASS: {checks} PostgreSQL checks");
}
finally
{
    // The identifier is generated here, never taken from user input.
    await Execute(admin, $"DROP SCHEMA {schema} CASCADE");
}

void Check(bool ok, string message)
{
    if (!ok) throw new InvalidOperationException(message);
    checks++;
}
static Task<int> Reset(NpgsqlConnection c) => Execute(c, "UPDATE orders SET status='pending', version=0 WHERE id=1");
static async Task<int> Execute(NpgsqlConnection c, string sql)
{
    await using var command = new NpgsqlCommand(sql, c);
    return await command.ExecuteNonQueryAsync();
}
static async Task<object?> Scalar(NpgsqlConnection c, string sql)
{
    await using var command = new NpgsqlCommand(sql, c);
    return await command.ExecuteScalarAsync();
}
