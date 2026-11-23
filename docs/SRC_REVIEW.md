# Ghi chú rà soát `src`

**Ngày rà soát:** 18/11/2026  
**Phạm vi:** đọc source hiện có; không sửa mã nguồn. Các thay đổi được liệt kê dưới đây là đề xuất, chưa được thực hiện.

## Nhận xét chung

Ứng dụng đã vượt xa mô tả cũ trong `docs/PROJECT_STRUCTURE.md`: hiện có trang chủ, đăng nhập, dashboard, quản lý người dùng/nhân viên/bác sĩ/hồ sơ sức khỏe; có API, context xác thực và điều hướng hash. Cấu trúc đang ở giai đoạn chuyển đổi từ `features/*` sang `pages/`, `components/`, `api/`, `services/`; một số file cũ bị xóa trong working tree. Tài liệu cũ nên được cập nhật sau khi cấu trúc mới ổn định.

## Nên ưu tiên

### 1. Khóa các màn hình quản trị theo phiên đăng nhập

`src/app/AppRouter.jsx` kiểm tra `user` trước khi render trang quản trị, nhưng `src/core/contexts/AuthProvider.jsx` khôi phục `user` từ `localStorage` mà không kiểm tra token còn hiệu lực hay hỏi backend. `src/core/contexts/NavigationProvider.jsx` cũng chỉ dựa vào hash và token để chọn màn hình ban đầu. Nên xác nhận token bằng endpoint hiện có (`checkToken`/`getMe`), xử lý token hết hạn tập trung và đưa người dùng chưa xác thực về login khi truy cập hash quản trị trực tiếp. Hiện tại đây là kiểm tra trạng thái phía client, không thay thế phân quyền ở backend.

### 2. Làm rõ chính sách lưu phiên và checkbox “Duy trì đăng nhập”

`src/components/Auth/LoginForm.jsx` giữ state `remember` nhưng không dùng giá trị này khi đăng nhập. `AuthProvider` luôn lưu cả user và access token trong `localStorage`. Cần thống nhất yêu cầu phiên (có/không duy trì sau khi đóng trình duyệt), bỏ checkbox nếu không có tác dụng hoặc triển khai đúng chính sách đã chọn. Lưu bearer token trong `localStorage` làm tăng ảnh hưởng nếu trang có lỗ hổng XSS; cân nhắc cơ chế cookie `HttpOnly`/`Secure`/`SameSite` nếu backend hỗ trợ.

### 3. Sửa các đường dẫn API không khớp định nghĩa

`src/api/userApi.js` gọi `userManagerRouter.getSelect(role)`, nhưng trong `src/utils/api-router.js`, `getSelect` là chuỗi cố định `'/api/v1/users/select'`, không phải hàm. Khi gọi hàm này sẽ phát sinh lỗi runtime. Kiểm tra contract backend rồi đổi thành URL có query param đúng cách hoặc khai báo builder nhận `role`.

### 4. Chuẩn hóa xử lý HTTP ở tầng API

Các module API tự lặp `fetch`, thêm Bearer token và parse lỗi. Cách xử lý response chưa thống nhất: một số hàm parse JSON vô điều kiện (có thể lỗi với response rỗng/204), một số trả `[]` khi mọi lỗi HTTP xảy ra khiến lỗi xác thực/mạng bị hiểu như danh sách trống; thông báo 401 cũng chưa thống nhất. Nên tạo một API client chung để chuẩn hóa base URL, header, parse response, lỗi, 401 và timeout; giữ nguyên hợp đồng endpoint/body theo backend.

### 5. Không để trang quản trị chỉ được bảo vệ bằng giao diện

`AppRouter` dùng `user` để ẩn/hiện trang nhưng không thấy kiểm tra vai trò trước khi vào các phân hệ. Nếu có vai trò khác nhau (admin/bác sĩ/nhân viên), cần map role-to-page ở frontend để trải nghiệm rõ ràng và bắt buộc thực thi quyền tương ứng ở backend/API.

## Nên làm tiếp theo

### 6. Chọn một chuẩn điều hướng

`src/core/contexts/NavigationProvider.jsx` tự parse hash và giữ `activeTab`; `AppRouter.jsx` tự switch màn hình. Giải pháp này có thể dùng cho app nhỏ, nhưng cần danh sách route hợp lệ, hành vi cho hash lạ, xử lý back/forward và kiểm soát quyền nhất quán. Khi có thêm route/URL sâu, cân nhắc React Router thay vì tiếp tục mở rộng switch thủ công.

### 7. Tách page hồ sơ sức khỏe thành các phần nhỏ hơn

`src/pages/health-records/HealthRecordsPage.jsx` khoảng 891 dòng, đang phối hợp tải danh sách/danh mục, filter, phân trang, form, xóa và modal. Nên tách phần danh sách/bộ lọc, form hồ sơ và hook tải dữ liệu thành component/hook riêng; ưu tiên tách theo trách nhiệm mà không đổi nghiệp vụ một lần quá lớn.

Các file dài khác nên xem xét theo mức độ khó bảo trì: `DiagnosticReportsTab.jsx` (~612 dòng), `src/styles/admin.css` (~607), `SpecialistExamsTab.jsx` (~513), `HomePage.css` (~516), `LoginPage.css` (~454). File dài tự nó chưa chứng minh có lỗi; tách khi có phần độc lập hoặc thay đổi thường xuyên.

### 8. Đưa URL backend ra cấu hình môi trường

`src/api/*.js` lấy base URL từ `VITE_API_BASE_URL`, mặc định chuỗi rỗng; `vite.config.js` lại proxy `/api` cố định tới `https://localhost:44310`. Nên xác định rõ cách chạy local/staging/production, đưa địa chỉ proxy vào cấu hình phù hợp và cung cấp `.env.example` không chứa bí mật. `.env` hiện bị ignore, điều đó phù hợp với file cấu hình cục bộ.

### 9. Cập nhật trạng thái server và hành vi nút giao diện

Header (`src/core/layouts/components/Header.jsx`) luôn hiển thị “Đang kết nối: VNUA API” nhưng không kiểm tra kết nối. Nên đổi thành nhãn trung tính hoặc gắn với trạng thái health-check thực. Nút “Quên mật khẩu?” trong `LoginForm.jsx` hiện chưa có hành động; cần nối luồng quên/đặt lại mật khẩu hoặc thể hiện rõ tính năng chưa khả dụng.

### 10. Làm gọn cấu trúc và quy ước đặt tên sau khi chốt migration

Source hiện có các nhóm `src/api`, `src/services`, `src/components/Admin`, `src/pages` và `src/components/Auth`, trong khi tài liệu cũ còn trỏ đến `src/features`. Hãy chọn quy ước ổn định (theo feature hoặc theo layer), chuyển các file liên quan thành một đợt có kiểm tra import và cập nhật cây thư mục trong docs. Có thể cân nhắc gom component theo phạm vi dùng chung/nghiệp vụ; chưa cần di chuyển chỉ để đổi tên.

## Các điểm kỹ thuật cần xác minh

- `NavigationProvider` cho phép mọi giá trị hash trở thành `activeTab`; xác định fallback cho route không tồn tại và khi hash là `#/login` nhưng người dùng đã đăng nhập.
- `AppRouter` hiện map `activeTab === 'login'` thành `DashboardPage` nếu đã có user; xác nhận đây là hành vi mong muốn.
- `AuthProvider` parse JSON từ localStorage trực tiếp; dữ liệu hỏng có thể làm app lỗi ngay khi khởi động. Nên parse có kiểm soát và dọn phiên không hợp lệ.
- Các hàm API xây `Authorization: Bearer null` khi chưa có token; có thể tránh gửi header đó và xử lý trạng thái phiên tập trung.
- Kiểm tra backend contract cho các tên trường như `specialty`/`specialtyId`, tham số query và response rỗng; chỉ chỉnh sau khi đối chiếu API thực tế.
- `src/core/layouts/MainLayout.jsx` nhận `activeTab` nhưng Sidebar cũng đọc context; có thể giữ một nguồn dữ liệu để tránh prop dư thừa.
- Thêm accessibility cho vùng clickable không phải button/link (ví dụ logo trong `Header`), và đảm bảo modal hỗ trợ focus/keyboard nếu chưa có.

## Tài liệu và quy trình repo

- `docs/PROJECT_STRUCTURE.md` mô tả cấu trúc đăng nhập cũ, các đường dẫn `features/auth` đã không còn đúng.
- `.gitignore` bỏ qua toàn bộ `docs/`; `docs/SRC_REVIEW.md` vì vậy sẽ không hiện trong `git status` và thường không được commit. Nếu muốn lưu note này trong Git, cần cân nhắc bỏ rule `docs/` hoặc đặt tài liệu ở vị trí không bị ignore.
- `README.md` có vẻ bị lỗi mã hóa ký tự tiếng Việt khi đọc UTF-8; nên xác nhận encoding thực tế rồi lưu lại thống nhất UTF-8.

## Thứ tự gợi ý

1. Sửa lỗi gọi `getSelect(role)` và xác minh API contract.
2. Chốt luồng phiên đăng nhập, phục hồi phiên, logout và 401/token hết hạn.
3. Chốt cấu hình API cho local và production; chuẩn hóa HTTP client.
4. Xác nhận danh sách route và quyền truy cập theo vai trò.
5. Tách `HealthRecordsPage` và các tab dài theo trách nhiệm.
6. Cập nhật tài liệu cấu trúc, README và quy tắc ignore docs.

Đây là ghi chú rà soát tĩnh trên source hiện tại; chưa chạy ứng dụng và chưa xác nhận các endpoint với backend.
