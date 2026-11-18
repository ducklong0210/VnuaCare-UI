// Tầng Model quản lý cấu hình và trạng thái mặc định của các chuyên khoa lẻ lâm sàng
// Định nghĩa CLINICAL_SPECIALTIES_CONFIG ánh xạ mã chuyên khoa với ID tương ứng trong bảng vc_specialties
// Cung cấp cấu trúc khởi tạo INITIAL_SPECIALIST_EXAM phục vụ việc reset form nhập liệu

export const CLINICAL_SPECIALTIES_CONFIG = [
  { code: 'EYE', specialtyId: 8, defaultName: 'Chuyên khoa Mắt', desc: 'Đo thị lực mắt trái, mắt phải có kính và không kính' },
  { code: 'ENT', specialtyId: 4, defaultName: 'Tai - Mũi - Họng', desc: 'Khám tai màng nhĩ, hốc mũi, niêm mạc họng và thanh quản' },
  { code: 'DENTAL', specialtyId: 9, defaultName: 'Răng - Hàm - Mặt', desc: 'Khám tình trạng răng sâu, nha chu, hàm trên và hàm dưới' },
  { code: 'DERMATOLOGY', specialtyId: 10, defaultName: 'Chuyên khoa Da liễu', desc: 'Khám các bệnh ngoài da, dị ứng, nấm da' },
  { code: 'SURGERY', specialtyId: 11, defaultName: 'Ngoại khoa tổng quát', desc: 'Khám vận động cơ xương, cột sống, trĩ, thoát vị bẹn' },
  { code: 'OBSTETRICS', specialtyId: 7, defaultName: 'Sản - Phụ khoa (Nữ)', desc: 'Khám phụ khoa định kỳ dành riêng cho cán bộ nữ' },
];

export const INITIAL_SPECIALIST_EXAM = {
  specialistExamId: null,
  specialtyType: 'EYE',
  visionLeftNoGlass: '',
  visionRightNoGlass: '',
  visionLeftGlass: '',
  visionRightGlass: '',
  upperJaw: '',
  lowerJaw: '',
  teethFormula: '',
  earLeftDesc: '',
  earRightDesc: '',
  noseDesc: '',
  throatDesc: '',
  skinDesc: '',
  surgicalDesc: '',
  obstetricDesc: '',
  conclusion: '',
  healthClass: '',
  examiningDoctorId: '',
  readingDoctorId: '',
  performedAt: '',
};
