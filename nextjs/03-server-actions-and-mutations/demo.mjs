// Module 03: Server Actions RPC & Optimistic UI Simulation Demo
// Mô phỏng luồng gọi Server Action và cập nhật giao diện lạc quan (Optimistic State)

/**
 * Mô phỏng Server Action thực thi trên Backend
 */
export async function serverCreateCommentAction(prevState, formData) {
  const text = formData.get("text");

  // Giả lập độ trễ mạng 60ms
  await new Promise((resolve) => setTimeout(resolve, 60));

  // Kiểm tra tính hợp lệ
  if (!text || text.trim().length < 3) {
    return {
      success: false,
      error: "Bình luận quá ngắn (tối thiểu 3 ký tự)",
      comment: null
    };
  }

  // Giả lập lưu vào cơ sở dữ liệu
  const newComment = {
    id: "comment_" + Math.floor(Math.random() * 10000),
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    error: null,
    comment: newComment
  };
}

/**
 * Mô phỏng Hook useOptimistic trong React Client
 */
export class OptimisticCommentManager {
  constructor(initialComments = []) {
    this.actualComments = [...initialComments];
    this.optimisticComments = [...initialComments];
  }

  getComments() {
    return this.optimisticComments;
  }

  async submitNewComment(text) {
    const tempId = "temp_" + Date.now();
    const optimisticItem = {
      id: tempId,
      text: text,
      isPending: true,
      createdAt: new Date().toISOString()
    };

    // 1. Cập nhật lạc quan ngay lập tức
    this.optimisticComments = [optimisticItem, ...this.actualComments];
    console.log("[Optimistic Step 1] UI hiển thị ngay lập tức với cờ isPending=true:", optimisticItem);

    // 2. Tạo FormData và gọi Server Action
    const fd = new Map();
    fd.set("text", text);
    const mockFormData = { get: (k) => fd.get(k) };

    const result = await serverCreateCommentAction(null, mockFormData);

    // 3. Phản hồi từ Server: Thành công hoặc Thất bại (Rollback)
    if (result.success) {
      this.actualComments = [result.comment, ...this.actualComments];
      this.optimisticComments = [...this.actualComments];
      console.log("[Optimistic Step 2: SUCCESS] Server đã lưu thành công:", result.comment);
    } else {
      // Rollback về trạng thái thực tế
      this.optimisticComments = [...this.actualComments];
      console.log("[Optimistic Step 2: FAILED] Rollback UI về trạng thái cũ do lỗi:", result.error);
    }

    return result;
  }
}

// Chạy demo
console.log("=== SERVER ACTION & OPTIMISTIC UI DEMO ===");
(async () => {
  const manager = new OptimisticCommentManager([
    { id: "c1", text: "Bài viết Next.js rất hay!", isPending: false }
  ]);

  console.log("Danh sách ban đầu:", manager.getComments());

  console.log("\n--- THỬ NGHIỆM 1: Gửi bình luận hợp lệ ---");
  await manager.submitNewComment("App Router và Server Actions thật tuyệt vời!");
  console.log("Danh sách sau khi cập nhật thành công:", manager.getComments());

  console.log("\n--- THỬ NGHIỆM 2: Gửi bình luận lỗi (quá ngắn để test Rollback) ---");
  await manager.submitNewComment("Ok");
  console.log("Danh sách sau khi bị rollback:", manager.getComments());
})();
