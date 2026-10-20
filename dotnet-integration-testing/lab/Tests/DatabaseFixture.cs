using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Testcontainers.PostgreSql;
using Xunit;

public sealed class DatabaseFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer database = new PostgreSqlBuilder("postgres:18")
        .WithDatabase("integration_lab").WithUsername("lab").WithPassword(Guid.NewGuid().ToString("N")).Build();
    public string ConnectionString => database.GetConnectionString();
    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await database.StartAsync();
        await using var connection = new NpgsqlConnection(ConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand("CREATE TABLE orders (id uuid CONSTRAINT pk_orders PRIMARY KEY, status text NOT NULL CHECK (status IN ('pending','cancelled','shipped')))", connection);
        await command.ExecuteNonQueryAsync();
        Factory = new LabFactory(ConnectionString);
    }

    public async Task<object?> Scalar(string sql, Guid? id = null)
    {
        await using var connection = new NpgsqlConnection(ConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        if (id.HasValue) command.Parameters.AddWithValue("id", id.Value);
        return await command.ExecuteScalarAsync();
    }

    public async Task DisposeAsync()
    {
        if (Factory is not null) await Factory.DisposeAsync();
        await database.DisposeAsync();
    }

    private sealed class LabFactory(string connectionString) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder) =>
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
                new Dictionary<string, string?> { ["ConnectionStrings:Lab"] = connectionString }));
    }
}
