using Npgsql;

public record OrderView(Guid Id, string Status);

public sealed class OrderRepository(NpgsqlDataSource source)
{
    public async Task<bool> Create(Guid id, CancellationToken ct)
    {
        await using var command = source.CreateCommand("INSERT INTO orders (id,status) VALUES (@id,'pending')");
        command.Parameters.AddWithValue("id", id);
        try { await command.ExecuteNonQueryAsync(ct); return true; }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation && ex.ConstraintName == "pk_orders") { return false; }
    }

    public async Task<OrderView?> Get(Guid id, CancellationToken ct)
    {
        await using var command = source.CreateCommand("SELECT status FROM orders WHERE id=@id");
        command.Parameters.AddWithValue("id", id);
        var status = (string?)await command.ExecuteScalarAsync(ct);
        return status is null ? null : new OrderView(id, status);
    }

    public async Task<bool> CancelPending(Guid id, CancellationToken ct)
    {
        await using var command = source.CreateCommand("UPDATE orders SET status='cancelled' WHERE id=@id AND status='pending'");
        command.Parameters.AddWithValue("id", id);
        return await command.ExecuteNonQueryAsync(ct) == 1;
    }
}
