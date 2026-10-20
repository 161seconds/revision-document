# Nguồn PostgreSQL concurrency

Kiểm tra ngày **2026-10-20**. Tài liệu PostgreSQL cố định major **18** để tránh trộn hành vi giữa phiên bản.

- [Transaction isolation](https://www.postgresql.org/docs/18/transaction-iso.html): snapshot, anomaly, Repeatable Read và Serializable.
- [Explicit locking](https://www.postgresql.org/docs/18/explicit-locking.html): row/table lock và deadlock.
- [Monitoring statistics](https://www.postgresql.org/docs/18/monitoring-stats.html): `pg_stat_activity`, wait event và giới hạn quan sát.
- [Constraints](https://www.postgresql.org/docs/18/ddl-constraints.html): CHECK, unique, FK và exclusion constraint.
- [CREATE INDEX](https://www.postgresql.org/docs/18/sql-createindex.html): concurrent build, transaction block và failure.
- [EXPLAIN](https://www.postgresql.org/docs/18/sql-explain.html): `ANALYZE` có thực thi statement.
- [Npgsql basic usage](https://www.npgsql.org/doc/basic-usage.html): connection, command, transaction và parameter.
- [EF Core concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency): token, exception và giải quyết conflict.
- [Postgres Docker Official Image](https://hub.docker.com/_/postgres): cấu hình container và thay đổi đường dẫn lưu trữ theo major.

Code lab dùng dữ liệu/identifier do chương trình tự tạo. Các nội suy số trong script không phải mẫu để ghép input HTTP vào SQL; ứng dụng thật phải dùng parameter và allowlist identifier.
