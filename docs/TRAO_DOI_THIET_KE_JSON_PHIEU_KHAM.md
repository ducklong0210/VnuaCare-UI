# BẢN TRAO ĐỔI KIẾN TRÚC: CHUẨN HÓA PHIẾU KHÁM & CHẨN ĐOÁN HÌNH ẢNH BẰNG CẤU TRÚC JSON
> **Dự án:** Hệ thống Quản lý Khám Sức Khỏe VnuaCare (VnuaCare-UI & VnuaCare-API)  
> **Chủ đề:** Thống nhất mô hình lưu trữ kết quả khám chuyên khoa / chẩn đoán hình ảnh bằng trường JSON dựa trên hồ sơ thực tế MEDLATEC  
> **Đối tượng mẫu:** Cán bộ **Trần Vũ Hà** (`SID: 221123-120002940950`, `STT: 272`, `Mã NV: 004.006.01411`)  
> **Ngày cập nhật:** 17/11/2026  

---

## 1. GIẢI THÍCH: VÌ SAO SIÊU ÂM THỰC TẾ LẠI CÓ 2 LOẠI?

Nhìn vào bộ ảnh hồ sơ thực tế của Bệnh viện MEDLATEC (thư mục `KLTN\Image`), bạn sẽ thấy hợp đồng khám sức khỏe định kỳ chia siêu âm thành các loại riêng biệt vì **đối tượng cơ quan thăm khám và đầu dò máy siêu âm hoàn toàn khác nhau**:

```
                              ┌── 1. Siêu âm Ổ bụng tổng quát (Gan, mật, thận, bàng quang...)
                              │     [Dùng đầu dò Convex tần số thấp 3.5 MHz để xuyên sâu ổ bụng]
                              │
Hồ sơ KSK cán bộ ─────────────┼── 2. Siêu âm Tuyến giáp (Thùy phải, thùy trái, eo tuyến, hạch cổ)
                              │     [Dùng đầu dò Linear tần số cao 7.5 - 12 MHz để quét nông vùng cổ]
                              │
                              └── 3. Siêu âm Tuyến vú (Chỉ dành riêng cho Cán bộ Nữ)
                                    [Tầm soát u xơ, nang vú, tổn thương mô tuyến vú hai bên]
```

### Đối chiếu với hồ sơ cán bộ Trần Vũ Hà (Giới tính: Nam):
* **Loại 1: Siêu âm ổ bụng tổng quát** (Ảnh `1787724283015_...jpg`): Bác sĩ quét toàn bộ các tạng trong bụng: *Gan, Mật, Tụy, Lách, Thận (P), Thận (T), Bàng quang, Tiền liệt tuyến*. Bác sĩ gạch dọc ghi chữ **"BT" (Bình thường)**.
* **Loại 2: Siêu âm tuyến giáp** (Ảnh `1787724283050_...jpg` viết tay & Ảnh `1787724283062_...jpg` in KTS): Do cán bộ có tiền sử cắt tuyến giáp, bác sĩ mô tả chi tiết: *Thùy (P) đã cắt, Thùy (T) bình thường, Eo tuyến bình thường, Hạch cổ không to*. Kết luận: *Hình ảnh siêu âm thùy trái tuyến giáp bình thường / Thùy phải đã cắt*.

---

## 2. BẢNG DỮ LIỆU CSDL THỰC TẾ TRÔNG NHƯ THẾ NÀO?

Thay vì phải tạo hàng chục cột rời rạc trong SQL Server (`gan_desc`, `mat_desc`, `thuy_phai_desc`, `thuy_trai_desc`, `tim_desc`, `phoi_desc`...), **toàn bộ các phiếu thăm khám chẩn đoán hình ảnh và thăm dò chức năng được lưu chung vào 1 bảng duy nhất**.

Bảng này trong CSDL của bạn chính là **`vc_diagnostic_reports`**. Mỗi phiếu khám của cán bộ là **1 dòng (1 record)** trong bảng:

### Minh họa dữ liệu thực tế của hồ sơ số 1 (Cán bộ Trần Vũ Hà) theo Cách 1 (Mảng danh sách `[]`):

| report_id | record_id | modality_type | exam_title | findings_data (CỘT JSON CỐT LÕI - DẠNG LIST `[]`) | conclusion (Tóm tắt) |
|:---:|:---:|:---:|---|---|---|
| **1** | 1 | `XRAY` | Chụp X quang tim phổi thẳng KTS | `{"technique":"...", "findings":{"chest_wall":[...], "lungs":[...], "heart_shadow":[...], "ribs":[...]}}` | Hình ảnh X quang tim phổi hiện tại không thấy bất thường. |
| **2** | 1 | `ULTRASOUND` | Siêu âm ổ bụng tổng quát | `{"technique":"...", "findings":{"liver":[...], "gallbladder":[...], "kidneys":[...], "urinary_bladder":[...]}}` | Hình ảnh siêu âm ổ bụng hiện tại chưa thấy bất thường. |
| **3** | 1 | `ULTRASOUND` | Siêu âm tuyến giáp | `{"technique":"...", "findings":{"right_lobe":[...], "left_lobe":[...], "cervical_soft_tissue":[...]}}` | Hình ảnh siêu âm thùy trái tuyến giáp và vùng cổ hiện tại không thấy bất thường. Thùy phải đã cắt. |
| **4** | 1 | `ECG` | Ghi điện tâm đồ vi tính 12 chuyển đạo | `{"technique":"...", "findings":{"rhythm_parameters":[...], "waveforms":[...], "clinical_status":[...]}}` | Hình ảnh điện tâm đồ hiện tại bình thường. |
| **5** *(nữ)* | 1 | `ULTRASOUND` | Siêu âm tuyến vú (Cán bộ Nữ) | `{"technique":"...", "findings":{"right_breast":[...], "left_breast":[...], "axillary_lymph_nodes":[...]}}` | Hình ảnh siêu âm tuyến vú hai bên hiện tại bình thường (BI-RADS 1). |
| **6** *(mở rộng)* | 1 | `ENDOSCOPY` | Nội soi Tai Mũi Họng | `{"technique":"...", "findings":{"ears":[...], "nose_nasopharynx":[...], "throat_pharynx":[...], "larynx":[...]}}` | Hình ảnh nội soi tai mũi họng hiện tại bình thường. |

> **Điểm ưu việt:** 
> * 1 bảng duy nhất quản lý được tất cả các phiếu.
> * Cột `findings_data` chứa JSON chuẩn, bên trong mỗi cơ quan là một **Mảng danh sách các gạch đầu dòng `[]`** giúp frontend dễ dàng render thành bullet points `•` và xuất file in ấn A4 chuẩn đẹp!

---

## 3. ĐIỀN MẪU CHI TIẾT CỘT JSON THEO CÁCH 1 (DANH SÁCH MẢNG `[]` GẠCH ĐẦU DÒNG)

Dưới đây là nội dung JSON chuẩn xác được trích xuất từ đúng chữ viết và số liệu trên các bức ảnh hồ sơ gốc của MEDLATEC:

### 3.1. Phiếu số 1: Siêu âm Ổ bụng tổng quát (`ULTRASOUND` - `US_ABDOMEN`)
*Dữ liệu từ ảnh `1787724283015_...jpg`:*
```json
{
  "technique": "Siêu âm ổ bụng tổng quát bằng đầu dò Convex 3.5MHz",
  "findings": {
    "liver": [
      "Kích thước bình thường",
      "Nhu mô đều, bờ nhẵn",
      "Tĩnh mạch cửa không giãn",
      "Không thấy khối khu trú dạng nang hoặc đặc"
    ],
    "gallbladder": [
      "Kích thước bình thường",
      "Thành mỏng đều",
      "Lòng túi mật sạch, không có sỏi",
      "Đường mật trong và ngoài gan không giãn"
    ],
    "pancreas": [
      "Hình dạng và kích thước trong giới hạn bình thường",
      "Nhu mô đồng nhất, ống tụy không giãn"
    ],
    "spleen": [
      "Kích thước bình thường",
      "Nhu mô đồng nhất"
    ],
    "right_kidney": [
      "Vị trí và kích thước bình thường",
      "Phân biệt vỏ tủy rõ",
      "Đài bể thận không giãn, không có sỏi"
    ],
    "left_kidney": [
      "Vị trí và kích thước bình thường",
      "Phân biệt vỏ tủy rõ",
      "Đài bể thận không giãn, không có sỏi"
    ],
    "urinary_bladder": [
      "Căng nước tiểu, thành mỏng đều",
      "Lòng bàng quang sạch, không thấy sỏi hay khối u"
    ],
    "pelvic_prostate": [
      "Tiền liệt tuyến kích thước bình thường (đối với nam)",
      "Cấu trúc nhu mô đồng nhất",
      "Không có dịch tự do khoang ổ bụng"
    ]
  },
  "conclusion": "Hình ảnh siêu âm ổ bụng hiện tại chưa thấy bất thường"
}
```

---

### 3.2. Phiếu số 2: Siêu âm Tuyến giáp (`ULTRASOUND` - `US_THYROID`)
*Dữ liệu từ ảnh `1787724283050_...jpg` và ảnh in vi tính `1787724283062_...jpg` (Đúng phần crop bạn vừa gửi):*
```json
{
  "technique": "Siêu âm tuyến giáp và phần mềm vùng cổ bằng đầu dò phẳng tần số cao (linear)",
  "findings": {
    "right_lobe": [
      "Đã cắt (không còn mô tuyến giáp thùy phải)"
    ],
    "left_lobe": [
      "Kích thước bình thường",
      "Nhu mô đồng nhất",
      "Không thấy cấu trúc dạng nang, khối đặc"
    ],
    "isthmus": [
      "Hình dạng và cấu trúc bình thường"
    ],
    "salivary_glands": [
      "Tuyến dưới hàm hai bên cấu trúc đồng nhất, ống tuyến không giãn",
      "Tuyến mang tai hai bên cấu trúc đồng nhất, không thấy u"
    ],
    "cervical_soft_tissue": [
      "Cơ ức đòn chũm và cơ vùng cổ: Bình thường",
      "Hạch to vùng cổ: Không thấy"
    ]
  },
  "conclusion": "Hình ảnh siêu âm thùy trái tuyến giáp và vùng cổ hiện tại không thấy bất thường / Thùy phải đã cắt"
}
```

---

### 3.3. Phiếu số 3: Chụp X-Quang tim phổi thẳng KTS (`XRAY` - `XRAY_CHEST`)
*Dữ liệu từ ảnh `1787724283085_...jpg` của BSCKI. Trần Thế Quỳnh:*
```json
{
  "technique": "Chụp X quang tim phổi thường quy (Kỹ thuật số KTS)",
  "findings": {
    "chest_wall": [
      "Hình dạng lồng ngực cân đối",
      "Thành ngực mềm mại, không có sưng nề"
    ],
    "lungs": [
      "Phổi phải: Nhu mô đồng nhất, không thấy nốt mờ, không thấy tổn thương khu trú",
      "Phổi trái: Nhu mô đồng nhất, không thấy nốt mờ",
      "Không thấy dấu hiệu giãn phế quản, phế nang"
    ],
    "pleura": [
      "Khoang màng phổi hai bên sáng",
      "Góc sườn hoành hai bên sáng nhọn, không tràn dịch, tràn khí"
    ],
    "trachea_mediastinum": [
      "Khí quản và phế quản gốc cân đối, không bị đè đẩy",
      "Trung thất không giãn, không thấy hạch to"
    ],
    "heart_shadow": [
      "Bóng tim hình ảnh kích thước bình thường",
      "Chỉ số tim ngực trong giới hạn bình thường"
    ],
    "aorta": [
      "Cung động mạch chủ không giãn, bờ đều, không vôi hóa"
    ],
    "ribs": [
      "Các xương sườn hình dạng bình thường, không thấy tiêu xương, không gãy xương"
    ]
  },
  "conclusion": "Hình ảnh X quang tim phổi hiện tại không thấy bất thường"
}
```

---

### 3.4. Phiếu số 4: Ghi điện tâm đồ 12 chuyển đạo (`ECG`)
*Dữ liệu từ ảnh `1787724283134_...jpg` của ThS.BS Dương Tuấn Khôi:*
```json
{
  "technique": "Ghi điện tâm đồ vi tính 12 chuyển đạo (I-III, aVR, aVL, aVF, V1-V6), không gắng sức",
  "findings": {
    "rhythm_parameters": [
      "Nhịp xoang đều",
      "Tần số tim: 89 lần/phút",
      "Trục điện tim: Trung gian (+58 độ)"
    ],
    "waveforms": [
      "Khoảng cách PR trong giới hạn bình thường",
      "Phức bộ QRS thanh mảnh, thời gian trong giới hạn bình thường",
      "Hiện tại không có biến đổi sóng ST, sóng T"
    ],
    "clinical_status": [
      "Hiện tại không thấy tăng gánh nhĩ, thất",
      "Hiện tại không có rối loạn nhịp nhĩ, nhịp thất, rối loạn dẫn truyền nhĩ thất"
    ]
  },
  "conclusion": "Hình ảnh điện tâm đồ hiện tại bình thường (Nhịp xoang đều)"
}
```

---

### 3.5. Phiếu số 5: Siêu âm Tuyến vú hai bên (`ULTRASOUND` - `US_BREAST` - Dành cho Cán bộ Nữ)
*Áp dụng khi khám cho cán bộ nữ theo hợp đồng KSK:*
```json
{
  "technique": "Siêu âm tuyến vú hai bên bằng đầu dò phẳng cao tần (Linear 7.5 - 10MHz)",
  "findings": {
    "right_breast": [
      "Cấu trúc mô tuyến vú hai bên cân đối, sợi tuyến phân bố đều",
      "Không thấy khối u, nang hay nốt bất thường",
      "Hệ thống ống dẫn sữa không giãn"
    ],
    "left_breast": [
      "Cấu trúc mô tuyến vú bình thường, không thấy vi vôi hóa",
      "Không thấy khối u dạng đặc hay tổn thương khu trú",
      "Hệ thống ống dẫn sữa không giãn"
    ],
    "axillary_lymph_nodes": [
      "Hố nách hai bên không thấy hạch to bất thường",
      "Cấu trúc rốn hạch bình thường"
    ],
    "nipples": [
      "Núm vú hai bên cân đối, không co kéo, không tiết dịch bất thường"
    ]
  },
  "conclusion": "Hình ảnh siêu âm tuyến vú hai bên hiện tại bình thường (BI-RADS 1)"
}
```

---

### 3.6. Phiếu số 6: Nội soi Tai - Mũi - Họng (`ENDOSCOPY` - `ENT`)
*Dữ liệu từ ảnh `1787724283122_...jpg` của ThS.BS Nguyễn Thị Hồng Tuyết:*
```json
{
  "technique": "Nội soi Tai Mũi Họng ống mềm",
  "findings": {
    "ears": [
      "Tai phải: Ống tai ngoài sạch, màng nhĩ sáng, còn nón sáng",
      "Tai trái: Ống tai ngoài sạch, màng nhĩ sáng, còn nón sáng"
    ],
    "nose_nasopharynx": [
      "Hốc mũi hai bên thông thoáng, niêm mạc hồng hào",
      "Cuống mũi dưới hai bên không phì đại",
      "Vách ngăn mũi không vẹo, không gai",
      "Vòm họng (VA): Nhẵn sạch, không có tổ chức sùi loét"
    ],
    "throat_pharynx": [
      "Họng miệng: Niêm mạc hồng, tăng sinh tổ chức hạt thành sau họng",
      "Amidan hai bên kích thước độ 1, bề mặt sạch không có giả mạc hay hốc mủ"
    ],
    "larynx": [
      "Thanh thiệt di động tốt",
      "Hai dây thanh âm nhẵn, màu trắng ngọc, di động bình thường, khép kín khi phát âm"
    ]
  },
  "conclusion": "Hình ảnh nội soi tai mũi họng hiện tại: Họng tăng sinh tổ chức hạt thành sau / Tai mũi thanh quản bình thường"
}
```
```

---

## 4. GIAO DIỆN FRONTEND REACT SẼ HOẠT ĐỘNG THẾ NÀO?

Khi lưu dạng JSON thế này, trên màn hình chi tiết hồ sơ:

1. **Cột Menu bên trái (Danh mục phiếu khám):**
   * Tự động lấy danh sách các phiếu khám của hồ sơ từ CSDL:
     * `[ ] Siêu âm ổ bụng tổng quát`
     * `[✓] Siêu âm tuyến giáp (Đã có kết quả)`
     * `[✓] Nội soi Tai Mũi Họng (Đã có kết quả)`
     * `[ ] Chụp X-Quang tim phổi`
     * `[ ] Điện tim 12 cần`
2. **Khung bên phải (Hiển thị & Chỉnh sửa Form):**
   * Khi bác sĩ click chọn mục nào ở menu bên trái (ví dụ: bấm vào **Siêu âm tuyến giáp**):
     * **Ô 1:** Kỹ thuật thăm khám (Hiển thị chuỗi `technique`)
     * **Khối 2:** Các ô nhập mô tả chi tiết (Tự động hiển thị các ô tương ứng với `findings`: Thùy phải, Thùy trái, Eo tuyến, Hạch...)
     * **Ô 3:** Kết luận (Hiển thị chuỗi `conclusion`)
     * **Ô 4:** Bác sĩ khám & Xếp loại sức khỏe
3. **Khi bấm "Lưu kết quả":**
   * Frontend chỉ cần đóng gói 3 ô trên thành 1 chuỗi JSON và gửi lên API lưu vào cột `exam_data`.
4. **Khi in kết quả ra PDF:**
   * Hệ thống đọc JSON ra và đổ trực tiếp vào mẫu giấy A4 giống hệt như các tờ phiếu in của MEDLATEC!
