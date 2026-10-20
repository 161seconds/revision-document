# Nguồn DDD và modular monolith

Kiểm tra ngày **2026-10-20**. Bài viết là tổng hợp tiếng Việt; không sao chép sách hoặc source template vào lab.

- [Martin Fowler: Bounded Context](https://martinfowler.com/bliki/BoundedContext.html): mô hình và ngôn ngữ theo context.
- [Microsoft: Designing a DDD-oriented microservice](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice): aggregate, domain model và layering; nguyên tắc không bắt buộc chọn microservice.
- [Microsoft: Domain model layer validations](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-model-layer-validations): invariant, validation và lỗi.
- [Kamil Grzybek: Modular Monolith, a Primer](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer): modularity, cohesion và coupling.
- [modular-monolith-with-ddd, commit tham khảo](https://github.com/kgrzybek/modular-monolith-with-ddd/tree/91c8ef24b4cb6ef558c95d8267fa07d68c7059f8): ví dụ lớn để đối chiếu, không phải template bắt buộc.
- [Jimmy Bogard: Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/): tổ chức theo use case và giảm coupling theo chiều ngang.
- [Martin Fowler: CQRS](https://martinfowler.com/bliki/CQRS.html): phạm vi và trade-off, tránh áp dụng toàn hệ thống máy móc.
- [Nguồn Clean Architecture của kho](../clean-architecture/sources.md): đối chiếu Dependency Rule, Hexagonal và các repo mẫu.

Lab là ví dụ độc lập của kho; không đại diện cho đầy đủ pattern hoặc integration guarantee của repo tham khảo.
