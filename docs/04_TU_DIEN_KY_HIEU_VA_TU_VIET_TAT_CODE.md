# 04. Từ Điển Đầy Đủ Ký Hiệu, Hằng Số, Icon & Từ Viết Tắt Trong Code VnuaCare-UI

Tài liệu tra cứu nhanh cho người mới nhập môn: giải thích **tất cả** tên icon, hằng số VIẾT HOA, biến `useState`, từ viết tắt trong hàm mũi tên và thuật ngữ y tế/kỹ thuật đang xuất hiện trong toàn bộ thư mục `src/`.

---

## 1. Từ Điển Toàn Bộ 21 Icon (`src/components/SupportAgent/Icons.jsx`)

Tên icon trong dự án đặt theo chuẩn thư viện icon Lucide/Feather (tiếng Anh ngắn gọn):

| Tên Component Icon | Dịch tiếng Anh gốc | Hình dáng & Nơi sử dụng |
| :--- | :--- | :--- |
| **`IconRefreshCw`** | Refresh **C**lock**w**ise *(Xoay theo chiều kim đồng hồ)* | Mũi tên xoay tròn — dùng cho nút **Làm mới / Tải lại / Đặt lại bộ lọc**. |
| **`IconAlertTriangle`** | Alert Triangle *(Tam giác cảnh báo)* | Hình tam giác có dấu `!` — dùng trong hộp thoại **Xác nhận xóa**. |
| **`IconBell`** | Bell *(Cái chuông)* | Hình chuông thông báo ở góc trên bên phải `Header`. |
| **`IconCampaigns`** | Campaigns *(Đợt / Chiến dịch)* | Hình cuốn lịch — dùng cho thẻ KPI **Đợt khám sức khỏe**. |
| **`IconCheck`** | Check *(Dấu tích)* | Dấu tích `✓` — dùng cho thông báo thành công (Toast) và nút **Lưu**. |
| **`IconClose`** | Close *(Đóng)* | Dấu nhân `✕` — dùng để đóng cửa sổ Modal. |
| **`IconDashboard`** | Dashboard *(Bảng điều khiển)* | Hình 4 ô vuông lưới — mục **Bảng điều khiển** trên Sidebar. |
| **`IconDoctors`** | Doctors *(Bác sĩ)* | Hình ống nghe y tế — mục **Quản lý bác sĩ** & thẻ KPI Bác sĩ. |
| **`IconDownload`** | Download *(Tải xuống)* | Mũi tên chỉ xuống khay — dùng cho nút xuất/tải tệp. |
| **`IconEdit`** | Edit *(Chỉnh sửa)* | Hình cây bút chì — nút **Sửa** trên mỗi dòng bảng. |
| **`IconEye`** | Eye *(Con mắt)* | Hình con mắt — nút **Xem & Nhập 5 tab khám chuyên khoa** trên bảng Hồ sơ. |
| **`IconLogout`** | Logout *(Đăng xuất)* | Hình cánh cửa có mũi tên đi ra — nút **Đăng xuất** trên Header. |
| **`IconMail`** | Mail *(Thư điện tử)* | Hình phong bì thư (icon dự phòng). |
| **`IconPlus`** | Plus *(Dấu cộng)* | Dấu `+` — dùng cho các nút **Thêm mới / Tạo hồ sơ / Thêm phiếu**. |
| **`IconRecords`** | Records *(Hồ sơ)* | Hình tờ giấy hồ sơ — mục **Hồ sơ khám cán bộ** & thẻ KPI Hồ sơ. |
| **`IconSearch`** | Search *(Tìm kiếm)* | Hình kính lúp — nằm bên trong ô nhập tìm kiếm ở mọi trang. |
| **`IconSettings`** | Settings *(Cài đặt)* | Hình bánh răng — mục **Cài đặt** trên Sidebar. |
| **`IconStaffs`** | Staffs *(Nhân viên / Cán bộ)* | Hình nhóm người — mục **Quản lý nhân viên** & thẻ KPI Cán bộ. |
| **`IconTag`** | Tag *(Thẻ nhãn)* | Hình thẻ nhãn phân loại (icon dự phòng). |
| **`IconTrash`** | Trash *(Thùng rác)* | Hình thùng rác — nút **Xóa** trên mỗi dòng bảng / xóa phiếu CĐHA. |
| **`IconUsers`** | Users *(Người dùng / Tài khoản)* | Hình tài khoản người dùng — mục **Quản lý người dùng** trên Sidebar. |

---

## 2. Từ Điển Toàn Bộ Hằng Số VIẾT HOA (`UPPER_SNAKE_CASE`)

Quy ước lập trình: Hằng số cố định (không thay đổi lúc chạy) được viết **IN HOA cách nhau bằng dấu gạch dưới `_`**.

| Hằng số | Nằm ở file | Nghĩa & Công dụng |
| :--- | :--- | :--- |
| **`STAT_CARDS`** | `src/utils/index.js` | **Stat**istics **Cards** (Thẻ thống kê): Cấu hình 4 thẻ KPI trên Dashboard (nhãn, icon, màu nhấn, trang đích khi bấm). |
| **`MENU_ITEMS`** | `src/utils/index.js` | Danh sách các mục trên thanh Nav trái kèm danh sách quyền `roles` được phép xem. |
| **`METHODS`** | `src/utils/index.js` | 4 phương thức HTTP chuẩn khi gọi `fetch()`: `GET` (lấy), `POST` (tạo/lọc), `PUT` (sửa), `DELETE` (xóa). |
| **`ROLES`** | `src/utils/index.js` | Mã 4 vai trò chuẩn khớp 100% với Backend: `SUPER_ADMIN`, `HEALTH_ADMIN`, `DOCTOR`, `STAFF`. |
| **`ROLE_LABELS`** | `src/utils/index.js` | Từ điển dịch mã `ROLES` sang tiếng Việt đẹp (VD: `SUPER_ADMIN` → `'Quản trị hệ thống'`). |
| **`RECORD_STATUS`** | `src/utils/index.js` | Mã 4 trạng thái hồ sơ khám: `PENDING` (Chờ khám), `IN_PROGRESS` (Đang khám), `COMPLETED` (Đã hoàn thành), `CANCELLED` (Đã hủy). |
| **`RECORD_STATUS_LABELS`** | `src/utils/index.js` | Từ điển dịch mã `RECORD_STATUS` sang tiếng Việt. |
| **`DEFAULT_HEALTH_CLASSIFICATIONS`** | `src/utils/index.js` | Danh mục 5 mức phân loại sức khỏe theo Bộ Y tế (`Loại I` đến `Loại V`). |
| **`DEFAULT_RECORD_STATUSES`** | `src/utils/index.js` | Danh mục trạng thái dự phòng cho dropdown lọc nếu API trạng thái chưa phản hồi. |
| **`AVATAR_PRESETS`** | `src/utils/index.js` | Danh sách 6 ảnh đại diện SVG dựng sẵn (`bacsi-1`, `bacsi-2`, `nam-1`, `nam-2`, `nu-1`, `nu-2`). |
| **`ModelMode`** | `src/utils/index.js` | Chế độ mở Modal: `CREATE` (đang tạo mới), `EDIT` (đang sửa), `DELETE` (đang xóa). |
| **`SystemColors`** | `src/utils/index.js` | Bảng màu chủ đạo dùng chung (`primary` xanh ngọc `#0f766e`, `success` xanh lá, `danger` đỏ, `warning` vàng cam, `info` xanh dương, `muted` xám). |
| **`API_BASE_URL`** | `src/api/httpClient.js` | Địa chỉ gốc của Backend đọc từ biến môi trường `VITE_API_BASE_URL` (để rỗng `''` khi chạy local qua Vite Proxy). |
| **`INITIAL_FORM`** *(và `INITIAL_VITAL_SIGNS`, `INITIAL_INTERNAL_EXAM`, `INITIAL_CONCLUSION`)* | Trong các trang/tab | Giá trị **khởi tạo rỗng ban đầu** của form, dùng để reset form sạch sẽ mỗi khi mở Modal Tạo mới. |
| **`RECORD_TABS`** | `RecordDetailModal.jsx` | Mảng cấu hình danh sách 5 tab khám chuyên môn. |
| **`MODALITY_CONFIG`** | `src/models/DiagnosticReport.js` | Cấu hình các loại kỹ thuật chẩn đoán hình ảnh (`ULTRASOUND`, `XRAY`, `ECG`, `ENDOSCOPY`, `CT`, `MRI`) kèm màu thẻ. |
| **`CLINICAL_SPECIALTIES_CONFIG`** | `src/models/SpecialistExam.js` | Cấu hình 6 chuyên khoa lẻ (`EYE`, `ENT`, `DENTAL`, `DERMATOLOGY`, `SURGERY`, `OBSTETRICS`) cho Tab 3. |

---

## 3. Từ Điển Các Biến `useState` & Cơ Chế Hay Gặp

Quy tắc của React: `const [tenBien, setTenBien] = useState(giaTriDau);` — `tenBien` để **đọc**, `setTenBien(...)` để **cập nhật và vẽ lại giao diện**.

| Biến / Hàm | Giải thích chi tiết cách hoạt động |
| :--- | :--- |
| **`refreshKey` / `setRefreshKey`** | **Chìa khóa làm mới bảng.** Nó chỉ là 1 con số bắt đầu từ `0`. Ta đặt `refreshKey` vào mảng phụ thuộc `[..., refreshKey]` của `useEffect`. Mỗi khi Thêm/Sửa/Xóa xong, chỉ cần gọi `setRefreshKey((prev) => prev + 1)` (0 → 1 → 2) là `useEffect` tự chạy lại để tải danh sách mới nhất từ SQL! |
| **`isCancelled`** | **Cờ hủy cập nhật** khai báo bên trong `useEffect`. Ban đầu là `false`; nếu người dùng chuyển trang trước khi API trả về, hàm dọn dẹp (`cleanup`) sẽ đổi thành `true` để chặn `setState` (tránh lỗi bộ nhớ). |
| **`loading` / `setLoading`** | Trạng thái `true/false` cho biết đang tải danh sách dữ liệu từ Backend (để hiện chữ *"Đang tải..."*). |
| **`submitting` / `saving`** | Trạng thái `true/false` khi bấm nút **Lưu / Tạo mới** (dùng để khóa nút `disabled={saving}` tránh người dùng bấm đúp tạo trùng 2 bản ghi). |
| **`deleting` / `deleteLoading`** | Trạng thái `true/false` khi đang gọi API xóa bản ghi. |
| **`modalMode`** | Lưu trạng thái cửa sổ Modal: `null` (đang đóng), `'CREATE'` (mở form Thêm mới), `'EDIT'` (mở form Sửa). |
| **`deletingRecord` / `deletingDoctor` / `deletingStaff` / `deletingUser`** | Lưu đối tượng bản ghi đang chờ xác nhận xóa; nếu `null` thì ẩn hộp thoại xác nhận, khác `null` thì hiện hộp thoại hỏi *"Bạn có chắc muốn xóa..."*. |
| **`viewingRecord`** | Lưu hồ sơ đang được mở xem 5 tab khám (`null` = đóng `RecordDetailModal`). |
| **`formData`** | Một Object gom toàn bộ giá trị các ô input trong 1 form (thay vì khai báo 10 cái `useState` rời rạc). |
| **`toast` / `showToast`** | Chuỗi thông báo nổi góc trên phải màn hình, tự biến mất sau `3000ms` (3 giây) nhờ `setTimeout`. |
| **`pageNumber` / `pageSize` / `totalCount`** | 3 biến chuẩn của phân trang: **Trang hiện tại** (mặc định 1), **Số dòng/trang** (mặc định 10), **Tổng số dòng trong DB** (để tính tổng số trang `Math.ceil(totalCount / pageSize)`). |
| **`sidebarCollapsed`** | Trạng thái `true/false` của thanh menu bên trái (`true` = thu gọn chỉ hiện icon 72px, `false` = mở rộng 248px). |
| **`activeTab` / `activeSpecialty`** | Lưu mã của trang / tab / chuyên khoa đang được người dùng bấm chọn để tô sáng nút màu xanh ngọc (`active`). |
| **`examsMap`** | Trong Tab 3 (`SpecialistExamsTab`), là 1 Object lưu kết quả khám của nhiều chuyên khoa theo dạng từ điển `{ EYE: {...}, ENT: {...} }` để bấm qua lại không bị mất. |

---

## 4. Từ Điển Các Tên Biến Viết Tắt Ngắn (Trong Hàm Mũi Tên `(...) => ...`)

Lập trình viên thường đặt tên tham số ngắn gọn khi duyệt mảng (`.map()`, `.filter()`) hoặc bắt sự kiện:

| Viết tắt | Viết đầy đủ | Ý nghĩa trong code | Ví dụ thực tế |
| :--- | :--- | :--- | :--- |
| **`prev`** | **prev**ious *(giá trị trước đó)* | Giá trị cũ ngay trước khi cập nhật state trong React. | `setRefreshKey((prev) => prev + 1)` *(lấy số cũ cộng thêm 1)* |
| **`next`** | **next** *(giá trị tiếp theo)* | Giá trị mới sau khi đảo trạng thái. | `const next = !prev;` *(đang mở thì đóng, đang đóng thì mở)* |
| **`e`** | **e**vent *(sự kiện)* | Sự kiện trình duyệt gửi vào khi gõ phím hoặc bấm nút (`e.target.value` là chữ vừa gõ, `e.preventDefault()` ngăn reload trang). | `onChange={(e) => setSearch(e.target.value)}` |
| **`err`** | **err**or *(lỗi)* | Đối tượng lỗi bắt được trong khối `catch (err)` (`err.message` là câu thông báo lỗi). | `catch (err) { setError(err.message); }` |
| **`res`** | **res**ponse / **res**ult *(kết quả trả về)* | Dữ liệu Backend trả về sau khi `await` gọi API xong. | `const res = await HealthRecordService.getHealthRecords(...)` |
| **`rec` / `r`** | **rec**ord *(hồ sơ)* | 1 phần tử hồ sơ khám khi duyệt mảng `records.map((rec) => ...)`. | `records.filter((r) => r.status === 'COMPLETED')` |
| **`doc`** | **doc**tor *(bác sĩ)* | 1 phần tử bác sĩ trong mảng `doctorsList.map((doc) => ...)`. | `{doc.fullName} ({doc.doctorCode})` |
| **`st`** | **st**aff *(cán bộ)* | 1 phần tử cán bộ trong mảng `staffsList.map((st) => ...)`. | `{st.fullName} ({st.staffCode})` |
| **`camp`** | **camp**aign *(đợt khám)* | 1 phần tử đợt khám trong mảng `campaigns.map((camp) => ...)`. | `{camp.campaignName} ({camp.year})` |
| **`av`** | **av**atar *(ảnh đại diện)* | 1 ảnh mẫu trong `AVATAR_PRESETS.map((av) => ...)`. | `<img src={av.url} alt={av.label} />` |
| **`sec`** | **sec**tion *(phân vùng)* | 1 vùng giải phẫu (VD: Gan, Mật, Phổi) trong phiếu CĐHA Tab 4. | `this.sections.forEach((sec) => ...)` |
| **`b`** | **b**ullet *(gạch đầu dòng)* | 1 dòng mô tả bên trong vùng giải phẫu ở Tab 4. | `sec.bullets.map((b) => b.trim())` |
| **`dto`** | **D**ata **T**ransfer **O**bject | Object dữ liệu thô nhận trực tiếp từ Backend API trước khi chuyển thành Model. | `DiagnosticReport.fromApi(dto)` |
| **`p`** | **p**age *(số trang)* | Số thứ tự trang khi vẽ các nút `1, 2, 3...` ở thanh phân trang. | `.map((p) => <button>{p}</button>)` |
| **`d`** | **d**ate *(ngày)* | Biến `new Date(dateStr)` trong hàm định dạng ngày tháng. | `const d = new Date(dateStr);` |
| **`val`** | **val**ue *(giá trị)* | Giá trị mới truyền vào hàm callback `onChange`. | `onSearchChange={(val) => setSearch(val)}` |
| **`msg`** | **m**e**s**sa**g**e *(thông báo)* | Chuỗi nội dung hiển thị trên Toast. | `const showToast = (msg) => ...` |
| **`m` / `u` / `n`** | menu / user / name | Tham số tạm 1 chữ cái trong `.find()` / `.map()` ngắn 1 dòng. | `MENU_ITEMS.find((m) => m.id === tabId)` |

---

## 5. Từ Điển Thuật Ngữ Y Tế & Kỹ Thuật Viết Tắt Trong Dự Án

### Thuật ngữ Y tế (Nghiệp vụ VNUA Care):
| Viết tắt | Nghĩa đầy đủ | Giải thích |
| :--- | :--- | :--- |
| **`KSK`** | Khám sức khỏe | Khám sức khỏe định kỳ cán bộ, giảng viên VNUA. |
| **`SID`** | **S**ample **ID** *(Mã tiếp nhận / Mã vạch mẫu)* | Mã định danh duy nhất của 1 hồ sơ khám trong đợt (VD: `221123-120002940950`). |
| **`CĐHA`** | Chẩn đoán hình ảnh | Gồm Siêu âm, X-quang, CT, MRI (Tab 4). |
| **`KTS`** | Kỹ thuật số | Chụp X-quang tim phổi thẳng kỹ thuật số. |
| **`BMI`** | **B**ody **M**ass **I**ndex | Chỉ số khối cơ thể = $\text{Cân nặng (kg)} / \text{Chiều cao (m)}^2$. |
| **`BP`** | **B**lood **P**ressure | Huyết áp (`systolic_bp`: tâm thu / trên, `diastolic_bp`: tâm trương / dưới). |
| **`SpO2`** | Saturation of Peripheral Oxygen | Độ bão hòa oxy trong máu (%). |
| **`ECG`** | **E**lectro**c**ardio**g**ram | Điện tâm đồ 12 chuyển đạo. |
| **`ENT` / `TMH`** | **E**ar, **N**ose, **T**hroat | Chuyên khoa Tai – Mũi – Họng. |
| **`CCHN`** | Chứng chỉ hành nghề | Mã giấy phép hành nghề của bác sĩ (VD: `CCHN-003491`). |
| **`ICD-10`** | International Classification of Diseases 10 | Bộ mã phân loại bệnh quốc tế (VD: `I10` Tăng huyết áp, `E11` Tiểu đường type 2). |

### Thuật ngữ Lập trình & CSDL:
| Viết tắt | Nghĩa đầy đủ | Giải thích ngắn gọn |
| :--- | :--- | :--- |
| **`SPA`** | **S**ingle **P**age **A**pplication | Ứng dụng web 1 trang (React chuyển màn hình mượt mà không load lại toàn trang). |
| **`CRUD`** | **C**reate, **R**ead, **U**pdate, **D**elete | 4 thao tác cơ bản: Thêm, Xem, Sửa, Xóa dữ liệu. |
| **`JWT`** | **J**SON **W**eb **T**oken | Chuỗi token mã hóa (`Bearer ...`) chứng minh người dùng đã đăng nhập hợp lệ. |
| **`RBAC`** | **R**ole-**B**ased **A**ccess **C**ontrol | Phân quyền truy cập theo vai trò (`SUPER_ADMIN`, `HEALTH_ADMIN`, `DOCTOR`, `STAFF`). |
| **`CORS`** | **C**ross-**O**rigin **R**esource **S**haring | Cơ chế bảo mật trình duyệt khi gọi API khác cổng/tên miền (đã xử lý bằng Vite Proxy + Policy ở Backend). |
| **`DDL` / `DML`** | Data Definition / Manipulation Language | `DDL`: lệnh tạo cấu trúc bảng (`CREATE TABLE`, `DROP TABLE`); `DML`: lệnh thao tác dữ liệu (`INSERT`, `UPDATE`, `DELETE`, `SELECT`). |
| **`PK` / `FK` / `UQ`** | Primary Key / Foreign Key / Unique | Khóa chính (định danh duy nhất) / Khóa ngoại (liên kết sang bảng khác) / Ràng buộc không được trùng lặp (VD: `username` không trùng `admin`). |

---

## 6. Từ Điển Các Ký Hiệu & Hàm JavaScript / React Đặc Biệt Trong Code

Đây là những ký hiệu ngắn mà người mới nhập môn hay thấy lạ nhất khi đọc code trong `VnuaCare-UI`:

| Ký hiệu / Hàm | Tên gọi | Giải thích cực dễ hiểu | Ví dụ trong dự án |
| :--- | :--- | :--- | :--- |
| **`?.`** | Optional Chaining *(Chấm an toàn)* | Truy cập thuộc tính an toàn: nếu phía trước là `null`/`undefined` thì trả về `undefined` thay vì văng lỗi trắng trang. | `res?.totalCount`, `user?.role` |
| **`??`** | Nullish Coalescing *(Giá trị thay thế khi rỗng)* | Nếu bên trái là `null` hoặc `undefined` thì lấy bên phải (số `0` vẫn giữ nguyên là `0`). | `statsById[card.id] ?? 0` |
| **`\|\|`** | Logical OR *(Giá trị mặc định)* | Nếu bên trái rỗng / `false` / `0` / `''` / `null` thì lấy giá trị dự phòng bên phải. | `res.items \|\| []` |
| **`&&`** | Conditional Render *(Hiện khi đúng)* | Trong JSX React: nếu điều kiện bên trái đúng (`true`) thì mới vẽ thẻ HTML bên phải. | `{toast && <div className="admin-toast">...</div>}` |
| **`a ? b : c`** | Ternary Operator *(If/Else 1 dòng)* | Nếu `a` đúng thì trả về `b`, ngược lại trả về `c`. | `loading ? 'Đang tải...' : 'Lưu'` |
| **`...`** | Spread Operator *(Rải mảng / Object)* | Sao chép toàn bộ thuộc tính cũ rồi ghi đè 1 trường mới (tránh sửa trực tiếp state). | `setFormData({ ...formData, email: 'a@b.vn' })` |
| **`` `${biến}` ``** | Template Literal *(Chuỗi mẫu)* | Ghép chuỗi kèm chèn biến trực tiếp bên trong dấu huyền `` ` ``. | `` `${API_BASE_URL}${doctorRouter.getFilter}` `` |
| **`.map()`** | Duyệt biến đổi mảng | Đi qua từng phần tử trong mảng để tạo mảng mới (trong React dùng để vẽ danh sách `<tr>`, `<option>`, thẻ KPI). | `records.map((rec) => <tr key={rec.recordId}>...</tr>)` |
| **`.filter()`** | Lọc mảng | Giữ lại các phần tử thỏa điều kiện `true`, loại bỏ phần tử sai. | `MENU_ITEMS.filter((item) => item.roles.includes(userRole))` |
| **`.find()`** | Tìm 1 phần tử đầu tiên | Trả về đúng phần tử đầu tiên khớp điều kiện (không thấy trả về `undefined`). | `MENU_ITEMS.find((m) => m.id === tabId)` |
| **`.slice(0, 5)`** | Cắt mảng | Lấy từ vị trí `0` đến trước vị trí `5` (tức lấy tối đa 5 phần tử đầu). | `records.slice(0, 5)` |
| **`.trim()`** | Cắt khoảng trắng thừa | Xóa dấu cách ở đầu và cuối chuỗi trước khi gửi lên Backend. | `search.trim()` |
| **`.padStart(2, '0')`** | Đệm số `0` phía trước | Biến ngày/tháng 1 chữ số thành 2 chữ số (`5` → `'05'`). | `String(d.getDate()).padStart(2, '0')` |
| **`Object.entries(obj)`** | Đổi Object thành mảng cặp `[key, value]` | Dùng khi muốn `.map()` qua một Object như `ROLE_LABELS`. | `Object.entries(ROLE_LABELS).map(([k, v]) => ...)` |
| **`Object.values(obj).flat()`** | Lấy toàn bộ giá trị & làm phẳng mảng | Dùng trong `parseApiError` để gom tất cả thông báo lỗi validation của .NET thành 1 danh sách. | `Object.values(result.errors).flat().join(', ')` |
| **`Array.from({ length: n })`** | Tạo mảng độ dài `n` | Dùng để sinh danh sách số trang `[1, 2, 3, ... totalPages]` ở thanh phân trang. | `Array.from({ length: totalPages }, (_, i) => i + 1)` |
| **`#tenHam`** | Private Method *(Hàm riêng tư trong Class)* | Dấu `#` nghĩa là hàm chỉ được gọi nội bộ bên trong class đó, bên ngoài không gọi được. | `#assertValidReport()` trong `DiagnosticReportService.js` |
| **`import.meta.env.VITE_*`** | Biến môi trường Vite | Đọc cấu hình từ file `.env` (Vite yêu cầu biến Frontend bắt buộc có tiền tố `VITE_`). | `import.meta.env.VITE_API_BASE_URL` |
| **`encodeURIComponent(str)`** | Mã hóa ký tự URL | Biến dấu cách, tiếng Việt hoặc ký tự đặc biệt thành mã an toàn khi ghép vào query `?role=...`. | `encodeURIComponent(modalityType)` |
| **`new Date(s).toISOString()`** | Đổi ngày sang chuẩn ISO 8601 | Chuyển ngày `YYYY-MM-DD` thành `2026-11-20T00:00:00.000Z` để Backend .NET đọc `DateTime` chính xác. | `new Date(formData.actualCheckupDate).toISOString()` |

---

## 7. Từ Điển Các Hàm Tiện Ích Dùng Chung Trong Dự Án

| Tên hàm | File | Công dụng |
| :--- | :--- | :--- |
| **`getAuthHeaders()`** | `src/api/httpClient.js` | Tạo header `'Content-Type': 'application/json'` kèm `Authorization: Bearer <accessToken>` lấy từ `localStorage`. |
| **`parseApiError(result, defaultMsg)`** | `src/api/httpClient.js` | Tự động bóc tách câu thông báo lỗi tiếng Việt từ phản hồi của Backend .NET (`message`, `errors`, `title`). |
| **`formatDate(dateStr)`** | `src/utils/utils.js` | Đổi chuỗi ngày từ API sang định dạng Việt Nam `DD/MM/YYYY` (trả `'—'` nếu rỗng hoặc `0001-01-01`). |
| **`toDateInputValue(dateStr)`** | `SearchHealthRecordList.jsx`, `Settings.jsx` | Đổi chuỗi ngày từ API sang `YYYY-MM-DD` để đổ đúng vào thẻ `<input type="date">`. |
| **`canAccessTab(tabId, userRole)`** | `src/app/AppRouter.jsx` | Kiểm tra vai trò đang đăng nhập có nằm trong danh sách `roles` của `MENU_ITEMS` hay không. |
| **`calculatePercent(count, total)`** | `DashboardStatsCharts.jsx` | Tính tỷ lệ phần trăm làm tròn số nguyên `Math.round((count / total) * 100)` cho 2 biểu đồ thanh ngang. |
| **`matchesClassification(val, code)`** | `DashboardStatsCharts.jsx` | Kiểm tra hồ sơ thuộc `Loại I`..`Loại V` (tránh nhầm `'Loại I'` với `'Loại II'`, `'Loại III'`, `'Loại IV'`). |

