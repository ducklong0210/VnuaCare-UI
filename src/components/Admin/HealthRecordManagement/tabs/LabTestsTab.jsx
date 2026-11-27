//
// Tab Xét nghiệm Cận lâm sàng (Huyết học, Sinh hóa máu, Tổng phân tích nước tiểu)
// Hiển thị danh sách phiếu xét nghiệm của hồ sơ, bảng chỉ số kèm cờ cảnh báo Cao/Thấp và hỗ trợ tạo phiếu, nhập kết quả
//

import { useState, useEffect, useMemo } from 'react';
import {
  getLabIndicatorsApi,
  getLabTestsByRecordIdApi,
  createLabTestOrderApi,
  saveLabTestResultsApi,
  deleteLabTestOrderApi,
} from '../../../../api/labTestApi.js';
import {
  SAMPLE_TYPE_OPTIONS,
  LAB_CATEGORY_CONFIG,
  normalizeSampleType,
  getLabFlagMeta,
  getLabOrderStatusMeta,
  groupLabResultsByCategory,
  countAbnormalResults,
} from '../../../../models/LabTest.js';
import {
  IconPlus,
  IconRefreshCw,
  IconCheck,
  IconTrash,
  IconAlertTriangle,
} from '../../../SupportAgent/Icons.jsx';

function formatDateTime(val) {
  if (!val) return '—';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LabTestsTab({ recordId, showToast }) {
  const [orders, setOrders] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Bộ lọc hiển thị nhanh trong bảng kết quả
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);

  // Trạng thái form tạo phiếu chỉ định mới
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSampleType, setNewSampleType] = useState('MÁU');
  const [newBarcode, setNewBarcode] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Chế độ nhập / chỉnh sửa kết quả chỉ số trên phiếu đang chọn
  const [isEditing, setIsEditing] = useState(false);
  const [draftRows, setDraftRows] = useState([]);
  const [addIndicatorId, setAddIndicatorId] = useState('');

  const selectedOrder = useMemo(
    () => orders.find((o) => o.orderId === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  // Tải đồng thời danh sách phiếu xét nghiệm của hồ sơ và danh mục 34 chỉ số chuẩn
  const loadData = async (preferredOrderId = null) => {
    if (!recordId) return;
    setLoading(true);
    setError('');
    try {
      const [ordersData, catalogData] = await Promise.all([
        getLabTestsByRecordIdApi(recordId),
        indicators.length > 0 ? Promise.resolve(indicators) : getLabIndicatorsApi(),
      ]);

      const safeOrders = Array.isArray(ordersData) ? ordersData : [];
      const safeCatalog = Array.isArray(catalogData) ? catalogData : [];

      setOrders(safeOrders);
      if (indicators.length === 0) {
        setIndicators(safeCatalog);
      }

      if (preferredOrderId && safeOrders.some((o) => o.orderId === preferredOrderId)) {
        setSelectedOrderId(preferredOrderId);
      } else if (safeOrders.length > 0) {
        const currentStillExists = safeOrders.some((o) => o.orderId === selectedOrderId);
        if (!currentStillExists) {
          setSelectedOrderId(safeOrders[0].orderId);
        }
      } else {
        setSelectedOrderId(null);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải kết quả xét nghiệm cận lâm sàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const initTabData = async () => {
      await Promise.resolve();
      if (isCancelled) return;
      setIsEditing(false);
      setShowCreateForm(false);
      setOnlyAbnormal(false);
      await loadData();
    };
    initTabData();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  // Chọn một phiếu ở cột bên trái
  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setIsEditing(false);
    setOnlyAbnormal(false);
  };

  // Tạo phiếu chỉ định xét nghiệm mới
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!recordId) return;

    setCreatingOrder(true);
    setError('');
    try {
      const createdOrderId = await createLabTestOrderApi({
        recordId,
        sampleType: newSampleType,
        sampleBarcode: newBarcode.trim() || null,
        collectedAt: new Date().toISOString(),
        status: 'PENDING',
      });

      setShowCreateForm(false);
      setNewBarcode('');
      await loadData(createdOrderId);
      if (showToast) {
        showToast('Tạo phiếu chỉ định xét nghiệm thành công!');
      }
    } catch (err) {
      const msg = err.message || 'Lỗi khi tạo phiếu chỉ định xét nghiệm';
      setError(msg);
      if (showToast) showToast(msg);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Bật chế độ chỉnh sửa / nhập kết quả cho phiếu đang chọn
  const handleStartEdit = () => {
    if (!selectedOrder) return;
    const rows = (selectedOrder.results || []).map((r) => ({
      indicatorId: r.indicatorId,
      indicatorCode: r.indicatorCode,
      indicatorName: r.indicatorName,
      categoryGroup: r.categoryGroup,
      unit: r.unit || '',
      refTextRange: r.refTextRange || '',
      refMin: r.refMin,
      refMax: r.refMax,
      resultValue: r.resultValue ?? '',
      note: r.note ?? '',
    }));
    setDraftRows(rows);
    setIsEditing(true);
    setOnlyAbnormal(false);
  };

  // Nạp nhanh toàn bộ chỉ số thuộc một nhóm danh mục (Huyết học / Sinh hóa / Nước tiểu) vào bảng nhập
  const handleAddCategoryGroup = (categoryGroup) => {
    const existingIds = new Set(draftRows.map((r) => r.indicatorId));
    const toAdd = indicators
      .filter((ind) => (ind.categoryGroup || '').toUpperCase() === categoryGroup && !existingIds.has(ind.indicatorId))
      .map((ind) => ({
        indicatorId: ind.indicatorId,
        indicatorCode: ind.indicatorCode,
        indicatorName: ind.indicatorName,
        categoryGroup: ind.categoryGroup,
        unit: ind.unit || '',
        refTextRange: ind.refTextRange || '',
        refMin: ind.refMin,
        refMax: ind.refMax,
        resultValue: '',
        note: '',
      }));

    if (toAdd.length === 0) {
      if (showToast) showToast('Tất cả chỉ số của nhóm này đã có trong bảng nhập.');
      return;
    }

    setDraftRows((currentRows) => [...currentRows, ...toAdd]);
  };

  // Thêm lẻ một chỉ số từ danh mục chuẩn
  const handleAddSingleIndicator = () => {
    const id = Number(addIndicatorId);
    if (!id) return;
    if (draftRows.some((r) => r.indicatorId === id)) {
      if (showToast) showToast('Chỉ số này đã tồn tại trong bảng nhập.');
      return;
    }
    const found = indicators.find((ind) => ind.indicatorId === id);
    if (!found) return;

    setDraftRows((currentRows) => [
      ...currentRows,
      {
        indicatorId: found.indicatorId,
        indicatorCode: found.indicatorCode,
        indicatorName: found.indicatorName,
        categoryGroup: found.categoryGroup,
        unit: found.unit || '',
        refTextRange: found.refTextRange || '',
        refMin: found.refMin,
        refMax: found.refMax,
        resultValue: '',
        note: '',
      },
    ]);
    setAddIndicatorId('');
  };

  const handleDraftChange = (indicatorId, field, value) => {
    setDraftRows((currentRows) =>
      currentRows.map((row) => (row.indicatorId === indicatorId ? { ...row, [field]: value } : row))
    );
  };

  const handleRemoveDraftRow = (indicatorId) => {
    setDraftRows((currentRows) => currentRows.filter((row) => row.indicatorId !== indicatorId));
  };

  // Lưu đồng bộ toàn bộ kết quả xét nghiệm lên Backend (thêm/sửa và tự động xóa các chỉ số đã bị gỡ khỏi bảng)
  const handleSaveResults = async () => {
    if (!selectedOrder) return;

    const existingResults = selectedOrder.results || [];
    const validItems = draftRows
      .filter((row) => String(row.resultValue || '').trim() !== '')
      .map((row) => ({
        indicatorId: row.indicatorId,
        resultValue: String(row.resultValue).trim(),
        note: row.note ? String(row.note).trim() : null,
      }));

    if (validItems.length === 0) {
      if (existingResults.length === 0) {
        if (showToast) showToast('Vui lòng nhập giá trị cho ít nhất 1 chỉ số trước khi lưu.');
        return;
      }

      const confirmedClearAll = window.confirm(
        'Bạn đã gỡ toàn bộ chỉ số của phiếu xét nghiệm này. Xác nhận lưu để xóa hết các chỉ số đã nhập?'
      );
      if (!confirmedClearAll) return;
    }

    const keptIndicatorIds = new Set(validItems.map((item) => item.indicatorId));
    const removedCount = existingResults.filter((item) => !keptIndicatorIds.has(item.indicatorId)).length;

    setSaving(true);
    setError('');
    try {
      await saveLabTestResultsApi({
        orderId: selectedOrder.orderId,
        orderStatus: validItems.length > 0 ? 'COMPLETED' : 'PENDING',
        replaceAll: true,
        results: validItems,
      });

      setIsEditing(false);
      await loadData(selectedOrder.orderId);
      if (showToast) {
        if (removedCount > 0) {
          showToast(`Đã lưu ${validItems.length} chỉ số và xóa ${removedCount} chỉ số đã gỡ.`);
        } else {
          showToast(`Đã lưu ${validItems.length} chỉ số xét nghiệm (tự động gắn cờ bất thường).`);
        }
      }
    } catch (err) {
      const msg = err.message || 'Lỗi khi lưu kết quả xét nghiệm';
      setError(msg);
      if (showToast) showToast(msg);
    } finally {
      setSaving(false);
    }
  };

  // Xóa phiếu xét nghiệm đang chọn
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    const sampleName = normalizeSampleType(selectedOrder.sampleType);
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa phiếu xét nghiệm ${sampleName} (#${selectedOrder.orderId}) và toàn bộ chỉ số bên trong không?`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError('');
    try {
      await deleteLabTestOrderApi(selectedOrder.orderId);
      setIsEditing(false);
      await loadData();
      if (showToast) {
        showToast('Đã xóa phiếu xét nghiệm thành công!');
      }
    } catch (err) {
      const msg = err.message || 'Lỗi khi xóa phiếu xét nghiệm';
      setError(msg);
      if (showToast) showToast(msg);
    } finally {
      setDeleting(false);
    }
  };

  // Nhóm kết quả để hiển thị bảng ở chế độ Xem
  const groupedViewResults = useMemo(() => {
    if (!selectedOrder) return [];
    const list = selectedOrder.results || [];
    const filtered = onlyAbnormal
      ? list.filter((r) => {
          const f = (r.flag || '').toUpperCase();
          return f === 'HIGH' || f === 'LOW' || f === 'ABNORMAL';
        })
      : list;
    return groupLabResultsByCategory(filtered);
  }, [selectedOrder, onlyAbnormal]);

  // Danh sách chỉ số còn chưa có trong draftRows để chọn thêm lẻ
  const availableIndicators = useMemo(() => {
    const existingIds = new Set(draftRows.map((r) => r.indicatorId));
    return indicators.filter((ind) => !existingIds.has(ind.indicatorId));
  }, [indicators, draftRows]);

  const totalCount = selectedOrder?.results?.length || 0;
  const abnormalCount = selectedOrder ? countAbnormalResults(selectedOrder.results) : 0;
  const normalCount = totalCount - abnormalCount;

  return (
    <div className="diagnostic-reports-container lab-tests-container">
      {/* Cột danh sách phiếu chỉ định xét nghiệm bên trái */}
      <div className="diagnostic-sidebar">
        <div className="diagnostic-sidebar-header">
          <span className="diagnostic-sidebar-title">Phiếu xét nghiệm ({orders.length})</span>
          <button
            type="button"
            className="btn-add-report-pill"
            onClick={() => setShowCreateForm((v) => !v)}
            title="Tạo phiếu chỉ định xét nghiệm mới"
          >
            <IconPlus size={12} />
            <span>Tạo phiếu</span>
          </button>
        </div>

        {/* Form nhanh tạo phiếu chỉ định mới */}
        {showCreateForm && (
          <form className="lab-create-order-box" onSubmit={handleCreateOrder}>
            <div className="admin-form-group">
              <label className="admin-form-label">Loại mẫu bệnh phẩm</label>
              <select
                className="admin-form-input"
                value={newSampleType}
                onChange={(e) => setNewSampleType(e.target.value)}
              >
                {SAMPLE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form-group" style={{ marginTop: '8px' }}>
              <label className="admin-form-label">Mã vạch mẫu (Barcode - tùy chọn)</label>
              <input
                type="text"
                className="admin-form-input"
                value={newBarcode}
                onChange={(e) => setNewBarcode(e.target.value)}
                placeholder="VD: 261127-001234"
              />
            </div>
            <div className="lab-create-order-actions">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ height: '30px', fontSize: '12px', flex: 1 }}
                disabled={creatingOrder}
              >
                {creatingOrder ? 'Đang tạo...' : 'Xác nhận tạo'}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                style={{ height: '30px', fontSize: '12px' }}
                onClick={() => setShowCreateForm(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="admin-loading-indicator" style={{ padding: '24px 0', fontSize: '13px' }}>
            <IconRefreshCw size={18} className="spinning-icon" />
            <span>Đang tải phiếu xét nghiệm...</span>
          </div>
        ) : (
          <div className="diagnostic-reports-list">
            {orders.length === 0 ? (
              <div style={{ padding: '20px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                <p>Hồ sơ này chưa có phiếu xét nghiệm nào.</p>
                <button
                  type="button"
                  className="btn-add-report-pill"
                  style={{ marginTop: '8px' }}
                  onClick={() => setShowCreateForm(true)}
                >
                  <IconPlus size={12} />
                  <span>Tạo phiếu xét nghiệm</span>
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const isSelected = order.orderId === selectedOrderId;
                const sampleLabel = normalizeSampleType(order.sampleType);
                const statusMeta = getLabOrderStatusMeta(order.status);
                const resCount = order.results?.length || 0;
                const abnCount = countAbnormalResults(order.results);
                const isUrine = sampleLabel.includes('TIỂU');

                return (
                  <button
                    key={order.orderId}
                    type="button"
                    className={`diagnostic-report-card-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectOrder(order.orderId)}
                  >
                    <div className="report-card-top">
                      <span className={`modality-badge ${isUrine ? 'badge-ct' : 'badge-ecg'}`}>
                        {sampleLabel}
                      </span>
                      <span
                        className={`report-card-status ${
                          statusMeta.tone === 'completed' ? 'completed' : 'pending'
                        }`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="report-card-title">
                      Phiếu #{order.orderId} {order.sampleBarcode ? `- ${order.sampleBarcode}` : ''}
                    </div>
                    <div className="report-card-meta">
                      <span>{resCount} chỉ số</span>
                      {abnCount > 0 ? (
                        <span className="lab-abnormal-mini-pill">{abnCount} bất thường</span>
                      ) : resCount > 0 ? (
                        <span className="lab-normal-mini-pill">Bình thường</span>
                      ) : null}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Khung chi tiết bảng chỉ số xét nghiệm bên phải */}
      <div className="diagnostic-detail-panel">
        {error && (
          <div className="alert-tag danger" style={{ margin: '12px 24px 0' }}>
            {error}
          </div>
        )}

        {!selectedOrder ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
            <IconAlertTriangle size={36} style={{ color: '#0f766e', marginBottom: '12px' }} />
            <h3>Chưa có phiếu xét nghiệm được chọn</h3>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>
              Vui lòng chọn một phiếu ở danh sách bên trái hoặc bấm &quot;Tạo phiếu&quot; để thêm xét nghiệm Máu / Nước tiểu.
            </p>
          </div>
        ) : (
          <>
            {/* Header thông tin phiếu xét nghiệm */}
            <div className="diagnostic-panel-header">
              <div className="diagnostic-panel-title-row">
                <div>
                  <h3 className="diagnostic-panel-title">
                    Phiếu Xét Nghiệm {normalizeSampleType(selectedOrder.sampleType)}
                  </h3>
                  <div className="diagnostic-panel-sub">
                    Mã phiếu: #{selectedOrder.orderId}
                    {selectedOrder.sampleBarcode ? ` • Barcode: ${selectedOrder.sampleBarcode}` : ''}
                    {selectedOrder.collectedAt ? ` • Lấy mẫu: ${formatDateTime(selectedOrder.collectedAt)}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {!isEditing ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      style={{ height: '32px', fontSize: '12px' }}
                      onClick={handleStartEdit}
                    >
                      <IconPlus size={13} />
                      <span>{totalCount > 0 ? 'Sửa / Nhập thêm chỉ số' : 'Nhập kết quả chỉ số'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      style={{ height: '32px', fontSize: '12px' }}
                      onClick={() => setIsEditing(false)}
                    >
                      Quay lại chế độ xem
                    </button>
                  )}
                </div>
              </div>

              {/* Dải thống kê tóm tắt nhanh */}
              {!isEditing && totalCount > 0 && (
                <div className="lab-summary-strip">
                  <div className="lab-summary-pills">
                    <span className="lab-stat-pill stat-total">Tổng: {totalCount} chỉ số</span>
                    <span className="lab-stat-pill stat-normal">Bình thường: {normalCount}</span>
                    {abnormalCount > 0 && (
                      <span className="lab-stat-pill stat-abnormal">Bất thường (Cao/Thấp): {abnormalCount}</span>
                    )}
                  </div>

                  {abnormalCount > 0 && (
                    <label className="lab-filter-toggle">
                      <input
                        type="checkbox"
                        checked={onlyAbnormal}
                        onChange={(e) => setOnlyAbnormal(e.target.checked)}
                      />
                      <span>Chỉ hiện chỉ số bất thường</span>
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Thân bảng chỉ số: Chế độ XEM hoặc Chế độ NHẬP/SỬA */}
            <div className="diagnostic-form-body">
              {!isEditing ? (
                groupedViewResults.length === 0 ? (
                  <div className="diagnostic-card-block" style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px' }}>
                      {totalCount === 0
                        ? 'Phiếu này chưa có kết quả chỉ số xét nghiệm nào.'
                        : 'Không có chỉ số bất thường nào trong phiếu này.'}
                    </p>
                    {totalCount === 0 && (
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={handleStartEdit}
                      >
                        <IconPlus size={14} />
                        <span>Bắt đầu nhập kết quả xét nghiệm</span>
                      </button>
                    )}
                  </div>
                ) : (
                  groupedViewResults.map((group) => (
                    <div key={group.categoryGroup} className="diagnostic-card-block lab-group-block">
                      <div className="diagnostic-card-title">
                        <span>{group.meta.label}</span>
                        <span className="card-title-hint">{group.items.length} chỉ số</span>
                      </div>

                      <div className="lab-table-wrapper">
                        <table className="lab-results-table">
                          <thead>
                            <tr>
                              <th style={{ width: '110px' }}>Mã</th>
                              <th>Tên chỉ số xét nghiệm</th>
                              <th style={{ width: '110px', textAlign: 'right' }}>Kết quả</th>
                              <th style={{ width: '90px' }}>Đơn vị</th>
                              <th style={{ width: '150px' }}>Khoảng tham chiếu</th>
                              <th style={{ width: '110px', textAlign: 'center' }}>Đánh giá</th>
                              <th style={{ width: '150px' }}>Thiết bị / Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.items.map((item) => {
                              const flagMeta = getLabFlagMeta(item.flag);
                              const isAbnormal = flagMeta.code !== 'NORMAL';

                              return (
                                <tr
                                  key={item.resultId || item.indicatorId}
                                  className={isAbnormal ? `lab-row-${flagMeta.tone}` : ''}
                                >
                                  <td className="lab-code-cell">{item.indicatorCode}</td>
                                  <td className="lab-name-cell">{item.indicatorName}</td>
                                  <td
                                    className={`lab-value-cell ${isAbnormal ? `lab-val-${flagMeta.tone}` : ''}`}
                                  >
                                    {item.resultValue}
                                  </td>
                                  <td className="lab-muted-cell">{item.unit || '—'}</td>
                                  <td className="lab-muted-cell lab-mono">{item.refTextRange || '—'}</td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className={`lab-flag-pill flag-${flagMeta.tone}`}>
                                      {flagMeta.label}
                                    </span>
                                  </td>
                                  <td className="lab-note-cell">
                                    {item.note || item.measuringDevice || '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* CHẾ ĐỘ NHẬP / CẬP NHẬT KẾT QUẢ CHỈ SỐ */
                <div className="diagnostic-card-block">
                  <div className="diagnostic-card-title">
                    <span>Nhập kết quả xét nghiệm</span>
                    <span className="card-title-hint">
                      Hệ thống tự động so sánh khoảng tham chiếu để gắn cờ Cao / Thấp / Bình thường khi lưu
                    </span>
                  </div>

                  {/* Thanh nạp nhanh theo nhóm danh mục chuẩn */}
                  <div className="lab-quick-add-bar">
                    <span className="lab-quick-label">Nạp nhanh bộ chỉ số:</span>
                    {['HEMATOLOGY', 'BIOCHEMISTRY', 'URINALYSIS'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className="btn-add-report-pill"
                        onClick={() => handleAddCategoryGroup(cat)}
                      >
                        <IconPlus size={11} />
                        <span>{LAB_CATEGORY_CONFIG[cat].shortLabel}</span>
                      </button>
                    ))}
                  </div>

                  {/* Chọn thêm 1 chỉ số lẻ */}
                  <div className="lab-add-single-row">
                    <select
                      className="admin-form-input"
                      value={addIndicatorId}
                      onChange={(e) => setAddIndicatorId(e.target.value)}
                    >
                      <option value="">-- Chọn thêm 1 chỉ số lẻ từ danh mục ({availableIndicators.length}) --</option>
                      {availableIndicators.map((ind) => (
                        <option key={ind.indicatorId} value={ind.indicatorId}>
                          [{ind.indicatorCode}] {ind.indicatorName} ({ind.unit || 'Không đơn vị'})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={handleAddSingleIndicator}
                      disabled={!addIndicatorId}
                    >
                      Thêm dòng
                    </button>
                  </div>

                  {draftRows.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      Chưa có chỉ số nào trong bảng nhập. Bấm nút nạp nhanh bộ chỉ số Huyết học / Sinh hóa / Nước tiểu ở trên.
                    </div>
                  ) : (
                    <div className="lab-table-wrapper" style={{ marginTop: '12px' }}>
                      <table className="lab-results-table lab-edit-table">
                        <thead>
                          <tr>
                            <th style={{ width: '95px' }}>Mã</th>
                            <th>Tên chỉ số</th>
                            <th style={{ width: '130px' }}>Giá trị kết quả</th>
                            <th style={{ width: '85px' }}>Đơn vị</th>
                            <th style={{ width: '135px' }}>Tham chiếu</th>
                            <th style={{ width: '160px' }}>Ghi chú</th>
                            <th style={{ width: '44px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {draftRows.map((row) => (
                            <tr key={row.indicatorId}>
                              <td className="lab-code-cell">{row.indicatorCode}</td>
                              <td className="lab-name-cell">{row.indicatorName}</td>
                              <td>
                                <input
                                  type="text"
                                  className="admin-form-input lab-cell-input"
                                  value={row.resultValue}
                                  onChange={(e) =>
                                    handleDraftChange(row.indicatorId, 'resultValue', e.target.value)
                                  }
                                  placeholder="VD: 5.4 hoặc Âm tính"
                                />
                              </td>
                              <td className="lab-muted-cell">{row.unit || '—'}</td>
                              <td className="lab-muted-cell lab-mono">{row.refTextRange || '—'}</td>
                              <td>
                                <input
                                  type="text"
                                  className="admin-form-input lab-cell-input"
                                  value={row.note}
                                  onChange={(e) => handleDraftChange(row.indicatorId, 'note', e.target.value)}
                                  placeholder="Ghi chú..."
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="btn-delete-bullet"
                                  onClick={() => handleRemoveDraftRow(row.indicatorId)}
                                  title="Gỡ dòng này khỏi bảng nhập"
                                >
                                  &times;
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thanh công cụ chân trang */}
            <div className="diagnostic-action-footer">
              <div>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                >
                  <IconTrash size={14} />
                  <span>{deleting ? 'Đang xóa...' : 'Xóa phiếu này'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => loadData(selectedOrder.orderId)}
                  disabled={loading || saving}
                >
                  <IconRefreshCw size={14} />
                  <span>Tải lại</span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={handleSaveResults}
                    disabled={saving}
                  >
                    <IconCheck size={14} />
                    <span>{saving ? 'Đang lưu kết quả...' : 'Lưu kết quả xét nghiệm'}</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
