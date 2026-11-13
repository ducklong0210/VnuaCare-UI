export const authorizationRouter = {
  login: '/api/v1/authorization/login',
  logout: '/api/v1/authorization/logout',
  refreshToken: '/api/v1/authorization/refreshtoken',
  checkToken: '/api/v1/authorization/check-token',
  forgotPassword: '/api/v1/authorization/forgot-password',
  resetPassword: '/api/v1/authorization/reset-password',
}

export const userManagerRouter = {
  getFilter: '/api/v1/users/filter',
  getSelect: '/api/v1/users/select',
  getRoles: '/api/v1/users/roles',
  getMe: '/api/v1/users/me',
  updateProfile: '/api/v1/users/profile',
  changePassword: '/api/v1/users/change-password',
  getById: (id) => `/api/v1/users/${id}`,
  update: '/api/v1/users/update',
  delete: (id) => `/api/v1/users/${id}`,
  resetPasswordById: (id) => `/api/v1/users/${id}/reset-password`,
}

export const staffRouter = {
  create: '/api/v1/staffs/add',
  update: '/api/v1/staffs/update',
  delete: (staffId) => `/api/v1/staffs/${staffId}`,
  getById: (id) => `/api/v1/staffs/${id}`,
  getFilter: '/api/v1/staffs/filter',
  getSelect: '/api/v1/staffs/select',
  getDepartments: '/api/v1/staffs/departments',
  importBatch: '/api/v1/staffs/import-batch',
}

export const doctorRouter = {
  create: '/api/v1/doctors/add',
  update: '/api/v1/doctors/update',
  delete: (doctorId) => `/api/v1/doctors/${doctorId}`,
  getById: (id) => `/api/v1/doctors/${id}`,
  getFilter: '/api/v1/doctors/filter',
  getSelect: '/api/v1/doctors/select',
  getSpecialties: '/api/v1/doctors/specialties',
}

export const campaignRouter = {
  create: '/api/v1/campaigns/add',
  update: '/api/v1/campaigns/update',
  getById: (id) => `/api/v1/campaigns/${id}`,
  delete: (id) => `/api/v1/campaigns/${id}`,
  getFilter: '/api/v1/campaigns/filter',
  getSelect: '/api/v1/campaigns/select',
}

export const healthRecordRouter = {
  create: '/api/v1/healthcheckuprecords/add',
  update: '/api/v1/healthcheckuprecords/update',
  getById: (id) => `/api/v1/healthcheckuprecords/${id}`,
  delete: (id) => `/api/v1/healthcheckuprecords/${id}`,
  getFilter: '/api/v1/healthcheckuprecords/filter',
  getCampaigns: '/api/v1/healthcheckuprecords/campaigns',
  getClassifications: '/api/v1/healthcheckuprecords/classifications',
  getStatuses: '/api/v1/healthcheckuprecords/statuses',
  getStaffs: '/api/v1/healthcheckuprecords/staffs',
  getDoctors: '/api/v1/healthcheckuprecords/doctors',
  getDepartments: '/api/v1/healthcheckuprecords/departments',
  saveInternalMedicineExam: '/api/v1/healthcheckuprecords/internal-medicine-exam',
  getInternalMedicineExam: (recordId) => `/api/v1/healthcheckuprecords/${recordId}/internal-medicine-exam`,
}
