//
// Modal biểu mẫu Thêm mới và Cập nhật thông tin chung của Hồ sơ khám sức khỏe
// Quản lý thông tin tiếp nhận (đợt khám, cán bộ, mã SID, ngày khám), tiền sử bệnh và kết luận chung
//

import { IconClose } from '../../SupportAgent/Icons.jsx';
import { ModelMode } from '../../../utils/index.js';

export default function HealthRecordFormModal({
  modalMode,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  submitting = false,
  modalError = '',
  campaigns = [],
  staffsList = [],
  doctorsList = [],
  classifications = [],
  statuses = [],
}) {
  if (!modalMode) return null;

  let submitButtonText = 'Lưu thay đổi';
  if (submitting) {
    submitButtonText = 'Đang xử lý...';
  } else if (modalMode === ModelMode.CREATE) {
    submitButtonText = 'Tạo hồ sơ khám';
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card record-modal-card">
        <div className="modal-head">
          <span className="modal-title-text">
            {modalMode === ModelMode.CREATE ? 'Tạo mới hồ sơ khám cán bộ' : 'Cập nhật hồ sơ khám sức khỏe'}
          </span>
          <button type="button" className="modal-x" onClick={onClose}>
            <IconClose size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-content record-modal-body">
            {modalError && <div className="alert-tag danger record-modal-alert">{modalError}</div>}

            {modalMode === ModelMode.EDIT && (
              <div className="record-info-banner">
                <strong>
                  Cán bộ: {formData.staffName} ({formData.employeeCode})
                </strong>
                <span>
                  Khoa/Phòng: {formData.departmentName || '—'} | Đợt khám: {formData.campaignName || '—'}
                </span>
              </div>
            )}

            <div className="record-section-title">Thông tin tiếp nhận</div>

            {modalMode === ModelMode.CREATE && (
              <div className="record-form-grid">
                <div className="form-item">
                  <label className="field-label">Đợt khám sức khỏe *</label>
                  <select
                    className="form-select"
                    value={formData.campaignId}
                    onChange={(e) => onFormChange('campaignId', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn đợt khám --</option>
                    {campaigns.map((camp) => (
                      <option key={camp.campaignId} value={camp.campaignId}>
                        {camp.campaignName} ({camp.year})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-item">
                  <label className="field-label">Cán bộ khám *</label>
                  <select
                    className="form-select"
                    value={formData.staffId}
                    onChange={(e) => onFormChange('staffId', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn cán bộ --</option>
                    {staffsList.map((st) => (
                      <option key={st.staffId} value={st.staffId}>
                        {st.fullName} ({st.staffCode || st.employeeCode}) - {st.departmentName || 'Chưa có phòng'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="record-form-grid">
              <div className="form-item">
                <label className="field-label">Mã tiếp nhận / SID *</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="Ví dụ: SID-2025-001"
                  value={formData.sidCode}
                  onChange={(e) => onFormChange('sidCode', e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label className="field-label">Ngày khám thực tế</label>
                <input
                  type="date"
                  className="text-input"
                  value={formData.actualCheckupDate}
                  onChange={(e) => onFormChange('actualCheckupDate', e.target.value)}
                />
              </div>
            </div>

            <div className="record-section-title">Tiền sử sức khỏe</div>

            <div className="record-form-grid">
              <div className="form-item">
                <label className="field-label">Tiền sử bệnh bản thân</label>
                <textarea
                  className="record-textarea"
                  placeholder="Tiền sử dị ứng, phẫu thuật, bệnh mạn tính..."
                  value={formData.medicalHistoryPersonal}
                  onChange={(e) => onFormChange('medicalHistoryPersonal', e.target.value)}
                />
              </div>

              <div className="form-item">
                <label className="field-label">Tiền sử bệnh gia đình</label>
                <textarea
                  className="record-textarea"
                  placeholder="Gia đình có người mắc tim mạch, tiểu đường..."
                  value={formData.medicalHistoryFamily}
                  onChange={(e) => onFormChange('medicalHistoryFamily', e.target.value)}
                />
              </div>
            </div>

            <div className="record-section-title">Kết luận & Phân loại sức khỏe</div>

            <div className="record-form-grid">
              <div className="form-item">
                <label className="field-label">Xếp loại sức khỏe (Bộ Y tế)</label>
                <select
                  className="form-select"
                  value={formData.healthClassification}
                  onChange={(e) => onFormChange('healthClassification', e.target.value)}
                >
                  <option value="">-- Chưa xếp loại --</option>
                  {classifications.map((item) => (
                    <option key={item.classificationCode} value={item.classificationCode}>
                      {item.classificationName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label className="field-label">Bác sĩ kết luận hồ sơ</label>
                <select
                  className="form-select"
                  value={formData.concludedByDoctorId}
                  onChange={(e) => onFormChange('concludedByDoctorId', e.target.value)}
                >
                  <option value="">-- Chọn bác sĩ kết luận --</option>
                  {doctorsList.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.fullName} ({doc.doctorCode}) {doc.specialtyName ? `- ${doc.specialtyName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="record-form-full">
              <label className="field-label">Kết luận chung</label>
              <textarea
                className="record-textarea"
                placeholder="Ghi nhận tóm tắt kết luận của hội đồng khám..."
                value={formData.generalConclusion}
                onChange={(e) => onFormChange('generalConclusion', e.target.value)}
              />
            </div>

            <div className="record-form-full">
              <label className="field-label">Lời dặn / Đề xuất điều trị</label>
              <textarea
                className="record-textarea"
                placeholder="Chế độ ăn uống, vận động, khám chuyên sâu nếu có..."
                value={formData.recommendations}
                onChange={(e) => onFormChange('recommendations', e.target.value)}
              />
            </div>

            <div className="record-form-grid">
              <div className="form-item">
                <label className="field-label">Trạng thái hồ sơ</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => onFormChange('status', e.target.value)}
                >
                  {statuses.map((item) => (
                    <option key={item.statusCode} value={item.statusCode}>
                      {item.statusName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-item">
                <label className="field-label">Đường dẫn file PDF báo cáo</label>
                <input
                  type="text"
                  className="text-input"
                  placeholder="https://... hoặc để trống"
                  value={formData.reportPdfUrl}
                  onChange={(e) => onFormChange('reportPdfUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
