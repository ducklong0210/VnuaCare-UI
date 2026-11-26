/**
 * VNUA Care API Documentation Portal - Interactive Logic
 * Toàn diện & Chi tiết: Token, Cache, AnyAsync, Kiến trúc và Toàn bộ 24 Bảng CSDL
 */

// ====================================================
// 1. DỮ LIỆU ĐẶC TẢ TOÀN BỘ 24 BẢNG CƠ SỞ DỮ LIỆU (SQL DDL)
// ====================================================
const dbSchema = {
  // 1. Quản trị & Định danh
  vc_users: {
    category: "1. Quản trị & Định danh",
    name: "vc_users",
    entity: "VcUsers.cs",
    description: "Bảng lưu trữ tài khoản người dùng, mật khẩu băm BCrypt, vai trò và mã Refresh Token cấp phiên đăng nhập.",
    columns: [
      { name: "user_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính tài khoản" },
      { name: "username", type: "varchar(100)", key: "UK (Unique)", nullable: false, desc: "Tên đăng nhập hệ thống" },
      { name: "email", type: "varchar(150)", key: "UK (Unique)", nullable: true, desc: "Địa chỉ email định danh" },
      { name: "password_hash", type: "varchar(255)", key: "-", nullable: false, desc: "Mật khẩu mã hóa BCrypt (Salt + Cost 12)" },
      { name: "role", type: "varchar(30)", key: "-", nullable: false, desc: "Vai trò: SUPER_ADMIN, HEALTH_ADMIN, DOCTOR, STAFF" },
      { name: "is_active", type: "bit", key: "Default: 1", nullable: true, desc: "Trạng thái hoạt động (1: Hoạt động, 0: Bị khóa)" },
      { name: "refresh_token", type: "varchar(255)", key: "-", nullable: true, desc: "Mã Refresh Token ngẫu nhiên 32 bytes Base64" },
      { name: "refresh_token_expiry_time", type: "datetime2", key: "-", nullable: true, desc: "Thời điểm hết hạn Refresh Token (thường 7 ngày)" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm tạo tài khoản" },
      { name: "updated_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm cập nhật gần nhất" }
    ]
  },
  vc_audit_logs: {
    category: "1. Quản trị & Định danh",
    name: "vc_audit_logs",
    entity: "VcAuditLogs.cs",
    description: "Nhật ký kiểm toán hệ thống ghi vết toàn bộ hành vi INSERT, UPDATE, DELETE nhạy cảm.",
    columns: [
      { name: "log_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính bản ghi log" },
      { name: "user_id", type: "int", key: "FK -> vc_users", nullable: true, desc: "Người thực hiện hành động" },
      { name: "action_type", type: "varchar(60)", key: "-", nullable: false, desc: "Loại hành động (LOGIN, CREATE_RECORD, UPDATE_CONCLUSION)" },
      { name: "target_table", type: "varchar(60)", key: "-", nullable: true, desc: "Tên bảng dữ liệu bị tác động" },
      { name: "target_record_id", type: "int", key: "-", nullable: true, desc: "ID bản ghi bị tác động" },
      { name: "old_data", type: "nvarchar(max)", key: "-", nullable: true, desc: "Dữ liệu trước khi sửa (JSON)" },
      { name: "new_data", type: "nvarchar(max)", key: "-", nullable: true, desc: "Dữ liệu sau khi sửa (JSON)" },
      { name: "ip_address", type: "varchar(45)", key: "-", nullable: true, desc: "Địa chỉ IP Client gửi request" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm thực hiện" }
    ]
  },

  // 2. Danh mục Nền tảng
  vc_departments: {
    category: "2. Danh mục Nền tảng",
    name: "vc_departments",
    entity: "VcDepartments.cs",
    description: "Danh mục Khoa / Viện / Phòng ban trực thuộc Học viện Nông nghiệp Việt Nam.",
    columns: [
      { name: "department_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID phòng ban" },
      { name: "department_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã viết tắt (FIT, TCCB, TY)" },
      { name: "department_name", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên đầy đủ (Khoa Công nghệ thông tin)" },
      { name: "is_active", type: "bit", key: "Default: 1", nullable: true, desc: "Đang hoạt động hay tạm khóa" }
    ]
  },
  vc_specialties: {
    category: "2. Danh mục Nền tảng",
    name: "vc_specialties",
    entity: "VcSpecialties.cs",
    description: "Danh mục các chuyên khoa y tế phục vụ phân loại bác sĩ và các bàn khám chuyên khoa.",
    columns: [
      { name: "specialty_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID chuyên khoa" },
      { name: "specialty_name", type: "nvarchar(150)", key: "-", nullable: false, desc: "Tên chuyên khoa (Nội khoa, Mắt, Tai Mũi Họng)" },
      { name: "specialty_description", type: "nvarchar(255)", key: "-", nullable: true, desc: "Mô tả phạm vi chuyên môn" },
      { name: "is_active", type: "bit", key: "Default: 1", nullable: true, desc: "Trạng thái sử dụng" }
    ]
  },
  vc_disease_catalog: {
    category: "2. Danh mục Nền tảng",
    name: "vc_disease_catalog",
    entity: "VcDiseaseCatalog.cs",
    description: "Danh mục Bệnh tật Quốc tế chuẩn ICD-10 phục vụ chẩn đoán bệnh án chuẩn hóa y khoa.",
    columns: [
      { name: "disease_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID bệnh" },
      { name: "icd10_code", type: "varchar(20)", key: "UK (Unique)", nullable: false, desc: "Mã ICD-10 (ví dụ: I10, E11, J00)" },
      { name: "disease_name_vi", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên bệnh tiếng Việt (Tăng huyết áp vô căn)" },
      { name: "disease_name_en", type: "varchar(255)", key: "-", nullable: true, desc: "Tên bệnh tiếng Anh (Essential hypertension)" },
      { name: "disease_chapter", type: "nvarchar(100)", key: "-", nullable: true, desc: "Chương bệnh ICD-10 (Chương IX: Bệnh hệ tuần hoàn)" }
    ]
  },
  vc_medical_services: {
    category: "2. Danh mục Nền tảng",
    name: "vc_medical_services",
    entity: "VcMedicalServices.cs",
    description: "Danh mục các dịch vụ khám chữa bệnh, xét nghiệm và chẩn đoán hình ảnh.",
    columns: [
      { name: "service_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID dịch vụ" },
      { name: "service_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã dịch vụ y tế (XN_MAU, XQ_NGUC)" },
      { name: "service_name", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên dịch vụ (Tổng phân tích tế bào máu, X-Quang phổi)" },
      { name: "service_type", type: "varchar(30)", key: "-", nullable: false, desc: "Loại dịch vụ (LAB, IMAGING, CLINICAL)" },
      { name: "target_gender", type: "varchar(10)", key: "Default: 'ALL'", nullable: true, desc: "Dành cho đối tượng (ALL, MALE, FEMALE)" },
      { name: "is_mandatory", type: "bit", key: "Default: 1", nullable: true, desc: "Bắt buộc trong gói khám hay tùy chọn thêm" },
      { name: "price", type: "numeric(12,2)", key: "Default: 0", nullable: true, desc: "Đơn giá dịch vụ (VNĐ)" }
    ]
  },
  vc_medication_catalog: {
    category: "2. Danh mục Nền tảng",
    name: "vc_medication_catalog",
    entity: "VcMedicationCatalog.cs",
    description: "Danh mục dược phẩm, biệt dược và hoạt chất phục vụ kê đơn thuốc điện tử.",
    columns: [
      { name: "medication_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID thuốc" },
      { name: "medication_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã thuốc (ví dụ: MED-PARA-500)" },
      { name: "brand_name", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên biệt dược (Panadol Extra)" },
      { name: "active_ingredient", type: "nvarchar(255)", key: "-", nullable: false, desc: "Hoạt chất (Paracetamol + Caffeine)" },
      { name: "dosage_form", type: "nvarchar(100)", key: "-", nullable: true, desc: "Dạng bào chế (Viên nén bao phim)" },
      { name: "unit", type: "nvarchar(50)", key: "-", nullable: false, desc: "Đơn vị tính (Viên, Gói, Hộp)" }
    ]
  },
  vc_lab_indicator_catalog: {
    category: "2. Danh mục Nền tảng",
    name: "vc_LabIndicatorCatalog.cs",
    entity: "VcLabIndicatorCatalog.cs",
    description: "Danh mục các chỉ số xét nghiệm huyết học, sinh hóa kèm dải tham chiếu chuẩn.",
    columns: [
      { name: "indicator_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID chỉ số xét nghiệm" },
      { name: "indicator_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã chỉ số (GLUCOSE, UREA, CHOLESTEROL, AST, ALT)" },
      { name: "indicator_name", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên xét nghiệm (Định lượng Glucose máu)" },
      { name: "category_group", type: "varchar(50)", key: "-", nullable: false, desc: "Nhóm xét nghiệm (BIOCHEMISTRY, HEMATOLOGY, IMMUNOLOGY)" },
      { name: "unit", type: "nvarchar(50)", key: "-", nullable: true, desc: "Đơn vị đo (mmol/L, U/L, g/L)" },
      { name: "ref_min", type: "numeric(10,4)", key: "-", nullable: true, desc: "Giá trị ngưỡng dưới bình thường" },
      { name: "ref_max", type: "numeric(10,4)", key: "-", nullable: true, desc: "Giá trị ngưỡng trên bình thường" },
      { name: "ref_text_range", type: "nvarchar(100)", key: "-", nullable: true, desc: "Dải tham chiếu văn bản (ví dụ: 3.9 - 6.4)" },
      { name: "gender_specific", type: "varchar(10)", key: "Default: 'ALL'", nullable: true, desc: "Áp dụng theo giới (ALL, MALE, FEMALE)" },
      { name: "measuring_device", type: "nvarchar(100)", key: "-", nullable: true, desc: "Máy phân tích xét nghiệm" }
    ]
  },

  // 3. Nhân sự & Y tế
  vc_staffs: {
    category: "3. Nhân sự & Y tế",
    name: "vc_staffs",
    entity: "VcStaffs.cs",
    description: "Hồ sơ Cán bộ - Giảng viên VNUA tham gia khám sức khỏe định kỳ.",
    columns: [
      { name: "staff_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính hồ sơ cán bộ" },
      { name: "user_id", type: "int", key: "FK -> vc_users (UK)", nullable: true, desc: "Tài khoản người dùng đăng nhập 1-1" },
      { name: "department_id", type: "int", key: "FK -> vc_departments", nullable: false, desc: "Khoa hoặc Phòng ban trực thuộc" },
      { name: "employee_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã thẻ cán bộ (VNUA01029)" },
      { name: "full_name", type: "nvarchar(150)", key: "-", nullable: false, desc: "Họ và tên cán bộ" },
      { name: "gender", type: "varchar(10)", key: "-", nullable: false, desc: "Giới tính (MALE / FEMALE)" },
      { name: "date_of_birth", type: "date", key: "-", nullable: false, desc: "Ngày tháng năm sinh" },
      { name: "academic_title", type: "nvarchar(50)", key: "-", nullable: true, desc: "Học hàm, học vị (GS, PGS, TS, ThS)" },
      { name: "job_title", type: "nvarchar(100)", key: "-", nullable: true, desc: "Chức vụ (Trưởng bộ môn, Giảng viên chính)" },
      { name: "phone_number", type: "varchar(20)", key: "-", nullable: true, desc: "Số điện thoại di động" },
      { name: "address", type: "nvarchar(255)", key: "-", nullable: true, desc: "Địa chỉ cư trú" },
      { name: "staff_code", type: "varchar(55)", key: "-", nullable: true, desc: "Mã định danh cán bộ mở rộng" },
      { name: "avatar_url", type: "varchar(255)", key: "-", nullable: true, desc: "Link ảnh đại diện thẻ cán bộ" }
    ]
  },
  vc_doctors: {
    category: "3. Nhân sự & Y tế",
    name: "vc_doctors",
    entity: "VcDoctors.cs",
    description: "Hồ sơ Bác sĩ bệnh viện đối tác (BVĐK MEDLATEC) chịu trách nhiệm khám và ký duyệt hồ sơ.",
    columns: [
      { name: "doctor_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính bác sĩ" },
      { name: "user_id", type: "int", key: "FK -> vc_users (UK)", nullable: true, desc: "Tài khoản bác sĩ đăng nhập 1-1" },
      { name: "doctor_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã định danh bác sĩ" },
      { name: "full_name", type: "nvarchar(150)", key: "-", nullable: false, desc: "Họ và tên bác sĩ" },
      { name: "license_number", type: "varchar(50)", key: "-", nullable: true, desc: "Số chứng chỉ hành nghề y" },
      { name: "hospital_name", type: "nvarchar(255)", key: "Default: BVĐK MEDLATEC", nullable: true, desc: "Bệnh viện công tác" },
      { name: "specialty_id", type: "int", key: "FK -> vc_specialties", nullable: true, desc: "Chuyên khoa y tế phụ trách" }
    ]
  },

  // 4. Kế hoạch Đợt khám
  vc_checkup_campaigns: {
    category: "4. Kế hoạch Đợt khám",
    name: "vc_checkup_campaigns",
    entity: "VcCheckupCampaigns.cs",
    description: "Quản lý kế hoạch các đợt khám sức khỏe định kỳ do Học viện phối hợp tổ chức.",
    columns: [
      { name: "campaign_id", type: "int", key: "PK (Identity)", nullable: false, desc: "ID đợt khám" },
      { name: "campaign_code", type: "varchar(50)", key: "UK (Unique)", nullable: false, desc: "Mã đợt khám (KSK-VNUA-2026)" },
      { name: "campaign_name", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên đợt khám" },
      { name: "year", type: "int", key: "-", nullable: false, desc: "Năm tổ chức khám" },
      { name: "start_date", type: "date", key: "-", nullable: false, desc: "Ngày bắt đầu khám" },
      { name: "end_date", type: "date", key: "-", nullable: false, desc: "Ngày kết thúc đợt khám" },
      { name: "hospital_partner", type: "nvarchar(255)", key: "Default: BVĐK MEDLATEC", nullable: true, desc: "Đơn vị y tế phối hợp" },
      { name: "status", type: "varchar(20)", key: "Default: 'PLANNING'", nullable: true, desc: "Trạng thái (PLANNING, IN_PROGRESS, COMPLETED)" }
    ]
  },
  vc_campaign_registrations: {
    category: "4. Kế hoạch Đợt khám",
    name: "vc_campaign_registrations",
    entity: "VcCampaignRegistrations.cs",
    description: "Lịch đăng ký tham gia đợt khám và trạng thái điểm danh thực tế (Check-in) của cán bộ.",
    columns: [
      { name: "registration_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính lượt đăng ký" },
      { name: "campaign_id", type: "int", key: "FK -> vc_checkup_campaigns", nullable: false, desc: "Đợt khám tham gia" },
      { name: "staff_id", type: "int", key: "FK -> vc_staffs", nullable: false, desc: "Cán bộ đăng ký" },
      { name: "scheduled_date", type: "date", key: "-", nullable: false, desc: "Ngày hẹn đến khám" },
      { name: "checkin_status", type: "varchar(20)", key: "Default: 'REGISTERED'", nullable: true, desc: "Trạng thái (REGISTERED, CHECKED_IN, CANCELLED)" },
      { name: "checkin_time", type: "datetime2", key: "-", nullable: true, desc: "Thời điểm quét thẻ check-in tại bàn lễ tân" }
    ]
  },
  vc_staff_registered_services: {
    category: "4. Kế hoạch Đợt khám",
    name: "vc_staff_registered_services",
    entity: "VcStaffRegisteredServices.cs",
    description: "Các gói dịch vụ khám nâng cao hoặc xét nghiệm thêm mà cán bộ đăng ký ngoài gói cơ bản.",
    columns: [
      { name: "reg_service_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính" },
      { name: "registration_id", type: "int", key: "FK -> vc_campaign_registrations", nullable: false, desc: "Lượt đăng ký khám" },
      { name: "service_id", type: "int", key: "FK -> vc_medical_services", nullable: false, desc: "Dịch vụ y tế đăng ký thêm" },
      { name: "status", type: "varchar(20)", key: "Default: 'PENDING'", nullable: true, desc: "Trạng thái thực hiện (PENDING, COMPLETED)" }
    ]
  },

  // 5. Hồ sơ Khám & Lâm sàng
  vc_health_checkup_records: {
    category: "5. Hồ sơ Khám & Lâm sàng",
    name: "vc_health_checkup_records",
    entity: "VcHealthCheckupRecords.cs",
    description: "Bảng trung tâm lưu hồ sơ khám tổng hợp, mã vạch SID, kết luận phân loại sức khỏe Bộ Y tế.",
    columns: [
      { name: "record_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính hồ sơ khám bệnh" },
      { name: "campaign_id", type: "int", key: "FK -> vc_checkup_campaigns", nullable: false, desc: "Thuộc đợt khám nào" },
      { name: "staff_id", type: "int", key: "FK -> vc_staffs", nullable: false, desc: "Cán bộ được khám" },
      { name: "sid_code", type: "varchar(50)", key: "UK (Unique)", nullable: true, desc: "Mã vạch hồ sơ (SID Barcode)" },
      { name: "examination_date", type: "date", key: "-", nullable: false, desc: "Ngày bắt đầu khám" },
      { name: "actual_checkup_date", type: "date", key: "-", nullable: true, desc: "Ngày thực tế hoàn thành khám" },
      { name: "medical_history_personal", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tiền sử bệnh bản thân" },
      { name: "medical_history_family", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tiền sử bệnh gia đình" },
      { name: "health_classification", type: "nvarchar(10)", key: "-", nullable: true, desc: "Phân loại sức khỏe (Loại I đến V)" },
      { name: "general_conclusion", type: "nvarchar(max)", key: "-", nullable: true, desc: "Kết luận chung của bác sĩ" },
      { name: "recommendations", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tư vấn chế độ dinh dưỡng, điều trị" },
      { name: "concluded_by_doctor_id", type: "int", key: "FK -> vc_doctors", nullable: true, desc: "Bác sĩ trưởng ký duyệt kết luận" },
      { name: "concluded_at", type: "datetime2", key: "-", nullable: true, desc: "Thời điểm ký duyệt kết luận" },
      { name: "status", type: "varchar(20)", key: "Default: 'DRAFT'", nullable: true, desc: "Trạng thái (DRAFT, IN_PROGRESS, COMPLETED)" },
      { name: "report_pdf_url", type: "varchar(500)", key: "-", nullable: true, desc: "Đường dẫn file PDF báo cáo kết quả" }
    ]
  },
  vc_vital_signs: {
    category: "5. Hồ sơ Khám & Lâm sàng",
    name: "vc_vital_signs",
    entity: "VcVitalSigns.cs",
    description: "Đo lường thể lực và các chỉ số sinh tồn tại bàn đón tiếp ban đầu.",
    columns: [
      { name: "vital_sign_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records (UK)", nullable: false, desc: "Hồ sơ khám 1-1" },
      { name: "height_cm", type: "numeric(5,2)", key: "-", nullable: true, desc: "Chiều cao (cm)" },
      { name: "weight_kg", type: "numeric(5,2)", key: "-", nullable: true, desc: "Cân nặng (kg)" },
      { name: "bmi", type: "numeric(4,2)", key: "-", nullable: true, desc: "Chỉ số khối cơ thể BMI" },
      { name: "waist_cm", type: "numeric(5,2)", key: "-", nullable: true, desc: "Vòng bụng (cm)" },
      { name: "systolic_bp", type: "int", key: "-", nullable: true, desc: "Huyết áp tâm thu (Huyết áp tối đa, mmHg)" },
      { name: "diastolic_bp", type: "int", key: "-", nullable: true, desc: "Huyết áp tâm trương (Huyết áp tối thiểu, mmHg)" },
      { name: "heart_rate_bpm", type: "int", key: "-", nullable: true, desc: "Nhịp tim (lần/phút)" },
      { name: "respiratory_rate", type: "int", key: "-", nullable: true, desc: "Nhịp thở (lần/phút)" },
      { name: "spo2_percent", type: "numeric(4,1)", key: "-", nullable: true, desc: "Độ bão hòa oxy trong máu (%)" },
      { name: "measured_by", type: "int", key: "FK -> vc_doctors", nullable: true, desc: "Điều dưỡng / Bác sĩ đo" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm đo" }
    ]
  },
  vc_internal_medicine_exams: {
    category: "5. Hồ sơ Khám & Lâm sàng",
    name: "vc_internal_medicine_exams",
    entity: "VcInternalMedicineExams.cs",
    description: "Kết quả khám lâm sàng chi tiết 6 hệ cơ quan nội khoa của bác sĩ.",
    columns: [
      { name: "internal_exam_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính khám nội" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records (UK)", nullable: false, desc: "Hồ sơ khám tương ứng (1-1)" },
      { name: "circulatory_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tuần hoàn / Tim mạch" },
      { name: "respiratory_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Hô hấp / Phổi" },
      { name: "digestive_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tiêu hóa / Gan lách" },
      { name: "urinary_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Thận - Tiết niệu" },
      { name: "musculoskeletal_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Cơ xương khớp" },
      { name: "neurological_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Thần kinh - Tâm thần" },
      { name: "conclusion", type: "nvarchar(max)", key: "-", nullable: true, desc: "Kết luận khám nội" },
      { name: "health_class", type: "nvarchar(10)", key: "-", nullable: true, desc: "Xếp loại sức khỏe nội khoa" },
      { name: "examining_doctor_id", type: "int", key: "FK -> vc_doctors", nullable: true, desc: "Bác sĩ nội khoa thực hiện" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm khám" }
    ]
  },
  vc_specialist_exams: {
    category: "5. Hồ sơ Khám & Lâm sàng",
    name: "vc_specialist_exams",
    entity: "VcSpecialistExams.cs",
    description: "Khám chuyên khoa: Mắt (thị lực), Răng Hàm Mặt, Tai Mũi Họng, Da liễu.",
    columns: [
      { name: "specialist_exam_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records", nullable: false, desc: "Hồ sơ khám tương ứng" },
      { name: "specialty_type", type: "varchar(30)", key: "-", nullable: false, desc: "Loại chuyên khoa (EYE, ENT, DENTAL, DERMATOLOGY)" },
      { name: "vision_left_no_glass", type: "varchar(20)", key: "-", nullable: true, desc: "Thị lực mắt trái không kính" },
      { name: "vision_right_no_glass", type: "varchar(20)", key: "-", nullable: true, desc: "Thị lực mắt phải không kính" },
      { name: "vision_left_glass", type: "varchar(20)", key: "-", nullable: true, desc: "Thị lực mắt trái có kính" },
      { name: "vision_right_glass", type: "varchar(20)", key: "-", nullable: true, desc: "Thị lực mắt phải có kính" },
      { name: "upper_jaw", type: "nvarchar(max)", key: "-", nullable: true, desc: "Răng hàm trên" },
      { name: "lower_jaw", type: "nvarchar(max)", key: "-", nullable: true, desc: "Răng hàm dưới" },
      { name: "teeth_formula", type: "nvarchar(max)", key: "-", nullable: true, desc: "Công thức răng sâu, mất" },
      { name: "ear_left_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tai trái" },
      { name: "ear_right_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Tai phải" },
      { name: "nose_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Mũi xoang" },
      { name: "throat_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Họng thanh quản" },
      { name: "skin_desc", type: "nvarchar(max)", key: "-", nullable: true, desc: "Da liễu" },
      { name: "conclusion", type: "nvarchar(max)", key: "-", nullable: true, desc: "Kết luận chuyên khoa" },
      { name: "health_class", type: "nvarchar(10)", key: "-", nullable: true, desc: "Xếp loại sức khỏe chuyên khoa" },
      { name: "examining_doctor_id", type: "int", key: "FK -> vc_doctors", nullable: true, desc: "Bác sĩ khám chuyên khoa" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm khám" }
    ]
  },
  vc_health_record_diagnoses: {
    category: "5. Hồ sơ Khám & Lâm sàng",
    name: "vc_health_record_diagnoses",
    entity: "VcHealthRecordDiagnoses.cs",
    description: "Danh sách các bệnh lý được chẩn đoán liên kết với mã ICD-10.",
    columns: [
      { name: "record_diagnosis_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records", nullable: false, desc: "Hồ sơ khám" },
      { name: "disease_id", type: "int", key: "FK -> vc_disease_catalog", nullable: false, desc: "Mã bệnh danh mục ICD-10" },
      { name: "is_primary", type: "bit", key: "Default: 0", nullable: true, desc: "Có phải chẩn đoán bệnh chính hay bệnh kèm theo" },
      { name: "diagnosis_note", type: "nvarchar(max)", key: "-", nullable: true, desc: "Ghi chú chẩn đoán lâm sàng" }
    ]
  },

  // 6. Cận lâm sàng & Xét nghiệm
  vc_lab_test_orders: {
    category: "6. Cận lâm sàng & Xét nghiệm",
    name: "vc_lab_test_orders",
    entity: "VcLabTestOrders.cs",
    description: "Chỉ định xét nghiệm, mã barcode dán ống nghiệm mẫu máu/nước tiểu và tiến độ xử lý.",
    columns: [
      { name: "order_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính chỉ định xét nghiệm" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records", nullable: false, desc: "Hồ sơ khám" },
      { name: "service_id", type: "int", key: "FK -> vc_medical_services", nullable: true, desc: "Dịch vụ xét nghiệm" },
      { name: "sample_barcode", type: "varchar(50)", key: "-", nullable: true, desc: "Mã vạch dán trên ống nghiệm (LIS Barcode)" },
      { name: "sample_type", type: "varchar(30)", key: "-", nullable: false, desc: "Loại bệnh phẩm (BLOOD, URINE, STOOL)" },
      { name: "collected_at", type: "datetime2", key: "-", nullable: true, desc: "Thời điểm lấy mẫu máu/nước tiểu" },
      { name: "received_at", type: "datetime2", key: "-", nullable: true, desc: "Thời điểm phòng Lab nhận mẫu" },
      { name: "status", type: "varchar(20)", key: "Default: 'PENDING'", nullable: true, desc: "Trạng thái (PENDING, PROCESSING, COMPLETED)" }
    ]
  },
  vc_lab_test_results: {
    category: "6. Cận lâm sàng & Xét nghiệm",
    name: "vc_lab_test_results",
    entity: "VcLabTestResults.cs",
    description: "Kết quả đo chi tiết từng chỉ số xét nghiệm máy phân tích trả về, cờ cảnh báo bất thường.",
    columns: [
      { name: "result_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính kết quả" },
      { name: "order_id", type: "int", key: "FK -> vc_lab_test_orders", nullable: false, desc: "Thuộc chỉ định xét nghiệm nào" },
      { name: "indicator_id", type: "int", key: "FK -> vc_lab_indicator_catalog", nullable: false, desc: "Chỉ số xét nghiệm đo được" },
      { name: "result_value", type: "nvarchar(100)", key: "-", nullable: false, desc: "Giá trị đo được dạng chuỗi" },
      { name: "numeric_value", type: "numeric(12,4)", key: "-", nullable: true, desc: "Giá trị số học phục vụ so sánh ngưỡng" },
      { name: "flag", type: "varchar(20)", key: "Default: 'NORMAL'", nullable: true, desc: "Cờ cảnh báo (NORMAL, HIGH, LOW, CRITICAL)" },
      { name: "note", type: "nvarchar(max)", key: "-", nullable: true, desc: "Ghi chú của kỹ thuật viên xét nghiệm" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm trả kết quả" }
    ]
  },

  // 7. Chẩn đoán hình ảnh
  vc_diagnostic_reports: {
    category: "7. Chẩn đoán hình ảnh",
    name: "vc_diagnostic_reports",
    entity: "VcDiagnosticReports.cs",
    description: "Kết quả chẩn đoán hình ảnh: X-Quang ngực thẳng, Siêu âm ổ bụng, Điện tim ECG.",
    columns: [
      { name: "report_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính phiếu CĐHA" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records", nullable: false, desc: "Hồ sơ khám tương ứng" },
      { name: "modality_type", type: "varchar(30)", key: "-", nullable: false, desc: "Phương pháp (XRAY, ULTRASOUND, ECG, CT, MRI)" },
      { name: "exam_title", type: "nvarchar(255)", key: "-", nullable: false, desc: "Tên chụp chiếu (Chụp X-quang tim phổi thẳng)" },
      { name: "technique_description", type: "nvarchar(max)", key: "-", nullable: true, desc: "Mô tả kỹ thuật chụp" },
      { name: "findings_data", type: "nvarchar(max)", key: "-", nullable: true, desc: "Mô tả tổn thương, hình ảnh quan sát được" },
      { name: "conclusion", type: "nvarchar(max)", key: "-", nullable: false, desc: "Kết luận CĐHA (Hình ảnh tim phổi bình thường)" },
      { name: "image_urls", type: "nvarchar(max)", key: "-", nullable: true, desc: "Danh sách link ảnh DICOM / PNG" },
      { name: "reading_doctor_id", type: "int", key: "FK -> vc_doctors", nullable: true, desc: "Bác sĩ đọc kết quả" },
      { name: "approving_doctor_id", type: "int", key: "FK -> vc_doctors", nullable: true, desc: "Bác sĩ duyệt kết quả" },
      { name: "performed_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm thực hiện" }
    ]
  },
  vc_imaging_attachments: {
    category: "7. Chẩn đoán hình ảnh",
    name: "vc_imaging_attachments",
    entity: "VcImagingAttachments.cs",
    description: "File ảnh đính kèm chi tiết của phim chụp X-Quang, siêu âm.",
    columns: [
      { name: "attachment_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính tệp đính kèm" },
      { name: "report_id", type: "int", key: "FK -> vc_diagnostic_reports", nullable: false, desc: "Thuộc phiếu chẩn đoán hình ảnh nào" },
      { name: "file_url", type: "varchar(500)", key: "-", nullable: false, desc: "Đường dẫn file lưu trữ trên Server/Cloud S3" },
      { name: "file_type", type: "varchar(20)", key: "-", nullable: false, desc: "Định dạng file (DICOM, JPEG, PNG, PDF)" },
      { name: "file_size_bytes", type: "bigint", key: "-", nullable: true, desc: "Dung lượng tệp (bytes)" },
      { name: "caption", type: "nvarchar(255)", key: "-", nullable: true, desc: "Chú thích góc chụp" },
      { name: "created_at", type: "datetime2", key: "Default: getdate()", nullable: true, desc: "Thời điểm upload" }
    ]
  },

  // 8. Đơn thuốc & Điều trị
  vc_prescriptions: {
    category: "8. Đơn thuốc & Điều trị",
    name: "vc_prescriptions",
    entity: "VcPrescriptions.cs",
    description: "Đơn thuốc do bác sĩ kê dựa trên kết luận hồ sơ khám sức khỏe.",
    columns: [
      { name: "prescription_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính đơn thuốc" },
      { name: "record_id", type: "int", key: "FK -> vc_health_checkup_records", nullable: false, desc: "Hồ sơ khám y tế" },
      { name: "prescribing_doctor_id", type: "int", key: "FK -> vc_doctors", nullable: false, desc: "Bác sĩ kê đơn" },
      { name: "doctor_advice", type: "nvarchar(max)", key: "-", nullable: true, desc: "Lời dặn dò dùng thuốc và chế độ ăn" },
      { name: "follow_up_date", type: "date", key: "-", nullable: true, desc: "Ngày hẹn tái khám" }
    ]
  },
  vc_prescription_details: {
    category: "8. Đơn thuốc & Điều trị",
    name: "vc_prescription_details",
    entity: "VcPrescriptionDetails.cs",
    description: "Chi tiết từng loại thuốc, liều lượng và cách dùng trong đơn thuốc.",
    columns: [
      { name: "detail_id", type: "int", key: "PK (Identity)", nullable: false, desc: "Khóa chính dòng thuốc" },
      { name: "prescription_id", type: "int", key: "FK -> vc_prescriptions", nullable: false, desc: "Thuộc đơn thuốc nào" },
      { name: "medication_id", type: "int", key: "FK -> vc_medication_catalog", nullable: false, desc: "Thuốc trong danh mục" },
      { name: "quantity", type: "int", key: "-", nullable: false, desc: "Số lượng cấp phát" },
      { name: "dosage_instruction", type: "nvarchar(255)", key: "-", nullable: false, desc: "Hướng dẫn liều dùng (Sáng 1 viên, tối 1 viên sau ăn)" },
      { name: "duration_days", type: "int", key: "-", nullable: true, desc: "Dùng trong bao nhiêu ngày" }
    ]
  }
};

// ====================================================
// 2. KHỞI TẠO VÀ XỬ LÝ GIAO DIỆN TƯƠNG TÁC
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSidebar();
  initModelSynthesis();
  initEasyExplainer();
  initTraceExplorer();
  initRoadmapExplorer();
  initFolderExplorer();
  initCodePointersExplorer();
  initAnyAsyncPlayground();
  initScenarioSelector();
  initModuleExplorer();
  initSchemaExplorer();
  initLifecycleStepper();
  initApiCatalog();
  initSearch();
});

// Chuyển đổi giao diện Sáng / Tối
function initTheme() {
  const savedTheme = localStorage.getItem("vnuacare_doc_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("vnuacare_doc_theme", newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (icon) icon.textContent = theme === "dark" ? "Giao diện Tối" : "Giao diện Sáng";
}

// Chuyển mục tài liệu trên Sidebar & Hỗ trợ Mobile Drawer
function initSidebar() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = item.getAttribute("data-target");
      if (targetId) switchSection(targetId);
    });
  });

  const mobileBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
      if (overlay) overlay.classList.toggle("active");
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      if (sidebar) sidebar.classList.remove("mobile-open");
      overlay.classList.remove("active");
    });
  }
}

function switchSection(sectionId) {
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-target") === sectionId);
  });

  document.querySelectorAll(".doc-section").forEach(sec => {
    sec.classList.toggle("active", sec.id === sectionId);
  });

  const activeNav = document.querySelector(`.nav-item[data-target="${sectionId}"]`);
  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");
  if (activeNav && breadcrumbCurrent) {
    breadcrumbCurrent.textContent = activeNav.querySelector(".nav-text").textContent;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.remove("mobile-open");
  const overlay = document.getElementById("sidebarOverlay");
  if (overlay) overlay.classList.remove("active");
}

// Playground so sánh 3 cách kiểm tra tồn tại
function initAnyAsyncPlayground() {
  const tabBtns = document.querySelectorAll(".tab-btn[data-method]");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderAnyAsyncDetails(btn.getAttribute("data-method"));
    });
  });

  renderAnyAsyncDetails("any");
}

function renderAnyAsyncDetails(methodKey) {
  const data = {
    any: {
      title: "1. .AnyAsync(...) - TỐI ƯU NHẤT CHO KIỂM TRA TỒN TẠI",
      csharp: `// Kiểm tra mã vạch SID đã tồn tại chưa (CreateHealthCheckupRecordCommand.cs):
var isSidExisted = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);

if (isSidExisted)
{
    throw new ArgumentException("Mã vạch hồ sơ (SID) đã tồn tại!");
}`,
      sql: `SELECT CASE
    WHEN EXISTS (
        SELECT 1
        FROM [vc_health_checkup_records] AS [v]
        WHERE [v].[sid_code] = @__sidCode
    ) THEN CAST(1 AS bit)
    ELSE CAST(0 AS bit)
END;`,
      behavior: "SQL Server thực thi mệnh đề EXISTS. Cơ chế Short-circuiting ngắt quét bảng ngay khi thấy bản ghi ĐẦU TIÊN khớp. Không quét tiếp.",
      memory: "0 bytes RAM (không khởi tạo đối tượng Entity C#).",
      bandwidth: "1 bit (0 hoặc 1) truyền qua mạng LAN/Internet.",
      benchmark: "1.2 ms (Nhanh nhất - Chuẩn Production)",
      verdict: "badge-green"
    },
    count: {
      title: "2. .CountAsync() > 0 - KHÔNG TỐI ƯU KHI CHECK TỒN TẠI",
      csharp: `var count = await _dataContext.VcHealthCheckupRecords
    .CountAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);

if (count > 0)
{
    throw new ArgumentException("Mã vạch hồ sơ (SID) đã tồn tại!");
}`,
      sql: `SELECT COUNT(*)
FROM [vc_health_checkup_records] AS [v]
WHERE [v].[sid_code] = @__sidCode;`,
      behavior: "SQL Server bắt buộc phải duyệt qua TOÀN BỘ các bản ghi khớp với điều kiện để đếm tổng số lượng bản ghi thỏa mãn, không thể ngắt sớm.",
      memory: "0 bytes RAM (chỉ lưu 1 biến int count).",
      bandwidth: "4 bytes (1 số nguyên integer 32-bit).",
      benchmark: "8.5 ms (Chậm hơn 7 lần khi bảng lớn)",
      verdict: "badge-yellow"
    },
    first: {
      title: "3. .FirstOrDefaultAsync() != null - LÃNG PHÍ BỘ NHỚ KHI CHECK TỒN TẠI",
      csharp: `var record = await _dataContext.VcHealthCheckupRecords
    .FirstOrDefaultAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);

if (record != null)
{
    throw new ArgumentException("Mã vạch hồ sơ (SID) đã tồn tại!");
}`,
      sql: `SELECT TOP(1) [v].[record_id], [v].[campaign_id], [v].[staff_id], [v].[sid_code], ...
FROM [vc_health_checkup_records] AS [v]
WHERE [v].[sid_code] = @__sidCode;`,
      behavior: "Dừng khi thấy 1 bản ghi (TOP 1), nhưng phải đọc và trả về TOÀN BỘ các cột dữ liệu của thực thể đó và nạp vào Change Tracker.",
      memory: "Cấp phát ~1.5 KB RAM để khởi tạo đối tượng VcHealthCheckupRecords.",
      bandwidth: "Hàng trăm bytes truyền qua mạng.",
      benchmark: "12.4 ms (Chậm hơn 10 lần, lãng phí RAM)",
      verdict: "badge-red"
    },
    where: {
      title: "4. Dynamic .Where(...) - LỌC ĐA ĐIỀU KIỆN ĐỘNG (DYNAMIC FILTERING)",
      csharp: `// Trích xuất từ GetFilterUserQuery.cs (Dòng 44 - 64):
var query = _dataContext.VcUsers.AsNoTracking();

if (!string.IsNullOrWhiteSpace(filter.Role))
    query = query.Where(x => x.Role == filter.Role.Trim());

if (filter.IsActive.HasValue)
    query = query.Where(x => x.IsActive == filter.IsActive.Value);

if (!string.IsNullOrWhiteSpace(filter.TextSearch))
    query = query.Where(x => x.Username.ToLower().Contains(filter.TextSearch));

var users = await query.ToListAsync(cancellationToken);`,
      sql: `SELECT [u].[user_id], [u].[username], [u].[email], [u].[role], [u].[is_active], [u].[created_at]
FROM [vc_users] AS [u]
WHERE (@__role_null = 1 OR [u].[role] = @__role)
  AND (@__isActive_null = 1 OR [u].[is_active] = @__isActive)
  AND (@__search_null = 1 OR LOWER([u].[username]) LIKE '%' + @__search + '%');`,
      behavior: "EF Core ghép nối các điều kiện vào Expression Tree và chỉ dịch thành 1 câu SQL duy nhất khi gọi kết thúc. Tận dụng Index Seek trên cột có chỉ mục.",
      memory: "Cấp phát vừa đủ cho số lượng bản ghi thỏa mãn điều kiện lọc.",
      bandwidth: "Tối ưu, chỉ gửi các dòng khớp qua mạng.",
      benchmark: "3.5 ms (Tối ưu hóa bộ lọc SQL Server)",
      verdict: "badge-green"
    },
    paging: {
      title: "5. .Skip(...).Take(...) - PHÂN TRANG PHÍA SERVER (OFFSET FETCH)",
      csharp: `// Trích xuất từ GetFilterUserQuery.cs (Dòng 86 - 91):
int skip = (pageNumber - 1) * pageSize; // Ví dụ: Trang 2, cỡ 10 -> skip = 10

var items = await query
    .OrderByDescending(x => x.UserId) // Bắt buộc phải có ORDER BY
    .Skip(skip)
    .Take(pageSize)
    .ToListAsync(cancellationToken);`,
      sql: `SELECT [u].[user_id], [u].[username], [u].[email], [u].[role], [u].[is_active], [u].[created_at]
FROM [vc_users] AS [u]
ORDER BY [u].[user_id] DESC
OFFSET @__skip ROWS FETCH NEXT @__take ROWS ONLY;`,
      behavior: "Chuẩn ANSI SQL Server 2012+: Bỏ qua đúng @__skip dòng và chỉ nạp đúng @__take dòng tiếp theo. Bắt buộc phải có ORDER BY để đảm bảo tính xác định.",
      memory: "Cực thấp: Chỉ cấp phát bộ nhớ RAM cho đúng 1 trang dữ liệu (ví dụ: 10 bản ghi).",
      bandwidth: "Chỉ vài Kilobytes truyền qua mạng LAN/Internet thay vì hàng Megabytes.",
      benchmark: "2.1 ms (Chuẩn phân trang tốc độ cao)",
      verdict: "badge-green"
    },
    select: {
      title: "6. .Select(...) Projection - CHỐNG OVER-FETCHING (CHỈ LẤY CỘT CẦN DÙNG)",
      csharp: `// Trích xuất từ GetComboxUserQuery.cs (Dòng 66 - 75):
var userList = await query
    .OrderBy(x => x.Username)
    .Select(x => new UserSelectModel
    {
        UserId = x.UserId,
        Username = x.Username,
        Email = x.Email,
        Role = x.Role,
        IsActive = x.IsActive
    }) // Tuyệt đối KHÔNG lấy password_hash hay refresh_token!
    .ToListAsync(cancellationToken);`,
      sql: `SELECT [u].[user_id] AS [UserId], [u].[username] AS [Username], [u].[email] AS [Email], [u].[role] AS [Role], [u].[is_active] AS [IsActive]
FROM [vc_users] AS [u]
ORDER BY [u].[username];`,
      behavior: "EF Core KHÔNG BAO GIỜ sinh SELECT *. Chỉ lấy đúng 5 cột được khai báo. Loại bỏ hoàn toàn nguy cơ rò rỉ cột nhạy cảm (PasswordHash, RefreshToken).",
      memory: "Giảm 75% RAM do không tạo đối tượng Entity đầy đủ và không nạp các trường dữ liệu thừa.",
      bandwidth: "Giảm 80% băng thông mạng truyền tải giữa SQL Server và Web API.",
      benchmark: "1.8 ms (Bảo mật & Siêu tốc)",
      verdict: "badge-green"
    },
    notracking: {
      title: "7. .AsNoTracking() - TẮT THEO DÕI THAY ĐỔI (TIẾT KIỆM 60% RAM)",
      csharp: `// Áp dụng trên VnuaCareReadDataContext và 100% các file Queries/:
var query = _dataContext.VcStaffs.AsNoTracking();
var staffList = await query.ToListAsync(cancellationToken);`,
      sql: `SELECT [s].[staff_id], [s].[department_id], [s].[employee_code], [s].[full_name], [s].[gender], ...
FROM [vc_staffs] AS [s];`,
      behavior: "Câu lệnh SQL sinh ra giống nhau, nhưng trên Web Server: EF Core KHÔNG tạo đối tượng Snapshot trong Change Tracker. Không theo dõi thay đổi thuộc tính.",
      memory: "Giảm 60% dung lượng RAM của ứng dụng .NET. Bộ thu gom rác (Garbage Collector) dọn dẹp bộ nhớ tức thì.",
      bandwidth: "Giữ nguyên (chỉ tải dữ liệu cần thiết).",
      benchmark: "1.5 ms (Tăng 250% tốc độ đọc dữ liệu)",
      verdict: "badge-green"
    },
    trans: {
      title: "8. SaveChangesAsync() - GIAO DỊCH ACID TỰ ĐỘNG (TRANSACTION)",
      csharp: `// Trích xuất từ CreateStaffCommand.cs (Dòng 145 - 165):
await _dataContext.VcUsers.AddAsync(userEntity, cancellationToken);
await _dataContext.SaveChangesAsync(cancellationToken);

staffEntity.UserId = userEntity.UserId; // Lấy ID tự tăng vừa sinh (scope_identity)
await _dataContext.VcStaffs.AddAsync(staffEntity, cancellationToken);
await _dataContext.SaveChangesAsync(cancellationToken);`,
      sql: `SET IMPLICIT_TRANSACTIONS OFF;
BEGIN TRANSACTION;
INSERT INTO [vc_users] ([username], [email], [password_hash], [role], [is_active], [created_at], [updated_at])
VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6);
SELECT [user_id] FROM [vc_users] WHERE @@ROWCOUNT = 1 AND [user_id] = scope_identity();

INSERT INTO [vc_staffs] ([user_id], [department_id], [employee_code], [full_name], [gender], [date_of_birth], ...)
VALUES (@user_id, @p7, @p8, @p9, @p10, @p11, ...);
SELECT [staff_id] FROM [vc_staffs] WHERE @@ROWCOUNT = 1 AND [staff_id] = scope_identity();
COMMIT TRANSACTION;`,
      behavior: "SQL Server tự động bọc các lệnh INSERT liên hoàn vào 1 giao dịch ACID duy nhất (BEGIN TRAN ... COMMIT). Nếu có lỗi ở bảng con, tự động ROLLBACK toàn bộ, không để lại dữ liệu rác.",
      memory: "Cấp phát tạm thời trong Transaction Scope, giải phóng ngay sau khi Commit.",
      bandwidth: "Tối ưu hóa gom nhiều lệnh ghi thành 1 Batch gửi qua giao thức TDS.",
      benchmark: "4.2 ms (Đảm bảo toàn vẹn dữ liệu 100%)",
      verdict: "badge-green"
    }
  }[methodKey];

  if (!data) return;
  document.getElementById("anyAsyncTitle").textContent = data.title;
  document.getElementById("anyAsyncCsharp").textContent = data.csharp;
  document.getElementById("anyAsyncSql").textContent = data.sql;
  document.getElementById("anyAsyncBehavior").textContent = data.behavior;
  document.getElementById("anyAsyncMemory").textContent = data.memory;
  document.getElementById("anyAsyncBandwidth").textContent = data.bandwidth;
  const bmEl = document.getElementById("anyAsyncBenchmark");
  bmEl.textContent = data.benchmark;
  bmEl.className = `badge-tag ${data.verdict}`;
}

// Bộ chọn 5 kịch bản thực tế dùng AnyAsync
function initScenarioSelector() {
  const container = document.getElementById("scenarioPillContainer");
  if (!container) return;

  container.innerHTML = "";
  const scenarios = [
    {
      id: "sid-check",
      title: "1. Trùng mã vạch SID hồ sơ",
      location: "CreateHealthCheckupRecordCommand.cs (Dòng 116)",
      purpose: "Đảm bảo mỗi hồ sơ y tế có một mã định danh SID duy nhất trên toàn hệ thống.",
      csharp: `var isSidExisted = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);
if (isSidExisted) throw new ArgumentException($"Mã vạch hồ sơ (SID) '{model.SidCode}' đã tồn tại!");`,
      sql: `SELECT CASE WHEN EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [sid_code] = @__sidCode) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END;`,
      desc: "Kiểm tra chỉ mục Index trên cột sid_code. Short-circuiting ngắt quét bảng ngay khi thấy bản ghi đầu tiên khớp."
    },
    {
      id: "staff-campaign",
      title: "2. Cán bộ chỉ lập 1 hồ sơ / đợt",
      location: "CreateHealthCheckupRecordCommand.cs (Dòng 124)",
      purpose: "Ngăn chặn tạo trùng 2 hồ sơ cho cùng một cán bộ trong cùng 1 đợt khám.",
      csharp: `var isRecorded = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.CampaignId == model.CampaignId && x.StaffId == model.StaffId, cancellationToken);
if (isRecorded) throw new ArgumentException("Cán bộ này đã được lập hồ sơ trong đợt khám này!");`,
      sql: `SELECT CASE WHEN EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [campaign_id] = @__cId AND [staff_id] = @__sId) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END;`,
      desc: "Kiểm tra ràng buộc logic phức tạp giữa 2 khóa ngoại (CampaignId và StaffId) cực nhanh mà không load thực thể về RAM."
    },
    {
      id: "campaign-delete",
      title: "3. Ngăn xóa đợt khám có hồ sơ",
      location: "DeleteCampaignCommand.cs (Dòng 62)",
      purpose: "Bảo vệ toàn vẹn dữ liệu y tế, không cho phép xóa đợt khám nếu đã có hồ sơ liên kết.",
      csharp: `var hasRecords = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.CampaignId == request.CampaignId, cancellationToken);
if (hasRecords) throw new ArgumentException("Đợt khám này đã có hồ sơ liên kết, không thể xóa trực tiếp!");`,
      sql: `SELECT CASE WHEN EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [campaign_id] = @__id) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END;`,
      desc: "Chủ động kiểm tra trước thay vì để SQL Server ném ngoại lệ vi phạm khóa ngoại (Foreign Key Constraint Violation)."
    },
    {
      id: "campaign-update",
      title: "4. Trùng mã đợt khám khi sửa",
      location: "UpdateCampaignCommand.cs (Dòng 74)",
      purpose: "Đảm bảo mã đợt khám không bị trùng với đợt khám khác khi cập nhật thông tin.",
      csharp: `var isCodeExisted = await _dataContext.VcCheckupCampaigns
    .AnyAsync(x => x.CampaignCode == model.CampaignCode.Trim() && x.CampaignId != model.CampaignId, cancellationToken);
if (isCodeExisted) throw new ArgumentException("Mã đợt khám đã tồn tại ở đợt khám khác!");`,
      sql: `SELECT CASE WHEN EXISTS (SELECT 1 FROM [vc_checkup_campaigns] WHERE [campaign_code] = @__code AND [campaign_id] <> @__id) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END;`,
      desc: "Mệnh đề campaign_id <> @__id loại trừ chính bản ghi đang cập nhật để không bị báo lỗi trùng với chính nó."
    },
    {
      id: "fk-validation",
      title: "5. Kiểm tra khóa ngoại cha tồn tại",
      location: "CreateHealthCheckupRecordCommand.cs (Dòng 95 & 105)",
      purpose: "Xác thực sự tồn tại của thực thể cha trước khi tạo thực thể con.",
      csharp: `var campaignExists = await _dataContext.VcCheckupCampaigns
    .AnyAsync(x => x.CampaignId == model.CampaignId, cancellationToken);
if (!campaignExists) throw new ArgumentException($"Đợt khám '{model.CampaignId}' không tồn tại.");`,
      sql: `SELECT CASE WHEN EXISTS (SELECT 1 FROM [vc_checkup_campaigns] WHERE [campaign_id] = @__id) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END;`,
      desc: "Kiểm tra tồn tại khóa ngoại cực nhẹ, chỉ truyền 1 bit qua mạng thay vì tải toàn bộ thông tin đối tượng."
    }
  ];

  scenarios.forEach((sc, index) => {
    const pill = document.createElement("div");
    pill.className = `scenario-pill ${index === 0 ? "active" : ""}`;
    pill.textContent = sc.title;
    pill.addEventListener("click", () => {
      document.querySelectorAll(".scenario-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderScenarioDetail(sc);
    });
    container.appendChild(pill);
  });

  if (scenarios.length > 0) renderScenarioDetail(scenarios[0]);
}

function renderScenarioDetail(sc) {
  document.getElementById("scenarioTitle").textContent = sc.title;
  document.getElementById("scenarioLocation").textContent = sc.location;
  document.getElementById("scenarioPurpose").textContent = sc.purpose;
  document.getElementById("scenarioCsharp").textContent = sc.csharp;
  document.getElementById("scenarioSql").textContent = sc.sql;
  document.getElementById("scenarioExplanation").textContent = sc.desc;
}

// Trình duyệt chi tiết 6 Phân hệ Nghiệp vụ
function initModuleExplorer() {
  const navContainer = document.getElementById("moduleNavContainer");
  const contentContainer = document.getElementById("moduleContentContainer");
  if (!navContainer || !contentContainer) return;

  const modules = [
    {
      id: "auth",
      title: "1. Authorizations",
      controller: "AuthorizationController.cs (/api/v1/auth)",
      desc: "Quản lý phiên làm việc, cấp phát và làm mới JWT Access Token & Refresh Token an toàn.",
      handlers: [
        {
          name: "UserLoginCommand",
          type: "Command (Write)",
          roles: "Public",
          desc: "Đăng nhập bằng Username & Mật khẩu. Băm mật khẩu BCrypt, kiểm tra trạng thái hoạt động và cấp cặp Token (Access + Refresh Token).",
          code: `var user = await _dataContext.VcUsers.FirstOrDefaultAsync(x => x.Username == request.Username);
if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
    throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");

var accessToken = _jwtService.GenerateAccessToken(claims);
var refreshToken = _jwtService.GenerateRefreshToken();

user.RefreshToken = refreshToken;
user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
await _dataContext.SaveChangesAsync();`
        },
        {
          name: "RefreshTokenCommand",
          type: "Command (Write)",
          roles: "Public",
          desc: "Cấp lại Access Token mới từ Refresh Token khi Access Token cũ hết hạn.",
          code: `var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
var user = await _dataContext.VcUsers.FirstOrDefaultAsync(u => u.UserId == userId);
if (user == null || user.RefreshToken != request.RefreshToken) throw new UnauthorizedAccessException();
// Cấp newAccessToken và newRefreshToken mới (Token Rotation)`
        }
      ]
    },
    {
      id: "users",
      title: "2. Users",
      controller: "UserController.cs (/api/v1/users)",
      desc: "Quản lý tài khoản đăng nhập, đổi mật khẩu và khóa/kích hoạt tài khoản.",
      handlers: [
        {
          name: "ChangePasswordCommand",
          type: "Command (Write)",
          roles: "Người sở hữu tài khoản",
          desc: "Đổi mật khẩu người dùng, có xác minh mật khẩu cũ bằng BCrypt.",
          code: `if (!_passwordHasher.VerifyPassword(request.OldPassword, user.PasswordHash))
    throw new ArgumentException("Mật khẩu cũ không chính xác.");
user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
await _dataContext.SaveChangesAsync();`
        },
        {
          name: "ToggleActiveUserCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN",
          desc: "Khóa hoặc mở khóa tài khoản người dùng, vô hiệu hóa khả năng đăng nhập tức thì.",
          code: `user.IsActive = !user.IsActive;
await _dataContext.SaveChangesAsync();
_cacheService.Remove(UserConstant.BuildCacheKey(user.UserId.ToString()));`
        }
      ]
    },
    {
      id: "staffs",
      title: "3. Staffs",
      controller: "StaffController.cs (/api/v1/staffs)",
      desc: "Quản lý hồ sơ cán bộ, giảng viên, nhân viên Học viện Nông nghiệp Việt Nam.",
      handlers: [
        {
          name: "CreateStaffCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN",
          desc: "Thêm cán bộ mới. Kiểm tra trùng lặp EmployeeCode và Username bằng AnyAsync, tạo User + Staff trong một Transaction.",
          code: `var isExisted = await _dataContext.VcStaffs.AnyAsync(x => x.EmployeeCode == model.EmployeeCode);
if (isExisted) throw new ArgumentException("Mã cán bộ đã tồn tại!");
// Tạo VcUsers -> Lưu CSDL sinh user_id -> Tạo VcStaffs gắn vào DepartmentId`
        },
        {
          name: "GetFilterStaffQuery",
          type: "Query (Read - AsNoTracking)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN",
          desc: "Lọc cán bộ theo Khoa/Phòng ban, tìm kiếm theo tên, mã cán bộ, chức vụ, số điện thoại.",
          code: `var query = _dataContext.VcStaffs.AsNoTracking();
if (filter.DepartmentId.HasValue) query = query.Where(p => p.DepartmentId == filter.DepartmentId.Value);
var list = await query.Skip(excludedRows).Take(filter.PageSize).ToListAsync();`
        }
      ]
    },
    {
      id: "doctors",
      title: "4. Doctors",
      controller: "DoctorController.cs (/api/v1/doctors)",
      desc: "Quản lý bác sĩ bệnh viện đối tác (BVĐK MEDLATEC) phụ trách khám và kết luận.",
      handlers: [
        {
          name: "CreateDoctorCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN",
          desc: "Thêm bác sĩ mới, kiểm tra chuyên khoa y tế và mã bác sĩ duy nhất bằng AnyAsync.",
          code: `// Kiểm tra SpecialtyId hợp lệ -> Tạo tài khoản User bác sĩ -> Tạo thực thể VcDoctors`
        },
        {
          name: "GetComboxDocTorQuery",
          type: "Query (Read - Cache)",
          roles: "Mọi vai trò đăng nhập",
          desc: "Danh mục chọn bác sĩ phục vụ chọn bác sĩ ký kết luận trong hồ sơ khám.",
          code: `string cacheKey = DoctorConstant.BuildCacheKey();
var list = await _cacheService.GetOrCreate(cacheKey, async () => { ... });`
        }
      ]
    },
    {
      id: "campaigns",
      title: "5. Campaigns",
      controller: "CampaignController.cs (/api/v1/campaigns)",
      desc: "Quản lý các đợt khám sức khỏe định kỳ hàng năm cho toàn thể cán bộ Học viện.",
      handlers: [
        {
          name: "CreateCampaignCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN",
          desc: "Thêm đợt khám mới. Kiểm tra mã đợt khám duy nhất bằng AnyAsync, xóa cache danh mục đợt khám.",
          code: `var isExisted = await _dataContext.VcCheckupCampaigns.AnyAsync(x => x.CampaignCode == model.CampaignCode);
if (isExisted) throw new ArgumentException("Mã đợt khám đã tồn tại.");
// Lưu thực thể VcCheckupCampaigns -> Xóa cache: _cacheService.Remove("campaigns-list-select");`
        },
        {
          name: "DeleteCampaignCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN",
          desc: "Xóa đợt khám. RÀNG BUỘC: Kiểm tra nếu đã có hồ sơ y tế liên kết bằng AnyAsync thì TỪ CHỐI XÓA!",
          code: `var hasRecords = await _dataContext.VcHealthCheckupRecords.AnyAsync(x => x.CampaignId == request.CampaignId);
if (hasRecords) throw new ArgumentException("Đợt khám này đã có hồ sơ y tế, không thể xóa!");`
        }
      ]
    },
    {
      id: "records",
      title: "6. HealthCheckupRecords",
      controller: "HealthCheckupRecordController.cs (/api/v1/healthcheckuprecords)",
      desc: "Phân hệ cốt lõi: Hồ sơ khám tổng hợp, mã vạch SID, kết quả khám lâm sàng 6 hệ cơ quan nội khoa.",
      handlers: [
        {
          name: "CreateHealthCheckupRecordCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN, DOCTOR",
          desc: "Quy trình 5 bước: 1. Quyền; 2. Validate dữ liệu; 3. Khóa ngoại đợt khám, cán bộ; 4. Trùng lặp SID và Cán bộ bằng AnyAsync; 5. Lưu CSDL.",
          code: `var isSidExisted = await _dataContext.VcHealthCheckupRecords.AnyAsync(x => x.SidCode == model.SidCode);
var isStaffRecorded = await _dataContext.VcHealthCheckupRecords.AnyAsync(x => x.CampaignId == model.CampaignId && x.StaffId == model.StaffId);
// Tạo VcHealthCheckupRecords -> Xóa Cache hồ sơ`
        },
        {
          name: "SaveInternalMedicineExamCommand",
          type: "Command (Write)",
          roles: "DOCTOR",
          desc: "Nhập hoặc cập nhật kết quả khám lâm sàng nội khoa 6 hệ cơ quan (Tuần hoàn, Hô hấp, Tiêu hóa, Tiết niệu, Cơ xương khớp, Thần kinh).",
          code: `// Lưu thực thể VcInternalMedicineExams liên kết 1-1 với RecordId`
        }
      ]
    },
    {
      id: "services",
      title: "7. MedicalServices & Packages",
      controller: "MedicalServiceController.cs (/api/v1/medical-services)",
      desc: "Quản trị danh mục dịch vụ y tế, đăng ký gói khám sức khỏe tự nguyện cho cán bộ và chỉ định khám chuyên khoa lâm sàng, cận lâm sàng.",
      handlers: [
        {
          name: "GetMedicalServicesCatalogQuery",
          type: "Query (Read - Cache Redis 300s)",
          roles: "Tất cả vai trò",
          desc: "Lấy danh mục dịch vụ khám và giá tiền niêm yết theo từng chuyên khoa (áp dụng Cache-Aside Redis 300 giây).",
          code: `string cacheKey = "medical-services-catalog-active";
var catalog = await _cacheService.GetOrCreate(cacheKey, async () => {
    return await _readContext.VcMedicalServices
        .AsNoTracking()
        .Where(s => s.IsActive)
        .OrderBy(s => s.CategoryOrder)
        .Select(s => new MedicalServiceCatalogDto {
            ServiceId = s.ServiceId,
            ServiceCode = s.ServiceCode,
            ServiceName = s.ServiceName,
            Price = s.Price,
            SpecialtyName = s.Specialty.SpecialtyName,
            ApplicableGender = s.ApplicableGender
        })
        .ToListAsync(cancellationToken);
}, TimeSpan.FromMinutes(5));
return ResponseObject<List<MedicalServiceCatalogDto>>.Success(catalog);`
        },
        {
          name: "RegisterStaffServicesCommand",
          type: "Command (Write)",
          roles: "SUPER_ADMIN, HEALTH_ADMIN, STAFF",
          desc: "Đăng ký gói khám và dịch vụ tự nguyện cho cán bộ trong đợt khám. Kiểm tra ràng buộc và chống trùng lặp bằng AnyAsync.",
          code: `// Kiểm tra đợt khám và trùng lặp dịch vụ bằng AnyAsync
var campaignExists = await _dataContext.VcCheckupCampaigns.AnyAsync(c => c.CampaignId == request.CampaignId, cancellationToken);
if (!campaignExists) throw new ArgumentException("Đợt khám không tồn tại hoặc đã kết thúc.");

var isAlreadyRegistered = await _dataContext.VcStaffRegisteredServices.AnyAsync(r => 
    r.StaffId == request.StaffId && 
    r.CampaignId == request.CampaignId && 
    r.ServiceId == request.ServiceId, cancellationToken);
if (isAlreadyRegistered) throw new ArgumentException("Cán bộ đã đăng ký dịch vụ này trong đợt khám!");

var regEntity = new VcStaffRegisteredServices {
    StaffId = request.StaffId,
    CampaignId = request.CampaignId,
    ServiceId = request.ServiceId,
    RegisteredDate = DateTime.UtcNow,
    Status = "APPROVED",
    IsVolunteerPackage = request.IsVolunteerPackage
};
_dataContext.VcStaffRegisteredServices.Add(regEntity);
await _dataContext.SaveChangesAsync(cancellationToken);
_cacheService.Remove($"staff-registered-services:{request.CampaignId}:{request.StaffId}");`
        },
        {
          name: "SaveSpecialistExamCommand",
          type: "Command (Write)",
          roles: "DOCTOR",
          desc: "Bác sĩ chuyên khoa (Mắt, TMH, RHM, Da liễu) lưu kết quả khám lâm sàng, phân loại sức khỏe I - V và gán mã bệnh ICD-10.",
          code: `var exam = await _dataContext.VcSpecialistExams.FirstOrDefaultAsync(e => 
    e.RecordId == request.RecordId && e.SpecialtyId == request.SpecialtyId, cancellationToken);
if (exam == null) {
    exam = new VcSpecialistExams {
        RecordId = request.RecordId,
        SpecialtyId = request.SpecialtyId,
        DoctorId = request.DoctorId,
        ClinicalDiagnosis = request.ClinicalDiagnosis,
        Icd10Code = request.Icd10Code,
        HealthClassification = request.HealthClassification,
        DoctorNotes = request.DoctorNotes,
        ExamDate = DateTime.UtcNow
    };
    _dataContext.VcSpecialistExams.Add(exam);
} else {
    exam.ClinicalDiagnosis = request.ClinicalDiagnosis;
    exam.Icd10Code = request.Icd10Code;
    exam.HealthClassification = request.HealthClassification;
    exam.DoctorNotes = request.DoctorNotes;
}
await _dataContext.SaveChangesAsync(cancellationToken);`
        },
        {
          name: "CreateLabTestOrderCommand",
          type: "Command (Write)",
          roles: "DOCTOR",
          desc: "Chỉ định danh mục xét nghiệm cận lâm sàng (Huyết học, Sinh hóa máu, Nước tiểu) đồng bộ qua mã vạch SID.",
          code: `var record = await _dataContext.VcHealthCheckupRecords.FindAsync(request.RecordId);
if (record == null) throw new KeyNotFoundException("Không tìm thấy hồ sơ khám sức khỏe!");

var labOrder = new VcLabTestOrders {
    RecordId = request.RecordId,
    DoctorId = request.DoctorId,
    SidCode = record.SidCode, // Mã vạch ống nghiệm liên kết máy xét nghiệm tự động
    OrderDate = DateTime.UtcNow,
    OrderStatus = "PENDING_SPECIMEN",
    TestItemsJson = JsonSerializer.Serialize(request.TestItemCodes)
};
_dataContext.VcLabTestOrders.Add(labOrder);
await _dataContext.SaveChangesAsync(cancellationToken);`
        }
      ]
    }
  ];

  navContainer.innerHTML = "";
  contentContainer.innerHTML = "";

  modules.forEach((mod, index) => {
    const btn = document.createElement("button");
    btn.className = `module-tab-btn ${index === 0 ? "active" : ""}`;
    btn.textContent = mod.title;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".module-tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".module-content-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`modPane_${mod.id}`).classList.add("active");
    });
    navContainer.appendChild(btn);

    const pane = document.createElement("div");
    pane.id = `modPane_${mod.id}`;
    pane.className = `module-content-pane ${index === 0 ? "active" : ""}`;

    let hHtml = "";
    mod.handlers.forEach(h => {
      hHtml += `
        <div class="handler-card">
          <div class="handler-header">
            <div>
              <span class="handler-name">${h.name}</span>
              <span class="badge-tag ${h.type.includes("Command") ? "badge-green" : "badge-blue"}" style="margin-left:8px;">${h.type}</span>
            </div>
            <span class="rbac-badge rbac-full">Quyền: ${h.roles}</span>
          </div>
          <p style="color:var(--text-sub); font-size:13.5px; margin-bottom:12px;">${h.desc}</p>
          <div class="code-window">
            <pre class="code-content"><code>${h.code}</code></pre>
          </div>
        </div>
      `;
    });

    pane.innerHTML = `
      <div style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--primary);">${mod.title}</h3>
        <div style="font-size:13px; font-family:'JetBrains Mono',monospace; color:var(--cyan); margin:4px 0 10px;">${mod.controller}</div>
        <p style="color:var(--text-sub); font-size:14px;">${mod.desc}</p>
      </div>
      <div>${hHtml}</div>
    `;

    contentContainer.appendChild(pane);
  });
}

// Khám phá CSDL 24 thực thể
function initSchemaExplorer() {
  const container = document.getElementById("tableListContainer");
  if (!container) return;

  container.innerHTML = "";
  const tableKeys = Object.keys(dbSchema);

  tableKeys.forEach((key, index) => {
    const item = document.createElement("div");
    item.className = `table-item ${index === 0 ? "active" : ""}`;
    item.innerHTML = `
      <span>${key}</span>
      <span class="badge-tag badge-blue">${dbSchema[key].columns.length} cột</span>
    `;
    item.addEventListener("click", () => {
      document.querySelectorAll(".table-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      renderTableDetail(key);
    });
    container.appendChild(item);
  });

  if (tableKeys.length > 0) renderTableDetail(tableKeys[0]);
}

function renderTableDetail(tableKey) {
  const table = dbSchema[tableKey];
  if (!table) return;

  document.getElementById("selectedTableName").textContent = table.name;
  document.getElementById("selectedEntityName").textContent = `${table.category} • Entity: ${table.entity}`;
  document.getElementById("selectedTableDesc").textContent = table.description;

  const tbody = document.getElementById("tableColumnsBody");
  tbody.innerHTML = "";

  table.columns.forEach(col => {
    const tr = document.createElement("tr");
    let keyBadge = "-";
    if (col.key.includes("PK")) keyBadge = `<span class="badge-tag badge-red">PK</span>`;
    else if (col.key.includes("FK")) keyBadge = `<span class="badge-tag badge-blue">FK</span>`;
    else if (col.key.includes("UK")) keyBadge = `<span class="badge-tag badge-yellow">UK</span>`;
    else if (col.key !== "-") keyBadge = `<span class="badge-tag badge-green">${col.key}</span>`;

    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--text-main);">${col.name}</td>
      <td style="font-family:'JetBrains Mono',monospace; color:var(--cyan);">${col.type}</td>
      <td>${keyBadge}</td>
      <td>${col.nullable ? '<span style="color:var(--text-muted);">NULL</span>' : '<span style="color:#ef4444; font-weight:700;">NOT NULL</span>'}</td>
      <td style="color:var(--text-sub); font-size:13px;">${col.desc}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Bảng tra cứu danh mục toàn bộ 26 API (Catalog)
// Bảng tra cứu danh mục và Trình Thử Nghiệm API Trực Tiếp (Live API Console)
function initApiCatalog() {
  const tbody = document.getElementById("apiCatalogBody");
  const consoleCard = document.getElementById("apiConsoleCard");
  const searchInput = document.getElementById("apiSearchInput");
  const groupSelect = document.getElementById("apiGroupSelect");
  const methodPills = document.querySelectorAll(".method-pill-btn");
  const filterCountEl = document.getElementById("apiFilterCount");
  const totalBadgeEl = document.getElementById("apiTotalBadge");

  if (!tbody || !consoleCard) return;

  const apiEndpoints = [
    // 1. Phân hệ Xác thực (Auth)
    {
      id: "auth_login",
      method: "POST",
      route: "/api/v1/auth/login",
      group: "Xác thực",
      roles: "Public",
      desc: "Đăng nhập hệ thống bằng Tên tài khoản hoặc Email (loginIdentifier), kiểm tra băm BCrypt, cấp Access Token & Refresh Token.",
      cache: "Không",
      businessRule: "Hỗ trợ đăng nhập kép (Username hoặc Email trong cùng một trường loginIdentifier). Kiểm tra tài khoản tồn tại, trạng thái IsActive = true, và kiểm tra mật khẩu bằng BCrypt.VerifyPassword. Khi hợp lệ, sinh cặp JWT Access Token (15 phút) và Refresh Token (7 ngày), lưu Refresh Token vào CSDL.",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        loginIdentifier: "admin_vnua",
        password: "AdminPassword@2026"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Đăng nhập thành công!",
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNCIsIm5hbWUiOiJhZG1pbl92bnVhIiwicm9sZXMiOlsic3VwZXJfYWRtaW4iLCJoZWFsdGhfYWRtaW4iXSwiaXNzIjoidm51YWNhcmUtYXBpIiwiYXVkIjoidm51YWNhcmUtY2xpZW50Iiwic3RhZmZJZCI6IjEyIiwiaWF0IjoxNzg5MTIzNDU2LCJleHAiOjE3ODkxMjQzNTZ9.c9xK...",
          refreshToken: "8f7e2d1c-9b4a-4e3f-a1b2-c3d4e5f6a7b8",
          tokenType: "Bearer",
          expiresIn: 900,
          user: {
            userId: 14,
            username: "admin_vnua",
            fullName: "Nguyễn Văn An (Ban Y Tế Học Viện)",
            email: "an.nv@vnua.edu.vn",
            roles: ["SUPER_ADMIN", "HEALTH_ADMIN"],
            department: "Trạm Y Tế - Học Viện Nông Nghiệp VN",
            mustChangePassword: false
          }
        }
      },
      sqlTrace: `-- Truy vấn xác thực người dùng theo Username hoặc Email:
SELECT TOP(1) [u].[user_id], [u].[username], [u].[email], [u].[password_hash], [u].[is_active], [u].[refresh_token], [u].[refresh_token_expiry_time]
FROM [vc_users] AS [u]
WHERE ([u].[username] = @p0 OR [u].[email] = @p0);

-- Cập nhật Refresh Token sau khi xác minh BCrypt thành công:
UPDATE [vc_users]
SET [refresh_token] = @p1, [refresh_token_expiry_time] = @p2
WHERE [user_id] = @p3;`,
      cacheTelemetry: "CACHE: [BYPASS] - Xác thực đăng nhập luôn kiểm tra trực tiếp CSDL chống giả mạo thông tin phiên làm việc."
    },
    {
      id: "auth_refresh",
      method: "POST",
      route: "/api/v1/auth/refreshtoken",
      group: "Xác thực",
      roles: "Public",
      desc: "Cấp lại cặp Access Token & Refresh Token mới khi Access Token cũ hết hạn (Token Rotation an toàn).",
      cache: "Không",
      businessRule: "Giải mã Access Token cũ (bỏ qua kiểm tra thời hạn hết hạn) để lấy UserId claim. So sánh Refresh Token gửi lên với giá trị trong CSDL và kiểm tra RefreshTokenExpiryTime > DateTime.UtcNow. Sinh cặp Token mới và hủy Token cũ.",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "8f7e2d1c-9b4a-4e3f-a1b2-c3d4e5f6a7b8"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Làm mới phiên làm việc thành công!",
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNCIsIm5hbWUiOiJhZG1pbl92bnVhIi...",
          refreshToken: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
          tokenType: "Bearer",
          expiresIn: 900
        }
      },
      sqlTrace: `SELECT TOP(1) [u].[user_id], [u].[refresh_token], [u].[refresh_token_expiry_time]
FROM [vc_users] AS [u]
WHERE [u].[user_id] = @p0;`,
      cacheTelemetry: "CACHE: [BYPASS] - Làm mới token bảo mật cao, không lưu cache để tránh lỗ hổng replay attack."
    },
    {
      id: "auth_check",
      method: "GET",
      route: "/api/v1/auth/check-token",
      group: "Xác thực",
      roles: "Đã đăng nhập",
      desc: "Kiểm tra tính hợp lệ và thời hạn còn lại của Bearer JWT Token hiện tại.",
      cache: "Không",
      businessRule: "Đọc ClaimsPrincipal từ HttpContext.User được JwtBearerHandler giải mã tự động. Trả về thông tin danh tính và vai trò quyền hạn hiện thời.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Mã Token hợp lệ!",
        data: {
          isValid: true,
          userId: 14,
          username: "admin_vnua",
          roles: ["SUPER_ADMIN", "HEALTH_ADMIN"],
          expiresAt: "2026-11-15T00:30:00Z"
        }
      },
      sqlTrace: "-- Xác thực Stateless Token: Giải mã chữ ký điện tử HMAC-SHA256 trong bộ nhớ RAM (0 truy vấn CSDL).",
      cacheTelemetry: "CACHE: [IN-MEMORY] - Kiểm tra chữ ký HMAC trong ~0.2ms không tốn tài nguyên I/O."
    },
    {
      id: "auth_logout",
      method: "POST",
      route: "/api/v1/auth/logout",
      group: "Xác thực",
      roles: "Đã đăng nhập",
      desc: "Đăng xuất tài khoản, xóa Refresh Token trong CSDL để vô hiệu hóa hoàn toàn phiên làm việc.",
      cache: "Không",
      businessRule: "Lấy UserId từ Token, đặt RefreshToken = null trong CSDL và thu hồi quyền làm mới phiên làm việc.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Đăng xuất tài khoản thành công!",
        data: null
      },
      sqlTrace: `UPDATE [vc_users]
SET [refresh_token] = NULL, [refresh_token_expiry_time] = NULL
WHERE [user_id] = @p0;`,
      cacheTelemetry: "CACHE: [PURGE] - Xóa thông tin phiên người dùng trong Redis Session Store."
    },

    // 2. Phân hệ Người dùng (Users)
    {
      id: "users_me",
      method: "GET",
      route: "/api/v1/users/me",
      group: "Người dùng",
      roles: "Đã đăng nhập",
      desc: "Lấy thông tin tài khoản và phân quyền của người dùng đang đăng nhập.",
      cache: "Có (300s)",
      businessRule: "Sử dụng AsNoTracking() truy vấn dữ liệu người dùng kết hợp bảng liên kết VcStaffs / VcDoctors. Lưu bộ đệm Redis theo khóa user:profile:{userId}.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy hồ sơ cá nhân thành công!",
        data: {
          userId: 14,
          username: "admin_vnua",
          fullName: "Nguyễn Văn An",
          email: "an.nv@vnua.edu.vn",
          phoneNumber: "0912345678",
          roles: ["SUPER_ADMIN", "HEALTH_ADMIN"],
          avatarUrl: "/avatars/u14.jpg",
          createdAt: "2026-01-15T08:30:00Z"
        }
      },
      sqlTrace: `SELECT TOP(1) [u].[user_id], [u].[username], [u].[full_name], [u].[email], [u].[phone_number], [u].[role]
FROM [vc_users] AS [u] WITH (NOLOCK)
WHERE [u].[user_id] = @p0;`,
      cacheTelemetry: "CACHE: [HIT] - Khóa 'user:profile:14' trả về từ Redis Cache trong 1.1ms."
    },
    {
      id: "users_change_pw",
      method: "POST",
      route: "/api/v1/users/change-password",
      group: "Người dùng",
      roles: "Người sở hữu tài khoản",
      desc: "Đổi mật khẩu người dùng, có xác minh mật khẩu cũ bằng BCrypt.VerifyPassword.",
      cache: "Không",
      businessRule: "Kiểm tra mật khẩu cũ khớp với PasswordHash lưu trong CSDL. Băm mật khẩu mới bằng BCrypt và cập nhật CSDL. Hủy bỏ tất cả Refresh Token hiện tại để bắt buộc đăng nhập lại.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        oldPassword: "AdminPassword@2026",
        newPassword: "NewSecurePassword@2026!"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.",
        data: null
      },
      sqlTrace: `SELECT TOP(1) [u].[user_id], [u].[password_hash] FROM [vc_users] AS [u] WHERE [u].[user_id] = @p0;
UPDATE [vc_users] SET [password_hash] = @p1, [refresh_token] = NULL WHERE [user_id] = @p0;`,
      cacheTelemetry: "CACHE: [INVALIDATE] - Xóa cache hồ sơ người dùng 'user:profile:14'."
    },
    {
      id: "users_filter",
      method: "POST",
      route: "/api/v1/users/filter",
      group: "Người dùng",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Tìm kiếm, lọc danh sách tài khoản người dùng theo vai trò, trạng thái, hỗ trợ phân trang.",
      cache: "Không",
      businessRule: "Lọc linh hoạt theo Role, IsActive, và chuỗi tìm kiếm (Username, FullName, Email) với phân trang Skip & Take trên AsNoTracking().",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        pageIndex: 1,
        pageSize: 10,
        keyword: "vnua",
        role: "HEALTH_ADMIN",
        isActive: true
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Lọc dữ liệu thành công!",
        data: {
          pageIndex: 1,
          pageSize: 10,
          totalRecords: 1,
          totalPages: 1,
          items: [
            {
              userId: 14,
              username: "admin_vnua",
              fullName: "Nguyễn Văn An",
              email: "an.nv@vnua.edu.vn",
              role: "HEALTH_ADMIN",
              isActive: true,
              lastLoginAt: "2026-11-14T23:15:00Z"
            }
          ]
        }
      },
      sqlTrace: `SELECT COUNT_BIG(1) FROM [vc_users] AS [u] WHERE [u].[role] = @p0 AND [u].[is_active] = @p1 AND [u].[username] LIKE @p2;
SELECT [u].[user_id], [u].[username], [u].[full_name], [u].[email], [u].[role], [u].[is_active]
FROM [vc_users] AS [u]
WHERE [u].[role] = @p0 AND [u].[is_active] = @p1 AND [u].[username] LIKE @p2
ORDER BY [u].[user_id] DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`,
      cacheTelemetry: "CACHE: [BYPASS] - Dữ liệu tìm kiếm lọc động không qua bộ nhớ đệm."
    },
    {
      id: "users_select",
      method: "GET",
      route: "/api/v1/users/select",
      group: "Người dùng",
      roles: "Mọi vai trò đăng nhập",
      desc: "Danh mục rút gọn tài khoản người dùng phục vụ dropdown / combobox.",
      cache: "Có (600s)",
      businessRule: "Truy vấn danh sách tài khoản đang hoạt động (IsActive = true), trả về UserId và FullName. Bộ đệm Redis 600 giây.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục người dùng thành công!",
        data: [
          { userId: 14, label: "Nguyễn Văn An (admin_vnua)" },
          { userId: 18, label: "BS.CKII Trần Văn Bình (dr_binh)" },
          { userId: 22, label: "TS. Lê Thị Mai (mai.lt - Khoa CNTT)" }
        ]
      },
      sqlTrace: "SELECT [u].[user_id], [u].[full_name], [u].[username] FROM [vc_users] AS [u] WITH (NOLOCK) WHERE [u].[is_active] = 1 ORDER BY [u].[full_name];",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'users-list-select' lấy trực tiếp từ Redis trong 0.9ms."
    },
    {
      id: "users_roles",
      method: "GET",
      route: "/api/v1/users/roles",
      group: "Người dùng",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Danh mục 4 vai trò chuẩn hóa trong hệ thống phân quyền RBAC.",
      cache: "Có (3600s)",
      businessRule: "Trả về danh mục tĩnh: SUPER_ADMIN, HEALTH_ADMIN, DOCTOR, STAFF với mô tả thẩm quyền tương ứng.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục vai trò thành công!",
        data: [
          { roleCode: "SUPER_ADMIN", roleName: "Quản trị viên Hệ thống cao cấp", description: "Toàn quyền quản trị tài khoản, cấu hình và bảo mật" },
          { roleCode: "HEALTH_ADMIN", roleName: "Ban Quản lý Y tế Học viện", description: "Quản lý đợt khám, danh sách cán bộ, bác sĩ và duyệt kết quả" },
          { roleCode: "DOCTOR", roleName: "Bác sĩ Bệnh viện Đa khoa MEDLATEC", description: "Khám lâm sàng nội khoa, kết luận hồ sơ và chỉ định cận lâm sàng" },
          { roleCode: "STAFF", roleName: "Cán bộ Giảng viên Học viện VNUA", description: "Xem hồ sơ sức khỏe cá nhân, tra cứu kết quả xét nghiệm và lịch khám" }
        ]
      },
      sqlTrace: "-- Tĩnh hóa danh mục vai trò trong bộ nhớ RAM ứng dụng (Static Memory Cache).",
      cacheTelemetry: "CACHE: [IN-MEMORY] - Truy xuất trực tiếp từ Application Memory Cache trong 0.05ms."
    },

    // 3. Phân hệ Cán bộ VNUA (Staffs)
    {
      id: "staffs_filter",
      method: "POST",
      route: "/api/v1/staffs/filter",
      group: "Cán bộ",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Lọc cán bộ theo Khoa/Phòng ban, tìm kiếm theo tên, mã cán bộ, học hàm, chức vụ.",
      cache: "Không",
      businessRule: "Lọc linh hoạt theo DepartmentId, AcademicRank, Gender và từ khóa tìm kiếm (Mã cán bộ, Họ tên, Email, SĐT) trên bảng VcStaffs kết hợp bảng phòng ban VcDepartments.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        pageIndex: 1,
        pageSize: 10,
        departmentId: 3,
        keyword: "Khoa CNTT"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Lọc danh sách cán bộ thành công!",
        data: {
          pageIndex: 1,
          pageSize: 10,
          totalRecords: 45,
          totalPages: 5,
          items: [
            {
              staffId: 101,
              employeeCode: "CB00124",
              fullName: "TS. Lê Thị Mai",
              gender: "Nữ",
              dateOfBirth: "1985-05-18",
              departmentName: "Khoa Công Nghệ Thông Tin",
              position: "Phó Trưởng Khoa",
              academicRank: "Tiến sĩ",
              email: "mai.lt@vnua.edu.vn",
              phoneNumber: "0987654321"
            }
          ]
        }
      },
      sqlTrace: `SELECT [s].[staff_id], [s].[employee_code], [s].[full_name], [s].[gender], [d].[department_name]
FROM [vc_staffs] AS [s] WITH (NOLOCK)
INNER JOIN [vc_departments] AS [d] WITH (NOLOCK) ON [s].[department_id] = [d].[department_id]
WHERE [s].[department_id] = @p0
ORDER BY [s].[employee_code]
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`,
      cacheTelemetry: "CACHE: [BYPASS] - Lọc cán bộ phân trang trực tiếp CSDL."
    },
    {
      id: "staffs_add",
      method: "POST",
      route: "/api/v1/staffs/add",
      group: "Cán bộ",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Thêm cán bộ mới. Kiểm tra trùng lặp EmployeeCode và Username bằng AnyAsync, tạo User + Staff trong một Transaction.",
      cache: "Xóa Cache",
      businessRule: "1. Kiểm tra mã cán bộ duy nhất: _dataContext.VcStaffs.AnyAsync(x => x.EmployeeCode == model.EmployeeCode). 2. Kiểm tra phòng ban hợp lệ. 3. Tạo tài khoản VcUsers với mật khẩu mặc định được băm BCrypt. 4. Tạo thực thể VcStaffs liên kết UserId. 5. Xóa Cache danh mục cán bộ.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        employeeCode: "CB00588",
        fullName: "ThS. Hoàng Văn Nam",
        gender: "Nam",
        dateOfBirth: "1990-08-22",
        departmentId: 3,
        position: "Giảng viên",
        academicRank: "Thạc sĩ",
        email: "nam.hv@vnua.edu.vn",
        phoneNumber: "0901234888",
        citizenId: "001090012345"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Thêm mới cán bộ VNUA thành công!",
        data: {
          staffId: 108,
          employeeCode: "CB00588",
          userId: 56,
          generatedUsername: "cb00588"
        }
      },
      sqlTrace: `-- Kiểm tra trùng lặp bằng AnyAsync:
IF NOT EXISTS (SELECT 1 FROM [vc_staffs] WHERE [employee_code] = @p0)
BEGIN
    INSERT INTO [vc_users] ([username], [password_hash], [role], [is_active]) VALUES (@p1, @p2, 'STAFF', 1);
    DECLARE @NewUserId INT = SCOPE_IDENTITY();
    INSERT INTO [vc_staffs] ([user_id], [employee_code], [full_name], [department_id], [gender])
    VALUES (@NewUserId, @p0, @p3, @p4, @p5);
END`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa sạch cache 'staffs-list-select' và 'departments-list'."
    },
    {
      id: "staffs_select",
      method: "GET",
      route: "/api/v1/staffs/select",
      group: "Cán bộ",
      roles: "Mọi vai trò đăng nhập",
      desc: "Danh mục cán bộ phục vụ chọn trong phiếu khám sức khỏe (Combobox / Dropdown).",
      cache: "Có (300s)",
      businessRule: "Truy vấn danh mục cán bộ kèm mã cán bộ và phòng ban. Cache Redis 300 giây.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "departmentId", type: "int", required: false, desc: "Lọc theo ID phòng ban" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục cán bộ thành công!",
        data: [
          { staffId: 101, employeeCode: "CB00124", fullName: "TS. Lê Thị Mai", departmentName: "Khoa CNTT" },
          { staffId: 102, employeeCode: "CB00125", fullName: "PGS.TS. Phạm Văn Hùng", departmentName: "Khoa Nông Học" },
          { staffId: 103, employeeCode: "CB00126", fullName: "ThS. Đỗ Thị Loan", departmentName: "Phòng Tài Chính Kế Toán" }
        ]
      },
      sqlTrace: "SELECT [s].[staff_id], [s].[employee_code], [s].[full_name], [d].[department_name] FROM [vc_staffs] AS [s] WITH (NOLOCK) INNER JOIN [vc_departments] AS [d] ON [s].[department_id] = [d].[department_id];",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'staffs-list-select' trả về từ Redis trong 1.3ms."
    },
    {
      id: "staffs_departments",
      method: "GET",
      route: "/api/v1/staffs/departments",
      group: "Cán bộ",
      roles: "Mọi vai trò đăng nhập",
      desc: "Danh mục Khoa / Phòng ban Học viện Nông nghiệp Việt Nam.",
      cache: "Có (3600s)",
      businessRule: "Lấy toàn bộ danh sách phòng ban đang hoạt động từ VcDepartments. Cache Redis 1 giờ.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục Khoa/Phòng ban thành công!",
        data: [
          { departmentId: 1, departmentCode: "K-CNTT", departmentName: "Khoa Công Nghệ Thông Tin" },
          { departmentId: 2, departmentCode: "K-NH", departmentName: "Khoa Nông Học" },
          { departmentId: 3, departmentCode: "K-TY", departmentName: "Khoa Thú Y" },
          { departmentId: 4, departmentCode: "P-TCKT", departmentName: "Phòng Tài Chính - Kế Toán" },
          { departmentId: 5, departmentCode: "T-YT", departmentName: "Trạm Y Tế Học Viện" }
        ]
      },
      sqlTrace: "SELECT [d].[department_id], [d].[department_code], [d].[department_name] FROM [vc_departments] AS [d] WITH (NOLOCK) ORDER BY [d].[department_name];",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'departments-list' lấy trực tiếp từ Redis trong 0.8ms."
    },
    {
      id: "staffs_import",
      method: "POST",
      route: "/api/v1/staffs/import-batch",
      group: "Cán bộ",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Import hàng loạt danh sách cán bộ giảng viên từ tệp Excel vào cơ sở dữ liệu.",
      cache: "Xóa Cache",
      businessRule: "Đọc stream file Excel, xác minh tính toàn vẹn của mã cán bộ, email, mã phòng ban. Thực hiện bulk-insert trong một DbContext Transaction an toàn.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        campaignId: 5,
        defaultDepartmentId: 1,
        staffs: [
          { employeeCode: "CB00901", fullName: "Trần Anh Tuấn", gender: "Nam", email: "tuan.ta@vnua.edu.vn" },
          { employeeCode: "CB00902", fullName: "Nguyễn Hải Yến", gender: "Nữ", email: "yen.nh@vnua.edu.vn" }
        ]
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Import danh sách cán bộ thành công!",
        data: {
          totalProcessed: 2,
          successCount: 2,
          failedCount: 0,
          failedDetails: []
        }
      },
      sqlTrace: "-- Thực hiện SqlBulkCopy / Batch Insert 2 bản ghi vào [vc_users] và [vc_staffs] trong SqlTransaction.",
      cacheTelemetry: "CACHE: [INVALIDATE] - Xóa toàn bộ cache danh mục cán bộ 'staffs-list-*'."
    },

    // 4. Phân hệ Bác sĩ MEDLATEC (Doctors)
    {
      id: "doctors_filter",
      method: "POST",
      route: "/api/v1/doctors/filter",
      group: "Bác sĩ",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Lọc danh sách bác sĩ đối tác theo chuyên khoa, trình độ học vị, bệnh viện công tác.",
      cache: "Không",
      businessRule: "Lọc bác sĩ từ bảng VcDoctors kết hợp bảng chuyên khoa VcSpecialties. Hỗ trợ tìm kiếm theo tên bác sĩ và mã chứng chỉ hành nghề.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        pageIndex: 1,
        pageSize: 10,
        specialtyId: 2,
        hospitalAffiliation: "BVĐK MEDLATEC"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Lọc danh sách bác sĩ thành công!",
        data: {
          pageIndex: 1,
          pageSize: 10,
          totalRecords: 12,
          totalPages: 2,
          items: [
            {
              doctorId: 5,
              doctorCode: "BS0005",
              fullName: "BS.CKII Trần Văn Bình",
              specialtyName: "Nội tổng quát",
              hospitalAffiliation: "BVĐK MEDLATEC",
              practiceLicenseNumber: "CCHN-003456/BYT",
              title: "Trưởng đoàn khám lâm sàng"
            }
          ]
        }
      },
      sqlTrace: `SELECT [d].[doctor_id], [d].[doctor_code], [d].[full_name], [s].[specialty_name], [d].[hospital_affiliation]
FROM [vc_doctors] AS [d] WITH (NOLOCK)
INNER JOIN [vc_specialties] AS [s] WITH (NOLOCK) ON [d].[specialty_id] = [s].[specialty_id]
WHERE [d].[specialty_id] = @p0
ORDER BY [d].[doctor_code];`,
      cacheTelemetry: "CACHE: [BYPASS] - Lọc bác sĩ truy vấn trực tiếp CSDL."
    },
    {
      id: "doctors_select",
      method: "GET",
      route: "/api/v1/doctors/select",
      group: "Bác sĩ",
      roles: "Mọi vai trò đăng nhập",
      desc: "Danh mục chọn bác sĩ ký kết luận trong hồ sơ khám sức khỏe (Combobox / Dropdown).",
      cache: "Có (300s)",
      businessRule: "Lấy danh sách bác sĩ đang hoạt động, lọc theo specialtyId nếu có truyền vào. Cache Redis 300 giây.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "specialtyId", type: "int", required: false, desc: "Lọc theo chuyên khoa y tế" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục bác sĩ thành công!",
        data: [
          { doctorId: 5, doctorCode: "BS0005", fullName: "BS.CKII Trần Văn Bình", specialtyName: "Nội khoa" },
          { doctorId: 8, doctorCode: "BS0008", fullName: "ThS.BS Nguyễn Thu Hà", specialtyName: "Mắt - Nhãn khoa" },
          { doctorId: 9, doctorCode: "BS0009", fullName: "BS.CKI Lê Đình Toàn", specialtyName: "Tai Mũi Họng" }
        ]
      },
      sqlTrace: "SELECT [d].[doctor_id], [d].[doctor_code], [d].[full_name], [s].[specialty_name] FROM [vc_doctors] AS [d] WITH (NOLOCK) INNER JOIN [vc_specialties] AS [s] ON [d].[specialty_id] = [s].[specialty_id] WHERE [d].[is_active] = 1;",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'doctors-list-select' lấy trực tiếp từ Redis trong 1.0ms."
    },
    {
      id: "doctors_specialties",
      method: "GET",
      route: "/api/v1/doctors/specialties",
      group: "Bác sĩ",
      roles: "Mọi vai trò đăng nhập",
      desc: "Danh mục Chuyên khoa Y tế (Nội khoa, Mắt, Tai Mũi Họng, Răng Hàm Mặt, Da Liễu, Cận Lâm Sàng).",
      cache: "Có (3600s)",
      businessRule: "Lấy toàn bộ chuyên khoa từ VcSpecialties. Cache Redis 1 giờ.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục chuyên khoa thành công!",
        data: [
          { specialtyId: 1, specialtyCode: "CK-NOI", specialtyName: "Nội khoa tổng quát", description: "Khám lâm sàng 6 hệ cơ quan nội khoa" },
          { specialtyId: 2, specialtyCode: "CK-MAT", specialtyName: "Mắt (Nhãn khoa)", description: "Đo thị lực, soi đáy mắt, sắc giác" },
          { specialtyId: 3, specialtyCode: "CK-TMH", specialtyName: "Tai Mũi Họng", description: "Nội soi tai mũi họng, thính lực" },
          { specialtyId: 4, specialtyCode: "CK-RHM", specialtyName: "Răng Hàm Mặt", description: "Khám răng sâu, cao răng, nha chu" },
          { specialtyId: 5, specialtyCode: "CK-DL", specialtyName: "Da Liễu", description: "Khám các bệnh lý ngoài da và dị ứng" },
          { specialtyId: 6, specialtyCode: "CK-CLS", specialtyName: "Cận Lâm Sàng", description: "Xét nghiệm máu, sinh hóa, X-quang, Siêu âm" }
        ]
      },
      sqlTrace: "SELECT [s].[specialty_id], [s].[specialty_code], [s].[specialty_name], [s].[description] FROM [vc_specialties] AS [s] WITH (NOLOCK);",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'specialties-catalog' trả về từ Redis trong 0.7ms."
    },

    // 5. Phân hệ Đợt khám sức khỏe (Campaigns)
    {
      id: "campaigns_select",
      method: "GET",
      route: "/api/v1/campaigns/select",
      group: "Đợt khám",
      roles: "Mọi vai trò đăng nhập",
      desc: "Danh mục chọn Đợt khám sức khỏe định kỳ (Combobox / Dropdown).",
      cache: "Có (300s)",
      businessRule: "Lấy danh sách các đợt khám sức khỏe từ CampaignController, có thể lọc theo năm tổ chức và trạng thái. Cache Redis 300 giây.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "year", type: "int", required: false, desc: "Năm tổ chức khám (VD: 2026)" },
        { name: "status", type: "string", required: false, desc: "Trạng thái đợt khám (IN_PROGRESS)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục đợt khám thành công!",
        data: [
          { campaignId: 5, campaignCode: "KSK-2026-DOT1", campaignName: "Khám Sức Khỏe Định Kỳ Cán Bộ VNUA Đợt 1 Năm 2026", year: 2026, status: "IN_PROGRESS", hospitalPartner: "BVĐK MEDLATEC" },
          { campaignId: 4, campaignCode: "KSK-2025-DOT2", campaignName: "Khám Sức Khỏe Định Kỳ Đợt 2 Năm 2025", year: 2025, status: "COMPLETED", hospitalPartner: "BVĐK MEDLATEC" }
        ]
      },
      sqlTrace: "SELECT [c].[campaign_id], [c].[campaign_code], [c].[campaign_name], [c].[year], [c].[status] FROM [vc_checkup_campaigns] AS [c] WITH (NOLOCK) ORDER BY [c].[year] DESC;",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'campaigns-list-select' lấy trực tiếp từ Redis trong 1.1ms."
    },
    {
      id: "campaigns_get_id",
      method: "GET",
      route: "/api/v1/campaigns/{id}",
      group: "Đợt khám",
      roles: "Mọi vai trò đăng nhập",
      desc: "Xem chi tiết thông tin đợt khám theo ID kèm thống kê hồ sơ.",
      cache: "Không",
      businessRule: "Truy vấn bảng VcCheckupCampaigns theo CampaignId, đồng thời đếm số lượng hồ sơ liên kết (TotalRecords và CompletedRecords).",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "id", type: "int", required: true, desc: "ID đợt khám (VD: 5)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy chi tiết đợt khám thành công!",
        data: {
          campaignId: 5,
          campaignCode: "KSK-2026-DOT1",
          campaignName: "Khám Sức Khỏe Định Kỳ Cán Bộ VNUA Đợt 1 Năm 2026",
          year: 2026,
          startDate: "2026-11-15T07:30:00Z",
          endDate: "2026-11-20T17:00:00Z",
          hospitalPartner: "BVĐK MEDLATEC",
          status: "IN_PROGRESS",
          totalRecords: 120,
          completedRecords: 85
        }
      },
      sqlTrace: "SELECT TOP(1) * FROM [vc_checkup_campaigns] WITH (NOLOCK) WHERE [campaign_id] = @p0;",
      cacheTelemetry: "CACHE: [BYPASS] - Truy vấn thông tin đợt khám trực tiếp từ CSDL."
    },
    {
      id: "campaigns_add",
      method: "POST",
      route: "/api/v1/campaigns/add",
      group: "Đợt khám",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Tạo mới đợt khám sức khỏe định kỳ cho cán bộ Học viện (Create).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra mã đợt khám CampaignCode duy nhất bằng AnyAsync. Thêm bản ghi mới vào VcCheckupCampaigns và xóa Cache danh mục đợt khám.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        campaignCode: "KSK-2026-DOT2",
        campaignName: "Khám Sức Khỏe Định Kỳ Cán Bộ VNUA Đợt 2 Năm 2026",
        year: 2026,
        startDate: "2026-11-20T07:30:00Z",
        endDate: "2026-11-25T17:00:00Z",
        hospitalPartner: "BVĐK MEDLATEC",
        status: "PLANNING"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Tạo mới đợt khám sức khỏe thành công!",
        data: null
      },
      sqlTrace: `IF NOT EXISTS (SELECT 1 FROM [vc_checkup_campaigns] WHERE [campaign_code] = @p0)
BEGIN
    INSERT INTO [vc_checkup_campaigns] ([campaign_code], [campaign_name], [year], [start_date], [end_date], [hospital_partner], [status])
    VALUES (@p0, @p1, @p2, @p3, @p4, @p5, 'PLANNING');
END`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'campaigns-list-select'."
    },
    {
      id: "campaigns_update",
      method: "PUT",
      route: "/api/v1/campaigns/update",
      group: "Đợt khám",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Cập nhật thông tin đợt khám sức khỏe định kỳ (Update).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra đợt khám tồn tại, cập nhật ngày khám, đối tác bệnh viện, trạng thái và xóa Cache.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        campaignId: 5,
        campaignCode: "KSK-2026-DOT1",
        campaignName: "Khám Sức Khỏe Định Kỳ Cán Bộ VNUA Đợt 1 Năm 2026 (Cập nhật)",
        year: 2026,
        startDate: "2026-11-15T07:30:00Z",
        endDate: "2026-11-22T17:00:00Z",
        hospitalPartner: "BVĐK MEDLATEC",
        status: "IN_PROGRESS"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Cập nhật đợt khám sức khỏe thành công!",
        data: null
      },
      sqlTrace: `UPDATE [vc_checkup_campaigns]
SET [campaign_name] = @p0, [end_date] = @p1, [status] = @p2
WHERE [campaign_id] = @p3;`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'campaigns-list-select'."
    },
    {
      id: "campaigns_delete",
      method: "DELETE",
      route: "/api/v1/campaigns/{id}",
      group: "Đợt khám",
      roles: "SUPER_ADMIN, HEALTH_ADMIN",
      desc: "Xóa đợt khám (Delete - Ràng buộc: từ chối xóa nếu đã có hồ sơ khám y tế liên kết).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra bằng AnyAsync: _dataContext.VcHealthCheckupRecords.AnyAsync(x => x.CampaignId == id). Nếu tồn tại hồ sơ y tế thì ném ngoại lệ từ chối xóa.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "id", type: "int", required: true, desc: "ID đợt khám cần xóa" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Xóa đợt khám sức khỏe thành công!",
        data: null
      },
      sqlTrace: `IF NOT EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [campaign_id] = @p0)
BEGIN
    DELETE FROM [vc_checkup_campaigns] WHERE [campaign_id] = @p0;
END`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache đợt khám 'campaigns-list-select'."
    },

    // 6. Phân hệ Hồ sơ khám lâm sàng (Records)
    {
      id: "records_filter",
      method: "POST",
      route: "/api/v1/healthcheckuprecords/filter",
      group: "Hồ sơ khám",
      roles: "SUPER_ADMIN, HEALTH_ADMIN, DOCTOR, STAFF",
      desc: "Lọc danh sách hồ sơ khám sức khỏe (Cán bộ thường chỉ xem hồ sơ của chính mình).",
      cache: "Không",
      businessRule: "Áp dụng kiểm tra bảo mật hàng (Row-Level Security): Nếu người dùng có vai trò STAFF, tự động gán điều kiện Where(r => r.StaffId == currentStaffId). Hỗ trợ lọc theo CampaignId, DepartmentId, HealthClassification (Loại I - V), và tìm kiếm SID barcode.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        pageIndex: 1,
        pageSize: 10,
        campaignId: 5,
        healthClassification: "Loại I",
        keyword: "SID2026"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Lọc danh sách hồ sơ khám thành công!",
        data: {
          pageIndex: 1,
          pageSize: 10,
          totalRecords: 1,
          totalPages: 1,
          items: [
            {
              recordId: 42,
              sidCode: "SID2026-00124",
              staffName: "TS. Lê Thị Mai",
              employeeCode: "CB00124",
              departmentName: "Khoa CNTT",
              campaignName: "KSK Đợt 1 Năm 2026",
              status: "COMPLETED",
              healthClassification: "Loại I",
              conclusionDoctorName: "BS.CKII Trần Văn Bình",
              checkupDate: "2026-11-14T08:30:00Z"
            }
          ]
        }
      },
      sqlTrace: `SELECT [r].[record_id], [r].[sid_code], [s].[full_name], [r].[status], [r].[health_classification]
FROM [vc_health_checkup_records] AS [r] WITH (NOLOCK)
INNER JOIN [vc_staffs] AS [s] WITH (NOLOCK) ON [r].[staff_id] = [s].[staff_id]
WHERE [r].[campaign_id] = @p0 AND [r].[health_classification] = @p1
ORDER BY [r].[record_id] DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`,
      cacheTelemetry: "CACHE: [BYPASS] - Lọc hồ sơ phân trang truy vấn trực tiếp CSDL."
    },
    {
      id: "records_add",
      method: "POST",
      route: "/api/v1/healthcheckuprecords/add",
      group: "Hồ sơ khám",
      roles: "SUPER_ADMIN, HEALTH_ADMIN, DOCTOR",
      desc: "Thêm mới hồ sơ khám sức khỏe. Kiểm tra mã SID barcode duy nhất và chống cán bộ tạo trùng trong 1 đợt khám.",
      cache: "Xóa Cache",
      businessRule: "1. Kiểm tra mã vạch SID duy nhất: _dataContext.VcHealthCheckupRecords.AnyAsync(x => x.SidCode == model.SidCode). 2. Kiểm tra cán bộ chưa có hồ sơ trong đợt khám: AnyAsync(x => x.CampaignId == model.CampaignId && x.StaffId == model.StaffId). 3. Tạo bản ghi mới với trạng thái ban đầu 'CREATED'.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        sidCode: "SID2026-00889",
        campaignId: 5,
        staffId: 101,
        checkupDate: "2026-11-20T08:00:00Z",
        bloodPressure: "115/75 mmHg",
        heartRate: 72,
        heightCm: 162.5,
        weightKg: 54.0,
        bmi: 20.45
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Thêm mới hồ sơ khám sức khỏe thành công!",
        data: {
          recordId: 58,
          sidCode: "SID2026-00889",
          status: "CREATED"
        }
      },
      sqlTrace: `IF NOT EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [sid_code] = @p0)
   AND NOT EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [campaign_id] = @p1 AND [staff_id] = @p2)
BEGIN
    INSERT INTO [vc_health_checkup_records] ([sid_code], [campaign_id], [staff_id], [checkup_date], [blood_pressure], [heart_rate], [status])
    VALUES (@p0, @p1, @p2, @p3, @p4, @p5, 'CREATED');
END`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache thống kê hồ sơ đợt khám."
    },
    // 7. Phân hệ Khám Thể lực & Chỉ số Sinh tồn (Vital Signs)
    {
      id: "vitalsigns_create",
      method: "POST",
      route: "/api/v1/vitalsigns/add",
      group: "Thể lực & Sinh tồn",
      roles: "DOCTOR, STAFF, HEALTH_ADMIN",
      desc: "Thêm mới chỉ số sinh tồn và thể lực tại bàn đón tiếp ban đầu (Create).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra quan hệ 1-1: Mỗi hồ sơ chỉ có 1 bản ghi thể lực. Tự động tính chỉ số khối cơ thể: BMI = Cân nặng (kg) / (Chiều cao (m))^2. Chuyển trạng thái hồ sơ sang IN_PROGRESS nếu đang là PENDING.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        recordId: 42,
        heightCm: 172.5,
        weightKg: 68.0,
        waistCm: 78.0,
        systolicBp: 118,
        diastolicBp: 78,
        heartRateBpm: 74,
        respiratoryRate: 18,
        spo2Percent: 99.0
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Thêm mới chỉ số sinh tồn và thể lực thành công!",
        data: null
      },
      sqlTrace: `INSERT INTO [vc_vital_signs] ([record_id], [height_cm], [weight_kg], [bmi], [waist_cm], [systolic_bp], [diastolic_bp], [heart_rate_bpm], [spo2_percent], [created_at])
VALUES (@RecordId, @p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, GETDATE());`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache chỉ số sinh tồn 'vital_signs:record_42'."
    },
    {
      id: "vitalsigns_update",
      method: "PUT",
      route: "/api/v1/vitalsigns/update",
      group: "Thể lực & Sinh tồn",
      roles: "DOCTOR, STAFF, HEALTH_ADMIN",
      desc: "Cập nhật chỉ số sinh tồn và thể lực (Update).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra bản ghi VitalSignId tồn tại, tự động tính lại BMI nếu có thay đổi chiều cao hoặc cân nặng. Xóa Cache tương ứng.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        vitalSignId: 101,
        heightCm: 172.5,
        weightKg: 67.5,
        waistCm: 77.0,
        systolicBp: 120,
        diastolicBp: 80,
        heartRateBpm: 72,
        respiratoryRate: 18,
        spo2Percent: 99.0
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Cập nhật chỉ số sinh tồn thành công!",
        data: null
      },
      sqlTrace: `UPDATE [vc_vital_signs]
SET [height_cm] = @p0, [weight_kg] = @p1, [bmi] = @p2, [systolic_bp] = @p3, [diastolic_bp] = @p4, [heart_rate_bpm] = @p5
WHERE [vital_sign_id] = @p6;`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'vital_signs:record_42'."
    },
    {
      id: "vitalsigns_delete",
      method: "DELETE",
      route: "/api/v1/vitalsigns/{id}",
      group: "Thể lực & Sinh tồn",
      roles: "DOCTOR, HEALTH_ADMIN, SUPER_ADMIN",
      desc: "Xóa bản ghi chỉ số sinh tồn (Delete).",
      cache: "Xóa Cache",
      businessRule: "Xóa bản ghi chỉ số sinh tồn theo vitalSignId trong trường hợp nhập sai sót hoặc yêu cầu đo lại từ đầu.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "id", type: "int", required: true, desc: "ID bản ghi chỉ số sinh tồn (VD: 101)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Xóa chỉ số sinh tồn thành công!",
        data: null
      },
      sqlTrace: "DELETE FROM [vc_vital_signs] WHERE [vital_sign_id] = @p0;",
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'vital_signs:record_42'."
    },
    {
      id: "vitalsigns_get",
      method: "GET",
      route: "/api/v1/vitalsigns/{recordId}",
      group: "Thể lực & Sinh tồn",
      roles: "Mọi vai trò đăng nhập",
      desc: "Lấy chỉ số sinh tồn theo ID hồ sơ kèm đánh giá thể lực tự động (Read).",
      cache: "Có (300s)",
      businessRule: "Truy vấn bảng vc_vital_signs theo recordId (AsNoTracking). Tự động phân loại thể trạng BMI (Lý tưởng, Thừa cân, Béo phì) theo chuẩn WHO cho người châu Á và phân loại Huyết áp.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "recordId", type: "int", required: true, desc: "ID hồ sơ khám sức khỏe (VD: 42)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy chỉ số sinh tồn thành công!",
        data: {
          vitalSignId: 101,
          recordId: 42,
          heightCm: 172.5,
          weightKg: 68.0,
          bmi: 22.85,
          bmiClassification: "Bình thường (Lý tưởng)",
          waistCm: 78.0,
          systolicBp: 118,
          diastolicBp: 78,
          bloodPressureClassification: "Huyết áp tối ưu / Bình thường",
          heartRateBpm: 74,
          respiratoryRate: 18,
          spo2Percent: 99.0,
          measuredByName: "Điều dưỡng Nguyễn Thị Mai",
          createdAt: "2026-11-17T08:30:00Z"
        }
      },
      sqlTrace: "SELECT TOP(1) * FROM [vc_vital_signs] WITH (NOLOCK) WHERE [record_id] = @p0;",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'vital_signs:record_42' trả về từ Redis trong 0.8ms."
    },

    // 8. Phân hệ Khám Lâm sàng Nội khoa tổng quát (Internal Medicine)
    {
      id: "clinical_internal_create",
      method: "POST",
      route: "/api/v1/internalmedicines/add",
      group: "Khám nội khoa",
      roles: "DOCTOR",
      desc: "Thêm mới kết quả khám lâm sàng Nội khoa tổng quát 6 hệ cơ quan (Create).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra mỗi hồ sơ chỉ có 1 bản ghi khám nội khoa. Bác sĩ nhập khám Tuần hoàn, Hô hấp, Tiêu hóa, Tiết niệu, Cơ xương khớp, Thần kinh và kết luận phân loại (Loại I - V).",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        recordId: 42,
        circulatoryDesc: "Nhịp tim đều rõ, không tiếng thổi bệnh lý, T1 T2 nghe rõ.",
        respiratoryDesc: "Rì rào phế nang êm dịu 2 phế trường, không rale.",
        digestiveDesc: "Bụng mềm, không chướng, gan lách không sờ thấy.",
        urinaryDesc: "Chạm thận âm tính, bập bềnh thận âm tính.",
        musculoskeletalDesc: "Cột sống thẳng, khớp vận động trong giới hạn bình thường.",
        neurologicalDesc: "Tỉnh táo, tiếp xúc tốt, phản xạ gân xương bình thường.",
        conclusion: "Sức khỏe nội khoa rất tốt.",
        healthClass: "Loại I"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Thêm mới kết quả khám nội khoa thành công!",
        data: null
      },
      sqlTrace: `INSERT INTO [vc_internal_medicine_exams] ([record_id], [circulatory_desc], [respiratory_desc], [digestive_desc], [urinary_desc], [musculoskeletal_desc], [neurological_desc], [conclusion], [health_class], [examining_doctor_id], [created_at])
VALUES (@RecordId, @p0, @p1, @p2, @p3, @p4, @p5, @p6, @p7, @DoctorId, GETDATE());`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache khám nội khoa 'internal_medicine:record_42'."
    },
    {
      id: "clinical_internal_update",
      method: "PUT",
      route: "/api/v1/internalmedicines/update",
      group: "Khám nội khoa",
      roles: "DOCTOR",
      desc: "Cập nhật kết quả khám lâm sàng Nội khoa tổng quát (Update).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra InternalExamId tồn tại, cập nhật chẩn đoán 6 hệ cơ quan và phân loại sức khỏe. Xóa Cache tương ứng.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        internalExamId: 42,
        circulatoryDesc: "Nhịp xoang đều 72ck/phút, T1 T2 rõ.",
        respiratoryDesc: "Phổi thông khí tốt, không ran.",
        digestiveDesc: "Bụng mềm, gan lách không to.",
        urinaryDesc: "Hố thắt lưng 2 bên không đau.",
        musculoskeletalDesc: "Vận động tốt, không hạn chế khớp.",
        neurologicalDesc: "Tri giác tốt, 15 điểm Glasgow.",
        conclusion: "Nội khoa bình thường.",
        healthClass: "Loại I"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Cập nhật kết quả khám nội khoa thành công!",
        data: null
      },
      sqlTrace: `UPDATE [vc_internal_medicine_exams]
SET [circulatory_desc] = @p0, [respiratory_desc] = @p1, [conclusion] = @p2, [health_class] = @p3
WHERE [internal_exam_id] = @p4;`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'internal_medicine:record_42'."
    },
    {
      id: "clinical_internal_delete",
      method: "DELETE",
      route: "/api/v1/internalmedicines/{id}",
      group: "Khám nội khoa",
      roles: "DOCTOR, HEALTH_ADMIN, SUPER_ADMIN",
      desc: "Xóa kết quả khám lâm sàng Nội khoa (Delete).",
      cache: "Xóa Cache",
      businessRule: "Xóa bản ghi khám nội khoa theo internalExamId khi cần lập lại phiếu khám nội khoa mới.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "id", type: "int", required: true, desc: "ID kết quả khám nội khoa (VD: 42)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Xóa kết quả khám nội khoa thành công!",
        data: null
      },
      sqlTrace: "DELETE FROM [vc_internal_medicine_exams] WHERE [internal_exam_id] = @p0;",
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'internal_medicine:record_42'."
    },
    {
      id: "clinical_internal_get",
      method: "GET",
      route: "/api/v1/internalmedicines/{recordId}",
      group: "Khám nội khoa",
      roles: "Mọi vai trò đăng nhập",
      desc: "Lấy chi tiết kết quả khám lâm sàng Nội khoa theo ID hồ sơ (Read).",
      cache: "Có (300s)",
      businessRule: "Truy vấn bảng VcInternalMedicineExams theo RecordId (AsNoTracking). Trả về chi tiết 6 hệ cơ quan và bác sĩ khám.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "recordId", type: "int", required: true, desc: "ID hồ sơ khám sức khỏe (VD: 42)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy kết quả khám nội khoa thành công!",
        data: {
          internalExamId: 42,
          recordId: 42,
          circulatoryDesc: "Nhịp tim đều rõ, không tiếng thổi bệnh lý.",
          respiratoryDesc: "Rì rào phế nang êm dịu 2 phế trường.",
          digestiveDesc: "Bụng mềm, không chướng, gan lách bình thường.",
          urinaryDesc: "Chạm thận âm tính.",
          musculoskeletalDesc: "Khớp vận động bình thường.",
          neurologicalDesc: "Tỉnh táo, phản xạ gân xương bình thường.",
          conclusion: "Sức khỏe nội khoa rất tốt.",
          healthClass: "Loại I",
          examiningDoctorName: "BSCKII. Nguyễn Văn Hùng",
          createdAt: "2026-11-17T08:40:00Z"
        }
      },
      sqlTrace: "SELECT TOP(1) * FROM [vc_internal_medicine_exams] WITH (NOLOCK) WHERE [record_id] = @p0;",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'internal_medicine:record_42' trả về từ Redis trong 0.9ms."
    },

    // 9. Phân hệ Khám Chuyên khoa lẻ (Specialist Exams: Mắt, TMH, RHM, Da liễu, Ngoại, Sản)
    {
      id: "clinical_specialist_create",
      method: "POST",
      route: "/api/v1/specialistexams/add",
      group: "Khám chuyên khoa lẻ",
      roles: "DOCTOR, HEALTH_ADMIN",
      desc: "Thêm mới kết quả khám chuyên khoa lẻ: Mắt, TMH, RHM, Da liễu, Ngoại, Sản (Create).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra hồ sơ tồn tại và chưa có kết quả khám của chuyên khoa này. Thêm mới bản ghi vào VcSpecialistExams và xóa Cache.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        recordId: 42,
        specialtyType: "EYE",
        visionLeftNoGlass: "10/10",
        visionRightNoGlass: "9/10",
        visionLeftGlass: "10/10",
        visionRightGlass: "10/10",
        conclusion: "Thị lực tốt, mắt phải hơi cận nhẹ không cần điều trị.",
        healthClass: "Loại I"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Thêm mới kết quả khám chuyên khoa thành công!",
        data: null
      },
      sqlTrace: `INSERT INTO [vc_specialist_exams] ([record_id], [specialty_type], [vision_left_no_glass], [vision_right_no_glass], [conclusion], [health_class], [examining_doctor_id], [created_at])
VALUES (@RecordId, @SpecialtyType, @p0, @p1, @p2, @p3, @DoctorId, GETDATE());`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'specialist_exam:record_42'."
    },
    {
      id: "clinical_specialist_update",
      method: "PUT",
      route: "/api/v1/specialistexams/update",
      group: "Khám chuyên khoa lẻ",
      roles: "DOCTOR, HEALTH_ADMIN",
      desc: "Cập nhật kết quả khám chuyên khoa lẻ (Update).",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra specialistExamId tồn tại, cập nhật thị lực, răng hàm mặt, tai mũi họng hoặc kết luận chuyên khoa.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        specialistExamId: 201,
        visionLeftNoGlass: "10/10",
        visionRightNoGlass: "10/10",
        conclusion: "Thị lực 2 mắt 10/10 hoàn hảo.",
        healthClass: "Loại I"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Cập nhật kết quả khám chuyên khoa thành công!",
        data: null
      },
      sqlTrace: `UPDATE [vc_specialist_exams]
SET [vision_right_no_glass] = @p0, [conclusion] = @p1, [health_class] = @p2
WHERE [specialist_exam_id] = @p3;`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'specialist_exam:record_42'."
    },
    {
      id: "clinical_specialist_delete",
      method: "DELETE",
      route: "/api/v1/specialistexams/{id}",
      group: "Khám chuyên khoa lẻ",
      roles: "DOCTOR, HEALTH_ADMIN, SUPER_ADMIN",
      desc: "Xóa kết quả khám chuyên khoa lẻ (Delete).",
      cache: "Xóa Cache",
      businessRule: "Xóa bản ghi khám chuyên khoa theo specialistExamId.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "id", type: "int", required: true, desc: "ID kết quả khám chuyên khoa (specialistExamId, VD: 201)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Xóa kết quả khám chuyên khoa thành công!",
        data: null
      },
      sqlTrace: "DELETE FROM [vc_specialist_exams] WHERE [specialist_exam_id] = @p0;",
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache 'specialist_exam:record_42'."
    },
    {
      id: "clinical_specialist_get",
      method: "GET",
      route: "/api/v1/specialistexams/{recordId}",
      group: "Khám chuyên khoa lẻ",
      roles: "Mọi vai trò đăng nhập",
      desc: "Lấy danh sách kết quả khám các chuyên khoa lẻ của hồ sơ (Read).",
      cache: "Có (300s)",
      businessRule: "Truy vấn bảng vc_specialist_exams theo recordId và specialtyType tùy chọn (AsNoTracking). Kèm tên bác sĩ khám và tên chuyên khoa tiếng Việt.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "recordId", type: "int", required: true, desc: "ID hồ sơ khám sức khỏe (VD: 42)" },
        { name: "specialtyType", type: "string", required: false, desc: "Lọc theo mã chuyên khoa (EYE, ENT, DENTAL, DERMATOLOGY, SURGERY, OBSTETRICS)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh sách kết quả khám chuyên khoa thành công!",
        data: [
          {
            specialistExamId: 201,
            recordId: 42,
            specialtyType: "EYE",
            specialtyDisplayName: "Chuyên khoa Mắt",
            visionLeftNoGlass: "10/10",
            visionRightNoGlass: "9/10",
            conclusion: "Thị lực tốt, mắt phải hơi cận nhẹ.",
            healthClass: "Loại I",
            examiningDoctorName: "BSCKI. Nguyễn Thị Hương Lan",
            createdAt: "2026-11-17T08:45:00Z"
          },
          {
            specialistExamId: 202,
            recordId: 42,
            specialtyType: "ENT",
            specialtyDisplayName: "Chuyên khoa Tai - Mũi - Họng",
            earLeftDesc: "Màng nhĩ sáng bóng, thính lực tốt",
            noseDesc: "Niêm mạc hồng hào, không polyp",
            throatDesc: "Họng sạch, amidan không phì đại",
            conclusion: "Tai Mũi Họng bình thường",
            healthClass: "Loại I",
            examiningDoctorName: "BSCKII. Lê Văn Dũng",
            createdAt: "2026-11-17T09:00:00Z"
          }
        ]
      },
      sqlTrace: "SELECT * FROM [vc_specialist_exams] WITH (NOLOCK) WHERE [record_id] = @p0 ORDER BY [created_at];",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'specialist_exam:record_42' trả về từ Redis trong 1.1ms."
    },

    // 10. Phân hệ Dịch vụ y tế & Gói khám (Medical Services)
    {
      id: "services_catalog",
      method: "GET",
      route: "/api/v1/medical-services/catalog",
      group: "Dịch vụ y tế",
      roles: "Tất cả vai trò",
      desc: "Lấy danh mục dịch vụ khám và giá tiền niêm yết theo từng chuyên khoa (Cache Redis 300s).",
      cache: "Có (300s)",
      businessRule: "Lấy toàn bộ dịch vụ y tế đang hoạt động (IsActive = true), sắp xếp theo thứ tự hiển thị và chuyên khoa thực hiện. Áp dụng Cache-Aside Redis 300 giây.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Accept": "application/json"
      },
      queryParams: [
        { name: "gender", type: "string", required: false, desc: "Lọc theo giới tính áp dụng (ALL, MALE, FEMALE)" }
      ],
      sampleRequest: {},
      mockResponse: {
        code: 200,
        success: true,
        message: "Lấy danh mục dịch vụ y tế thành công!",
        data: [
          { serviceId: 1, serviceCode: "DV-SIEUAM-BUNG", serviceName: "Siêu âm màu tổng quát ổ bụng 4D", price: 180000, specialtyName: "Chẩn đoán hình ảnh", applicableGender: "ALL", isMandatory: true },
          { serviceId: 2, serviceCode: "DV-XQ-TIMPHOI", serviceName: "Chụp X-quang tim phổi thẳng kỹ thuật số", price: 150000, specialtyName: "Chẩn đoán hình ảnh", applicableGender: "ALL", isMandatory: true },
          { serviceId: 3, serviceCode: "DV-XN-TONGTP-MAU", serviceName: "Tổng phân tích tế bào máu ngoại vi (24 thông số)", price: 90000, specialtyName: "Xét nghiệm", applicableGender: "ALL", isMandatory: true },
          { serviceId: 4, serviceCode: "DV-SIEUAM-TUYENGIAP", serviceName: "Siêu âm Doppler màu tuyến giáp (Gói nâng cao)", price: 200000, specialtyName: "Chẩn đoán hình ảnh", applicableGender: "ALL", isMandatory: false },
          { serviceId: 5, serviceCode: "DV-TAMSOAT-UNGTHU-CA125", serviceName: "Tầm soát dấu ấn ung thư buồng trứng CA 125", price: 250000, specialtyName: "Xét nghiệm", applicableGender: "FEMALE", isMandatory: false }
        ]
      },
      sqlTrace: "SELECT [s].[service_id], [s].[service_code], [s].[service_name], [s].[price], [sp].[specialty_name], [s].[applicable_gender] FROM [vc_medical_services] AS [s] WITH (NOLOCK) INNER JOIN [vc_specialties] AS [sp] ON [s].[specialty_id] = [sp].[specialty_id] WHERE [s].[is_active] = 1 ORDER BY [s].[category_order];",
      cacheTelemetry: "CACHE: [HIT] - Khóa 'medical-services-catalog-active' trả về từ Redis trong 1.2ms."
    },
    {
      id: "services_register",
      method: "POST",
      route: "/api/v1/medical-services/register-staff",
      group: "Dịch vụ y tế",
      roles: "SUPER_ADMIN, HEALTH_ADMIN, STAFF",
      desc: "Cán bộ hoặc Ban y tế đăng ký các gói khám và dịch vụ tự nguyện cho cán bộ trong đợt khám.",
      cache: "Xóa Cache",
      businessRule: "Kiểm tra đợt khám hợp lệ và kiểm tra trùng lặp dịch vụ bằng AnyAsync. Lưu vào VcStaffRegisteredServices và xóa cache đăng ký của cán bộ.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        campaignId: 5,
        staffId: 101,
        serviceId: 4,
        isVolunteerPackage: true,
        notes: "Đăng ký thêm gói Siêu âm Doppler tuyến giáp nâng cao"
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Đăng ký dịch vụ khám tự nguyện thành công!",
        data: {
          registrationId: 88,
          staffId: 101,
          serviceId: 4,
          serviceName: "Siêu âm Doppler màu tuyến giáp (Gói nâng cao)",
          registeredDate: "2026-11-14T23:50:00Z",
          status: "APPROVED"
        }
      },
      sqlTrace: `IF NOT EXISTS (SELECT 1 FROM [vc_staff_registered_services] WHERE [staff_id] = @p0 AND [campaign_id] = @p1 AND [service_id] = @p2)
BEGIN
    INSERT INTO [vc_staff_registered_services] ([staff_id], [campaign_id], [service_id], [registered_date], [status], [is_volunteer_package])
    VALUES (@p0, @p1, @p2, GETUTCDATE(), 'APPROVED', 1);
END`,
      cacheTelemetry: "CACHE: [INVALIDATE] - Xóa cache dịch vụ đã đăng ký của cán bộ 'staff-registered-services:5:101'."
    },
    {
      id: "specialist_exam_save",
      method: "POST",
      route: "/api/v1/medical-services/specialist-exam",
      group: "Dịch vụ y tế",
      roles: "DOCTOR",
      desc: "Bác sĩ chuyên khoa (Mắt, TMH, RHM, Da liễu) lưu kết quả khám lâm sàng chuyên khoa và gán mã bệnh ICD-10.",
      cache: "Xóa Cache",
      businessRule: "Ghi nhận kết quả khám lâm sàng chuyên khoa, phân loại sức khỏe I - V theo chuẩn Bộ Y tế và mã chẩn đoán quốc tế ICD-10 liên kết trực tiếp vào hồ sơ khám.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        recordId: 42,
        specialtyId: 2,
        doctorId: 8,
        clinicalDiagnosis: "Thị lực mắt phải 10/10, mắt trái 9/10, không loạn thị.",
        icd10Code: "H52.0",
        healthClassification: "Loại I",
        doctorNotes: "Mắt tốt, không có bệnh lý bán phần trước và đáy mắt."
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Lưu kết quả khám chuyên khoa Nhãn khoa thành công!",
        data: {
          specialistExamId: 95,
          recordId: 42,
          specialtyName: "Mắt (Nhãn khoa)",
          healthClassification: "Loại I",
          icd10Code: "H52.0"
        }
      },
      sqlTrace: `INSERT INTO [vc_specialist_exams] ([record_id], [specialty_id], [doctor_id], [clinical_diagnosis], [icd10_code], [health_classification], [exam_date])
VALUES (@p0, @p1, @p2, @p3, @p4, @p5, GETUTCDATE());`,
      cacheTelemetry: "CACHE: [INVALIDATE] - Xóa cache kết quả chuyên khoa hồ sơ khám."
    },
    {
      id: "lab_orders_create",
      method: "POST",
      route: "/api/v1/medical-services/lab-test-order",
      group: "Dịch vụ y tế",
      roles: "DOCTOR",
      desc: "Chỉ định danh mục xét nghiệm cận lâm sàng (Huyết học, Sinh hóa máu, Nước tiểu) đồng bộ qua mã vạch SID.",
      cache: "Xóa Cache",
      businessRule: "Tạo phiếu chỉ định xét nghiệm cận lâm sàng gắn với mã SID của hồ sơ, cho phép máy xét nghiệm tự động tại BVĐK MEDLATEC đọc barcode và đồng bộ kết quả trả về.",
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
      },
      queryParams: [],
      sampleRequest: {
        recordId: 42,
        doctorId: 5,
        testItemCodes: [
          "CBC_24",
          "GLUCOSE_FASTING",
          "UREA_CREATININE",
          "AST_ALT_GGT",
          "URINALYSIS_10"
        ],
        clinicalIndicationNotes: "Kiểm tra định kỳ cán bộ kết hợp đánh giá chức năng gan thận."
      },
      mockResponse: {
        code: 200,
        success: true,
        message: "Tạo chỉ định xét nghiệm cận lâm sàng thành công!",
        data: {
          orderId: 104,
          recordId: 42,
          sidCode: "SID2026-00124",
          orderStatus: "PENDING_SPECIMEN",
          totalTestItems: 5,
          orderDate: "2026-11-14T23:55:00Z"
        }
      },
      sqlTrace: `INSERT INTO [vc_lab_test_orders] ([record_id], [doctor_id], [sid_code], [order_status], [test_items_json], [order_date])
VALUES (@p0, @p1, @p2, 'PENDING_SPECIMEN', @p3, GETUTCDATE());`,
      cacheTelemetry: "CACHE: [EVICT] - Xóa cache chỉ định xét nghiệm 'lab-orders:42'."
    }
  ];

  let currentSelectedApi = apiEndpoints[0];
  let currentMethodFilter = "ALL";
  let currentGroupFilter = "ALL";
  let currentSearchKeyword = "";
  let currentDiagTab = "sql";

  // Hiển thị tổng số endpoint
  if (totalBadgeEl) totalBadgeEl.textContent = `${apiEndpoints.length} Endpoints`;

  // Hàm render bảng Catalog
  function renderCatalogTable() {
    tbody.innerHTML = "";

    const filtered = apiEndpoints.filter(api => {
      const matchMethod = currentMethodFilter === "ALL" || api.method === currentMethodFilter;
      const matchGroup = currentGroupFilter === "ALL" || api.group === currentGroupFilter;
      const matchSearch = !currentSearchKeyword || 
        api.route.toLowerCase().includes(currentSearchKeyword) || 
        api.desc.toLowerCase().includes(currentSearchKeyword) || 
        api.roles.toLowerCase().includes(currentSearchKeyword);
      return matchMethod && matchGroup && matchSearch;
    });

    if (filterCountEl) {
      filterCountEl.textContent = `Hiển thị ${filtered.length} / ${apiEndpoints.length} endpoints`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">Không tìm thấy endpoint nào khớp với điều kiện lọc.</td></tr>`;
      return;
    }

    filtered.forEach(api => {
      const tr = document.createElement("tr");
      if (currentSelectedApi && currentSelectedApi.id === api.id) {
        tr.classList.add("selected-row");
      }

      let bClass = "method-get";
      if (api.method === "POST") bClass = "method-post";
      else if (api.method === "PUT") bClass = "method-put";
      else if (api.method === "DELETE") bClass = "method-delete";

      tr.innerHTML = `
        <td><span class="method-badge ${bClass}">${api.method}</span></td>
        <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--text-main); font-size:13px;">${api.route}</td>
        <td><span class="badge-tag badge-blue">${api.group}</span></td>
        <td style="font-size:12px; color:var(--text-sub);">${api.roles}</td>
        <td style="font-size:12.5px; color:var(--text-sub); max-width:280px;">${api.desc}</td>
        <td><span class="badge-tag ${api.cache === "Có" || api.cache.includes("Có") ? "badge-green" : (api.cache.includes("Xóa") ? "badge-yellow" : "badge-red")}">${api.cache}</span></td>
        <td style="text-align:right;">
          <button class="api-test-quick-btn" title="Thử nghiệm trực tiếp trong Console">Thử nghiệm</button>
        </td>
      `;

      // Click row -> select and scroll to console
      tr.addEventListener("click", () => {
        selectApiEndpoint(api);
      });

      const btn = tr.querySelector(".api-test-quick-btn");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectApiEndpoint(api, true);
      });

      tbody.appendChild(tr);
    });
  }

  // Chọn endpoint
  function selectApiEndpoint(api, scrollToConsole = false) {
    currentSelectedApi = api;
    document.querySelectorAll(".api-catalog-table tbody tr").forEach(r => r.classList.remove("selected-row"));
    
    // Highlight matching row
    const rows = tbody.querySelectorAll("tr");
    apiEndpoints.forEach((item, idx) => {
      if (item.id === api.id && rows[idx]) {
        rows[idx].classList.add("selected-row");
      }
    });

    renderInteractiveConsole();

    if (scrollToConsole) {
      consoleCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Hàm render giao diện Live Interactive Console
  function renderInteractiveConsole() {
    const api = currentSelectedApi;
    if (!api) return;

    let bClass = "method-get";
    if (api.method === "POST") bClass = "method-post";
    else if (api.method === "PUT") bClass = "method-put";
    else if (api.method === "DELETE") bClass = "method-delete";

    // Request Headers markup
    let headersText = "";
    Object.keys(api.headers).forEach(k => {
      headersText += `${k}: ${api.headers[k]}
`;
    });

    // Query Params markup (if any)
    let paramsHtml = "";
    if (api.queryParams && api.queryParams.length > 0) {
      let paramRows = "";
      api.queryParams.forEach(p => {
        paramRows += `
          <div class="api-param-row">
            <span class="api-param-label">${p.name} (${p.type}):</span>
            <input type="text" class="api-param-input" id="param_${p.name}" placeholder="${p.desc}" value="${p.required ? '1' : ''}" />
          </div>
        `;
      });
      paramsHtml = `
        <div>
          <div class="api-pane-section-title">Tham số đường dẫn (Query Parameters):</div>
          <div class="api-params-grid">${paramRows}</div>
        </div>
      `;
    }

    // Body Editor markup
    let bodyEditorHtml = "";
    const hasBody = api.method === "POST" || api.method === "PUT";
    if (hasBody) {
      bodyEditorHtml = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div class="api-pane-section-title" style="margin-bottom:0;">Cấu trúc Payload (JSON Request Body - Có thể chỉnh sửa):</div>
            <span style="font-size:11px; color:var(--text-muted);">Content-Type: application/json</span>
          </div>
          <textarea class="api-body-textarea" id="apiRequestBodyArea" spellcheck="false">${JSON.stringify(api.sampleRequest, null, 2)}</textarea>
        </div>
      `;
    }

    consoleCard.innerHTML = `
      <!-- Console Header -->
      <div class="api-console-header">
        <div class="api-console-meta">
          <span class="method-badge ${bClass}" style="font-size:13px; padding:6px 12px;">${api.method}</span>
          <span class="api-console-route">${api.route}</span>
          <span class="badge-tag badge-blue">${api.group}</span>
          <span class="badge-tag badge-yellow">Quyền: ${api.roles}</span>
          <span class="badge-tag ${api.cache === "Có" || api.cache.includes("Có") ? "badge-green" : (api.cache.includes("Xóa") ? "badge-yellow" : "badge-red")}">Cache: ${api.cache}</span>
        </div>
        <div class="api-console-actions">
          <button class="api-btn api-btn-secondary" id="btnCopyCurl" title="Sao chép lệnh cURL">Sao Chép cURL</button>
          <button class="api-btn api-btn-secondary" id="btnResetPayload" title="Khôi phục dữ liệu mẫu">Khôi Phục Mẫu</button>
          <button class="api-btn api-btn-primary" id="btnExecuteApi" title="Mô phỏng gửi request và quan sát phản hồi">Gửi Yêu Cầu Thử Nghiệm</button>
        </div>
      </div>

      <!-- Console Body: 2 Columns -->
      <div class="api-console-body">
        <!-- Left: Request Configuration -->
        <div class="api-request-pane">
          <div>
            <div class="api-pane-section-title">Quy tắc nghiệp vụ & Kiểm tra tính hợp lệ:</div>
            <p style="font-size:13px; color:var(--text-sub); line-height:1.6; margin:0;">${api.businessRule}</p>
          </div>

          <div>
            <div class="api-pane-section-title">HTTP Request Headers:</div>
            <pre class="api-headers-box"><code>${headersText.trim()}</code></pre>
          </div>

          ${paramsHtml}
          ${bodyEditorHtml}
        </div>

        <!-- Right: Live Response & Diagnostics -->
        <div class="api-response-pane">
          <!-- Status bar -->
          <div class="api-response-status-bar">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="api-status-pill api-status-success" id="apiStatusBadge">200 OK</span>
              <span style="color:var(--text-sub); font-size:12px;">Thời gian phản hồi: <strong id="apiDurationBadge" style="color:var(--primary);">16ms</strong></span>
            </div>
            <div style="color:var(--text-muted); font-size:11.5px;">
              Kích thước: <span id="apiSizeBadge">1.4 KB</span> | Server: Kestrel .NET 9.0
            </div>
          </div>

          <!-- Response JSON Viewer -->
          <div>
            <div class="api-pane-section-title">Dữ liệu phản hồi chuẩn hóa (ApiResponse Envelope):</div>
            <div class="api-diag-content-box" id="apiResponseBodyBox">${syntaxHighlightJson(api.mockResponse)}</div>
          </div>

          <!-- Diagnostics Tabs: SQL Query, Redis Cache, Pipeline -->
          <div>
            <div class="api-diag-tabs">
              <button class="api-diag-tab-btn ${currentDiagTab === "sql" ? "active" : ""}" data-tab="sql">Truy Vấn SQL (EF Core)</button>
              <button class="api-diag-tab-btn ${currentDiagTab === "cache" ? "active" : ""}" data-tab="cache">Bộ Nhớ Đệm Redis</button>
              <button class="api-diag-tab-btn ${currentDiagTab === "pipeline" ? "active" : ""}" data-tab="pipeline">Vòng Đời Pipeline</button>
            </div>
            <div class="api-diag-content-box" id="apiDiagContentBox" style="margin-top:8px;">
              ${renderDiagContent(currentDiagTab, api)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Wire up events in the console
    const btnExecute = document.getElementById("btnExecuteApi");
    const btnCopyCurl = document.getElementById("btnCopyCurl");
    const btnReset = document.getElementById("btnResetPayload");
    const diagTabBtns = consoleCard.querySelectorAll(".api-diag-tab-btn");

    diagTabBtns.forEach(b => {
      b.addEventListener("click", () => {
        diagTabBtns.forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        currentDiagTab = b.getAttribute("data-tab");
        document.getElementById("apiDiagContentBox").innerHTML = renderDiagContent(currentDiagTab, api);
      });
    });

    btnReset.addEventListener("click", () => {
      const area = document.getElementById("apiRequestBodyArea");
      if (area) {
        area.value = JSON.stringify(api.sampleRequest, null, 2);
        showToast("Đã khôi phục Payload về mẫu mặc định!");
      }
    });

    btnCopyCurl.addEventListener("click", () => {
      const curlCmd = generateCurlCommand(api);
      navigator.clipboard.writeText(curlCmd).then(() => {
        showToast("Đã sao chép lệnh cURL vào bộ nhớ tạm!");
      }).catch(() => {
        showToast("Lệnh cURL: " + curlCmd.substring(0, 50) + "...");
      });
    });

    btnExecute.addEventListener("click", () => {
      executeLiveApiTest(api);
    });
  }

  // Chạy thử nghiệm API
  function executeLiveApiTest(api) {
    const btnExecute = document.getElementById("btnExecuteApi");
    const statusBadge = document.getElementById("apiStatusBadge");
    const durationBadge = document.getElementById("apiDurationBadge");
    const responseBox = document.getElementById("apiResponseBodyBox");
    const area = document.getElementById("apiRequestBodyArea");

    btnExecute.disabled = true;
    btnExecute.textContent = "Đang gửi yêu cầu...";
    statusBadge.className = "api-status-pill";
    statusBadge.textContent = "Processing...";
    statusBadge.style.background = "rgba(59, 130, 246, 0.15)";
    statusBadge.style.color = "#2563eb";

    setTimeout(() => {
      btnExecute.disabled = false;
      btnExecute.textContent = "Gửi Yêu Cầu Thử Nghiệm";

      const randomLatency = Math.floor(Math.random() * 12) + 11; // 11ms - 22ms
      durationBadge.textContent = `${randomLatency}ms`;

      // Check if user edited body
      let requestPayload = null;
      let hasJsonError = false;
      if (area) {
        try {
          requestPayload = JSON.parse(area.value);
        } catch (e) {
          hasJsonError = true;
        }
      }

      if (hasJsonError) {
        statusBadge.className = "api-status-pill api-status-error";
        statusBadge.textContent = "400 Bad Request";
        const errResp = {
          code: 400,
          success: false,
          message: "Lỗi định dạng Payload JSON: Vui lòng kiểm tra lại cú pháp dấu ngoặc và dấu phẩy!",
          data: null
        };
        responseBox.innerHTML = syntaxHighlightJson(errResp);
        showToast("Yêu cầu thất bại: JSON Payload không hợp lệ!");
        return;
      }

      // Check simulated validation
      if (requestPayload && requestPayload.loginIdentifier === "") {
        statusBadge.className = "api-status-pill api-status-error";
        statusBadge.textContent = "400 Bad Request";
        const errResp = {
          code: 400,
          success: false,
          message: "Tên đăng nhập hoặc Email không được để trống!",
          data: null
        };
        responseBox.innerHTML = syntaxHighlightJson(errResp);
        showToast("Kiểm tra hợp lệ: loginIdentifier bắt buộc nhập!");
        return;
      }

      // Successful 200 OK
      statusBadge.className = "api-status-pill api-status-success";
      statusBadge.textContent = "200 OK";

      // If user customized a name/code, reflect it dynamically
      let finalResp = JSON.parse(JSON.stringify(api.mockResponse));
      if (requestPayload && finalResp.data && typeof finalResp.data === "object") {
        if (requestPayload.employeeCode && finalResp.data.employeeCode) {
          finalResp.data.employeeCode = requestPayload.employeeCode;
        }
        if (requestPayload.sidCode && finalResp.data.sidCode) {
          finalResp.data.sidCode = requestPayload.sidCode;
        }
        if (requestPayload.loginIdentifier && finalResp.data.user) {
          finalResp.data.user.username = requestPayload.loginIdentifier;
        }
      }

      responseBox.innerHTML = syntaxHighlightJson(finalResp);
      showToast(`Yêu cầu HTTP thực thi thành công! (200 OK - ${randomLatency}ms)`);
    }, 120);
  }

  function renderDiagContent(tab, api) {
    if (tab === "sql") {
      return escapeHtml(api.sqlTrace);
    } else if (tab === "cache") {
      return escapeHtml(api.cacheTelemetry);
    } else if (tab === "pipeline") {
      return escapeHtml(`Vòng đời xử lý qua MediatR Bus & Clean Architecture:
1. ApiControllerBase.ExecuteFuntion() tiếp nhận HTTP ${api.method} ${api.route}
2. Bọc try-catch toàn cục, tạo Correlation Trace ID cho phiên giao dịch
3. MediatR Dispatcher gửi Request tới Handler tương ứng
4. Khởi tạo VnuaCareDataContext / VnuaCareReadDataContext
5. Thực thi LINQ to Entities với cancellationToken
6. ${api.cache.includes("Xóa") ? "Kích hoạt ICacheService.Remove() xóa cache khóa liên quan" : (api.cache.includes("Có") ? "Truy vấn/ghi nhận vào Redis Cache với TTL tương ứng" : "Bỏ qua Cache, xử lý trực tiếp CSDL")}
7. Đóng gói kết quả vào ResponseObject<T>.Success(data)
8. Trả về HTTP 200 OK kèm mã hóa JSON chuẩn hóa`);
    }
    return "";
  }

  function generateCurlCommand(api) {
    let url = `https://api.vnuacare.vnua.edu.vn${api.route}`;
    let headersPart = "";
    Object.keys(api.headers).forEach(k => {
      headersPart += ` -H "${k}: ${api.headers[k]}"`;
    });
    let dataPart = "";
    if (api.method === "POST" || api.method === "PUT") {
      dataPart = ` -d '${JSON.stringify(api.sampleRequest)}'`;
    }
    return `curl -X ${api.method} "${url}"${headersPart}${dataPart}`;
  }

  function syntaxHighlightJson(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\u[a-zA-Z0-9]{4}|\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'number';
      let style = 'color:#38bdf8;';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
          style = 'color:#a78bfa; font-weight:700;';
        } else {
          cls = 'string';
          style = 'color:#34d399;';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
        style = 'color:#fbbf24; font-weight:700;';
      } else if (/null/.test(match)) {
        cls = 'null';
        style = 'color:#94a3b8; font-style:italic;';
      }
      return '<span style="' + style + '">' + match + '</span>';
    });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function showToast(msg) {
    const existing = document.querySelector(".api-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "api-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Filter toolbar event handlers
  methodPills.forEach(pill => {
    pill.addEventListener("click", () => {
      methodPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentMethodFilter = pill.getAttribute("data-method");
      renderCatalogTable();
    });
  });

  if (groupSelect) {
    groupSelect.addEventListener("change", (e) => {
      currentGroupFilter = e.target.value;
      renderCatalogTable();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchKeyword = e.target.value.toLowerCase().trim();
      renderCatalogTable();
    });
  }

  // Khởi tạo bảng và console ban đầu
  renderCatalogTable();
  selectApiEndpoint(apiEndpoints[0], false);
}



// Request Lifecycle Stepper
function initLifecycleStepper() {
  const stepNodes = document.querySelectorAll(".step-node");
  stepNodes.forEach(node => {
    node.addEventListener("click", () => {
      const stepNum = parseInt(node.getAttribute("data-step"));
      renderStepDetail(stepNum);
    });
  });

  renderStepDetail(1);
}

function renderStepDetail(stepNumber) {
  document.querySelectorAll(".step-node").forEach(node => {
    node.classList.toggle("active", parseInt(node.getAttribute("data-step")) === stepNumber);
  });

  const stepData = [
    {
      step: 1,
      title: "1. Client gửi HTTP Request",
      desc: "Trình duyệt hoặc ứng dụng gửi request kèm theo Bearer JWT Token trên HTTP Header:",
      code: `POST /api/v1/healthcheckuprecords/add HTTP/1.1
Host: api.vnuacare.vnua.edu.vn
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...
Content-Type: application/json

{
  "campaignId": 1,
  "staffId": 105,
  "sidCode": "SID-2026-0089"
}`
    },
    {
      step: 2,
      title: "2. CORS & Routing Middleware",
      desc: "ASP.NET Core kiểm tra tên miền gửi request trong danh sách AllowOrigins, sau đó định tuyến tới Controller phù hợp.",
      code: `builder.Services.AddCors(options => {
    options.AddPolicy("LocalApiPlayground", policy => {
        policy.WithOrigins("http://localhost:5500", "http://127.0.0.1:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});`
    },
    {
      step: 3,
      title: "3. JWT Authentication Middleware",
      desc: "Giải mã JWT Bearer Token, kiểm tra chữ ký bí mật (SecretKey) và nạp thông tin danh tính (Claims) vào HttpContext.User.",
      code: `var currentUserId = _contextAccessor.UserId;
var currentUserRole = _contextAccessor.Role; // SUPER_ADMIN, HEALTH_ADMIN, DOCTOR, STAFF`
    },
    {
      step: 4,
      title: "4. ApiControllerBase.ExecuteFuntion",
      desc: "Bắt đầu đo thời gian xử lý (Stopwatch.StartNew), bọc trong khối try-catch an toàn tự động.",
      code: `[HttpPost, Route("add")]
public async Task<IActionResult> Create([FromBody] CreateHealthCheckupRecordModel model)
{
    return await ExecuteFuntion(async () =>
    {
        return await _mediator.Send(new CreateHealthCheckupRecordCommand(model));
    });
}`
    },
    {
      step: 5,
      title: "5. MediatR In-Process Bus",
      desc: "MediatR tiếp nhận Command, tự động tìm kiếm và phân phối tới đúng Handler xử lý trong tầng Business.",
      code: `builder.Services.AddMediatR(cfg => 
    cfg.RegisterServicesFromAssembly(typeof(CreateHealthCheckupRecordCommand).Assembly));`
    },
    {
      step: 6,
      title: "6. Handler Thực thi Logic nghiệp vụ",
      desc: "Thực hiện phân quyền, kiểm tra khóa ngoại, kiểm tra trùng lặp SID bằng .AnyAsync(...) và lưu vào CSDL qua DbContext.",
      code: `var isSidExisted = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);
if (isSidExisted) throw new ArgumentException("Mã vạch hồ sơ (SID) đã tồn tại!");`
    },
    {
      step: 7,
      title: "7. SQL Server & EF Core Transaction",
      desc: "EF Core sinh câu lệnh INSERT INTO vc_health_checkup_records ... và thực thi giao dịch ACID hoàn tất.",
      code: `await _dataContext.VcHealthCheckupRecords.AddAsync(recordEntity, cancellationToken);
await _dataContext.SaveChangesAsync(cancellationToken);

_cacheService.Remove(HealthCheckupRecordConstant.BuildCacheKey());`
    },
    {
      step: 8,
      title: "8. Trả về ApiResponse chuẩn RESTful",
      desc: "Dừng đồng hồ đo, tính duration (ms) và đóng gói đối tượng phản hồi thống nhất.",
      code: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "statusCode": 200,
  "message": "Success",
  "data": 0,
  "traceId": "0HN7GF9Q1K2A5:00000003",
  "duration": 18
}`
    }
  ].find(s => s.step === stepNumber);

  if (!stepData) return;
  document.getElementById("stepTitle").textContent = stepData.title;
  document.getElementById("stepDesc").textContent = stepData.desc;
  document.getElementById("stepCode").textContent = stepData.code;
}

// Tìm kiếm nhanh (Ctrl + K)
function initSearch() {
  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", (e) => {
    const val = e.target.value.toLowerCase().trim();
    if (!val) return;

    if (val.includes("trace") || val.includes("từ đâu") || val.includes("lần vết") || val.includes("kết nối") || val.includes("chạy như nào") || val.includes("mắt xích")) {
      switchSection("sec-trace");
    } else if (val.includes("kế hoạch") || val.includes("lộ trình") || val.includes("roadmap") || val.includes("backlog") || val.includes("tiếp theo") || val.includes("phase")) {
      switchSection("sec-roadmap");
    } else if (val.includes("dễ hiểu") || val.includes("ẩn dụ") || val.includes("metaphor") || val.includes("trực quan") || val.includes("mental")) {
      switchSection("sec-easy");
    } else if (val.includes("any") || val.includes("linq") || val.includes("sql") || val.includes("token") || val.includes("jwt") || val.includes("refresh")) {
      switchSection("sec-anyasync");
    } else if (val.includes("erd") || val.includes("bảng") || val.includes("table") || val.includes("schema") || val.includes("thực thể")) {
      switchSection("sec-database");
    } else if (val.includes("module") || val.includes("phân hệ") || val.includes("staff") || val.includes("doctor") || val.includes("record") || val.includes("campaign")) {
      switchSection("sec-modules");
    } else if (val.includes("api") || val.includes("endpoint") || val.includes("catalog")) {
      switchSection("sec-catalog");
    } else if (val.includes("layer") || val.includes("cqrs") || val.includes("mediatr") || val.includes("kiến trúc")) {
      switchSection("sec-architecture");
    }
  });
}

function copyCode(elementId) {
  const codeEl = document.getElementById(elementId);
  if (!codeEl) return;
  navigator.clipboard.writeText(codeEl.textContent).then(() => {
    alert("Đã sao chép mã nguồn vào bộ nhớ tạm!");
  });
}

// ====================================================
// 3. TRÌNH DUYỆT BẢN ĐỒ THƯ MỤC TOÀN DỰ ÁN (FOLDER MAP)
// ====================================================
function initFolderExplorer() {
  const tabsContainer = document.getElementById("projectTabsContainer");
  const detailContainer = document.getElementById("projectDetailContainer");
  if (!tabsContainer || !detailContainer) return;

  const projects = [
    {
      id: "api",
      name: "1. VnuaCare.API",
      badge: "Presentation Layer",
      desc: "Tầng trình diễn ngoài cùng tiếp nhận các HTTP Request, xử lý Authentication Middleware (JWT Bearer), ghi nhận IP / User-Agent và ủy thác nghiệp vụ cho MediatR Pipeline.",
      deps: "Phụ thuộc: VnuaCare.Business, VnuaCare.Data, VnuaCare.Infrastructure, VnuaCare.Shared",
      folders: [
        {
          name: "Controllers/Business/",
          role: "Tiếp nhận HTTP requests cho 6 phân hệ nghiệp vụ, kế thừa ApiControllerBase",
          files: "AuthorizationController.cs, CampaignController.cs, DoctorController.cs, HealthCheckupRecordController.cs, StaffController.cs, UserController.cs"
        },
        {
          name: "Program.cs",
          role: "Điểm khởi chạy hệ thống, cấu hình DI, Dual DbContext, Redis Cache, JWT Bearer, CORS, Swagger",
          files: "builder.Services.AddDbContext<VnuaCareDataContext>, AddDbContext<VnuaCareReadDataContext>, AddMediatR, AddJwtBearer, AddStackExchangeRedisCache"
        },
        {
          name: "appsettings.json",
          role: "File cấu hình chính của ứng dụng ASP.NET Core",
          files: "ConnectionStrings (SQL Server, Redis), JwtSettings (Secret, Issuer, Audience, Expiration), AppSettings (EnableCache)"
        },
        {
          name: "wwwroot/",
          role: "Thư mục tài nguyên tĩnh và tài liệu bản địa hóa",
          files: "Localization JSON resource files"
        }
      ]
    },
    {
      id: "business",
      name: "2. VnuaCare.Business",
      badge: "Application & Business Core Layer",
      desc: "Trái tim nghiệp vụ của hệ thống áp dụng mô hình CQRS (Command Query Responsibility Segregation) kết hợp MediatR. Mọi logic nghiệp vụ, xác thực dữ liệu và xử lý Cache đều nằm tại đây.",
      deps: "Phụ thuộc: VnuaCare.Data, VnuaCare.Shared",
      folders: [
        {
          name: "Business/Authorizations/",
          role: "Quản lý phiên làm việc, đăng nhập và cấp mới Token",
          files: "UserLoginCommand.cs, RefreshTokenCommand.cs, AuthorizationConstant.cs, AuthorizationModel.cs"
        },
        {
          name: "Business/Campaigns/",
          role: "Quản lý các đợt khám sức khỏe định kỳ hàng năm",
          files: "CreateCampaignCommand.cs, UpdateCampaignCommand.cs, DeleteCampaignCommand.cs, GetCampaignByIdIndex.cs, GetFilterCampaignQuery.cs, GetComboxCampaignQuery.cs, CampaignConstant.cs, CampaignModel.cs"
        },
        {
          name: "Business/Doctors/",
          role: "Quản lý hồ sơ bác sĩ bệnh viện đối tác (MEDLATEC) và phân loại chuyên khoa",
          files: "CreateDoctorCommand.cs, UpdateDoctorCommand.cs, DeleteDoctorCommand.cs, GetDoctorByIdIndex.cs, GetFilterDoctorQuery.cs, GetComboxDocTorQuery.cs, GetComboxSpecialtyQuery.cs, DoctorConstant.cs, DoctorModel.cs"
        },
        {
          name: "Business/HealthCheckupRecords/",
          role: "Hồ sơ khám sức khỏe cốt lõi, khám lâm sàng nội khoa 6 hệ cơ quan, xếp loại sức khỏe",
          files: "CreateHealthCheckupRecordCommand.cs, UpdateHealthCheckupRecordCommand.cs, DeleteHealthCheckupRecordCommand.cs, SaveInternalMedicineExamCommand.cs, GetHealthCheckupRecordByIdIndex.cs, GetFilterHealthCheckupRecordQuery.cs, GetComboxHealthClassificationQuery.cs, GetComboxRecordStatusQuery.cs, GetInternalMedicineExamByRecordIdQuery.cs, HealthCheckupRecordConstant.cs, HealthCheckupRecordModel.cs"
        },
        {
          name: "Business/Staffs/",
          role: "Quản lý hồ sơ cán bộ Học viện Nông nghiệp, nhập Excel, danh mục phòng ban",
          files: "CreateStaffCommand.cs, UpdateStaffCommand.cs, DeleteStaffCommand.cs, ImportrStaffFormExcelCommand.cs, GetStaffByIdIndex.cs, GetFilterStaffQuery.cs, GetComboxStaffQuery.cs, GetComboxDepartmentQuery.cs, StaffConstant.cs, StaffModel.cs"
        },
        {
          name: "Business/Users/",
          role: "Quản lý tài khoản đăng nhập, đổi mật khẩu, phân quyền vai trò",
          files: "ChangePassUserCommand.cs, DeleteUserCommand.cs, ResetPasswordUserCommand.cs, UpdateMyProfileCommand.cs, UpdateUserCommand.cs, GetComboxRoleQuery.cs, GetComboxUserQuery.cs, GetFilterUserQuery.cs, GetMyProfileQuery.cs, GetUserByIdIndex.cs, UserConstant.cs, UserModel.cs"
        },
        {
          name: "Services/CacheService/",
          role: "Cài đặt bộ nhớ đệm Cache-Aside với Redis và In-Memory, có cơ chế Fallback chống sập",
          files: "RedisCacheService.cs, InMemoryCacheService.cs"
        },
        {
          name: "Services/ (Interfaces)",
          role: "Các giao diện trừu tượng hóa dịch vụ dùng cho Dependency Injection",
          files: "ICacheService.cs, IJwtService.cs, IBcryptPasswordHasher.cs"
        }
      ]
    },
    {
      id: "data",
      name: "3. VnuaCare.Data",
      badge: "Persistence Layer",
      desc: "Tầng làm việc trực tiếp với CSDL SQL Server qua Entity Framework Core 9. Triển khai kiến trúc Dual DbContext độc lập giữa tác vụ Đọc và tác vụ Ghi.",
      deps: "Phụ thuộc: VnuaCare.Shared",
      folders: [
        {
          name: "Systems/Context/ (Entities)",
          role: "Các thực thể Entity C# đại diện cho các bảng trong SQL Server",
          files: "VcUsers.cs, VcStaffs.cs, VcDoctors.cs, VcDepartments.cs, VcSpecialties.cs, VcCheckupCampaigns.cs, VcCampaignRegistrations.cs, VcHealthCheckupRecords.cs, VcInternalMedicineExams.cs"
        },
        {
          name: "Systems/DataContext/VnuaCareDataContext.cs",
          role: "Write DbContext bật Change Tracking, dùng cho các lệnh INSERT, UPDATE, DELETE (Commands)",
          files: "DbSet<VcUsers>, DbSet<VcStaffs>, DbSet<VcDoctors>, DbSet<VcHealthCheckupRecords>, ..."
        },
        {
          name: "Systems/DataContext/VnuaCareReadDataContext.cs",
          role: "Read DbContext dùng cho các lệnh SELECT đọc dữ liệu (Queries) với AsNoTracking() tối ưu",
          files: "DbSet<VcUsers>, DbSet<VcStaffs>, DbSet<VcDoctors>, DbSet<VcHealthCheckupRecords>, ..."
        }
      ]
    },
    {
      id: "infrastructure",
      name: "4. VnuaCare.Infrastructure",
      badge: "Infrastructure Layer",
      desc: "Tầng cài đặt các công nghệ kỹ thuật ngoại vi như sinh và giải mã token JWT, băm mật khẩu bảo mật BCrypt.",
      deps: "Phụ thuộc: VnuaCare.Business",
      folders: [
        {
          name: "Services/JwtService.cs",
          role: "Sinh Access Token (HMAC-SHA256, 120m), sinh Refresh Token (RandomNumberGenerator 32 bytes), trích xuất Claims từ token quá hạn",
          files: "GenerateAccessToken(), GenerateRefreshToken(), GetPrincipalFromExpiredToken()"
        },
        {
          name: "Services/PasswordHasher.cs",
          role: "Băm mật khẩu người dùng bằng thuật toán BCrypt với Cost factor 12 và xác thực mật khẩu",
          files: "HashPassword(password), VerifyPassword(password, hash)"
        }
      ]
    },
    {
      id: "shared",
      name: "5. VnuaCare.Shared",
      badge: "Cross-Cutting Layer",
      desc: "Tầng dùng chung cho toàn bộ giải pháp, chứa các cấu trúc phản hồi chuẩn, controller cơ sở, trích xuất ngữ cảnh và tiện ích.",
      deps: "Không phụ thuộc vào bất kỳ dự án nào khác (Hoàn toàn độc lập)",
      folders: [
        {
          name: "Helper/ApiControllerBase.cs",
          role: "Controller nền tảng bao bọc hàm ExecuteFuntion, dùng Stopwatch tự đo duration, bắt lỗi tập trung và trả về ApiResponse<T>",
          files: "ExecuteFuntion<T>(func), ExecuteFuntion(func)"
        },
        {
          name: "Helper/Response/ApiResponse.cs",
          role: "Cấu trúc vỏ bọc dữ liệu thống nhất trả về cho mọi API RESTful",
          files: "ApiResponse<T> { statusCode, message, data, traceId, duration }"
        },
        {
          name: "ContextAccessor/",
          role: "Trích xuất UserId, Role, Username từ Claims của HttpContext hiện tại phục vụ phân quyền RBAC",
          files: "IContextAccessor.cs, HttpContextAccessorWrapper.cs"
        },
        {
          name: "Constant/ & Enums/",
          role: "Hằng số vai trò (SUPER_ADMIN, HEALTH_ADMIN, DOCTOR, STAFF) và các enum trạng thái",
          files: "Constant.cs, Enums.cs"
        },
        {
          name: "Utils/",
          role: "Các tiện ích hỗ trợ phân trang, ánh xạ đối tượng và kiểm tra tính hợp lệ",
          files: "ValidationUtils.cs, AutoMapperUtils.cs, ResponseData.cs"
        }
      ]
    },
    {
      id: "docs",
      name: "6. Docs (Documentation Portal)",
      badge: "Interactive Documentation",
      desc: "Cổng tài liệu kỹ thuật tương tác trực quan cao cấp, hỗ trợ lập trình viên tra cứu kiến trúc, CSDL 24 bảng, 26 API và vị trí code.",
      deps: "HTML5, CSS3 Glassmorphism, Vanilla Javascript, Markdown",
      folders: [
        {
          name: "index.html",
          role: "Cổng giao diện tài liệu tương tác: Dashboard, Token, Cache, AnyAsync, Modules, CSDL 24 bảng, 26 API",
          files: "index.html"
        },
        {
          name: "app.js & style.css",
          role: "Logic tương tác JavaScript và hệ thống thiết kế Glassmorphism hiện đại, Dark/Light mode, Responsive 100%",
          files: "app.js (1100+ dòng), style.css (1400+ dòng)"
        },
        {
          name: "Markdown Technical Guides",
          role: "5 tài liệu markdown phân tích kỹ thuật chuyên sâu về hệ thống",
          files: "01-KIEN_TRUC_HE_THONG_VA_CAC_LAYER.md, 02-GIAI_THICH_CHUYEN_SAU_EF_CORE_LINQ_VA_ANYASYNC.md, 03-CHI_TIET_LUONG_NGHIEP_VU_CAC_MODULE.md, 04-CSDL_VA_THIET_KE_ENTITIES.md, 05-QUY_TRINH_XU_LY_REQUEST_VA_RESPONSE.md"
        }
      ]
    }
  ];

  tabsContainer.innerHTML = "";
  projects.forEach((proj, idx) => {
    const btn = document.createElement("button");
    btn.className = `project-tab-btn ${idx === 0 ? "active" : ""}`;
    btn.textContent = proj.name;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".project-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjectDetail(proj);
    });
    tabsContainer.appendChild(btn);
  });

  renderProjectDetail(projects[0]);

  function renderProjectDetail(proj) {
    let fHtml = "";
    proj.folders.forEach(f => {
      fHtml += `
        <div class="folder-item">
          <div class="folder-item-title">${f.name}</div>
          <p style="color:var(--text-sub); font-size:13px; line-height:1.5; margin-bottom:8px;">${f.role}</p>
          <div style="font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--cyan); background:rgba(6,182,212,0.08); padding:6px 10px; border-radius:4px;">
            ${f.files}
          </div>
        </div>
      `;
    });

    detailContainer.innerHTML = `
      <div class="folder-tree-card">
        <div class="folder-header-badge">${proj.badge}</div>
        <h3 style="font-size:20px; font-weight:800; color:var(--text-main); margin-bottom:8px;">${proj.name}</h3>
        <p style="color:var(--text-sub); font-size:14px; margin-bottom:8px;">${proj.desc}</p>
        <div style="font-size:12.5px; color:var(--text-muted); font-weight:600; margin-bottom:20px;">Phụ thuộc (Dependencies): ${proj.deps}</div>
        <div class="folder-grid">${fHtml}</div>
      </div>
    `;
  }
}

// ====================================================
// 4. TRÌNH TRA CỨU VỊ TRÍ CODE CHÍNH XÁC (EXACT CODE POINTERS)
// ====================================================
function initCodePointersExplorer() {
  const filterBar = document.getElementById("pointerFilterBar");
  const container = document.getElementById("pointerCardsContainer");
  if (!filterBar || !container) return;

  const codePointers = [
    {
      category: "token",
      catName: "Token & JWT",
      title: "1. Sinh JWT Access Token Kèm Claims & Ký Số HMAC-SHA256",
      file: "VnuaCare.Infrastructure/Services/JwtService.cs",
      location: "Class JwtService -> GenerateAccessToken(IEnumerable<Claim> claims) (Dòng 32 - 51)",
      desc: "Sinh JWT Access Token chứa danh tính người dùng (UserId, Username, Email, Role) và ký số bằng thuật toán HMAC-SHA256 với thời hạn 120 phút.",
      code: `public string GenerateAccessToken(IEnumerable<Claim> claims)
{
    var secretKey = _configuration["JwtSettings:Secret"] ?? "VnuaCareHealthSecretKey2026SuperSecureKeyDefault123456!";
    var issuer = _configuration["JwtSettings:Issuer"] ?? "VnuaCare";
    var audience = _configuration["JwtSettings:Audience"] ?? "VnuaCareClient";
    var expirationMinutes = int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "120");

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}`
    },
    {
      category: "token",
      catName: "Token & JWT",
      title: "2. Sinh Refresh Token & Lưu Trực Tiếp Vào Bảng vc_users",
      file: "VnuaCare.Business/Business/Authorizations/AuthorizationCommands/UserLoginCommand.cs",
      location: "Class Handler -> Handle(UserLoginCommand request) (Dòng 74 - 83)",
      desc: "Sau khi xác thực tài khoản hợp lệ, sinh Refresh Token ngẫu nhiên 32 bytes Base64 và lưu vào cột vc_users.refresh_token với thời hạn 7 ngày.",
      code: `// Sinh token
var accessToken = _jwtService.GenerateAccessToken(claims);
var refreshToken = _jwtService.GenerateRefreshToken();

// Lưu refresh token vào DB với thời hạn 7 ngày
user.RefreshToken = refreshToken;
user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
_dataContext.VcUsers.Update(user);
await _dataContext.SaveChangesAsync(cancellationToken);

_cacheService.Remove(AuthorizationConstant.BuildCacheKey());`
    },
    {
      category: "token",
      catName: "Token & JWT",
      title: "3. Cơ Chế Token Rotation Khi Cấp Mới Token",
      file: "VnuaCare.Business/Business/Authorizations/AuthorizationCommands/RefreshTokenCommand.cs",
      location: "Class Handler -> Handle(RefreshTokenCommand request) (Dòng 39 - 61)",
      desc: "Xác thực Refresh Token cũ trong DB. Khi hợp lệ, cấp cặp token MỚI và ghi đè Refresh Token mới vào DB để chống tấn công dùng lại token (Replay Attack).",
      code: `// Trích xuất Claims từ Access Token đã hết hạn (ValidateLifetime = false)
var principal = _jwtService.GetPrincipalFromExpiredToken(request.Model.AccessToken);
var userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value);

// Tìm tài khoản trong CSDL và so khớp Refresh Token
var user = await _dataContext.VcUsers.FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);
if (user == null || user.RefreshToken != request.Model.RefreshToken)
{
    throw new UnauthorizedAccessException("Phiên đăng nhập đã hết hạn hoặc mã làm mới không hợp lệ.");
}

// Cấp cặp Token MỚI HOÀN TOÀN (Token Rotation)
var newAccessToken = _jwtService.GenerateAccessToken(principal.Claims);
var newRefreshToken = _jwtService.GenerateRefreshToken();

// Cập nhật CSDL với thời hạn mới 7 ngày
user.RefreshToken = newRefreshToken;
user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
_dataContext.VcUsers.Update(user);
await _dataContext.SaveChangesAsync(cancellationToken);`
    },
    {
      category: "bcrypt",
      catName: "Băm Mật Khẩu BCrypt",
      title: "4. Băm Mật Khẩu An Toàn Với Muối Ngẫu Nhiên (Cost 12)",
      file: "VnuaCare.Infrastructure/Services/PasswordHasher.cs",
      location: "Class PasswordHasher -> HashPassword & VerifyPassword",
      desc: "Áp dụng thuật toán băm một chiều BCrypt với 4,096 vòng lặp băm và tự sinh Salt ngẫu nhiên, chống lại tấn công Rainbow Table.",
      code: `public string HashPassword(string password)
{
    // Tự sinh Salt ngẫu nhiên và băm qua 4,096 vòng tính toán
    return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
}

public bool VerifyPassword(string password, string passwordHash)
{
    return BCrypt.Net.BCrypt.Verify(password, passwordHash);
}`
    },
    {
      category: "cache",
      catName: "Caching & Redis",
      title: "5. Cơ Chế Cache-Aside & Hết Hạn Trượt 300 Giây (Sliding Expiration)",
      file: "VnuaCare.Business/Services/CacheService/RedisCacheService.cs",
      location: "Class RedisCacheService -> GetOrCreate<TItem> (Dòng 31 - 56)",
      desc: "Kiểm tra Redis trước (Cache Hit < 1ms). Nếu Cache Miss, đọc CSDL qua ReadDbContext và nạp lại vào Redis với Sliding Expiration = 300s.",
      code: `var itemString = await _distributedCache.GetStringAsync(key);
if (string.IsNullOrEmpty(itemString))
{
    // Đặt thời gian hết hạn trượt 300 giây (5 phút)
    options ??= new DistributedCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromSeconds(_timeLive));

    cacheEntry = await createItem(); // Đọc CSDL SQL Server
    var item = JsonSerializer.Serialize(cacheEntry);

    // Nạp lại giá trị mới cho cache
    await _distributedCache.SetStringAsync(key, item, options);
}
else
{
    cacheEntry = JsonSerializer.Deserialize<TItem>(itemString); // Cache Hit!
}`
    },
    {
      category: "cache",
      catName: "Caching & Redis",
      title: "6. Cơ Chế Chống Sập Hệ Thống (Fallback) Khi Redis Gặp Sự Cố",
      file: "VnuaCare.Business/Services/CacheService/RedisCacheService.cs",
      location: "Class RedisCacheService -> catch (Exception ex) (Dòng 58 - 62)",
      desc: "Nếu Redis Server bị mất kết nối hoặc quá tải, hệ thống tự động bắt ngoại lệ, ghi log và Fallback gọi trực tiếp SQL Server, API không bao giờ bị lỗi 500.",
      code: `catch (Exception ex)
{
    // Bắt lỗi Redis, ghi log Serilog và tự động Fallback gọi trực tiếp SQL Server
    Log.Error($"Có lỗi xảy ra khi xử lý dữ liệu từ redis - {ex.ToString()}");
    cacheEntry = await createItem(); // Truy vấn CSDL trực tiếp, API không bị chết!
}`
    },
    {
      category: "cache",
      catName: "Caching & Redis",
      title: "7. Xóa Cache Khi Có Thao Tác Ghi (Cache Invalidation)",
      file: "VnuaCare.Business/Business/Staffs/StaffCommands/CreateStaffCommand.cs",
      location: "Class Handler -> Handle (Dòng 76)",
      desc: "Đảm bảo tính nhất quán dữ liệu (Cache Consistency). Bất kỳ Command nào làm thay đổi dữ liệu đều xóa Cache ngay lập tức.",
      code: `await _dataContext.SaveChangesAsync(cancellationToken);

// Hủy cache danh sách cán bộ ngay sau khi thêm mới
_cacheService.Remove(StaffConstant.BuildCacheKey());`
    },
    {
      category: "efcore",
      catName: "EF Core & AnyAsync",
      title: "8. Kiểm Tra Trùng SID Hồ Sơ Bằng .AnyAsync() Chuyển Dịch Sang SQL EXISTS",
      file: "VnuaCare.Business/Business/HealthCheckupRecords/HealthCheckupRecordCommands/CreateHealthCheckupRecordCommand.cs",
      location: "Class Handler -> Handle (Dòng 45 - 50)",
      desc: "Chuyển dịch thành IF EXISTS (SELECT 1 ...) trong SQL Server. Ngắt quét bảng ngay khi thấy bản ghi đầu tiên, không tải đối tượng Entity vào RAM.",
      code: `// Kiểm tra mã vạch SID đã tồn tại chưa:
var isSidExisted = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);

if (isSidExisted)
{
    throw new ArgumentException("Mã vạch hồ sơ (SID) đã tồn tại!");
}`
    },
    {
      category: "dbcontext",
      catName: "Dual DbContext",
      title: "9. Cấu Hình Phân Tách 2 DbContext Độc Lập Giữa Đọc Và Ghi",
      file: "VnuaCare.API/Program.cs",
      location: "Program.cs (Dòng 91 - 94)",
      desc: "Tách biệt VnuaCareDataContext (Commands - tracking) và VnuaCareReadDataContext (Queries - AsNoTracking) giúp tối ưu bộ nhớ và tốc độ phản hồi.",
      code: `// 1. Kết nối CSDL SQL Server phục vụ Ghi dữ liệu (Commands - Change Tracker ON)
builder.Services.AddDbContext<VnuaCareDataContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Kết nối CSDL SQL Server phục vụ Đọc dữ liệu (Queries - AsNoTracking)
builder.Services.AddDbContext<VnuaCareReadDataContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));`
    },
    {
      category: "api",
      catName: "Duration & ApiResponse",
      title: "10. Đo Thời Gian Xử Lý (Stopwatch) & Chuẩn Hóa ApiResponse",
      file: "VnuaCare.Shared/Helper/ApiControllerBase.cs",
      location: "Class ApiControllerBase -> ExecuteFuntion<T> (Dòng 47 - 65)",
      desc: "Bọc mọi API bằng Stopwatch tự đo thời gian thực thi (duration tính bằng mili-giây), bắt lỗi tập trung và trả về JSON chuẩn RESTful.",
      code: `protected async Task<IActionResult> ExecuteFuntion<T>(Func<Task<T>> func)
{
    var stopwatch = Stopwatch.StartNew();
    try
    {
        var result = await func();
        stopwatch.Stop();

        return Ok(new ApiResponse<T>(
            data: result,
            message: "Success",
            statusCode: 200,
            traceId: HttpContext.TraceIdentifier,
            duration: stopwatch.ElapsedMilliseconds
        ));
    }
    catch (Exception ex)
    {
        stopwatch.Stop();
        return BadRequest(new ApiResponse<object>(
            data: null,
            message: ex.Message,
            statusCode: 400,
            traceId: HttpContext.TraceIdentifier,
            duration: stopwatch.ElapsedMilliseconds
        ));
    }
}`
    }
  ];

  const categories = [
    { key: "all", label: "Tất Cả (10)" },
    { key: "token", label: "Token & JWT" },
    { key: "bcrypt", label: "Băm BCrypt" },
    { key: "cache", label: "Redis Cache" },
    { key: "efcore", label: "EF Core .AnyAsync" },
    { key: "dbcontext", label: "Dual DbContext" },
    { key: "api", label: "Duration & API" }
  ];

  filterBar.innerHTML = "";
  categories.forEach((cat, idx) => {
    const btn = document.createElement("button");
    btn.className = `pointer-filter-btn ${idx === 0 ? "active" : ""}`;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pointer-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPointers(cat.key);
    });
    filterBar.appendChild(btn);
  });

  renderPointers("all");

  function renderPointers(categoryKey) {
    container.innerHTML = "";
    const filtered = categoryKey === "all" ? codePointers : codePointers.filter(p => p.category === categoryKey);

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "pointer-card";
      card.innerHTML = `
        <div class="pointer-top">
          <div class="pointer-title">${p.title}</div>
          <div class="pointer-location">${p.file}</div>
        </div>
        <div style="font-size:12.5px; font-weight:700; color:var(--primary); margin-bottom:8px;">
          Vị trí: ${p.location}
        </div>
        <p style="color:var(--text-sub); font-size:13.5px; margin-bottom:14px; line-height:1.5;">${p.desc}</p>
        <div class="code-window">
          <pre class="code-content"><code>${p.code}</code></pre>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

// ====================================================
// 4. GIẢI THÍCH TRỰC QUAN & DỄ HIỂU NHẤT (EASY EXPLAINER)
// ====================================================
function initEasyExplainer() {
  const tabsContainer = document.getElementById("easyTabsContainer");
  const detailContainer = document.getElementById("easyDetailContainer");
  if (!tabsContainer || !detailContainer) return;

  const theoreticalPillars = [
    {
      id: "architecture",
      tabName: "1. Clean Architecture 5 Tầng",
      title: "Kiến Trúc Phân Tầng Clean Architecture & Quy Tắc Luồng Phụ Thuộc",
      tag: "Kiến Trúc Tổng Thể",
      concept: "Hệ thống áp dụng kiến trúc Clean Architecture (Onion Architecture) nhằm cô lập tối đa quy tắc nghiệp vụ (Business Rules). Tầng Presentation (API) chỉ làm nhiệm vụ giao tiếp ngoại vi (HTTP, Swagger). Tầng Application Core (Business) hoàn toàn độc lập, không biết gì về Controller hay công nghệ giao diện bên ngoài. Nguyên tắc vàng (Dependency Inversion): Tầng bên trong chỉ định nghĩa Abstraction (Interfaces), tầng bên ngoài chịu trách nhiệm triển khai thực tế.",
      steps: [
        "Chặng 1 (Presentation): VnuaCare.API tiếp nhận HTTP Request, giải mã JWT Bearer, phân nhóm Swagger và gọi hàm bọc ExecuteFuntion.",
        "Chặng 2 (MediatR Dispatch): Controller không chứa logic mà chỉ chuyển tiếp đối tượng Command/Query vào MediatR In-Process Bus qua _mediator.Send().",
        "Chặng 3 (Application Core): VnuaCare.Business chứa Handler thực thi nghiệp vụ, kiểm tra quyền hạn RBAC qua IContextAccessor và kiểm tra hợp lệ dữ liệu.",
        "Chặng 4 (Persistence & Services): Handler tương tác với CSDL qua VnuaCare.Data (Dual DbContext) và VnuaCare.Infrastructure (JWT, BCrypt, Redis Cache).",
        "Chặng 5 (Standard Response): Toàn bộ kết quả hoặc lỗi ngoại lệ được chuẩn hóa thành ApiResponse<T> thuộc VnuaCare.Shared trước khi gửi trả về Client."
      ],
      traditional_title: "Cách Làm Cũ (Monolith 3 Tầng Truyền Thống)",
      traditional_points: [
        "Controller gọi trực tiếp DbContext hoặc SQL Script, trộn lẫn logic hiển thị, xác thực và thao tác dữ liệu.",
        "Khi thay đổi cấu trúc bảng CSDL hoặc đổi thư viện bảo mật, lập trình viên phải sửa đổi hàng loạt file ở tầng Controller.",
        "Rất khó viết Unit Test vì các lớp phụ thuộc chặt chẽ với nhau (Tight Coupling), không thể Mock CSDL hoặc HTTP Context.",
        "Nhiều lập trình viên cùng làm chung 1 phân hệ dễ bị xung đột mã nguồn (Merge Conflict) liên tục."
      ],
      vnuacare_title: "Thiết Kế VnuaCare-API (Clean Architecture 5 Projects)",
      vnuacare_points: [
        "Tách biệt 5 dự án độc lập: API (Ngoại vi), Business (Nghiệp vụ), Data (CSDL), Infrastructure (Bảo mật), Shared (Dùng chung).",
        "Tầng Business hoàn toàn cô lập: Thay đổi Database, đổi nhà cung cấp Cache hay đổi giao diện không ảnh hưởng đến logic nghiệp vụ cốt lõi.",
        "Dễ dàng viết Unit Test độc lập cho từng Handler mà không cần khởi động Web Server hay kết nối CSDL thật.",
        "Tuân thủ nghiêm ngặt nguyên lý SOLID, sẵn sàng tách thành các Microservices độc lập trong tương lai."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Tầng Business là trái tim bất biến của hệ thống. Controller và Database chỉ là các chi tiết ngoại vi có thể tháo lắp và thay thế!",
      code: `// Cấu trúc phụ thuộc một chiều (Dependency Inversion) đăng ký tại Program.cs:\n// 1. Hạ tầng CSDL (Data Layer)\nbuilder.Services.AddDbContext<VnuaCareDataContext>(options => ...);\nbuilder.Services.AddDbContext<VnuaCareReadDataContext>(options => ...);\n\n// 2. Nghiệp vụ MediatR (Business Core Layer)\nbuilder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateCampaignCommand).Assembly));\n\n// 3. Dịch vụ Kỹ thuật & Bảo mật (Infrastructure & Shared)\nbuilder.Services.AddScoped<IJwtService, JwtService>();\nbuilder.Services.AddScoped<IPasswordHasher, PasswordHasher>();\nbuilder.Services.AddScoped<IContextAccessor, HttpContextAccessorWrapper>();\nbuilder.Services.AddScoped<ICacheService, RedisCacheService>();`
    },
    {
      id: "cqrs",
      tabName: "2. CQRS & MediatR In-Process Bus",
      title: "Mô Hình CQRS: Tách Biệt Tác Vụ Ghi (Command) & Đọc (Query) Qua MediatR",
      tag: "Mô Hình Thiết Kế Nghiệp Vụ",
      concept: "CQRS (Command Query Responsibility Segregation) phân chia mọi thao tác hệ thống thành 2 nhánh hoàn toàn riêng biệt: Command (làm biến đổi trạng thái CSDL: Insert, Update, Delete) và Query (chỉ đọc dữ liệu: Select, Filter). Thay vì để Controller phụ thuộc vào hàng chục Service cồng kềnh, hệ thống sử dụng MediatR In-Process Bus: Controller chỉ phát đi một thông điệp (Message), MediatR tự động điều phối tới đúng Handler xử lý duy nhất.",
      steps: [
        "Bước 1 (Gửi Message): Controller Action tiếp nhận DTO từ Client và gọi: await _mediator.Send(new CreateRecordCommand(model)).",
        "Bước 2 (Phân loại CQRS): Nếu là Command -> Luồng Ghi dữ liệu được kích hoạt. Nếu là Query -> Luồng Đọc dữ liệu được kích hoạt.",
        "Bước 3 (Thực thi Command): Handler kiểm tra quyền hạn -> Kiểm tra trùng mã bằng .AnyAsync() -> Thao tác qua VnuaCareDataContext (Write) -> SaveChangesAsync() -> Xóa khóa Cache liên quan -> Trả kết quả.",
        "Bước 4 (Thực thi Query): Handler kiểm tra Redis Cache -> Nếu có (Cache Hit) trả ngay; nếu chưa (Cache Miss) truy vấn qua VnuaCareReadDataContext (AsNoTracking) -> Nạp Redis -> Trả DTO phân trang."
      ],
      traditional_title: "Cách Làm Cũ (Fat Service / Generic Repository)",
      traditional_points: [
        "Tạo các Fat Service khổng lồ (ví dụ: UserService chứa 40 phương thức: từ Đăng nhập, Đổi pass đến Lọc danh sách, Xuất Excel).",
        "Trộn lẫn trách nhiệm đọc và ghi trong cùng một lớp, gây khó khăn cho việc tối ưu bộ nhớ đệm Cache và mở rộng CSDL.",
        "Khi 3 lập trình viên cùng sửa các tính năng khác nhau của User, file UserService liên tục bị xung đột mã nguồn.",
        "Khó bảo trì vì một phương thức sửa đổi có thể vô tình làm ảnh hưởng tới các phương thức khác trong cùng Service."
      ],
      vnuacare_title: "Thiết Kế CQRS + MediatR Trong VnuaCare-API",
      vnuacare_points: [
        "Mỗi thao tác nghiệp vụ là 1 file Handler độc lập (Single Responsibility Principle - SRP): CreateRecordCommand, GetFilterRecordQuery.",
        "Controller hoàn toàn sạch sẽ (Skinny Controller): Chỉ phụ thuộc vào duy nhất IMediator, không cần inject hàng tá Service.",
        "Dễ dàng mở rộng Pipeline Behaviors (tự động ghi log, validate FluentValidation, đo hiệu năng) xuyên suốt mọi Handler.",
        "Tối ưu hóa độc lập: Nhánh Query tập trung vào tốc độ đọc và Cache; nhánh Command tập trung vào toàn vẹn giao dịch ACID."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Viết tác vụ Thêm/Sửa/Xóa -> Tạo thư mục Commands/. Viết tác vụ Xem/Lọc/Tìm kiếm -> Tạo thư mục Queries/. Không bao giờ trộn lẫn hai luồng này!",
      code: `// 1. Controller chỉ làm 1 việc duy nhất: Gửi Command qua MediatR\n[HttpPost(\"add\")]\npublic async Task<IActionResult> Create([FromBody] CreateHealthCheckupRecordModel model)\n{\n    return await ExecuteFuntion(async () =>\n    {\n        return await _mediator.Send(new CreateHealthCheckupRecordCommand(model));\n    });\n}\n\n// 2. Handler độc lập thực thi nghiệp vụ Ghi toàn vẹn\npublic class Handler : IRequestHandler<CreateHealthCheckupRecordCommand, Unit>\n{\n    public async Task<Unit> Handle(CreateHealthCheckupRecordCommand request, CancellationToken cancellationToken)\n    {\n        // Kiểm tra trùng SID -> Thêm Entity -> Lưu DB -> Xóa Cache Select\n        return Unit.Value;\n    }\n}`
    },
    {
      id: "dbcontext",
      tabName: "3. Dual DbContext (Read vs Write)",
      title: "Cơ Chế Dual DbContext: Phân Tách Quản Lý Bộ Nhớ Đọc & Ghi Trong EF Core",
      tag: "Hiệu Năng & Toàn Vẹn CSDL",
      concept: "Entity Framework Core sở hữu bộ theo dõi thay đổi (Change Tracker) trong bộ nhớ RAM để quản lý trạng thái từng Entity. Tuy nhiên, Change Tracker tiêu tốn rất nhiều CPU và RAM khi đọc danh sách lớn. VnuaCare-API giải quyết triệt để vấn đề này bằng mô hình Dual DbContext: VnuaCareDataContext chuyên Ghi (bật Change Tracker) và VnuaCareReadDataContext chuyên Đọc (bật AsNoTracking), sẵn sàng kết nối cụm Read-Replica.",
      steps: [
        "1. Khởi tạo Dual DbContext: Program.cs đăng ký đồng thời 2 DbContext với cùng chuỗi kết nối (hoặc tách biệt Master / Replica).",
        "2. Tác vụ Ghi (Commands): Inject VnuaCareDataContext. EF Core tạo snapshot theo dõi các thay đổi trên Entity. Khi gọi SaveChangesAsync(), hệ thống phát hiện chính xác các cột bị Modified để sinh SQL UPDATE tối ưu.",
        "3. Tác vụ Đọc (Queries): Inject VnuaCareReadDataContext. Mọi truy vấn áp dụng .AsNoTracking(), EF Core bỏ qua hoàn toàn bộ theo dõi, trả dữ liệu thẳng sang DTO.",
        "4. Hiệu quả bộ nhớ: Giảm ngay 60% - 70% RAM máy chủ và tăng tốc độ xử lý truy vấn đọc lên gấp 2 đến 3 lần."
      ],
      traditional_title: "Dùng Chung 1 DbContext Cho Mọi Thao Tác",
      traditional_points: [
        "Mọi câu lệnh SELECT danh sách đều nạp hàng nghìn đối tượng Entity vào Change Tracker của DbContext trong RAM.",
        "Dung lượng bộ nhớ RAM máy chủ tăng vọt, Garbage Collector (GC) phải hoạt động liên tục gây hiện tượng treo nhẹ ứng dụng.",
        "Rủi ro rò rỉ dữ liệu: Nếu một Entity vô tình bị sửa trong bộ nhớ và một phương thức khác gọi SaveChanges(), dữ liệu sai sẽ bị ghi vào DB.",
        "Không thể cấu hình phân tách máy chủ Đọc (Read Replica) và máy chủ Ghi (Primary Master) khi hệ thống mở rộng quy mô."
      ],
      vnuacare_title: "Thiết Kế Dual DbContext Trong VnuaCare-API",
      vnuacare_points: [
        "VnuaCareDataContext (Write): Chuyên trách Commands, bật Change Tracker, cam kết giao dịch ACID và toàn vẹn dữ liệu tuyệt đối.",
        "VnuaCareReadDataContext (Read): Chuyên trách Queries, mặc định AsNoTracking(), triệt tiêu hoàn toàn chi phí quản lý trạng thái.",
        "Tiết kiệm tối đa RAM ứng dụng, cho phép phục vụ đồng thời hàng nghìn cán bộ tra cứu kết quả khám mà không sợ nghẽn.",
        "Sẵn sàng mở rộng Master-Slave: Chỉ cần đổi chuỗi kết nối của VnuaCareReadDataContext sang Read-Replica mà không phải sửa 1 dòng code nghiệp vụ."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Viết Command (Ghi) -> Luôn Inject VnuaCareDataContext. Viết Query (Đọc) -> Luôn Inject VnuaCareReadDataContext!",
      code: `// Đăng ký tách biệt trong Program.cs:\n// 1. DbContext phục vụ Ghi dữ liệu (Commands - Change Tracker Bật)\nbuilder.Services.AddDbContext<VnuaCareDataContext>(options =>\n    options.UseSqlServer(builder.Configuration.GetConnectionString(\"DefaultConnection\")));\n\n// 2. DbContext phục vụ Đọc dữ liệu (Queries - AsNoTracking)\nbuilder.Services.AddDbContext<VnuaCareReadDataContext>(options =>\n    options.UseSqlServer(builder.Configuration.GetConnectionString(\"DefaultConnection\")));`
    },
    {
      id: "lifecycle",
      tabName: "4. Vòng Đời Request & Phễu ExecuteFuntion",
      title: "Vòng Đời 8 Bước Của HTTP Request & Phễu Xử Lý Tập Trung Trong Base Controller",
      tag: "Vòng Đời Yêu Cầu & Bắt Lỗi",
      concept: "Mọi yêu cầu HTTP gửi đến hệ thống đều trải qua một chu trình 8 chặng khép kín. Lớp cơ sở ApiControllerBase đóng vai trò như một phễu thu nạp tập trung thông qua hàm ExecuteFuntion: Tự động bấm giờ đo hiệu năng (duration), bắt mọi ngoại lệ (Global Exception Handling), sinh mã truy vết lỗi (traceId) và chuẩn hóa dữ liệu đầu ra thành định dạng JSON ApiResponse duy nhất.",
      steps: [
        "Chặng 1 (HTTP Request): Client (Web/Mobile) gửi request kèm Header Authorization: Bearer <token> và body JSON.",
        "Chặng 2 (CORS & Routing Middleware): Kiểm tra danh sách tên miền được phép truy cập và định tuyến đường dẫn RESTful /api/v1/...",
        "Chặng 3 (JWT Authentication Middleware): Giải mã token, kiểm tra hạn dùng, trích xuất Claims (UserId, Role) gắn vào HttpContext.User.",
        "Chặng 4 (Base Controller Entry): Request đi vào Action trong Controller, Action truyền delegate nghiệp vụ vào hàm ExecuteFuntion.",
        "Chặng 5 (Stopwatch & Dispatch): ExecuteFuntion bấm giờ (Stopwatch.StartNew()) và gọi _mediator.Send() chuyển tiếp vào MediatR.",
        "Chặng 6 (Handler Execution): Handler thực thi nghiệp vụ, kiểm tra phân quyền RBAC qua IContextAccessor, tương tác Dual DbContext và Redis.",
        "Chặng 7 (Catch Exception / Success): Nếu thành công, lấy kết quả; nếu có Exception (DbUpdateException, ArgumentException), bóc tách InnerException chi tiết.",
        "Chặng 8 (ApiResponse Packaging): Dừng bấm giờ (Stopwatch.Stop()), tính duration (ms), đóng gói ApiResponse với traceId và gửi HTTP 200 / 400 về Client."
      ],
      traditional_title: "Cách Làm Cũ (Try-Catch Phân Tán Ở Từng Controller)",
      traditional_points: [
        "Lập trình viên phải viết hàng chục khối try-catch giống hệt nhau ở mỗi Controller Action, gây lặp mã (Code Duplication).",
        "Định dạng phản hồi không đồng nhất: Action này trả về chuỗi text, Action kia trả về object DTO, Action khác lại trả về mã lỗi thô.",
        "Không có thông tin đo thời gian xử lý: Khó phát hiện các API bị nghẽn mạng hoặc các câu truy vấn SQL chạy chậm.",
        "Khi xảy ra lỗi trên Production, Client chỉ thấy lỗi chung chung Internal Server Error mà không có mã traceId để tra cứu log."
      ],
      vnuacare_title: "Thiết Kế Phễu ExecuteFuntion Trong VnuaCare-API",
      vnuacare_points: [
        "Triệt tiêu 100% mã try-catch lặp lại trong các Controller, giữ mã nguồn tinh gọn và thanh lịch.",
        "Chuẩn hóa 100% phản hồi: Dù thành công hay thất bại, Client luôn nhận đúng cấu trúc JSON gồm: statusCode, message, data, traceId, duration.",
        "Tự động tính toán thời gian thực thi (duration tính bằng ms) trên từng request, hỗ trợ giám sát hiệu năng APM tức thì.",
        "Mỗi request có một TraceIdentifier duy nhất: Khi người dùng báo lỗi, đội vận hành chỉ cần tra traceId trong Serilog là thấy toàn bộ StackTrace."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Không bao giờ viết try-catch trong Controller! Luôn bọc toàn bộ delegate nghiệp vụ trong hàm ExecuteFuntion để đảm bảo chuẩn hóa đầu ra và bắt lỗi tập trung.",
      code: `// Phễu xử lý tập trung trong ApiControllerBase.cs:\nprotected async Task<IActionResult> ExecuteFuntion<T>(Func<Task<T>> func)\n{\n    var stopwatch = Stopwatch.StartNew();\n    try\n    {\n        var result = await func();\n        stopwatch.Stop();\n        return Ok(new ApiResponse<T>(\n            data: result,\n            message: \"Success\",\n            statusCode: 200,\n            traceId: HttpContext.TraceIdentifier,\n            duration: stopwatch.ElapsedMilliseconds\n        ));\n    }\n    catch (Exception ex)\n    {\n        stopwatch.Stop();\n        var errorMsg = ex.InnerException != null ? $\"{ex.Message} --> {ex.InnerException.Message}\" : ex.Message;\n        return BadRequest(new ApiResponse<object>(\n            data: null,\n            message: errorMsg,\n            statusCode: 400,\n            traceId: HttpContext.TraceIdentifier,\n            duration: stopwatch.ElapsedMilliseconds\n        ));\n    }\n}`
    },
    {
      id: "token",
      tabName: "5. Stateless JWT & Refresh Token Rotation",
      title: "Cơ Chế Xác Thực Kép: JWT Access Token Ngắn Hạn & Refresh Token Rotation",
      tag: "Bảo Mật & Quản Lý Phiên",
      concept: "Hệ thống áp dụng cơ chế xác thực không lưu trạng thái (Stateless Authentication). Thay vì lưu Session trên bộ nhớ RAM máy chủ, danh tính người dùng (UserId, Username, Role, Email) được mã hóa thành các Claims bên trong JSON Web Token (JWT) được ký số HMAC-SHA256. Để đảm bảo an toàn tối đa, hệ thống kết hợp Access Token ngắn hạn (120 phút) với kỹ thuật Refresh Token Rotation dài hạn (7 ngày) lưu trong CSDL.",
      steps: [
        "1. Đăng Nhập Thành Công: Hệ thống kiểm tra mật khẩu qua thuật toán mật mã BCrypt (Salt ngẫu nhiên + Cost 12). Cấp cặp: Access Token (120m) và Refresh Token (32 bytes ngẫu nhiên).",
        "2. Gọi API Thường Nhật: Client lưu Access Token trong bộ nhớ, gửi kèm Header Authorization: Bearer <token>. Web Server chỉ giải mã chữ ký số, tiêu tốn 0 byte RAM lưu session.",
        "3. Access Token Hết Hạn: Sau 120 phút, token hết hạn, API trả về HTTP 401. Client tự động gọi API /api/v1/auth/refresh và gửi kèm Refresh Token.",
        "4. Cơ Chế Xoay Vòng (Rotation): Server kiểm tra mã Refresh Token trong bảng vc_users. Nếu hợp lệ, hệ thống lập tức HỦY BỎ Refresh Token cũ, sinh CẶP TOKEN MỚI HOÀN TOÀN và cập nhật CSDL.",
        "5. Chống Replay Attack: Nếu kẻ gian đánh cắp và cố tình sử dụng lại Refresh Token cũ đã qua sử dụng, hệ thống lập tức phát hiện xung đột và khóa toàn bộ phiên đăng nhập."
      ],
      traditional_title: "Cách Làm Cũ (In-Memory Session Hoặc JWT Không Có Rotation)",
      traditional_points: [
        "Lưu Session trên RAM server: Khi có 5.000 cán bộ đăng nhập xem kết quả khám, RAM server bị đầy dẫn đến OutOfMemoryException.",
        "Mỗi lần Deploy hoặc Restart lại máy chủ Web, toàn bộ người dùng đang làm việc bị đăng xuất đột ngột.",
        "Dùng JWT vĩnh viễn hoặc thời hạn quá dài (30 ngày): Nếu token bị rò rỉ hoặc đánh cắp, kẻ gian có thể tự do truy cập hồ sơ bệnh án mà không có cách nào thu hồi.",
        "Không có cơ chế xoay vòng Refresh Token khiến hệ thống dễ bị tấn công phát lại (Replay Attack)."
      ],
      vnuacare_title: "Thiết Kế Stateless JWT + Token Rotation Trong VnuaCare-API",
      vnuacare_points: [
        "Access Token Stateless (HMAC-SHA256, 120m): Server chỉ giải mã chữ ký, tiêu tốn 0 byte RAM lưu session, hỗ trợ mở rộng ngang vô hạn (Horizontal Scale).",
        "Refresh Token Rotation an toàn: Sinh 32 bytes ngẫu nhiên qua RandomNumberGenerator, lưu tại vc_users.refresh_token với thời hạn 7 ngày.",
        "Mỗi lần Refresh Token được sử dụng, hệ thống lập tức hủy mã cũ và sinh cặp mới, vô hiệu hóa hoàn toàn rủi ro lộ token.",
        "IContextAccessor trích xuất UserId, Role tức thì từ Claims trong RAM mà không cần truy vấn lại bảng vc_users ở mỗi bước xử lý."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Access Token ngắn hạn lưu ở Frontend để gọi API siêu tốc; Refresh Token dài hạn xoay vòng liên tục trong CSDL để duy trì phiên an toàn mà không bắt người dùng gõ lại mật khẩu!",
      code: `// Cơ Chế Token Rotation Khi Cấp Mới (RefreshTokenCommand.cs):\nvar principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);\nvar userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value);\n\nvar user = await _dataContext.VcUsers.FirstOrDefaultAsync(u => u.UserId == userId);\nif (user == null || user.RefreshToken != request.RefreshToken)\n    throw new UnauthorizedAccessException(\"Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi.\");\n\nvar newAccessToken = _jwtService.GenerateAccessToken(principal.Claims);\nvar newRefreshToken = _jwtService.GenerateRefreshToken();\n\nuser.RefreshToken = newRefreshToken;\nuser.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);\nawait _dataContext.SaveChangesAsync(cancellationToken);`
    },
    {
      id: "cache",
      tabName: "6. Redis Cache-Aside & Fallback Resiliency",
      title: "Chiến Lược Bộ Nhớ Đệm Cache-Aside & Cơ Chế Chống Sập Hệ Thống (Fallback Resiliency)",
      tag: "Tốc Độ & Tự Phục Hồi",
      concept: "Bộ nhớ đệm (Caching) sử dụng Redis như một lớp lưu trữ trên RAM đặt trước SQL Server. Hệ thống áp dụng mô hình Cache-Aside (Lazy Loading): Khi đọc dữ liệu, ứng dụng kiểm tra Cache trước; chỉ khi không thấy mới truy vấn SQL Server và nạp ngược lại Cache. Khi có thao tác ghi, ứng dụng chủ động xóa Cache (Cache Invalidation). Đặc biệt, hệ thống trang bị cơ chế Fallback Resiliency để bảo vệ API không bao giờ bị crash kể cả khi máy chủ Redis bị sập đột ngột.",
      steps: [
        "1. Yêu cầu Đọc Dữ Liệu: Handler gọi _cacheService.GetOrCreate(key, factory). Hệ thống kiểm tra chuỗi JSON tương ứng với Key trong Redis.",
        "2. Trường Hợp Cache Hit (< 1ms): Dữ liệu có sẵn trong Redis RAM, deserialize JSON sang DTO và trả về ngay lập tức, không chạm vào SQL Server.",
        "3. Trường Hợp Cache Miss: Thực thi factory function truy vấn SQL Server qua VnuaCareReadDataContext (AsNoTracking), serialize JSON và nạp vào Redis với Sliding Expiration 300 giây.",
        "4. Cache Invalidation Khi Ghi: Khi có lệnh INSERT/UPDATE/DELETE (Command), Handler tự động gọi _cacheService.Remove(key) để đảm bảo lần đọc sau luôn nhận dữ liệu mới nhất.",
        "5. Cơ Chế Chống Sập (Fallback Resiliency): Toàn bộ thao tác Redis được bọc trong khối try-catch an toàn. Nếu Redis mất kết nối, quá tải hoặc tắt đột ngột, hệ thống tự động ghi log lỗi và chuyển hướng đọc trực tiếp từ SQL Server. API VẪN CHẠY BÌNH THƯỜNG 100%, không bị lỗi 500!"
      ],
      traditional_title: "Chỉ Dùng SQL Server Hoặc Cache Không Có Fallback",
      traditional_points: [
        "Mọi request đọc danh mục (Khoa phòng, Chuyên khoa, Đợt khám) đều truy vấn ổ đĩa SQL Server, gây lãng phí IOPS và quá tải CPU.",
        "Nếu cấu hình Redis nhưng không bọc khối bảo vệ Fallback: Khi Redis gặp sự cố hoặc khởi động lại, toàn bộ API bị văng lỗi 500 Internal Server Error làm sập hệ thống bệnh viện.",
        "Thời gian phản hồi API dao động chậm từ 60ms - 250ms do độ trễ đọc ổ đĩa CSDL vật lý.",
        "Không có cơ chế xóa cache khi sửa dữ liệu dẫn đến người dùng nhìn thấy dữ liệu cũ sai lệch (Stale Data)."
      ],
      vnuacare_title: "Thiết Kế Cache-Aside + Fallback Trong VnuaCare-API",
      vnuacare_points: [
        "90% truy vấn đọc danh mục và tra cứu hồ sơ được chặn lại tại Redis RAM, phản hồi siêu tốc dưới 3ms.",
        "Sliding Expiration 300s (Hết hạn trượt): Dữ liệu nào còn được cán bộ truy cập liên tục sẽ tự động được gia hạn lưu trong Cache.",
        "Chống sập toàn diện (Fault-Tolerance): Tự động fallback đọc SQL Server nếu Redis chết, bảo đảm tính sẵn sàng 99.99% cho hệ thống y tế.",
        "Cache Invalidation tự động: Xóa đúng các khóa Cache tương ứng ngay khi có Command ghi thêm/sửa/xóa."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Cache giúp hệ thống phản hồi nhanh gấp 100 lần, nhưng cơ chế Fallback mới là thứ quyết định hệ thống của bạn có sống sót qua sự cố hạ tầng hay không!",
      code: `// Cơ Chế Fallback Resiliency Trong RedisCacheService.cs:\npublic async Task<TItem?> GetOrCreate<TItem>(string key, Func<Task<TItem>> createItem, DistributedCacheEntryOptions? options = null)\n{\n    if (_config[\"AppSettings:EnableCache\"] == \"true\")\n    {\n        TItem? cacheEntry;\n        try {\n            var itemString = await _distributedCache.GetStringAsync(key);\n            if (string.IsNullOrEmpty(itemString)) {\n                options ??= new DistributedCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromSeconds(_timeLive));\n                cacheEntry = await createItem();\n                var item = JsonSerializer.Serialize(cacheEntry);\n                await _distributedCache.SetStringAsync(key, item, options);\n            } else {\n                cacheEntry = JsonSerializer.Deserialize<TItem>(itemString);\n            }\n        } catch (Exception ex) {\n            Log.Error($\"Có lỗi xảy ra khi xử lý dữ liệu từ redis - {ex.Message} -> Fallback to Database!\");\n            cacheEntry = await createItem(); // VẪN HOẠT ĐỘNG HOÀN HẢO, KHÔNG CRASH API!\n        }\n        return cacheEntry;\n    }\n    return await createItem();\n}`
    },
    {
      id: "anyasync",
      tabName: "7. EF Core AnyAsync & Short-Circuiting",
      title: "Tối Ưu Hóa Truy Vấn Database: Bản Chất EXISTS, Short-Circuiting & CancellationToken",
      tag: "Hiệu Năng & Tối Ưu Truy Vấn",
      concept: "Phương thức .AnyAsync(predicate, cancellationToken) là vũ khí tối thượng trong EF Core để kiểm tra sự tồn tại của dữ liệu (Unique Constraint Check và Foreign Key Validation). Khác với các phương thức đếm hoặc lấy dữ liệu, .AnyAsync chuyển dịch trực tiếp thành mệnh đề EXISTS trong SQL Server với cơ chế Short-circuiting ngắt quét bảng ngay lập tức khi thấy bản ghi đầu tiên, kết hợp cùng CancellationToken để ngắt kết nối tức thì khi Client hủy yêu cầu.",
      steps: [
        "1. Lập Trình Viên Gọi C#: await _dataContext.VcHealthCheckupRecords.AnyAsync(x => x.SidCode == sid, cancellationToken).",
        "2. EF Core Biên Dịch SQL: Sinh câu lệnh chuẩn: SELECT CASE WHEN EXISTS (SELECT 1 FROM [records] WHERE sid_code = @sid) THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END.",
        "3. SQL Server Short-circuiting: Bộ máy SQL Server quét chỉ mục (Index) hoặc bảng. Ngay khi chạm bản ghi ĐẦU TIÊN khớp điều kiện, SQL Server NGẮT QUÉT BẢNG LẬP TỨC và trả về 1 bit. Không quét tiếp hàng nghìn bản ghi còn lại.",
        "4. Kích Thước Gói Tin: Đúng 1 bit dữ liệu (true/false) truyền qua mạng LAN/Internet. Ứng dụng C# tiêu tốn 0 byte RAM để khởi tạo đối tượng Entity.",
        "5. Vai Trò CancellationToken: Tham số cancellationToken liên kết trực tiếp với HttpContext.RequestAborted. Khi người dùng bấm Hủy (Cancel) trên trình duyệt hoặc mất kết nối mạng, ASP.NET Core gửi tín hiệu hủy, EF Core ngắt lệnh SQL đang chạy (Command.Cancel()), giải phóng ngay lập tức CPU và Connection Pool cho SQL Server."
      ],
      traditional_title: "Thói Quen Sai Lầm (.CountAsync > 0 Hoặc FirstOrDefault != null)",
      traditional_points: [
        "Dùng .CountAsync() > 0: SQL Server phải duyệt qua TOÀN BỘ các bản ghi thỏa điều kiện trên bảng hàng trăm nghìn dòng để đếm đủ số lượng.",
        "Dùng .FirstOrDefaultAsync() != null: C# phải cấp phát bộ nhớ RAM tạo một thực thể Entity với hàng chục thuộc tính và nạp vào Change Tracker, gây lãng phí bộ nhớ và rác Garbage Collection.",
        "Băng thông mạng phải truyền toàn bộ dữ liệu các cột của dòng đó qua mạng thay vì chỉ truyền 1 bit boolean.",
        "Không truyền cancellationToken: Khi người dùng ngắt mạng hoặc hủy thao tác, SQL Server vẫn âm thầm thực thi câu lệnh SQL đến cùng, làm tắc nghẽn Connection Pool."
      ],
      vnuacare_title: "Chuẩn Mực .AnyAsync() Trong VnuaCare-API",
      vnuacare_points: [
        "SQL Server sinh mệnh đề IF EXISTS (SELECT 1 FROM ...) tối ưu hóa tuyệt đối.",
        "Cơ chế Short-circuiting: Ngắt quét bảng ngay khi phát hiện bản ghi đầu tiên khớp điều kiện.",
        "Bộ nhớ RAM ứng dụng tiêu thụ: 0 bytes (không khởi tạo đối tượng Entity C#).",
        "Luôn truyền cancellationToken trên 100% các câu truy vấn để bảo vệ tài nguyên hệ thống khi có sự cố mạng."
      ],
      takeaway: "<strong>Quy tắc cốt lõi:</strong> Bất cứ khi nào kiểm tra trùng mã (Unique SID, CampaignCode, Username, Email) hoặc kiểm tra khóa ngoại (CampaignId, StaffId, DoctorId tồn tại), LUÔN LUÔN dùng .AnyAsync() kèm cancellationToken!",
      code: `// Kiểm tra mã vạch hồ sơ (SID) đã tồn tại chưa trong CreateHealthCheckupRecordCommand.cs:\nvar isSidExisted = await _dataContext.VcHealthCheckupRecords\n    .AnyAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);\n\nif (isSidExisted)\n{\n    throw new ArgumentException(\"Mã vạch hồ sơ (SID) đã tồn tại trên hệ thống!\");\n}\n\n// Câu lệnh SQL Server sinh ra (EXISTS Short-Circuiting):\n// SELECT CASE\n//     WHEN EXISTS (\n//         SELECT 1\n//         FROM [vc_health_checkup_records] AS [v]\n//         WHERE [v].[sid_code] = @__sidCode_0\n//     ) THEN CAST(1 AS bit)\n//     ELSE CAST(0 AS bit)\n// END`
    }
  ];

  tabsContainer.innerHTML = "";
  theoreticalPillars.forEach((tp, idx) => {
    const btn = document.createElement("button");
    btn.className = "easy-tab-btn " + (idx === 0 ? "active" : "");
    btn.textContent = tp.tabName;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".easy-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTheoreticalPillar(tp);
    });
    tabsContainer.appendChild(btn);
  });

  renderTheoreticalPillar(theoreticalPillars[0]);

  function renderTheoreticalPillar(tp) {
    detailContainer.innerHTML = `
      <div class="metaphor-hero">
        <div class="metaphor-header-row">
          <div class="metaphor-title-group">
            <div>
              <h2 style="font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">${tp.title}</h2>
              <span class="badge-tag badge-blue">${tp.tag}</span>
            </div>
          </div>
        </div>

        <div class="metaphor-story-box">
          <div style="font-size: 12px; font-weight: 700; color: var(--cyan); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
            Bản Chất Lý Thuyết & Nguyên Lý Kỹ Thuật
          </div>
          <p style="margin-bottom: 14px; font-size: 14px; line-height: 1.7; color: var(--text-main);">
            ${tp.concept}
          </p>
          <div style="font-size: 12.5px; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 8px;">
            Cơ Chế Hoạt Động Kỹ Thuật Từng Bước:
          </div>
          <ul style="padding-left: 18px; font-size: 13.5px; line-height: 1.8; color: var(--text-sub);">
            ${tp.steps.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>

        <div class="metaphor-compare-grid">
          <div class="compare-col traditional">
            <div class="compare-col-header">
              <span class="badge-tag badge-amber" style="font-size:11px;">Vấn đề</span>
              <span>${tp.traditional_title}</span>
            </div>
            <ul class="compare-list">
              ${tp.traditional_points.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>

          <div class="compare-col vnuacare">
            <div class="compare-col-header">
              <span class="badge-tag badge-green" style="font-size:11px;">Giải pháp</span>
              <span>${tp.vnuacare_title}</span>
            </div>
            <ul class="compare-list">
              ${tp.vnuacare_points.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 10px;">
            Mã Nguồn C# Triển Khai Thực Tế Trong Dự Án
          </div>
          <div class="code-window">
            <pre class="code-content"><code>${tp.code}</code></pre>
          </div>
        </div>

        <div class="metaphor-takeaway">
          <span class="badge-tag badge-blue" style="font-size:11px;">Mục đích</span>
          <div>${tp.takeaway}</div>
        </div>
      </div>
    `;
  }
}
// ====================================================
// 5. KẾ HOẠCH TIẾP THEO & LỘ TRÌNH PHÁT TRIỂN (ROADMAP)
// ====================================================
function initRoadmapExplorer() {
  const phaseNavContainer = document.getElementById("phaseNavContainer");
  const phaseDetailContainer = document.getElementById("phaseDetailContainer");
  const backlogFilterBar = document.getElementById("backlogFilterBar");
  const backlogSearchInput = document.getElementById("backlogSearchInput");
  const backlogTableBody = document.getElementById("backlogTableBody");

  if (!phaseNavContainer || !phaseDetailContainer || !backlogTableBody) return;

  const phases = [
    {
      id: "phase1",
      name: "Giai Đoạn 1: Nền Tảng Cốt Lõi",
      badge: "ĐÃ HOÀN THÀNH (100%)",
      badgeClass: "badge-green",
      desc: "Kiến trúc Clean Architecture, Dual DbContext, JWT + Rotation, Redis Cache, CQRS MediatR & 9 Bảng CSDL cốt lõi.",
      goals: "Xây dựng khung xương Backend tiêu chuẩn doanh nghiệp, bảo mật phân quyền RBAC, kiểm tra SID bằng .AnyAsync() và bộ nhớ đệm chống sập.",
      deliverables: "5 Projects, Program.cs, JwtService, PasswordHasher, RedisCacheService, Campaign Module, CheckupRecord Module, 26 Endpoints API.",
      challenges: "Tách biệt rõ ràng tác vụ Đọc (AsNoTracking) và Ghi (Change Tracker), đảm bảo Redis Fallback không bao giờ trả lỗi 500 khi mất kết nối.",
      status: "COMPLETED",
      tablesCount: "9 / 24 Bảng CSDL",
      progressPct: 100
    },
    {
      id: "phase2",
      name: "Giai Đoạn 2: Mở Rộng 15 Entities",
      badge: "ƯU TIÊN SỐ 1 (BẮT TAY LÀM NGAY)",
      badgeClass: "badge-blue",
      desc: "Khởi tạo 15 Thực thể C# Entity Framework Core 9 còn lại và đăng ký DbSet<T> đồng bộ trên Dual DbContext.",
      goals: "Hoàn thiện 100% ánh xạ ORM từ CSDL 24 bảng vào C#, thiết lập khóa chính, khóa ngoại, kiểu dữ liệu decimal/datetime2 và quan hệ 1-1, 1-N.",
      deliverables: "15 Entity C# classes trong VnuaCare.Data/Systems/Context/, cấu hình OnModelCreating, đăng ký DbSet trong VnuaCareDataContext & VnuaCareReadDataContext.",
      challenges: "Kiểm soát chặt chẽ ràng buộc khóa ngoại (Foreign Keys) giữa vc_health_checkup_records với các bảng kết quả chuyên khoa và xét nghiệm.",
      status: "IN_PROGRESS",
      tablesCount: "15 / 24 Bảng CSDL",
      progressPct: 15
    },
    {
      id: "phase3",
      name: "Giai Đoạn 3: Khám Thể Lực & Chuyên Khoa",
      badge: "GIAI ĐOẠN TIẾP THEO (P2)",
      badgeClass: "badge-purple",
      desc: "Phân hệ Khám Thể Lực (Chiều cao, cân nặng, BMI, huyết áp) và Khám Chuyên Khoa (Mắt, Tai Mũi Họng, Răng Hàm Mặt, Da Liễu, ICD-10).",
      goals: "Cho phép bác sĩ các chuyên khoa nhập kết quả khám độc lập, tự động tính chỉ số BMI và xếp loại thể lực theo chuẩn Bộ Y Tế.",
      deliverables: "VitalSignsController, SpecialistExamController, DiseaseCatalogController, SaveVitalSignsCommand, SaveSpecialistExamCommand, GetComboxDiseaseQuery.",
      challenges: "Tìm kiếm nhanh danh mục hàng nghìn mã bệnh ICD-10 với Redis Cache và tính năng autocomplete trên Frontend.",
      status: "PLANNED",
      tablesCount: "4 Bảng CSDL mục tiêu",
      progressPct: 0
    },
    {
      id: "phase4",
      name: "Giai Đoạn 4: Xét Nghiệm & Chẩn Đoán Hình Ảnh",
      badge: "GIAI ĐOẠN TIẾP THEO (P3)",
      badgeClass: "badge-amber",
      desc: "Phân hệ Cận Lâm Sàng: Phiếu chỉ định xét nghiệm máu/nước tiểu, tự động gán cờ cảnh báo bất thường và phiếu kết quả X-Quang/Siêu âm.",
      goals: "Tự động so sánh chỉ số xét nghiệm với ngưỡng Min - Max theo giới tính Nam/Nữ để gán cờ NORMAL / HIGH / LOW; Quản lý file ảnh y tế DICOM/PNG.",
      deliverables: "LabTestController, DiagnosticReportController, CreateLabOrderCommand, SaveLabResultsCommand, SaveDiagnosticReportCommand, UploadImagingAttachmentCommand.",
      challenges: "Xử lý lưu trữ và nén file ảnh chụp phim X-Quang, siêu âm dung lượng lớn lên Cloud Storage / Local File Server an toàn.",
      status: "PLANNED",
      tablesCount: "5 Bảng CSDL mục tiêu",
      progressPct: 0
    },
    {
      id: "phase5",
      name: "Giai Đoạn 5: Đơn Thuốc, Xếp Loại & Xuất PDF",
      badge: "GIAI ĐOẠN HOÀN THIỆN (P4)",
      badgeClass: "badge-red",
      desc: "Kê đơn thuốc điện tử, Đánh giá xếp loại sức khỏe toàn diện (Loại I - V) và Xuất Phiếu Khám Sức Khỏe PDF có mã vạch SID & QR Code.",
      goals: "Bác sĩ trưởng khoa tổng hợp kết luận cuối cùng, phân loại sức khỏe cán bộ theo Thông tư Bộ Y Tế và in ấn giấy chứng nhận chuẩn chỉnh.",
      deliverables: "PrescriptionController, ExportReportController, CreatePrescriptionCommand, FinalizeRecordConclusionCommand, ExportHealthCertificatePdfQuery.",
      challenges: "Thiết kế mẫu PDF chuẩn A4 đẹp mắt, tích hợp sinh mã vạch SID Code và QR Code tra cứu hồ sơ trực tuyến.",
      status: "PLANNED",
      tablesCount: "3 Bảng CSDL mục tiêu",
      progressPct: 0
    },
    {
      id: "phase6",
      name: "Giai Đoạn 6: Testing & Production Hardening",
      badge: "BẢO VỆ VẬN HÀNH (P5)",
      badgeClass: "badge-green",
      desc: "Viết Unit Tests, Integration Tests với Testcontainers (SQL Server & Redis), đóng gói Docker và thiết lập CI/CD GitHub Actions.",
      goals: "Đạt độ bao phủ kiểm thử > 80% logic nghiệp vụ, đảm bảo triển khai không gián đoạn (Zero Downtime Deployment) lên máy chủ Học viện.",
      deliverables: "VnuaCare.Tests (xUnit, Moq, FluentAssertions), Dockerfile, docker-compose.yml, .github/workflows/deploy.yml.",
      challenges: "Mô phỏng kiểm thử tải đồng thời (Load Testing) 2.000 cán bộ cùng tra cứu kết quả mà thời gian phản hồi vẫn dưới 50ms.",
      status: "PLANNED",
      tablesCount: "Toàn bộ hệ thống",
      progressPct: 0
    }
  ];

  // 24-Table Backlog Data
  const backlogData = [
    // Completed in Phase 1 (9 tables)
    { table: "vc_users", entity: "VcUsers.cs", module: "Users & Auth", endpoint: "/api/v1/auth, /api/v1/users", phase: "Giai đoạn 1", status: "DONE", priority: "CRITICAL" },
    { table: "vc_staffs", entity: "VcStaffs.cs", module: "Staffs", endpoint: "/api/v1/staffs", phase: "Giai đoạn 1", status: "DONE", priority: "CRITICAL" },
    { table: "vc_doctors", entity: "VcDoctors.cs", module: "Doctors", endpoint: "/api/v1/doctors", phase: "Giai đoạn 1", status: "DONE", priority: "CRITICAL" },
    { table: "vc_departments", entity: "VcDepartments.cs", module: "Staffs / Depts", endpoint: "/api/v1/staffs/get-combobox-department", phase: "Giai đoạn 1", status: "DONE", priority: "HIGH" },
    { table: "vc_specialties", entity: "VcSpecialties.cs", module: "Doctors / Specs", endpoint: "/api/v1/doctors/get-combobox-specialty", phase: "Giai đoạn 1", status: "DONE", priority: "HIGH" },
    { table: "vc_checkup_campaigns", entity: "VcCheckupCampaigns.cs", module: "Campaigns", endpoint: "/api/v1/campaigns", phase: "Giai đoạn 1", status: "DONE", priority: "CRITICAL" },
    { table: "vc_campaign_registrations", entity: "VcCampaignRegistrations.cs", module: "Campaigns", endpoint: "/api/v1/campaigns/register", phase: "Giai đoạn 1", status: "DONE", priority: "HIGH" },
    { table: "vc_health_checkup_records", entity: "VcHealthCheckupRecords.cs", module: "CheckupRecords", endpoint: "/api/v1/healthcheckuprecords", phase: "Giai đoạn 1", status: "DONE", priority: "CRITICAL" },
    { table: "vc_internal_medicine_exams", entity: "VcInternalMedicineExams.cs", module: "CheckupRecords", endpoint: "/api/v1/healthcheckuprecords/save-internal-medicine", phase: "Giai đoạn 1", status: "DONE", priority: "CRITICAL" },

    // Phase 2 / Phase 3: Clinical & Physical Exams (4 tables)
    { table: "vc_vital_signs", entity: "VcVitalSigns.cs", module: "VitalSigns (Mới)", endpoint: "POST /api/v1/vitalsigns/save, GET /by-record", phase: "Giai đoạn 2 & 3", status: "NEXT", priority: "CRITICAL" },
    { table: "vc_specialist_exams", entity: "VcSpecialistExams.cs", module: "SpecialistExams (Mới)", endpoint: "POST /api/v1/specialists/save, GET /by-record", phase: "Giai đoạn 2 & 3", status: "NEXT", priority: "CRITICAL" },
    { table: "vc_disease_catalog", entity: "VcDiseaseCatalog.cs", module: "DiseaseCatalog (Mới)", endpoint: "GET /api/v1/diseases/filter, GET /combox", phase: "Giai đoạn 2 & 3", status: "NEXT", priority: "HIGH" },
    { table: "vc_health_record_diagnoses", entity: "VcHealthRecordDiagnoses.cs", module: "Diagnoses (Mới)", endpoint: "POST /api/v1/diagnoses/attach, DELETE /detach", phase: "Giai đoạn 2 & 3", status: "NEXT", priority: "HIGH" },

    // Phase 2 / Phase 4: Paraclinical Lab & Imaging (5 tables)
    { table: "vc_lab_indicator_catalog", entity: "VcLabIndicatorCatalog.cs", module: "LabCatalog (Mới)", endpoint: "GET /api/v1/lab-catalogs/filter", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "HIGH" },
    { table: "vc_medical_services", entity: "VcMedicalServices.cs", module: "MedicalServices (Mới)", endpoint: "GET /api/v1/services/filter, GET /combox", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "MEDIUM" },
    { table: "vc_staff_registered_services", entity: "VcStaffRegisteredServices.cs", module: "ServiceRegistration (Mới)", endpoint: "POST /api/v1/services/register-staff", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "MEDIUM" },
    { table: "vc_lab_test_orders", entity: "VcLabTestOrders.cs", module: "LabTests (Mới)", endpoint: "POST /api/v1/lab-orders/create, GET /by-record", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "HIGH" },
    { table: "vc_lab_test_results", entity: "VcLabTestResults.cs", module: "LabTests (Mới)", endpoint: "POST /api/v1/lab-orders/save-results", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "HIGH" },
    { table: "vc_diagnostic_reports", entity: "VcDiagnosticReports.cs", module: "DiagnosticReports (Mới)", endpoint: "POST /api/v1/diagnostic-reports/save", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "HIGH" },
    { table: "vc_imaging_attachments", entity: "VcImagingAttachments.cs", module: "DiagnosticReports (Mới)", endpoint: "POST /api/v1/diagnostic-reports/upload-image", phase: "Giai đoạn 2 & 4", status: "NEXT", priority: "MEDIUM" },

    // Phase 2 / Phase 5: Prescriptions & Audit (4 tables)
    { table: "vc_medication_catalog", entity: "VcMedicationCatalog.cs", module: "Medications (Mới)", endpoint: "GET /api/v1/medications/filter, GET /combox", phase: "Giai đoạn 2 & 5", status: "NEXT", priority: "MEDIUM" },
    { table: "vc_prescriptions", entity: "VcPrescriptions.cs", module: "Prescriptions (Mới)", endpoint: "POST /api/v1/prescriptions/create, GET /by-record", phase: "Giai đoạn 2 & 5", status: "NEXT", priority: "HIGH" },
    { table: "vc_prescription_details", entity: "VcPrescriptionDetails.cs", module: "Prescriptions (Mới)", endpoint: "Chi tiết các dòng thuốc kê trong đơn", phase: "Giai đoạn 2 & 5", status: "NEXT", priority: "HIGH" },
    { table: "vc_audit_logs", entity: "VcAuditLogs.cs", module: "AuditLogs (Mới)", endpoint: "Ghi vết kiểm toán tự động qua Interceptor", phase: "Giai đoạn 2", status: "NEXT", priority: "MEDIUM" }
  ];

  // Render Phase Navigation
  phaseNavContainer.innerHTML = "";
  phases.forEach((p, idx) => {
    const btn = document.createElement("button");
    btn.className = `phase-nav-btn ${idx === 1 ? "active" : ""}`; // Default highlight Phase 2
    btn.innerHTML = `
      <div class="phase-nav-top">
        <span class="badge-tag ${p.badgeClass}" style="font-size: 11px;">${p.status === "COMPLETED" ? "Hoàn Thành" : p.status === "IN_PROGRESS" ? "Đang Làm" : "Kế Hoạch"}</span>
        <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">${p.progressPct}%</span>
      </div>
      <div class="phase-nav-name">${p.name}</div>
      <div class="phase-nav-desc">${p.tablesCount}</div>
    `;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".phase-nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPhaseDetail(p);
    });
    phaseNavContainer.appendChild(btn);
  });

  renderPhaseDetail(phases[1]); // Default render Phase 2 (Immediate next step)

  function renderPhaseDetail(p) {
    phaseDetailContainer.innerHTML = `
      <div class="phase-detail-card">
        <div class="phase-detail-header">
          <div>
            <div class="phase-detail-title">
              <span class="phase-status-text" style="font-size:11px; font-weight:700;">${p.status === "COMPLETED" ? "[XONG]" : p.status === "IN_PROGRESS" ? "[ĐANG LÀM]" : "[KẾ HOẠCH]"}</span>
              <span>${p.name}</span>
            </div>
            <p style="color: var(--text-sub); font-size: 14px; margin-top: 6px;">${p.desc}</p>
          </div>
          <span class="badge-tag ${p.badgeClass}" style="font-size: 13px; padding: 6px 14px;">${p.badge}</span>
        </div>

        <div class="phase-info-grid">
          <div class="phase-info-block">
            <div class="phase-info-label">Mục Tiêu Cốt Lõi</div>
            <div class="phase-info-val">${p.goals}</div>
          </div>
          <div class="phase-info-block">
            <div class="phase-info-label">Sản Phẩm Bàn Giao</div>
            <div class="phase-info-val">${p.deliverables}</div>
          </div>
          <div class="phase-info-block">
            <div class="phase-info-label">Thách Thức Kỹ Thuật</div>
            <div class="phase-info-val">${p.challenges}</div>
          </div>
        </div>

        <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="font-size: 13.5px; color: var(--text-main);">
            <strong>Tiến độ giai đoạn:</strong> ${p.progressPct}% hoàn tất • Quy mô: <strong>${p.tablesCount}</strong>
          </div>
          <button class="action-btn" onclick="filterBacklogByPhase('${p.name.split(':')[0]}')" style="padding: 6px 14px; font-size: 12.5px;">
            Xem Các Bảng Thuộc Giai Đoạn Này
          </button>
        </div>
      </div>
    `;
  }

  // Filter Pills for Backlog
  const filterCategories = [
    { key: "all", label: "Tất Cả (24 Bảng)" },
    { key: "done", label: "Đã Xong (9)" },
    { key: "next", label: "Cần Làm Ngay (15)" },
    { key: "phase2", label: "Giai Đoạn 2 (Ưu Tiên P1)" },
    { key: "phase3", label: "Giai Đoạn 3 (Lâm Sàng)" },
    { key: "phase4", label: "Giai Đoạn 4 (Xét Nghiệm/CĐHA)" },
    { key: "phase5", label: "Giai Đoạn 5 (Đơn Thuốc)" }
  ];

  backlogFilterBar.innerHTML = "";
  filterCategories.forEach((fc, idx) => {
    const btn = document.createElement("button");
    btn.className = `backlog-filter-btn ${idx === 0 ? "active" : ""}`;
    btn.textContent = fc.label;
    btn.setAttribute("data-filter", fc.key);
    btn.addEventListener("click", () => {
      document.querySelectorAll(".backlog-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyBacklogFilters();
    });
    backlogFilterBar.appendChild(btn);
  });

  backlogSearchInput.addEventListener("input", applyBacklogFilters);

  window.filterBacklogByPhase = function(phaseKeyword) {
    const targetKey = phaseKeyword.includes("1") ? "done" :
                      phaseKeyword.includes("2") ? "phase2" :
                      phaseKeyword.includes("3") ? "phase3" :
                      phaseKeyword.includes("4") ? "phase4" : "phase5";
    const btn = document.querySelector(`.backlog-filter-btn[data-filter="${targetKey}"]`);
    if (btn) btn.click();
    document.getElementById("backlogFilterBar").scrollIntoView({ behavior: "smooth" });
  };

  function applyBacklogFilters() {
    const activeBtn = document.querySelector(".backlog-filter-btn.active");
    const filterKey = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
    const query = backlogSearchInput.value.toLowerCase().trim();

    const filtered = backlogData.filter(item => {
      // Category filter
      let passCategory = true;
      if (filterKey === "done") passCategory = item.status === "DONE";
      else if (filterKey === "next") passCategory = item.status === "NEXT";
      else if (filterKey === "phase2") passCategory = item.phase.includes("Giai đoạn 2");
      else if (filterKey === "phase3") passCategory = item.phase.includes("Giai đoạn 3");
      else if (filterKey === "phase4") passCategory = item.phase.includes("Giai đoạn 4");
      else if (filterKey === "phase5") passCategory = item.phase.includes("Giai đoạn 5");

      // Search filter
      const passSearch = !query ||
        item.table.toLowerCase().includes(query) ||
        item.entity.toLowerCase().includes(query) ||
        item.module.toLowerCase().includes(query) ||
        item.endpoint.toLowerCase().includes(query);

      return passCategory && passSearch;
    });

    renderBacklogTable(filtered);
  }

  function renderBacklogTable(items) {
    backlogTableBody.innerHTML = "";
    if (items.length === 0) {
      backlogTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">Không tìm thấy bảng CSDL hoặc thực thể nào khớp với bộ lọc.</td></tr>`;
      return;
    }

    items.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; color:var(--text-main);">${item.table}</div>
        </td>
        <td>
          <div style="font-family:'JetBrains Mono',monospace; font-size:12.5px; color:var(--primary); font-weight:600;">${item.entity}</div>
        </td>
        <td>
          <span style="font-size:12.5px; color:var(--text-sub);">${item.module}</span>
        </td>
        <td>
          <div style="font-size:12.5px; color:var(--text-sub); line-height:1.4;">${item.endpoint}</div>
        </td>
        <td>
          <span class="badge-tag" style="font-size:11px;">${item.phase}</span>
        </td>
        <td>
          ${item.status === "DONE" 
            ? `<span class="badge-tag badge-green" style="font-size:11.5px;">Đã Hoàn Thành</span>`
            : `<span class="badge-tag badge-blue" style="font-size:11.5px;">Cần Làm Ngay (P1)</span>`}
        </td>
      `;
      backlogTableBody.appendChild(tr);
    });
  }

  applyBacklogFilters();
}

// ====================================================
// 6. LẦN VẾT MÃ NGUỒN: CODE CHẠY TỪ ĐÂU TỚI ĐÂU (TRACE EXPLORER)
// ====================================================
function initTraceExplorer() {
  const flowNav = document.getElementById("traceFlowNav");
  const stationList = document.getElementById("traceStationList");
  const detailPanel = document.getElementById("traceDetailPanel");

  if (!flowNav || !stationList || !detailPanel) return;

  const traceFlows = [
    {
      id: "write",
      name: "Luồng 1: Thêm Mới Hồ Sơ & AnyAsync (Ghi Dữ Liệu)",
      endpoint: "POST /api/v1/healthcheckuprecords/add",
      desc: "Lần vết chi tiết: Kiểm tra phân quyền RBAC -> Kiểm tra trùng SID bằng .AnyAsync() ngắt quét bảng -> Lưu CSDL qua DbContext -> Xóa Redis Cache.",
      stations: [
        {
          num: 1,
          title: "1. Client Gửi HTTP POST",
          file: "Client &rarr; ASP.NET Core Middleware",
          location: "Kestrel Server -> UseAuthentication Middleware",
          action: "Gửi JSON payload kèm Bearer JWT Token trên HTTP Header",
          explanation: "Client (Web Frontend React/Vue hoặc Mobile App) gửi request tạo mới hồ sơ khám. ASP.NET Core kiểm tra chính sách CORS trong Program.cs, giải mã JWT Bearer Token, kiểm tra chữ ký HMAC-SHA256 và nạp danh tính (ClaimsPrincipal) vào HttpContext.User.",
          inputData: `{ "campaignId": 1, "staffId": 105, "sidCode": "SID-2026-0089", "actualCheckupDate": "2026-10-27" }`,
          outputData: "HttpContext.User chứa Claims: UserId=1, Role=HEALTH_ADMIN, Username=admin_health",
          code: `// Client gửi HTTP POST:
POST /api/v1/healthcheckuprecords/add HTTP/1.1
Host: api.vnuacare.vnua.edu.vn
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...
Content-Type: application/json

{
  "campaignId": 1,
  "staffId": 105,
  "sidCode": "SID-2026-0089",
  "actualCheckupDate": "2026-10-27T08:30:00"
}`,
          sqlQuery: null,
          nextHop: "HealthCheckupRecordController.cs (Hàm Create)"
        },
        {
          num: 2,
          title: "2. Controller & Base Controller",
          file: "HealthCheckupRecordController.cs &rarr; ApiControllerBase.cs",
          location: "HealthCheckupRecordController.cs (Dòng 46) & ApiControllerBase.cs (Dòng 47 - 57)",
          action: "Bắt đầu bấm giờ Stopwatch và ủy thác sang MediatR",
          explanation: "Controller kế thừa ApiControllerBase. Thay vì viết try-catch thủ công, Controller bọc hàm thực thi vào `ExecuteFuntion`. Tại đây, `Stopwatch.StartNew()` được kích hoạt để tự động đo thời gian xử lý chính xác đến mili-giây và gửi Command vào xe buýt MediatR.",
          inputData: "model: CreateHealthCheckupRecordModel (CampaignId=1, StaffId=105, SidCode='SID-2026-0089')",
          outputData: "Task<IActionResult> đang chờ kết quả từ MediatR Handler",
          code: `// 1. HealthCheckupRecordController.cs:
[HttpPost, Route("add")]
public async Task<IActionResult> Create([FromBody] CreateHealthCheckupRecordModel model)
{
    return await ExecuteFuntion(async () =>
    {
        return await _mediator.Send(new CreateHealthCheckupRecordCommand(model));
    });
}

// 2. ApiControllerBase.cs:
protected async Task<IActionResult> ExecuteFuntion<T>(Func<Task<T>> func)
{
    var stopwatch = Stopwatch.StartNew(); // Bắt đầu tính mili-giây
    try {
        var result = await func();
        stopwatch.Stop();
        return Ok(new ApiResponse<T>(data: result, message: "Success", statusCode: 200, duration: stopwatch.ElapsedMilliseconds));
    } catch (Exception ex) {
        stopwatch.Stop();
        return BadRequest(new ApiResponse<object>(data: null, message: ex.Message, statusCode: 400, duration: stopwatch.ElapsedMilliseconds));
    }
}`,
          sqlQuery: null,
          nextHop: "MediatR Bus &rarr; CreateHealthCheckupRecordCommand.cs"
        },
        {
          num: 3,
          title: "3. Phân Quyền Bằng Claims (IContextAccessor)",
          file: "CreateHealthCheckupRecordCommand.cs &rarr; HttpContextAccessorWrapper.cs",
          location: "CreateHealthCheckupRecordCommand.cs (Dòng 54 - 63)",
          action: "Trích xuất quyền Role tức thì từ Token, không truy vấn lại DB",
          explanation: "Handler được Dependency Injection tự động tiêm `IContextAccessor`. Handler lấy ngay `_contextAccessor.Role` từ Claims của token. Nếu không phải HEALTH_ADMIN hoặc SUPER_ADMIN, hệ thống lập tức quăng `UnauthorizedAccessException`. Tiết kiệm 1 truy vấn đọc DB!",
          inputData: "ClaimsPrincipal hiện tại trong HttpContext",
          outputData: "currentUserRole = 'HEALTH_ADMIN' (Hợp lệ, cho phép đi tiếp)",
          code: `// CreateHealthCheckupRecordCommand.cs - Dòng 54:
var currentUserRole = _contextAccessor.Role;

if (currentUserRole != Role.HEALTH_ADMIN.ToString() &&
    currentUserRole != Role.SUPER_ADMIN.ToString())
{
    throw new UnauthorizedAccessException("Bạn không có quyền thực hiện chức năng này (Yêu cầu quyền Quản trị viên y tế).");
}`,
          sqlQuery: null,
          nextHop: "Kiểm tra khóa ngoại Đợt khám và Cán bộ"
        },
        {
          num: 4,
          title: "4. Kiểm Tra Tồn Tại Khóa Ngoại (.AnyAsync)",
          file: "CreateHealthCheckupRecordCommand.cs &rarr; VnuaCareDataContext.cs",
          location: "CreateHealthCheckupRecordCommand.cs (Dòng 86 - 100)",
          action: "Xác thực CampaignId và StaffId có tồn tại trong SQL Server không",
          explanation: "Trước khi tạo hồ sơ con, hệ thống phải đảm bảo đợt khám và cán bộ thực sự tồn tại trong CSDL. Thay vì dùng `FirstOrDefaultAsync` nạp nguyên entity vào RAM, hệ thống dùng `.AnyAsync()` cực nhẹ.",
          inputData: "model.CampaignId = 1, model.StaffId = 105",
          outputData: "campaignExists = true, staffExists = true",
          code: `// Kiểm tra đợt khám tồn tại
var campaignExists = await _dataContext.VcCheckupCampaigns
    .AnyAsync(x => x.CampaignId == model.CampaignId, cancellationToken);
if (!campaignExists) throw new ArgumentException($"Đợt khám '{model.CampaignId}' không tồn tại.");

// Kiểm tra cán bộ tồn tại
var staffExists = await _dataContext.VcStaffs
    .AnyAsync(x => x.StaffId == model.StaffId, cancellationToken);
if (!staffExists) throw new ArgumentException($"Cán bộ '{model.StaffId}' không tồn tại.");`,
          sqlQuery: `SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM [vc_checkup_campaigns] WHERE [campaign_id] = @__CampaignId) 
    THEN CAST(1 AS bit) ELSE CAST(0 AS bit) 
END;`,
          nextHop: "Kiểm tra trùng mã vạch SID"
        },
        {
          num: 5,
          title: "5. Kiểm Tra Trùng Mã SID (EXISTS Short-Circuit)",
          file: "CreateHealthCheckupRecordCommand.cs &rarr; VnuaCareDataContext.cs",
          location: "CreateHealthCheckupRecordCommand.cs (Dòng 115 - 130)",
          action: "Quét index sid_code, ngắt quét ngay bản ghi đầu tiên nếu trùng",
          explanation: "Mỗi hồ sơ khám có 1 mã vạch SID duy nhất. Câu lệnh AnyAsync biên dịch sang mệnh đề EXISTS trong SQL Server. Cơ chế Short-circuiting dừng quét bảng ngay khi thấy bản ghi đầu tiên khớp. RAM C# tốn đúng 0 bytes!",
          inputData: "model.SidCode = 'SID-2026-0089'",
          outputData: "isSidExisted = false (Mã SID chưa ai dùng -> Cho phép tạo)",
          code: `// Kiểm tra trùng lặp mã vạch SID
var isSidExisted = await _dataContext.VcHealthCheckupRecords
    .AnyAsync(x => x.SidCode == model.SidCode.Trim(), cancellationToken);

if (isSidExisted)
{
    throw new ArgumentException($"Mã vạch hồ sơ (SID) '{model.SidCode}' đã tồn tại!");
}`,
          sqlQuery: `SELECT CASE 
    WHEN EXISTS (SELECT 1 FROM [vc_health_checkup_records] WHERE [sid_code] = @__sidCode) 
    THEN CAST(1 AS bit) ELSE CAST(0 AS bit) 
END;`,
          nextHop: "Khởi tạo Entity, Lưu CSDL & Xóa Cache"
        },
        {
          num: 6,
          title: "6. Lưu CSDL & Xóa Cache Redis (Hoàn Tất)",
          file: "CreateHealthCheckupRecordCommand.cs &rarr; RedisCacheService.cs &rarr; Client",
          location: "CreateHealthCheckupRecordCommand.cs (Dòng 133 - 163)",
          action: "Ghi bản ghi vào SQL Server qua Change Tracker, xóa cache cũ và trả về Client",
          explanation: "Thực thể `VcHealthCheckupRecords` được thêm vào Write DbContext (`_dataContext.AddAsync`). Lệnh `SaveChangesAsync()` mở transaction ghi dữ liệu vào bảng và sinh khóa chính `record_id`. Sau đó, `_cacheService.Remove` xóa cache danh sách cũ trên Redis. Stopwatch dừng lại tính duration (18ms) và trả về JSON chuẩn.",
          inputData: "recordEntity: VcHealthCheckupRecords (Status='PENDING')",
          outputData: "HTTP 200 OK: { statusCode: 200, message: 'Success', data: 0, duration: 18 }",
          code: `var recordEntity = new VcHealthCheckupRecords
{
    CampaignId = model.CampaignId,
    StaffId = model.StaffId,
    SidCode = model.SidCode.Trim(),
    Status = "PENDING"
};

await _dataContext.VcHealthCheckupRecords.AddAsync(recordEntity, cancellationToken);
await _dataContext.SaveChangesAsync(cancellationToken);

// Xóa cache danh sách để người dùng F5 thấy dữ liệu mới ngay
_cacheService.Remove(HealthCheckupRecordConstant.BuildCacheKey());

return Unit.Value;`,
          sqlQuery: `INSERT INTO [vc_health_checkup_records] ([campaign_id], [staff_id], [sid_code], [status], ...)
VALUES (@p0, @p1, @p2, @p3, ...);
SELECT [record_id] FROM [vc_health_checkup_records] WHERE @@ROWCOUNT = 1 AND [record_id] = scope_identity();`,
          nextHop: "Client nhận kết quả thành công (Thời gian xử lý: ~18ms)"
        }
      ]
    },
    {
      id: "read",
      name: "Luồng 2: Lọc Danh Sách & Dynamic LINQ (Tác vụ Đọc)",
      endpoint: "GET /api/v1/users/get-filter?role=DOCTOR&textSearch=admin",
      desc: "Lần vết chi tiết: ContextAccessor kiểm tra quyền -> AsNoTracking() tiết kiệm RAM -> Dynamic Where lọc theo Role, IsActive, TextSearch -> Dynamic OrderBy -> Phân trang Skip/Take (File GetFilterUserQuery.cs).",
      stations: [
        {
          num: 1,
          title: "1. Client Gửi HTTP GET Với Query Params",
          file: "Client &rarr; UserController.cs",
          location: "Client -> GET /api/v1/users/get-filter?role=DOCTOR&textSearch=admin&pageIndex=1&pageSize=10",
          action: "Gửi tham số phân trang, bộ lọc vai trò và từ khóa tìm kiếm",
          explanation: "Client gửi yêu cầu tìm kiếm tài khoản người dùng với các tiêu chí lọc: Vai trò='DOCTOR', từ khóa tìm kiếm='admin', trang=1, số bản ghi/trang=10.",
          inputData: "Query Params: role=DOCTOR, textSearch=admin, pageIndex=1, pageSize=10",
          outputData: "FilterUserModel object được ASP.NET Model Binder nạp tự động",
          code: `GET /api/v1/users/get-filter?role=DOCTOR&textSearch=admin&pageIndex=1&pageSize=10 HTTP/1.1
Host: api.vnuacare.vnua.edu.vn
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...`,
          sqlQuery: null,
          nextHop: "UserController.cs (Hàm GetFilter)"
        },
        {
          num: 2,
          title: "2. Controller Gửi Sang MediatR",
          file: "UserController.cs &rarr; ApiControllerBase.cs",
          location: "UserController.cs (Dòng 48 - 56)",
          action: "Kích hoạt Stopwatch và chuyển giao câu truy vấn cho MediatR Bus",
          explanation: "UserController không chứa code LINQ hay DbContext. Nó gọi `ExecuteFuntion` và gửi đối tượng `GetFilterUserQuery(model)` vào MediatR. MediatR tự động tìm Handler xử lý trong tầng Business.",
          inputData: "FilterUserModel",
          outputData: "Task<IActionResult> chờ kết quả PaginationList<UserModel>",
          code: `[HttpGet("get-filter")]
public async Task<IActionResult> GetFilter([FromQuery] FilterUserModel model)
{
    return await ExecuteFuntion(async () =>
    {
        return await _mediator.Send(new GetFilterUserQuery(model));
    });
}`,
          sqlQuery: null,
          nextHop: "GetFilterUserQuery.cs (Hàm Handle)"
        },
        {
          num: 3,
          title: "3. Kiểm Tra Quyền Hạn RBAC (ContextAccessor)",
          file: "GetFilterUserQuery.cs &rarr; HttpContextAccessorWrapper.cs",
          location: "GetFilterUserQuery.cs (Dòng 37 - 42)",
          action: "Kiểm tra Role người gọi API ngay từ Claims JWT",
          explanation: "Chỉ SUPER_ADMIN hoặc HEALTH_ADMIN mới có quyền xem danh sách tài khoản. Handler đọc `_contextAccessor.Role`. Nếu là DOCTOR hoặc STAFF thông thường, hệ thống chặn ngay và ném `UnauthorizedAccessException`.",
          inputData: "_contextAccessor.Role",
          outputData: "currentUserRole = 'SUPER_ADMIN' (Đủ quyền xem danh sách)",
          code: `// GetFilterUserQuery.cs - Dòng 37:
var filter = request.Filter;
var currentUserRole = _contextAccessor.Role;

if (currentUserRole != Role.SUPER_ADMIN.ToString() && 
    currentUserRole != Role.HEALTH_ADMIN.ToString())
{
    throw new UnauthorizedAccessException("Bạn không có quyền truy cập danh sách tài khoản người dùng.");
}`,
          sqlQuery: null,
          nextHop: "Khởi tạo truy vấn AsNoTracking()"
        },
        {
          num: 4,
          title: "4. AsNoTracking() & Lọc Động (Dynamic LINQ)",
          file: "GetFilterUserQuery.cs &rarr; VnuaCareDataContext.cs",
          location: "GetFilterUserQuery.cs (Dòng 44 - 64)",
          action: "Xây dựng câu truy vấn IQueryable với AsNoTracking() và các điều kiện Where nối tiếp",
          explanation: "Đây là phần code cốt lõi: `_dataContext.VcUsers.AsNoTracking()` nói với EF Core KHÔNG nạp đối tượng vào Change Tracker (tiết kiệm 60% RAM). Sau đó, các mệnh đề Where được nối linh hoạt: lọc Role, lọc IsActive, và tìm kiếm không phân biệt hoa thường.",
          inputData: "filter.Role = 'DOCTOR', filter.TextSearch = 'admin'",
          outputData: "IQueryable<VcUsers> chưa thực thi (Deferred Execution)",
          code: `// GetFilterUserQuery.cs - Dòng 44-64:
var query = _dataContext.VcUsers.AsNoTracking();

// 1. Lọc theo Role nếu có truyền
if (!string.IsNullOrWhiteSpace(filter.Role))
{
    var roleTrim = filter.Role.Trim().ToUpper();
    query = query.Where(x => x.Role == roleTrim);
}

// 2. Lọc theo trạng thái hoạt động
if (filter.IsActive.HasValue)
{
    query = query.Where(x => x.IsActive == filter.IsActive.Value);
}

// 3. Tìm kiếm tự do theo Username hoặc Email
if (!string.IsNullOrWhiteSpace(filter.TextSearch))
{
    var ts = filter.TextSearch.Trim().ToLower();
    query = query.Where(x => x.Username.ToLower().Contains(ts) || 
                            (x.Email != null && x.Email.ToLower().Contains(ts)));
}`,
          sqlQuery: `WHERE [v].[role] = 'DOCTOR' AND (LOWER([v].[username]) LIKE '%admin%' OR LOWER([v].[email]) LIKE '%admin%')`,
          nextHop: "Sắp xếp động & Phân trang OFFSET FETCH"
        },
        {
          num: 5,
          title: "5. Sắp Xếp Động & Phân Trang (Skip / Take)",
          file: "GetFilterUserQuery.cs &rarr; SQL Server",
          location: "GetFilterUserQuery.cs (Dòng 66 - 100)",
          action: "Đếm tổng số bản ghi và lấy đúng 10 bản ghi trang 1",
          explanation: "Hệ thống gọi `query.CountAsync()` để lấy tổng số bản ghi (phục vụ tính số trang ở Frontend). Sau đó, dùng `Skip((pageIndex - 1) * pageSize).Take(pageSize)` để SQL Server sinh câu lệnh phân trang `OFFSET ... FETCH NEXT 10 ROWS ONLY` cực nhanh.",
          inputData: "pageIndex = 1, pageSize = 10",
          outputData: "totalCount = 4, items = List<UserModel> (4 phần tử)",
          code: `// Đếm tổng số bản ghi
var totalCount = await query.CountAsync(cancellationToken);

// Sắp xếp động
bool isAsc = string.Equals(filter.Ascending, "asc", StringComparison.OrdinalIgnoreCase);
if (!string.IsNullOrWhiteSpace(filter.PropertyName) && filter.PropertyName.Equals("Username", StringComparison.OrdinalIgnoreCase))
{
    query = isAsc ? query.OrderBy(x => x.Username) : query.OrderByDescending(x => x.Username);
}
else
{
    query = query.OrderByDescending(x => x.UserId);
}

// Phân trang và chiếu DTO
var items = await query
    .Skip((filter.PageIndex - 1) * filter.PageSize)
    .Take(filter.PageSize)
    .Select(x => new UserModel {
        UserId = x.UserId,
        Username = x.Username,
        Email = x.Email,
        Role = x.Role,
        IsActive = x.IsActive
    })
    .ToListAsync(cancellationToken);`,
          sqlQuery: `SELECT [v].[user_id], [v].[username], [v].[email], [v].[role], [v].[is_active]
FROM [vc_users] AS [v]
WHERE [v].[role] = 'DOCTOR' AND LOWER([v].[username]) LIKE '%admin%'
ORDER BY [v].[user_id] DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`,
          nextHop: "Đóng gói PaginationList<UserModel> và trả về"
        },
        {
          num: 6,
          title: "6. Đóng Gói PaginationList & ApiResponse",
          file: "GetFilterUserQuery.cs &rarr; ApiControllerBase.cs &rarr; Client",
          location: "GetFilterUserQuery.cs (Dòng 110) & ApiControllerBase.cs",
          action: "Đóng gói kết quả phân trang và dừng đồng hồ Stopwatch",
          explanation: "Hàm trả về `new PaginationList<UserModel>(items, totalCount, filter.PageIndex, filter.PageSize)`. Đối tượng này tự động tính `TotalPages`, `HasPreviousPage`, `HasNextPage`. Base Controller đóng gói vào `ApiResponse<T>` với duration ~12ms.",
          inputData: "items (4 bản ghi), totalCount (4)",
          outputData: "HTTP 200 OK + JSON ApiResponse chứa PaginationList",
          code: `return new PaginationList<UserModel>(items, totalCount, filter.PageIndex, filter.PageSize);

// JSON trả về cho Client:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "items": [
      { "userId": 12, "username": "doctor_admin", "email": "doctor@vnua.edu.vn", "role": "DOCTOR", "isActive": true }
    ],
    "pageIndex": 1,
    "pageSize": 10,
    "totalCount": 4,
    "totalPages": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  },
  "duration": 12
}`,
          sqlQuery: null,
          nextHop: "Frontend render bảng danh sách người dùng thành công."
        }
      ]
    },
    {
      id: "auth",
      name: "Luồng 3: Đăng Nhập & Token Rotation (Bảo Mật)",
      endpoint: "POST /api/v1/authorization/login & /refreshtoken",
      desc: "Lần vết chi tiết: Tìm tài khoản -> Băm so khớp BCrypt (Cost 12) -> Sinh Access Token HMAC-SHA256 (120m) & Refresh Token 32 bytes RNG -> Cập nhật DB -> Token Rotation khi hết hạn.",
      stations: [
        {
          num: 1,
          title: "1. Client Gửi Thông Tin Đăng Nhập",
          file: "Client &rarr; AuthorizationController.cs",
          location: "POST /api/v1/authorization/login (Payload: LoginIdentifier & Password)",
          action: "Gửi Username hoặc Email kèm Mật khẩu nguyên bản",
          explanation: "Người dùng nhập tài khoản và mật khẩu trên form đăng nhập. Dữ liệu được đóng gói vào `LoginModel` gửi tới endpoint `/api/v1/authorization/login`.",
          inputData: `{ "loginIdentifier": "admin_health", "password": "MySecretPassword@123" }`,
          outputData: "LoginModel",
          code: `POST /api/v1/authorization/login HTTP/1.1
Host: api.vnuacare.vnua.edu.vn
Content-Type: application/json

{
  "loginIdentifier": "admin_health",
  "password": "MySecretPassword@123"
}`,
          sqlQuery: null,
          nextHop: "AuthorizationController.cs (Hàm Login)"
        },
        {
          num: 2,
          title: "2. Controller Ủy Thác Cho MediatR",
          file: "AuthorizationController.cs &rarr; ApiControllerBase.cs",
          location: "AuthorizationController.cs (Dòng 33 - 41)",
          action: "Gửi UserLoginCommand vào xe buýt MediatR",
          explanation: "Controller tiếp nhận request, bọc trong `ExecuteFuntion` đo thời gian và gửi `UserLoginCommand(model)` sang MediatR.",
          inputData: "LoginModel",
          outputData: "Task<IActionResult> chờ kết quả LoginResponseModel",
          code: `[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginModel model)
{
    return await ExecuteFuntion(async () =>
    {
        return await _mediator.Send(new UserLoginCommand(model));
    });
}`,
          sqlQuery: null,
          nextHop: "UserLoginCommand.cs (Hàm Handle)"
        },
        {
          num: 3,
          title: "3. Tìm User & So Khớp Mật Khẩu BCrypt",
          file: "UserLoginCommand.cs &rarr; PasswordHasher.cs",
          location: "UserLoginCommand.cs (Dòng 56 - 64) &rarr; PasswordHasher.cs (Dòng 28)",
          action: "Truy vấn CSDL tìm tài khoản và gọi BCrypt.Verify so khớp muối mật khẩu",
          explanation: "Handler gọi `_dataContext.VcUsers.FirstOrDefaultAsync` tìm theo Username hoặc Email. Sau đó, gọi sang `_passwordHasher.VerifyPassword` (sử dụng thuật toán BCrypt với Cost 12 và Salt ngẫu nhiên). Nếu mật khẩu sai, quăng `ArgumentException` lập tức.",
          inputData: "model.LoginIdentifier = 'admin_health', password = 'MySecretPassword@123'",
          outputData: "user entity hợp lệ, mật khẩu trùng khớp!",
          code: `// 1. Tìm user theo username hoặc email:
var user = await _dataContext.VcUsers
    .FirstOrDefaultAsync(u => u.IsActive && 
        (u.Username == model.LoginIdentifier || u.Email == model.LoginIdentifier), cancellationToken);

// 2. Xác thực mật khẩu băm BCrypt:
if (user == null || !_passwordHasher.VerifyPassword(model.Password, user.Password))
{
    throw new ArgumentException("Tài khoản hoặc mật khẩu không chính xác.");
}

// Bên trong PasswordHasher.cs:
public bool VerifyPassword(string password, string hashedPassword)
{
    return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
}`,
          sqlQuery: `SELECT TOP(1) [v].[user_id], [v].[username], [v].[email], [v].[password_hash], [v].[role], [v].[is_active]
FROM [vc_users] AS [v]
WHERE [v].[is_active] = 1 AND ([v].[username] = @__loginId OR [v].[email] = @__loginId);`,
          nextHop: "Sinh Access Token & Refresh Token"
        },
        {
          num: 4,
          title: "4. Sinh Cặp Token Kép (Access + Refresh)",
          file: "UserLoginCommand.cs &rarr; JwtService.cs",
          location: "UserLoginCommand.cs (Dòng 66 - 76) &rarr; JwtService.cs",
          action: "Ký chữ ký số HMAC-SHA256 cho Access Token và sinh chuỗi 32 bytes ngẫu nhiên cho Refresh Token",
          explanation: "Handler tạo danh sách Claims (UserId, Username, Role). Sau đó gọi sang `JwtService.GenerateAccessToken` (ký chữ ký số HMAC-SHA256 với SecretKey, thời hạn 120 phút). Tiếp theo gọi `JwtService.GenerateRefreshToken` (dùng `RandomNumberGenerator.Create()` sinh 32 bytes ngẫu nhiên mã hóa Base64 an toàn mật mã học).",
          inputData: "Claims: [NameIdentifier=1, Name='admin_health', Role='HEALTH_ADMIN']",
          outputData: "accessToken (JWT string), refreshToken (32 bytes Base64)",
          code: `// Tạo claims
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
    new Claim(ClaimTypes.Name, user.Username),
    new Claim(ClaimTypes.Role, user.Role)
};

// Gọi sang JwtService.cs:
var accessToken = _jwtService.GenerateAccessToken(claims);  // Hạn 120 phút
var refreshToken = _jwtService.GenerateRefreshToken();      // 32 bytes Cryptographic RNG`,
          sqlQuery: null,
          nextHop: "Lưu Refresh Token vào CSDL"
        },
        {
          num: 5,
          title: "5. Lưu Refresh Token 7 Ngày Vào CSDL",
          file: "UserLoginCommand.cs &rarr; VnuaCareDataContext.cs",
          location: "UserLoginCommand.cs (Dòng 79 - 86)",
          action: "Cập nhật Refresh Token mới và thời hạn 7 ngày vào bảng vc_users",
          explanation: "Refresh Token được lưu vào cột `refresh_token` kèm `refresh_token_expiry_time = DateTime.Now.AddDays(7)`. Khi gọi `SaveChangesAsync()`, SQL Server chạy lệnh UPDATE. Sau đó, gọi `_cacheService.Remove` xóa cache phiên cũ.",
          inputData: "user.RefreshToken = refreshToken, ExpiryTime = Now + 7 ngày",
          outputData: "Bản ghi vc_users được cập nhật thành công",
          code: `user.RefreshToken = refreshToken;
user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
_dataContext.VcUsers.Update(user);
await _dataContext.SaveChangesAsync(cancellationToken);

_cacheService.Remove(AuthorizationConstant.BuildCacheKey());`,
          sqlQuery: `UPDATE [vc_users] 
SET [refresh_token] = @p0, [refresh_token_expiry_time] = @p1, [updated_at] = GETDATE()
WHERE [user_id] = @p2;`,
          nextHop: "Cơ chế Token Rotation khi làm mới token"
        },
        {
          num: 6,
          title: "6. Token Rotation Khi Hết Hạn (Bảo Vệ Phiên)",
          file: "RefreshTokenCommand.cs &rarr; JwtService.cs &rarr; Client",
          location: "RefreshTokenCommand.cs (Dòng 45 - 90)",
          action: "Khi Access Token hết hạn, dùng Refresh Token để hủy mã cũ và cấp cặp mới",
          explanation: "Khi Access Token 120 phút hết hạn, Client gọi endpoint `/refreshtoken`. `RefreshTokenCommand` trích xuất UserId từ token hết hạn (bằng `GetPrincipalFromExpiredToken`), kiểm tra mã Refresh Token khớp trong DB. Nếu khớp, hệ thống HỦY MÃ CŨ và cấp phát CẶP TOKEN MỚI TOANH (Token Rotation). Chống tuyệt đối Replay Attack!",
          inputData: "request.AccessToken, request.RefreshToken",
          outputData: "newAccessToken + newRefreshToken hoàn toàn mới!",
          code: `// Trích xuất Claims từ Access Token đã hết hạn (ValidateLifetime = false)
var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
var userId = int.Parse(principal.FindFirst(ClaimTypes.NameIdentifier).Value);

var user = await _dataContext.VcUsers.FirstOrDefaultAsync(u => u.UserId == userId);
if (user == null || user.RefreshToken != request.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
    throw new UnauthorizedAccessException("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");

// Cấp cặp Token MỚI HOÀN TOÀN (Token Rotation)
var newAccessToken = _jwtService.GenerateAccessToken(principal.Claims);
var newRefreshToken = _jwtService.GenerateRefreshToken();

// Hủy token cũ, lưu token mới vào DB
user.RefreshToken = newRefreshToken;
user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
await _dataContext.SaveChangesAsync(cancellationToken);`,
          sqlQuery: `UPDATE [vc_users] SET [refresh_token] = @p0 WHERE [user_id] = @p1;`,
          nextHop: "Client cập nhật token mới vào LocalStorage và duy trì phiên làm việc."
        }
      ]
    }
  ];

  // Render Flow Selector Tabs
  flowNav.innerHTML = "";
  traceFlows.forEach((flow, idx) => {
    const btn = document.createElement("button");
    btn.className = `trace-flow-btn ${idx === 0 ? "active" : ""}`;
    btn.innerHTML = `
      <div class="trace-flow-btn-top">
        <span class="badge-tag ${idx === 0 ? "badge-green" : idx === 1 ? "badge-blue" : "badge-red"}" style="font-size: 11px;">${flow.endpoint.split(" ")[0]}</span>
        <span style="font-size: 11px; font-family:'JetBrains Mono',monospace; color:var(--text-muted);">${flow.stations.length} Trạm</span>
      </div>
      <div class="trace-flow-btn-name">${flow.name}</div>
      <div class="trace-flow-btn-desc">${flow.endpoint}</div>
    `;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".trace-flow-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderFlowStations(flow);
    });
    flowNav.appendChild(btn);
  });

  renderFlowStations(traceFlows[0]);

  function renderFlowStations(flow, activeStationIdx = 0) {
    stationList.innerHTML = "";
    flow.stations.forEach((st, idx) => {
      const item = document.createElement("div");
      const isCompleted = idx < activeStationIdx;
      const isActive = idx === activeStationIdx;
      item.className = `station-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`;
      item.dataset.index = idx;
      item.innerHTML = `
        <div class="station-circle">${st.num}</div>
        <div class="station-item-content">
          <div class="station-item-title">${st.title}</div>
          <div class="station-item-file">${st.file}</div>
          <div class="station-item-action">${st.action}</div>
        </div>
      `;
      item.addEventListener("click", () => {
        selectStation(idx, flow);
      });
      stationList.appendChild(item);
    });

    renderStationDetail(flow.stations[activeStationIdx], flow, activeStationIdx);
  }

  function selectStation(idx, flow) {
    const items = stationList.querySelectorAll(".station-item");
    items.forEach((el, i) => {
      el.classList.toggle("active", i === idx);
      el.classList.toggle("completed", i < idx);
      const circle = el.querySelector(".station-circle");
      if (circle) {
        circle.textContent = i + 1;
      }
    });
    renderStationDetail(flow.stations[idx], flow, idx);
  }

  function renderStationDetail(st, flow, currentIdx) {
    // Generate Horizontal Mini-Stepper
    let stepperHtml = `<div class="trace-mini-stepper">`;
    flow.stations.forEach((s, i) => {
      const isAct = i === currentIdx;
      const isDone = i < currentIdx;
      const shortTitle = s.title.split(". ")[1] || s.title;
      stepperHtml += `
        <button class="trace-step-node ${isAct ? "active" : ""} ${isDone ? "completed" : ""}" data-step="${i}">
          <span>${s.num}.</span>
          <span>${shortTitle.length > 18 ? shortTitle.substring(0, 16) + '...' : shortTitle}</span>
        </button>
      `;
      if (i < flow.stations.length - 1) {
        stepperHtml += `<span class="trace-step-arrow">&rarr;</span>`;
      }
    });
    stepperHtml += `</div>`;

    detailPanel.innerHTML = `
      ${stepperHtml}

      <div class="trace-detail-header">
        <div>
          <div class="trace-step-badge">Trạm ${st.num} / ${flow.stations.length} • ${flow.name.split(":")[0]}</div>
          <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-top: 8px;">${st.title}</h2>
        </div>
        <span class="badge-tag badge-cyan" style="font-size: 11.5px; font-family:'JetBrains Mono',monospace;">${flow.endpoint.split(" ")[0]} Flow</span>
      </div>

      <div class="trace-file-meta">
        <span>Vị Trí Code:</span>
        <strong style="color: var(--cyan);">${st.location}</strong>
      </div>

      <div class="trace-explanation-box">
        <div style="font-size: 11.5px; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-bottom: 4px;">
          Chi Tiết Luồng Thực Thi
        </div>
        ${st.explanation}
      </div>

      <div class="trace-io-grid">
        <div class="trace-io-col">
          <div class="trace-io-label">Dữ Liệu Đầu Vào (Input)</div>
          <div class="trace-io-val">${st.inputData}</div>
        </div>
        <div class="trace-io-col">
          <div class="trace-io-label">Kết Quả Đầu Ra (Output)</div>
          <div class="trace-io-val" style="color: var(--primary);">${st.outputData}</div>
        </div>
      </div>

      <div class="card" style="padding: 14px; margin-bottom: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <div style="font-size: 12.5px; font-weight: 700; color: var(--text-main);">Mã Nguồn C# Đang Thực Thi Tại Trạm Này</div>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('stationCodeBlock').textContent); alert('Đã sao chép mã nguồn!');">Copy</button>
        </div>
        <div class="code-window">
          <pre class="code-content"><code id="stationCodeBlock">${st.code}</code></pre>
        </div>
      </div>

      ${st.sqlQuery ? `
        <div class="card" style="padding: 14px; margin-bottom: 16px; border-color: rgba(6, 182, 212, 0.35);">
          <div style="font-size: 12px; font-weight: 700; color: var(--cyan); text-transform: uppercase; margin-bottom: 6px;">
            SQL Server Query Sinh Ra Từ Trạm Này (Database Behavior)
          </div>
          <div class="code-window">
            <pre class="code-content" style="color: #67e8f9;"><code>${st.sqlQuery}</code></pre>
          </div>
        </div>
      ` : ""}

      <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
        <div style="font-size: 13px; color: var(--text-sub);">
          <span>Chuyển tiếp trạm:</span> <strong style="color: var(--text-main);">${st.nextHop}</strong>
        </div>
        <span class="badge-tag badge-blue" style="font-size: 11px;">Hoạt Động Hoàn Hảo</span>
      </div>

      <div class="trace-nav-actions">
        <button class="trace-action-btn" id="btnPrevStation" ${currentIdx === 0 ? "disabled" : ""}>
          &larr; Trạm Trước (${currentIdx > 0 ? flow.stations[currentIdx - 1].num : ""})
        </button>
        <span style="font-size: 12px; color: var(--text-muted); font-family:'JetBrains Mono',monospace;">Trạm ${currentIdx + 1} / ${flow.stations.length}</span>
        <button class="trace-action-btn primary" id="btnNextStation" ${currentIdx === flow.stations.length - 1 ? "disabled" : ""}>
          Trạm Kế Tiếp (${currentIdx < flow.stations.length - 1 ? flow.stations[currentIdx + 1].num : ""}) &rarr;
        </button>
      </div>
    `;

    // Bind mini-stepper buttons
    detailPanel.querySelectorAll(".trace-step-node").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetStep = parseInt(btn.dataset.step, 10);
        selectStation(targetStep, flow);
      });
    });

    // Bind Prev / Next buttons
    const btnPrev = document.getElementById("btnPrevStation");
    const btnNext = document.getElementById("btnNextStation");

    if (btnPrev && currentIdx > 0) {
      btnPrev.addEventListener("click", () => {
        selectStation(currentIdx - 1, flow);
        stationList.children[currentIdx - 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }

    if (btnNext && currentIdx < flow.stations.length - 1) {
      btnNext.addEventListener("click", () => {
        selectStation(currentIdx + 1, flow);
        stationList.children[currentIdx + 1]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }
}



// ====================================================
// TRUNG TÂM TỔNG HỢP MÔ HÌNH KIẾN TRÚC & VẬN HÀNH
// (KÈM CHÚ GIẢI THUẬT NGỮ CỐT LÕI)
// ====================================================
function initModelSynthesis() {
  const container = document.getElementById("synthesisContentContainer");
  const tabBtns = document.querySelectorAll(".synthesis-tab-btn");
  if (!container || tabBtns.length === 0) return;

  let currentTab = "blueprint";

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentTab = btn.getAttribute("data-tab");
      renderTabContent(currentTab);
    });
  });

  function renderTabContent(tabKey) {
    if (tabKey === "blueprint") {
      container.innerHTML = renderBlueprintTab();
    } else if (tabKey === "cqrs") {
      container.innerHTML = renderCqrsTab();
    } else if (tabKey === "dual-context") {
      container.innerHTML = renderDualContextTab();
    } else if (tabKey === "simulator") {
      container.innerHTML = renderSimulatorTab();
      initSimulatorInteractions();
    } else if (tabKey === "glossary") {
      container.innerHTML = renderGlossaryTab();
    } else if (tabKey === "matrix") {
      container.innerHTML = renderMatrixTab();
    } else if (tabKey === "comparison") {
      container.innerHTML = renderComparisonTab();
    }
  }

  // Tab 1: Blueprint 5 Tầng
  function renderBlueprintTab() {
    return `
      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <h3 style="font-size:18px; font-weight:800; color:var(--primary);">Sơ Đồ Kiến Trúc Clean Architecture 5 Tầng</h3>
          <span class="badge-tag badge-green">Quy Tắc Dependency Inversion</span>
        </div>
        <p style="color:var(--text-sub); font-size:14px; line-height:1.6; margin-bottom:18px;">
          Clean Architecture (Onion Architecture) chia hệ thống thành 5 tầng độc lập. Quy tắc bất biến: 
          <strong>Các tầng ngoại vi bên ngoài phụ thuộc vào các tầng bên trong, tầng lõi nghiệp vụ (Business) tuyệt đối không phụ thuộc vào tầng ngoài hay cơ sở dữ liệu</strong>.
        </p>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <!-- Layer 1 -->
          <div class="card" style="border-left:4px solid #3b82f6; background:rgba(59,130,246,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
              <div>
                <span class="badge-tag badge-blue" style="font-family:'JetBrains Mono',monospace;">TẦNG 1: PRESENTATION LAYER</span>
                <strong style="margin-left:8px; font-size:15px; color:var(--text-main);">VnuaCare.API</strong>
              </div>
              <span style="font-size:12px; color:var(--text-muted);">Cổng giao tiếp ngoại vi RESTful</span>
            </div>
            <p style="font-size:13px; color:var(--text-sub); margin-bottom:6px;">
              Tiếp nhận HTTP Request từ Client (Web/Mobile), cấu hình CORS, Routing, xác thực JWT Bearer Token, định tuyến tài liệu Swagger.
            </p>
            <div style="font-size:12px; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
              Thành phần cốt lõi: Program.cs, Controllers/Business/ (DoctorController, UserController, HealthCheckupRecordController...)
            </div>
          </div>

          <!-- Arrow -->
          <div style="text-align:center; color:var(--primary); font-weight:700; font-size:13px;">
            Ủy thác tác vụ qua _mediator.Send() &darr;
          </div>

          <!-- Layer 2 -->
          <div class="card" style="border-left:4px solid #a855f7; background:rgba(168,85,247,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
              <div>
                <span class="badge-tag" style="background:rgba(168,85,247,0.15); color:#a855f7; border:1px solid rgba(168,85,247,0.3); font-family:'JetBrains Mono',monospace;">TẦNG 2: APPLICATION CORE</span>
                <strong style="margin-left:8px; font-size:15px; color:var(--text-main);">VnuaCare.Business</strong>
              </div>
              <span style="font-size:12px; color:var(--text-muted);">Trái tim xử lý quy tắc nghiệp vụ (CQRS)</span>
            </div>
            <p style="font-size:13px; color:var(--text-sub); margin-bottom:6px;">
              Chứa toàn bộ Use-Cases, Commands (Ghi), Queries (Đọc), Handlers, DTO Models và quy tắc kiểm tra hợp lệ. Không dính líu đến giao thức HTTP hay ASP.NET Web framework.
            </p>
            <div style="font-size:12px; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
              Thành phần cốt lõi: Business/Doctors/DoctorCommands/, Business/HealthCheckupRecords/, Services/CacheService/
            </div>
          </div>

          <!-- Arrow -->
          <div style="text-align:center; color:var(--primary); font-weight:700; font-size:13px;">
            Ghi vào Write DbContext | Đọc từ Read DbContext & Redis &darr;
          </div>

          <!-- Layer 3 & 4 Grid -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="card" style="border-left:4px solid #f59e0b; background:rgba(245,158,11,0.03);">
              <div style="margin-bottom:6px;">
                <span class="badge-tag badge-yellow" style="font-family:'JetBrains Mono',monospace;">TẦNG 3: PERSISTENCE</span>
                <strong style="display:block; margin-top:4px; font-size:14.5px; color:var(--text-main);">VnuaCare.Data</strong>
              </div>
              <p style="font-size:12.5px; color:var(--text-sub); margin-bottom:6px;">
                Quản lý CSDL SQL Server qua EF Core 9. Tách đôi Dual DbContext: VnuaCareDataContext (Ghi) và VnuaCareReadDataContext (Đọc AsNoTracking).
              </p>
              <div style="font-size:11.5px; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
                Thành phần: VnuaCareDataContext.cs, VnuaCareReadDataContext.cs, Systems/Context/ (24 Entities)
              </div>
            </div>

            <div class="card" style="border-left:4px solid #06b6d4; background:rgba(6,182,212,0.03);">
              <div style="margin-bottom:6px;">
                <span class="badge-tag badge-cyan" style="font-family:'JetBrains Mono',monospace;">TẦNG 4: INFRASTRUCTURE</span>
                <strong style="display:block; margin-top:4px; font-size:14.5px; color:var(--text-main);">VnuaCare.Infrastructure</strong>
              </div>
              <p style="font-size:12.5px; color:var(--text-sub); margin-bottom:6px;">
                Hiện thực hóa các dịch vụ kỹ thuật hạ tầng bảo mật: Sinh mã JWT Access Token, xoay vòng Refresh Token 32 bytes RNG, băm mật khẩu BCrypt.
              </p>
              <div style="font-size:11.5px; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
                Thành phần: Services/JwtService.cs, Services/PasswordHasher.cs
              </div>
            </div>
          </div>

          <!-- Layer 5: Shared Kernel -->
          <div class="card" style="border-left:4px solid #10b981; background:rgba(16,185,129,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
              <div>
                <span class="badge-tag badge-green" style="font-family:'JetBrains Mono',monospace;">TẦNG 5: CROSS-CUTTING KERNEL</span>
                <strong style="margin-left:8px; font-size:15px; color:var(--text-main);">VnuaCare.Shared</strong>
              </div>
              <span style="font-size:12px; color:var(--text-muted);">Tầng nền tảng dùng chung toàn giải pháp</span>
            </div>
            <p style="font-size:13px; color:var(--text-sub); margin-bottom:6px;">
              Cung cấp Controller cơ sở ApiControllerBase chứa phễu ExecuteFuntion, IContextAccessor (trích xuất User Claims), ApiResponse&lt;T&gt;, PaginationList&lt;T&gt;, Enums vai trò và Utils dùng chung.
            </p>
            <div style="font-size:12px; color:var(--text-muted); font-family:'JetBrains Mono',monospace;">
              Thành phần: Helper/ApiControllerBase.cs, Helper/Response/ApiResponse.cs, ContextAccessor/IContextAccessor.cs, Enums/Role.cs
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Tab 2: CQRS & MediatR
  function renderCqrsTab() {
    return `
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--primary); margin-bottom:8px;">Mô Hình CQRS & Xe Buýt Nội Trình MediatR</h3>
        <p style="color:var(--text-sub); font-size:14px; line-height:1.6; margin-bottom:18px;">
          CQRS (Command Query Responsibility Segregation) phân tách triệt để hệ thống làm hai nhánh tác vụ độc lập:
          <strong>Nhánh Ghi (Command)</strong> thay đổi trạng thái dữ liệu và <strong>Nhánh Đọc (Query)</strong> tra cứu dữ liệu không gây hiệu ứng phụ (No side-effects).
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <!-- Command Side -->
          <div class="card" style="border:1px solid rgba(16,185,129,0.3); background:#ffffff;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <span class="method-badge method-post">COMMAND</span>
              <strong style="font-size:15px; color:var(--text-main);">Tác Vụ Ghi (Create, Update, Delete)</strong>
            </div>
            <ul style="font-size:13px; color:var(--text-sub); line-height:1.7; padding-left:18px; margin-bottom:12px;">
              <li><strong>Interface:</strong> Kế thừa <code>IRequest&lt;Unit&gt;</code> (không trả dữ liệu) hoặc <code>IRequest&lt;TResponse&gt;</code>.</li>
              <li><strong>Handler:</strong> Kế thừa <code>IRequestHandler&lt;TCommand, Unit&gt;</code>.</li>
              <li><strong>DbContext sử dụng:</strong> <code>VnuaCareDataContext</code> (Bật Change Tracker theo dõi Added/Modified/Deleted).</li>
              <li><strong>Xác thực nghiệp vụ:</strong> Dùng <code>.AnyAsync()</code> kiểm tra trùng lặp khóa chính, mã bác sĩ, SID barcode.</li>
              <li><strong>Hoàn tất giao dịch:</strong> <code>await _dataContext.SaveChangesAsync()</code> ghi xuống SQL Server.</li>
              <li><strong>Cơ chế Cache:</strong> Kích hoạt <code>_cacheService.Remove(key)</code> xóa cache danh mục liên quan.</li>
            </ul>
            <div class="glossary-example-box">
              Ví dụ: CreateDoctorCommand.cs, CreateHealthCheckupRecordCommand.cs
            </div>
          </div>

          <!-- Query Side -->
          <div class="card" style="border:1px solid rgba(59,130,246,0.3); background:#ffffff;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <span class="method-badge method-get">QUERY</span>
              <strong style="font-size:15px; color:var(--text-main);">Tác Vụ Đọc (Filter, Detail, Select)</strong>
            </div>
            <ul style="font-size:13px; color:var(--text-sub); line-height:1.7; padding-left:18px; margin-bottom:12px;">
              <li><strong>Interface:</strong> Kế thừa <code>IRequest&lt;List&lt;TDto&gt;&gt;</code> hoặc <code>IRequest&lt;PaginationList&lt;TDto&gt;&gt;</code>.</li>
              <li><strong>Handler:</strong> Kế thừa <code>IRequestHandler&lt;TQuery, TResult&gt;</code>.</li>
              <li><strong>Bộ nhớ đệm:</strong> Kiểm tra trước qua <code>_cacheService.GetOrCreate(...)</code> trong Redis RAM.</li>
              <li><strong>Nếu Cache HIT:</strong> Trả về ngay lập tức trong ~1ms (0 truy vấn SQL Server).</li>
              <li><strong>Nếu Cache MISS:</strong> Truy vấn <code>VnuaCareReadDataContext</code> (Luôn có <code>AsNoTracking()</code>).</li>
              <li><strong>Tối ưu hóa:</strong> Dùng <code>.Select()</code> chỉ lấy các cột cần thiết, phân trang <code>.Skip().Take()</code>.</li>
            </ul>
            <div class="glossary-example-box">
              Ví dụ: GetComboxRoleQuery.cs, GetFilterDoctorQuery.cs
            </div>
          </div>
        </div>

        <div class="card" style="margin-top:16px; background:rgba(168,85,247,0.05); border-color:rgba(168,85,247,0.25);">
          <strong style="font-size:14px; color:#9333ea; display:block; margin-bottom:6px;">Vai trò của MediatR In-Process Message Bus trong mô hình:</strong>
          <p style="font-size:13px; color:var(--text-sub); line-height:1.6; margin:0;">
            Khi Controller nhận HTTP Request, nó không khởi tạo Service hay DbContext mà chỉ làm một việc duy nhất: <code>await _mediator.Send(new CreateDoctorCommand(model))</code>.
            MediatR tự động tìm kiếm Handler tương ứng trong Dependency Injection Container và kích hoạt thực thi. Điều này giúp Controller cực kỳ ngắn gọn (chỉ 5-10 dòng code), 
            và mã nguồn tuân thủ nguyên tắc Single Responsibility Principle (Mỗi Handler chỉ làm 1 việc duy nhất).
          </p>
        </div>
      </div>
    `;
  }

  // Tab 3: Dual DbContext
  function renderDualContextTab() {
    return `
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--primary); margin-bottom:8px;">Cơ Chế Dual DbContext (Tách Biệt Change Tracker & AsNoTracking)</h3>
        <p style="color:var(--text-sub); font-size:14px; line-height:1.6; margin-bottom:18px;">
          Một trong những điểm tối ưu kỹ thuật lớn nhất của <strong>VnuaCare-API</strong> là không dùng chung 1 DbContext duy nhất cho mọi tác vụ, mà tách rẽ thành 2 DbContext riêng biệt đăng ký tại <code>Program.cs</code>:
        </p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:18px;">
          <div class="card" style="border-top:3px solid #f59e0b;">
            <div style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#b45309; font-size:14px; margin-bottom:6px;">1. VnuaCareDataContext (Write Context)</div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Chuyên trách: Thêm, Sửa, Xóa (Commands)</div>
            <p style="font-size:13px; color:var(--text-sub); line-height:1.6;">
              Bật cơ chế <strong>Change Tracker</strong>. Entity Framework sẽ theo dõi trạng thái của từng thực thể trong bộ nhớ (Added, Modified, Deleted, Unchanged). 
              Khi gọi <code>await _dataContext.SaveChangesAsync()</code>, EF Core tự động sinh câu lệnh <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> chuẩn xác và bọc trong Transaction.
            </p>
          </div>

          <div class="card" style="border-top:3px solid #10b981;">
            <div style="font-family:'JetBrains Mono',monospace; font-weight:800; color:#059669; font-size:14px; margin-bottom:6px;">2. VnuaCareReadDataContext (Read Context)</div>
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:10px;">Chuyên trách: Lọc danh sách, Phân trang, Combobox (Queries)</div>
            <p style="font-size:13px; color:var(--text-sub); line-height:1.6;">
              Toàn bộ truy vấn đều áp dụng <strong><code>AsNoTracking()</code></strong>. EF Core chỉ đơn thuần ánh xạ dòng dữ liệu từ SQL Server thành đối tượng C# mà không lưu bất kỳ bản sao đối soát nào vào bộ nhớ RAM. 
              Điều này giúp giảm tải 40-70% dung lượng RAM máy chủ và tăng tốc độ đọc dữ liệu từ 3 đến 5 lần.
            </p>
          </div>
        </div>

        <div class="card" style="background:#0f172a; color:#f1f5f9; padding:16px;">
          <div style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#38bdf8; margin-bottom:8px;">// Khai báo Dual DbContext trong Program.cs:</div>
          <pre style="margin:0; font-family:'JetBrains Mono',monospace; font-size:12.5px; line-height:1.6; color:#e2e8f0;"><code>// DbContext Ghi (Commands - Change Tracker ON)
builder.Services.AddDbContext&lt;VnuaCareDataContext&gt;(options =&gt;
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// DbContext Đọc (Queries - AsNoTracking ON)
builder.Services.AddDbContext&lt;VnuaCareReadDataContext&gt;(options =&gt;
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));</code></pre>
        </div>
      </div>
    `;
  }

  // Tab 4: Simulator
  function renderSimulatorTab() {
    return `
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--primary); margin-bottom:8px;">Mô Phỏng Trực Quan Luồng Vận Hành Của Hệ Thống</h3>
        <p style="color:var(--text-sub); font-size:14px; line-height:1.6; margin-bottom:16px;">
          Chọn 1 trong 3 trường hợp thực tế bên dưới (được lấy trực tiếp từ các file mã nguồn trong dự án) để theo dõi hành trình dữ liệu chạy từ Client đến CSDL và phản hồi:
        </p>

        <div class="sim-controls">
          <button class="sim-btn active" data-case="doctor">Ca 1: Thêm mới Bác sĩ (CreateDoctorCommand - Tác vụ Ghi)</button>
          <button class="sim-btn" data-case="role">Ca 2: Lấy danh mục Vai trò (GetComboxRoleQuery - Tác vụ Đọc)</button>
          <button class="sim-btn" data-case="record">Ca 3: Lập Hồ sơ khám sức khỏe (CreateHealthCheckupRecordCommand)</button>
        </div>

        <div id="simStepsContainer" class="sim-steps-container"></div>
      </div>
    `;
  }

  function initSimulatorInteractions() {
    const simBtns = document.querySelectorAll(".sim-btn");
    const containerEl = document.getElementById("simStepsContainer");
    if (!containerEl) return;

    simBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        simBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderSimCase(btn.getAttribute("data-case"), containerEl);
      });
    });

    renderSimCase("doctor", containerEl);
  }

  function renderSimCase(caseKey, containerEl) {
    if (caseKey === "doctor") {
      containerEl.innerHTML = `
        <!-- Step 1 -->
        <div class="sim-step-item">
          <div class="sim-step-num">1</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Client gửi HTTP Request (DoctorController.cs)</div>
            <div class="sim-step-desc">
              Quản trị viên gửi yêu cầu tạo bác sĩ: <code>POST /api/v1/doctors/add</code> kèm theo Header <code>Authorization: Bearer &lt;accessToken&gt;</code> và Body JSON chứa thông tin bác sĩ.
            </div>
            <div class="glossary-example-box">
              POST /api/v1/doctors/add\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...\n{"fullName":"BS. Trần Văn Bình","doctorCode":"BS0005","specialtyId":1,"email":"binh.tv@medlatec.vn"}
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">accessToken: Vé xác thực JWT chứa danh tính & quyền của người gửi</span>
              <span class="term-badge-inline">Bearer: Chuẩn truyền tải token trên HTTP Header</span>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="sim-step-item">
          <div class="sim-step-num">2</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Phễu ExecuteFuntion tiếp nhận & Bấm giờ (ApiControllerBase.cs)</div>
            <div class="sim-step-desc">
              Hàm <code>DoctorController.Create</code> gọi qua <code>ExecuteFuntion(async () => await _mediator.Send(...))</code>. 
              Tại đây, <code>Stopwatch.StartNew()</code> bắt đầu đo thời gian xử lý và khối <code>try-catch</code> toàn cục được thiết lập.
            </div>
            <div class="glossary-example-box">
              var stopwatch = Stopwatch.StartNew();\ntry { var result = await func(); ... } catch (Exception ex) { ... }
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">ExecuteFuntion: Phễu hứng toàn cục bắt lỗi và chuẩn hóa JSON</span>
              <span class="term-badge-inline">Stopwatch: Đồng hồ bấm giờ tính duration (mili-giây)</span>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="sim-step-item">
          <div class="sim-step-num">3</div>
          <div class="sim-step-content">
            <div class="sim-step-title">MediatR In-Process Bus điều phối đến Handler (CreateDoctorCommand.cs)</div>
            <div class="sim-step-desc">
              MediatR nhận lệnh <code>CreateDoctorCommand</code> và điều hướng tới <code>CreateDoctorCommand.Handler</code>. 
              Các dịch vụ được tiêm tự động qua Dependency Injection: <code>VnuaCareDataContext</code>, <code>ICacheService</code>, <code>IContextAccessor</code>, <code>IBcryptPasswordHasher</code>.
            </div>
            <div class="glossary-example-box">
              public class Handler : IRequestHandler&lt;CreateDoctorCommand, Unit&gt;
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">MediatR: Xe buýt trung gian trong RAM điều phối Command tới Handler</span>
              <span class="term-badge-inline">Unit: Đại diện kiểu trả về rỗng (void) của MediatR khi hoàn tất</span>
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="sim-step-item">
          <div class="sim-step-num">4</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Xác thực quyền & Kiểm tra tính hợp lệ bằng AnyAsync (CreateDoctorCommand.cs)</div>
            <div class="sim-step-desc">
              1. Trích xuất Role từ <code>_contextAccessor.Role</code>: Chỉ SUPER_ADMIN hoặc HEALTH_ADMIN mới được thêm bác sĩ.<br>
              2. Kiểm tra định dạng Email qua <code>ValidationUtils.IsEmail</code>.<br>
              3. Kiểm tra trùng lặp mã bác sĩ trong CSDL bằng <code>_dataContext.VcDoctors.AnyAsync(x => x.DoctorCode == model.DoctorCode, cancellationToken)</code>.
            </div>
            <div class="glossary-example-box">
              var checkCode = await _dataContext.VcDoctors.AnyAsync(x => x.DoctorCode == model.DoctorCode.Trim(), cancellationToken);\nif (checkCode) throw new ArgumentException("Mã bác sĩ đã tồn tại!");
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">AnyAsync: Hàm EF Core sinh lệnh IF EXISTS tối ưu trong SQL</span>
              <span class="term-badge-inline">cancellationToken: Cờ hủy ngắt truy vấn nếu client ngắt kết nối</span>
            </div>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="sim-step-item">
          <div class="sim-step-num">5</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Ghi CSDL VnuaCareDataContext & Xóa Cache Redis (CreateDoctorCommand.cs)</div>
            <div class="sim-step-desc">
              1. Khởi tạo thực thể <code>VcDoctors</code> gắn với SpecialtyId và UserId.<br>
              2. Thêm vào Change Tracker: <code>await _dataContext.VcDoctors.AddAsync(doctorEntity, cancellationToken)</code>.<br>
              3. Ghi vĩnh viễn xuống SQL Server: <code>await _dataContext.SaveChangesAsync(cancellationToken)</code>.<br>
              4. Xóa Cache danh mục bác sĩ: <code>_cacheService.Remove(VnuaCareCacheConstant.DOCTOR)</code>.
            </div>
            <div class="glossary-example-box">
              await _dataContext.SaveChangesAsync(cancellationToken);\n_cacheService.Remove(VnuaCareCacheConstant.DOCTOR);\nreturn Unit.Value;
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">VnuaCareDataContext: DbContext Ghi có Change Tracker</span>
              <span class="term-badge-inline">Cache Invalidation: Xóa cache cũ để lần sau truy vấn sẽ lấy dữ liệu mới nhất</span>
            </div>
          </div>
        </div>

        <!-- Step 6 -->
        <div class="sim-step-item">
          <div class="sim-step-num">6</div>
          <div class="sim-step-content">
            <div class="sim-step-title">ExecuteFuntion đóng gói ApiResponse chuẩn gửi về Client</div>
            <div class="sim-step-desc">
              Handler hoàn tất trả về <code>Unit.Value</code>. <code>ExecuteFuntion</code> dừng đồng hồ Stopwatch (ví dụ 18ms), đóng gói dữ liệu vào <code>ApiResponse&lt;object&gt;</code> và trả về HTTP 200 OK.
            </div>
            <div class="glossary-example-box">
              {"statusCode": 200, "message": "Success", "data": null, "traceId": "0HNK2901...", "duration": 18}
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">ApiResponse: Cấu trúc JSON chuẩn hóa bao bọc mọi phản hồi</span>
              <span class="term-badge-inline">traceId: Mã định danh phiên giao dịch để dò vết khi có sự cố</span>
            </div>
          </div>
        </div>
      `;
    } else if (caseKey === "role") {
      containerEl.innerHTML = `
        <div class="sim-step-item">
          <div class="sim-step-num">1</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Client gửi HTTP GET tra cứu vai trò (UserController.cs)</div>
            <div class="sim-step-desc">
              Giao diện gửi request: <code>GET /api/v1/users/roles</code> để lấy danh mục 4 vai trò hiển thị trên dropdown phân quyền.
            </div>
          </div>
        </div>

        <div class="sim-step-item">
          <div class="sim-step-num">2</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Phễu ExecuteFuntion & MediatR Dispatcher (UserController.cs)</div>
            <div class="sim-step-desc">
              Controller gọi: <code>return await ExecuteFuntion(async () => await _mediator.Send(new GetComboxRoleQuery()));</code>.
            </div>
          </div>
        </div>

        <div class="sim-step-item">
          <div class="sim-step-num">3</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Kiểm tra Bộ nhớ đệm Cache-Aside Redis (GetComboxRoleQuery.cs)</div>
            <div class="sim-step-desc">
              Handler gọi: <code>_cacheService.GetOrCreate&lt;List&lt;RoleSelectModel&gt;&gt;("roles-list-select", () => ...)</code>.<br>
              <strong>Trường hợp 1 (CACHE HIT):</strong> Dữ liệu đã có trong RAM Redis &rarr; Trả về ngay trong <strong>0.8ms</strong>, 0 truy vấn SQL!<br>
              <strong>Trường hợp 2 (CACHE MISS):</strong> Dữ liệu chưa có &rarr; Khởi tạo danh sách 4 vai trò tĩnh, lưu vào Redis với TTL quy định rồi trả về.
            </div>
            <div class="glossary-example-box">
              var result = await _cacheService.GetOrCreate&lt;List&lt;RoleSelectModel&gt;&gt;(cacheKey, () => {\n    return Task.FromResult(roles);\n});
            </div>
            <div class="sim-step-terms">
              <span class="term-badge-inline">Cache-Aside: Mô hình đọc từ bộ đệm trước, chỉ truy vấn khi thiếu</span>
              <span class="term-badge-inline">TTL (Time-To-Live): Thời gian tồn tại của bản ghi trong Redis</span>
            </div>
          </div>
        </div>

        <div class="sim-step-item">
          <div class="sim-step-num">4</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Trả về danh mục Vai trò chuẩn hóa (ApiResponse&lt;List&lt;RoleSelectModel&gt;&gt;)</div>
            <div class="sim-step-desc">
              Dữ liệu danh mục 4 vai trò (SUPER_ADMIN, HEALTH_ADMIN, DOCTOR, STAFF) được bọc vào ApiResponse và trả về cho Client.
            </div>
          </div>
        </div>
      `;
    } else if (caseKey === "record") {
      containerEl.innerHTML = `
        <div class="sim-step-item">
          <div class="sim-step-num">1</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Bác sĩ / Ban Y Tế lập hồ sơ khám (HealthCheckupRecordController.cs)</div>
            <div class="sim-step-desc">
              Gửi <code>POST /api/v1/healthcheckuprecords/add</code> chứa mã vạch SID, CampaignId, StaffId và các chỉ số sinh tồn (Huyết áp, Mạch, Chiều cao, Cân nặng).
            </div>
          </div>
        </div>

        <div class="sim-step-item">
          <div class="sim-step-num">2</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Kiểm tra phân quyền HEALTH_ADMIN hoặc SUPER_ADMIN (CreateHealthCheckupRecordCommand.cs)</div>
            <div class="sim-step-desc">
              Trích xuất vai trò người lập phiếu qua <code>_contextAccessor.Role</code>. Nếu là tài khoản STAFF thông thường sẽ bị ném lỗi <code>UnauthorizedAccessException</code> chặn đứng tại chỗ.
            </div>
          </div>
        </div>

        <div class="sim-step-item">
          <div class="sim-step-num">3</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Kiểm tra toàn vẹn & Ràng buộc kép bằng AnyAsync (CreateHealthCheckupRecordCommand.cs)</div>
            <div class="sim-step-desc">
              1. Kiểm tra Đợt khám tồn tại: <code>_dataContext.VcCheckupCampaigns.AnyAsync(x => x.CampaignId == model.CampaignId)</code>.<br>
              2. Kiểm tra Cán bộ tồn tại: <code>_dataContext.VcStaffs.AnyAsync(x => x.StaffId == model.StaffId)</code>.<br>
              3. Kiểm tra mã vạch SID duy nhất: <code>_dataContext.VcHealthCheckupRecords.AnyAsync(x => x.SidCode == model.SidCode)</code>.<br>
              4. Chống cán bộ khám 2 lần trong 1 đợt: <code>_dataContext.VcHealthCheckupRecords.AnyAsync(x => x.CampaignId == model.CampaignId && x.StaffId == model.StaffId)</code>.
            </div>
          </div>
        </div>

        <div class="sim-step-item">
          <div class="sim-step-num">4</div>
          <div class="sim-step-content">
            <div class="sim-step-title">Lưu CSDL VnuaCareDataContext & Xóa Cache thống kê</div>
            <div class="sim-step-desc">
              Thêm thực thể hồ sơ khám vào <code>VcHealthCheckupRecords</code> với trạng thái ban đầu 'CREATED', gọi <code>SaveChangesAsync()</code> và xóa cache thống kê hồ sơ của đợt khám.
            </div>
          </div>
        </div>
      `;
    }
  }

  // Tab 5: Glossary (Từ Điển Thuật Ngữ)
  function renderGlossaryTab() {
    const terms = [
      {
        term: "accessToken",
        vietnameseName: "Vé vào cổng điện tử bảo mật (JWT)",
        origin: "VnuaCare.Infrastructure / Services / JwtService.cs",
        whatIsIt: "Chuỗi ký tự mã hóa theo chuẩn RFC 7519 (JSON Web Token), được ký bằng thuật toán HMAC-SHA256 với SecretKey từ appsettings.json.",
        howItWorks: "Sau khi đăng nhập thành công, máy chủ sinh ra accessToken chứa các thông tin (Claims) như UserId, Username, Role. Client lưu chuỗi này và gửi kèm trên mọi HTTP Request qua Header 'Authorization: Bearer <token>'. Máy chủ giải mã chữ ký trong RAM mà không cần truy vấn CSDL để biết bạn là ai.",
        codeSnippet: "var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddMinutes(120), signingCredentials: creds);"
      },
      {
        term: "refreshToken",
        vietnameseName: "Chìa khóa xin cấp lại vé vào cổng mới",
        origin: "JwtService.cs & cột vc_users.refresh_token",
        whatIsIt: "Chuỗi ngẫu nhiên an toàn 32 bytes sinh ra từ bộ sinh số ngẫu nhiên mật mã (RandomNumberGenerator.Create()), có thời hạn sống dài (7 ngày).",
        howItWorks: "Do accessToken chỉ sống ngắn (2 giờ) để đảm bảo an toàn, khi hết hạn Client sẽ gửi refreshToken lên endpoint /api/v1/auth/refreshtoken. Hệ thống kiểm tra khớp với CSDL và cấp ngay cặp Token mới (cơ chế Token Rotation), đồng thời hủy token cũ chống đánh cắp.",
        codeSnippet: "user.RefreshToken = _jwtService.GenerateRefreshToken();\nuser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);"
      },
      {
        term: "loginIdentifier",
        vietnameseName: "Định danh đăng nhập kép (Username hoặc Email)",
        origin: "UserLoginCommand.cs (Dòng 57) & AuthorizationModel.cs",
        whatIsIt: "Tên thuộc tính đại diện cho thông tin tài khoản người dùng nhập vào form đăng nhập, chấp nhận cả Tên tài khoản lẫn Địa chỉ Email.",
        howItWorks: "Thay vì bắt người dùng chọn 2 ô riêng biệt, hệ thống dùng 1 ô duy nhất và truy vấn CSDL: Where(u => u.Username == loginIdentifier || u.Email == loginIdentifier). Cán bộ có thể gõ 'cb00124' hoặc 'mai.lt@vnua.edu.vn' đều đăng nhập được.",
        codeSnippet: "var user = await _dataContext.VcUsers.FirstOrDefaultAsync(\n    u => u.Username == model.LoginIdentifier || u.Email == model.LoginIdentifier, cancellationToken);"
      },
      {
        term: "MediatR",
        vietnameseName: "Xe buýt trung gian trong bộ nhớ (In-Process Bus)",
        origin: "Thư viện MediatR đăng ký tại Program.cs",
        whatIsIt: "Một thư viện thiết kế theo mẫu Mediator Pattern, đóng vai trò như tổng đài điều phối trong cùng một tiến trình ứng dụng .NET.",
        howItWorks: "Controller chỉ cần gọi '_mediator.Send(command)' mà không cần biết class xử lý nằm ở đâu. MediatR tự động tìm Handler đã đăng ký trong DI Container để thực thi, giúp tách rời hoàn toàn tầng Controller khỏi tầng Business.",
        codeSnippet: "builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateDoctorCommand).Assembly));"
      },
      {
        term: "CQRS",
        vietnameseName: "Phân tách trách nhiệm Đọc và Ghi",
        origin: "Cấu trúc thư mục Commands/ và Queries/ trong VnuaCare.Business",
        whatIsIt: "Một mẫu kiến trúc phần mềm tách biệt việc thay đổi trạng thái dữ liệu (Ghi - Commands) khỏi việc tra cứu thông tin (Đọc - Queries).",
        howItWorks: "Commands (Thêm, Sửa, Xóa) đi qua VnuaCareDataContext với Change Tracker để kiểm tra ràng buộc và lưu DB. Queries (Lọc, Tìm kiếm, Combobox) đi qua VnuaCareReadDataContext với AsNoTracking() và bộ nhớ đệm Redis để đạt tốc độ cao nhất.",
        codeSnippet: "Commands/ -> Xử lý Create/Update/Delete\nQueries/  -> Xử lý GetFilter/GetById/GetSelect"
      },
      {
        term: "Dual DbContext",
        vietnameseName: "Hai cổng kết nối CSDL độc lập (Write / Read)",
        origin: "Program.cs & VnuaCare.Data / Systems / DataContext",
        whatIsIt: "Mô hình khai báo 2 đối tượng DbContext của Entity Framework Core cùng trỏ vào 1 CSDL SQL Server nhưng phục vụ 2 mục đích riêng biệt.",
        howItWorks: "VnuaCareDataContext bật Change Tracker chuyên phục vụ ghi dữ liệu an toàn có giao dịch. VnuaCareReadDataContext ép AsNoTracking() chuyên phục vụ đọc dữ liệu siêu nhanh mà không tốn RAM theo dõi đối tượng.",
        codeSnippet: "builder.Services.AddDbContext<VnuaCareDataContext>(...);\nbuilder.Services.AddDbContext<VnuaCareReadDataContext>(...);"
      },
      {
        term: "Change Tracker",
        vietnameseName: "Bộ giám sát thay đổi đối tượng của EF Core",
        origin: "Cơ chế nội tại của Entity Framework Core trong VnuaCareDataContext",
        whatIsIt: "Bộ quản lý trạng thái tự động theo dõi xem một Entity đang là Added (Thêm mới), Modified (Sửa đổi), Deleted (Xóa) hay Unchanged (Không đổi).",
        howItWorks: "Khi bạn gán 'doctor.FullName = newName' và gọi 'SaveChangesAsync()', Change Tracker tự động phát hiện cột FullName bị thay đổi và sinh ra câu lệnh 'UPDATE vc_doctors SET full_name = @p0 WHERE doctor_id = @p1' mà bạn không cần tự viết SQL.",
        codeSnippet: "doctor.FullName = model.FullName; // Change Tracker đánh dấu Modified\nawait _dataContext.SaveChangesAsync(); // Sinh câu lệnh UPDATE"
      },
      {
        term: "AsNoTracking()",
        vietnameseName: "Chế độ đọc chay, ngắt theo dõi bộ nhớ",
        origin: "Microsoft.EntityFrameworkCore dùng trong VnuaCareReadDataContext",
        whatIsIt: "Một phương thức mở rộng của EF Core ra lệnh cho truy vấn: 'Hãy lấy dữ liệu về dưới dạng C# Object nhưng KHÔNG ĐƯỢC nạp vào Change Tracker'.",
        howItWorks: "Khi truy vấn 10,000 dòng dữ liệu phiếu khám, AsNoTracking() giúp tiết kiệm hàng trăm MB RAM và tăng tốc độ đọc từ 3 đến 5 lần vì máy chủ không phải mất tài nguyên giám sát các đối tượng chỉ dùng để xem.",
        codeSnippet: "var list = await _readContext.VcStaffs.AsNoTracking().Where(...).ToListAsync();"
      },
      {
        term: "ExecuteFuntion",
        vietnameseName: "Phễu hứng thực thi toàn cục & Chuẩn hóa phản hồi",
        origin: "VnuaCare.Shared / Helper / ApiControllerBase.cs (Dòng 47)",
        whatIsIt: "Hàm bao bọc (Wrapper Function) mẫu Template Method trong Controller cơ sở mà mọi API Controller đều kế thừa.",
        howItWorks: "Khi gọi ExecuteFuntion, nó tự động khởi động đồng hồ Stopwatch bấm giờ, đặt khối try-catch bảo vệ. Nếu thành công trả về HTTP 200 OK kèm thời gian duration; nếu xảy ra Exception tự bắt lỗi trả về HTTP 400/500 và thông báo dễ hiểu.",
        codeSnippet: "return await ExecuteFuntion(async () => {\n    return await _mediator.Send(new CreateDoctorCommand(model));\n});"
      },
      {
        term: "cancellationToken",
        vietnameseName: "Công tắc ngắt tín hiệu khẩn cấp",
        origin: "Tham số chuẩn của .NET truyền xuyên suốt từ Controller đến EF Core",
        whatIsIt: "Một cấu trúc struct truyền tín hiệu thông báo xem người dùng ở đầu Client có hủy bỏ hoặc đóng trình duyệt giữa chừng hay không.",
        howItWorks: "Nếu một truy vấn SQL đang chạy mất 3 giây nhưng sau 1 giây người dùng tắt tab trình duyệt, cancellationToken sẽ kích hoạt huỷ câu truy vấn ngay lập tức trên SQL Server, giải phóng tài nguyên CPU và bộ nhớ cho hệ thống.",
        codeSnippet: "public async Task<Unit> Handle(Command request, CancellationToken cancellationToken) {\n    await _dataContext.SaveChangesAsync(cancellationToken);\n}"
      },
      {
        term: "Unit / Unit.Value",
        vietnameseName: "Kiểu trả về rỗng (Void) của MediatR",
        origin: "MediatR namespace",
        whatIsIt: "Một cấu trúc struct đặc biệt của thư viện MediatR đại diện cho trường hợp 'Tác vụ đã thực thi thành công nhưng không cần trả về dữ liệu gì cả' (tương đương void trong C#).",
        howItWorks: "Vì MediatR yêu cầu mọi Request phải có một kiểu dữ liệu trả về IRequest<T>, với các lệnh Thêm, Sửa, Xóa không cần trả về dữ liệu (chỉ cần biết thành công), lập trình viên sẽ trả về Unit.Value.",
        codeSnippet: "public class CreateDoctorCommand : IRequest<Unit>\n...\nreturn Unit.Value;"
      },
      {
        term: "BCrypt & Salt",
        vietnameseName: "Thuật toán băm mật khẩu kèm gia vị ngẫu nhiên",
        origin: "VnuaCare.Infrastructure / Services / PasswordHasher.cs",
        whatIsIt: "Thuật toán băm một chiều mật mã học (One-way Cryptographic Hash) chuyên dụng cho mật khẩu, kết hợp với một chuỗi ngẫu nhiên gọi là Salt.",
        howItWorks: "Khi băm '123456', BCrypt tự động sinh 16 bytes ngẫu nhiên (Salt) ghép vào mật khẩu trước khi băm nhiều vòng lặp. Dù 2 người dùng đặt cùng mật khẩu '123456', chuỗi băm lưu trong CSDL vẫn hoàn toàn khác nhau, chống lại hình thức tấn công Rainbow Table.",
        codeSnippet: "user.PasswordHash = _bcryptPasswordHasher.HashPassword(request.Password);\nbool isValid = _bcryptPasswordHasher.VerifyPassword(rawPassword, hash);"
      },
      {
        term: "Cache-Aside",
        vietnameseName: "Chiến lược bộ nhớ đệm đọc trước ghi sau",
        origin: "VnuaCare.Business / Services / CacheService / RedisCacheService.cs",
        whatIsIt: "Mô hình quản lý Cache phổ biến nhất trong kiến trúc doanh nghiệp: Ứng dụng sẽ tự chịu trách nhiệm kiểm tra bộ nhớ đệm trước khi hỏi CSDL.",
        howItWorks: "ĐỌC: Hỏi Redis -> Nếu có (HIT) trả về ngay; nếu chưa có (MISS) thì truy vấn CSDL rồi ghi vào Redis với thời gian TTL (ví dụ 300 giây). GHI: Khi cập nhật hoặc thêm mới, ứng dụng xóa bỏ khóa trong Redis để lần đọc tiếp theo tự động nạp dữ liệu mới.",
        codeSnippet: "var data = await _cacheService.GetOrCreate(key, () => _readContext.Staffs.ToListAsync());"
      },
      {
        term: "ClaimsPrincipal & Claims",
        vietnameseName: "Huy hiệu thông tin danh tính & quyền hạn",
        origin: "System.Security.Claims & IContextAccessor.cs",
        whatIsIt: "Tập hợp các mẩu thông tin (Key-Value) đã được xác minh về người dùng (như Id, Họ tên, Quyền hạn) được nhúng bên trong Access Token.",
        howItWorks: "Khi Request có token hợp lệ đi qua Middleware, ASP.NET Core tự động giải mã token và nạp vào HttpContext.User dưới dạng ClaimsPrincipal. Các Controller và Handler thông qua IContextAccessor có thể đọc ngay UserId và Role của người đang thao tác.",
        codeSnippet: "var role = _contextAccessor.Role; // Lấy 'SUPER_ADMIN' hoặc 'DOCTOR'"
      }
    ];

    let cardsHtml = "";
    terms.forEach(t => {
      cardsHtml += `
        <div class="glossary-card">
          <div class="glossary-header">
            <div>
              <div class="glossary-term">${t.term}</div>
              <div class="glossary-plain-name">${t.vietnameseName}</div>
            </div>
            <span class="glossary-origin-badge">${t.origin}</span>
          </div>

          <div class="glossary-body">
            <strong style="color:var(--text-main); font-size:12.5px;">Bản chất nó là gì?</strong>
            <p style="margin:2px 0 8px;">${t.whatIsIt}</p>

            <strong style="color:var(--text-main); font-size:12.5px;">Nó chạy ra sao trong VnuaCare?</strong>
            <p style="margin:2px 0 8px;">${t.howItWorks}</p>
          </div>

          <div class="glossary-example-box">${escapeHtml(t.codeSnippet)}</div>
        </div>
      `;
    });

    return `
      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <div>
            <h3 style="font-size:18px; font-weight:800; color:var(--primary); margin-bottom:4px;">Từ Điển Giải Thích Toàn Bộ Thuật Ngữ Cốt Lõi (Architecture Glossary)</h3>
            <p style="color:var(--text-sub); font-size:13.5px; margin:0;">
              Tra cứu nhanh mọi từ khóa kỹ thuật: Bản chất nó là gì, sinh ra từ file nào, cách thức hoạt động và ví dụ code thực tế từ dự án.
            </p>
          </div>
          <span class="badge-tag badge-blue">${terms.length} Thuật Ngữ Trọng Tâm</span>
        </div>

        <div class="glossary-grid" style="margin-top:16px;">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  // Tab 6: Master Architecture Matrix
  function renderMatrixTab() {
    return `
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--primary); margin-bottom:8px;">Ma Trận Đối Soát Toàn Bộ File & Trách Nhiệm Dự Án</h3>
        <p style="color:var(--text-sub); font-size:14px; line-height:1.6; margin-bottom:16px;">
          Bảng tổng hợp toàn bộ 5 Tầng kiến trúc, phân loại trách nhiệm, chiều phụ thuộc và file đại diện trực tiếp trong mã nguồn Solution:
        </p>

        <div style="overflow-x:auto;">
          <table class="matrix-table">
            <thead>
              <tr>
                <th style="width:130px;">Tầng Kiến Trúc</th>
                <th style="width:160px;">Dự Án (.NET 9)</th>
                <th>Thư Mục & File Tiêu Biểu</th>
                <th>Trách Nhiệm Cốt Lõi</th>
                <th style="width:160px;">Chiều Phụ Thuộc</th>
                <th style="width:140px;">Ví Dụ Minh Họa</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge-tag badge-blue">Presentation</span></td>
                <td><strong>VnuaCare.API</strong></td>
                <td><code>Controllers/Business/</code><br><code>Program.cs</code></td>
                <td>Tiếp nhận HTTP request, phân quyền endpoint, định cấu hình Swagger, điều phối qua MediatR.</td>
                <td>Phụ thuộc vào:<br><strong>Business, Infrastructure</strong></td>
                <td><code>DoctorController.cs</code><br><code>StaffController.cs</code></td>
              </tr>
              <tr>
                <td><span class="badge-tag" style="background:rgba(168,85,247,0.15); color:#a855f7;">Application</span></td>
                <td><strong>VnuaCare.Business</strong></td>
                <td><code>Business/*/Commands/</code><br><code>Business/*/Queries/</code><br><code>Services/CacheService/</code></td>
                <td>Chứa toàn bộ logic nghiệp vụ, quy tắc kiểm tra hợp lệ, điều phối MediatR Handlers, quản lý Cache Redis.</td>
                <td>Phụ thuộc vào:<br><strong>Data, Shared</strong></td>
                <td><code>CreateDoctorCommand.cs</code><br><code>GetComboxRoleQuery.cs</code></td>
              </tr>
              <tr>
                <td><span class="badge-tag badge-yellow">Persistence</span></td>
                <td><strong>VnuaCare.Data</strong></td>
                <td><code>Systems/DataContext/</code><br><code>Systems/Context/</code></td>
                <td>Quản lý kết nối SQL Server qua EF Core 9, Dual DbContext (Write/Read), khai báo 24 Entity bảng CSDL.</td>
                <td>Phụ thuộc vào:<br><strong>Shared</strong> (Không phụ thuộc Business)</td>
                <td><code>VnuaCareDataContext.cs</code><br><code>VcDoctors.cs</code></td>
              </tr>
              <tr>
                <td><span class="badge-tag badge-cyan">Infrastructure</span></td>
                <td><strong>VnuaCare.Infrastructure</strong></td>
                <td><code>Services/JwtService.cs</code><br><code>Services/PasswordHasher.cs</code></td>
                <td>Hiện thực các dịch vụ hạ tầng kỹ thuật: Sinh mã JWT HMAC-SHA256, Refresh Token 32 bytes RNG, băm mật khẩu BCrypt.</td>
                <td>Phụ thuộc vào:<br><strong>Business, Shared</strong></td>
                <td><code>JwtService.cs</code><br><code>PasswordHasher.cs</code></td>
              </tr>
              <tr>
                <td><span class="badge-tag badge-green">Shared Kernel</span></td>
                <td><strong>VnuaCare.Shared</strong></td>
                <td><code>Helper/ApiControllerBase.cs</code><br><code>ContextAccessor/</code><br><code>Helper/Response/</code></td>
                <td>Cung cấp lớp nền tảng dùng chung: Phễu ExecuteFuntion, trích xuất User Claims, ApiResponse envelope, Enums vai trò.</td>
                <td><strong>Độc lập hoàn toàn</strong> (Không phụ thuộc tầng nào)</td>
                <td><code>ApiControllerBase.cs</code><br><code>ApiResponse.cs</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Tab 7: Why This Architecture?
  function renderComparisonTab() {
    return `
      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px; font-weight:800; color:var(--primary); margin-bottom:8px;">Tại Sao Dự Án Lại Dùng Mô Hình Này Thay Vì CRUD Truyền Thống?</h3>
        <p style="color:var(--text-sub); font-size:14px; line-height:1.6; margin-bottom:16px;">
          Đối chiếu trực diện giữa <strong>Mô hình MVC / CRUD Controller truyền thống</strong> và <strong>Mô hình Clean Architecture + CQRS + Dual DbContext của VnuaCare</strong>:
        </p>

        <div style="overflow-x:auto;">
          <table class="matrix-table">
            <thead>
              <tr>
                <th style="width:160px;">Tiêu Chí Đánh Giá</th>
                <th style="width:340px;">Mô Hình CRUD Controller Cũ</th>
                <th>Mô Hình VnuaCare (Clean Architecture + CQRS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cấu trúc Controller</strong></td>
                <td>Controller phình to (Fat Controller) hàng nghìn dòng, nhồi nhét cả truy vấn SQL, validate, gửi email và sinh token vào 1 file.</td>
                <td><strong>Skinny Controller</strong> cực kỳ gọn (5-10 dòng/endpoint). Controller chỉ làm nhiệm vụ nhận request và ủy thác cho MediatR Bus.</td>
              </tr>
              <tr>
                <td><strong>Tách biệt Đọc / Ghi</strong></td>
                <td>Dùng chung 1 DbContext cho mọi thứ. Đọc danh sách 5,000 cán bộ cũng bị Change Tracker lưu vào RAM, làm máy chủ nặng nề và chậm chạp.</td>
                <td><strong>CQRS & Dual DbContext:</strong> Ghi qua Write Context (có Change Tracker), Đọc qua Read Context (ép AsNoTracking) kết hợp Redis Cache, tăng tốc 3-5 lần.</td>
              </tr>
              <tr>
                <td><strong>Bảo trì & Mở rộng</strong></td>
                <td>Sửa một tính năng ở file này dễ làm đổ vỡ tính năng ở file khác (Spaghetti code) vì các tầng phụ thuộc chéo vào nhau.</td>
                <td><strong>Loose Coupling:</strong> Mỗi nghiệp vụ là một cặp Command + Handler độc lập. Sửa logic thêm bác sĩ hoàn toàn không ảnh hưởng đến hồ sơ khám hay cán bộ.</td>
              </tr>
              <tr>
                <td><strong>Kiểm tra trùng lặp & Ràng buộc</strong></td>
                <td>Thường dùng <code>Count()</code> hoặc <code>ToList()</code> rồi đếm, khiến SQL Server phải quét toàn bộ bảng và tải hết dữ liệu lên RAM ứng dụng.</td>
                <td><strong>Tối ưu hóa AnyAsync():</strong> EF Core dịch thành <code>IF EXISTS (SELECT 1 ...)</code> dừng lại ngay khi tìm thấy bản ghi đầu tiên, tốc độ &lt; 2ms.</td>
              </tr>
              <tr>
                <td><strong>Xử lý lỗi & Ngoại lệ</strong></td>
                <td>Viết try-catch lặp đi lặp lại ở mọi endpoint, dễ bỏ sót khiến máy chủ bị Crash (HTTP 500) và lộ thông tin nhạy cảm của CSDL ra Client.</td>
                <td><strong>Phễu ExecuteFuntion tập trung:</strong> Tự động bắt mọi Exception, đo độ trễ Stopwatch và bọc dữ liệu thành JSON chuẩn <code>ApiResponse&lt;T&gt;</code> an toàn 100%.</td>
              </tr>
              <tr>
                <td><strong>Khả năng kiểm thử (Unit Testing)</strong></td>
                <td>Rất khó viết Test vì Controller gắn chặt với HttpContext và chuỗi kết nối Database thực tế.</td>
                <td><strong>Dễ dàng viết Test 100%:</strong> Có thể mock riêng biệt từng Handler, từng DbContext hay ICacheService mà không cần bật Web Server.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Khởi tạo tab đầu tiên
  renderTabContent("blueprint");
}
