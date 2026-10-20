using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;

var selfTest = args.Contains("--self-test");
var builder = WebApplication.CreateBuilder(args.Where(a => a != "--self-test").ToArray());
builder.Services.AddProblemDetails();
if (selfTest) builder.WebHost.UseUrls("http://127.0.0.1:0");
var app = builder.Build();
app.UseExceptionHandler();

app.MapGet("/api/v1/orders", () => Results.Json(new { items = Array.Empty<Order>(), nextCursor = (int?)null }));

if (!selfTest)
{
    await app.RunAsync();
    return;
}

await app.StartAsync();
try
{
    var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();
    using var client = new HttpClient { BaseAddress = new Uri(address) };
    var checks = 0;
    void Check(bool ok, string reason)
    {
        if (!ok) throw new InvalidOperationException(reason);
        checks++;
    }
    async Task<JsonElement> Get(string query)
    {
        using var response = await client.GetAsync("/api/v1/orders" + query);
        Check(response.StatusCode == HttpStatusCode.OK, "Successful query must return 200");
        return await response.Content.ReadFromJsonAsync<JsonElement>();
    }
    var first = await Get("?limit=2");
    Check(first.GetProperty("items").EnumerateArray().Select(x => x.GetProperty("id").GetInt32()).SequenceEqual(new[] { 1, 2 }), "First page must contain IDs 1 and 2");
    Check(first.GetProperty("nextCursor").GetInt32() == 2, "Cursor must identify last returned item");
    var second = await Get("?limit=2&after=2");
    Check(second.GetProperty("items").EnumerateArray().Select(x => x.GetProperty("id").GetInt32()).SequenceEqual(new[] { 3, 4 }), "Next page must not repeat IDs");
    var last = await Get("?after=4");
    Check(last.GetProperty("items").GetArrayLength() == 1 && last.GetProperty("nextCursor").ValueKind == JsonValueKind.Null, "Final page must have no next cursor");
    var filtered = await Get("?status=shipped");
    Check(filtered.GetProperty("items").GetArrayLength() == 1 && filtered.GetProperty("items")[0].GetProperty("id").GetInt32() == 3, "Status filter must apply before pagination");
    var empty = await Get("?after=99");
    Check(empty.GetProperty("items").GetArrayLength() == 0 && empty.GetProperty("nextCursor").ValueKind == JsonValueKind.Null, "Empty page is 200 with an empty array");
    foreach (var query in new[] { "?limit=0", "?limit=101", "?limit=no", "?limit=", "?after=-1", "?after=2147483648", "?status=unknown", "?limit=1&limit=2", "?after=1&after=2", "?status=pending&status=shipped" })
    {
        using var response = await client.GetAsync("/api/v1/orders" + query);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Check(response.StatusCode == HttpStatusCode.BadRequest && response.Content.Headers.ContentType?.MediaType == "application/problem+json" && problem.GetProperty("status").GetInt32() == 400 && problem.GetProperty("type").GetString() == "urn:revision-document:problem:invalid-query", "Invalid query must use the documented Problem Details contract: " + query);
    }
    Console.WriteLine($"PASS: {checks} HTTP contract checks");
}
finally
{
    await app.StopAsync();
    await app.DisposeAsync();
}

record Order(int Id, string Status);
