// Tab 5: Kết luận & Xếp loại tổng thể sức khỏe cán bộ theo tiêu chuẩn Bộ Y tế
// Tổng hợp đánh giá từ 4 chuyên khoa trước, ghi nhận tiền sử bệnh bản thân và gia đình
// Bác sĩ chủ trì hội đồng KSK chọn xếp loại sức khỏe (Loại I - V), tư vấn điều trị và hoàn tất hồ sơ

import { useEffect, useState } from 'react';
import { getHealthRecordByIdApi, updateHealthRecordApi } from '../../../../api/recordApi.js';
import { IconCheck, IconRefreshCw } from '../../../SupportAgent/Icons.jsx';
const INITIAL_CONCLUSION = {
  recordId: null,
  sidCode: '',
  actualCheckupDate: '',
  medicalHistoryPersonal: '',
  medicalHistoryFamily: '',
  healthClassification: '',
  generalConclusion: '',
  recommendations: '',
  concludedByDoctorId: '',
  status: 'COMPLETED',
  reportPdfUrl: '',
};

export default function GeneralConclusionTab({ recordId, doctorsList = [], classifications = [], statuses = [], showToast, onRecordUpdated }) {
  const [formData, setFormData] = useState(INITIAL_CONCLUSION); // Đối tượng dữ liệu biểu mẫu kết luận & xếp loại tổng thể
  const [loading, setLoading] = useState(false); // trạng thái đang tải thông tin kết luận hồ sơ
  const [saving, setSaving] = useState(false); // trạng thái đang lưu kết luận
  const [message, setMessage] = useState(''); // Chuỗi thông báo thành công
  const [error, setError] = useState(''); // Chuỗi thông báo lỗi

  // Tải thông tin kết luận của hồ sơ
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (!recordId) return;
      setLoading(true);
      setError('');

      try {
        const data = await getHealthRecordByIdApi(recordId);
        if (!isCancelled && data) {
          setFormData({
            recordId: data.recordId,
            sidCode: data.sidCode || '',
            actualCheckupDate: data.actualCheckupDate ? data.actualCheckupDate.split('T')[0] : '',
            medicalHistoryPersonal: data.medicalHistoryPersonal || '',
            medicalHistoryFamily: data.medicalHistoryFamily || '',
            healthClassification: data.healthClassification || '',
            generalConclusion: data.generalConclusion || '',
            recommendations: data.recommendations || data.recommentdations || '',
            concludedByDoctorId: data.concludedByDoctorId ? String(data.concludedByDoctorId) : '',
            status: data.status || 'COMPLETED',
            reportPdfUrl: data.reportPdfUrl || '',
          });
        }
      } catch {
        if (!isCancelled) {
          setError('Không thể tải thông tin kết luận hồ sơ');
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

  // Lưu kết luận của Bác sĩ trưởng đoàn
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        recordId: Number(recordId),
        sidCode: formData.sidCode.trim(),
        actualCheckupDate: formData.actualCheckupDate ? new Date(formData.actualCheckupDate).toISOString() : new Date().toISOString(),
        medicalHistoryPersonal: formData.medicalHistoryPersonal.trim() || null,
        medicalHistoryFamily: formData.medicalHistoryFamily.trim() || null,
        healthClassification: formData.healthClassification || null,
        generalConclusion: formData.generalConclusion.trim() || null,
        recommendations: formData.recommendations.trim() || null,
        concludedByDoctorId: formData.concludedByDoctorId ? Number(formData.concludedByDoctorId) : 0,
        concludedAt: new Date().toISOString(),
        status: formData.status || 'COMPLETED',
        reportPdfUrl: formData.reportPdfUrl.trim() || null,
      };

      await updateHealthRecordApi(payload);
      setMessage('Đã ký duyệt và cập nhật kết luận hồ sơ thành công!');
      if (showToast) showToast('Đã cập nhật kết luận hồ sơ thành công!');
      if (onRecordUpdated) onRecordUpdated();
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu kết luận');
    } finally {
      setSaving(false);
    }
  };

  let submitText = 'Ký duyệt & Cập nhật kết luận';
  if (saving) {
    submitText = 'Đang lưu kết luận...';
  }

  const leadDoctors = doctorsList.filter((doc) => doc.specialtyId === 6);
  const otherDoctors = doctorsList.filter((doc) => doc.specialtyId !== 6);

  if (loading) {
    return (
      <div className="tab-loading-box">
        <IconRefreshCw size={20} className="spinning-icon" />
        <span>Đang tải thông tin kết luận hồ sơ...</span>
      </div>
    );
  }

  return (
    <form className="exam-tab-pane" onSubmit={handleSubmit}>
      <div className="tab-pane-header">
        <div>
          <h3 className="tab-pane-title">Kết Luận Tổng Thể Của Hội Đồng Y Khoa</h3>
          <p className="tab-pane-desc">Bác sĩ chủ trì hội đồng xem xét kết quả từ các chuyên khoa để đưa ra kết luận và xếp loại cuối cùng</p>
        </div>
      </div>

      {error && <div className="alert-tag danger mb-12">{error}</div>}
      {message && (
        <div className="alert-tag success mb-12">
          <IconCheck size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Kết luận & Lời dặn */}
      <div className="exam-section-block">
        <div className="exam-block-title">Kết luận & Lời dặn điều trị</div>

        <div className="form-item mb-12">
          <label className="field-label">Kết luận sức khỏe tổng quát *</label>
          <textarea
            className="record-textarea"
            placeholder="Tổng hợp tình trạng sức khỏe của cán bộ sau khi khám tất cả các chuyên khoa..."
            value={formData.generalConclusion}
            onChange={(e) => setFormData({ ...formData, generalConclusion: e.target.value })}
            required
          />
        </div>

        <div className="form-item">
          <label className="field-label">Lời dặn / Đề xuất theo dõi và điều trị</label>
          <textarea
            className="record-textarea"
            placeholder="Chế độ dinh dưỡng, vận động, khám chuyên khoa sâu hoặc tái khám định kỳ..."
            value={formData.recommendations}
            onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
          />
        </div>
      </div>

      {/* Phân loại sức khỏe & Bác sĩ ký duyệt */}
      <div className="exam-section-block mt-16">
        <div className="exam-block-title">Phân loại Bộ Y tế & Bác sĩ ký duyệt</div>

        <div className="exam-grid-2">
          <div className="form-item">
            <label className="field-label">Xếp loại sức khỏe chung (Bộ Y tế) *</label>
            <select
              className="form-select"
              value={formData.healthClassification}
              onChange={(e) => setFormData({ ...formData, healthClassification: e.target.value })}
              required
            >
              <option value="">-- Chọn xếp loại sức khỏe --</option>
              {classifications.map((item) => (
                <option key={item.classificationCode} value={item.classificationCode}>{item.classificationName}</option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label className="field-label">Bác sĩ chủ trì ký kết luận *</label>
            <select
              className="form-select"
              value={formData.concludedByDoctorId}
              onChange={(e) => setFormData({ ...formData, concludedByDoctorId: e.target.value })}
              required
            >
              <option value="">-- Chọn bác sĩ kết luận --</option>
              {leadDoctors.length > 0 && (
                <optgroup label="Bác sĩ Hội đồng / Kết luận KSK">
                  {leadDoctors.map((doc) => (
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

          <div className="form-item">
            <label className="field-label">Trạng thái hồ sơ khám</label>
            <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              {statuses.map((item) => (
                <option key={item.statusCode} value={item.statusCode}>{item.statusName}</option>
              ))}
            </select>
          </div>

          <div className="form-item">
            <label className="field-label">Đường dẫn file PDF sổ khám (nếu có)</label>
            <input
              type="text"
              className="text-input"
              placeholder="https://... hoặc để trống"
              value={formData.reportPdfUrl}
              onChange={(e) => setFormData({ ...formData, reportPdfUrl: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="tab-pane-footer">
        <button type="submit" className="btn btn-primary" disabled={saving}>{submitText}</button>
      </div>
    </form>
  );
}
