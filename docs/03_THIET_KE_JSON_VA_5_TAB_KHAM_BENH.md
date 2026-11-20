# 03. Quy Trình 5 Tab Khám Bệnh & Thiết Kế Cột JSON Phiếu CĐHA

> **Tài liệu tổng hợp chuẩn nhất** *(nâng cấp từ `TRAO_DOI_THIET_KE_JSON_PHIEU_KHAM` và phần chi tiết 5 Tab)* — cập nhật đúng cấu trúc thư mục phẳng `tabs/` và `src/models/` hiện tại.

---

## 1. Tổng Quan 5 Tab Khám Trong `RecordDetailModal.jsx`

Khi bấm nút **Xem & Khám (👁️)** trên một hồ sơ cán bộ, cửa sổ `src/components/Admin/HealthRecordManagement/RecordDetailModal.jsx` mở ra thanh 5 Tab tuần tự đúng quy trình khám sức khỏe định kỳ MEDLATEC – VNUA:

| Tab | Component (`HealthRecordManagement/tabs/`) | Bảng SQL Server | Kiểu lưu trữ |
| :---: | :--- | :--- | :--- |
| **1** | `VitalSignsTab.jsx` | `vc_vital_signs` | Các cột số (`height_cm`, `weight_kg`, `bmi`, `systolic_bp`, `diastolic_bp`, `spo2_percent`...) |
| **2** | `InternalMedicineTab.jsx` | `vc_internal_medicine_exams` | 6 cột văn bản `nvarchar(MAX)` riêng cho 6 hệ cơ quan (Tuần hoàn, Hô hấp, Tiêu hóa, Tiết niệu, Cơ xương khớp, Thần kinh) |
| **3** | `SpecialistExamsTab.jsx` | `vc_specialist_exams` | Các cột riêng theo chuyên khoa (`vision_*` cho Mắt, `ear_*`/`nose_*`/`throat_*` cho TMH, `upper_jaw`/`lower_jaw` cho RHM...) |
| **4** | `DiagnosticReportsTab.jsx` | `vc_diagnostic_reports` | **Cột `findings_data` (`nvarchar(MAX)`) lưu chuỗi JSON có cấu trúc mảng gạch đầu dòng** |
| **5** | `GeneralConclusionTab.jsx` | `vc_health_checkup_records` | Kết luận tổng thể, khuyến nghị, xếp loại sức khỏe (`Loại I`–`Loại V`) và trạng thái hồ sơ |

*(Toàn bộ CSS của 5 tab được gộp gọn vào 1 file duy nhất: `src/components/Admin/HealthRecordManagement/tabs/RecordTabs.css`.)*

---

## 2. Vì Sao Tab 4 (Chẩn Đoán Hình Ảnh) Lưu Dữ Liệu Dạng JSON?

Trong thực tế khám sức khỏe định kỳ có rất nhiều loại kỹ thuật khác nhau:
- **Siêu âm ổ bụng tổng quát** (đầu dò Convex 3.5MHz): mô tả *Gan, Túi mật, Tụy, Lách, Thận phải, Thận trái, Bàng quang, Tiền liệt tuyến*.
- **Siêu âm tuyến giáp** (đầu dò Linear): mô tả *Thùy phải, Thùy trái, Eo tuyến giáp, Tuyến nước bọt, Hạch cổ*.
- **Chụp X-quang tim phổi thẳng KTS**: mô tả *Thành ngực, Hai phổi, Khoang màng phổi, Trung thất, Bóng tim, Động mạch chủ, Xương sườn*.
- **Điện tâm đồ 12 chuyển đạo (ECG)**: mô tả *Thông số nhịp, Các sóng (PR, QRS, ST-T), Trạng thái lâm sàng*.

Nếu tạo cột riêng trong SQL cho từng cơ quan của mọi loại máy thì bảng sẽ phình lên hàng trăm cột `NULL`. Vì vậy hệ thống gom toàn bộ vào **1 bảng duy nhất `vc_diagnostic_reports`** với cột **`findings_data` (`nvarchar(MAX)`)** lưu chuỗi **JSON**:

```json
{
  "technique": "Siêu âm ổ bụng tổng quát bằng đầu dò Convex 3.5MHz qua thành bụng",
  "findings": {
    "liver": [
      "Kích thước bình thường",
      "Nhu mô đều, bờ nhẵn",
      "Tĩnh mạch cửa không giãn"
    ],
    "gallbladder": [
      "Kích thước bình thường",
      "Thành mỏng đều",
      "Lòng túi mật sạch, không có sỏi"
    ]
  },
  "conclusion": "Hình ảnh siêu âm ổ bụng hiện tại chưa thấy bất thường."
}
```

### Ưu điểm:
1. SQL Server hỗ trợ lưu JSON trong `nvarchar(MAX)` và truy vấn trực tiếp qua `JSON_VALUE()`, `ISJSON()`.
2. Một bảng duy nhất quản lý được vô hạn loại phiếu (Siêu âm, X-quang, ECG, Nội soi, CT, MRI) mà không cần sửa cấu trúc bảng SQL.
3. Mỗi vùng giải phẫu lưu mảng chuỗi `[]` nên Frontend dễ dàng thêm/xóa từng gạch đầu dòng `•` và định dạng bản in.

---

## 3. Luồng Xử Lý OOP Của Tab 4 (`Model` + `Service` + `API`)

Tab 4 được tách rõ 3 lớp xử lý:
1. **Tầng API (`src/api/diagnosticReportApi.js`):** Chỉ gọi `fetch()` thuần tới `/api/v1/diagnosticreports/*`.
2. **Tầng Model OOP (`src/models/DiagnosticReport.js`):**
   - `DiagnosticReport.fromApi(dto)`: Gọi `JSON.parse(dto.findingsData)` để biến chuỗi JSON từ SQL thành mảng `sections` (`FindingSection[]`) cho giao diện render. Nếu dữ liệu cũ là chữ thường không phải JSON, tự động bọc vào phân vùng mặc định để không bị crash.
   - `report.clone()`: Tạo bản sao độc lập mỗi khi sửa form (đảm bảo tính bất biến state trong React).
   - `report.validate()`: Kiểm tra hợp lệ tiêu đề, kết luận trước khi lưu.
   - `report.toApiPayload()`: Đóng gói lại các `sections` thành chuỗi `JSON.stringify(findingsEnvelope)` để gửi lên Backend lưu vào SQL Server.
3. **Tầng Service (`src/services/admin/DiagnosticReportService.js`):** Kết hợp `diagnosticReportApi.js` và `DiagnosticReport.js` (cung cấp `getReportsByRecordId`, `saveReport`, `deleteReport`).
