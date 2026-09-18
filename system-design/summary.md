# System Design & Distributed Systems: Master Cheat Sheet

A comprehensive reference for architecting high-scale, fault-tolerant, distributed enterprise architectures.

---

## 1. System Availability & SLA Mathematics

Availability is measured in "nines". Calculation: $\text{Availability} = \frac{\text{Uptime}}{\text{Uptime} + \text{Downtime}} \times 100\%$

| Availability Level | Annual Downtime | Daily Downtime | Target Tier |
| :--- | :--- | :--- | :--- |
| **99% (Two Nines)** | 3.65 days | 14.4 minutes | Internal tools, batch jobs |
| **99.9% (Three Nines)** | 8.76 hours | 86.4 seconds | Standard SaaS apps |
| **99.99% (Four Nines)** | 52.6 minutes | 8.64 seconds | High-availability e-commerce, banking |
| **99.999% (Five Nines)** | 5.26 minutes | 864 milliseconds | Mission-critical financial infrastructure, telecom |

### System Availability Formulas
- **Components in Series** (any failure drops system): $A_{\text{total}} = A_1 \times A_2 \times \dots \times A_n$
- **Components in Parallel** (redundancy, fails only if all fail): $A_{\text{total}} = 1 - (1 - A_1) \times (1 - A_2) \dots \times (1 - A_n)$

---

## 2. Theoretical Foundations: CAP & PACELC

### 2.1 CAP Theorem (Eric Brewer)
In an asynchronous network subject to partitions ($P$), a distributed system can guarantee at most **two** out of three properties:
- **Consistency ($C$)**: Every read receives the most recent write or an error.
- **Availability ($A$)**: Every non-failing node returns a non-error response (without guarantee of latest data).
- **Partition Tolerance ($P$)**: System continues operating despite arbitrary dropped or delayed network packets.

> [!IMPORTANT]
> Since network partitions ($P$) are inevitable in physical distributed networks, architects must choose between **CP** (Consistency + Partition Tolerance) or **AP** (Availability + Partition Tolerance). **CA** does not exist in distributed systems.

### 2.2 PACELC Theorem (Daniel Abadi)
Expands CAP to normal (non-partition) operation:
$$\text{If } \mathbf{P} \text{ (Partition): } [\mathbf{A} \lor \mathbf{C}] \quad \text{ELSE: } [\mathbf{L} \text{ (Latency)} \lor \mathbf{C} \text{ (Consistency)}]$$

| System | Classification | Behavior Under Partition ($P$) | Behavior Normal ($E$) |
| :--- | :--- | :--- | :--- |
| **MongoDB / HBase** | **PC/EC** | Chooses Consistency (rejects writes) | Sacrifices Latency for Strong Consistency |
| **Cassandra / DynamoDB** | **PA/EL** | Chooses Availability (returns stale data) | Sacrifices Consistency for Low Latency |
| **RDBMS (PostgreSQL/MySQL)** | **PC/EC** | Primary fails -> rejects writes | Enforces ACID guarantees |
| **Amazon S3** | **PA/EC** | High availability | Strongly consistent reads after writes |

---

## 3. Load Balancing & Consistent Hashing

### 3.1 Load Balancing Algorithms
1. **Round Robin / Weighted Round Robin**: Sequential distribution based on node capacity weights.
2. **Least Connections / Weighted Least Connections**: Routes to server with lowest active connection count.
3. **IP Hash**: Maps client IP to a specific backend server (session affinity).
4. **Least Response Time**: Evaluates node TTFB (Time to First Byte) + active connections.

### 3.2 Consistent Hashing Ring
Solves the $O(N)$ cache rehash problem when scaling nodes ($k \pmod N$ causes $100\%$ cache miss when $N$ changes).
- Hashes both servers and keys onto a circular $2^{32}-1$ integer ring.
- Keys are assigned to the first server found moving clockwise.
- **Virtual Nodes (vnodes)**: Allocates $100-300$ virtual replicas per physical server around the ring to prevent hash hotspots and balance distribution.
- Adding or removing a server relocates only $K/N$ keys on average.

---

## 4. Caching Topologies & Invalidation Strategies

### 4.1 Caching Patterns
- **Cache-Aside (Lazy Loading)**: App checks cache $\rightarrow$ on miss, reads DB $\rightarrow$ writes back to cache. (Resilient, but prone to stale data).
- **Read-Through**: App queries cache directly; cache library transparently fetches from DB on miss.
- **Write-Through**: App writes to cache; cache synchronously writes to DB before returning success. (High latency, guaranteed consistency).
- **Write-Behind (Write-Back)**: App writes to cache; cache asynchronously batches updates to DB. (Ultra-fast writes, risk of data loss on crash).

### 4.2 Cache Anomalies & Defenses

| Anomaly | Root Cause | Defense Strategy |
| :--- | :--- | :--- |
| **Cache Stampede (Thundering Herd)** | High-concurrency key expires; 10,000 requests hit DB simultaneously. | Mutex locking (`SETNX`), Probabilistic Early Expiration (XFetch algorithm). |
| **Cache Penetration** | Malicious queries for non-existent IDs bypass cache and hammer DB. | **Bloom Filters** at edge; Cache empty/null results with short TTL (60s). |
| **Cache Breakdown** | Single heavily accessed "hot" key expires. | Background refresh worker; Mutex lock on cache miss. |
| **Cache Avalanche** | Millions of keys expire simultaneously at midnight. | Add **Random Jitter** to TTL (e.g. `base_ttl + rand(0, 300)`). |

---

## 5. Storage Sharding & Replication

### 5.1 Sharding Strategies
1. **Range-Based Sharding**: Partitions by contiguous keys (e.g. IDs 1-1M on Shard A). Vulnerable to write hotspots on sequential IDs.
2. **Hash-Based Sharding**: Partitions by `hash(key) % total_shards`. Uniform distribution, but resharding is expensive.
3. **Directory-Based Sharding**: Central lookup service routes queries. High flexibility, but directory is a single point of failure (SPOF).

### 5.2 Replication Quorum Mathematics (Dynamo)
Given:
- $N$ = Replication factor (total replica nodes)
- $R$ = Read quorum (nodes that must acknowledge a read)
- $W$ = Write quorum (nodes that must acknowledge a write)

$$\text{Strong Consistency Guaranteed if: } \mathbf{R + W > N}$$
- Example: $N = 3, W = 2, R = 2 \implies R + W = 4 > 3$ (Guaranteed overlap of at least 1 up-to-date node).
- If $R + W \le N$: System is **Eventually Consistent** (risk of reading stale data).

---

## 6. Distributed Transactions & Consensus

### 6.1 Two-Phase Commit (2PC)
- **Phase 1 (Prepare)**: Coordinator asks all participants: "Can you commit?". Nodes vote YES/NO and lock resources.
- **Phase 2 (Commit)**: If all vote YES, Coordinator sends COMMIT. If any votes NO, Coordinator sends ROLLBACK.
- *Flaw*: Synchronous, blocking locks; if coordinator crashes during commit phase, participants remain locked indefinitely.

### 6.2 Saga Pattern
Breaks a distributed transaction into a sequence of local transactions:
- **Orchestration**: Central orchestrator (State Machine / AWS Step Functions) invokes services and triggers compensating transactions on failure.
- **Choreography**: Services publish domain events; downstream services listen and react. No central coordinator.
- **Compensating Transactions**: Explicit rollback business logic (e.g., `refundPayment()`, `cancelReservation()`).

---

## 7. Message Queues & Event Streaming (Kafka vs RabbitMQ)

| Dimension | RabbitMQ (Message Queue) | Apache Kafka (Distributed Log) |
| :--- | :--- | :--- |
| **Architecture** | Smart broker, dumb consumer | Dumb broker, smart consumer |
| **Storage Model** | Ephemeral: messages deleted once consumed/ACKed | Persistent append-only commit log retained on disk |
| **Message Ordering** | FIFO per queue (lost if competing consumers) | Strictly ordered **per partition** |
| **Throughput** | 10k - 50k msgs/sec | 1M+ msgs/sec |
| **Routing** | Complex exchange routing (Direct, Fanout, Topic) | Key-based partition routing |
| **Replayability** | No (unless DLQ re-queued) | Yes (consumers move offset pointer freely) |

---

## 8. Rate Limiting Algorithms

1. **Token Bucket**: Tokens added to bucket at fixed rate $r$ up to capacity $b$. Requests consume 1 token. Allows controlled bursts up to $b$.
2. **Leaky Bucket**: Requests enter FIFO queue; processed at constant fixed leak rate. Smooths bursts into uniform flow.
3. **Fixed Window Counter**: Divides time into 1-minute blocks. Vulnerable to $2\times$ burst traffic at window boundaries.
4. **Sliding Window Log**: Stores timestamp of every request in Redis Sorted Set (`ZREMRANGEBYSCORE`). Exact precision, high memory consumption.
5. **Sliding Window Counter**: Hybrid algorithm approximating sliding window using weighted average of previous and current window counters. High efficiency, low memory footprint.

---

## 9. Core Architectural Numbers Every Architect Must Know

| Operation | Latency | Real-World Equivalent |
| :--- | :--- | :--- |
| **L1 cache reference** | 0.5 ns | 1 heart beat |
| **L2 cache reference** | 7 ns | 14 heart beats |
| **RAM access** | 100 ns | 3.3 minutes |
| **NVMe SSD random read** | 10 - 20 $\mu$s | 4.6 hours |
| **Read 1 MB sequentially from memory** | 3 $\mu$s | 1 hour |
| **Round trip in same datacenter** | 0.5 ms | 5.8 days |
| **Send 1 MB over 1 Gbps network** | 10 ms | 3.8 months |
| **Read 1 MB sequentially from SSD** | 1 ms | 11.6 days |
| **HDD seek time** | 10 ms | 3.8 months |
| **Round trip packet: CA to Netherlands** | 150 ms | 4.8 years |
