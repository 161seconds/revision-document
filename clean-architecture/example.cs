using System;
using System.Collections.Generic;
using System.IO;
using CleanArchitectureDemo.Application;
using CleanArchitectureDemo.Domain;
using CleanArchitectureDemo.Infrastructure;

var passed = 0;

Check("Hủy đơn Pending và lưu kết quả", () =>
{
    var original = new Order(Guid.NewGuid(), OrderStatus.Pending);
    var repository = new InMemoryOrderRepository(original);
    var result = new CancelOrder(repository).Execute(original.Id);
    Require(result.Id == original.Id && result.Status == OrderStatus.Cancelled);
    Require(repository.Get(original.Id) == result);
    Require(original.Status == OrderStatus.Pending);
});

Check("Hủy lại đơn Cancelled giữ nguyên trạng thái", () =>
{
    var original = new Order(Guid.NewGuid(), OrderStatus.Cancelled);
    var repository = new InMemoryOrderRepository(original);
    var result = new CancelOrder(repository).Execute(original.Id);
    Require(ReferenceEquals(original, result));
});

Check("Đơn Shipped không được hủy", () =>
{
    var original = new Order(Guid.NewGuid(), OrderStatus.Shipped);
    var repository = new InMemoryOrderRepository(original);
    Expect<InvalidOperationException>(() => new CancelOrder(repository).Execute(original.Id));
    Require(repository.Get(original.Id) == original);
});

Check("Đơn không tồn tại được báo lỗi", () =>
{
    var repository = new InMemoryOrderRepository(new Order(Guid.NewGuid(), OrderStatus.Pending));
    Expect<KeyNotFoundException>(() => new CancelOrder(repository).Execute(Guid.NewGuid()));
});

Check("Use case từ chối ID rỗng", () =>
{
    var repository = new InMemoryOrderRepository(new Order(Guid.NewGuid(), OrderStatus.Pending));
    Expect<ArgumentException>(() => new CancelOrder(repository).Execute(Guid.Empty));
});

Check("Domain từ chối ID rỗng", () =>
    Expect<ArgumentException>(() => new Order(Guid.Empty, OrderStatus.Pending)));

Check("Domain từ chối trạng thái ngoài enum", () =>
    Expect<ArgumentOutOfRangeException>(() => new Order(Guid.NewGuid(), (OrderStatus)999)));

Check("Lỗi lưu không bị nuốt hoặc sửa đối tượng cũ", () =>
{
    var original = new Order(Guid.NewGuid(), OrderStatus.Pending);
    var repository = new FailingOrderRepository(original);
    Expect<IOException>(() => new CancelOrder(repository).Execute(original.Id));
    Require(repository.Get(original.Id)?.Status == OrderStatus.Pending);
});

Console.WriteLine($"PASS: {passed}/8 self-checks");

void Check(string name, Action assertion)
{
    assertion();
    passed++;
    Console.WriteLine($"PASS: {name}");
}

static void Require(bool condition)
{
    if (!condition) throw new InvalidOperationException("Self-check failed.");
}

static void Expect<T>(Action action) where T : Exception
{
    try { action(); }
    catch (T) { return; }
    throw new InvalidOperationException($"Expected {typeof(T).Name}.");
}

sealed class FailingOrderRepository(Order order) : IOrderRepository
{
    public Order? Get(Guid id) => id == order.Id ? order : null;
    public void Save(Order updated) => throw new IOException("Simulated storage failure.");
}

namespace CleanArchitectureDemo.Domain
{
    public enum OrderStatus { Pending, Shipped, Cancelled }

    public sealed record Order
    {
        public Guid Id { get; }
        public OrderStatus Status { get; }

        public Order(Guid id, OrderStatus status)
        {
            if (id == Guid.Empty) throw new ArgumentException("Order ID is required.", nameof(id));
            if (!Enum.IsDefined(status)) throw new ArgumentOutOfRangeException(nameof(status));
            Id = id;
            Status = status;
        }

        public Order Cancel() => Status switch
        {
            OrderStatus.Shipped => throw new InvalidOperationException("A shipped order cannot be cancelled."),
            OrderStatus.Cancelled => this,
            _ => new Order(Id, OrderStatus.Cancelled)
        };
    }
}

namespace CleanArchitectureDemo.Application
{
    public interface IOrderRepository
    {
        Order? Get(Guid id);
        void Save(Order order);
    }

    public sealed class CancelOrder(IOrderRepository orders)
    {
        public Order Execute(Guid id)
        {
            if (id == Guid.Empty) throw new ArgumentException("Order ID is required.", nameof(id));
            var order = orders.Get(id) ?? throw new KeyNotFoundException("Order not found.");
            var cancelled = order.Cancel();
            orders.Save(cancelled);
            return cancelled;
        }
    }
}

namespace CleanArchitectureDemo.Infrastructure
{
    // shortcut: Single-threaded in-memory demo; use a DB adapter with concurrency checks for concurrent requests.
    public sealed class InMemoryOrderRepository(Order initial) : IOrderRepository
    {
        private readonly Dictionary<Guid, Order> orders = new() { [initial.Id] = initial };

        public Order? Get(Guid id) => orders.GetValueOrDefault(id);
        public void Save(Order order) => orders[order.Id] = order;
    }
}
