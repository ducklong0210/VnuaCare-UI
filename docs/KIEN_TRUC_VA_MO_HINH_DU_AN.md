# Kiến trúc và Mô hình phát triển hệ thống VnuaCare

Tài liệu này giải thích chi tiết, toàn diện và dễ hiểu về **Mô hình kiến trúc** mà dự án đang sử dụng, cơ chế hoạt động của từng thư mục, và luồng đi của dữ liệu từ khi người dùng bấm nút trên giao diện đến khi lưu vào Cơ sở dữ liệu.

---

## Mục lục
1. [Bức tranh toàn cảnh: Mô hình Client - Server (Ví von Nhà hàng)](#1-bức-tranh-toàn-cảnh-mô-hình-client---server-ví-von-nhà-hàng)
2. [Mô hình tổ chức Frontend: Tách biệt Nghiệp vụ và Giao diện](#2-mô-hình-tổ-chức-frontend-tách-biệt-nghiệp-vụ-và-giao-diện)
3. [Mô hình cấu trúc từng trang: Page-Centric Component](#3-mô-hình-cấu-trúc-từng-trang-page-centric-component)
4. [Luồng dữ liệu thực tế từ A đến Z (Ví dụ Thêm Cán bộ / Bác sĩ)](#4-luồng-dữ-liệu-thực-tế-từ-a-đến-z-khi-người-dùng-bấm-thao-tác)
5. [Cơ chế Xác thực và Phân quyền (JWT Bearer Token & Access Token)](#5-cơ-chế-xác-thực-và-phân-quyền-jwt-bearer-token--access-token)
6. [Các bài toán kỹ thuật và cách giải quyết trong dự án](#6-các-bài-toán-kỹ-thuật-và-cách-giải-quyết-trong-dự-án)
7. [Tóm tắt trả lời nhanh khi bảo vệ đồ án hoặc phỏng vấn](#7-tóm-tắt-trả-lời-nhanh-khi-bảo-vệ-đồ-án-hoặc-phỏng-vấn)
8. [Từ điển thuật ngữ cốt lõi (Giải thích chi tiết từ đâu ra và để làm gì)](#8-từ-điển-thuật-ngữ-cốt-lõi-giải-thích-chi-tiết-từ-đâu-ra-và-để-làm-gì)
9. [Dự án này có phải mô hình MVC không? (So sánh chi tiết MVC và React)](#9-dự-án-này-có-phải-mô-hình-mvc-không-so-sánh-chi-tiết-mvc-và-react)
10. [Chi tiết mô hình MVVM áp dụng vào VnuaCare và Từ khóa Google](#10-chi-tiết-mô-hình-mvvm-model---view---viewmodel-áp-dụng-vào-vnuacare)
11. [Module Quản lý Hồ sơ khám cán bộ (HealthCheckupRecord) - Trái tim nghiệp vụ y tế](#11-module-quản-lý-hồ-sơ-khám-cán-bộ-healthcheckuprecord---trái-tim-nghiệp-vụ-y-tế)

---

## 1. Bức tranh toàn cảnh: Mô hình Client - Server (Ví von Nhà hàng)

Toàn bộ hệ thống VnuaCare gồm 2 phần độc lập chạy song song, có thể hình dung trực quan như một **Nhà hàng ẩm thực**:

```text
┌─────────────────────────────────┐                 ┌──────────────────────────────────┐
│        FRONTEND (Client)        │   HTTP / JSON   │        BACKEND (Server API)      │
│     React 19 + Vite (SPA)       │ ──────────────> │    ASP.NET Core Web API (.NET 9) │
│                                 │ <────────────── │       Clean Architecture / CQRS  │
│  [KHU BÀN ĂN & NGƯỜI BỒI BÀN]   │  Bearer Token   │            [NHÀ BẾP]             │
│  - Người dùng bấm nút, xem form │     (JWT)       │  - Kiểm tra quyền hạn, trùng lặp │
│  - Quản lý trạng thái (State)   │                 │  - Chế biến và điều phối dữ liệu │
└─────────────────────────────────┘                 └─────────────────┬────────────────┘
                                                                      │ Entity Framework Core
                                                                      ▼
                                                            ┌───────────────────┐
                                                            │ SQL SERVER CSDL   │
                                                            │   (VnuaCareDB)    │
                                                            │ [KHO NGUYÊN LIỆU] │
                                                            └───────────────────┘
```

### Chi tiết vai trò từng bên:
- **Frontend (Client - Trình duyệt):** Giống như **khu vực bàn ăn và người bồi bàn**. Khách hàng chỉ nhìn thấy thực đơn, điền phiếu gọi món (form nhập liệu) và bấm nút. Frontend không lưu dữ liệu vĩnh viễn, mà chỉ hiển thị tạm thời lên màn hình.
- **Backend (Server API - Máy chủ C#):** Giống như **nhà bếp**. Khi nhận phiếu gọi món từ bồi bàn gửi vào qua đường truyền HTTP, nhà bếp sẽ kiểm tra tính hợp lệ (ví dụ: mã cán bộ có bị trùng không? Người này có phải Admin không?), sau đó tiến hành xử lý.
- **Database (Cơ sở dữ liệu SQL Server):** Giống như **nhà kho lưu trữ**. Nơi đây cất giữ dữ liệu vĩnh viễn vào các bảng (`vc_staffs`, `vc_doctors`, `vc_users`).
- **Nguyên tắc bất di bất dịch:** Trình duyệt của người dùng **không bao giờ được kết nối trực tiếp vào CSDL SQL Server**. Mọi việc bắt buộc phải thông qua Backend API để bảo mật dữ liệu.

### Khái niệm SPA (Single Page Application - Ứng dụng trang đơn):
- Khác với các website đời cũ mỗi lần bấm menu là trình duyệt bị chớp trắng để tải lại trang từ đầu (F5), dự án này dùng **React 19**.
- Trình duyệt chỉ tải file HTML duy nhất 1 lần đầu tiên. Khi bạn chuyển qua lại giữa các menu *Bảng điều khiển*, *Quản lý cán bộ*, *Quản lý bác sĩ*, React chỉ thay đổi phần ruột nội dung bên trong mà **không tải lại toàn bộ trang**, mang lại trải nghiệm mượt mà như một phần mềm cài trên máy tính.

---

## 2. Mô hình tổ chức Frontend: Tách biệt Nghiệp vụ và Giao diện

Trong thư mục `src/`, mã nguồn được phân thành 4 khu vực có vai trò tách biệt rõ ràng:

```text
src/
├── layouts/       (1) KHUNG NHÀ: Giữ khung sườn cố định (Header, Sidebar, Footer)
├── pages/         (2) MẶT BÀN GIAO DIỆN: Nơi đặt bảng dữ liệu, form nhập, modal xóa
├── features/      (3) PHIẾU GỌI MÓN (API): Nơi viết các hàm fetch() gửi dữ liệu lên Server
└── utils/         (4) DANH BẠ ENDPOINT: Lưu danh sách đường dẫn URL của Backend
```

### Tại sao lại chia như vậy mà không gộp vào 1 chỗ?
- **Độ độc lập cao:** Giả sử ngày mai Backend đổi đường dẫn API từ `/api/v1/doctors/add` sang `/api/v2/doctors/create`.
  - Bạn **chỉ cần sửa đúng 1 dòng** trong file `src/utils/api-router.js`.
  - Toàn bộ giao diện ở `DoctorManagerPage.jsx` và hàm ở `doctorApi.js` **không cần phải sửa một chữ nào**!
- **Dễ bảo trì:** Khi có lỗi mạng hay lỗi kết nối, bạn biết ngay cần mở thư mục `src/features/` để kiểm tra. Khi có lỗi về nút bấm, màu sắc hay ô nhập, bạn mở thư mục `src/pages/`.

---

## 3. Mô hình cấu trúc từng trang: Page-Centric Component

Đối với các trang quản lý lớn (`StaffManagerPage.jsx`, `DoctorManagerPage.jsx`, `UserManagerPage.jsx`), dự án áp dụng mô hình **Page-Centric Component (Gói gọn toàn bộ trong 1 file trang)**.

Thay vì xé nhỏ trang ra 5-6 file con (`StaffTable.jsx`, `StaffFormModal.jsx`...) khiến người mới học bị rối vì phải truyền biến `props` qua lại, toàn bộ trang được viết trong **1 file `.jsx`** kết hợp **1 file `.css`** đi kèm, đọc tuần tự từ trên xuống dưới theo 4 khối:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ KHỐI 1: KHỞI TẠO STATE (Bộ nhớ tạm của trang)                          │
│   const [staffs, setStaffs] = useState([]);                            │
│   const [formData, setFormData] = useState(INITIAL_FORM);             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ KHỐI 2: TỰ ĐỘNG NẠP DỮ LIỆU (useEffect)                               │
│   - Tự động gọi API lấy danh mục Phòng ban / Chuyên khoa khi mở trang. │
│   - Tự động gọi API tải danh sách theo từ khóa tìm kiếm & phân trang.  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ KHỐI 3: HÀM XỬ LÝ SỰ KIỆN (Handlers)                                   │
│   - handleOpenCreate(): Mở form trắng để thêm mới.                     │
│   - handleOpenEdit(): Đổ dữ liệu cũ vào form để chỉnh sửa.             │
│   - handleSubmitForm(): Gửi dữ liệu form lên API.                      │
│   - handleConfirmDelete(): Gọi API xóa hồ sơ.                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ KHỐI 4: GIAO DIỆN NGƯỜI DÙNG (JSX)                                     │
│   - Thanh tìm kiếm & bộ lọc dropdown                                   │
│   - Bảng danh sách (Table, thead, tbody, các nút icon Sửa/Xóa)        │
│   - Thanh phân trang (Trang trước/sau, chọn số dòng/trang)             │
│   - Modal Thêm / Chỉnh sửa hồ sơ                                       │
│   - Modal Xác nhận xóa hồ sơ                                           │
└────────────────────────────────────────────────────────────────────────┘
```

**Ưu điểm:** Bất kỳ ai mở file ra cũng có thể đọc hiểu luồng chạy từ đầu đến cuối như một bài văn xuôi, không phải mở hàng chục tab trình soạn thảo để nhảy qua nhảy lại.

---

## 4. Luồng dữ liệu thực tế từ A đến Z (Khi người dùng bấm thao tác)

Hãy theo dõi một ví dụ thực tế: **Người quản trị bấm nút "Thêm bác sĩ"**:

```text
[BƯỚC 1: Điền thông tin]
  Người dùng nhập: Mã BS "BS001", Họ tên "BS. Trần Văn C", Chuyên khoa, Email...
  Mỗi lần gõ 1 ký tự, sự kiện onChange cập nhật ngay vào biến state `formData`.

[BƯỚC 2: Bấm nút "Thêm bác sĩ"]
  Sự kiện onSubmit kích hoạt hàm `handleSubmitForm(e)` trong DoctorManagerPage.jsx.

[BƯỚC 3: Chuyển dữ liệu sang tầng API]
  Trang gọi hàm `createDoctorApi(formData)` nằm ở file `doctorApi.js`.

[BƯỚC 4: Đóng gói và gửi yêu cầu mạng (HTTP POST)]
  File doctorApi.js lấy Access Token từ localStorage, đóng gói thành gói tin HTTP:
    - URL: http://localhost:5173/api/v1/doctors/add
    - Method: POST
    - Header: Authorization: Bearer eyJhbGciOi... (Thẻ vé thông hành)
    - Body: { "doctorCode": "BS001", "fullName": "BS. Trần Văn C", ... }

[BƯỚC 5: Backend ASP.NET Core tiếp nhận và xử lý]
  - DoctorController.cs nhận gói tin, chuyển vào CreateDoctorCommand.cs.
  - Backend kiểm tra: Mã BS001 đã có trong CSDL chưa? Email có đúng định dạng không?
  - Nếu hợp lệ, Entity Framework Core thực thi lệnh:
    INSERT INTO vc_doctors (...) VALUES (...)

[BƯỚC 6: Backend phản hồi kết quả]
  Backend trả về mã trạng thái 200 OK kèm thông điệp: "Thêm bác sĩ thành công".

[BƯỚC 7: Frontend nhận kết quả và cập nhật màn hình]
  - DoctorManagerPage.jsx nhận kết quả thành công.
  - Hiện thông báo Toast xanh: "Thêm bác sĩ mới thành công!".
  - Tự động đóng Modal.
  - Tăng biến `refreshKey` lên 1 ➔ useEffect tự động kích hoạt tải lại danh sách mới nhất từ máy chủ về bảng.
```

---

## 5. Cơ chế Xác thực và Phân quyền (JWT Bearer Token & Access Token)

Hệ thống bảo vệ dữ liệu bằng cơ chế **JSON Web Token (JWT)**:

### 1. Khi Đăng nhập (`/api/v1/authorization/login`):
- Người dùng gửi `username` và `password` lên Server.
- Backend kiểm tra đúng mật khẩu ➔ Trả về một chuỗi mã hóa dài gọi là **`accessToken`**.
- Frontend lưu mã này vào **`localStorage`** (ngăn chứa bí mật của trình duyệt).

### 2. Khi Thực hiện thao tác (Thêm, Sửa, Xóa, Xem):
- Hàm `getAuthHeaders()` trong các file API (`staffApi.js`, `doctorApi.js`, `userApi.js`) tự động lấy token từ `localStorage` ra và gắn vào Header của mỗi gói tin gửi đi:
  ```javascript
  function getAuthHeaders() {
    const token = localStorage.getItem('accessToken'); // 👈 Lấy thẻ vé ra
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,               // 👈 Trình thẻ vé cho Server kiểm tra
    };
  }
  ```

### 3. Phân quyền vai trò (Role-based Authorization):
- Backend giải mã token để biết người gửi là ai và có quyền gì:
  - `SUPER_ADMIN`: Toàn quyền quản trị hệ thống.
  - `HEALTH_ADMIN`: Quản trị y tế (quản lý cán bộ, bác sĩ, đợt khám).
  - `STAFF`: Cán bộ xem hồ sơ khám sức khỏe của bản thân.
  - `DOCTOR`: Bác sĩ thực hiện khám và nhập kết quả khám.
- Nếu tài khoản không đủ quyền (ví dụ cán bộ thường lại bấm xóa bác sĩ), Backend trả về mã lỗi `403 Forbidden` (Bị cấm).
- Nếu token hết hạn, Backend trả về `401 Unauthorized`, Frontend tự báo lỗi: *"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"*.

---

## 6. Các bài toán kỹ thuật và cách giải quyết trong dự án

Trong quá trình xây dựng giao diện, dự án đã xử lý các bài toán kỹ thuật thực tế quan trọng:

### 1. Bài toán Avatar và lỗi tràn cột CSDL (`varchar(255)`):
- **Hiện tượng lỗi:** Khi dùng lệnh `import ảnh from '...'`, Vite tự động mã hóa ảnh thành chuỗi Base64 dài hơn 1.500 ký tự (`data:image/svg+xml,...`). CSDL SQL Server quy định cột `avatar_url` kiểu `varchar(255)`, dẫn tới lỗi: *`String or binary data would be truncated`*.
- **Cách giải quyết:** Đặt các file ảnh SVG cố định vào thư mục `public/avatars/`. Trong file dữ liệu `avatarData.js`, ta chỉ lưu đường dẫn tĩnh ngắn dạng chuỗi: `/avatars/bacsi-1.svg` (chỉ dài 21 ký tự). Cách này vừa hiển thị cực nhanh, vừa lưu vào database an toàn 100%.

### 2. Bài toán Quan hệ 1 - 1 giữa Tài khoản User và Hồ sơ Cán bộ/Bác sĩ:
- Trong CSDL, cột `user_id` trong bảng `vc_staffs` và `vc_doctors` có ràng buộc duy nhất (Unique Key Constraint). Mỗi tài khoản chỉ được gắn với đúng 1 hồ sơ.
- **Giải pháp Frontend:** Khi mở form thêm mới, dropdown danh sách User tự động kiểm tra: tài khoản nào đã được gắn với cán bộ/bác sĩ rồi sẽ bị khóa (`disabled`), ngăn chặn người dùng chọn trùng gây lỗi 400 từ máy chủ.

### 3. Tối ưu định dạng code (`.prettierrc`):
- Thiết lập cấu hình `"printWidth": 160` giúp các thẻ HTML ngắn như `<button>`, `<select>` tự động co gọn trên **1 dòng duy nhất**, tránh việc công cụ tự ý bẻ nhỏ từng thuộc tính xuống nhiều dòng gây khó đọc.

---

## 7. Tóm tắt trả lời nhanh khi bảo vệ đồ án hoặc phỏng vấn

Nếu thầy cô hoặc nhà tuyển dụng hỏi: **"Em hãy trình bày mô hình kiến trúc của dự án này?"**, bạn có thể trả lời tự tin bằng 3 ý cốt lõi:

1. **Kiến trúc tổng thể:**
   > *"Dự án được xây dựng theo mô hình **Client - Server**, gồm Frontend là **Single Page Application (SPA)** viết bằng React 19 + Vite, kết nối với Backend **ASP.NET Core Web API** qua giao thức RESTful API HTTP/JSON, xác thực bảo mật bằng **JWT Bearer Token**."*

2. **Kiến trúc tổ chức mã nguồn Frontend:**
   > *"Frontend được tổ chức theo mô hình **Feature-Based** kết hợp **Page-Centric**: Tách riêng tầng API (`src/features/`) độc lập với tầng Giao diện (`src/pages/`). Mỗi trang màn hình quản lý trọn vẹn trạng thái và giao diện của nó trong 1 file JSX và 1 file CSS riêng, giúp mã nguồn dễ hiểu, dễ kiểm soát và không phụ thuộc chéo."*

3. **Mô hình luồng dữ liệu:**
   > *"Dữ liệu trong từng trang vận hành theo **Luồng một chiều (Unidirectional Data Flow)**: Khởi tạo State ➔ useEffect gọi API kéo dữ liệu về ➔ Render giao diện ➔ Người dùng tương tác (Thêm/Sửa/Xóa) kích hoạt hàm Handler gọi API ➔ Cập nhật lại State để giao diện tự động vẽ lại."*

---

## 8. Từ điển thuật ngữ cốt lõi (Giải thích chi tiết từ đâu ra và để làm gì)

Dành cho người mới học — mỗi khi gặp một từ khóa khó hiểu, hãy tra cứu tại bảng dưới đây:

### 1. `accessToken` (Mã truy cập)
- **Nó là cái gì?** Là một chuỗi ký tự dài ngoằng được mã hóa (ví dụ: `eyJhbGciOiJIUzI1NiIsInR5cCI...`). Nó đóng vai trò như **chiếc vé vào cổng / chiếc vòng tay** ở khu du lịch.
- **Nó từ đâu sinh ra?** Sinh ra từ **Backend (máy chủ C#)** sau khi bạn nhập đúng tài khoản và mật khẩu ở trang Đăng nhập.
- **Nó dùng để làm gì?** Giúp bạn **không phải gõ lại mật khẩu mỗi lần bấm nút**. Khi bạn bấm Thêm/Sửa/Xóa, Frontend lấy chiếc vé này gắn vào gói tin gửi lên. Máy chủ nhìn thấy vé là biết bạn là ai và cho phép thực hiện.
- **Nó được cất ở đâu?** Cất trong `localStorage` của trình duyệt.

### 2. `localStorage` (Bộ nhớ cục bộ của trình duyệt)
- **Nó là cái gì?** Giống như một **ngăn kéo tủ cá nhân** nằm ngay trên trình duyệt (Chrome, Cốc Cốc, Edge) của bạn.
- **Nó từ đâu ra?** Là tính năng có sẵn của tất cả các trình duyệt web hiện nay.
- **Nó dùng để làm gì?** Để cất giữ dữ liệu nhỏ (như `accessToken`, thông tin người dùng đang đăng nhập). Dù bạn có tắt trình duyệt hoặc tắt máy tính đi bật lại, dữ liệu trong ngăn tủ này **vẫn còn nguyên** (không bị mất như biến thông thường).

### 3. `JWT` (JSON Web Token)
- **Nó là cái gì?** Là **tiêu chuẩn công nghệ** để tạo ra `accessToken`.
- **Cấu tạo của nó:** Gồm 3 phần nối nhau bằng dấu chấm: `Header.Payload.Signature`.
  - Phần thân (Payload) chứa sẵn thông tin: ID tài khoản, Tên đăng nhập, Quyền hạn (`Role: SUPER_ADMIN`).
  - Phần chữ ký (Signature) do máy chủ ký bằng chìa khóa bí mật, người dùng trên trình duyệt không thể tự ý sửa chữ ký này để mạo danh Admin được.

### 4. `Bearer Token`
- **Nó là cái gì?** Chữ `Bearer` trong tiếng Anh có nghĩa là *"Người cầm / Người mang"*. 
- **Cách dùng:** Khi gửi thẻ vé lên máy chủ, ta viết theo quy ước: `Authorization: Bearer <mã_token>`.
- **Ý nghĩa:** Câu này nói với máy chủ rằng: *"Người đang cầm chiếc vé này là người có quyền truy cập, xin hãy mở cổng!"*.

### 5. `State` (Quản lý trạng thái bằng `useState`)
- **Nó là cái gì?** Là **bộ nhớ tạm thời** của trang web khi đang mở trên màn hình.
- **Nó từ đâu ra?** Do hàm `useState(...)` của React tạo ra.
- **Cơ chế hoạt động:** Bất cứ khi nào dữ liệu trong State thay đổi (ví dụ mảng danh sách bác sĩ có thêm người mới), React sẽ **tự động vẽ lại màn hình ngay lập tức** để người dùng nhìn thấy dữ liệu mới mà không cần F5 trang.

### 6. `useEffect`
- **Nó là cái gì?** Là một hàm đặc biệt của React dùng để **chạy các công việc tự động**.
- **Nó dùng để làm gì trong dự án?** 
  - Tự động gọi API tải danh sách chuyên khoa, phòng ban ngay khi bạn vừa mở trang vào màn hình.
  - Tự động gọi lại API khi bạn gõ tìm kiếm hoặc đổi số trang phân trang.

### 7. `RESTful API` và `Endpoint`
- **RESTful API:** Là bộ quy tắc chuẩn quốc tế quy định cách phần mềm Frontend và Backend nói chuyện với nhau qua mạng Internet.
- **Endpoint (Điểm cuối):** Là **địa chỉ đường link cụ thể** để làm 1 công việc nhất định.
  - Ví dụ: 
    - `/api/v1/doctors/filter`: Địa chỉ lấy danh sách bác sĩ.
    - `/api/v1/doctors/add`: Địa chỉ nộp hồ sơ thêm bác sĩ mới.
    - `/api/v1/doctors/update`: Địa chỉ nộp thông tin sửa bác sĩ.

### 8. `CRUD`
- **Nó là cái gì?** Viết tắt của 4 thao tác nền tảng trong mọi phần mềm quản lý:
  - **C** - Create: Thêm mới (Thêm cán bộ / bác sĩ).
  - **R** - Read: Xem / Đọc danh sách (Bảng hiển thị dữ liệu).
  - **U** - Update: Cập nhật / Chỉnh sửa thông tin.
  - **D** - Delete: Xóa dữ liệu.

### 9. `Unique Constraint` (Ràng buộc duy nhất)
- **Nó là cái gì?** Là **ổ khóa bảo vệ** được cài trong Cơ sở dữ liệu SQL Server.
- **Tác dụng:** Không cho phép 2 dòng dữ liệu có cùng một giá trị.
  - Ví dụ: Cột `user_id` trong bảng cán bộ được cài Unique Constraint, nghĩa là 1 tài khoản User chỉ được phép gắn với duy nhất 1 cán bộ. Nếu cố tình tạo cán bộ thứ 2 dùng chung User đó, CSDL sẽ chặn lại ngay và báo lỗi.

### 10. `Unidirectional Data Flow` (Luồng dữ liệu một chiều)
- **Nó là cái gì?** Là nguyên lý hoạt động của React: Dữ liệu chỉ chảy theo đúng 1 chiều vòng tròn:
  `State (Bộ nhớ)` ➔ Sinh ra `Giao diện (JSX)` ➔ `Người dùng bấm nút` ➔ Gọi hàm `Handler` ➔ Cập nhật lại `State` ➔ Màn hình tự động cập nhật.
  Không bao giờ có chuyện giao diện tự ý thay đổi dữ liệu ngầm mà không thông qua State.


---

## 9. Dự án này có phải mô hình MVC không? (So sánh chi tiết MVC và React)

Đây là câu hỏi rất phổ biến khi bảo vệ đồ án hoặc đi phỏng vấn. Câu trả lời chính xác là:

> **Frontend React KHÔNG dùng mô hình MVC truyền thống, mà sử dụng mô hình Component-Based Architecture (Kiến trúc hướng thành phần) vận hành theo tư tưởng MVVM (Model - View - ViewModel).**

Hãy cùng so sánh để hiểu rõ sự khác biệt:

### 1. Mô hình MVC truyền thống là gì? (Model - View - Controller)
Mô hình này ra đời từ năm 1979 và rất phổ biến ở các hệ thống web cũ (ASP.NET MVC cũ, PHP Laravel, Java Spring):
- **Model (M):** Chứa cấu trúc dữ liệu và bảng trong CSDL.
- **View (V):** File HTML/CSS tĩnh (hoặc file `.cshtml`) hiển thị ra màn hình.
- **Controller (C):** Đứng ở giữa nhận yêu cầu từ người dùng, lấy dữ liệu từ Model rồi đổ vào View, sau đó gửi nguyên cả trang web về cho trình duyệt.
- 🔴 **Nhược điểm của MVC cũ:** Mỗi khi người dùng bấm vào một menu hay nút bấm, Controller bắt buộc phải **tải lại toàn bộ trang web từ đầu (F5 toàn trang)**, gây chớp màn hình và tốn băng thông mạng.

---

### 2. Mô hình của React: Component-Based kết hợp tư tưởng MVVM

React ra đời để thay thế sự cồng kềnh của MVC trên trình duyệt bằng cách chia nhỏ trang web thành các **Component (Thành phần độc lập)**. Trong mỗi file Component của bạn (`StaffManagerPage.jsx`, `DoctorManagerPage.jsx`), nó hoạt động theo 3 phần của tư tưởng **MVVM**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. MODEL (Dữ liệu gốc từ máy chủ)                                      │
│    - Dữ liệu do các file API (staffApi.js, doctorApi.js) kéo về từ     │
│      Backend thông qua các cuộc gọi fetch().                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Cung cấp dữ liệu
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. VIEWMODEL (Bộ não điều khiển & Quản lý trạng thái)                   │
│    - Các biến State: const [doctors, setDoctors] = useState([]);       │
│    - Các hàm xử lý sự kiện: handleOpenCreate, handleSubmitForm...      │
│    - Tự động lắng nghe thay đổi và điều khiển giao diện.               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tự động đồng bộ 2 chiều (Data Binding)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. VIEW (Giao diện hiển thị trực quan)                                 │
│    - Toàn bộ đoạn mã JSX hiển thị Bảng, Modal, Nút bấm, Ô input.       │
│    - Phản ánh trung thực trạng thái hiện tại của ViewModel.            │
└────────────────────────────────────────────────────────────────────────┘
```

#### Bảng so sánh trực quan giữa MVC và Mô hình React của bạn:

| Tiêu chí | Mô hình MVC truyền thống | Mô hình Component / MVVM (Dự án của bạn) |
|---|---|---|
| **Cơ chế tải trang** | Tải lại toàn bộ website mỗi lần bấm nút (F5 trang) | Chỉ vẽ lại đúng chỗ thay đổi, không bao giờ F5 trang (SPA) |
| **Vai trò Controller** | Controller trên máy chủ nạp trang HTML gửi về | Không cần Controller trên Frontend. Dùng **State (ViewModel)** điều khiển giao diện trực tiếp |
| **Độ mượt mà** | Chậm hơn, có độ trễ trắng màn hình | Cực kỳ nhanh và mượt mà như phần mềm cài trong máy |
| **Mức độ tách biệt** | Code giao diện và logic hay bị dính chặt với nhau | Tách riêng: API nằm ở `features/`, giao diện nằm ở `pages/` |

---

### 3. Tóm lại: Nếu thầy cô / người phỏng vấn hỏi:
- **"Frontend này có phải mô hình MVC không?"**
  - 👉 Bạn trả lời: *"Dạ không ạ. Frontend React hiện đại không dùng mô hình MVC truyền thống nữa mà sử dụng **Component-Based Architecture** kết hợp tư tưởng **MVVM**. Trong đó phần JSX đóng vai trò là **View**, các biến State và hàm xử lý đóng vai trò là **ViewModel**, còn dữ liệu từ Backend API trả về là **Model**."*
- **"Thế mô hình MVC nằm ở đâu trong dự án của em?"**
  - 👉 Bạn trả lời: *"Mô hình Controller nằm ở phía **Backend ASP.NET Core** (`DoctorController.cs`, `StaffController.cs`). Nhưng Controller này hoạt động theo kiến trúc **RESTful API**, chỉ nhận request và trả về dữ liệu thô dạng JSON chứ không render ra file View HTML truyền thống."*


---

## 10. Chi tiết mô hình MVVM (Model - View - ViewModel) áp dụng vào VnuaCare

### 1. MVVM là viết tắt của từ gì?
- **M - Model:** Dữ liệu và logic nghiệp vụ cốt lõi.
- **V - View:** Giao diện hiển thị trực quan (những gì người dùng nhìn thấy).
- **VM - ViewModel:** Cầu nối trung gian giữa View và Model, chứa trạng thái (State) và các hàm xử lý sự kiện.

Mô hình MVVM do Microsoft phát minh năm 2005 để giải quyết nhược điểm của MVC. Trong React hiện đại, mỗi trang của bạn chính là một kiến trúc MVVM thu nhỏ cực kỳ mạnh mẽ.

---

### 2. Ánh xạ trực tiếp MVVM vào từng dòng code trong `DoctorManagerPage.jsx`:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. MODEL (Tầng dữ liệu gốc & Gọi máy chủ)                              │
│    - File: src/features/doctor-manager/doctorApi.js                    │
│    - Nhiệm vụ: Chứa các hàm giao tiếp mạng fetch() lên Backend:        │
│        + getDoctorFilterApi()   -> Lấy danh sách bác sĩ từ CSDL       │
│        + createDoctorApi()      -> Gửi hồ sơ bác sĩ mới lên CSDL       │
│        + updateDoctorApi()      -> Gửi thông tin cập nhật              │
│        + deleteDoctorApi()      -> Gửi lệnh xóa                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Model cung cấp dữ liệu thô
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. VIEWMODEL (Tầng não bộ điều khiển & Quản lý trạng thái)             │
│    - Vị trí: Phần thân hàm DoctorManagerPage() từ dòng 30 đến dòng 280 │
│    - Chứa 2 thứ cốt lõi:                                               │
│        a) Các biến State (Trạng thái giao diện):                       │
│           const [doctors, setDoctors] = useState([]);                  │
│           const [formData, setFormData] = useState(INITIAL_FORM);     │
│           const [modalMode, setModalMode] = useState(null);           │
│        b) Các hàm xử lý sự kiện (Handlers):                            │
│           handleOpenCreate()  -> Chuẩn bị form trắng                   │
│           handleSubmitForm()  -> Gọi Model lưu dữ liệu                 │
│           handleConfirmDelete() -> Gọi Model xóa dữ liệu               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tự động đồng bộ dữ liệu (Data Binding)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. VIEW (Tầng giao diện người dùng nhìn thấy)                          │
│    - Vị trí: Phần return ( ... ) trong DoctorManagerPage.jsx           │
│    - File CSS: DoctorManagerPage.css                                   │
│    - Gồm các thẻ JSX:                                                  │
│        + <table className="admin-table">  -> Bảng danh sách            │
│        + <div className="modal-backdrop"> -> Hộp thoại form nhập       │
│        + <button onClick={handleOpenCreate}> -> Nút thêm bác sĩ        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Cơ chế hoạt động của MVVM trong code thực tế:

Hãy xem cơ chế **Ràng buộc dữ liệu 2 chiều (Data Binding / Controlled Component)** hoạt động giữa View và ViewModel mà không cần viết lệnh DOM thủ công (`document.getElementById`):

```jsx
<input
  type="text"
  value={formData.doctorCode}                                         // (1) Chiều từ ViewModel đổ ra View
  onChange={(e) => setFormData({ ...formData, doctorCode: e.target.value })} // (2) Chiều từ View cập nhật ngược vào ViewModel
/>
```
- **Chiều 1:** Khi ViewModel có dữ liệu `formData.doctorCode = 'BS001'`, thẻ input trên màn hình (View) lập tức hiện chữ `BS001`.
- **Chiều 2:** Khi người dùng bấm bàn phím gõ thêm chữ `A`, sự kiện `onChange` báo ngay cho ViewModel cập nhật State. 
- ➔ Hai bên luôn luôn khớp nhau 100% theo thời gian thực mà bạn không cần phải viết code can thiệp thủ công!

---

### 4. Danh sách từ khóa tra cứu Google / YouTube (Tự học & Nghiên cứu)

Dưới đây là các từ khóa chuẩn xác nhất được dịch sang tiếng Việt và tiếng Anh kèm mục đích tìm kiếm, bạn chỉ cần copy và dán lên Google hoặc YouTube:

| STT | Từ khóa tìm kiếm | Mục đích bạn sẽ hiểu được gì |
|---|---|---|
| 1 | **`Mô hình MVVM là gì`** hoặc **`MVVM pattern React`** | Hiểu cặn kẽ 3 chữ Model - View - ViewModel hoạt động ra sao và vì sao nó thay thế MVC. |
| 2 | **`Controlled component React là gì`** | Hiểu cách React dùng `value` và `onChange` để đồng bộ ô nhập với State (Data Binding). |
| 3 | **`Component based architecture React`** | Hiểu tại sao website hiện đại lại chia trang web thành các khối Component độc lập. |
| 4 | **`Unidirectional data flow React là gì`** | Hiểu luồng dữ liệu một chiều: State đổi ➔ Giao diện tự động render lại. |
| 5 | **`Single Page Application là gì`** | Hiểu tại sao website React không bị tải lại trang (chớp trắng) mỗi khi chuyển tab. |
| 6 | **`RESTful API là gì`** | Hiểu cách Frontend và Backend gửi nhận dữ liệu qua các phương thức HTTP: GET, POST, PUT, DELETE. |
| 7 | **`JWT token authentication là gì`** | Hiểu cách Access Token bảo vệ hệ thống không cho người lạ xâm nhập. |
| 8 | **`localStorage trong Javascript`** | Hiểu ngăn tủ bộ nhớ của trình duyệt dùng để cất giữ Token đăng nhập. |
| 9 | **`Clean Architecture ASP.NET Core`** | Tìm hiểu về kiến trúc của Backend C# trong dự án `VnuaCare-API`. |
| 10 | **`CQRS MediatR là gì`** | Tìm hiểu cách Backend C# chia các lệnh Thêm/Sửa/Xóa thành `Command` và xem dữ liệu thành `Query`. |

---

## 11. Module Quản lý Hồ sơ khám cán bộ (HealthCheckupRecord) - Trái tim nghiệp vụ y tế

### 1. Ý nghĩa và vai trò trung tâm của Hồ sơ khám:
Trong toàn bộ hệ thống VnuaCare, **Hồ sơ khám sức khỏe (Health Checkup Record)** là thực thể trung tâm, đóng vai trò kết nối tất cả các thành phần khác lại với nhau:
- Một **Đợt khám (Campaign)** sẽ có nhiều **Hồ sơ khám**.
- Mỗi **Hồ sơ khám** gắn liền với duy nhất một **Cán bộ (Staff)** trong đợt khám đó.
- Hồ sơ khám tổng hợp toàn bộ kết quả khám lâm sàng từ các phòng khám chuyên khoa (Nội tổng quát, Khám mắt, Răng Hàm Mặt, Tai Mũi Họng, v.v.).
- Sau khi có đầy đủ kết quả chuyên khoa, **Bác sĩ trưởng đoàn (Concluded Doctor)** sẽ ký duyệt kết luận, xếp loại sức khỏe tổng thể và đưa ra đề xuất điều trị.

```text
┌────────────────────────┐      ┌────────────────────────┐
│  Đợt khám (Campaign)   │      │     Cán bộ (Staff)     │
└───────────┬────────────┘      └───────────┬────────────┘
            │ 1                             │ 1
            │ n                             │ n
            ▼                               ▼
       ┌────────────────────────────────────────┐
       │   HỒ SƠ KHÁM SỨC KHỎE (Record)         │ ◄── Bác sĩ kết luận (Doctor)
       │   - Mã tiếp nhận / Mã vạch SID         │
       │   - Phân loại sức khỏe (Loại I - V)    │
       │   - Kết luận chung & Lời dặn           │
       │   - Trạng thái: PENDING -> COMPLETED   │
       └───────────────────┬────────────────────┘
                           │ 1
                           │ n
                           ▼
          ┌──────────────────────────────────┐
          │   Các phiếu khám chuyên khoa     │
          │ (Nội, Mắt, Tai Mũi Họng, v.v.)   │
          └──────────────────────────────────┘
```

---

### 2. Từ điển thuật ngữ trong phân hệ Hồ sơ khám:

- **Mã SID (Sample ID / Subject ID - Mã tiếp nhận / Mã vạch):**
  - **Từ đâu ra:** Sinh ra khi cán bộ đến bàn tiếp đón ban đầu của phòng khám.
  - **Để làm gì:** Đây là mã định danh duy nhất (Unique) in trên nhãn dán hoặc mã vạch barcode, dán lên sổ khám và các ống nghiệm xét nghiệm máu/nước tiểu của cán bộ để không bao giờ bị nhầm lẫn kết quả giữa người này với người khác.
  - **Ví dụ:** `SID-2025-001`.

- **Phân loại sức khỏe (Health Classification):**
  - **Từ đâu ra:** Quy định theo tiêu chuẩn khám sức khỏe định kỳ của Bộ Y tế Việt Nam.
  - **Gồm 5 bậc xếp loại:**
    - **Loại I (Rất khỏe):** Không có biểu hiện bệnh lý, thể lực xuất sắc.
    - **Loại II (Khỏe):** Đạt tiêu chuẩn, có thể có vấn đề nhỏ không ảnh hưởng công việc.
    - **Loại III (Trung bình):** Có bệnh mạn tính nhẹ hoặc cần điều chỉnh lối sống, sinh hoạt.
    - **Loại IV (Yếu):** Sức khỏe yếu, có bệnh lý cần điều trị tích cực, hạn chế lao động nặng.
    - **Loại V (Rất yếu):** Rất yếu, bệnh lý nặng cần nghỉ ngơi và điều trị chuyên sâu.

- **Trạng thái hồ sơ (Record Status):**
  - `PENDING` (Chờ khám): Hồ sơ mới lập tại bàn đón tiếp, cán bộ chưa vào các phòng khám.
  - `IN_PROGRESS` (Đang khám): Đã có một số kết quả chuyên khoa, đang đợi các phòng còn lại hoặc đợi bác sĩ kết luận.
  - `COMPLETED` (Đã kết luận / Hoàn thành): Bác sĩ trưởng đoàn đã ký duyệt kết luận tổng thể và xếp loại.
  - `CANCELLED` (Đã hủy): Hồ sơ bị hủy do cán bộ hoãn khám hoặc vắng mặt.

---

### 3. Cấu trúc mã nguồn của Module trên Frontend:

Hệ thống tuân thủ nghiêm ngặt nguyên tắc **độc lập chuyên môn**, phân tách riêng biệt các tệp API trong thư mục `src/features/profile-manager/api/`:

| Tệp tin | Vai trò theo mô hình MVVM |
|---|---|
| `src/features/profile-manager/api/recordApi.js` | **Model**: Quản lý API Hồ sơ khám tổng thể (`/api/v1/healthcheckuprecords/*` và `/api/v1/campaigns/select`). |
| `src/features/profile-manager/api/vitalSignsApi.js` | **Model**: Quản lý API Chỉ số sinh tồn & Thể lực (`/api/v1/vitalsigns/*`). |
| `src/features/profile-manager/api/internalMedicineApi.js` | **Model**: Quản lý API Khám lâm sàng Nội khoa 6 hệ cơ quan (`/api/v1/internalmedicines/*`). |
| `src/features/profile-manager/api/specialistExamApi.js` | **Model**: Quản lý API Khám chuyên khoa lẻ Mắt, TMH, Răng, Da, Ngoại, Sản (`/api/v1/specialistexams/*`). |
| `src/features/profile-manager/api/index.js` | **Model Hub**: Xuất tập trung toàn bộ các hàm API để tái sử dụng linh hoạt. |
| `src/pages/profile-manager/ProfileManagerPage.jsx` | **ViewModel + View**: Chứa State quản lý bảng danh sách, bộ lọc đa tiêu chí, modal thêm mới / cập nhật hồ sơ, phân trang dữ liệu. |
| `src/pages/profile-manager/components/RecordDetailModal.jsx` | **ViewModel + View**: Modal cha điều phối gồm Banner bệnh nhân và Thanh chuyển đổi 4 Tabs chuyên môn. |
| `src/pages/profile-manager/tabs/*.jsx` | **Views con**: Từng Tab chuyên môn độc lập ([VitalSignsTab], [InternalMedicineTab], [SpecialistExamsTab], [GeneralConclusionTab]). |

---

### 4. Chi tiết: Một người có những loại hồ sơ / phiếu khám nào trong hệ thống?

Khi một cán bộ đi khám sức khỏe, hệ thống quản lý **4 loại hồ sơ/phiếu khám độc lập** (tương ứng với 4 bảng CSDL và 4 Controller trong Backend):

```text
                               ┌──────────────────────────────────────────────┐
                               │       CÁN BỘ HỌC VIỆN (VcStaffs)             │
                               │           Ví dụ: Thầy Nguyễn Văn A           │
                               └──────────────────────┬───────────────────────┘
                                                      │ (1 người có nhiều năm đi khám)
                                                      ▼
                       ┌──────────────────────────────────────────────────────────────┐
                       │  HỒ SƠ KHÁM TỔNG HỢP THEO ĐỢT (vc_health_checkup_records)    │
                       │  - Đợt khám năm 2025 (Mã tiếp nhận: SID-2025-001)            │
                       │  - Trạng thái: PENDING -> IN_PROGRESS -> COMPLETED           │
                       │  - Kết luận chung & Xếp loại tổng thể (Loại I đến V)         │
                       └──────┬───────────────────────┬───────────────────────┬───────┘
                              │ 1-1                   │ 1-1                   │ 1-N
                              ▼                       ▼                       ▼
    ┌───────────────────────────────┐ ┌─────────────────────────────┐ ┌───────────────────────────────┐
    │ 1. PHIẾU KHÁM THỂ LỰC         │ │ 2. PHIẾU KHÁM NỘI KHOA      │ │ 3. CÁC PHIẾU CHUYÊN KHOA LẺ   │
    │    & CHỈ SỐ SINH TỒN          │ │    LÂM SÀNG TỔNG QUÁT       │ │    (vc_specialist_exams)      │
    │    (vc_vital_signs)           │ │ (vc_internal_medicine_exams)│ │                               │
    │ ───────────────────────────── │ │ ─────────────────────────── │ │ ───────────────────────────── │
    │ • Chiều cao, Cân nặng, BMI    │ │ • Tuần hoàn / Tim mạch      │ │ • Khám Mắt (Thị lực hai mắt)  │
    │ • Huyết áp tâm thu/tâm trương │ │ • Hô hấp / Khám phổi        │ │ • Tai Mũi Họng (Tai, mũi, họng│
    │ • Nhịp tim / mạch, SpO2       │ │ • Tiêu hóa / Khám bụng      │ │ • Răng Hàm Mặt (Sâu răng...)  │
    │ • Vòng bụng                   │ │ • Thận - Tiết niệu          │ │ • Da liễu, Ngoại khoa         │
    │ • Điều dưỡng / Bác sĩ đo      │ │ • Thần kinh & Cơ xương khớp │ │ • Sản phụ khoa (nếu là Nữ)    │
    │                               │ │ • Bác sĩ khám Nội kết luận  │ │ • Từng bác sĩ CK kết luận     │
    └───────────────────────────────┘ └─────────────────────────────┘ └───────────────────────────────┘
```

#### Phân tích chi tiết 4 loại hồ sơ:

1. **Hồ sơ Mẹ (Gốc): Hồ sơ khám sức khỏe tổng hợp (`vc_health_checkup_records`)**
   - **Bản chất:** Là cuốn "Sổ khám sức khỏe" ngoài đời thực.
   - **Nhiệm vụ:** Quản lý hành chính (Đợt khám, Cán bộ, Mã tiếp nhận SID), sau cùng là nơi Bác sĩ trưởng đoàn ký duyệt kết luận chung, xếp loại sức khỏe tổng thể và lưu trữ đường dẫn file PDF sổ khám.
   - **Backend Controller:** `HealthCheckupRecordController.cs` (`/api/v1/healthcheckuprecords`).

2. **Hồ sơ Con số 1: Phiếu khám thể lực & Chỉ số sinh tồn (`vc_vital_signs`)**
   - **Bản chất:** Đo đạc tại bàn tiếp đón ban đầu trước khi vào các phòng khám bệnh.
   - **Các chỉ số:** Chiều cao, cân nặng, chỉ số khối cơ thể (BMI), huyết áp tối đa / tối thiểu, nhịp tim (mạch), nhịp thở, độ bão hòa oxy trong máu (SpO2), vòng eo.
   - **Backend Controller:** `VitalSignsController.cs` (`/api/v1/vitalsigns`).

3. **Hồ sơ Con số 2: Phiếu khám lâm sàng Nội khoa tổng quát (`vc_internal_medicine_exams`)**
   - **Bản chất:** Khám tổng quát 6 cơ quan nội tạng quan trọng nhất của cơ thể.
   - **Các mục khám:** Tuần hoàn (tim mạch, tiếng tim), Hô hấp (phổi, tiếng thở), Tiêu hóa (khám bụng, gan, lách), Thận - Tiết niệu, Cơ xương khớp, Thần kinh - Tâm thần.
   - **Backend Controller:** `InternalMedicineController.cs` (`/api/v1/internalmedicines`).

4. **Hồ sơ Con số 3: Các phiếu khám Chuyên khoa lâm sàng lẻ (`vc_specialist_exams`)**
   - **Bản chất:** Mỗi bác sĩ chuyên khoa riêng biệt sẽ khám và đánh giá chuyên môn của mình:
     - **Mắt (`EYE`):** Thị lực mắt trái/phải khi không đeo kính và khi có đeo kính (ví dụ: 10/10, 8/10).
     - **Tai Mũi Họng (`ENT`):** Khám tai trái, tai phải, vách ngăn mũi, niêm mạc họng, amidan.
     - **Răng Hàm Mặt (`DENTAL`):** Khám hàm trên, hàm dưới, công thức răng sâu/mất.
     - **Da liễu (`DERMATOLOGY`):** Bệnh ngoài da, dị ứng, nấm da.
     - **Ngoại khoa (`SURGERY`):** Vận động chi, cột sống, thoát vị, trĩ.
     - **Sản phụ khoa (`OBSTETRICS`):** Khám phụ khoa định kỳ dành riêng cho cán bộ nữ.
   - **Backend Controller:** `SpecialistExamController.cs` (`/api/v1/specialistexams`).

---

### 5. Cấu trúc tách nhỏ từng Tab chuyên môn (Modular Architecture):

Để code không bị dồn ứ hàng nghìn dòng vào 1 file duy nhất, hệ thống đã tách thành các tệp độc lập, dễ quản lý và dễ học:

```text
src/pages/profile-manager/
├── ProfileManagerPage.jsx                  --> Bảng danh sách hồ sơ tổng quan (Trang chính)
├── ProfileManagerPage.css                  --> Style bảng danh sách & nút bấm
├── components/
│   ├── RecordDetailModal.jsx               --> Modal điều hướng chứa Banner cán bộ + Thanh 4 Tabs
│   └── RecordDetailModal.css               --> Style riêng cho Modal và Tabs chuyên môn
└── tabs/
    ├── VitalSignsTab.jsx                   --> [Tab 1] Khám Thể lực (Chiều cao, Cân nặng, BMI, Huyết áp)
    ├── InternalMedicineTab.jsx             --> [Tab 2] Khám Nội khoa lâm sàng 6 hệ cơ quan
    ├── SpecialistExamsTab.jsx              --> [Tab 3] Khám Chuyên khoa lẻ (Mắt, TMH, RHM, Da, Ngoại, Sản)
    └── GeneralConclusionTab.jsx            --> [Tab 4] Kết luận tổng thể & Ký duyệt xếp loại Bộ Y tế
```

#### Ưu điểm vượt trội của cách phân chia này:
1. **Dễ đọc, dễ học:** Mỗi file Tab chỉ dài khoảng 150 - 250 dòng code, tập trung giải quyết đúng 1 nghiệp vụ (ví dụ muốn học đo BMI mở `VitalSignsTab.jsx`, muốn học form thị lực Mắt mở `SpecialistExamsTab.jsx`).
2. **Không xung đột logic:** Mỗi tab quản lý state và nút Lưu độc lập, không làm ảnh hưởng đến các tab khác.
3. **Tuân thủ chuẩn React:** Sử dụng luồng dữ liệu 1 chiều (Unidirectional data flow), không gây lỗi giật màn hình (cascading renders).
