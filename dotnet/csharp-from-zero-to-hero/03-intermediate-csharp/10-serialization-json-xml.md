# Bài 10: Tuần Tự Hóa Dữ Liệu: JSON & XML (Serialization)

> **Trọng tâm bài học:** Tuần tự hóa (Serialization: Object -> Stream/String) và Giải tuần tự hóa (Deserialization: Stream/String -> Object), so sánh `System.Text.Json` vs `Newtonsoft.Json`, định cấu hình Converter, và bẫy vòng lặp tham chiếu (Circular Reference).

---

## 1. Tuần Tự Hóa Là Gì?

- **Serialization (Tuần tự hóa):** Là quá trình chuyển đổi trạng thái của một đối tượng C# trong RAM thành một định dạng có thể lưu trữ được trên đĩa (File) hoặc truyền qua mạng Internet (JSON, XML, Protocol Buffers, Binary).
- **Deserialization (Giải tuần tự hóa):** Là quá trình ngược lại: đọc chuỗi định dạng văn bản/nhị phân và tái tạo lại đối tượng C# trên bộ nhớ Heap.

---

## 2. Làm Việc Với `System.Text.Json` Trong .NET Hiện Đại

`System.Text.Json` là thư viện tích hợp sẵn của Microsoft, được tối ưu hóa bằng `Span<T>` và `Utf8JsonReader/Writer`, mang lại tốc độ vượt trội và tiêu tốn cực ít bộ nhớ RAM so với Newtonsoft.

```csharp
using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class Student
{
    [JsonPropertyName("full_name")] // Đổi tên thuộc tính trong JSON
    public string Name { get; set; }

    [JsonPropertyName("age")]
    public int Age { get; set; }

    [JsonIgnore] // Không serialize trường nhạy cảm này ra JSON
    public string SecretPassword { get; set; }
}

public class SerializationDemo
{
    public static void Run()
    {
        var student = new Student
        {
            Name = "Almantas",
            Age = 25,
            SecretPassword = "SuperSecretPassword123"
        };

        // 1. Serialize C# Object -> JSON String
        var options = new JsonSerializerOptions { WriteIndented = true };
        string jsonString = JsonSerializer.Serialize(student, options);
        Console.WriteLine("JSON Output:\n" + jsonString);

        // 2. Deserialize JSON String -> C# Object
        Student deserialized = JsonSerializer.Deserialize<Student>(jsonString);
        Console.WriteLine($"Đã phục hồi sinh viên: {deserialized.Name}, Tuổi: {deserialized.Age}");
    }
}
```

---

## 3. Bẫy Vòng Lặp Tham Chiếu (Circular Reference)

Khi Object A tham chiếu tới Object B, và Object B lại tham chiếu ngược lại Object A (ví dụ: `Order` chứa `Customer`, và `Customer` lại chứa danh sách `Orders`):
- Serializer sẽ bị rơi vào vòng lặp vô tận cho đến khi văng ngoại lệ `JsonException: A possible object cycle was detected`.

### Giải pháp:
Cấu hình bỏ qua hoặc bảo toàn tham chiếu (Reference Handler):
```csharp
var options = new JsonSerializerOptions
{
    ReferenceHandler = ReferenceHandler.IgnoreCycles // Bỏ qua chu trình lặp
};
```
