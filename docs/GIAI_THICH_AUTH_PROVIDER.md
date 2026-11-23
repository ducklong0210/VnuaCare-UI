# Giải thích chi tiết từng dòng code: AuthProvider.jsx

Tài liệu này được viết riêng để giải thích cặn kẽ file `src/features/auth/context/AuthProvider.jsx` bằng ngôn ngữ lập trình mộc mạc, không dùng thuật ngữ khó hiểu hay ví dụ xa vời.

---

## 1. Bảng tra cứu thuật ngữ (Dịch sang tiếng Việt đơn giản)

Trước khi đọc code, bạn chỉ cần nắm 7 khái niệm sau:

| Thuật ngữ | Nghĩa thực tế |
|---|---|
| **`useState`** | Là công cụ của React tạo ra một **ô nhớ** để lưu dữ liệu. |
| **`user` & `setUser`** | `user` là tên ô nhớ để đọc dữ liệu. `setUser` là hàm để sửa dữ liệu trong ô nhớ đó. |
| **`re-render`** | Là hành động **vẽ lại giao diện**. Cứ mỗi khi bạn gọi `setUser(...)`, React sẽ lập tức vẽ lại màn hình theo dữ liệu mới. |
| **`children`** | Là **phần ruột bên trong**. Ví dụ: `<AuthProvider><AppRouter /></AuthProvider>` thì `<AppRouter />` chính là `children`. |
| **`localStorage`** | Là **ngăn nhớ của trình duyệt**. Dữ liệu cất vào đây sẽ không bị mất kể cả khi bạn bấm F5 hoặc tắt máy tính. |
| **`JSON.stringify`** | Đổi dữ liệu dạng Object sang dạng chuỗi chữ (text) để cất vào `localStorage`. |
| **`JSON.parse`** | Đổi chuỗi chữ từ `localStorage` ngược lại thành Object để sử dụng trong code. |
| **`null`** | Nghĩa là **rỗng / chưa có gì**. |

---

## 2. Toàn bộ code gốc của file `AuthProvider.jsx`

```jsx
1:  import { useState } from 'react'
2:  import { AuthContext } from './authContext.js'
3:  
4:  export function AuthProvider({ children }) {
5:    // Khởi tạo ô nhớ 'user'
6:    const [user, setUser] = useState(() => {
7:      const savedUser = localStorage.getItem('user')
8:      return savedUser ? JSON.parse(savedUser) : null
9:    })
10: 
11:   // Hàm xử lý khi đăng nhập đúng
12:   const login = (userData) => {
13:     setUser(userData)
14:     localStorage.setItem('user', JSON.stringify(userData))
15:     if (userData.accessToken) {
16:       localStorage.setItem('accessToken', userData.accessToken)
17:     }
18:   }
19: 
20:   // Hàm xử lý khi bấm đăng xuất
21:   const logout = () => {
22:     setUser(null)
23:     localStorage.removeItem('user')
24:     localStorage.removeItem('accessToken')
25:   }
26: 
27:   // Chia sẻ dữ liệu cho toàn bộ ứng dụng
28:   return (
29:     <AuthContext.Provider value={{ user, login, logout }}>
30:       {children}
31:     </AuthContext.Provider>
32:   )
33: }
```

---

## 3. Mổ xẻ chi tiết từng dòng code

### Đoạn 1: Khai báo Component và nhận `children` (Dòng 4)
```jsx
export function AuthProvider({ children }) {
```
* **Giải thích:** `AuthProvider` là một component cha bọc ngoài cùng.
* **`{ children }` từ đâu đến?**
  Tại file `src/App.jsx`, chúng ta viết:
  ```jsx
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
  ```
  Thẻ `<AppRouter />` nằm ở giữa, nên nó được tự động gán vào biến tên là `children`.

---

### Đoạn 2: Khởi tạo ô nhớ `user` (Dòng 6 – 9)
```javascript
const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem('user')
  return savedUser ? JSON.parse(savedUser) : null
})
```
* **Mục đích:** Tạo ra ô nhớ `user` để lưu tài khoản cán bộ đang đăng nhập.
* **Chi tiết từng câu lệnh:**
  1. `localStorage.getItem('user')`: Mở ngăn nhớ của trình duyệt ra đọc xem trước đó người dùng đã đăng nhập chưa.
  2. `savedUser ? JSON.parse(savedUser) : null`: 
     * Nếu **có** dữ liệu cũ: dịch dòng chữ đó thành object và gán vào `user` (người dùng giữ nguyên phiên đăng nhập, F5 không bị thoát).
     * Nếu **không có**: gán `user = null` (chưa đăng nhập).

---

### Đoạn 3: Hàm `login(userData)` (Dòng 12 – 18)
```javascript
const login = (userData) => {
  setUser(userData)
  localStorage.setItem('user', JSON.stringify(userData))
  if (userData.accessToken) {
    localStorage.setItem('accessToken', userData.accessToken)
  }
}
```
* **Mục đích:** Hàm này chạy khi Backend trả về kết quả đăng nhập thành công.
* **Tham số `userData`:** Là thông tin tài khoản mà Backend gửi về (gồm `fullname`, `role`, `accessToken`...).
* **Chi tiết từng câu lệnh:**
  1. `setUser(userData)`: Nạp dữ liệu mới vào ô nhớ `user`. Ngay khi ô nhớ này có dữ liệu, React sẽ tự động vẽ lại màn hình để chuyển vào trang Dashboard.
  2. `localStorage.setItem('user', ...)`: Cất một bản lưu vào trình duyệt.
  3. `localStorage.setItem('accessToken', ...)`: Cất chìa khóa token vào trình duyệt để dùng khi gọi các API sau này.

---

### Đoạn 4: Hàm `logout()` (Dòng 21 – 25)
```javascript
const logout = () => {
  setUser(null)
  localStorage.removeItem('user')
  localStorage.removeItem('accessToken')
}
```
* **Mục đích:** Hàm này chạy khi người dùng bấm nút **Đăng xuất**.
* **Chi tiết từng câu lệnh:**
  1. `setUser(null)`: Đặt ô nhớ `user` về trạng thái rỗng (`null`). Khi `user` rỗng, React tự động vẽ lại màn hình và quay về trang Đăng nhập.
  2. `localStorage.removeItem(...)`: Xóa sạch tài khoản và token khỏi trình duyệt.

---

### Đoạn 5: Truyền gói dữ liệu cho các trang con (Dòng 28 – 32)
```jsx
return (
  <AuthContext.Provider value={{ user, login, logout }}>
    {children}
  </AuthContext.Provider>
)
```
* **`value={{ user, login, logout }}`:** Đây là 3 thứ mà file này phát ra cho toàn bộ ứng dụng:
  * `user`: Biến chứa thông tin người đăng nhập.
  * `login`: Hàm để thực hiện đăng nhập.
  * `logout`: Hàm để thực hiện đăng xuất.
* **`{children}`:** Là toàn bộ trang web (AppRouter). Khi đặt `{children}` vào giữa thẻ Provider, mọi trang con bên trong đều có thể lấy 3 thứ trên ra dùng.

---

## 4. Sơ đồ các file gọi nhau trong thực tế

```text
[App.jsx]
   └── Bọc <AuthProvider> quanh toàn bộ web
            │
            ├──> [LoginForm.jsx]:
            │      Khi bấm nút đăng nhập đúng, gọi: login(data)
            │      --> Làm cho ô nhớ "user" có dữ liệu
            │
            ├──> [AppRouter.jsx]:
            │      Kiểm tra ô nhớ "user":
            │      - Nếu user == null  --> Hiện trang <LoginPage />
            │      - Nếu user != null  --> Hiện trang <DashboardPage />
            │
            └──> [Sidebar.jsx]:
                   - Đọc "user.fullname" để in tên cán bộ lên góc màn hình
                   - Gắn hàm "logout" vào nút Đăng xuất: onClick={logout}
```

