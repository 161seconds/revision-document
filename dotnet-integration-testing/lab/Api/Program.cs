var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
var app = builder.Build();
app.UseExceptionHandler();
app.MapPost("/api/v1/orders", (CreateOrder input) => Results.Created($"/api/v1/orders/{input.Id}", new { input.Id, Status = "pending" }));
app.MapGet("/api/v1/orders/{id:guid}", (Guid id) => Results.Problem(statusCode: 404));
app.MapPost("/api/v1/orders/{id:guid}/cancel", (Guid id) => Results.Problem(statusCode: 404));
app.Run();

public record CreateOrder(Guid Id);
public partial class Program { }
