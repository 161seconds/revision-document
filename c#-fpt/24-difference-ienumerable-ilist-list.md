# DIFFERENCE IENUMERABLE, ILIST, LIST

> Tác giả: Ben Trần · Nhóm: LINQ
> Nguồn: [DIFFERENCE IENUMERABLE, ILIST, LIST](https://bentran1vn.notion.site/DIFFERENCE-IENUMERABLE-ILIST-LIST-6f093861154b498283d286d0aadad8fb) · Bản lưu: 27/10/2026

[Mục lục](README.md)

## IENUMERABLE ( INTERFACE ) AND ILIST ( INTERFACE )

#### Difference

1. Enumerable is inherited by IList means
    ⇒ IList is extended version of IEnumerable.

2. IList is used when we want to manipulation ( Điều chỉnh, tương tác, thao tác ) over collection.

3. IEnumerable is only for Readonly approach.

4. IEnumerable internally use to IEnumerator interface and having GetEnumerator method.

5. IEnumerable can not return no of elements without iteration whereas IList having extra methods e.g. add,remove,contains,count(readonly) so its easy to get no of element without iteration.

6. IEnumerable having further filter support where in IList does not.

### Similarity

1. Both are interfaces and both are part of System.Collection.

2. Both having deffered execution style. Mean query will not give result until we enumerate over data.

3. Both are good to query data from in-memory collections like List, Array etc.

4. Both executes "select query" on the server-side, loads data in-memory on the client-side and then filters the data. so beneficial for LINQ to Object and LINQ to XML queries

## IENUMERABLE ( INTERFACE ) AND LIST

#### Prepare

- **Immediate Execution**: In immediate execution, when a method like `ToList()`, `ToArray()`, or any terminal operation is called on a LINQ query or collection, memory is allocated immediately to store the result. For instance, if you have `numbers.ToList()`, memory is allocated to create a `List` containing all the elements of `numbers` at that moment.

- **Deferred Execution**: In deferred execution, operations like LINQ queries or transformations (`Where`, `Select`, etc.) don't allocate memory or execute the query right away. Instead, they create an expression or set of instructions describing the operation to be performed. Memory is not allocated for the result until the collection is enumerated. When the result is needed (usually during enumeration), memory is allocated at that time to hold the processed data.

Summary: In deferred execution, memory isn't allocated for the result until the query or operation is enumerated or explicitly triggered, while immediate execution immediately allocates memory for the result when the operation is invoked. Deferred execution helps in optimizing memory usage by delaying allocation until the actual results are needed.

#### Difference

- The main difference between IEnumerable and List in C# is that IEnumerable is an interface, while List is a concrete class. Moreover, **IEnumerable is read-only** and List is not. List represents the entire collection in memory, while IEnumerable provides an interface for getting the next item one-by-one (enumerating data).

- **IEnumerable will not execute the query until you enumerate over the data**, whereas List will execute the query as soon as it's called.

- Deferred execution makes IEnumerable faster because it only gets the data when needed.

- IEnumerable is more efficient and faster when you only need to enumerate the data once.
The List is more efficient when you need to enumerate the data multiple times because it already has all of it in memory.

- The IEnumerator interface defines how the compiler can access elements in a collection one at a time (enumerate). IEnumerable uses IEnumerator internally and is the recommended way to enumerate the contents of a collection.

- On the other hand, List uses IList, a non-generic interface, internally. IList allows for more direct manipulation of the contents of a list and is the recommended way to manipulate a list.

Example

```
static void Main()
{
// Using IEnumerable
IEnumerable<int> numbersEnumerable = GetNumbers(); // Deferred Execution
// Filtering even numbers using IEnumerable (Deferred Execution)
IEnumerable<int> evenNumbersIEnumerable = numbersEnumerable.Where(n => n % 2 == 0);
// Using List
List<int> numbersList = GetNumbers().ToList(); // Immediate execution
// Filtering even numbers using List (Immediate execution)
List<int> evenNumbersList = numbersList.Where(n => n % 2 == 0).ToList();

        Console.WriteLine("Using IEnumerable:");
foreach (var num in evenNumbersIEnumerable)
{
            Console.Write(num + " "); // Filtering happens here
}
        Console.WriteLine();

        Console.WriteLine("Using List:");
foreach (var num in evenNumbersList)
{
            Console.Write(num + " "); // Already filtered earlier
}
        Console.WriteLine();
}
static IEnumerable<int> GetNumbers()
{
// Simulated method to generate a sequence of numbers
for (int i = 1; i <= 10; i++)
{
yield return i;
}
}
```

Explain

- In this example, we have separated the use of `IEnumerable` and `List` to emphasize their behavior.

- `numbersEnumerable` and `evenNumbersIEnumerable` are using `IEnumerable`, which exhibits deferred execution.

- `numbersList` and `evenNumbersList` are using `List`, which eagerly executes operations.

- Both `IEnumerable` and `List` are used to filter even numbers from the generated sequence.

- While iterating over `evenNumbersIEnumerable` and `evenNumbersList`, the `IEnumerable` version performs the filtering on-demand, whereas the `List` version has already executed the filtering operations during its creation.

This demonstrates the difference in behavior between `IEnumerable` (deferred execution) and `List` (immediate execution) in a scenario where operations or queries are applied to the collections. The `IEnumerable` version postpones execution until enumeration, while the `List` version eagerly executes operations upon creation.

### Similarity

- Both IEnumerable and List are part of .NET's System.Collections namespace.
