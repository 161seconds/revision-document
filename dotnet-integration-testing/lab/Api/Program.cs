using Npgsql;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddSingleton(sp => NpgsqlDataSource.Create(sp.GetRequiredService<IConfiguration>().GetConnectionString("Lab")
    ?? throw new InvalidOperationException("ConnectionStrings:Lab is required; run through the test fixture.")));
builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<OrderService>();
var app = builder.Build();
app.UseExceptionHandler();
// shortcut: isolated test API without authentication; add resource authorization before serving real users.
app.MapPost("/api/v1/orders", async (CreateOrder input, OrderService service, CancellationToken ct) =>
{
    if (input.Id == Guid.Empty) return Problem(400, "ID is required");
    return await service.Create(input.Id, ct)
        ? Results.Created($"/api/v1/orders/{input.Id}", new OrderView(input.Id, "pending"))
        : Problem(409, "Order already exists");
});
app.MapGet("/api/v1/orders/{id:guid}", async (Guid id, OrderService service, CancellationToken ct) =>
{
    if (id == Guid.Empty) return Problem(400, "ID is required");
    var order = await service.Get(id, ct);
    return order is null ? Problem(404, "Order not found") : Results.Ok(order);
});
app.MapPost("/api/v1/orders/{id:guid}/cancel", async (Guid id, OrderService service, CancellationToken ct) =>
{
    if (id == Guid.Empty) return Problem(400, "ID is required");
    return await service.Cancel(id, ct) switch
    {
        CancelResult.Applied => Results.NoContent(),
        CancelResult.Missing => Problem(404, "Order not found"),
        _ => Problem(409, "Order is not pending")
    };
});
app.Run();

static IResult Problem(int status, string title) => Results.Problem(statusCode: status, title: title, type: $"urn:revision-document:problem:status-{status}");
public record CreateOrder(Guid Id);
public partial class Program { }
