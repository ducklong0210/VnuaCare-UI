// Modal chi tiết hồ sơ: Cửa sổ điều phối trung tâm cho toàn bộ quy trình khám của 1 cán bộ
// Thanh tiêu đề hiển thị thông tin nhận diện cán bộ (Mã CB, Họ tên, Khoa phòng, Mã vạch SID, Đợt khám)
// Thanh chọn Tab phía trên nạp động 5 Tab khám chuyên môn độc lập kèm thông báo toast phản hồi

import { useState } from 'react';
import {
  VitalSignsTab,
  InternalMedicineTab,
  SpecialistExamsTab,
  DiagnosticReportsTab,
  GeneralConclusionTab,
} from './tabs';
import { IconClose, IconCheck } from '../../SupportAgent/Icons.jsx';
import './RecordDetailModal.css';

export default function RecordDetailModal({ record, onClose, onRefreshList, doctorsList = [], classifications = [], statuses = [] }) {
  // Tab chuyên môn đang mở: 'VITAL_SIGNS' | 'INTERNAL_MEDICINE' | 'SPECIALIST_EXAMS' | 'DIAGNOSTIC_REPORTS' | 'CONCLUSION'
  const [activeTab, setActiveTab] = useState('VITAL_SIGNS');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast('');
    }, 3000);
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
              <h3>{record.staffName || 'Hồ sơ khám cán bộ'}</h3>
              <div className="patient-details-meta">
                <span>Mã CB: <strong>{record.employeeCode || '—'}</strong></span>
                <span>•</span>
                <span>Khoa/Phòng: {record.departmentName || '—'}</span>
                <span>•</span>
                <span>Mã SID: <span className="patient-sid-tag">{record.sidCode}</span></span>
                <span>•</span>
                <span>Đợt: {record.campaignName || '—'}</span>
              </div>
            </div>
          </div>

          <button type="button" className="modal-x" onClick={onClose} title="Đóng cửa sổ">
            <IconClose size={18} />
          </button>
        </div>

        {/* Thanh chọn Tab chuyên môn phân chia độc lập */}
        <div className="record-tabs-bar">
          <button type="button" className={`record-tab-btn ${activeTab === 'VITAL_SIGNS' ? 'active' : ''}`} onClick={() => setActiveTab('VITAL_SIGNS')}>
            1. Thể Lực & Sinh Tồn
          </button>
          <button type="button" className={`record-tab-btn ${activeTab === 'INTERNAL_MEDICINE' ? 'active' : ''}`} onClick={() => setActiveTab('INTERNAL_MEDICINE')}>
            2. Khám Nội Khoa
          </button>
          <button type="button" className={`record-tab-btn ${activeTab === 'SPECIALIST_EXAMS' ? 'active' : ''}`} onClick={() => setActiveTab('SPECIALIST_EXAMS')}>
            3. Chuyên Khoa Lẻ (Mắt, TMH, Răng...)
          </button>
          <button type="button" className={`record-tab-btn ${activeTab === 'DIAGNOSTIC_REPORTS' ? 'active' : ''}`} onClick={() => setActiveTab('DIAGNOSTIC_REPORTS')}>
            4. CĐHA & Thăm Dò Chức Năng
          </button>
          <button type="button" className={`record-tab-btn ${activeTab === 'CONCLUSION' ? 'active' : ''}`} onClick={() => setActiveTab('CONCLUSION')}>
            5. Kết Luận & Xếp Loại Tổng Thể
          </button>
        </div>

        {/* Nội dung Tab tương ứng (được tách thành từng file độc lập) */}
        <div className="record-detail-body">
          {activeTab === 'VITAL_SIGNS' && <VitalSignsTab recordId={record.recordId} doctorsList={doctorsList} showToast={showToast} />}

          {activeTab === 'INTERNAL_MEDICINE' && (
            <InternalMedicineTab recordId={record.recordId} doctorsList={doctorsList} classifications={classifications} showToast={showToast} />
          )}

          {activeTab === 'SPECIALIST_EXAMS' && (
            <SpecialistExamsTab recordId={record.recordId} doctorsList={doctorsList} classifications={classifications} showToast={showToast} />
          )}

          {activeTab === 'DIAGNOSTIC_REPORTS' && (
            <DiagnosticReportsTab recordId={record.recordId} doctorsList={doctorsList} showToast={showToast} />
          )}

          {activeTab === 'CONCLUSION' && (
            <GeneralConclusionTab
              recordId={record.recordId}
              doctorsList={doctorsList}
              classifications={classifications}
              statuses={statuses}
              showToast={showToast}
              onRecordUpdated={onRefreshList}
            />
          )}
        </div>
      </div>
    </div>
  );
}
