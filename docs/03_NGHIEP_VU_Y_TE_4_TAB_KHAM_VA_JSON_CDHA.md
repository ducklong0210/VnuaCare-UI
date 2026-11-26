# 03. Nghiệp Vụ Y Tế, Quy Trình 4 Tab Khám Bệnh & Thiết Kế JSON Phiếu CĐHA

> Tài liệu tổng hợp toàn bộ nghiệp vụ y khoa trong phân hệ **Hồ sơ khám sức khỏe**: cách tách thông tin hành chính/kết luận chung với 4 Tab khám chuyên khoa, nguyên tắc phân loại sức khỏe **Loại I → Loại V**, công thức tự tính & đánh giá **BMI / Huyết áp**, cơ chế lưu độc lập đa chuyên khoa và thiết kế cột **JSON `findings_data`**.

---

## 1. Kiến Trúc 2 Luồng Của Phân Hệ Hồ Sơ Khám Sức Khỏe

Để tránh trùng lặp biểu mẫu nhập liệu, phân hệ Hồ sơ khám được tách rạch ròi thành **2 khu vực**:

1. **Biểu mẫu Hồ sơ chung bên ngoài (`HealthRecordFormModal.jsx` — nút Thêm mới / Sửa trên bảng):**
   - Lưu trực tiếp vào bảng trung tâm `vc_health_checkup_records`.
   - Quản lý: Đợt khám, Cán bộ khám, Mã tiếp nhận **SID**, Ngày khám thực tế, **Tiền sử bệnh cá nhân & gia đình**, **Kết luận sức khỏe chung**, **Lời dặn điều trị**, **Bác sĩ hội đồng kết luận**, **Xếp loại sức khỏe tổng thể (`Loại I` → `Loại V`)** và **Trạng thái hồ sơ**.
   - *(Nhờ toàn bộ phần kết luận hội đồng đã chỉnh sửa trực tiếp tại đây nên cửa sổ chi tiết bên trong đã loại bỏ Tab 5 trùng lặp, chỉ tập trung vào 4 Tab khám chuyên khoa.)*

2. **Cửa sổ Khám chuyên môn 4 Tab (`RecordDetailModal.jsx` — nút Con mắt 👁️ trên bảng):**
   - Dành cho điều dưỡng và bác sĩ từng bàn khám nhập kết quả chuyên sâu theo `recordId`:

| Thứ tự | Component (`HealthRecordManagement/tabs/`) | Bảng SQL Server | Cách lưu trữ dữ liệu |
| :---: | :--- | :--- | :--- |
| **Tab 1** | `VitalSignsTab.jsx` | `vc_vital_signs` | Các cột số đo nhân trắc & sinh hiệu (`height_cm`, `weight_kg`, `bmi`, `waist_cm`, `systolic_bp`, `diastolic_bp`, `heart_rate_bpm`, `respiratory_rate`, `spo2_percent`). |
| **Tab 2** | `InternalMedicineTab.jsx` | `vc_internal_medicine_exams` | 6 cột mô tả văn bản cho 6 hệ cơ quan (Tuần hoàn, Hô hấp, Tiêu hóa, Thận - Tiết niệu, Cơ - Xương - Khớp, Thần kinh) + kết luận & xếp loại nội khoa. |
| **Tab 3** | `SpecialistExamsTab.jsx` | `vc_specialist_exams` | Mỗi chuyên khoa lẻ là **1 dòng riêng** phân biệt bởi `(record_id, specialty_type)` cho 6 khoa: Mắt (`EYE`), Tai Mũi Họng (`ENT`), Răng Hàm Mặt (`DENTAL`), Da liễu (`DERMATOLOGY`), Ngoại khoa (`SURGERY`), Sản phụ khoa (`OBSTETRICS`). |
| **Tab 4** | `DiagnosticReportsTab.jsx` | `vc_diagnostic_reports` | Một hồ sơ có **nhiều phiếu CĐHA** (Siêu âm ổ bụng, Siêu âm tuyến giáp, X-quang, Điện tim...), mô tả chi tiết từng vùng giải phẫu đóng gói dạng **chuỗi JSON** trong cột `findings_data`. |

- **Đồng bộ trạng thái tự động:** Khi hồ sơ đang ở trạng thái `PENDING` (*Chờ khám*), ngay khi lưu bất kỳ phiếu khám nào ở 4 Tab, Backend tự động chuyển trạng thái hồ sơ sang `IN_PROGRESS` (*Đang khám*). Khi đóng `RecordDetailModal`, bảng hồ sơ bên ngoài tự động tăng `refreshKey` để cập nhật trạng thái mới ngay lập tức.

---

## 2. Tự Động Tính & Đánh Giá Chỉ Số Y Tế (BMI, Huyết Áp & Các Chỉ Số Khác)

Trong toàn bộ 4 Tab khám, hệ thống thiết kế rõ **2 chỉ số tự động tính toán & cảnh báo tức thì** tại `VitalSignsTab.jsx`, còn các chỉ số lâm sàng khác do bác sĩ đánh giá chuyên môn:

### 2.1. Tự động tính và phân loại BMI (`VitalSignsTab.jsx`)
- **Công thức tự động (`handleHeightWeightChange`):** Ngay khi nhập Chiều cao (`cm`) và Cân nặng (`kg`), hệ thống đổi chiều cao sang mét ($h / 100$) và tính:
  $$\text{BMI} = \frac{\text{Cân nặng (kg)}}{\text{Chiều cao (m)}^2}$$
- **Hàm so sánh `evaluateBmi(bmiValue)` (theo chuẩn WHO dành cho người châu Á):**
  - $\text{BMI} < 18.5$: **Nhẹ cân / Thể lực gầy** (nhãn vàng `badge-warning`)
  - $18.5 \le \text{BMI} < 23.0$: **Thể trạng bình thường / Cân đối** (nhãn xanh lá `badge-success`)
  - $23.0 \le \text{BMI} < 25.0$: **Thừa cân / Tiền béo phì** (nhãn vàng `badge-warning`)
  - $\text{BMI} \ge 25.0$: **Béo phì / Cần điều chỉnh ăn uống** (nhãn đỏ `badge-danger`)

### 2.2. Tự động phân loại Huyết áp (`evaluateBloodPressure` trong `VitalSignsTab.jsx`)
- Tâm thu $\ge 140$ hoặc Tâm trương $\ge 90$ mmHg: **Tăng huyết áp (Cần lưu ý theo dõi)** (`badge-danger`)
- Tâm thu $\ge 120$ hoặc Tâm trương $\ge 80$ mmHg: **Huyết áp tiền tăng (Hơi cao)** (`badge-warning`)
- Tâm thu $< 90$ hoặc Tâm trương $< 60$ mmHg: **Huyết áp thấp** (`badge-warning`)
- Khoảng còn lại ($90\text{–}119 / 60\text{–}79$ mmHg): **Huyết áp bình thường** (`badge-success`)

### 2.3. Các chỉ số khác
- **Vòng bụng, Mạch, Nhịp thở, SpO2** (Tab 1), **6 hệ cơ quan Nội khoa** (Tab 2), **Thị lực Snellen, Công thức răng, TMH, Da liễu, Ngoại, Sản** (Tab 3) và **Mô tả CĐHA** (Tab 4): bác sĩ nhập giá trị/nhận định thực tế và tự chọn xếp loại chuyên khoa.

---

## 3. Nguyên Tắc Đánh Giá Xếp Loại Sức Khỏe (`Loại I` → `Loại V`)

### 3.1. Quy chuẩn chuyên môn Bộ Y tế (Thông tư 14 & Thông tư 32)
Từng chuyên khoa chấm mức sức khỏe từ **Loại I đến Loại V**. Xếp loại tổng thể của cả hồ sơ tuân theo nguyên tắc **lấy theo chuyên khoa có mức sức khỏe kém nhất (số loại lớn nhất)**:
- **Loại I (Rất khỏe):** Tất cả các chỉ số thể lực và mọi chuyên khoa đều đạt Loại I, hoàn toàn bình thường, không có bệnh lý.
- **Loại II (Khỏe):** Đa số bình thường, có vấn đề nhẹ không ảnh hưởng sức lao động (cận thị nhẹ, sâu răng nhẹ...).
- **Loại III (Trung bình):** Có ít nhất một chuyên khoa mức trung bình cần theo dõi định kỳ (tăng huyết áp độ 1, gan nhiễm mỡ, rối loạn mỡ máu...).
- **Loại IV (Yếu):** Có bệnh lý mạn tính mức độ nặng hơn, hạn chế một phần sức lao động, cần điều trị chuyên khoa.
- **Loại V (Rất yếu):** Có ít nhất một chuyên khoa ở mức 5 (bệnh lý cấp tính nặng hoặc mạn tính giai đoạn nặng như suy tim, suy thận, bệnh ác tính...), cần điều trị tích cực hoặc nghỉ dưỡng.

> **Vì sao hệ thống để Bác sĩ hội đồng chọn xếp loại mà không để máy tự chốt 100%?**
> Kết luận phân loại sức khỏe định kỳ mang tính chịu trách nhiệm chuyên môn và pháp lý của Bác sĩ hội đồng; phần mềm đóng vai trò tính sẵn chỉ số tham chiếu (BMI, cảnh báo huyết áp) và tổng hợp kết quả từ các khoa để bác sĩ đối chiếu trước khi ký chốt.

### 3.2. Cách thống kê tỷ lệ Loại I → Loại V trên Dashboard (`DashboardStatsCharts.jsx`)
- Tái sử dụng hằng số `DEFAULT_HEALTH_CLASSIFICATIONS` từ `src/utils/index.js`.
- **Xử lý kỹ thuật quan trọng trong `matchesClassification()`:** Khi đếm số hồ sơ **`Loại I`**, hàm bắt buộc kiểm tra loại trừ `'Loại II'`, `'Loại III'`, `'Loại IV'`, `'Loại V'` vì xét theo chuỗi ký tự thì `"Loại II"` hay `"Loại IV"` đều chứa chuỗi con `"Loại I"`.

---

## 4. Cơ Chế Lưu Độc Lập Đa Chuyên Khoa Ở Tab 3 (`SpecialistExamsTab.jsx`)

Một hồ sơ khám có tới 6 chuyên khoa lẻ trên cùng một giao diện 2 cột:
- `examsMap` lưu dữ liệu riêng của từng khoa theo khóa mã khoa: `{ EYE: {...}, ENT: {...}, DENTAL: {...} }`.
- Mảng `unsavedCodes` (ví dụ `['EYE', 'DENTAL']`) ghi nhận những chuyên khoa bác sĩ đã gõ chữ nhưng chưa bấm nút **Lưu** (hiển thị trạng thái `● Chưa lưu` ở cột trái).
- Khi bấm **Lưu** ở chuyên khoa nào (`savingCode = activeSpecialty`):
  - Chỉ đóng gói các trường thuộc đúng chuyên khoa đó gửi lên API (`POST /add` nếu chưa có `specialistExamId`, `PUT /update` nếu đã có).
  - Khi tải lại dữ liệu mới từ CSDL, hệ thống chỉ cập nhật những chuyên khoa đã lưu và **giữ nguyên nội dung đang gõ dở ở các chuyên khoa khác** trong `unsavedCodes`, không bao giờ làm mất hay ghi đè chéo dữ liệu giữa các khoa.

---

## 5. Thiết Kế Cột JSON `findings_data` & Quản Lý Đa Phiếu Ở Tab 4 (`DiagnosticReportsTab.jsx`)

### 5.1. Tại sao dùng JSON trong SQL Server cho phiếu CĐHA?
Mỗi kỹ thuật CĐHA có các vùng mô tả hoàn toàn khác nhau:
- *Siêu âm ổ bụng:* Gan (`liver`), Túi mật (`gallbladder`), Tụy (`pancreas`), Lách (`spleen`), Thận phải/trái (`right_kidney`/`left_kidney`), Bàng quang...
- *Siêu âm tuyến giáp:* Thùy phải (`right_lobe`), Thùy trái (`left_lobe`), Eo tuyến (`isthmus`), Hạch cổ...
- *X-quang tim phổi:* Thành ngực (`chest_wall`), Phổi (`lungs`), Màng phổi (`pleura`), Bóng tim (`heart_shadow`)...
- *Điện tâm đồ (ECG):* Thông số nhịp (`rhythm_parameters`), Sóng điện tim (`waveforms`), Kết luận dẫn truyền...

Thay vì tạo hàng trăm cột rời rạc bị bỏ trống (`NULL`), bảng `vc_diagnostic_reports` gom phần mô tả động vào cột `findings_data` (`nvarchar(MAX)`):

```json
{
  "technique": "Siêu âm ổ bụng tổng quát bằng đầu dò Convex 3.5MHz",
  "findings": {
    "liver": ["Kích thước bình thường", "Nhu mô đều, bờ nhẵn"],
    "gallbladder": ["Thành mỏng đều", "Lòng túi mật sạch, không có sỏi"]
  },
  "conclusion": "Hình ảnh siêu âm ổ bụng hiện tại chưa thấy bất thường."
}
```

### 5.2. Cơ chế quản lý nhiều phiếu CĐHA mượt mà, không bị đè hoặc nhảy thứ tự
1. **Một nguồn dữ liệu duy nhất (`reports` + `selectedKey`):**
   - Mỗi đối tượng `DiagnosticReport` có một khóa định danh giao diện `clientKey` (`report-<id>` với phiếu đã lưu trong DB, hoặc `draft-<timestamp>` với phiếu mới bấm **"+ Thêm phiếu"**).
   - Giao diện giữ **1 mảng `reports` duy nhất** và **1 biến `selectedKey`**, suy ra `selectedReport = reports.find(item => item.clientKey === selectedKey)`.
   - Nhờ đó bác sĩ có thể bấm **"+ Thêm phiếu"** liên tiếp 2, 3 phiếu mới mà không đè lên phiếu hiện tại; chuyển qua lại giữa phiếu 1, 2, 3 không bao giờ mất nội dung đang sửa.
2. **Giữ đúng múi giờ địa phương & cố định thứ tự phiếu sau khi Lưu:**
   - Hàm `formatLocalDateTimeInput()` trong `DiagnosticReport.js` giữ nguyên chuỗi giờ địa phương `YYYY-MM-DDTHH:mm:ss` (không dùng `.toISOString()` tránh bị trừ lùi 7 tiếng sang UTC).
   - `DiagnosticReportService.getReportsByRecordId()` sắp xếp cố định theo `reportId` tăng dần, đảm bảo kể cả khi 2 phiếu có trùng giờ thực hiện (`performed_at`), bấm Lưu phiếu thứ 1 vẫn đứng nguyên vị trí số 1, không bao giờ nhảy đổi chỗ sang phiếu thứ 2.
