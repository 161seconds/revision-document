# 02. Context API & Composition

Chia sẻ dữ liệu toàn cục với Context API, Provider Pattern, giải pháp xóa sổ Prop Drilling và kỹ thuật tối ưu hóa tái kết xuất (Re-render Optimization).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết:** [useReducer & Complex State](file:///d:/my-project/revision-document/react/03-state-management-and-context/01-usereducer-and-complex-state.md)
- **Tiếp theo:** [Custom Hooks & Reusability](file:///d:/my-project/revision-document/react/03-state-management-and-context/03-custom-hooks-and-reusability.md)
- **Tổng hợp:** [React Master Cheat Sheet](file:///d:/my-project/revision-document/react/summary.md)

---

## 2. Bản Chất Hoạt Động & Cơ Chế Sâu (Under the Hood)

### 2.1 Vấn Đề Prop Drilling
Khi một dữ liệu cần được dùng bởi một component nằm sâu dưới đáy cây (ví dụ `UserAvatar` nằm sâu 6 tầng bên trong `App -> Layout -> Header -> Nav -> Menu -> UserAvatar`), việc phải truyền prop `user` qua tất cả các tầng trung gian không hề sử dụng nó được gọi là **Prop Drilling**.
Prop Drilling khiến code bị gắn kết chặt (tight coupling), khó tái cấu trúc và dễ gây nhầm lẫn.

### 2.2 Context API: Cơ Chế Phát Sóng (Broadcasting Mechanism)
Context API cho phép component cha "phát sóng" (broadcast) dữ liệu xuống toàn bộ cây con bên dưới mà không cần qua props trung gian:
1. `createContext(defaultValue)`: Tạo một Context Object.
2. `<MyContext.Provider value={data}>`: Bọc lấy cây component cần nhận dữ liệu.
3. `useContext(MyContext)`: Bất kỳ component con nào gọi hook này sẽ tự động đọc giá trị gần nhất từ Provider cha của nó.

```
       [ThemeContext.Provider value="dark"]
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
       [Sidebar]             [Content]
           │                     │
           ▼                     ▼
      [NavLinks]            [Article]
                                 │
                                 ▼
                     [useContext(ThemeContext)] ──> "dark"
```

---

## 3. Bẫy Kinh Điển (Common Pitfalls)

### Bẫy 1: Re-render toàn bộ Consumer khi Context Value thay đổi
Nếu bạn truyền một đối tượng literal trực tiếp vào `value`:
```jsx
// ❌ NGUY HIỂM: Mỗi lần App render, object { user, theme } có địa chỉ ô nhớ mới!
<AppContext.Provider value={{ user, theme }}>
    <DeepChildren />
</AppContext.Provider>
```
Bất kỳ khi nào `theme` thay đổi, những component chỉ quan tâm tới `user` **vẫn bị re-render** theo vì toàn bộ object context value đã thay đổi tham chiếu!

**Giải pháp:**
1. Chia nhỏ Context: Tách thành `ThemeContext` và `UserContext` độc lập.
2. Dùng `useMemo` để ghi nhớ giá trị Context:
   ```jsx
   const contextValue = useMemo(() => ({ user, theme }), [user, theme]);
   <AppContext.Provider value={contextValue}>
   ```

### Bẫy 2: Dùng Context cho dữ liệu tần suất cao (High-frequency updates)
Context API không được thiết kế cho dữ liệu thay đổi liên tục hàng chục lần mỗi giây (như tọa độ con trỏ chuột, animations, audio streaming). Với dữ liệu tần suất cao, hãy sử dụng các thư viện External Store như Zustand hoặc Jotai.

---

## 4. Code Thực Hành (Production Patterns)

```jsx
// Pattern: Custom Provider đóng gói hoàn chỉnh với Custom Hook bảo vệ
import React, { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = (userData) => setUser(userData);
    const logout = () => setUser(null);

    const value = useMemo(() => ({
        user,
        isAuthenticated: user !== null,
        login,
        logout
    }), [user]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook bảo vệ: Bắt lỗi ngay nếu dùng ngoài Provider
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
```

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Câu hỏi:** `React.memo` có thể ngăn chặn một component tiêu thụ Context (`useContext`) khỏi việc re-render khi Context Value thay đổi không?
   - *Trả lời:* **Hoàn toàn KHÔNG**. `React.memo` chỉ có tác dụng ngăn chặn re-render khi `props` của component không đổi. Nếu component đó có gọi `useContext(MyContext)`, thì mỗi khi `value` của Provider thay đổi, React sẽ bỏ qua `React.memo` và **luôn luôn re-render** component đó để bảo đảm giao diện phản ánh đúng trạng thái mới nhất của Context.

2. **Câu hỏi:** Kỹ thuật Component Composition (Thành phần hóa) có thể giải quyết Prop Drilling mà không cần dùng Context API như thế nào?
   - *Trả lời:* Bằng cách truyền trực tiếp các React Element đã được tạo sẵn qua `props.children` hoặc các prop chứa phần tử (Slot Pattern: `header={<UserAvatar user={user} />}`). Bằng cách này, component con được khởi tạo ngay tại component cha có dữ liệu, và các component trung gian chỉ đóng vai trò chứa chỗ trống (`children`), hoàn toàn không cần biết hay nhận các prop của con.
