# 01. Kubernetes Services & Service Discovery

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 03: Kubernetes Core Workloads](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/README.md).
- **Module hiện tại**: [Module 04: Kubernetes Networking & Storage](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: [02. Ingress & Layer 7 Routing](file:///d:/my-project/revision-document/devops/04-kubernetes-networking-and-storage/02-ingress-controllers-and-layer-7-routing.md).

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Tại Sao Cần Service? (Vấn Đề Về Địa Chỉ IP Động)
- Pod trong Kubernetes là đối tượng tạm thời (Ephemeral). Khi Pod chết hoặc được Rolling Update, Pod mới sinh ra sẽ được cấp phát một **địa chỉ IP hoàn toàn mới**.
- Nếu Frontend gọi trực tiếp IP của Backend Pod, toàn bộ hệ thống sẽ bị gãy kết nối mỗi khi có Pod khởi động lại.
- **Service** giải quyết bài toán này bằng cách cung cấp một **Địa Chỉ Ảo Tĩnh (Virtual ClusterIP)** và một **Tên Miền Ổn Định (DNS Name)**. Service hoạt động như một Load Balancer Layer 4 nội bộ.

### 2.2 Cơ Chế Service Discovery: Labels, Selectors & EndpointSlices
1. Service sử dụng `spec.selector` (vd: `app: order-api`) để tìm kiếm các Pod mang nhãn tương ứng.
2. Bộ điều khiển của K8s tự động tạo đối tượng **`EndpointSlice`** chứa danh sách IP và Port của tất cả các Pod khỏe mạnh (đã vượt qua `readinessProbe`).
3. Kube-proxy trên mỗi node lắng nghe sự kiện EndpointSlice và cập nhật các luật chuyển tiếp gói tin trong kernel (`iptables` hoặc `IPVS`).

### 2.3 Bốn Loại Service Trong Kubernetes
| Loại Service | Phạm Vi Truy Cập | Cơ Chế Hoạt Động |
| :--- | :--- | :--- |
| **`ClusterIP`** *(Mặc định)* | **Nội bộ Cluster** | Cấp phát 1 IP ảo nội bộ. Chỉ các Pod bên trong cluster mới truy cập được. |
| **`NodePort`** | **Nội bộ + Bên ngoài qua Node** | Mở một cổng tĩnh trên tất cả các Worker Nodes (dải cổng `30000-32767`). Truy cập qua `<Node-IP>:<NodePort>`. |
| **`LoadBalancer`** | **Công khai từ Internet** | Tích hợp trực tiếp với API của Cloud Provider (AWS NLB, GCP, Azure) để sinh ra một External IP công khai. Tự động bao gồm cả NodePort và ClusterIP. |
| **`ExternalName`** | **Chuyển tiếp ra bên ngoài** | Không có selector hay IP. Trả về bản ghi CNAME trỏ tới dịch vụ ngoài (vd: `my-db.rds.amazonaws.com`). |

### 2.4 Phân Giải Tên Miền CoreDNS & FQDN (Fully Qualified Domain Name)
Bên trong Cluster, K8s tích hợp sẵn **CoreDNS**. Các Pod có thể gọi Service theo các cấp độ:
- Trong cùng namespace: `http://order-service:8080`
- Khác namespace: `http://order-service.production:8080`
- Tên miền FQDN chuẩn mực:
  $$\text{<service-name>.<namespace>.svc.cluster.local}$$

---

## 3. Bẫy Kinh Điển (Common Pitfalls & Gotchas)

> [!CAUTION]
> **Bẫy 1: Sai Lệch Port vs TargetPort**
> - `port`: Cổng mà Service **lắng nghe bên ngoài** cho các service khác gọi tới.
> - `targetPort`: Cổng thực tế mà ứng dụng bên trong Container đang mở (`containerPort`).
> - Nếu khai báo nhầm hoặc container lắng nghe 8080 mà `targetPort: 80`, Service sẽ trả về lỗi `Connection Refused`.

> [!WARNING]
> **Bẫy 2: Lạm Dụng Service Kiểu `LoadBalancer` Gây Đội Chi Phí Đám Mây**
> Nếu bạn có 20 Microservices và mỗi service đều khai báo `type: LoadBalancer`, Cloud Provider (AWS/GCP) sẽ tạo 20 con Network Load Balancer độc lập, tiêu tốn hàng nghìn USD mỗi tháng.
> - **Giải pháp**: Tất cả backend chỉ dùng `ClusterIP`, chỉ dựng duy nhất 1 con Ingress Controller (Nginx/Traefik) dùng `LoadBalancer` làm cổng vào duy nhất cho toàn bộ hệ thống.

---

## 4. Manifest Mẫu Chuẩn Mực: ClusterIP Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
  namespace: production
  labels:
    app.kubernetes.io/name: order-service
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: order-service
  ports:
  - name: http
    port: 80             # Cổng nội bộ Service lắng nghe
    targetPort: 8080     # Cổng Pod container thực tế nhận traffic
    protocol: TCP
```

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **ClusterIP có phải là một địa chỉ IP thật được gắn vào card mạng vật lý nào không?**
   - *Trả lời*: Không. ClusterIP là một "Virtual IP" (IP ảo) hoàn toàn không tồn tại trên bất kỳ card mạng vật lý hay interface nào. Nó chỉ là một định danh logic được `kube-proxy` dịch thông qua bảng `iptables`/`IPVS` để redirect gói tin tới địa chỉ IP thật của Pod. Do đó, bạn không thể ping được ClusterIP bằng lệnh `ping` (ICMP bị drop).
2. **Khi một Pod bị fail `readinessProbe`, điều gì xảy ra với Service?**
   - *Trả lời*: Địa chỉ IP của Pod đó lập tức bị gỡ bỏ khỏi danh sách `EndpointSlice` của Service. Service sẽ ngừng định tuyến mọi traffic mới tới Pod đó cho đến khi probe thành công trở lại.
3. **FQDN của một Service tên là `payment` nằm trong namespace `staging` là gì?**
   - *Trả lời*: `payment.staging.svc.cluster.local`.
