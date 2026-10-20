using System.Net;
using System.Net.Http.Json;
using Npgsql;
using Xunit;

public sealed class OrderTests(DatabaseFixture fixture) : IClassFixture<DatabaseFixture>, IAsyncLifetime
{
    private readonly HttpClient client = fixture.Factory.CreateClient(new() { AllowAutoRedirect = false });
    public async Task InitializeAsync() => await fixture.Scalar("TRUNCATE orders");
    public Task DisposeAsync() { client.Dispose(); return Task.CompletedTask; }

    [Fact]
    public async Task Post_creates_persisted_order()
    {
        var id = Guid.NewGuid();
        using var response = await client.PostAsJsonAsync("/api/v1/orders", new { id });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.EndsWith(id.ToString(), response.Headers.Location!.ToString());
        Assert.Equal("pending", await fixture.Scalar("SELECT status FROM orders WHERE id=@id", id));
    }

    [Fact]
    public async Task Get_missing_returns_problem_details()
    {
        using var response = await client.GetAsync($"/api/v1/orders/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Empty_id_is_rejected_without_inserting()
    {
        using var response = await client.PostAsJsonAsync("/api/v1/orders", new { id = Guid.Empty });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0L, await fixture.Scalar("SELECT count(*) FROM orders"));
    }

    [Fact]
    public async Task Duplicate_id_returns_conflict()
    {
        var id = Guid.NewGuid();
        using var first = await client.PostAsJsonAsync("/api/v1/orders", new { id });
        using var second = await client.PostAsJsonAsync("/api/v1/orders", new { id });
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        Assert.Equal(1L, await fixture.Scalar("SELECT count(*) FROM orders"));
    }

    [Fact]
    public async Task Cancelling_twice_preserves_the_first_transition()
    {
        var id = Guid.NewGuid();
        using var created = await client.PostAsJsonAsync("/api/v1/orders", new { id });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        using var first = await client.PostAsync($"/api/v1/orders/{id}/cancel", null);
        using var second = await client.PostAsync($"/api/v1/orders/{id}/cancel", null);
        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        Assert.Equal("cancelled", await fixture.Scalar("SELECT status FROM orders WHERE id=@id", id));
    }

    [Fact]
    public async Task Parallel_cancellation_has_one_winner()
    {
        var id = Guid.NewGuid();
        using var created = await client.PostAsJsonAsync("/api/v1/orders", new { id });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var responses = await Task.WhenAll(client.PostAsync($"/api/v1/orders/{id}/cancel", null), client.PostAsync($"/api/v1/orders/{id}/cancel", null));
        try
        {
            Assert.Single(responses, r => r.StatusCode == HttpStatusCode.NoContent);
            Assert.Single(responses, r => r.StatusCode == HttpStatusCode.Conflict);
            Assert.Equal("cancelled", await fixture.Scalar("SELECT status FROM orders WHERE id=@id", id));
        }
        finally { foreach (var response in responses) response.Dispose(); }
    }

    [Fact]
    public async Task Rolled_back_database_write_is_not_visible_to_api()
    {
        var id = Guid.NewGuid();
        await using (var connection = new NpgsqlConnection(fixture.ConnectionString))
        {
            await connection.OpenAsync();
            await using var transaction = await connection.BeginTransactionAsync();
            await using var command = new NpgsqlCommand("INSERT INTO orders VALUES (@id,'pending')", connection, transaction);
            command.Parameters.AddWithValue("id", id);
            await command.ExecuteNonQueryAsync();
            await transaction.RollbackAsync();
        }
        using var response = await client.GetAsync($"/api/v1/orders/{id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(0L, await fixture.Scalar("SELECT count(*) FROM orders"));
    }

    [Fact]
    public async Task Shipped_order_cannot_be_cancelled()
    {
        var id = Guid.NewGuid();
        await fixture.Scalar("INSERT INTO orders VALUES (@id,'shipped')", id);
        using var response = await client.PostAsync($"/api/v1/orders/{id}/cancel", null);
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("shipped", await fixture.Scalar("SELECT status FROM orders WHERE id=@id", id));
    }

    [Fact]
    public async Task Each_test_starts_with_an_empty_database() => Assert.Equal(0L, await fixture.Scalar("SELECT count(*) FROM orders"));
}
