#:package Npgsql@10.0.3

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Npgsql;

var settings = new NpgsqlConnectionStringBuilder(Environment.GetEnvironmentVariable("PG_LAB_CONNECTION") ??
    "Host=127.0.0.1;Port=55432;Database=revision_lab;Username=lab;Password=lab-local-only");
if (settings.Host is not ("localhost" or "127.0.0.1") || settings.Port != 55432 || settings.Database != "revision_lab")
    throw new InvalidOperationException("Only the local revision_lab database on port 55432 is allowed.");
settings.Timeout = 5;
settings.CommandTimeout = 10;
var schema = "payments_" + Guid.NewGuid().ToString("N");
await using var admin = new NpgsqlConnection(settings.ConnectionString);
await admin.OpenAsync();
await Exec(admin, $"CREATE SCHEMA {schema}");
var checks = 0;
try
{
    settings.SearchPath = schema;
    await using var data = NpgsqlDataSource.Create(settings.ConnectionString);
    await using var connection = await data.OpenConnectionAsync();
    await Exec(connection, """
        CREATE TABLE orders (id uuid PRIMARY KEY, amount_minor bigint NOT NULL CHECK(amount_minor>0), currency text NOT NULL CHECK(currency='USD'), status text NOT NULL CHECK(status IN ('pending','paid')));
        CREATE TABLE payments (provider text NOT NULL, reference text NOT NULL, order_id uuid NOT NULL UNIQUE REFERENCES orders, PRIMARY KEY(provider,reference));
        CREATE TABLE inbox (provider text NOT NULL, event_id text NOT NULL, fingerprint bytea NOT NULL, PRIMARY KEY(provider,event_id));
        CREATE TABLE outbox (id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES orders, event_type text NOT NULL, dispatched_at timestamptz, UNIQUE(order_id,event_type));
        CREATE TABLE consumed_messages (id uuid PRIMARY KEY, order_id uuid NOT NULL);
        CREATE TABLE fulfilments (order_id uuid PRIMARY KEY, message_id uuid NOT NULL UNIQUE);
        """);
    var orderId = Guid.NewGuid();
    var otherOrder = Guid.NewGuid();
    await Exec(connection, "INSERT INTO orders VALUES (@id,6000,'USD','pending'),(@other,6000,'USD','pending'); INSERT INTO payments VALUES ('fake','pay_demo',@id),('fake','pay_other',@other)", ("id", orderId), ("other", otherOrder));
    var secret = RandomNumberGenerator.GetBytes(32);
    var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    var message = new PaymentEvent("evt_1", "pay_demo", orderId, 6000, "USD", "payment.succeeded");
    var raw = JsonSerializer.SerializeToUtf8Bytes(message, PaymentJsonContext.Default.PaymentEvent);
    var signature = Sign(raw, now);
    var tampered = raw.ToArray();
    tampered[^2] ^= 1;
    await Throws<UnauthorizedAccessException>(() => Receive(tampered, now, signature));
    await Throws<UnauthorizedAccessException>(() => Receive(raw, now, new byte[1]));
    await Throws<ArgumentException>(() => Receive(new byte[65537], now, signature));
    await Throws<UnauthorizedAccessException>(() => Receive(raw, now - 301, Sign(raw, now - 301)));
    await Throws<UnauthorizedAccessException>(() => Receive(raw, now + 301, Sign(raw, now + 301)));
    var malformed = Encoding.UTF8.GetBytes("{");
    await Throws<JsonException>(() => Receive(malformed, now, Sign(malformed, now)));
    await Throws<ArgumentException>(() => Send(message with { AmountMinor = 0 }));
    await Throws<ArgumentException>(() => Send(message with { Currency = "EUR" }));
    await Throws<ArgumentException>(() => Send(message with { EventId = "" }));
    await Throws<ArgumentException>(() => Send(message with { Kind = "payment.refunded" }));
    await Throws<InvalidOperationException>(() => Send(message with { AmountMinor = 6001 }));
    await Throws<InvalidOperationException>(() => Send(message with { Reference = "unknown" }));
    await Throws<InvalidOperationException>(() => Send(message with { OrderId = Guid.NewGuid() }));
    await Throws<InvalidOperationException>(() => Receive(raw, now, signature, failBeforeCommit: true));
    Check((string)(await Scalar(connection, "SELECT status FROM orders WHERE id=@id", ("id", orderId)))! == "pending" && (long)(await Scalar(connection, "SELECT count(*) FROM inbox"))! == 0 && (long)(await Scalar(connection, "SELECT count(*) FROM outbox"))! == 0, "Failure before commit must roll back order, inbox and outbox");
    var results = await Task.WhenAll(Send(message), Send(message with { EventId = "evt_2" }));
    Check(results.Count(x => x == "applied") == 1 && results.Count(x => x == "already-paid") == 1, "Concurrent distinct events must create one business transition");
    Check(await Send(message) == "duplicate", "Exact event replay must be deduplicated");
    var pretty = Encoding.UTF8.GetBytes("\n ").Concat(raw).ToArray();
    Check(await Receive(pretty, now, Sign(pretty, now)) == "duplicate", "Equivalent signed JSON must have the same semantic fingerprint");
    await Throws<InvalidOperationException>(() => Send(message with { Reference = "pay_other", OrderId = otherOrder }));
    Check((string)(await Scalar(connection, "SELECT status FROM orders WHERE id=@id", ("id", otherOrder)))! == "pending", "Conflicting event ID must not pay another order");
    Check((long)(await Scalar(connection, "SELECT count(*) FROM inbox"))! == 2 && (long)(await Scalar(connection, "SELECT count(*) FROM outbox"))! == 1, "Two valid event IDs must yield one outbox message");
    var outboxId = (Guid)(await Scalar(connection, "SELECT id FROM outbox WHERE dispatched_at IS NULL"))!;
    Check(await Deliver(outboxId, orderId), "First consumer delivery must apply the effect");
    // Simulate a publisher crash here: consumer committed, producer checkpoint not written.
    Check((long)(await Scalar(connection, "SELECT count(*) FROM outbox WHERE dispatched_at IS NULL"))! == 1, "Unacknowledged outbox row must remain recoverable");
    Check(!await Deliver(outboxId, orderId), "Delivery after restart must be deduplicated");
    await Throws<InvalidOperationException>(() => Deliver(outboxId, otherOrder));
    await Throws<ArgumentException>(() => Deliver(Guid.Empty, orderId));
    Check((long)(await Scalar(connection, "SELECT count(*) FROM fulfilments"))! == 1, "Replay must not repeat the business effect");
    await Exec(connection, "UPDATE outbox SET dispatched_at=now() WHERE id=@id", ("id", outboxId));
    Check((long)(await Scalar(connection, "SELECT count(*) FROM outbox WHERE dispatched_at IS NULL"))! == 0, "Mark sent only after consumer completion");
    Console.WriteLine($"PASS: {checks} payment/inbox/outbox checks");

    byte[] Sign(byte[] body, long timestamp) => HMACSHA256.HashData(secret, Encoding.UTF8.GetBytes(timestamp.ToString(System.Globalization.CultureInfo.InvariantCulture) + ".").Concat(body).ToArray());
    Task<string> Send(PaymentEvent body)
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(body, PaymentJsonContext.Default.PaymentEvent);
        return Receive(bytes, now, Sign(bytes, now));
    }
    async Task<string> Receive(byte[] body, long timestamp, byte[] suppliedSignature, bool failBeforeCommit = false)
    {
        ArgumentNullException.ThrowIfNull(body);
        if (body.Length > 65536) throw new ArgumentException("Body exceeds the lab limit");
        if (timestamp < now - 300 || timestamp > now + 300 || suppliedSignature is null || suppliedSignature.Length != 32 ||
            !CryptographicOperations.FixedTimeEquals(Sign(body, timestamp), suppliedSignature))
            throw new UnauthorizedAccessException("Invalid signature or timestamp");
        var input = JsonSerializer.Deserialize(body, PaymentJsonContext.Default.PaymentEvent) ?? throw new JsonException("Missing event");
        bool Identifier(string? value) => value is { Length: >= 1 and <= 128 } && value.All(c => char.IsAsciiLetterOrDigit(c) || c is '_' or '-');
        if (!Identifier(input.EventId) || !Identifier(input.Reference) || input.OrderId == Guid.Empty || input.AmountMinor <= 0 || input.Currency != "USD" || input.Kind != "payment.succeeded")
            throw new ArgumentException("Invalid payment event");
        var fingerprint = SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(input, PaymentJsonContext.Default.PaymentEvent));
        await using var c = await data.OpenConnectionAsync();
        await using var transaction = await c.BeginTransactionAsync();
        string state;
        await using (var command = Command(c, "SELECT o.amount_minor,o.currency,o.status FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.provider='fake' AND p.reference=@reference AND o.id=@id FOR UPDATE OF o", [("reference", input.Reference), ("id", input.OrderId)]))
        await using (var reader = await command.ExecuteReaderAsync())
        {
            if (!await reader.ReadAsync() || reader.GetInt64(0) != input.AmountMinor || reader.GetString(1) != input.Currency)
                throw new InvalidOperationException("Payment reference, amount or currency mismatch");
            state = reader.GetString(2);
        }
        var inserted = await Scalar(c, "INSERT INTO inbox VALUES ('fake',@event,@fingerprint) ON CONFLICT DO NOTHING RETURNING event_id", ("event", input.EventId), ("fingerprint", fingerprint));
        if (inserted is null)
        {
            var saved = (byte[])(await Scalar(c, "SELECT fingerprint FROM inbox WHERE provider='fake' AND event_id=@event", ("event", input.EventId)))!;
            if (!saved.SequenceEqual(fingerprint)) throw new InvalidOperationException("Event ID reused with different financial fields");
            await transaction.CommitAsync();
            return "duplicate";
        }
        if (state == "paid")
        {
            await transaction.CommitAsync();
            return "already-paid";
        }
        if (await Exec(c, "UPDATE orders SET status='paid' WHERE id=@id AND status='pending'", ("id", input.OrderId)) != 1)
            throw new InvalidOperationException("Unexpected payment transition");
        await Exec(c, "INSERT INTO outbox(id,order_id,event_type) VALUES (@message,@id,'order.paid')", ("message", Guid.NewGuid()), ("id", input.OrderId));
        if (failBeforeCommit) throw new InvalidOperationException("Simulated failure before commit");
        await transaction.CommitAsync();
        return "applied";
    }

    async Task<bool> Deliver(Guid messageId, Guid targetOrder)
    {
        if (messageId == Guid.Empty || targetOrder == Guid.Empty) throw new ArgumentException("Message and order IDs are required");
        await using var c = await data.OpenConnectionAsync();
        await using var transaction = await c.BeginTransactionAsync();
        var inserted = await Scalar(c, "INSERT INTO consumed_messages VALUES (@message,@order) ON CONFLICT DO NOTHING RETURNING id", ("message", messageId), ("order", targetOrder));
        if (inserted is null)
        {
            if ((Guid)(await Scalar(c, "SELECT order_id FROM consumed_messages WHERE id=@message", ("message", messageId)))! != targetOrder)
                throw new InvalidOperationException("Message ID reused with a different order");
            await transaction.CommitAsync();
            return false;
        }
        await Exec(c, "INSERT INTO fulfilments VALUES (@order,@message)", ("order", targetOrder), ("message", messageId));
        await transaction.CommitAsync();
        return true;
    }
}
finally
{
    // The identifier is generated here, never interpolated from a request.
    await Exec(admin, $"DROP SCHEMA {schema} CASCADE");
}

void Check(bool ok, string message)
{
    if (!ok) throw new InvalidOperationException(message);
    checks++;
}
async Task Throws<T>(Func<Task> action) where T : Exception
{
    try { await action(); }
    catch (T) { checks++; return; }
    throw new InvalidOperationException("Expected " + typeof(T).Name);
}
static NpgsqlCommand Command(NpgsqlConnection connection, string sql, (string Name, object Value)[] parameters)
{
    var command = new NpgsqlCommand(sql, connection);
    foreach (var (name, value) in parameters) command.Parameters.AddWithValue(name, value);
    return command;
}
static async Task<int> Exec(NpgsqlConnection connection, string sql, params (string Name, object Value)[] parameters)
{
    await using var command = Command(connection, sql, parameters);
    return await command.ExecuteNonQueryAsync();
}
static async Task<object?> Scalar(NpgsqlConnection connection, string sql, params (string Name, object Value)[] parameters)
{
    await using var command = Command(connection, sql, parameters);
    return await command.ExecuteScalarAsync();
}
record PaymentEvent(string EventId, string Reference, Guid OrderId, long AmountMinor, string Currency, string Kind);

[JsonSerializable(typeof(PaymentEvent))]
partial class PaymentJsonContext : JsonSerializerContext { }
