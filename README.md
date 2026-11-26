# VnuaCare UI — Hệ Thống Quản Lý Hồ Sơ Khám Sức Khỏe Cán Bộ VNUA

Giao diện web quản trị và tra cứu hồ sơ khám sức khỏe định kỳ dành cho cán bộ, giảng viên và nhân viên **Học viện Nông nghiệp Việt Nam (VNUA)**, xây dựng bằng **React 19 + Vite 8**, kết nối RESTful API tới Backend **.NET 9 (`VnuaCare-API`)** và cơ sở dữ liệu **SQL Server (`VnuaCareDB` — 24 bảng)**.

---

## Các Lệnh Chạy Dự Án

```bash
npm install     # Cài đặt thư viện phụ thuộc
npm run dev     # Chạy môi trường phát triển tại http://localhost:5173
npm run build   # Đóng gói bản production ra thư mục dist/
npm run lint    # Kiểm tra quy chuẩn mã nguồn bằng ESLint
```

---

## Bộ Tài Liệu Tổng Kết Toàn Bộ Dự Án (`docs/`)

Toàn bộ kiến trúc, mô hình thiết kế, luồng xác thực, nghiệp vụ y tế, luồng gọi API và từ điển mã nguồn được phân chia rõ ràng theo từng chủ đề tại thư mục `docs/`:

| STT | File tài liệu | Nội dung chính |
| :---: | :--- | :--- |
| **01** | [`docs/01_TONG_QUAN_KIEN_TRUC_VA_MO_HINH.md`](docs/01_TONG_QUAN_KIEN_TRUC_VA_MO_HINH.md) | Kiến trúc tổng thể, phân tích **7 mô hình thiết kế** áp dụng (4-Layer, Container/Presentational, so sánh với MVVM...), cây thư mục thực tế và chi tiết chức năng **9 trang** của hệ thống. |
| **02** | [`docs/02_LUONG_XAC_THUC_PHAN_QUYEN_VA_SU_KIEN.md`](docs/02_LUONG_XAC_THUC_PHAN_QUYEN_VA_SU_KIEN.md) | Luồng xác thực JWT (`AuthProvider`), phân quyền **RBAC 3 lớp** cho 4 vai trò, bố cục cố định `MainLayout` + Sidebar thu gọn và **6 cơ chế sự kiện React** cốt lõi. |
| **03** | [`docs/03_NGHIEP_VU_Y_TE_4_TAB_KHAM_VA_JSON_CDHA.md`](docs/03_NGHIEP_VU_Y_TE_4_TAB_KHAM_VA_JSON_CDHA.md) | Nghiệp vụ khám sức khỏe định kỳ: nguyên tắc xếp loại **Loại I → Loại V**, công thức tự tính & đánh giá **BMI / Huyết áp**, cơ chế lưu độc lập **4 Tab khám chuyên môn** và thiết kế cột **JSON `findings_data`** cho phiếu CĐHA. |
| **04** | [`docs/04_LUONG_GOI_API_VA_TRA_VE_DU_LIEU.md`](docs/04_LUONG_GOI_API_VA_TRA_VE_DU_LIEU.md) | Cấu trúc `httpClient.js`, cơ chế `fetch()` đính kèm Bearer Token, xử lý lỗi `401` / `!response.ok`, giải mã **2 lớp `data` (`result?.data?.data`)** ở API phân trang và luồng truyền dữ liệu lên giao diện. |
| **05** | [`docs/05_TU_DIEN_CODE_VA_CAU_HOI_BAO_VE.md`](docs/05_TU_DIEN_CODE_VA_CAU_HOI_BAO_VE.md) | Từ điển đầy đủ 21 Icon, hằng số IN HOA, biến `useState`, từ viết tắt, toán tử JavaScript/React, hàm tiện ích và **bộ câu hỏi – trả lời trọng tâm khi bảo vệ đồ án**. |
| **06** | [`docs/06_MO_TA_LUONG_HOAT_DONG_CHI_TIET.md`](docs/06_MO_TA_LUONG_HOAT_DONG_CHI_TIET.md) | **Mô tả luồng hoạt động chi tiết từng bước (End-to-End)** cho toàn bộ 7 luồng nghiệp vụ: khởi chạy, đăng nhập, phân quyền/điều hướng, Dashboard, CRUD lọc phân trang, khám 4 Tab chuyên môn và Cài đặt/Đăng xuất. |
| **Phụ lục** | [`docs/backend-portal/`](docs/backend-portal/) | Cổng tra cứu HTML của Backend `VnuaCare-API` (`index.html`) và sơ đồ trực quan 24 bảng CSDL SQL Server (`db-diagram.html`). |
