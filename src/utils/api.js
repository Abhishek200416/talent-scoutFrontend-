import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const api = {
  // Auth
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  verifyOTP: (data) => axios.post(`${API_URL}/auth/verify-otp`, data),
  resendOTP: (email) => axios.post(`${API_URL}/auth/resend-otp`, { email }),
  requestEmailChange: (oldEmail, newEmail) => axios.post(`${API_URL}/auth/request-email-change`, { old_email: oldEmail, new_email: newEmail }),
  verifyEmailChange: (oldEmail, otp) => axios.post(`${API_URL}/auth/verify-email-change`, { old_email: oldEmail, otp }),
  getUser: (email) => axios.get(`${API_URL}/auth/user/${email}`),
  
  // Password Auth
  setPassword: (email, password) => axios.post(`${API_URL}/auth/set-password`, { email, password }),
  loginWithPassword: (email, password) => axios.post(`${API_URL}/auth/login-password`, { email, password }),
  forgotPassword: (email) => axios.post(`${API_URL}/auth/forgot-password`, { email }),
  resetPassword: (email, otp, newPassword) => axios.post(`${API_URL}/auth/reset-password`, { email, otp, new_password: newPassword }),
  checkPasswordSet: (email) => axios.get(`${API_URL}/auth/check-password/${email}`),

  // Candidate Profile
  createCandidateProfile: (data) => axios.post(`${API_URL}/candidate/profile`, data),
  getCandidateProfile: (email) => axios.get(`${API_URL}/candidate/profile/${email}`),

  // Recruiter Profile
  createRecruiterProfile: (data) => axios.post(`${API_URL}/recruiter/profile`, data),
  getRecruiterProfile: (email) => axios.get(`${API_URL}/recruiter/profile/${email}`),

  // Wallet/Vault
  uploadWalletItem: (formData, onProgress) => axios.post(`${API_URL}/wallet/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
    timeout: 300000  // 5 minutes for large videos
  }),
  getWalletItems: (email) => axios.get(`${API_URL}/wallet/${email}`),
  deleteWalletItem: (email, fileId) => axios.delete(`${API_URL}/wallet/${email}/${fileId}`),
  renameWalletItem: (email, fileId, fileName) => axios.patch(`${API_URL}/wallet/${email}/${fileId}/rename`, { file_name: fileName }),
  updateWalletItem: (email, fileId, itemType, notes) => {
    const formData = new FormData();
    formData.append('item_type', itemType);
    if (notes) formData.append('notes', notes);
    return axios.put(`${API_URL}/wallet/${email}/${fileId}`, formData);
  },
  getWalletFile: (email, fileId) => `${API_URL}/wallet/file/${email}/${fileId}`,

  // AI Features
  parseResume: (data) => axios.post(`${API_URL}/ai/parse-resume`, data),
  parseFileWithVision: (email, fileId) => axios.post(`${API_URL}/ai/parse-file/${email}/${fileId}`, {}, { timeout: 180000 }),
  confirmSkills: (email, skills) => axios.post(`${API_URL}/ai/confirm-skills/${email}`, { skills }),
  parseJobDocument: (email, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/ai/parse-job-document/${email}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000
    });
  },
  transcribeVideo: (email, fileId) => axios.post(`${API_URL}/ai/transcribe-video/${email}/${fileId}`, {}, { timeout: 300000 }),
  generateOverview: (email) => axios.post(`${API_URL}/ai/overview/${email}`, {}, { timeout: 180000 }),
  matchJob: (data) => axios.post(`${API_URL}/ai/match-job`, data),
  matchJD: (data) => axios.post(`${API_URL}/ai/match-jd`, data, { timeout: 120000 }),

  // Blockchain
  verifyBlockchain: (email, fileId) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('file_id', fileId);
    return axios.post(`${API_URL}/blockchain/verify-hash`, formData);
  },
  checkBlockchain: (hash) => axios.get(`${API_URL}/blockchain/verify/${hash}`),
  getEthStatus: () => axios.get(`${API_URL}/blockchain/eth-status`),

  // Recruiter Jobs
  createJob: (data) => axios.post(`${API_URL}/recruiter/job`, data),
  getRecruiterJobs: (email) => axios.get(`${API_URL}/recruiter/jobs/${email}`),
  searchCandidates: (params) => axios.get(`${API_URL}/recruiter/candidates`, { params }),
  getCandidateDetail: (email) => axios.get(`${API_URL}/recruiter/candidate/${email}`),
  emailCandidate: (data) => axios.post(`${API_URL}/recruiter/email-candidate`, data),

  // Notifications
  getNotifications: (email) => axios.get(`${API_URL}/notifications/${email}`),
  markNotificationsRead: (email) => axios.post(`${API_URL}/notifications/mark-read/${email}`),
};

export default api;
