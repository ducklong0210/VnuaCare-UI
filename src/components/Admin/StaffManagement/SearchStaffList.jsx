// Component Container quản lý trung tâm dữ liệu và tương tác màn hình Cán bộ
// Điều phối kết nối StaffService, bộ lọc phòng ban, bảng danh sách và các modal quản trị
// Kết hợp các component con: StaffFilter, StaffTable và StaffDetail

import { useEffect, useState } from 'react';
import { StaffService } from '../../../services/admin/StaffService.js';
import { IconPlus, IconCheck, IconClose } from '../../../components/SupportAgent/Icons.jsx';
import StaffFilter from './StaffFilter.jsx';
import StaffTable from './StaffTable.jsx';
import StaffDetail from './StaffDetail.jsx';
import { ModelMode } from '../../../utils/index.js'
// Giá trị mặc định của form cán bộ
const INITIAL_FORM = {
    staffId: null,
    userId: '',
    staffCode: '',
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '',
    departmentId: '',
    jobTitle: '',
    academicTitle: '',
    phoneNumber: '',
    email: '',
    adrress: '',
    avatarUrl: '',
};

export default function SearchStaffList() {
    // Dữ liệu danh sách cán bộ, phòng ban và tài khoản người dùng
    const [staffs, setStaffs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bộ lọc tìm kiếm và phân trang
    const [search, setSearch] = useState('');
    const [selectedDept, setSelectedDept] = useState('ALL');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Thông báo toast
    const [toast, setToast] = useState('');
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => {
            setToast('');
        }, 3000);
    };

    // Quản lý Modal Thêm / Sửa cán bộ
    const [modalMode, setModalMode] = useState(null); // null | 'CREATE' | ModelMode.EDIT
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');
    const [formData, setFormData] = useState(INITIAL_FORM);

    // Quản lý Modal xác nhận xóa cán bộ
    const [deletingStaff, setDeletingStaff] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Tải danh mục Khoa / Phòng ban và User khi mở màn hình
    useEffect(() => {
        let isCancelled = false;

        const loadInitialData = async () => {
            try {
                const [deptRes, userRes] = await Promise.allSettled([
                    StaffService.getDepartments(),
                    StaffService.getUserSelect('STAFF'),
                ]);
                if (!isCancelled) {
                    if (deptRes.status === 'fulfilled') {
                        setDepartments(deptRes.value || []);
                    }
                    if (userRes.status === 'fulfilled') {
                        setUsersList(userRes.value || []);
                    }
                }
            } catch {
                // Bỏ qua lỗi danh mục nếu chưa có
            }
        };

        loadInitialData();

        return () => {
            isCancelled = true;
        };
    }, []);

    // Tải danh sách cán bộ theo bộ lọc và phân trang
    useEffect(() => {
        let isCancelled = false;

        const loadStaffs = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await StaffService.getStaffs({
                    textSearch: search.trim(),
                    departmentId: selectedDept,
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                });
                if (!isCancelled) {
                    setStaffs(res.items || []);
                    setTotalCount(res.totalCount || 0);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message || 'Không thể kết nối đến máy chủ');
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        loadStaffs();

        return () => {
            isCancelled = true;
        };
    }, [search, selectedDept, pageNumber, pageSize, refreshKey]);

    // Mở form thêm mới cán bộ
    const handleOpenCreate = async () => {
        try {
            const data = await StaffService.getUserSelect('STAFF');
            setUsersList(data || []);
        } catch {
            // Bỏ qua lỗi tải danh sách user
        }

        setFormData({
            ...INITIAL_FORM,
            departmentId: departments[0]?.departmentId || '',
        });
        setModalError('');
        setModalMode(ModelMode.CREATE);
    };

    // Mở form chỉnh sửa cán bộ
    const handleOpenEdit = (staff) => {
        setFormData({
            staffId: staff.staffId,
            userId: staff.userId || '',
            staffCode: staff.staffCode || '',
            fullName: staff.fullName || '',
            gender: staff.gender || 'Nam',
            dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : '',
            departmentId:
                staff.departmentId ||
                departments.find((d) => d.departmentName === staff.departmentName)?.departmentId ||
                '',
            jobTitle: staff.jobTitle || '',
            academicTitle: staff.academicTitle || '',
            phoneNumber: staff.phoneNumber || '',
            email: staff.email || '',
            adrress: staff.adrress || '',
            avatarUrl: staff.avatarUrl || '',
        });
        setModalError('');
        setModalMode(ModelMode.EDIT);
    };

    // Đóng modal thêm / sửa
    const handleCloseModal = () => {
        setModalMode(null);
        setModalError('');
    };

    // Thay đổi trường form
    const handleFormChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Gửi dữ liệu form Thêm hoặc Sửa lên API
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError('');

        try {
            if (modalMode === ModelMode.CREATE) {
                if (!formData.userId) {
                    setModalError('Vui lòng chọn tài khoản người dùng liên kết');
                    setSubmitting(false);
                    return;
                }

                await StaffService.createStaff({
                    staffId: 0,
                    userId: Number(formData.userId),
                    staffCode: formData.staffCode.trim(),
                    fullName: formData.fullName.trim(),
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toISOString()
                        : null,
                    departmentId: Number(formData.departmentId),
                    departmentName: '',
                    email: formData.email.trim(),
                    isActive: true,
                    academicTitle: formData.academicTitle.trim(),
                    jobTitle: formData.jobTitle.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    adrress: formData.adrress.trim(),
                    avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : '',
                });
                showToast('Thêm cán bộ mới thành công!');
            } else if (modalMode === ModelMode.EDIT) {
                await StaffService.updateStaff({
                    staffId: formData.staffId,
                    staffCode: formData.staffCode.trim(),
                    fullName: formData.fullName.trim(),
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth
                        ? new Date(formData.dateOfBirth).toISOString()
                        : null,
                    departmentId: Number(formData.departmentId),
                    departmentName: '',
                    email: formData.email.trim(),
                    isActive: true,
                    academicTitle: formData.academicTitle.trim(),
                    jobTitle: formData.jobTitle.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    adrress: formData.adrress.trim(),
                    avatarUrl: formData.avatarUrl ? formData.avatarUrl.trim() : '',
                });
                showToast('Cập nhật thông tin cán bộ thành công!');
            }

            handleCloseModal();
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            setModalError(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    // Mở hộp thoại xác nhận xóa cán bộ
    const handleOpenDelete = (staff) => {
        setDeletingStaff({
            staffId: staff.staffId,
            staffCode: staff.staffCode,
            fullName: staff.fullName,
        });
    };

    // Xác nhận xóa cán bộ
    const handleConfirmDelete = async () => {
        if (!deletingStaff) return;
        setDeleteLoading(true);

        try {
            await StaffService.deleteStaff(deletingStaff.staffId);
            showToast(`Đã xóa cán bộ "${deletingStaff.fullName}" thành công!`);
            setDeletingStaff(null);
            setRefreshKey((prev) => prev + 1);
        } catch (err) {
            showToast(err.message || 'Không thể xóa cán bộ này');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Đặt lại bộ lọc tìm kiếm
    const handleResetFilter = () => {
        setSearch('');
        setSelectedDept('ALL');
        setPageNumber(1);
    };

    // Tính toán hiển thị phân trang
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const fromRecord = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
    const toRecord = Math.min(totalCount, pageNumber * pageSize);

    return (
        <div className="admin-page-container">
            {/* Thông báo thao tác thành công (Toast) */}
            {toast && (
                <div className="admin-toast">
                    <IconCheck size={16} />
                    <span>{toast}</span>
                </div>
            )}

            {/* Tiêu đề trang & Nút thêm cán bộ */}
            <div className="page-header-row">
                <div>
                    <h2 className="main-title">Quản lý nhân viên cán bộ</h2>
                    <span className="main-desc">
                        Danh sách cán bộ, giảng viên Học viện Nông nghiệp Việt Nam ({totalCount} cán bộ)
                    </span>
                </div>
                <div className="header-btn-group">
                    <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
                        <IconPlus size={16} />
                        <span>Thêm cán bộ</span>
                    </button>
                </div>
            </div>

            {/* Bảng danh sách & Bộ lọc */}
            <div className="panel-card">
                <StaffFilter
                    search={search}
                    onSearchChange={(e) => {
                        setSearch(e.target.value);
                        setPageNumber(1);
                    }}
                    selectedDept={selectedDept}
                    onDeptChange={(e) => {
                        setSelectedDept(e.target.value);
                        setPageNumber(1);
                    }}
                    departments={departments}
                    onResetFilter={handleResetFilter}
                />

                <StaffTable
                    staffs={staffs}
                    loading={loading}
                    error={error}
                    onOpenEdit={handleOpenEdit}
                    onOpenDelete={handleOpenDelete}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    fromRecord={fromRecord}
                    toRecord={toRecord}
                    onPageChange={setPageNumber}
                    onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setPageNumber(1);
                    }}
                />
            </div>

            {/* Modal Thêm / Sửa Cán bộ */}
            <StaffDetail
                modalMode={modalMode}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSubmitForm}
                onClose={handleCloseModal}
                submitting={submitting}
                modalError={modalError}
                departments={departments}
                usersList={usersList}
                staffs={staffs}
            />

            {/* Modal Xác nhận Xóa cán bộ */}
            {deletingStaff && (
                <div className="modal-backdrop">
                    <div className="modal-card staff-delete-modal-card">
                        <div className="modal-head">
                            <span className="modal-title-text staff-delete-modal-title">
                                Xác nhận xóa cán bộ
                            </span>
                            <button
                                type="button"
                                className="modal-x"
                                onClick={() => setDeletingStaff(null)}
                            >
                                <IconClose size={16} />
                            </button>
                        </div>

                        <div className="modal-content">
                            <p className="staff-delete-modal-text">
                                Bạn có chắc chắn muốn xóa hồ sơ cán bộ <strong>&quot;{deletingStaff.fullName}&quot;</strong> (Mã CB: {deletingStaff.staffCode}) không?
                            </p>
                            <p className="staff-delete-modal-warn">
                                ⚠ Hành động này sẽ khóa hồ sơ và tài khoản của cán bộ này.
                            </p>
                        </div>

                        <div className="modal-foot">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => setDeletingStaff(null)}
                                disabled={deleteLoading}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn staff-delete-confirm-btn"
                                onClick={handleConfirmDelete}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
