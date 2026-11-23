# Cấu trúc dự án VnuaCare UI

Tài liệu này mô tả cấu trúc thư mục và vai trò của từng file trong phiên bản giao diện đăng nhập hiện tại.

## Tổng quan kiến trúc

## FE web là gì?

FE (Frontend) web là phần ứng dụng chạy trên trình duyệt và tạo ra những gì người dùng nhìn thấy, chẳng hạn trang đăng nhập, ô nhập thông tin và các nút bấm. Có thể hiểu FE như phần quầy giao dịch mà người dùng trực tiếp thao tác; backend là hệ thống phía sau xử lý dữ liệu và nghiệp vụ.

Trong dự án này, FE hiện đang dựng giao diện đăng nhập và xử lý một số tương tác ngay trên trang. **Đăng nhập chưa được xác thực thật**: form chưa gửi thông tin tới backend, chưa kiểm tra tài khoản và chưa tạo phiên đăng nhập.

### Luồng hiển thị giao diện

```text
index.html
  -> src/main.jsx                 Khởi động React
  -> src/App.jsx                   Gọi ứng dụng chính
  -> src/app/AppRouter.jsx         Chọn màn hình cần hiển thị
  -> src/pages/auth/LoginPage.jsx  Ghép các phần thành trang đăng nhập
  -> src/features/auth/components/ Các phần chức năng đăng nhập
```

Nói ngắn gọn: `LoginPage` là cả màn hình đăng nhập; `LoginForm` là khu vực nhập thông tin; `LoginVisual` là phần giới thiệu bên cạnh. Các thư mục `api`, `hooks` hoặc `context` chỉ cần thêm khi dự án thật sự có nhu cầu gọi backend, dùng lại logic hoặc chia sẻ trạng thái.

Dự án sử dụng React 19, Vite và CSS thủ công. Cấu trúc được tổ chức theo hướng Component-Based Architecture:

- `app`: Khởi tạo và điều phối ứng dụng ở cấp cao.
- `pages`: Ghép nhiều component thành các màn hình hoàn chỉnh.
- `features`: Nhóm component theo nghiệp vụ, ví dụ phần đăng nhập.
- `components`: Không gian dành cho component dùng chung.
- `docs`: Tài liệu phân tích và hướng dẫn của dự án.

Phiên bản hiện tại chỉ làm giao diện. Dự án chưa có API client, backend, authentication provider, custom hook, React Router hoặc trạng thái đăng nhập toàn cục.

## Cây thư mục hiện tại và vai trò từng phần

```text
VnuaCare-UI/
├── docs/                              # Tài liệu cấu trúc và cách phát triển
│   └── PROJECT_STRUCTURE.md           # Tài liệu đang đọc
├── public/                            # Tài nguyên tĩnh được phục vụ trực tiếp
│   ├── favicon.svg                    # Biểu tượng trên tab trình duyệt
│   └── icons.svg                      # Tập hợp icon SVG
├── src/
│   ├── app/                           # Khởi tạo và điều phối ứng dụng
│   │   └── AppRouter.jsx              # Chọn page cần hiển thị
│   ├── features/                      # Mã được nhóm theo nghiệp vụ
│   │   └── auth/                      # Nghiệp vụ đăng nhập/xác thực
│   │       └── components/
│   │           ├── LoginForm.jsx      # Các trường và thao tác của form
│   │           └── LoginVisual.jsx    # Nội dung giới thiệu bên trái
│   ├── pages/                         # Các màn hình hoàn chỉnh
│   │   └── auth/
│   │       ├── LoginPage.jsx          # Ghép form và phần giới thiệu
│   │       └── LoginPage.css          # Giao diện riêng của trang đăng nhập
│   ├── App.jsx                        # Component gốc của React
│   ├── index.css                      # CSS nền tảng dùng toàn ứng dụng
│   └── main.jsx                       # Điểm khởi động, mount React vào HTML
├── index.html                         # HTML chứa phần tử root
├── package.json                       # Scripts và danh sách thư viện
├── package-lock.json                  # Khóa phiên bản thư viện
├── vite.config.js                     # Cấu hình công cụ Vite
├── eslint.config.js                   # Cấu hình kiểm tra mã
└── README.md                          # Hướng dẫn chạy nhanh dự án
```

Đọc cây thư mục từ trên xuống: `main.jsx` khởi động ứng dụng, `App.jsx` gọi `AppRouter`, router chọn `LoginPage`, rồi page ghép `LoginVisual` và `LoginForm`. CSS toàn cục nằm trong `index.css`, còn CSS riêng trang đăng nhập nằm cạnh page trong `pages/auth`.

## Các thư mục và file ở thư mục gốc

| File hoặc thư mục | Vai trò |
|---|---|
| `index.html` | HTML gốc duy nhất, chứa thẻ `<div id="root">` để React render ứng dụng vào. |
| `package.json` | Khai báo script chạy, build, lint và các thư viện React. |
| `package-lock.json` | Khóa phiên bản các dependency để cài đặt nhất quán. |
| `vite.config.js` | Cấu hình plugin React cho Vite. Hiện không cấu hình proxy hoặc backend. |
| `eslint.config.js` | Quy tắc kiểm tra lỗi JavaScript và JSX. |
| `README.md` | Hướng dẫn tổng quan và các lệnh chạy dự án. |
| `public/` | Tài sản tĩnh được server phục vụ trực tiếp như favicon và icon. |
| `src/` | Toàn bộ mã nguồn React và CSS của ứng dụng. |
| `docs/` | Tài liệu phân tích, thiết kế và hướng dẫn sử dụng dự án. |

## Phân tích thư mục `src`

### `src/main.jsx`

Đây là điểm khởi động của ứng dụng React.

- Import `StrictMode`.
- Import `createRoot` từ `react-dom/client`.
- Import CSS toàn cục `index.css`.
- Import component gốc `App`.
- Render `<App />` vào phần tử có `id="root"` trong `index.html`.

`StrictMode` giúp React phát hiện một số lỗi ở môi trường phát triển, nhưng không thay đổi giao diện.

### `src/App.jsx`

Đây là component gốc của ứng dụng.

- Import `AppRouter`.
- Trả về `AppRouter`.
- Không chứa layout hoặc dữ liệu riêng của trang.

### `src/index.css`

CSS toàn cục áp dụng cho toàn ứng dụng.

- Thiết lập font chữ mặc định.
- Đặt màu chữ và màu nền mặc định.
- Reset `box-sizing`.
- Xóa margin mặc định của `body`.
- Đặt kích thước tối thiểu cho trang.
- Chuẩn hóa font cho button và input.

CSS dành riêng cho trang đăng nhập nên được đặt trong `LoginPage.css`, không nên đặt tại đây trừ khi style đó thực sự dùng chung toàn ứng dụng.

### `src/app/AppRouter.jsx`

Điều phối trang ở cấp cao.

- Import `LoginPage`.
- Hiện trực tiếp trang đăng nhập.
- Không có React Router, route `/login` hay điều hướng sang dashboard.
- Không có kiểm tra đăng nhập, redirect hoặc bảo vệ route.

Khi ứng dụng có nhiều trang, file này có thể chuyển thành cấu hình router với các route như `/login`, `/dashboard` và `/profile`.

### `src/pages/auth/LoginPage.jsx`

Đây là màn hình đăng nhập hoàn chỉnh.

File này:

- Import `LoginVisual`.
- Import `LoginForm`.
- Import CSS của trang.
- Tạo phần tử `<main>` làm vùng bao ngoài.
- Render panel thông tin bên trái bằng `LoginVisual`.
- Render vùng form bên phải bằng `LoginForm`.
- Đặt tiêu đề và mô tả trang.

Page nên tập trung vào việc ghép các component, không nên chứa logic chi tiết của từng ô nhập liệu.

### `src/pages/auth/LoginPage.css`

CSS riêng cho toàn bộ trang đăng nhập.

| Nhóm class | Chức năng |
|---|---|
| `.login-page` | Layout hai cột chính. |
| `.login-panel` | Vùng chứa form bên phải. |
| `.login-content` | Giới hạn chiều rộng và khoảng cách nội dung form. |
| `.login-form` | Căn khoảng cách giữa các thành phần form. |
| `.form-field` | Label và ô nhập email hoặc mã cán bộ. |
| `.text-field-input-wrap` | Vùng bọc input email và icon bên trái. |
| `.password-field` | Cụm mật khẩu gồm label, nút quên mật khẩu và ô nhập. |
| `.remember-row` | Checkbox duy trì đăng nhập. |
| `.primary-button` | Nút đăng nhập và mũi tên. |
| `.login-visual` | Panel xanh giới thiệu VNUACare bên trái. |
| `.visual-brand` | Dòng tên cổng quản lý sức khỏe điện tử. |
| `.visual-copy` | Tiêu đề và mô tả chính. |
| `.visual-benefits` | Danh sách ba lợi ích hoặc tính năng. |
| `.visual-footer` | Thông tin thành lập và địa chỉ. |
| Media query dưới `700px` | Ẩn panel minh họa và chuyển sang layout một cột trên mobile. |

### `src/features/auth/components/LoginForm.jsx`

Xử lý phần form đăng nhập.

State được quản lý trong component:

| State | Chức năng |
|---|---|
| `loginIdentifier` | Lưu email công vụ hoặc mã số cán bộ. |
| `password` | Lưu mật khẩu người dùng. |
| `remember` | Lưu trạng thái checkbox duy trì đăng nhập. |
| `showPassword` | Bật hoặc tắt hiển thị mật khẩu. |

Hiện tại component:

- Ngăn form tải lại trang bằng `event.preventDefault()`.
- Cập nhật giá trị khi người dùng nhập.
- Đổi trạng thái checkbox.
- Đổi kiểu password sang text và ngược lại.
- Không gọi API.
- Không lưu token hoặc session.
- Không chuyển sang trang khác.
- Không xác thực tài khoản.

Vì đây mới là giao diện, component hiện chưa cần custom hook, context hoặc API service riêng.

### `src/features/auth/components/LoginVisual.jsx`

Xử lý panel minh họa bên trái.

- Hiển thị nhãn cổng quản lý sức khỏe điện tử.
- Hiển thị tiêu đề về chăm sóc sức khỏe cán bộ Học viện Nông nghiệp Việt Nam.
- Hiển thị mô tả hệ thống.
- Hiển thị ba lợi ích về bảo mật, xét nghiệm và phiếu khám điện tử.
- Hiển thị năm thành lập và địa chỉ.

Component chỉ render giao diện, không có state hoặc API.

## Luồng render

```text
main.jsx
  -> App.jsx
      -> AppRouter.jsx
          -> LoginPage.jsx
              -> LoginVisual.jsx
              -> LoginForm.jsx
```

Chi tiết:

1. `main.jsx` khởi tạo React và mount ứng dụng vào `<div id="root">`.
2. `App.jsx` gọi `AppRouter`.
3. `AppRouter.jsx` render `LoginPage`.
4. `LoginPage.jsx` ghép panel minh họa và form.
5. `LoginForm.jsx` quản lý state nội bộ của form.
6. `LoginPage.css` định dạng desktop và mobile.

## Hiểu các thư mục qua ví dụ form đăng nhập

Hãy tưởng tượng người dùng bấm nút **Đăng nhập**. Ứng dụng có thể cần làm bốn việc khác nhau:

1. Hiển thị form và đọc nội dung người dùng nhập.
2. Gửi email/mật khẩu đến máy chủ.
3. Trong lúc chờ, hiện trạng thái “Đang đăng nhập...” hoặc thông báo lỗi.
4. Nếu đăng nhập thành công, cho các trang khác biết người dùng hiện tại là ai.

Mỗi thư mục dưới đây dành cho một loại việc. Tên thư mục không phải tính năng tự chạy; bên trong phải có file code thì nó mới có tác dụng.

### `components` — phần người dùng nhìn thấy

**Component** là một khối giao diện. Trong dự án này:

- `features/auth/components/LoginForm.jsx` là phần người dùng nhập tài khoản/mật khẩu và bấm nút.
- `features/auth/components/LoginVisual.jsx` là phần giới thiệu màu xanh bên trái.
- `pages/auth/LoginPage.jsx` đặt hai khối đó cạnh nhau thành trang hoàn chỉnh.

Ta đặt hai component trong `features/auth/components` vì chúng chỉ dùng cho màn hình đăng nhập. Nếu sau này có nút dùng ở nhiều trang, có thể đặt nút đó trong `src/components/ui/`.

**Nói ngắn gọn:** `components` trả lời câu hỏi “trên màn hình có những gì?”.

### `api` — file gửi/nhận dữ liệu với máy chủ

Khi cần kiểm tra tài khoản thật, frontend phải gửi thông tin đến backend. Ta tạo file như:

```text
src/features/auth/api/authApi.js
```

File này chứa việc gọi địa chỉ backend, gửi dữ liệu và đọc kết quả trả về. Nó không vẽ giao diện.

**Nói ngắn gọn:** `api` trả lời câu hỏi “ứng dụng nói chuyện với máy chủ bằng cách nào?”.

Nếu chưa có backend hoặc chưa biết endpoint, request body và response, chưa thể viết API chính xác. Không cần tạo `api/` chỉ để có folder rỗng.

### `hooks` — file gom logic React của một hành động

Khi gửi API, form cần biết đang chờ hay gặp lỗi. Có thể đặt phần logic này trong:

```text
src/features/auth/hooks/useLogin.js
```

Hook `useLogin` có thể gọi `authApi.js`, đồng thời giữ các trạng thái như `loading` và `error`. `LoginForm.jsx` dùng các trạng thái đó để khóa nút hoặc hiện thông báo.

**Nói ngắn gọn:** `hooks` trả lời câu hỏi “khi người dùng thao tác, ứng dụng xử lý trạng thái ra sao?”.

Hook là tùy chọn. Nếu chỉ có một form đơn giản, `LoginForm.jsx` có thể tự gọi API và tự giữ `loading`/`error` bằng `useState`. Chỉ tách hook khi logic dài, cần dùng lại hoặc muốn làm form gọn hơn.

### `context` — chỗ chia sẻ thông tin giữa nhiều trang

Sau khi đăng nhập, có thể cần để nhiều nơi biết người dùng hiện tại:

- Header hiển thị tên người dùng.
- Trang hồ sơ hiển thị thông tin cá nhân.
- Trang bảo vệ nội dung nếu chưa đăng nhập.
- Nút đăng xuất xóa trạng thái phiên.

Nếu phải truyền thông tin người dùng qua nhiều component trung gian, có thể dùng Context, ví dụ:

```text
src/features/auth/context/AuthContext.jsx
```

Context giữ/cung cấp thông tin dùng chung đó. Context không thay thế API: API vẫn gửi request; Context chỉ chia sẻ trạng thái đã nhận được cho các component cần dùng.

**Nói ngắn gọn:** `context` trả lời câu hỏi “nhiều trang cùng cần biết dữ liệu nào?”.

Nếu ứng dụng hiện chỉ có màn hình form, chưa có trang nào khác cần biết người dùng là ai, thì chưa cần Context.

### So sánh nhanh

| Thư mục | Dễ hiểu là | Ví dụ trong tính năng đăng nhập | Có cần ngay bây giờ? |
|---|---|---|---|
| `components` | Khối giao diện | `LoginForm.jsx`, `LoginVisual.jsx` | Có, đang dùng rồi. |
| `api` | Người gửi yêu cầu đến backend | `authApi.js` | Chỉ cần khi có API backend thật. |
| `hooks` | Người điều phối logic React/loading/lỗi | `useLogin.js` | Không bắt buộc; có thể thêm khi form cần tách logic. |
| `context` | Nơi chia sẻ trạng thái cho nhiều màn hình | `AuthContext.jsx` | Chưa cần nếu chưa có nhiều màn hình dùng trạng thái đăng nhập. |

### Luồng khi đã kết nối API

```text
Người dùng bấm nút
       ↓
LoginForm.jsx đọc email và mật khẩu
       ↓
useLogin.js quản lý trạng thái đang gửi/lỗi (có thể bỏ hook nếu chưa cần)
       ↓
authApi.js gửi request
       ↓
Backend kiểm tra tài khoản và trả kết quả
       ↓
LoginForm.jsx hiện lỗi hoặc báo thành công
       ↓
AuthContext.jsx chia sẻ người dùng cho các trang khác (chỉ thêm nếu cần)
```

Thứ tự này cho thấy mỗi file xử lý một việc. `LoginPage.jsx` vẫn chỉ ghép layout; không cần biết request gửi qua mạng như thế nào.

### Ví dụ cụ thể: bấm nút đăng nhập thì chuyện gì xảy ra?

Giả sử người dùng nhập `user@vnua.edu.vn`, nhập mật khẩu rồi bấm **Đăng nhập**. Đây là ví dụ để hiểu cách các file gọi nhau; URL và tên dữ liệu phải khớp API thật của backend.

#### Bước 1: `LoginForm.jsx` đọc nội dung nhập

Các ô input hiện lưu dữ liệu bằng state:

```jsx
const [loginIdentifier, setLoginIdentifier] = useState('')
const [password, setPassword] = useState('')
```

Khi người dùng gõ, `onChange` cập nhật state. Khi bấm nút, form gọi hàm `handleSubmit`. Component biết giá trị nào được nhập nhưng không cần tự biết chi tiết giao thức HTTP.

#### Bước 2: `LoginForm.jsx` nhờ `useLogin.js` xử lý

Ở cấu trúc có hook, form sẽ gọi tương tự:

```jsx
const { submit, loading, error } = useLogin()

async function handleSubmit(event) {
  event.preventDefault()
  await submit({ identifier: loginIdentifier, password })
}
```

Ý nghĩa:

- `submit(...)`: bắt đầu thao tác đăng nhập.
- `loading`: cho form biết request còn đang chờ hay không.
- `error`: nội dung lỗi để form hiển thị.

Hook không phải thứ React tự tìm theo tên folder. `LoginForm.jsx` phải `import` và gọi `useLogin()` thì hook mới chạy.

#### Bước 3: `useLogin.js` quản lý trạng thái chờ và lỗi

Hook có thể làm các việc sau:

```js
setLoading(true)
setError('')
const result = await loginRequest(credentials)
setLoading(false)
```

Nếu request lỗi, hook lưu thông báo vào `error`. React render lại form; form dùng `loading` để khóa nút và dùng `error` để hiện lời nhắc. Hook không hiển thị nút hay input, vì đó là việc của component.

Nếu ứng dụng còn đơn giản, có thể bỏ bước này: chuyển phần `loading`/`error` và gọi API vào `LoginForm.jsx`. Hook chỉ là cách tách code khi cần, không phải yêu cầu bắt buộc để gọi API.

#### Bước 4: `authApi.js` thực hiện request HTTP

Hook gọi một hàm trong file API, ví dụ:

```js
const result = await loginRequest({
  identifier: 'user@vnua.edu.vn',
  password: '...',
})
```

`authApi.js` chuyển dữ liệu thành request gửi qua mạng. Backend nhận request, kiểm tra tài khoản rồi trả response. API chỉ biết request/response; nó không biết giao diện đang có màu gì hoặc nút nằm ở đâu.

#### Bước 5: kết quả quay lại form

- Nếu backend từ chối, API báo lỗi → hook ghi lỗi → `LoginForm.jsx` hiện thông báo.
- Nếu backend chấp nhận, API trả kết quả → hook trả kết quả cho form → form/ứng dụng thực hiện bước tiếp theo theo yêu cầu, chẳng hạn chuyển trang.
- Khi đang chờ, `loading` là `true` → nút hiện “Đang đăng nhập...” và không cho gửi lặp.

### Ví dụ nhìn theo đường đi của dữ liệu

```text
Ô email và mật khẩu
  │ người dùng nhập
  ▼
state trong LoginForm.jsx
  │ submit({ identifier, password })
  ▼
useLogin.js                    (tùy chọn: loading/error)
  │ loginRequest(credentials)
  ▼
authApi.js
  │ HTTP request qua mạng
  ▼
Backend
  │ HTTP response
  ▼
authApi.js → useLogin.js → LoginForm.jsx hiển thị kết quả
```

Mũi tên là lời gọi/đường đi dữ liệu, không phải mỗi mũi tên tương ứng một folder bắt buộc. Điểm quan trọng là biết file nào nhận dữ liệu, file nào gửi request và file nào hiển thị kết quả.

### Context sẽ tham gia lúc nào?

`AuthContext` thường **không cần thiết để gửi request đăng nhập**. Nó chỉ hữu ích sau khi đăng nhập, nếu nhiều phần của ứng dụng cùng cần biết người dùng hiện tại.

Ví dụ sau khi đăng nhập:

```text
Backend trả người dùng hiện tại
        ↓
AuthContext lưu/cung cấp thông tin người dùng
        ├── Header đọc tên để hiển thị
        ├── ProfilePage đọc thông tin hồ sơ
        └── ProtectedPage kiểm tra đã đăng nhập chưa
```

Nếu chỉ có `LoginPage` và chưa có Header/Profile/Dashboard cần dùng thông tin đó, chưa tạo Context. Nếu backend dùng cookie `HttpOnly`, trình duyệt có thể tự gửi cookie theo cấu hình; frontend không nhất thiết phải tự cất token vào Context. Cách quản lý phiên phải theo thiết kế backend.

### Vì sao không viết toàn bộ vào một file?

Với một form nhỏ, viết cả giao diện, request và trạng thái trong `LoginForm.jsx` vẫn có thể chạy. Khi thêm nhiều tính năng, một file sẽ phải làm quá nhiều việc:

- Đổi URL API cũng phải sửa file giao diện.
- Logic loading/lỗi lặp lại ở nhiều form khó dùng chung.
- Nhiều page cần người dùng hiện tại thì phải truyền props qua nhiều lớp.

Tách file giúp mỗi nơi có một nhiệm vụ. Tuy nhiên, tách quá sớm cũng tạo nhiều bước nhảy giữa các file. Vì vậy bắt đầu tối thiểu (`LoginForm.jsx` + `authApi.js`), rồi chỉ thêm hook/context khi có nhu cầu cụ thể.

### Cấu trúc tối thiểu và cấu trúc mở rộng

Nếu chỉ có một form và một API, có thể bắt đầu tối giản:

```text
features/auth/
├── api/
│   └── authApi.js          # Gửi request
└── components/
    └── LoginForm.jsx       # Giao diện, gọi API và giữ loading/lỗi
```

Khi form lớn hơn, tách phần quản lý trạng thái thành hook:

```text
features/auth/
├── api/
│   └── authApi.js          # Gửi request
├── hooks/
│   └── useLogin.js         # Gọi API, quản lý loading/lỗi
└── components/
    └── LoginForm.jsx       # Hiển thị form và kết quả
```

Khi có nhiều trang cùng cần thông tin người dùng sau đăng nhập, mới thêm Context:

```text
features/auth/
├── api/
│   └── authApi.js
├── hooks/
│   └── useLogin.js
├── context/
│   └── AuthContext.jsx     # Chia sẻ người dùng/phiên đăng nhập
└── components/
    └── LoginForm.jsx
```

Không cần tạo tất cả folder ngay từ đầu. Bắt đầu với cấu trúc nhỏ nhất giải quyết được yêu cầu rồi mở rộng khi có nhu cầu thật.

## Khi nào cần thêm folder mới

### Khi có API hoặc backend

Chỉ thêm mã API sau khi backend cung cấp đủ thông tin: URL, HTTP method, tên các trường request, cấu trúc response và cách biểu diễn lỗi. Không nên đoán các giá trị này từ tên của form.

Với API đăng nhập, đặt phần gọi HTTP cạnh feature auth để dễ tìm và tránh trộn request vào JSX:

```text
src/
└── features/
    └── auth/
        ├── api/
        │   └── authApi.js         # Gửi request HTTP đến backend
        ├── hooks/
        │   └── useLogin.js        # Loading, lỗi và gọi API từ UI
        └── components/
            └── LoginForm.jsx     # Nhận input, gọi hook và hiển thị kết quả
```

Trong cấu trúc này:

- `api/authApi.js` biết URL endpoint, method, headers và định dạng dữ liệu gửi/nhận.
- `hooks/useLogin.js` điều phối trạng thái giao diện như đang gửi, lỗi, thành công.
- `components/LoginForm.jsx` chỉ lấy dữ liệu người dùng, gọi hook và hiển thị trạng thái.
- `LoginPage.jsx` tiếp tục ghép bố cục; không cần biết chi tiết giao thức HTTP.

Nếu ứng dụng có nhiều endpoint hoặc nhiều feature, có thể tách thêm `src/shared/api/httpClient.js` để dùng chung cấu hình fetch, header và xử lý response. Không cần tạo client chung khi mới có một request đơn giản.

### Thông tin cần lấy từ backend trước khi viết API

| Thông tin | Ví dụ minh họa, cần backend xác nhận |
|---|---|
| URL endpoint | `/api/v1/authorization/login` |
| HTTP method | `POST` |
| Request body | Có thể là `{ "email": "...", "password": "..." }`; tên field thực tế có thể khác. |
| Response thành công | Ví dụ có thông tin người dùng và token, hoặc chỉ trả cookie; cần biết chính xác schema. |
| Response thất bại | Mã trạng thái và nội dung lỗi, ví dụ `401` cùng thông báo. |
| Cách giữ phiên | Cookie `HttpOnly`, access token, refresh token hoặc cơ chế khác do backend quy định. |
| CORS và địa chỉ môi trường | Địa chỉ backend local, staging, production và chính sách CORS. |

Các ví dụ bên dưới chỉ là khung minh họa. Phải đổi endpoint và tên trường theo hợp đồng API thực tế.

### Bước 1: cấu hình địa chỉ backend

Nếu backend có địa chỉ riêng, tạo file `.env.local` ở thư mục gốc:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Sau đó đọc cấu hình bằng `import.meta.env.VITE_API_BASE_URL`. Biến bắt đầu bằng `VITE_` được đưa vào mã frontend và người dùng có thể xem được; **không đặt mật khẩu, client secret hoặc khóa riêng tư trong biến này**.

Nếu nhóm phát triển muốn dùng đường dẫn tương đối như `/api`, có thể cấu hình Vite proxy trong `vite.config.js` cho môi trường phát triển. Proxy chỉ giúp trình duyệt local chuyển request đến backend; khi deploy production vẫn cần cấu hình reverse proxy hoặc URL backend thích hợp.

### Bước 2: tạo hàm gọi endpoint

Tạo `src/features/auth/api/authApi.js`. Ví dụ sau giả định backend nhận `identifier` và `password`, đồng thời trả JSON; hãy thay bằng hợp đồng thật:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function loginRequest({ identifier, password }) {
  if (!API_BASE_URL) {
    throw new Error('Chưa cấu hình VITE_API_BASE_URL')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/authorization/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    },
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || `Đăng nhập thất bại (${response.status})`)
  }

  return result
}
```

Vai trò của file này là chuyển dữ liệu thành HTTP request và trả dữ liệu thành công về cho bên gọi. File không được render UI. Backend phải cho biết có cần `credentials: 'include'` khi dùng cookie hay không; không tự thêm/bỏ tùy tiện.

### Bước 3: tạo hook quản lý trạng thái gửi form

Tạo `src/features/auth/hooks/useLogin.js` khi muốn gom trạng thái loading và lỗi khỏi component:

```js
import { useState } from 'react'
import { loginRequest } from '../api/authApi.js'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(credentials) {
    setLoading(true)
    setError('')

    try {
      return await loginRequest(credentials)
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Không thể đăng nhập. Vui lòng thử lại.'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
```

Hook này không tự quyết định lưu token hoặc chuyển trang. Sau khi xác nhận hợp đồng response và chính sách bảo mật của backend, mới bổ sung xử lý phiên phù hợp.

Nếu chỉ có một request và trạng thái rất đơn giản, có thể gọi API trực tiếp từ `LoginForm.jsx` mà chưa tạo hook. Tạo hook khi muốn tái sử dụng hoặc tách phần loading/lỗi để component dễ đọc hơn.

### Bước 4: kết nối form với hook

Trong `LoginForm.jsx`:

1. Import `useLogin` từ `../hooks/useLogin.js`.
2. Lấy `submit`, `loading` và `error` từ hook.
3. Trong `handleSubmit`, gọi `submit({ identifier: loginIdentifier, password })`.
4. Vô hiệu hóa nút khi `loading` là `true`.
5. Hiển thị `error` bên cạnh form bằng nội dung có `role="alert"`.

Ví dụ phần JSX cho lỗi và nút:

```jsx
{error && <p className="form-error" role="alert">{error}</p>}

<button className="primary-button" type="submit" disabled={loading}>
  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
</button>
```

Khi request thành công, cần dựa vào response thật để quyết định bước tiếp theo, chẳng hạn điều hướng vào trang chính. Không giả định response luôn có token; backend có thể quản lý phiên bằng cookie bảo mật.

### Bước 5: kiểm thử tích hợp

- Kiểm tra request trong tab Network của trình duyệt: URL, method, body và status code.
- Thử đăng nhập thành công với tài khoản kiểm thử do backend cung cấp.
- Thử mật khẩu sai và xác nhận thông báo lỗi hiển thị rõ ràng.
- Tắt backend để kiểm tra lỗi kết nối không bị hiểu nhầm là đăng nhập thành công.
- Kiểm tra loading: nút không gửi lặp khi request đang chạy.
- Kiểm tra CORS, cookie và HTTPS theo cấu hình môi trường.
- Không ghi mật khẩu, token hoặc thông tin nhạy cảm vào `console.log`.

### Khi có custom hook

Có thể tạo:

```text
src/features/auth/hooks/useLoginForm.js
```

Chỉ tạo custom hook khi logic được dùng lại hoặc làm component trở nên quá phức tạp. Không cần hook cho một hàm submit chỉ chạy ở một form.

### Khi có state toàn cục

Có thể tạo:

```text
src/features/auth/context/AuthContext.jsx
src/app/providers/AuthProvider.jsx
```

Chỉ cần context hoặc provider khi nhiều trang và nhiều component cùng chia sẻ thông tin đăng nhập.

### Khi có component dùng chung

Các component dùng lại ở nhiều nơi nên đặt trong:

```text
src/components/ui/
```

Ví dụ:

- Button.
- Input.
- Checkbox.
- Modal.
- Loading indicator.

Component chỉ dùng riêng cho đăng nhập nên giữ trong `src/features/auth/components`.

## Nguyên tắc tổ chức file

- Không đặt logic API vào component JSX.
- Không tạo folder `api`, `hooks` hoặc `context` khi chưa có mã tương ứng.
- Page chịu trách nhiệm ghép nhiều component thành màn hình.
- Feature component xử lý từng phần của một nghiệp vụ.
- Component dùng lại ở nhiều trang đặt trong thư mục UI chung.
- CSS dành riêng cho một trang đặt gần page đó.
