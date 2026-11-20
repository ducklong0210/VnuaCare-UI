// Tab 2: Khám nội khoa tổng quát cho cán bộ và nhân viên
// Đánh giá chi tiết 6 hệ cơ quan: tuần hoàn, hô hấp, tiêu hóa, tiết niệu, cơ xương khớp, thần kinh
// Bác sĩ nhập mô tả từng hệ cơ quan, ghi nhận kết luận chung và xếp loại sức khỏe chuyên khoa nội

import { useEffect, useState } from 'react';
import {
  getInternalMedicineApi,
  createInternalMedicineExamApi,
  updateInternalMedicineExamApi,
} from '../../../../api/internalMedicineApi.js';
import { IconCheck, IconRefreshCw } from '../../../SupportAgent/Icons.jsx';
const INITIAL_INTERNAL_EXAM = {
  internalExamId: null,
  circulatoryDesc: '',
  respiratoryDesc: '',
  digestiveDesc: '',
  urinaryDesc: '',
  musculoskeletalDesc: '',
  neurologicalDesc: '',
  conclusion: '',
  healthClass: '',
  examiningDoctorId: '',
};

export default function InternalMedicineTab({ recordId, doctorsList = [], classifications = [], showToast }) {
  const [formData, setFormData] = useState(INITIAL_INTERNAL_EXAM); // Đối tượng dữ liệu biểu mẫu khám nội khoa 6 hệ cơ quan
  const [loading, setLoading] = useState(false); // trạng thái đang tải dữ liệu
  const [saving, setSaving] = useState(false); // trạng thái đang lưu dữ liệu
  const [message, setMessage] = useState(''); // thông báo
  const [error, setError] = useState(''); // lỗi

  // Tải kết quả khám nội khoa theo ID hồ sơ
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (!recordId) return;
      setLoading(true);
      setError('');

      try {
        const data = await getInternalMedicineApi(recordId);
        if (!isCancelled && data) {
          setFormData({
            internalExamId: data.internalExamId || null,
            circulatoryDesc: data.circulatoryDesc || '',
            respiratoryDesc: data.respiratoryDesc || '',
            digestiveDesc: data.digestiveDesc || '',
            urinaryDesc: data.urinaryDesc || '',
            musculoskeletalDesc: data.musculoskeletalDesc || '',
            neurologicalDesc: data.neurologicalDesc || '',
            conclusion: data.conclusion || '',
            healthClass: data.healthClass || '',
            examiningDoctorId: data.examiningDoctorId ? String(data.examiningDoctorId) : '',
          });
        }
      } catch {
        if (!isCancelled) {
          setError('Không thể tải dữ liệu khám nội khoa');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [recordId]);

  // Lưu kết quả khám nội khoa lên API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        recordId: Number(recordId),
        internalExamId: formData.internalExamId ? Number(formData.internalExamId) : undefined,
        circulatoryDesc: formData.circulatoryDesc.trim() || null,
        respiratoryDesc: formData.respiratoryDesc.trim() || null,
        digestiveDesc: formData.digestiveDesc.trim() || null,
        urinaryDesc: formData.urinaryDesc.trim() || null,
        musculoskeletalDesc: formData.musculoskeletalDesc.trim() || null,
        neurologicalDesc: formData.neurologicalDesc.trim() || null,
        conclusion: formData.conclusion.trim() || null,
        healthClass: formData.healthClass || null,
        examiningDoctorId: formData.examiningDoctorId ? Number(formData.examiningDoctorId) : null,
      };

      if (formData.internalExamId) {
        await updateInternalMedicineExamApi(payload);
      } else {
        await createInternalMedicineExamApi(payload);
      }
      setMessage('Đã lưu kết quả khám lâm sàng nội khoa thành công!');
      if (showToast) showToast('Đã lưu kết quả khám nội khoa thành công!');
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu kết quả khám nội');
    } finally {
      setSaving(false);
    }
  };

  let submitText = 'Lưu kết quả khám nội';
  if (saving) {
    submitText = 'Đang lưu...';
  }

  const relevantDoctors = doctorsList.filter((doc) => doc.specialtyId === 1);
  const otherDoctors = doctorsList.filter((doc) => doc.specialtyId !== 1);

  if (loading) {
    return (
      <div className="tab-loading-box">
        <IconRefreshCw size={20} className="spinning-icon" />
        <span>Đang tải kết quả khám nội khoa...</span>
      </div>
    );
  }

  return (
    <form className="exam-tab-pane" onSubmit={handleSubmit}>
      <div className="tab-pane-header">
        <div>
          <h3 className="tab-pane-title">Phiếu Khám Lâm Sàng Nội Khoa Tổng Quát</h3>
          <p className="tab-pane-desc">Đánh giá 6 hệ cơ quan chính trong cơ thể theo tiêu chuẩn Bộ Y tế</p>
        </div>
      </div>

      {error && <div className="alert-tag danger mb-12">{error}</div>}
      {message && (
        <div className="alert-tag success mb-12">
          <IconCheck size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Các hệ cơ quan nội khoa */}
      <div className="exam-section-block">
        <div className="exam-block-title">Khám lâm sàng 6 hệ cơ quan</div>
        <div className="exam-grid-2">
          <div className="form-item">
            <label className="field-label">1. Hệ Tuần hoàn / Tim mạch</label>
            <textarea
              className="record-textarea"
              placeholder="Tiếng tim T1 T2 rõ, nhịp xoang đều, không có tiếng thổi bệnh lý..."
              value={formData.circulatoryDesc}
              onChange={(e) => setFormData({ ...formData, circulatoryDesc: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">2. Hệ Hô hấp / Khám phổi</label>
            <textarea
              className="record-textarea"
              placeholder="Rì rào phế nang 2 bên rõ, không có rale ẩm rale rít..."
              value={formData.respiratoryDesc}
              onChange={(e) => setFormData({ ...formData, respiratoryDesc: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">3. Hệ Tiêu hóa / Khám ổ bụng</label>
            <textarea
              className="record-textarea"
              placeholder="Bụng mềm, không chướng, gan lách không sờ thấy..."
              value={formData.digestiveDesc}
              onChange={(e) => setFormData({ ...formData, digestiveDesc: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">4. Hệ Thận - Tiết niệu</label>
            <textarea
              className="record-textarea"
              placeholder="Chạm thận âm tính, bập bềnh thận âm tính, hố thắt lưng không đau..."
              value={formData.urinaryDesc}
              onChange={(e) => setFormData({ ...formData, urinaryDesc: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">5. Hệ Cơ - Xương - Khớp</label>
            <textarea
              className="record-textarea"
              placeholder="Cột sống không vẹo, tầm vận động các khớp tay chân bình thường..."
              value={formData.musculoskeletalDesc}
              onChange={(e) => setFormData({ ...formData, musculoskeletalDesc: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">6. Hệ Thần kinh - Tâm thần</label>
            <textarea
              className="record-textarea"
              placeholder="Tri giác tỉnh táo, tiếp xúc tốt, phản xạ gân xương bình thường..."
              value={formData.neurologicalDesc}
              onChange={(e) => setFormData({ ...formData, neurologicalDesc: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Đánh giá và kết luận chuyên khoa Nội */}
      <div className="exam-section-block mt-16">
        <div className="exam-block-title">Kết luận & Xếp loại Nội khoa</div>
        <div className="form-item mb-12">
          <label className="field-label">Kết luận khám nội khoa</label>
          <textarea
            className="record-textarea"
            placeholder="Chưa phát hiện bệnh lý nội khoa bất thường..."
            value={formData.conclusion}
            onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
          />
        </div>

        <div className="exam-grid-2">
          <div className="form-item">
            <label className="field-label">Phân loại sức khỏe Nội khoa</label>
            <select className="form-select" value={formData.healthClass} onChange={(e) => setFormData({ ...formData, healthClass: e.target.value })}>
              <option value="">-- Chọn xếp loại --</option>
              {classifications.map((item) => (
                <option key={item.classificationCode} value={item.classificationCode}>{item.classificationName}</option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label className="field-label">Bác sĩ khám nội khoa</label>
            <select
              className="form-select"
              value={formData.examiningDoctorId}
              onChange={(e) => setFormData({ ...formData, examiningDoctorId: e.target.value })}
            >
              <option value="">-- Chọn bác sĩ khám --</option>
              {relevantDoctors.length > 0 && (
                <optgroup label="Bác sĩ chuyên khoa Nội tổng quát">
                  {relevantDoctors.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName} ({doc.doctorCode})</option>
                  ))}
                </optgroup>
              )}
              {otherDoctors.length > 0 && (
                <optgroup label="Bác sĩ chuyên khoa khác">
                  {otherDoctors.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName} ({doc.doctorCode}) {doc.specialtyName ? `- ${doc.specialtyName}` : ''}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="tab-pane-footer">
        <button type="submit" className="btn btn-primary" disabled={saving}>{submitText}</button>
      </div>
    </form>
  );
}
