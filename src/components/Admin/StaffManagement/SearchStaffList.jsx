//
// Container điều phối chính của màn hình Quản lý Cán bộ và Giảng viên
// Gọi StaffService tải danh sách, phòng ban và kết nối StaffFilter, StaffTable cùng StaffDetail
//

import { useEffect, useState } from 'react';
import { StaffService } from '../../../services/admin/StaffService.js';
import { IconPlus, IconCheck, IconClose } from '../../../components/SupportAgent/Icons.jsx';
import StaffFilter from './StaffFilter.jsx';
import StaffTable from './StaffTable.jsx';
import StaffDetail from './StaffDetail.jsx';
import { ModelMode, ROLES } from '../../../utils/index.js';
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
    const [staffs, setStaffs] = useState([]); // Mảng danh sách cán bộ hiển thị trên bảng
    const [departments, setDepartments] = useState([]); // Mảng danh mục khoa/phòng ban (cho dropdown lọc & form)
    const [usersList, setUsersList] = useState([]); // Mảng danh sách tài khoản (Role STAFF) để liên kết khi tạo cán bộ
    const [loading, setLoading] = useState(false); // Trạng thái đang tải bảng cán bộ (true = đang tải)
    const [error, setError] = useState(null); // Chuỗi thông báo lỗi khi gọi API thất bại (null = không lỗi)

    // Bộ lọc tìm kiếm và phân trang
    const [search, setSearch] = useState(''); // Chuỗi từ khóa tìm kiếm (tên, mã cán bộ, SĐT, email)
    const [selectedDepartment, setSelectedDepartment] = useState('ALL'); // ID khoa/phòng đang chọn lọc ('ALL' = tất cả)
    const [pageNumber, setPageNumber] = useState(1); // Số trang hiện tại (bắt đầu từ 1)
    const [pageSize, setPageSize] = useState(10); // Số dòng cán bộ hiển thị trên mỗi trang
    const [totalCount, setTotalCount] = useState(0); // Tổng số cán bộ khớp bộ lọc (dùng tính tổng số trang)
    const [refreshKey, setRefreshKey] = useState(0); // Biến đếm tăng thêm 1 mỗi khi cần tải lại bảng (sau khi thêm/sửa/xóa)

    // Thông báo toast
    const [toast, setToast] = useState(''); // Chuỗi thông báo nổi góc màn hình (tự ẩn sau 3 giây)
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => {
            setToast('');
        }, 3000);
    };

    // Quản lý Modal Thêm / Sửa cán bộ
    const [modalMode, setModalMode] = useState(null); // Chế độ modal: null (đóng) | ModelMode.CREATE (tạo mới) | ModelMode.EDIT (sửa)
    const [submitting, setSubmitting] = useState(false); // Trạng thái đang gửi form Thêm/Sửa cán bộ lên API
    const [modalError, setModalError] = useState(''); // Chuỗi thông báo lỗi hiển thị bên trong modal Thêm/Sửa
    const [formData, setFormData] = useState(INITIAL_FORM); // Đối tượng lưu dữ liệu các ô nhập trong modal Thêm/Sửa cán bộ

    // Quản lý Modal xác nhận xóa cán bộ
    const [deletingStaff, setDeletingStaff] = useState(null); // Đối tượng cán bộ đang chờ xác nhận xóa (null = đóng hộp thoại)
    const [deleteLoading, setDeleteLoading] = useState(false); // Trạng thái đang gọi API xóa cán bộ

    // Tải danh mục Khoa / Phòng ban và User khi mở màn hình
    useEffect(() => {
        let isCancelled = false;

        const loadInitialData = async () => {
            try {
                const [departmentResponse, userResponse] = await Promise.allSettled([
                    StaffService.getDepartments(),
                    StaffService.getUserSelect(ROLES.STAFF),
                ]);
                if (!isCancelled) {
                    if (departmentResponse.status === 'fulfilled') {
                        setDepartments(departmentResponse.value || []);
                    }
                    if (userResponse.status === 'fulfilled') {
                        setUsersList(userResponse.value || []);
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
                    departmentId: selectedDepartment,
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
    }, [search, selectedDepartment, pageNumber, pageSize, refreshKey]);

    // Mở form thêm mới cán bộ
    const handleOpenCreate = async () => {
        try {
            const data = await StaffService.getUserSelect(ROLES.STAFF);
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
        setFormData((currentForm) => ({
            ...currentForm,
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
            setRefreshKey((currentKey) => currentKey + 1);
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
            setRefreshKey((currentKey) => currentKey + 1);
        } catch (err) {
            showToast(err.message || 'Không thể xóa cán bộ này');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Đặt lại bộ lọc tìm kiếm
    const handleResetFilter = () => {
        setSearch('');
        setSelectedDepartment('ALL');
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
                    selectedDepartment={selectedDepartment}
                    onDepartmentChange={(e) => {
                        setSelectedDepartment(e.target.value);
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
