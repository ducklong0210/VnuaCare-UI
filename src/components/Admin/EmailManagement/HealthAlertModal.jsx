//
// Modal Cảnh báo sức khỏe suy giảm so với năm trước và Gửi Email thông báo cho cán bộ
// Hỗ trợ lọc theo đợt khám, gửi lẻ từng cán bộ hoặc gửi hàng loạt cả đợt (có tùy chọn gửi lại forceResend)
// Component tách độc lập để dùng chung được ở cả màn Nhật ký Email (/emails) và Hồ sơ khám (/records)
//

import { useEffect, useState } from 'react';
import { EmailService } from '../../../services/admin/EmailService.js';
import { formatDateTime } from '../../../utils/helpers.js';
import { IconClose, IconMail, IconRefreshCw } from '../../SupportAgent/Icons.jsx';
import './EmailManagement.css';

export default function HealthAlertModal({ isOpen, onClose, onAlertSent, showToast }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('ALL');
  const [declinedRecords, setDeclinedRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  // Tùy chọn gửi lại và trạng thái đang gửi email
  const [forceResend, setForceResend] = useState(false);
  const [sendingBatch, setSendingBatch] = useState(false);
  const [sendingRecordId, setSendingRecordId] = useState(null);
  const [sendResult, setSendResult] = useState(null);

  // 1. Tải danh mục đợt khám một lần khi mở modal
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;
    const loadCampaigns = async () => {
      try {
        const list = await EmailService.getCampaigns();
        if (!isCancelled) {
          setCampaigns(Array.isArray(list) ? list : []);
        }
      } catch {
        // Bỏ qua nếu chưa có danh mục đợt khám
      }
    };

    loadCampaigns();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // 2. Tải danh sách cán bộ có sức khỏe suy giảm so với năm trước theo đợt khám đang chọn
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;
    const loadDeclinedList = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await EmailService.getDeclinedHealthRecords(selectedCampaignId);
        if (!isCancelled) {
          setDeclinedRecords(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Không thể tải danh sách cán bộ suy giảm sức khỏe');
          setDeclinedRecords([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadDeclinedList();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedCampaignId, reloadCount]);

  if (!isOpen) {
    return null;
  }

  // Gửi email cảnh báo lẻ cho 1 cán bộ cụ thể
  const handleSendSingle = async (item) => {
    if (!item.email) {
      setError(`Cán bộ ${item.staffName} (${item.employeeCode}) chưa có địa chỉ email.`);
      return;
    }

    setSendingRecordId(item.recordId);
    setError('');
    setSendResult(null);

    try {
      const result = await EmailService.sendHealthAlertEmail({
        recordId: item.recordId,
        campaignId: item.campaignId,
        forceResend: Boolean(item.alertSentAt),
      });

      setSendResult(result);
      if (result?.totalSent > 0 && showToast) {
        showToast(`Đã gửi email cảnh báo tới ${item.staffName} (${item.email}) thành công!`);
      }
      setReloadCount((currentCount) => currentCount + 1);
      if (onAlertSent) {
        onAlertSent();
      }
    } catch (err) {
      setError(err.message || 'Gửi email cảnh báo thất bại');
    } finally {
      setSendingRecordId(null);
    }
  };

  // Gửi email cảnh báo hàng loạt theo đợt khám đang chọn (hoặc tất cả đợt)
  const handleSendBatch = async () => {
    if (declinedRecords.length === 0) {
      return;
    }

    setSendingBatch(true);
    setError('');
    setSendResult(null);

    try {
      const result = await EmailService.sendHealthAlertEmail({
        recordId: null,
        campaignId: selectedCampaignId,
        forceResend: forceResend,
      });

      setSendResult(result);
      if (showToast && result) {
        showToast(`Hoàn tất gửi cảnh báo: ${result.totalSent} thành công, ${result.totalSkippedAlreadySent} bỏ qua, ${result.totalFailed} lỗi.`);
      }
      setReloadCount((currentCount) => currentCount + 1);
      if (onAlertSent) {
        onAlertSent();
      }
    } catch (err) {
      setError(err.message || 'Gửi email hàng loạt thất bại');
    } finally {
      setSendingBatch(false);
    }
  };

  const isBusy = loading || sendingBatch || sendingRecordId !== null;
  const unsentCount = declinedRecords.filter((item) => !item.alertSentAt).length;

  return (
    <div className="modal-backdrop">
      <div className="modal-card health-alert-modal-card">
        <div className="modal-head">
          <span className="modal-title-text">Cảnh báo cán bộ có sức khỏe suy giảm so với năm trước</span>
          <button type="button" className="modal-x" onClick={onClose} disabled={sendingBatch || sendingRecordId !== null}>
            <IconClose size={16} />
          </button>
        </div>

        <div className="modal-content health-alert-body">
          {/* Thanh lọc theo đợt khám & nút gửi hàng loạt */}
          <div className="health-alert-toolbar">
            <div className="health-alert-toolbar-left">
              <select
                className="form-select"
                value={selectedCampaignId}
                onChange={(e) => {
                  setSelectedCampaignId(e.target.value);
                  setSendResult(null);
                }}
                disabled={isBusy}
              >
                <option value="ALL">Tất cả đợt khám</option>
                {campaigns.map((camp) => (
                  <option key={camp.campaignId} value={camp.campaignId}>
                    {camp.campaignName} ({camp.year})
                  </option>
                ))}
              </select>

              <label className="health-alert-checkbox">
                <input
                  type="checkbox"
                  checked={forceResend}
                  onChange={(e) => setForceResend(e.target.checked)}
                  disabled={isBusy}
                />
                <span>Gửi lại cả người đã nhận cảnh báo</span>
              </label>
            </div>

            <div className="header-btn-group">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setReloadCount((currentCount) => currentCount + 1)}
                disabled={isBusy}
              >
                <IconRefreshCw size={14} />
                <span>Tải lại</span>
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendBatch}
                disabled={isBusy || declinedRecords.length === 0}
              >
                <IconMail size={15} />
                <span>
                  {sendingBatch
                    ? 'Đang gửi email hàng loạt...'
                    : forceResend
                      ? `Gửi tất cả (${declinedRecords.length})`
                      : `Gửi người chưa nhận (${unsentCount})`}
                </span>
              </button>
            </div>
          </div>

          {error && <div className="alert-tag danger">{error}</div>}

          {/* Thống kê kết quả sau khi bấm gửi */}
          {sendResult && (
            <div className={`health-alert-result-box ${sendResult.totalFailed > 0 ? 'has-error' : ''}`}>
              <strong>Kết quả gửi email cảnh báo sức khỏe:</strong>
              <div className="health-alert-result-stats">
                <span>Phát hiện suy giảm: <strong>{sendResult.totalDeclinedFound}</strong></span>
                <span>Gửi thành công: <strong style={{ color: '#15803d' }}>{sendResult.totalSent}</strong></span>
                <span>Bỏ qua (đã gửi trước đó): <strong>{sendResult.totalSkippedAlreadySent}</strong></span>
                <span>Thất bại: <strong style={{ color: '#dc2626' }}>{sendResult.totalFailed}</strong></span>
              </div>
              {Array.isArray(sendResult.errors) && sendResult.errors.length > 0 && (
                <ul className="health-alert-error-list">
                  {sendResult.errors.map((errText, index) => (
                    <li key={index}>{errText}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Bảng danh sách cán bộ có xếp loại sức khỏe suy giảm */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cán bộ</th>
                  <th>Email nhận</th>
                  <th>Đợt khám / SID</th>
                  <th>Biến động sức khỏe</th>
                  <th>Trạng thái cảnh báo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <span className="empty-title">Đang đối chiếu hồ sơ sức khỏe giữa các năm...</span>
                    </td>
                  </tr>
                )}

                {!loading && declinedRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <div className="empty-wrap">
                        <span className="empty-title">Không có cán bộ nào suy giảm xếp loại sức khỏe</span>
                        <p className="empty-desc">
                          Chỉ những hồ sơ đã hoàn thành (COMPLETED) có phân loại năm nay kém hơn năm trước mới xuất hiện tại đây.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  declinedRecords.length > 0 &&
                  declinedRecords.map((item) => {
                    const isSendingThis = sendingRecordId === item.recordId;
                    const alreadySent = Boolean(item.alertSentAt);

                    return (
                      <tr key={item.recordId}>
                        <td>
                          <div className="cell-staff">
                            <strong>{item.staffName || '—'}</strong>
                            <span>
                              {item.employeeCode || '—'}
                              {item.departmentName ? ` • ${item.departmentName}` : ''}
                            </span>
                          </div>
                        </td>
                        <td>
                          {item.email ? (
                            <span>{item.email}</span>
                          ) : (
                            <span className="email-missing-text">Chưa có email</span>
                          )}
                        </td>
                        <td>
                          <div className="cell-staff">
                            <strong>{item.campaignName || `Năm ${item.currentYear}`}</strong>
                            <span className="code-font">{item.sidCode}</span>
                          </div>
                        </td>
                        <td>
                          <div className="health-decline-compare">
                            <span className="health-decline-old">
                              {item.previousClassification} ({item.previousYear})
                            </span>
                            <span className="health-decline-arrow">&rarr;</span>
                            <span className="health-decline-new">
                              {item.currentClassification} ({item.currentYear})
                            </span>
                          </div>
                        </td>
                        <td>
                          {alreadySent ? (
                            <span className="email-status-pill is-success">Đã gửi {formatDateTime(item.alertSentAt)}</span>
                          ) : (
                            <span className="email-status-pill is-pending">Chưa gửi</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn-send-single ${alreadySent ? 'is-resend' : ''}`}
                            disabled={isBusy || !item.email}
                            onClick={() => handleSendSingle(item)}
                            title={!item.email ? 'Cán bộ chưa có địa chỉ email' : alreadySent ? 'Gửi lại cảnh báo' : 'Gửi email cảnh báo ngay'}
                          >
                            <IconMail size={13} />
                            <span>{isSendingThis ? 'Đang gửi...' : alreadySent ? 'Gửi lại' : 'Gửi cảnh báo'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={sendingBatch || sendingRecordId !== null}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
