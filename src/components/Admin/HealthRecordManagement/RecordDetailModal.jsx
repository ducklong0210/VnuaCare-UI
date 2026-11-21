//
// Modal chi tiết điều phối quy trình khám sức khỏe của một cán bộ
// Hiển thị thông tin nhận diện cán bộ ở đầu cửa sổ và chuyển đổi qua lại giữa các tab khám chuyên môn
//

import { useState } from 'react';
import VitalSignsTab from './tabs/VitalSignsTab.jsx';
import InternalMedicineTab from './tabs/InternalMedicineTab.jsx';
import SpecialistExamsTab from './tabs/SpecialistExamsTab.jsx';
import DiagnosticReportsTab from './tabs/DiagnosticReportsTab.jsx';
import GeneralConclusionTab from './tabs/GeneralConclusionTab.jsx';
import { IconClose, IconCheck } from '../../SupportAgent/Icons.jsx';
import './RecordDetailModal.css';
import './tabs/RecordTabs.css';

// Danh sách cấu hình 5 Tab khám chuyên môn (dễ mở rộng thêm tab mới như Xét nghiệm / Đơn thuốc)
const RECORD_TABS = [
  { key: 'VITAL_SIGNS', label: '1. Thể Lực & Chỉ Số Sinh Tồn' },
  { key: 'INTERNAL_MEDICINE', label: '2. Khám Nội Khoa' },
  { key: 'SPECIALIST_EXAMS', label: '3. Chuyên Khoa Lẻ (Mắt, TMH, Răng...)' },
  { key: 'DIAGNOSTIC_REPORTS', label: '4. CĐHA & Thăm Dò Chức Năng' },
  { key: 'CONCLUSION', label: '5. Kết Luận & Xếp Loại Tổng Thể' },
];

export default function RecordDetailModal({
  record,
  onClose,
  onRefreshList,
  doctorsList = [],
  classifications = [],
  statuses = [],
}) {
  const [activeTab, setActiveTab] = useState(RECORD_TABS[0].key);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (!record) return null;

  const initials = record.staffName
    ? record.staffName
        .split(' ')
        .map((n) => n[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'CB';

  // Render nội dung Tab tương ứng theo key đang chọn
  const renderTabContent = () => {
    switch (activeTab) {
      case 'VITAL_SIGNS':
        return <VitalSignsTab recordId={record.recordId} doctorsList={doctorsList} showToast={showToast} />;
      case 'INTERNAL_MEDICINE':
        return (
          <InternalMedicineTab
            recordId={record.recordId}
            doctorsList={doctorsList}
            classifications={classifications}
            showToast={showToast}
          />
        );
      case 'SPECIALIST_EXAMS':
        return (
          <SpecialistExamsTab
            recordId={record.recordId}
            doctorsList={doctorsList}
            classifications={classifications}
            showToast={showToast}
          />
        );
      case 'DIAGNOSTIC_REPORTS':
        return <DiagnosticReportsTab recordId={record.recordId} doctorsList={doctorsList} showToast={showToast} />;
      case 'CONCLUSION':
        return (
          <GeneralConclusionTab
            recordId={record.recordId}
            doctorsList={doctorsList}
            classifications={classifications}
            statuses={statuses}
            showToast={showToast}
            onRecordUpdated={onRefreshList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card record-detail-modal-card">
        {/* Toast thông báo nhanh trong modal */}
        {toast && (
          <div className="admin-toast">
            <IconCheck size={16} />
            <span>{toast}</span>
          </div>
        )}

        {/* Header thông tin cán bộ & mã tiếp nhận SID */}
        <div className="record-detail-header">
          <div className="patient-info-row">
            <div className="patient-avatar-box">{initials}</div>
            <div className="patient-details">
              <div className="patient-title-line">
                <h3>{record.staffName || 'Hồ sơ khám cán bộ'}</h3>
                {record.sidCode && <span className="patient-sid-tag">SID: {record.sidCode}</span>}
              </div>
              <div className="patient-details-meta">
                <span className="meta-item">
                  Mã CB: <strong>{record.employeeCode || '—'}</strong>
                </span>
                <span className="meta-dot">•</span>
                <span className="meta-item">
                  Khoa/Phòng: <strong>{record.departmentName || '—'}</strong>
                </span>
                <span className="meta-dot">•</span>
                <span className="meta-item meta-campaign" title={record.campaignName || ''}>
                  Đợt: {record.campaignName || '—'}
                </span>
              </div>
            </div>
          </div>

          <button type="button" className="modal-x" onClick={onClose} title="Đóng cửa sổ">
            <IconClose size={18} />
          </button>
        </div>

        {/* Thanh chọn Tab chuyên môn */}
        <div className="record-tabs-bar">
          {RECORD_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`record-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Nội dung Tab đang chọn */}
        <div className="record-detail-body">{renderTabContent()}</div>
      </div>
    </div>
  );
}
