public enum CancelResult { Applied, Missing, Conflict }

public sealed class OrderService(OrderRepository repository)
{
    public Task<bool> Create(Guid id, CancellationToken ct) => repository.Create(id, ct);
    public Task<OrderView?> Get(Guid id, CancellationToken ct) => repository.Get(id, ct);

    public async Task<CancelResult> Cancel(Guid id, CancellationToken ct)
    {
        if (await repository.CancelPending(id, ct)) return CancelResult.Applied;
        return await repository.Get(id, ct) is null ? CancelResult.Missing : CancelResult.Conflict;
    }
}
