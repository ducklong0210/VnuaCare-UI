// Tab 1: Khám thể lực & đo lường các dấu hiệu sinh tồn ban đầu
// Thu thập chỉ số nhân trắc học: chiều cao, cân nặng, vòng bụng, huyết áp, mạch, SpO2, nhịp thở
// Tự động tính chỉ số BMI, đánh giá thể trạng theo chuẩn WHO châu Á và cảnh báo mức huyết áp real-time

import { useEffect, useState } from 'react';
import { getVitalSignsApi, createVitalSignsApi, updateVitalSignsApi } from '../../../../api/vitalSignsApi.js';
import { IconCheck, IconRefreshCw } from '../../../SupportAgent/Icons.jsx';
const INITIAL_VITAL_SIGNS = {
  vitalSignId: null,
  heightCm: '',
  weightKg: '',
  bmi: '',
  waistCm: '',
  systolicBp: '',
  diastolicBp: '',
  heartRateBpm: '',
  respiratoryRate: '',
  spo2Percent: '',
  measuredBy: '',
};

// Đánh giá thể trạng dựa trên BMI (tiêu chuẩn WHO cho người châu Á)
function evaluateBmi(bmiValue) {
  if (!bmiValue || isNaN(bmiValue)) return null;
  const num = Number(bmiValue);
  if (num < 18.5) return { text: 'Nhẹ cân / Thể lực gầy', tagClass: 'badge-warning' };
  if (num < 23.0) return { text: 'Thể trạng bình thường / Cân đối', tagClass: 'badge-success' };
  if (num < 25.0) return { text: 'Thừa cân / Tiền béo phì', tagClass: 'badge-warning' };
  return { text: 'Béo phì / Cần điều chỉnh ăn uống', tagClass: 'badge-danger' };
}

// Đánh giá phân loại huyết áp
function evaluateBloodPressure(systolic, diastolic) {
  if (!systolic && !diastolic) return null;
  const sys = Number(systolic) || 0;
  const dia = Number(diastolic) || 0;
  if (sys === 0 && dia === 0) return null;

  if (sys >= 140 || dia >= 90) {
    return { text: 'Tăng huyết áp (Cần lưu ý theo dõi)', tagClass: 'badge-danger' };
  }
  if (sys >= 120 || dia >= 80) {
    return { text: 'Huyết áp tiền tăng (Hơi cao)', tagClass: 'badge-warning' };
  }
  if (sys < 90 || dia < 60) {
    return { text: 'Huyết áp thấp', tagClass: 'badge-warning' };
  }
  return { text: 'Huyết áp bình thường', tagClass: 'badge-success' };
}

export default function VitalSignsTab({ recordId, doctorsList = [], showToast }) {
  const [formData, setFormData] = useState(INITIAL_VITAL_SIGNS); // Đối tượng dữ liệu biểu mẫu chỉ số thể lực & chỉ số sinh tồn
  const [loading, setLoading] = useState(false); // Trạng thái đang tải dữ liệu chỉ số sinh tồn
  const [saving, setSaving] = useState(false); // Trạng thái đang lưu chỉ số sinh tồn
  const [message, setMessage] = useState(''); // Chuỗi thông báo thành công
  const [error, setError] = useState(''); // Chuỗi thông báo lỗi

  // Tải thông tin chỉ số sinh tồn đã có theo ID hồ sơ
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      if (!recordId) return;
      setLoading(true);
      setError('');

      try {
        const data = await getVitalSignsApi(recordId);
        if (!isCancelled && data) {
          setFormData({
            vitalSignId: data.vitalSignId || null,
            heightCm: data.heightCm ?? '',
            weightKg: data.weightKg ?? '',
            bmi: data.bmi ?? '',
            waistCm: data.waistCm ?? '',
            systolicBp: data.systolicBp ?? '',
            diastolicBp: data.diastolicBp ?? '',
            heartRateBpm: data.heartRateBpm ?? '',
            respiratoryRate: data.respiratoryRate ?? '',
            spo2Percent: data.spo2Percent ?? '',
            measuredBy: data.measuredBy ? String(data.measuredBy) : '',
          });
        }
      } catch {
        if (!isCancelled) {
          setError('Không thể tải chỉ số sinh tồn của hồ sơ này');
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

  // Tự động tính chỉ số BMI khi nhập chiều cao và cân nặng
  const handleHeightWeightChange = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    const h = Number(field === 'heightCm' ? value : nextForm.heightCm);
    const w = Number(field === 'weightKg' ? value : nextForm.weightKg);

    if (h > 0 && w > 0) {
      const heightMeter = h / 100;
      const calculatedBmi = (w / (heightMeter * heightMeter)).toFixed(2);
      nextForm.bmi = calculatedBmi;
    } else {
      nextForm.bmi = '';
    }

    setFormData(nextForm);
  };

  // Lưu chỉ số sinh tồn lên API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        recordId: Number(recordId),
        vitalSignId: formData.vitalSignId ? Number(formData.vitalSignId) : undefined,
        heightCm: formData.heightCm ? Number(formData.heightCm) : null,
        weightKg: formData.weightKg ? Number(formData.weightKg) : null,
        bmi: formData.bmi ? Number(formData.bmi) : null,
        waistCm: formData.waistCm ? Number(formData.waistCm) : null,
        systolicBp: formData.systolicBp ? Number(formData.systolicBp) : null,
        diastolicBp: formData.diastolicBp ? Number(formData.diastolicBp) : null,
        heartRateBpm: formData.heartRateBpm ? Number(formData.heartRateBpm) : null,
        respiratoryRate: formData.respiratoryRate ? Number(formData.respiratoryRate) : null,
        spo2Percent: formData.spo2Percent ? Number(formData.spo2Percent) : null,
        measuredBy: formData.measuredBy ? Number(formData.measuredBy) : null,
      };

      if (formData.vitalSignId) {
        await updateVitalSignsApi(payload);
      } else {
        await createVitalSignsApi(payload);
      }
      setMessage('Đã lưu chỉ số sinh tồn & thể lực thành công!');
      if (showToast) showToast('Đã lưu chỉ số sinh tồn thành công!');
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const bmiEval = evaluateBmi(formData.bmi);
  const bpEval = evaluateBloodPressure(formData.systolicBp, formData.diastolicBp);

  let submitText = 'Lưu chỉ số thể lực';
  if (saving) {
    submitText = 'Đang lưu...';
  }

  if (loading) {
    return (
      <div className="tab-loading-box">
        <IconRefreshCw size={20} className="spinning-icon" />
        <span>Đang tải chỉ số sinh tồn...</span>
      </div>
    );
  }

  return (
    <form className="exam-tab-pane" onSubmit={handleSubmit}>
      <div className="tab-pane-header">
        <div>
          <h3 className="tab-pane-title">Phiếu Khám Thể Lực & Chỉ Số Sinh Tồn</h3>
          <p className="tab-pane-desc">Được đo đạc tại bàn tiếp đón ban đầu trước khi vào các phòng khám chuyên khoa</p>
        </div>
      </div>

      {error && <div className="alert-tag danger mb-12">{error}</div>}
      {message && (
        <div className="alert-tag success mb-12">
          <IconCheck size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* Nhóm 1: Đo đạc thể lực & BMI */}
      <div className="exam-section-block">
        <div className="exam-block-title">1. Đo thể lực & Đánh giá thể trạng (BMI)</div>
        <div className="exam-grid-3">
          <div className="form-item">
            <label className="field-label">Chiều cao (cm)</label>
            <input
              type="number"
              step="0.5"
              className="text-input"
              placeholder="Ví dụ: 168"
              value={formData.heightCm}
              onChange={(e) => handleHeightWeightChange('heightCm', e.target.value)}
            />
          </div>

          <div className="form-item">
            <label className="field-label">Cân nặng (kg)</label>
            <input
              type="number"
              step="0.5"
              className="text-input"
              placeholder="Ví dụ: 62"
              value={formData.weightKg}
              onChange={(e) => handleHeightWeightChange('weightKg', e.target.value)}
            />
          </div>

          <div className="form-item">
            <label className="field-label">Chỉ số BMI (Tự động tính)</label>
            <input type="text" className="text-input bg-readonly" placeholder="Tự tính theo kg / m²" value={formData.bmi} readOnly />
          </div>
        </div>

        {bmiEval && (
          <div className="exam-eval-callout">
            <span>Kết quả BMI: </span>
            <strong className={`eval-pill ${bmiEval.tagClass}`}>{bmiEval.text}</strong>
          </div>
        )}

        <div className="exam-grid-3 mt-12">
          <div className="form-item">
            <label className="field-label">Vòng bụng / Vòng eo (cm)</label>
            <input
              type="number"
              step="0.5"
              className="text-input"
              placeholder="Ví dụ: 78"
              value={formData.waistCm}
              onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Nhóm 2: Các chỉ số sinh tồn */}
      <div className="exam-section-block mt-16">
        <div className="exam-block-title">2. Huyết áp & Các dấu hiệu sinh tồn</div>
        <div className="exam-grid-3">
          <div className="form-item">
            <label className="field-label">Huyết áp tâm thu (tối đa, mmHg)</label>
            <input
              type="number"
              className="text-input"
              placeholder="Ví dụ: 120"
              value={formData.systolicBp}
              onChange={(e) => setFormData({ ...formData, systolicBp: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">Huyết áp tâm trương (tối thiểu, mmHg)</label>
            <input
              type="number"
              className="text-input"
              placeholder="Ví dụ: 80"
              value={formData.diastolicBp}
              onChange={(e) => setFormData({ ...formData, diastolicBp: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">Mạch / Nhịp tim (lần/phút)</label>
            <input
              type="number"
              className="text-input"
              placeholder="Ví dụ: 75"
              value={formData.heartRateBpm}
              onChange={(e) => setFormData({ ...formData, heartRateBpm: e.target.value })}
            />
          </div>
        </div>

        {bpEval && (
          <div className="exam-eval-callout">
            <span>Đánh giá huyết áp: </span>
            <strong className={`eval-pill ${bpEval.tagClass}`}>{bpEval.text}</strong>
          </div>
        )}

        <div className="exam-grid-3 mt-12">
          <div className="form-item">
            <label className="field-label">Nhịp thở (lần/phút)</label>
            <input
              type="number"
              className="text-input"
              placeholder="Ví dụ: 18"
              value={formData.respiratoryRate}
              onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">Độ bão hòa oxy SpO2 (%)</label>
            <input
              type="number"
              step="0.1"
              className="text-input"
              placeholder="Ví dụ: 98.5"
              value={formData.spo2Percent}
              onChange={(e) => setFormData({ ...formData, spo2Percent: e.target.value })}
            />
          </div>

          <div className="form-item">
            <label className="field-label">Điều dưỡng / Bác sĩ đo</label>
            <select className="form-select" value={formData.measuredBy} onChange={(e) => setFormData({ ...formData, measuredBy: e.target.value })}>
              <option value="">-- Chọn người đo --</option>
              {doctorsList.map((doc) => (
                <option key={doc.doctorId} value={doc.doctorId}>{doc.fullName} ({doc.doctorCode})</option>
              ))}
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
