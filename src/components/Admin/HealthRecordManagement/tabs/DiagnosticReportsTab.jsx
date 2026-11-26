//
// Tab Chẩn đoán hình ảnh và Thăm dò chức năng (Siêu âm, X-quang, Điện tim, Nội soi, CT, MRI)
// Hiển thị danh sách phiếu khám và cho phép bác sĩ tự do thêm phân vùng giải phẫu, mô tả và kết luận
//

import { useState, useEffect } from 'react';
import { diagnosticReportService } from '../../../../services/admin/DiagnosticReportService.js';
import {
  DiagnosticReport,
  MODALITY_CONFIG,
} from '../../../../models/DiagnosticReport.js';
import {
  IconPlus,
  IconRefreshCw,
  IconCheck,
  IconTrash,
  IconAlertTriangle,
} from '../../../SupportAgent/Icons.jsx';

export default function DiagnosticReportsTab({ recordId, doctorsList = [], showToast }) {
  const [reports, setReports] = useState([]); // Danh sách toàn bộ phiếu CĐHA (gồm cả phiếu đã lưu và phiếu nháp mới thêm)
  const [selectedKey, setSelectedKey] = useState(''); // Mã clientKey của phiếu đang được bấm chọn xem bên phải
  const [loading, setLoading] = useState(false); // Trạng thái đang tải danh sách phiếu
  const [saving, setSaving] = useState(false); // Trạng thái đang lưu phiếu
  const [deleting, setDeleting] = useState(false); // Trạng thái đang xóa phiếu
  const [error, setError] = useState(''); // Chuỗi thông báo lỗi (nếu có)

  // State thêm phân vùng giải phẫu mới
  const [newSectionKey, setNewSectionKey] = useState(''); // Mã định danh (key) của vùng thăm khám mới
  const [newSectionTitle, setNewSectionTitle] = useState(''); // Tên hiển thị của vùng thăm khám mới
  const [showAddSection, setShowAddSection] = useState(false); // Trạng thái ẩn/hiện dòng nhập vùng mới

  // Lấy ra phiếu đang chọn trực tiếp từ mảng reports (đảm bảo cột trái và form bên phải luôn đồng bộ 100%)
  const selectedReport = reports.find((item) => item.clientKey === selectedKey) || null;

  // Tải danh sách phiếu CĐHA từ Backend khi mở tab hoặc khi đổi sang hồ sơ khác
  useEffect(() => {
    let isCancelled = false;

    const loadReportsData = async () => {
      if (!recordId) return;
      setLoading(true);
      setError('');
      try {
        const data = await diagnosticReportService.getReportsByRecordId(recordId);
        if (!isCancelled) {
          setReports(data);
          setSelectedKey(data.length > 0 ? data[0].clientKey : '');
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Lỗi khi tải kết quả chẩn đoán hình ảnh');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadReportsData();

    return () => {
      isCancelled = true;
    };
  }, [recordId]);

  // Hàm dùng chung: cập nhật đúng phiếu đang chọn trong mảng reports mà không đụng tới các phiếu khác
  const updateCurrentReport = (updater) => {
    setReports((currentReports) =>
      currentReports.map((item) => {
        if (item.clientKey !== selectedKey) return item;
        const cloned = item.clone();
        updater(cloned);
        return cloned;
      })
    );
  };

  // Làm mới lại danh sách từ CSDL khi bấm nút "Tải lại" (giữ nguyên các phiếu nháp chưa lưu)
  const handleReload = async () => {
    if (!recordId) return;
    setLoading(true);
    setError('');
    try {
      const dbData = await diagnosticReportService.getReportsByRecordId(recordId);
      const currentDrafts = reports.filter((item) => !item.reportId);
      const merged = [...currentDrafts, ...dbData];
      setReports(merged);

      const stillExists = merged.some((item) => item.clientKey === selectedKey);
      if (!stillExists) {
        setSelectedKey(merged.length > 0 ? merged[0].clientKey : '');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải kết quả chẩn đoán hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  // Chọn một phiếu ở cột bên trái để xem/chỉnh sửa bên phải
  const handleSelectReport = (report) => {
    setSelectedKey(report.clientKey);
    setShowAddSection(false);
  };

  // Bấm "+ Thêm phiếu": tạo phiếu trắng mới nối vào đầu danh sách, không ghi đè phiếu hiện tại
  const handleCreateNewReport = (modalityType = 'ULTRASOUND') => {
    const blankReport = DiagnosticReport.createBlank(recordId, modalityType);
    setReports((currentReports) => [blankReport, ...currentReports]);
    setSelectedKey(blankReport.clientKey);
    setShowAddSection(false);
  };

  // Cập nhật trường thông tin chung của phiếu đang chọn
  const handleFieldChange = (field, value) => {
    updateCurrentReport((cloned) => {
      cloned[field] = value;
    });
  };

  // Thêm một gạch đầu dòng vào phân vùng
  const handleAddBullet = (sectionKey) => {
    updateCurrentReport((cloned) => {
      cloned.addBullet(sectionKey, '');
    });
  };

  // Sửa nội dung một gạch đầu dòng
  const handleUpdateBullet = (sectionKey, index, text) => {
    updateCurrentReport((cloned) => {
      cloned.updateBullet(sectionKey, index, text);
    });
  };

  // Xóa một gạch đầu dòng
  const handleRemoveBullet = (sectionKey, index) => {
    updateCurrentReport((cloned) => {
      cloned.removeBullet(sectionKey, index);
    });
  };

  // Xác nhận thêm phân vùng giải phẫu mới vào phiếu đang chọn
  const handleConfirmAddSection = () => {
    const title = newSectionTitle.trim();
    let key = newSectionKey.trim();
    if (!title && !key) return;

    if (!key) {
      key = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_');
    }

    if (!selectedReport) return;
    updateCurrentReport((cloned) => {
      cloned.addSection(key, title || key);
    });
    setNewSectionKey('');
    setNewSectionTitle('');
    setShowAddSection(false);
  };

  // Xóa phân vùng giải phẫu khỏi phiếu đang chọn
  const handleRemoveSection = (sectionKey) => {
    updateCurrentReport((cloned) => {
      cloned.removeSection(sectionKey);
    });
  };

  // Lưu phiếu đang chọn lên Backend (chỉ lưu đúng phiếu đang mở, giữ nguyên vị trí các phiếu khác)
  const handleSave = async () => {
    if (!selectedReport) return;

    const validation = selectedReport.validate();
    if (!validation.isValid) {
      if (showToast) showToast(validation.errors[0]);
      return;
    }

    const savingReport = selectedReport.clone();
    // Ghi nhớ danh sách ID đã có trước khi lưu để nhận diện đúng phiếu mới vừa sinh trong CSDL
    const oldSavedIds = reports.filter((r) => r.reportId).map((r) => r.reportId);

    setSaving(true);
    setError('');
    try {
      await diagnosticReportService.saveReport(savingReport);
      const updatedDbList = await diagnosticReportService.getReportsByRecordId(recordId);

      // Giữ lại các phiếu nháp khác chưa bấm lưu (nếu bác sĩ tạo nhiều phiếu nháp cùng lúc)
      const remainingDrafts = reports.filter(
        (item) => !item.reportId && item.clientKey !== savingReport.clientKey
      );
      setReports([...remainingDrafts, ...updatedDbList]);

      if (savingReport.reportId) {
        // Nếu là sửa phiếu cũ: giữ nguyên khóa chọn đúng vào phiếu có reportId đó
        setSelectedKey(`report-${savingReport.reportId}`);
      } else {
        // Nếu là lưu phiếu mới: trỏ khóa chọn vào đúng bản ghi mới vừa sinh ra trong CSDL
        const newlyCreated =
          updatedDbList.find((r) => !oldSavedIds.includes(r.reportId)) ||
          updatedDbList[updatedDbList.length - 1];
        if (newlyCreated) {
          setSelectedKey(newlyCreated.clientKey);
        }
      }

      if (showToast) {
        showToast('Lưu kết quả chẩn đoán hình ảnh thành công!');
      }
    } catch (err) {
      const msg = err.message || 'Lỗi khi lưu kết quả chẩn đoán';
      setError(msg);
      if (showToast) showToast(msg);
    } finally {
      setSaving(false);
    }
  };

  // Xóa phiếu đã lưu hoặc hủy bỏ phiếu nháp chưa lưu
  const handleDelete = async () => {
    if (!selectedReport) return;

    // Nếu là phiếu nháp mới chưa lưu CSDL thì chỉ cần gỡ khỏi mảng trên giao diện
    if (!selectedReport.reportId) {
      const nextList = reports.filter((item) => item.clientKey !== selectedReport.clientKey);
      setReports(nextList);
      setSelectedKey(nextList.length > 0 ? nextList[0].clientKey : '');
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa phiếu "${selectedReport.examTitle}" không? Dữ liệu không thể khôi phục!`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    setError('');
    try {
      await diagnosticReportService.deleteReport(selectedReport.reportId);
      const updatedDbList = await diagnosticReportService.getReportsByRecordId(recordId);
      const remainingDrafts = reports.filter((item) => !item.reportId);
      const nextList = [...remainingDrafts, ...updatedDbList];

      setReports(nextList);
      setSelectedKey(nextList.length > 0 ? nextList[0].clientKey : '');
      if (showToast) {
        showToast('Đã xóa phiếu kết quả thành công!');
      }
    } catch (err) {
      const msg = err.message || 'Lỗi khi xóa phiếu kết quả';
      setError(msg);
      if (showToast) showToast(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="diagnostic-reports-container">
      {/* Cột danh mục phiếu bên trái */}
      <div className="diagnostic-sidebar">
        <div className="diagnostic-sidebar-header">
          <span className="diagnostic-sidebar-title">Danh mục phiếu CĐHA</span>
          <button
            type="button"
            className="btn-add-report-pill"
            onClick={() => handleCreateNewReport('ULTRASOUND')}
            title="Tạo phiếu chẩn đoán hình ảnh mới để bác sĩ tự điền"
          >
            <IconPlus size={12} />
            <span>Thêm phiếu</span>
          </button>
        </div>

        {loading ? (
          <div className="admin-loading-indicator" style={{ padding: '24px 0', fontSize: '13px' }}>
            <IconRefreshCw size={18} className="spinning-icon" />
            <span>Đang tải phiếu...</span>
          </div>
        ) : (
          <div className="diagnostic-reports-list">
            {reports.length === 0 ? (
              <div style={{ padding: '20px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                <p>Hồ sơ này chưa có kết quả chẩn đoán hình ảnh nào.</p>
                <button
                  type="button"
                  className="btn-add-report-pill"
                  style={{ marginTop: '8px' }}
                  onClick={() => handleCreateNewReport('ULTRASOUND')}
                >
                  <IconPlus size={12} />
                  <span>Tạo phiếu mới</span>
                </button>
              </div>
            ) : (
              reports.map((item) => {
                const isSelected = item.clientKey === selectedKey;
                const badge = item.getModalityBadge();
                const completed = Boolean(item.reportId) && item.isCompleted();
                const isDraft = !item.reportId;

                return (
                  <button
                    key={item.clientKey}
                    type="button"
                    className={`diagnostic-report-card-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectReport(item)}
                  >
                    <div className="report-card-top">
                      <span className={`modality-badge ${badge.badgeClass}`}>{badge.label}</span>
                      <span className={`report-card-status ${completed ? 'completed' : 'pending'}`}>
                        {isDraft ? '● Mới (chưa lưu)' : completed ? '✓ Đã có kết quả' : 'Chưa có kết quả'}
                      </span>
                    </div>
                    <div className="report-card-title">{item.examTitle || 'Phiếu mới chưa đặt tên'}</div>
                    <div className="report-card-meta">
                      <span>{item.readingDoctorName ? `BS: ${item.readingDoctorName}` : 'Chưa phân công BS'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Khung form chi tiết bên phải */}
      <div className="diagnostic-detail-panel">
        {error && <div className="alert-tag danger mb-12">{error}</div>}
        {!selectedReport ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
            <IconAlertTriangle size={36} style={{ color: '#0f766e', marginBottom: '12px' }} />
            <h3>Chưa chọn phiếu kết quả chẩn đoán</h3>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Vui lòng chọn một phiếu từ danh mục bên trái hoặc bấm &quot;Thêm phiếu&quot; để tạo kết quả mới.
            </p>
          </div>
        ) : (
          <>
            {/* Header thông tin phiếu */}
            <div className="diagnostic-panel-header">
              <div className="diagnostic-panel-title-row">
                <div>
                  <h3 className="diagnostic-panel-title">
                    {selectedReport.examTitle || 'Phiếu chẩn đoán hình ảnh mới'}
                  </h3>
                  <div className="diagnostic-panel-sub">
                    {selectedReport.reportId
                      ? `Mã phiếu: #${selectedReport.reportId} • Hồ sơ ID: ${selectedReport.recordId}`
                      : 'Phiếu mới tạo (Chưa lưu vào CSDL) • Bác sĩ tự điền'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    className="admin-form-input"
                    style={{ width: '150px', padding: '6px 10px', fontSize: '12px', fontWeight: 600 }}
                    value={selectedReport.modalityType}
                    onChange={(e) => handleFieldChange('modalityType', e.target.value)}
                  >
                    {Object.values(MODALITY_CONFIG).map((mod) => (
                      <option key={mod.code} value={mod.code}>
                        {mod.label} ({mod.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Nội dung các trường form */}
            <div className="diagnostic-form-body">
              {/* Tiêu đề & Kỹ thuật khám */}
              <div className="diagnostic-card-block">
                <div className="diagnostic-card-title">Kỹ Thuật Thăm Khám & Chỉ Định</div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Tên phiếu khám / Chỉ định dịch vụ <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={selectedReport.examTitle}
                      onChange={(e) => handleFieldChange('examTitle', e.target.value)}
                      placeholder="Ví dụ: Siêu âm ổ bụng tổng quát, Chụp X-quang tim phổi..."
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Thời gian thực hiện</label>
                    <input
                      type="datetime-local"
                      className="admin-form-input"
                      value={selectedReport.performedAt}
                      onChange={(e) => handleFieldChange('performedAt', e.target.value)}
                    />
                  </div>
                </div>
                <div className="admin-form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Mô tả kỹ thuật thực hiện</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={selectedReport.techniqueDescription}
                    onChange={(e) => handleFieldChange('techniqueDescription', e.target.value)}
                    placeholder="Ví dụ: Đầu dò Convex 3.5MHz, Máy chụp kỹ thuật số KTS..."
                  />
                </div>
              </div>

              {/* Mô tả hình ảnh & các phân vùng dạng mảng danh sách gạch đầu dòng */}
              <div className="diagnostic-card-block">
                <div className="diagnostic-card-title">
                  <span>Mô Tả Hình Ảnh & Phát Hiện Từng Vùng (Bác sĩ tự điền)</span>
                  <span className="card-title-hint">Mỗi phân vùng có thể thêm nhiều gạch đầu dòng chi tiết</span>
                </div>

                <div className="finding-sections-list">
                  {selectedReport.sections.length === 0 ? (
                    <div style={{ padding: '16px', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                      Chưa có phân vùng mô tả nào. Bác sĩ có thể bấm nút &quot;Thêm cơ quan / vùng thăm khám mới&quot; phía dưới để ghi nhận phát hiện.
                    </div>
                  ) : (
                    selectedReport.sections.map((section) => (
                      <div key={section.key} className="finding-section-item">
                        <div className="finding-section-header">
                          <div className="finding-section-title-label">
                            <span>{section.title}</span>
                            <span className="section-key-tag">{section.key}</span>
                          </div>
                          <button
                            type="button"
                            className="btn-remove-section"
                            onClick={() => handleRemoveSection(section.key)}
                            title="Xóa vùng thăm khám này"
                          >
                            Xóa vùng
                          </button>
                        </div>

                        {/* Danh sách các gạch đầu dòng */}
                        <div className="bullet-items-list">
                          {section.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="bullet-item-row">
                              <span className="bullet-dot-icon">•</span>
                              <input
                                type="text"
                                className="bullet-input"
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(section.key, bIdx, e.target.value)}
                                placeholder={`Ghi nhận phát hiện vùng ${section.title}...`}
                              />
                              <button
                                type="button"
                                className="btn-delete-bullet"
                                onClick={() => handleRemoveBullet(section.key, bIdx)}
                                title="Xóa dòng này"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="btn-add-bullet"
                          onClick={() => handleAddBullet(section.key)}
                        >
                          <IconPlus size={11} />
                          <span>Thêm gạch đầu dòng</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Nút thêm phân vùng giải phẫu mới */}
                {showAddSection ? (
                  <div className="add-new-section-row">
                    <input
                      type="text"
                      className="new-section-input"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="Tên vùng / cơ quan (ví dụ: Gan mật, Thùy phải tuyến giáp, Phổi...)"
                    />
                    <input
                      type="text"
                      className="new-section-input"
                      value={newSectionKey}
                      onChange={(e) => setNewSectionKey(e.target.value)}
                      placeholder="Mã phân vùng (tùy chọn, để trống sẽ tự tạo)"
                    />
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={handleConfirmAddSection}
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => setShowAddSection(false)}
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-add-bullet"
                    style={{ marginTop: '14px', marginLeft: 0 }}
                    onClick={() => setShowAddSection(true)}
                  >
                    <IconPlus size={12} />
                    <span>Thêm cơ quan / vùng thăm khám mới</span>
                  </button>
                )}
              </div>

              {/* Đánh giá & Kết luận */}
              <div className="diagnostic-card-block">
                <div className="diagnostic-card-title">Đánh Giá & Kết Luận Của Bác Sĩ</div>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Kết luận chẩn đoán <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="admin-form-input"
                    value={selectedReport.conclusion}
                    onChange={(e) => handleFieldChange('conclusion', e.target.value)}
                    placeholder="Bác sĩ tự nhập kết luận chuyên môn..."
                  />
                </div>

                <div className="admin-form-row" style={{ marginTop: '12px' }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Bác sĩ đọc kết quả</label>
                    <select
                      className="admin-form-input"
                      value={selectedReport.readingDoctorId || ''}
                      onChange={(e) => handleFieldChange('readingDoctorId', e.target.value)}
                    >
                      <option value="">-- Chọn bác sĩ đọc kết quả --</option>
                      {doctorsList.map((doc) => (
                        <option key={doc.doctorId} value={doc.doctorId}>
                          {doc.fullName} ({doc.doctorCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Bác sĩ duyệt kết quả</label>
                    <select
                      className="admin-form-input"
                      value={selectedReport.approvingDoctorId || ''}
                      onChange={(e) => handleFieldChange('approvingDoctorId', e.target.value)}
                    >
                      <option value="">-- Chọn bác sĩ duyệt kết quả --</option>
                      {doctorsList.map((doc) => (
                        <option key={doc.doctorId} value={doc.doctorId}>
                          {doc.fullName} ({doc.doctorCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Đường dẫn tệp hình ảnh chẩn đoán / File lưu trữ</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={selectedReport.imageUrls}
                    onChange={(e) => handleFieldChange('imageUrls', e.target.value)}
                    placeholder="https://storage.vnua.edu.vn/..."
                  />
                  {selectedReport.imageUrls && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#0f766e' }}>
                      <a href={selectedReport.imageUrls} target="_blank" rel="noreferrer">
                        Xem hình ảnh gốc đính kèm &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Thanh công cụ lưu & xóa */}
            <div className="diagnostic-action-footer">
              <div>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <IconTrash size={14} />
                  <span>
                    {selectedReport.reportId
                      ? deleting
                        ? 'Đang xóa...'
                        : 'Xóa phiếu này'
                      : 'Hủy phiếu nháp'}
                  </span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={handleReload}
                  disabled={loading || saving}
                >
                  <IconRefreshCw size={14} />
                  <span>Tải lại</span>
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <IconCheck size={14} />
                  <span>{saving ? 'Đang lưu kết quả...' : 'Lưu kết quả CĐHA'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
