using Contracts;
using Ordering;

var checks = 0;
void Check(bool ok, string message)
{
    if (!ok) throw new InvalidOperationException(message);
    checks++;
}
void Throws<T>(Action action) where T : Exception
{
    try { action(); }
    catch (T) { checks++; return; }
    throw new InvalidOperationException("Expected " + typeof(T).Name);
}

var id = Guid.NewGuid();
var product = Guid.NewGuid();
var order = new Order(id, "USD");
order.AddLine(product, 2, 1500);
order.AddLine(Guid.NewGuid(), 1, 3000);
var snapshot = order.Confirm();
Check(snapshot.OrderId == id && snapshot.AmountMinor == 6000 && snapshot.Currency == "USD", "Confirmed snapshot must preserve total and identity");
var draft = Billing.BillingModule.CreateDraft(snapshot);
Check(draft.OrderId == id && draft.AmountMinor == 6000 && draft.Currency == "USD", "Billing consumes the public snapshot, not Order internals");
Throws<InvalidOperationException>(() => order.AddLine(product, 1, 1));
Throws<InvalidOperationException>(() => order.Confirm());
Throws<ArgumentException>(() => new Order(Guid.Empty, "USD"));
Throws<ArgumentException>(() => new Order(Guid.NewGuid(), "BAD"));
Throws<InvalidOperationException>(() => new Order(Guid.NewGuid(), "USD").Confirm());
var invalid = new Order(Guid.NewGuid(), "USD");
Throws<ArgumentException>(() => invalid.AddLine(product, 0, 100));
Throws<ArgumentException>(() => invalid.AddLine(product, 1, 0));
Throws<ArgumentException>(() => invalid.AddLine(Guid.Empty, 1, 100));
Throws<OverflowException>(() => invalid.AddLine(product, 2, long.MaxValue));
invalid.AddLine(product, 1, 100);
Check(invalid.Confirm().AmountMinor == 100, "Rejected writes must not partially change the aggregate");
Throws<ArgumentException>(() => Billing.BillingModule.CreateDraft(new(Guid.Empty, 100, "USD")));
Throws<ArgumentException>(() => Billing.BillingModule.CreateDraft(new(Guid.NewGuid(), 0, "USD")));
Throws<ArgumentException>(() => Billing.BillingModule.CreateDraft(new(Guid.NewGuid(), 100, "BAD")));
Throws<ArgumentNullException>(() => Billing.BillingModule.CreateDraft(null!));
var vnd = new Order(Guid.NewGuid(), "VND");
vnd.AddLine(product, 1, 50000);
Check(vnd.Confirm().Currency == "VND", "Supported currency must retain its own minor-unit convention");
Console.WriteLine($"PASS: {checks} aggregate/module checks");

namespace Contracts
{
    public record OrderConfirmed(Guid OrderId, long AmountMinor, string Currency);
    public record InvoiceDraft(Guid OrderId, long AmountMinor, string Currency);
}

namespace Ordering
{
    public sealed class Order(Guid id, string currency)
    {
        private readonly Guid orderId = id != Guid.Empty ? id : throw new ArgumentException("Order ID is required");
        private readonly string currencyCode = currency is "USD" or "VND" ? currency : throw new ArgumentException("Unsupported currency");
        // shortcut: total only; model persisted lines, tax and quotes when real ordering requires them.
        private long totalMinor;
        private bool confirmed;

        public void AddLine(Guid productId, int quantity, long unitPriceMinor)
        {
            if (confirmed) throw new InvalidOperationException("Confirmed orders cannot change");
            if (productId == Guid.Empty || quantity <= 0 || unitPriceMinor <= 0)
                throw new ArgumentException("Product, positive quantity and positive price are required");
            totalMinor = checked(totalMinor + checked(unitPriceMinor * quantity));
        }

        public OrderConfirmed Confirm()
        {
            if (confirmed || totalMinor == 0) throw new InvalidOperationException("Only a non-empty draft can be confirmed");
            confirmed = true;
            return new(orderId, totalMinor, currencyCode);
        }
    }
}

namespace Billing
{
    public static class BillingModule
    {
        public static InvoiceDraft CreateDraft(OrderConfirmed message)
        {
            ArgumentNullException.ThrowIfNull(message);
            if (message.OrderId == Guid.Empty || message.AmountMinor <= 0 || message.Currency is not ("USD" or "VND"))
                throw new ArgumentException("Invalid confirmed order snapshot");
            return new(message.OrderId, message.AmountMinor, message.Currency);
        }
    }
}
