# Luồng Gọi API, Cấu Trúc Dữ Liệu Trả Về & Cách Truyền Dữ Liệu Lên Giao Diện

> Tài liệu giải thích chi tiết cấu trúc, cơ chế hoạt động, các dạng dữ liệu trả về từ Backend và lý do thiết kế của từng tầng trong `VnuaCare-UI` — bám sát các file thực tế (`httpClient.js`, `recordApi.js`, `internalMedicineApi.js`, `HealthRecordService.js`, `DashboardManager.jsx`, `DashboardStatsCharts.jsx`, `DashboardRecentRecords.jsx`).

---

## Sơ Đồ Toàn Bộ Đường Đi Của Dữ Liệu

Khi người dùng mở một trang quản trị (ví dụ trang Dashboard), dữ liệu đi qua các tầng theo đúng hai chiều **Gửi yêu cầu đi** và **Nhận kết quả trả về**:

```text
[Component Con: DashboardStatsCharts / DashboardRecentRecords]
        ▲  Nhận dữ liệu qua props (records, loading) và vẽ HTML
        │
[Component Cha: DashboardManager.jsx]
        │  useEffect tự chạy -> gọi Service -> hứng kết quả (recordRes) -> lưu vào useState
        ▼
[Tầng Service: HealthRecordService.js / StaffService.js / DoctorService.js]
        │  Đóng vai trò cầu nối trung gian theo nghiệp vụ
        ▼
[Tầng API: recordApi.js / internalMedicineApi.js]  <-- Dùng chung hàm từ [httpClient.js]
        │  Gửi fetch() kèm Header JWT & JSON body -> Kiểm tra lỗi -> Bóc vỏ JSON trả về
        ▼
[Backend .NET 9 (VnuaCare-API)]  <--->  [SQL Server (VnuaCareDB)]
```

---

## Tầng Cấu Hình HTTP Dùng Chung (`src/api/httpClient.js`)

Thay vì viết lặp lại địa chỉ server, đoạn gắn token JWT và đoạn đọc lỗi ở hơn 10 file API khác nhau, toàn bộ dự án gom chúng vào duy nhất một file `src/api/httpClient.js`.

### `API_BASE_URL`
```js
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
```
- **Cách hoạt động:** Đọc biến môi trường `VITE_API_BASE_URL` (nếu không cấu hình thì dùng chuỗi rỗng `''` để chạy qua proxy của Vite). Sau đó `.replace(/\/+$/, '')` cắt bỏ mọi dấu `/` thừa ở cuối chuỗi.
- **Tại sao phải làm vậy:** Nếu ai đó lỡ ghi `http://localhost:5049/` (có dấu `/` ở cuối) rồi ghép với `/api/v1/healthrecords/filter` thì sẽ bị thành `http://localhost:5049//api/...` (hai dấu gạch chéo liền nhau), dễ gây lỗi đường dẫn. Cắt sẵn ở đây giúp mọi endpoint luôn sạch.

### `getAuthHeaders()`
```js
export function getAuthHeaders() {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}
```
- **Cách hoạt động:**
  - Lấy chuỗi JWT `accessToken` đã được lưu trong `localStorage` lúc đăng nhập thành công.
  - Trả về một object header gồm hai dòng:
    - `'Content-Type': 'application/json'`: báo cho Backend biết dữ liệu trong `body` gửi lên là định dạng JSON.
    - `Authorization: 'Bearer ...'`: xuất trình thẻ JWT theo chuẩn Bearer để Backend kiểm tra chữ ký, thời hạn và vai trò (`SUPER_ADMIN`, `HEALTH_ADMIN`, `DOCTOR`, `STAFF`).
- **Tại sao tách thành hàm mà không lưu thành biến tĩnh:** Vì `accessToken` thay đổi mỗi khi người dùng đăng nhập bằng tài khoản khác hoặc đăng xuất. Viết thành hàm để **mỗi lần gọi API là một lần đọc token mới nhất** trong `localStorage`.

### `parseApiError(result, defaultMsg)`
```js
export function parseApiError(result, defaultMsg) {
  if (result?.message) return result.message;
  if (result?.errors && typeof result.errors === 'object') {
    const errorList = Object.values(result.errors).flat();
    if (errorList.length > 0) return errorList.join(', ');
  }
  if (result?.title) return result.title;
  return defaultMsg;
}
```
- **Tại sao cần hàm này:** Backend .NET có thể trả về JSON lỗi theo **nhiều khuôn mẫu khác nhau** tùy chỗ phát sinh lỗi:
  - Lỗi nghiệp vụ do mình tự viết ở Backend: `{ "message": "Hồ sơ đã tồn tại" }` → lấy `result.message`.
  - Lỗi kiểm tra dữ liệu đầu vào (Validation của ASP.NET Core): `{ "errors": { "FullName": ["Họ tên là bắt buộc"], "Email": ["Email không hợp lệ"] } }` → `Object.values(...).flat().join(', ')` gom tất cả thành `"Họ tên là bắt buộc, Email không hợp lệ"`.
  - Lỗi hệ thống chuẩn ProblemDetails của .NET: `{ "title": "One or more validation errors occurred." }` → lấy `result.title`.
  - Nếu cả ba đều không có thì dùng câu dự phòng `defaultMsg` do Frontend truyền vào.

---

## Tầng Gọi API & Cơ Chế Trả Về (`src/api/recordApi.js`, `src/api/internalMedicineApi.js`)

### Quá trình chuẩn bị và gửi dữ liệu đi (`getHealthRecordFilterApi`)

```js
const endpoint = `${API_BASE_URL}${healthRecordRouter.getFilter}`;

const bodyData = {
  textSearch: textSearch.trim(),
  pageNumber: pageNumber,
  pageSize: pageSize,
};

if (campaignId && campaignId !== 'ALL') {
  bodyData.campaignId = Number(campaignId);
}
```
- **Tại sao phải dùng `if (campaignId && campaignId !== 'ALL')` mới gán vào `bodyData`:**
  - Trên giao diện bộ lọc (dropdown), lựa chọn *"Tất cả đợt khám"* có giá trị là chuỗi `'ALL'`.
  - Trong khi đó, Backend .NET khai báo `CampaignId` là kiểu số nguyên có thể rỗng (`int?`). Nếu Frontend gửi nguyên `{ campaignId: "ALL" }` lên, .NET không chuyển chữ `"ALL"` thành số được và lập tức báo lỗi `400 Bad Request`.
  - Do đó chỉ khi người dùng chọn một đợt khám cụ thể thì Frontend mới ép sang số `Number(campaignId)` và nhét vào `bodyData`. Khi không gửi trường đó, Backend tự hiểu là `null` (lấy tất cả).
- **Tại sao dùng `JSON.stringify(bodyData)` trong `fetch`:**
  - Giao thức HTTP chỉ truyền được chuỗi văn bản (text) qua mạng, không truyền trực tiếp object JavaScript được. `JSON.stringify` biến object thành chuỗi JSON để gửi qua đường mạng; sang tới Backend .NET sẽ tự giải mã chuỗi đó ngược lại thành object C#.

### Cơ chế kiểm tra phản hồi và xử lý lỗi

```js
const response = await fetch(endpoint, {
  method: METHODS.POST,
  headers: getAuthHeaders(),
  body: JSON.stringify(bodyData),
});

if (response.status === 401) {
  throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
}

if (!response.ok) {
  let errorMessage = 'Lỗi khi tải danh sách hồ sơ khám';
  try {
    const err = await response.json();
    errorMessage = parseApiError(err, errorMessage);
  } catch {
    // Bỏ qua nếu phản hồi lỗi từ server không phải định dạng JSON
  }
  throw new Error(errorMessage);
}
```
- **Tại sao phải kiểm tra `response.status === 401` riêng:**
  - Mã `401 Unauthorized` mang ý nghĩa đặc biệt là token JWT bị sai hoặc đã hết hạn. Bắt riêng mã này giúp báo đúng thông điệp tiếng Việt rõ ràng thay vì hiện thông báo lỗi chung chung.
- **Tại sao cần `if (!response.ok)`:**
  - Hàm `fetch` của trình duyệt **chỉ tự báo lỗi khi rớt mạng hoàn toàn**. Còn nếu Backend trả mã `400`, `403`, `404`, `500`, `fetch` vẫn coi là "gọi xong" và không tự ném lỗi. Vì vậy bắt buộc phải kiểm tra `!response.ok` (mã HTTP không nằm trong dải `200–299`).
- **Tại sao lại bọc `try / catch` quanh `await response.json()` lúc có lỗi:**
  - Khi server gặp sự cố nặng (như `502 Bad Gateway` khi quên bật Backend), phản hồi trả về thường là văn bản rỗng hoặc trang HTML chứ **không phải JSON**. Nếu gọi `response.json()` mà không bọc `try / catch`, trình duyệt sẽ văng lỗi cú pháp JSON khó hiểu thay vì hiện câu `errorMessage` dễ đọc.

---

## Tại Sao Có 2 Lớp `data` (`result?.data?.data`) Và Các Kiểu Trả Về Của Backend

Backend .NET bọc **mọi phản hồi API** trong một lớp vỏ chuẩn gọi là `ApiResponse` (`{ success, message, data }`). Tùy loại API mà "ruột" bên trong lớp `data` ngoài cùng có hình dạng khác nhau — dẫn đến **các kiểu trả về khác nhau** ở tầng `src/api/`:

### Kiểu trả về cho API lọc & phân trang (2 lớp `data`)

Áp dụng cho `getHealthRecordFilterApi`, `getStaffFilterApi`, `getDoctorFilterApi`, `getUserFilterApi`.

**JSON thực tế Backend .NET trả về:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "data": [
      { "recordId": 1, "sidCode": "VNUA-2026-001", "staffName": "Nguyễn Văn A" },
      { "recordId": 2, "sidCode": "VNUA-2026-002", "staffName": "Trần Thị B" }
    ],
    "totalCount": 50,
    "pageNumber": 1,
    "pageSize": 10
  }
}
```
- **Lớp `data` ngoài (`result.data`):** Là khung phản hồi chuẩn của mọi API (`ApiResponse`).
- **Lớp `data` trong (`result.data.data`):** Vì API có phân trang nên Backend không chỉ trả mỗi mảng danh sách mà phải gói kèm `totalCount`, `pageNumber`, `pageSize` vào một object phân trang (`PagedResult`). Trùng hợp là trong object phân trang đó, Backend cũng đặt tên trường chứa danh sách bản ghi là `data` → nên khi đọc phải chấm hai lần: `result?.data?.data`.
- **Cách tầng API chuẩn hóa trước khi `return`:**
  ```js
  const result = await response.json();
  return {
    items: result?.data?.data || [],
    totalCount: result?.data?.totalCount || 0,
    pageNumber: result?.data?.pageNumber || pageNumber,
    pageSize: result?.data?.pageSize || pageSize,
  };
  ```
- **Tại sao lại đổi tên `data` lớp trong thành `items`:**
  - Để các tầng trên (Service và Component) chỉ cần chấm **một lớp duy nhất** là `recordRes?.items` (mảng danh sách) và `recordRes?.totalCount` (tổng số bản ghi).
  - Đọc tên `items` hiểu ngay đó là danh sách các dòng dữ liệu, tránh nhầm lẫn `data.data` khắp các file giao diện.
  - Gắn `|| []` và `|| 0` giúp đảm bảo nếu Backend trả `null` thì giao diện vẫn nhận mảng rỗng hoặc số `0`, không bị sập khi gọi `.map()` hay `.length`.

### Kiểu trả về cho API danh mục dropdown không phân trang (1 lớp `data`)

Áp dụng cho `getCampaignsSelectApi`, `getDepartmentsSelectApi`, `getStaffsSelectApi`, `getDoctorsSelectApi`, `getSpecialtiesApi`.

**JSON thực tế Backend .NET trả về:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": [
    { "id": 1, "name": "Đợt khám sức khỏe định kỳ 2026" },
    { "id": 2, "name": "Đợt khám bổ sung Quý III" }
  ]
}
```
- Vì không phân trang nên ruột của lớp `data` ngoài cùng **là mảng luôn**, chỉ cần `return result?.data || []`.
- Khi `!response.ok`, các hàm dropdown chủ động `return []` thay vì `throw new Error` để nếu một danh mục phụ lỗi thì trang chính vẫn mở bình thường, không bị trắng trang.

### Kiểu trả về cho API lấy chi tiết một bản ghi (1 lớp `data`)

Áp dụng cho `getHealthRecordByIdApi`, `getInternalMedicineApi`, `getVitalSignsApi`.

**JSON thực tế Backend .NET trả về:**
```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "internalExamId": 5,
    "recordId": 1,
    "circulatory": "Bình thường"
  }
}
```
- Ruột là một object duy nhất, nên tầng API trả về `result?.data || null`. Khi chưa có phiếu khám nào trong database, trả về `null` để form ở giao diện tự hiển thị các ô nhập trống cho bác sĩ nhập mới.

### Kiểu trả về cho API thêm / sửa / xóa (CRUD)

Áp dụng cho `create...Api`, `update...Api`, `delete...Api`.
- Trả thẳng `await response.json()` (nguyên khung `{ success, message, data }`) để màn hình biết thao tác đã hoàn tất và hiển thị thông báo thành công (hoặc lấy ID bản ghi mới tạo).

---

## Tầng Trung Gian Service (`src/services/admin/HealthRecordService.js`)

```js
export const HealthRecordService = {
  getHealthRecords: getHealthRecordFilterApi,
  getCampaigns: getCampaignsSelectApi,
  createHealthRecord: createHealthRecordApi,
  updateHealthRecord: updateHealthRecordApi,
  deleteHealthRecord: deleteHealthRecordApi,
};
```
- **Tại sao không gọi thẳng `recordApi.js` từ giao diện mà lại đi qua `HealthRecordService`:**
  - **Đóng gói theo nghiệp vụ:** Giao diện chỉ cần nhớ một đối tượng duy nhất `HealthRecordService` (giống như `StaffService`, `DoctorService`, `AccountService`) thay vì nhớ tên lẻ tẻ của hàng chục hàm API.
  - **Dễ bảo trì & mở rộng:** Sau này nếu muốn đổi đường dẫn API, thêm bộ đệm (cache) hoặc xử lý dữ liệu trước khi đưa lên giao diện thì chỉ cần sửa ở tầng Service, toàn bộ Component giao diện giữ nguyên không phải sửa theo.

---

## Cách Component Cha Nhận Dữ Liệu, Lưu State & Truyền Xuống Con (`DashboardManager.jsx`)

```jsx
useEffect(() => {
  let isCancelled = false;

  const loadDashboardStats = async () => {
    setLoading(true);

    try {
      const staffRes = await StaffService.getStaffs({ pageNumber: 1, pageSize: 1 });
      if (!isCancelled) setTotalStaffs(staffRes?.totalCount || 0);
    } catch {
      if (!isCancelled) setTotalStaffs(0);
    }

    try {
      const recordRes = await HealthRecordService.getHealthRecords({ pageNumber: 1, pageSize: 200 });
      if (!isCancelled) {
        setTotalRecords(recordRes?.totalCount || 0);
        setRecords(recordRes?.items || []);
      }
    } catch {
      if (!isCancelled) {
        setTotalRecords(0);
        setRecords([]);
      }
    }

    if (!isCancelled) setLoading(false);
  };

  loadDashboardStats();
  return () => {
    isCancelled = true;
  };
}, [refreshKey]);
```

### Giải thích từng chi tiết quan trọng

- **`useEffect(..., [refreshKey])` hoạt động ra sao:**
  - Khi mở trang Dashboard lần đầu, React chạy hàm `loadDashboardStats()` để lấy dữ liệu thật từ Backend.
  - Mảng phụ thuộc `[refreshKey]` không tự đổi khi code chạy — ngược lại, **chỉ khi nào người dùng bấm nút "Làm mới số liệu"** làm chạy `setRefreshKey((prev) => prev + 1)` khiến `refreshKey` đổi giá trị (`0 -> 1 -> 2`), React mới phát hiện biến theo dõi đã thay đổi và tự chạy lại `useEffect` để gọi API lấy số liệu mới.
- **Biến `staffRes`, `doctorRes`, `recordRes` là gì:**
  - `Res` là viết tắt của `Response` (kết quả trả về).
  - `recordRes` là tên biến hứng nguyên object `{ items, totalCount, pageNumber, pageSize }` mà `HealthRecordService.getHealthRecords(...)` vừa trả về.
  - Sau đó lấy `recordRes?.totalCount` lưu vào state `totalRecords` (cho thẻ KPI), và lấy `recordRes?.items` lưu vào state `records` (cho khung biểu đồ thanh tỷ lệ và bảng gần đây).
- **Tại sao `StaffService` & `DoctorService` lại truyền `pageSize: 1`, còn `HealthRecordService` lại truyền `pageSize: 200`:**
  - Với Cán bộ và Bác sĩ, trang Dashboard **chỉ cần hiển thị đúng 1 con số tổng** (`totalCount`) trên thẻ KPI. Truyền `pageSize: 1` giúp Backend chỉ gửi về đúng 1 bản ghi mẫu kèm con số `totalCount` thật trong database — cực kỳ nhẹ và nhanh.
  - Với Hồ sơ khám, Dashboard không chỉ cần tổng số `totalCount` mà còn cần **chi tiết danh sách hồ sơ** để đếm số lượng theo từng mức phân loại sức khỏe (`Loại I -> Loại V`), theo từng trạng thái (`Chờ khám`, `Đang khám`, `Hoàn thành`, `Đã hủy`) và hiển thị bảng hồ sơ gần đây → nên truyền `pageSize: 200`.
- **Tại sao lại có biến cờ `isCancelled` và hàm `return () => { isCancelled = true; }`:**
  - Gọi API là tác vụ bất đồng bộ (mất vài trăm mili-giây). Nếu người dùng vừa mở Dashboard rồi bấm chuyển ngay sang trang khác trước khi API kịp trả về, hàm dọn dẹp (cleanup) của `useEffect` sẽ chạy và đặt `isCancelled = true`.
  - Lúc API trả về muộn, điều kiện `if (!isCancelled)` là `false` nên React không gọi `setTotalRecords` / `setRecords` lên một component đã bị gỡ khỏi màn hình, tránh rò rỉ bộ nhớ và tránh dữ liệu cũ ghi đè dữ liệu mới.
- **Cách truyền dữ liệu từ Cha xuống Con (`props`):**
  - Sau khi `setRecords(recordRes?.items || [])` chạy, React tự động vẽ lại `DashboardManager` với dữ liệu mới.
  - `DashboardManager` truyền `records` và `loading` xuống hai component con qua thuộc tính thẻ (gọi là `props`):
    ```jsx
    <DashboardStatsCharts records={records} loading={loading} />
    <DashboardRecentRecords
      records={records}
      loading={loading}
      onViewAll={canNavigateTo('records') ? () => navigate('records') : undefined}
    />
    ```
  - `DashboardStatsCharts` nhận `{ records, loading }`, dùng `.filter(...)` đếm số lượng cho từng phân loại sức khỏe và từng trạng thái, tính phần trăm rồi vẽ thanh ngang.
  - `DashboardRecentRecords` nhận `{ records, loading, onViewAll }`, dùng `records.slice(0, 5)` cắt lấy tối đa năm hồ sơ mới nhất rồi dùng `.map(...)` vẽ từng dòng bảng.

---

## Tóm Tắt Nhanh Để Trả Lời Khi Bảo Vệ

- **Tại sao tách riêng `httpClient.js`?**
  > Để tập trung một chỗ duy nhất cấu hình địa chỉ máy chủ (`API_BASE_URL`), tự động gắn JWT Bearer Token (`getAuthHeaders`) và chuẩn hóa mọi kiểu thông báo lỗi từ .NET (`parseApiError`), tránh lặp code ở các file API.
- **Tại sao trong `recordApi.js` có `result?.data?.data` (2 lớp `data`)?**
  > Vì Backend bọc hai lớp: lớp `data` ngoài là khung phản hồi chuẩn cho mọi API (`ApiResponse`), còn lớp `data` trong là mảng danh sách nằm bên trong object phân trang (`PagedResult`, cùng cấp với `totalCount`, `pageNumber`, `pageSize`). Tầng API bóc sẵn hai lớp này và chuẩn hóa thành `{ items, totalCount, pageNumber, pageSize }` để giao diện dùng gọn một lớp.
- **Dữ liệu đi từ Backend lên màn hình Dashboard như thế nào?**
  > Khi mở trang, `useEffect` trong `DashboardManager.jsx` gọi các Service (`StaffService`, `DoctorService`, `HealthRecordService`). Service gọi xuống tầng API dùng `fetch` kèm JWT gửi lên Backend .NET. Nhận JSON trả về, tầng API bóc dữ liệu và trả object `{ items, totalCount }` về cho `DashboardManager` hứng vào biến `recordRes`, lưu vào `useState` (`setTotalRecords`, `setRecords`), sau đó truyền qua `props` xuống `DashboardStatsCharts` và `DashboardRecentRecords` để hiển thị lên màn hình.
