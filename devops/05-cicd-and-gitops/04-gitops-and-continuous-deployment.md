# 04. GitOps & Continuous Deployment (ArgoCD)

---

## 1. Bản Đồ Liên Kết
- **Tiên quyết**: [Module 03: Deployments & Rollouts](file:///d:/my-project/revision-document/devops/03-kubernetes-core-workloads/03-deployments-replicasets-and-rollouts.md), [03. Registry & Security Scanning](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/03-container-registry-and-security-scanning.md).
- **Module hiện tại**: [Module 05: CI/CD & GitOps](file:///d:/my-project/revision-document/devops/05-cicd-and-gitops/README.md).
- **Trực thuộc**: [Master DevOps Cheat Sheet](file:///d:/my-project/revision-document/devops/summary.md).
- **Kế tiếp**: Ứng dụng thực chiến Production.

---

## 2. Bản Chất Hoạt Động (How it works under the hood)

### 2.1 Push-Based CD vs Pull-Based CD (GitOps)

```
[ PUSH-BASED CD (Mô hình truyền thống) ]
+-------------------+        kubectl apply         +--------------------+
| CI Server         | -----------------------> | Production Cluster |
| (GitHub / Jenkins)| (Cần Cluster Admin Token)|                    |
+-------------------+                          +--------------------+
* Nhược điểm: Phải cấp quyền Admin tối cao cho CI Server bên ngoài, rủi ro rò rỉ bảo mật rất lớn.

[ PULL-BASED CD / GITOPS (Mô hình hiện đại) ]
+-------------------+                          +--------------------+
| Git Repository    |                          | Production Cluster |
| (Single Source    | <------- Pull & Sync --- |  [ArgoCD Agent]    |
|  of Truth)        |  (Reconciliation Loop)   |                    |
+-------------------+                          +--------------------+
* Ưu điểm: Cluster hoàn toàn đóng cổng vào (No inbound ports), bảo mật tuyệt đối, tự động sửa lỗi trôi dạt cấu hình (Drift Detection).
```

### 2.2 Bốn Nguyên Tắc Cốt Lõi Của GitOps (OpenGitOps Standard)
1. **Declarative (Tính Khai Báo)**: Toàn bộ hệ thống (Hạ tầng, K8s manifests, cấu hình mạng) được mô tả khai báo dạng YAML/Helm.
2. **Versioned & Immutable (Lưu trữ phiên bản bất biến)**: Git là **Single Source of Truth** duy nhất. Mọi thay đổi trên Production đều phải được thực hiện thông qua Git Commit.
3. **Pulled Automatically (Tự động kéo về)**: Agent chạy bên trong Cluster chủ động kéo các thay đổi mới từ Git về.
4. **Continuously Reconciled (Liên tục đồng bộ & tự phục hồi)**: Agent liên tục so sánh trạng thái mong muốn trong Git và trạng thái thực tế trong Cluster. Nếu ai đó dùng `kubectl` sửa tay trên cluster, ArgoCD sẽ coi đó là **Drift** và tự động ghi đè lại đúng chuẩn Git!

---

## 3. Kiến Trúc Ứng Dụng ArgoCD Application CRD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: order-service-prod
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/k8s-manifests-gitops.git
    targetRevision: HEAD
    path: environments/production/order-service
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true     # Tự động xóa tài nguyên trên K8s nếu file YAML tương ứng bị xóa trong Git
      selfHeal: true  # Tự động sửa lại nếu có ai dùng kubectl can thiệp thủ công trái phép
    syncOptions:
      - CreateNamespace=true
```

---

## 4. Các Chiến Lược Triển Khai Tiên Tiến (Advanced Deployment)

### 4.1 Blue/Green Deployment
- Duy trì đồng thời 2 môi trường hoàn toàn giống nhau:
  - **Blue (Active)**: Đang phục vụ 100% traffic người dùng thật.
  - **Green (Preview)**: Chứa phiên bản mới vừa deploy, nội bộ test kiểm thử.
- Khi kiểm thử hoàn tất: Chỉ cần đổi nhãn trỏ Service từ `color: blue` sang `color: green`. Chuyển đổi diễn ra trong **1 giây**. Nếu có lỗi, switch ngược lại ngay lập tức.

### 4.2 Canary Deployment (Với Argo Rollouts)
- Đưa phiên bản mới tiếp cận dần dần một nhóm nhỏ người dùng thực:
  - **Bước 1**: Điều hướng $10\%$ traffic sang bản mới, theo dõi tỷ lệ lỗi HTTP 5xx qua Prometheus trong 10 phút.
  - **Bước 2**: Nếu tỷ lệ lỗi $< 0.1\%$, tự động tăng lên $25\% \rightarrow 50\% \rightarrow 100\%$.
  - **Bước 3**: Nếu tỷ lệ lỗi vượt ngưỡng, hệ thống **tự động hủy (Abort) và rollback về phiên bản cũ ngay tức thì** mà không cần con người can thiệp.

---

## 5. Câu Hỏi Phỏng Vấn & Tự Kiểm Tra
1. **Hiện tượng "Configuration Drift" (Trôi dạt cấu hình) trong Kubernetes là gì và GitOps giải quyết ra sao?**
   - *Trả lời*: Xảy ra khi kỹ sư can thiệp khẩn cấp bằng lệnh `kubectl edit` hoặc `kubectl apply` trực tiếp trên cluster mà không cập nhật lại vào Git. Hệ thống thực tế bị lệch khỏi tài liệu thiết kế. Với tính năng `selfHeal: true` của ArgoCD, agent trong cluster sẽ phát hiện sai lệch này trong vài giây và tự động hoàn nguyên (revert) trạng thái cluster về đúng y hệt bản ghi commit trong Git repo.
2. **Tại sao tách rời Application Source Code Repository và K8s Manifests GitOps Repository là một best practice?**
   - *Trả lời*: Tránh việc tạo ra vòng lặp vô tận (Infinite CI loop). Trong CI, khi build xong container image mới và cập nhật tag trong manifest, nếu nằm chung repo, commit cập nhật tag đó sẽ lại kích hoạt một lượt chạy CI mới. Tách riêng repo GitOps cho phép phân quyền nghiêm ngặt hơn (chỉ CI bot và Tech Lead có quyền merge vào repo hạ tầng).
3. **Thuộc tính `prune: true` trong `syncPolicy` của ArgoCD có ý nghĩa sống còn gì?**
   - *Trả lời*: Đảm bảo việc dọn dẹp tài nguyên triệt để (Garbage Collection). Khi một microservice hoặc một ConfigMap không còn sử dụng và bị xóa khỏi Git, ArgoCD sẽ tự động xóa tài nguyên tương ứng trên Cluster, ngăn chặn việc rò rỉ tài nguyên "ma" (Orphaned resources).
