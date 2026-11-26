# 05. Từ Điển Đầy Đủ Ký Hiệu, Biến, Hằng Số Trong Code & Bộ Câu Hỏi Bảo Vệ

> Tài liệu tra cứu toàn diện mọi tên Icon, hằng số IN HOA, biến `useState`, từ viết tắt, toán tử JavaScript/React, hàm tiện ích trong `VnuaCare-UI`, kèm **10 câu hỏi – trả lời trọng tâm** thường gặp nhất khi bảo vệ đồ án.

---

## 1. Từ Điển Toàn Bộ 21 Icon (`src/components/SupportAgent/Icons.jsx`)

| Tên Component Icon | Nghĩa gốc tiếng Anh | Hình dáng & Vị trí sử dụng |
| :--- | :--- | :--- |
| **`IconRefreshCw`** | Refresh Clockwise | Mũi tên xoay tròn — nút **Làm mới số liệu / Tải lại / Đặt lại bộ lọc**. |
| **`IconAlertTriangle`** | Alert Triangle | Tam giác cảnh báo `!` — hộp thoại **Xác nhận xóa** và thông báo trống. |
| **`IconBell`** | Bell | Cái chuông — nút thông báo y tế trên thanh `Header`. |
| **`IconCampaigns`** | Campaigns | Cuốn lịch — thẻ KPI **Đợt khám sức khỏe** trên Dashboard. |
| **`IconCheck`** | Check | Dấu tích `✓` — thông báo Toast thành công và nút **Lưu kết quả**. |
| **`IconClose`** | Close | Dấu nhân `✕` — nút đóng cửa sổ Modal. |
| **`IconDashboard`** | Dashboard | Lưới 4 ô vuông — mục **Bảng điều khiển** trên Sidebar. |
| **`IconDoctors`** | Doctors | Ống nghe y tế — mục **Quản lý bác sĩ** & thẻ KPI Bác sĩ. |
| **`IconDownload`** | Download | Mũi tên tải xuống — xuất/tải tệp báo cáo. |
| **`IconEdit`** | Edit | Cây bút chì — nút **Chỉnh sửa** trên từng dòng bảng. |
| **`IconEye`** | Eye | Con mắt — nút **Mở cửa sổ 4 Tab khám chuyên môn** trên bảng Hồ sơ. |
| **`IconLogout`** | Logout | Cánh cửa & mũi tên ra — nút **Đăng xuất** trên Header. |
| **`IconMail`** | Mail | Phong bì thư điện tử. |
| **`IconPlus`** | Plus | Dấu cộng `+` — nút **Thêm mới / Tạo hồ sơ / Thêm phiếu CĐHA**. |
| **`IconRecords`** | Records | Tờ hồ sơ y tế — mục **Hồ sơ khám cán bộ** & thẻ KPI Hồ sơ. |
| **`IconSearch`** | Search | Kính lúp — nằm trong ô nhập từ khóa tìm kiếm ở mọi phân hệ. |
| **`IconSettings`** | Settings | Bánh răng — mục **Cài đặt** trên Sidebar. |
| **`IconStaffs`** | Staffs | Nhóm người — mục **Quản lý nhân viên** & thẻ KPI Cán bộ. |
| **`IconTag`** | Tag | Thẻ nhãn phân loại. |
| **`IconTrash`** | Trash | Thùng rác — nút **Xóa** dòng dữ liệu hoặc xóa/hủy phiếu CĐHA. |
| **`IconUsers`** | Users | Tài khoản người dùng — mục **Quản lý người dùng** trên Sidebar. |

---

## 2. Từ Điển Toàn Bộ Hằng Số VIẾT HOA (`UPPER_SNAKE_CASE`)

| Hằng số | Vị trí khai báo | Ý nghĩa & Công dụng |
| :--- | :--- | :--- |
| **`METHODS`** | `src/utils/index.js` | 4 phương thức HTTP chuẩn dùng trong `fetch()`: `GET`, `POST`, `PUT`, `DELETE`. |
| **`ROLES`** | `src/utils/index.js` | Mã 4 vai trò khớp Backend: `SUPER_ADMIN`, `HEALTH_ADMIN`, `DOCTOR`, `STAFF`. |
| **`ROLE_LABELS`** | `src/utils/index.js` | Từ điển đổi mã `ROLES` sang tên tiếng Việt hiển thị trên Header & Cài đặt. |
| **`MENU_ITEMS`** | `src/utils/index.js` | Cấu hình 6 mục menu Sidebar kèm mảng `roles` quy định vai trò nào được phép truy cập. |
| **`STAT_CARDS`** | `src/utils/index.js` | Cấu hình 4 thẻ chỉ số KPI trên Dashboard (id, nhãn, icon, màu nhấn, tab đích). |
| **`RECORD_STATUS`** | `src/utils/index.js` | Mã 4 trạng thái hồ sơ: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. |
| **`RECORD_STATUS_LABELS`** | `src/utils/index.js` | Nhãn tiếng Việt tương ứng của 4 trạng thái hồ sơ (*Chờ khám*, *Đang khám*, *Đã hoàn thành*, *Đã hủy*). |
| **`DEFAULT_HEALTH_CLASSIFICATIONS`** | `src/utils/index.js` | Danh mục 5 mức phân loại sức khỏe chuẩn Bộ Y tế (`Loại I` → `Loại V`). |
| **`DEFAULT_RECORD_STATUSES`** | `src/utils/index.js` | Danh sách trạng thái chuẩn phục vụ các ô `<select>` lọc và cập nhật hồ sơ. |
| **`AVATAR_PRESETS`** | `src/utils/index.js` | Danh sách 6 ảnh đại diện SVG dựng sẵn cho hồ sơ cán bộ và trang Cài đặt. |
| **`ModelMode`** | `src/utils/index.js` | Chế độ hoạt động của Modal dùng chung: `CREATE` (tạo mới), `EDIT` (chỉnh sửa), `DELETE` (xóa). |
| **`SystemColors`** | `src/utils/index.js` | Bảng màu hệ thống dùng chung cho biểu đồ và trạng thái (`primary`, `success`, `danger`, `warning`, `info`, `muted`). |
| **`API_BASE_URL`** | `src/api/httpClient.js` | Địa chỉ gốc của máy chủ API đọc từ biến môi trường `VITE_API_BASE_URL`. |
| **`RECORD_TABS`** | `RecordDetailModal.jsx` | Mảng cấu hình 4 Tab khám chuyên môn trong cửa sổ chi tiết hồ sơ. |
| **`MODALITY_CONFIG`** | `src/models/DiagnosticReport.js` | Cấu hình 6 loại kỹ thuật CĐHA (`ULTRASOUND`, `XRAY`, `ECG`, `ENDOSCOPY`, `CT`, `MRI`). |
| **`CLINICAL_SPECIALTIES_CONFIG`** | `src/models/SpecialistExam.js` | Cấu hình 6 chuyên khoa lẻ lâm sàng (`EYE`, `ENT`, `DENTAL`, `DERMATOLOGY`, `SURGERY`, `OBSTETRICS`). |
| **`INITIAL_FORM` / `INITIAL_VITAL_SIGNS` / `INITIAL_INTERNAL_EXAM` / `INITIAL_EXAM`** | Trong các Container & Tab khám | Giá trị khởi tạo mặc định ban đầu để làm sạch biểu mẫu khi tạo mới. |

---

## 3. Từ Điển Các Biến `useState` & Thuộc Tính Quan Trọng

| Tên biến / thuộc tính | Ý nghĩa và cơ chế hoạt động |
| :--- | :--- |
| **`refreshKey` / `setRefreshKey`** | Biến đếm số nguyên (`0, 1, 2...`) đặt trong mảng phụ thuộc `[..., refreshKey]` của `useEffect`. Mỗi khi Thêm/Sửa/Xóa hoặc bấm *Làm mới*, tăng `refreshKey` lên 1 để kích hoạt `useEffect` tự gọi lại API tải dữ liệu mới. |
| **`isCancelled`** | Biến cờ cục bộ trong `useEffect`: đổi thành `true` khi người dùng rời trang trước lúc API trả về, chặn lệnh `setState` muộn gây lỗi bộ nhớ. |
| **`loading` / `saving` / `submitting` / `deleting`** | Các cờ `true/false` khóa nút bấm (`disabled`) và hiển thị trạng thái chờ xử lý, chống bấm đúp gửi trùng request. |
| **`pageNumber` / `pageSize` / `totalCount`** | Bộ 3 biến phân trang: trang hiện tại, số dòng mỗi trang và tổng số bản ghi trong CSDL. |
| **`examsMap` & `unsavedCodes`** | Trong Tab 3 (`SpecialistExamsTab`): `examsMap` lưu dữ liệu riêng từng chuyên khoa theo mã khoa; `unsavedCodes` là mảng các mã khoa đã gõ sửa nhưng chưa bấm Lưu (hiện nhãn `● Chưa lưu`). |
| **`clientKey` & `selectedKey`** | Trong Tab 4 (`DiagnosticReportsTab`): mỗi phiếu có khóa `clientKey` duy nhất (`report-<id>` hoặc `draft-...`); `selectedKey` giữ khóa của phiếu đang mở giúp thêm nhiều phiếu mới liên tiếp không bị đè. |

---

## 4. Từ Điển Viết Tắt Ngắn & Cú Pháp JavaScript / React Hay Gặp

### Tên biến viết tắt trong hàm mũi tên:
- **`prev`**: `previous` — giá trị state ngay trước đó (`setRefreshKey((prev) => prev + 1)`).
- **`e`**: `event` — đối tượng sự kiện trình duyệt (`e.target.value`, `e.preventDefault()`).
- **`err`**: `error` — đối tượng lỗi bắt trong `catch (err)`.
- **`res` / `recordRes` / `staffRes` / `doctorRes`**: `response` — hộp dữ liệu kết quả trả về từ tầng Service/API.
- **`rec` / `r`**, **`doc`**, **`st`**, **`camp`**, **`sec`**, **`b`**, **`dto`**: lần lượt là phần tử `record` (hồ sơ), `doctor` (bác sĩ), `staff` (cán bộ), `campaign` (đợt khám), `section` (vùng giải phẫu), `bullet` (gạch đầu dòng), `Data Transfer Object` (dữ liệu thô từ API).

### Toán tử & hàm đặc biệt:
- **`?.` (Optional Chaining):** Chấm truy cập an toàn — nếu vế trước `null`/`undefined` thì dừng lại trả `undefined`, không làm sập trang (`recordRes?.items`).
- **`??` (Nullish Coalescing):** Chỉ lấy giá trị dự phòng bên phải khi bên trái là `null` hoặc `undefined`, giữ nguyên số `0` (`statsById[card.id] ?? 0`).
- **`||` (Logical OR):** Lấy giá trị mặc định bên phải khi bên trái rỗng / `0` / `false` / `null` (`result?.data || []`).
- **`...` (Spread Operator):** Sao chép nông toàn bộ thuộc tính sang object/mảng mới để cập nhật state đúng chuẩn bất biến của React (`{ ...formData, email: val }`).
- **`Promise.allSettled([...])`:** Gọi song song nhiều API độc lập cùng lúc; nếu 1 API lỗi thì các API còn lại vẫn nhận kết quả bình thường.

---

## 5. Từ Điển Các Hàm Tiện Ích Tiêu Biểu

| Tên hàm | File chứa | Công dụng |
| :--- | :--- | :--- |
| **`getAuthHeaders()`** | `src/api/httpClient.js` | Sinh Header JSON đính kèm `Authorization: Bearer <accessToken>`. |
| **`parseApiError(result, defaultMsg)`** | `src/api/httpClient.js` | Chuẩn hóa thông báo lỗi tiếng Việt từ mọi kiểu lỗi của Backend `.NET`. |
| **`formatDate(dateStr)`** | `src/utils/utils.js` | Định dạng ngày API sang chuẩn Việt Nam `DD/MM/YYYY`. |
| **`toDateInputValue(dateStr)`** | `SearchHealthRecordList.jsx`, `Settings.jsx` | Định dạng ngày API sang `YYYY-MM-DD` cho thẻ `<input type="date">`. |
| **`formatLocalDateTimeInput(date)`** | `src/models/DiagnosticReport.js` | Định dạng ngày giờ địa phương `YYYY-MM-DDTHH:mm` cho ô `datetime-local`, tránh lệch 7 tiếng UTC. |
| **`evaluateBmi(bmiValue)`** | `VitalSignsTab.jsx` | So sánh và xếp loại thể trạng BMI theo chuẩn WHO châu Á. |
| **`evaluateBloodPressure(sys, dia)`** | `VitalSignsTab.jsx` | So sánh và cảnh báo mức huyết áp tâm thu / tâm trương. |
| **`calculatePercent(count, total)`** | `DashboardStatsCharts.jsx` | Tính phần trăm làm tròn số nguyên cho thanh thống kê trên Dashboard. |
| **`matchesClassification(val, code)`** | `DashboardStatsCharts.jsx` | Đối chiếu phân loại `Loại I → Loại V` chính xác, không đếm nhầm chuỗi con `'Loại I'`. |

---

## 6. Bộ 10 Câu Hỏi – Trả Lời Ngắn Gọn Khi Bảo Vệ Đồ Án

1. **Dự án sử dụng kiến trúc gì? Có phải MVVM không?**
   > Frontend React áp dụng **Kiến trúc phân tầng 4 lớp (`Pages → Components → Services → API`)** kết hợp **Container / Presentational Pattern** và **Context API**. Không phải MVVM thuần túy vì React dùng luồng dữ liệu một chiều (*One-Way Data Flow*) thay vì ràng buộc hai chiều tự động (*Two-Way Binding*), nhưng vẫn giữ tư duy tách biệt rõ dữ liệu (`models/services/api`), điều phối trạng thái (`Container`) và giao diện hiển thị (`Presentational`).

2. **Dữ liệu từ SQL Server đi lên bảng trên màn hình như thế nào?**
   > Khi mở trang, `useEffect` trong Component Cha gọi `Service` → `Service` gọi hàm trong `src/api/` → `fetch()` lấy JWT từ `httpClient.js` gửi qua Vite Proxy tới Controller `.NET` → truy vấn `VnuaCareDB` trả JSON về → tầng API chuẩn hóa thành `{ items, totalCount }` → Component Cha lưu vào `useState` rồi truyền xuống Component Con qua `props` để render bảng.

3. **Tại sao trong `recordApi.js` lại có 2 lớp `result?.data?.data`?**
   > Lớp `data` ngoài là khung phản hồi chuẩn chung của mọi API Backend (`ResponseObject`), còn lớp `data` trong là mảng bản ghi nằm trong đối tượng phân trang (`PaginationList`, đứng cùng cấp với `totalCount`, `pageNumber`, `pageSize`). Tầng API bóc sẵn 2 lớp này và đổi tên thành `items` để giao diện gọi gọn 1 lớp.

4. **Làm sao hệ thống phân quyền cho Admin, Bác sĩ và Cán bộ?**
   > Áp dụng **RBAC 3 lớp**: (1) `Sidebar.jsx` lọc mảng `MENU_ITEMS` để ẩn menu không thuộc vai trò; (2) `AppRouter.jsx` chặn điều hướng nếu gõ thẳng URL và tách riêng `STAFF` sang `StaffPortalPage`; (3) Backend `.NET` kiểm tra chữ ký JWT và Role trước khi cho phép truy xuất CSDL.

5. **Mảng phụ thuộc `[refreshKey]` của `useEffect` hoạt động ra sao?**
   > `useEffect` chạy lần đầu khi mở trang và chỉ tự động chạy lại khi giá trị trong mảng phụ thuộc thay đổi. Mỗi khi Thêm/Sửa/Xóa xong hoặc bấm nút *Làm mới*, ta gọi `setRefreshKey(prev => prev + 1)` làm số đếm tăng lên, từ đó kích hoạt `useEffect` gọi lại API lấy dữ liệu mới nhất.

6. **Tại sao phải tách riêng `httpClient.js` và `api-router.js`?**
   > Để tập trung cấu hình ở một nơi duy nhất: `api-router.js` quản lý toàn bộ đường dẫn endpoint, còn `httpClient.js` quản lý `API_BASE_URL`, tự động đính kèm thẻ JWT (`getAuthHeaders`) và chuẩn hóa lỗi (`parseApiError`), giúp 9 file API không phải viết lặp lại.

7. **Tại sao kết quả Chẩn đoán hình ảnh (Tab 4) lại lưu bằng chuỗi JSON trong cột `findings_data`?**
   > Vì mỗi kỹ thuật (Siêu âm ổ bụng, Siêu âm tuyến giáp, X-quang, Điện tim...) khảo sát các vùng giải phẫu hoàn toàn khác nhau. Lưu JSON trong `nvarchar(MAX)` kết hợp lớp `DiagnosticReport` giúp 1 bảng duy nhất lưu được linh hoạt mọi loại phiếu và mọi vùng mô tả gạch đầu dòng mà không làm phình hàng trăm cột `NULL`.

8. **Tại sao chỉ có 4 Tab trong cửa sổ khám chi tiết mà không có Tab 5 Kết luận?**
   > Toàn bộ thông tin kết luận hội đồng, lời dặn, bác sĩ ký duyệt và xếp loại sức khỏe chung (`Loại I → Loại V`) đã được tích hợp chỉnh sửa trực tiếp ngay ở biểu mẫu cập nhật Hồ sơ bên ngoài (`HealthRecordFormModal.jsx`), nên loại bỏ Tab 5 để tránh trùng lặp chức năng.

9. **Hệ thống đánh giá BMI, Huyết áp và Xếp loại Loại I → Loại V như thế nào?**
   > Tại Tab 1 (`VitalSignsTab.jsx`), hệ thống tự tính $\text{BMI} = \text{kg}/\text{m}^2$ và tự động cảnh báo màu theo chuẩn WHO châu Á (`<18.5` nhẹ cân, `18.5–22.9` bình thường, `23–24.9` thừa cân, `>=25` béo phì) cùng ngưỡng huyết áp. Còn xếp loại tổng thể `Loại I → Loại V` do Bác sĩ hội đồng xem xét tổng hợp (lấy theo chuyên khoa có mức kém nhất theo quy định Bộ Y tế) và ký chốt trên hồ sơ.

10. **Tại sao không thể phóng to favicon vượt khung trên tab trình duyệt?**
    > Ô hiển thị favicon trên thanh tab do trình duyệt khóa cứng ở kích thước `16×16 CSS px`. Để hiển thị to và nét tối đa trong khung đó, ảnh `public/favicon.png` đã được cắt sát 0px viền trong suốt thừa xung quanh và xuất ở độ phân giải `128×128` cho màn hình Retina.
