//
// Model cấu hình danh mục các chuyên khoa lẻ lâm sàng và trạng thái form mặc định
// Ánh xạ mã chuyên khoa với specialtyId trong database và cung cấp INITIAL_SPECIALIST_EXAM để khởi tạo form
//

export const CLINICAL_SPECIALTIES_CONFIG = [
  { code: 'EYE', specialtyId: 8, defaultName: 'Chuyên khoa Mắt', desc: 'Đo thị lực mắt trái, mắt phải có kính và không kính' },
  { code: 'ENT', specialtyId: 4, defaultName: 'Tai - Mũi - Họng', desc: 'Khám tai màng nhĩ, hốc mũi, niêm mạc họng và thanh quản' },
  { code: 'DENTAL', specialtyId: 9, defaultName: 'Răng - Hàm - Mặt', desc: 'Khám tình trạng răng sâu, nha chu, hàm trên và hàm dưới' },
  { code: 'DERMATOLOGY', specialtyId: 10, defaultName: 'Chuyên khoa Da liễu', desc: 'Khám các bệnh ngoài da, dị ứng, nấm da' },
  { code: 'SURGERY', specialtyId: 11, defaultName: 'Ngoại khoa tổng quát', desc: 'Khám vận động cơ xương, cột sống, trĩ, thoát vị bẹn' },
  { code: 'OBSTETRICS', specialtyId: 7, defaultName: 'Sản - Phụ khoa (Nữ)', desc: 'Khám phụ khoa định kỳ dành riêng cho cán bộ nữ' },
];

export const INITIAL_SPECIALIST_EXAM = {
  specialistExamId: null, // Mã phiếu khám
  specialtyType: 'EYE', // Loại chuyên khoa
  visionLeftNoGlass: '', // Mắt trái không kính
  visionRightNoGlass: '', // Mắt phải không kính
  visionLeftGlass: '', // Mắt trái có kính
  visionRightGlass: '', // Mắt phải có kính
  upperJaw: '', // Hàm trên
  lowerJaw: '', // Hàm dưới
  teethFormula: '', // Công thức răng
  earLeftDesc: '', // Tai trái
  earRightDesc: '', // Tai phải
  noseDesc: '', // Mũi
  throatDesc: '', // Họng
  skinDesc: '', // Da liễu
  surgicalDesc: '', // Ngoại khoa
  obstetricDesc: '', // Sản phụ khoa
  conclusion: '', // Kết luận
  healthClass: '', // Xếp loại sức khỏe
  examiningDoctorId: '', // Bác sĩ khám
  readingDoctorId: '', // Bác sĩ đọc kết quả
  performedAt: '', // Thời gian khám
};
