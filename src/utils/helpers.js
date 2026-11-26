//
// Bộ hàm tiện ích dùng chung trên toàn hệ thống: định dạng ngày tháng, đánh giá chỉ số y tế và chuẩn hóa nhãn
// Dùng chung cho cả phân hệ Quản trị (Admin) và Cổng Cán bộ (Staff Portal)
//

// Định dạng chuỗi ngày từ API sang chuẩn Việt Nam DD/MM/YYYY (hiển thị trên bảng)
export function formatDate(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) {
    return '—';
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '—';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

// Định dạng chuỗi ngày giờ từ API sang chuẩn Việt Nam DD/MM/YYYY HH:mm (hiển thị thời gian gửi email)
export function formatDateTime(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) {
    return '—';
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '—';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return '—';
  }
}

// Chuyển chuỗi ngày từ API sang YYYY-MM-DD (để đổ vào ô <input type="date">)
export function toDateInputValue(dateStr) {
  if (!dateStr || dateStr.startsWith('0001-01-01')) {
    return '';
  }

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

// Đánh giá thể trạng theo chỉ số BMI (tiêu chuẩn WHO cho người châu Á)
export function evaluateBmi(bmiValue) {
  if (bmiValue === null || bmiValue === undefined || bmiValue === '' || isNaN(Number(bmiValue))) {
    return null;
  }

  const bmi = Number(bmiValue);
  if (bmi < 18.5) {
    return { text: 'Nhẹ cân / Thể lực gầy', tone: 'warning', tagClass: 'badge-warning' };
  }
  if (bmi < 23.0) {
    return { text: 'Bình thường / Cân đối', tone: 'success', tagClass: 'badge-success' };
  }
  if (bmi < 25.0) {
    return { text: 'Thừa cân / Tiền béo phì', tone: 'warning', tagClass: 'badge-warning' };
  }
  return { text: 'Béo phì / Cần theo dõi', tone: 'danger', tagClass: 'badge-danger' };
}

// Đánh giá phân loại mức huyết áp (tâm thu / tâm trương, đơn vị mmHg)
export function evaluateBloodPressure(systolic, diastolic) {
  const sys = Number(systolic) || 0;
  const dia = Number(diastolic) || 0;
  if (sys === 0 && dia === 0) {
    return null;
  }

  if (sys >= 140 || dia >= 90) {
    return { text: 'Tăng huyết áp', tone: 'danger', tagClass: 'badge-danger' };
  }
  if (sys >= 120 || dia >= 80) {
    return { text: 'Tiền tăng huyết áp', tone: 'warning', tagClass: 'badge-warning' };
  }
  if (sys < 90 || dia < 60) {
    return { text: 'Huyết áp thấp', tone: 'warning', tagClass: 'badge-warning' };
  }
  return { text: 'Huyết áp bình thường', tone: 'success', tagClass: 'badge-success' };
}

// Xác định cấp xếp loại sức khỏe theo chuẩn Bộ Y tế (Loại I -> Loại V, tránh Loại II nhận nhầm Loại III)
export function getClassificationMeta(classification) {
  const clean = (classification || '').trim();
  if (!clean) {
    return { label: 'Chưa xếp loại', tone: 'muted' };
  }

  if (/^Loại I(?:\s|\(|$)/.test(clean)) return { label: clean, tone: 'grade-1' };
  if (/^Loại II(?:\s|\(|$)/.test(clean)) return { label: clean, tone: 'grade-2' };
  if (/^Loại III(?:\s|\(|$)/.test(clean)) return { label: clean, tone: 'grade-3' };
  if (/^Loại IV(?:\s|\(|$)/.test(clean)) return { label: clean, tone: 'grade-4' };
  if (/^Loại V(?:\s|\(|$)/.test(clean)) return { label: clean, tone: 'grade-5' };

  return { label: clean, tone: 'muted' };
}

// Chuẩn hóa nhãn tiếng Việt và mã màu hiển thị trạng thái hồ sơ khám
export function getStatusMeta(status) {
  const code = (status || '').toUpperCase();
  if (code === 'COMPLETED') {
    return { label: 'Đã kết luận', tone: 'completed' };
  }
  if (code === 'IN_PROGRESS') {
    return { label: 'Đang khám', tone: 'in_progress' };
  }
  if (code === 'CANCELLED') {
    return { label: 'Đã hủy', tone: 'cancelled' };
  }
  return { label: 'Chờ khám', tone: 'pending' };
}
