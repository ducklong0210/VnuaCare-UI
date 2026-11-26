# 04. Luồng Gọi API, Cấu Trúc `httpClient` & Giải Mã Dữ Liệu Trả Về

> Tài liệu giải thích chi tiết đường đi của một yêu cầu HTTP từ giao diện xuống Backend .NET và ngược lại: cấu trúc `httpClient.js`, cách `fetch()` gửi kèm JWT, cách bắt lỗi, lý do có **2 lớp `data` (`result?.data?.data`)** và cách truyền dữ liệu lên giao diện.

---

## 1. Sơ Đồ Đường Đi Hai Chiều Của Dữ Liệu

```text
[Component Con: DashboardStatsCharts / DashboardRecentRecords / *Table / *Filter]
        ▲  Nhận dữ liệu qua props (records, items, loading) để vẽ HTML
        │
[Component Cha: DashboardManager / SearchHealthRecordList / SearchStaffList...]
        │  useEffect tự chạy -> gọi Service -> hứng kết quả (recordRes) -> lưu vào useState
        ▼
[Tầng Service: HealthRecordService / StaffService / DoctorService / AccountService]
        │  Gom nhóm các hàm API theo đúng đối tượng nghiệp vụ
        ▼
[Tầng API: recordApi.js / staffApi.js / userApi.js...]  <-- Dùng chung [httpClient.js]
        │  Gọi fetch() kèm Header JWT & JSON body -> Kiểm tra 401 / !response.ok -> Bóc vỏ JSON
        ▼
[Backend .NET 9 (VnuaCare-API)]  <===>  [SQL Server (VnuaCareDB)]
```

---

## 2. Mổ Xẻ Tầng Cấu Hình HTTP Dùng Chung (`src/api/httpClient.js`)

Thay vì viết lặp lại địa chỉ máy chủ, đoạn gắn JWT và đoạn đọc lỗi ở cả 9 file API, toàn bộ dự án gom chúng về một chỗ duy nhất là `src/api/httpClient.js`:

### 2.1. `API_BASE_URL`
```js
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
```
- Đọc biến môi trường `VITE_API_BASE_URL` (mặc định là chuỗi rỗng `''` để đi qua Vite Proxy ở môi trường dev).
- `.replace(/\/+$/, '')` xóa bỏ mọi dấu `/` thừa ở cuối để khi nối với `/api/v1/...` không bao giờ tạo ra lỗi hai dấu gạch chéo `//api/v1/...`.

### 2.2. `getAuthHeaders()`
```js
export function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
```
- Viết dưới dạng **hàm** (thay vì hằng số tĩnh) để **mỗi lần gọi API đều đọc lại `accessToken` mới nhất** trong `localStorage` (đặc biệt quan trọng sau khi đăng xuất rồi đăng nhập bằng tài khoản khác).

### 2.3. `parseApiError(result, defaultMsg)`
Backend `.NET` có thể trả lỗi dưới 3 định dạng JSON khác nhau tùy nơi phát sinh; hàm này gom tất cả về một câu thông báo tiếng Việt dễ đọc:
1. `result?.message`: Lỗi nghiệp vụ do Backend chủ động ném ra (VD: `"Tên đăng nhập đã tồn tại"`).
2. `result?.errors`: Lỗi kiểm tra dữ liệu đầu vào (`ModelState` của ASP.NET Core) dạng `{ FullName: ["Họ tên bắt buộc"] }` → dùng `Object.values(result.errors).flat().join(', ')` nối thành chuỗi.
3. `result?.title`: Lỗi mặc định chuẩn `ProblemDetails` của `.NET`.
4. Nếu không khớp cả 3 trường trên thì trả về câu dự phòng `defaultMsg`.

---

## 3. Cơ Chế Hoạt Động Bên Trong Một Hàm Gọi API (`src/api/recordApi.js`)

### 3.1. Chuẩn bị `bodyData` thông minh trước khi gửi
```js
const bodyData = {
  textSearch: textSearch.trim(),
  pageNumber: pageNumber,
  pageSize: pageSize,
};

if (campaignId && campaignId !== 'ALL') {
  bodyData.campaignId = Number(campaignId);
}
```
- **Tại sao phải kiểm tra `campaignId !== 'ALL'`?** Trên thanh lọc giao diện, mục *"Tất cả đợt khám"* mang giá trị `'ALL'`. Nhưng ở Backend `.NET`, thuộc tính `CampaignId` có kiểu số nguyên `int?`. Nếu gửi chữ `'ALL'` lên, `.NET` không ép kiểu sang số được và sẽ trả lỗi `400 Bad Request`. Chỉ khi người dùng chọn một ID cụ thể thì Frontend mới ép `Number(...)` và đưa vào `bodyData`.
- **Tại sao phải `JSON.stringify(bodyData)`?** Giao thức HTTP truyền dữ liệu qua mạng dưới dạng chuỗi văn bản, nên cần chuyển Object JavaScript thành chuỗi JSON chuẩn.

### 3.2. Kiểm tra lỗi HTTP chặt chẽ
- **Kiểm tra riêng `response.status === 401`:** Báo rõ *"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"*.
- **Kiểm tra `!response.ok`:** Hàm `fetch()` của trình duyệt không tự ném lỗi khi gặp mã `400 / 403 / 404 / 500` (nó chỉ ném lỗi khi đứt mạng). Vì vậy phải kiểm tra `!response.ok` rồi đọc JSON lỗi và `throw new Error(errorMessage)` để khối `catch` ở Component bắt được.
- **Tại sao bọc `try / catch` quanh `await response.json()` khi lỗi?** Khi gặp lỗi `502 Bad Gateway` (chưa bật Backend), phản hồi trả về là HTML/văn bản rỗng chứ không phải JSON; bọc `try / catch` giúp không bị văng lỗi cú pháp JSON.

---

## 4. Giải Mã 2 Lớp `data` (`result?.data?.data`) & 4 Kiểu Trả Về Của Backend

Mọi API của Backend `.NET` đều bọc kết quả trong khung phản hồi chuẩn `ResponseObject<T>` gồm `{ statusCode, message, data }`. Tùy kiểu dữ liệu `T` bên trong mà tầng `src/api/` nhận được 1 trong 4 dạng:

### Dạng 1 — API Lọc & Phân Trang: Có **2 lớp `data`** (`result?.data?.data`)
Áp dụng cho: `getHealthRecordFilterApi`, `getStaffFilterApi`, `getDoctorFilterApi`, `getUserFilterApi`.

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {                         // <-- Lớp data ngoài: vỏ bọc chung ResponseObject
    "data": [                       // <-- Lớp data trong: mảng bản ghi của trang hiện tại (PaginationList)
      { "recordId": 1, "sidCode": "221123-120002940950", "staffName": "Nguyễn Văn A" }
    ],
    "totalCount": 50,               // Tổng số bản ghi khớp điều kiện trong toàn bộ CSDL
    "pageNumber": 1,
    "pageSize": 10
  }
}
```
- **Cách tầng API bóc vỏ và chuẩn hóa trước khi `return`:**
  ```js
  const result = await response.json();
  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
  ```
- **Lợi ích:** Đổi tên `data` lớp thứ hai thành `items` giúp các tầng phía trên (`Service` và `Component`) chỉ cần viết gọn **1 lớp** là `recordRes.items` và `recordRes.totalCount`, đọc vào hiểu ngay không bị rối `data.data`.

### Dạng 2 — API Danh Mục Dropdown (Không phân trang): Chỉ có **1 lớp `data`**
Áp dụng cho: `getCampaignsSelectApi`, `getDepartmentsSelectApi`, `getSpecialtiesApi`, `getStaffsSelectApi`, `getDoctorsSelectApi`.
- Ruột của `ResponseObject` là mảng trực tiếp `[...]` → chỉ cần `return result?.data || []`.
- Nếu API phụ gặp lỗi (`!response.ok`), trả về mảng rỗng `[]` để trang chính vẫn hoạt động bình thường không bị sập.

### Dạng 3 — API Xem Chi Tiết 1 Bản Ghi: Chỉ có **1 lớp `data`**
Áp dụng cho: `getHealthRecordByIdApi`, `getVitalSignsApi`, `getInternalMedicineApi`, `getMyProfileApi`.
- Ruột của `ResponseObject` là một Object đơn lẻ `{...}` → `return result?.data || null`. Nếu hồ sơ chưa khám (chưa có dữ liệu), trả về `null` để biểu mẫu hiển thị các ô trống cho bác sĩ nhập mới.

### Dạng 4 — API Thêm / Sửa / Xóa (CRUD)
Áp dụng cho: `create*Api`, `update*Api`, `delete*Api`.
- Trả nguyên `await response.json()` để Component biết thao tác đã thành công và hiển thị thông báo Toast.

---

## 5. Cách `DashboardManager.jsx` Tối Ưu Gọi API & Truyền `Props`

Trong `DashboardManager.jsx`:
- **Với Cán bộ & Bác sĩ:** Truyền `{ pageNumber: 1, pageSize: 1 }` vì thẻ KPI trên Dashboard chỉ cần đọc con số tổng `staffRes?.totalCount` và `doctorRes?.totalCount` — chỉ tải 1 bản ghi mẫu giúp tiết kiệm băng thông tối đa.
- **Với Hồ sơ khám:** Truyền `{ pageNumber: 1, pageSize: 200 }` và hứng vào biến `recordRes` (`Response` của hồ sơ), sau đó tách làm 2 phần:
  - `setTotalRecords(recordRes?.totalCount || 0)` → hiển thị lên thẻ KPI Tổng hồ sơ.
  - `setRecords(recordRes?.items || [])` → truyền xuống `DashboardStatsCharts` (để đếm tỷ lệ Loại I–V & tiến độ) và `DashboardRecentRecords` (cắt `records.slice(0, 5)` hiển thị 5 hồ sơ gần nhất).
