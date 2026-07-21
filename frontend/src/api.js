import axios from 'axios';

const api = axios.create({ 
  baseURL: 'https://lk-school-backend.onrender.com/api' 
});

export const studentsAPI = {
  getAll:  ()        => api.get('/students'),
  create:  (data)    => api.post('/students', data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  update:  (id, data) => api.put(`/students/${id}`, data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  delete:  (id)      => api.delete(`/students/${id}`),
};

export const feesAPI = {
  getAll:        ()          => api.get('/fees'),
  getSummary:    ()          => api.get('/fees/summary'),
  setTotal:      (id, total) => api.patch(`/fees/${id}/total`, { total_fees: total }),
  collectFee:    (studentId, amount, months, fee_type, extra = {}) =>
    api.post(`/fees/${studentId}/pay`, { amount, months, fee_type, ...extra }),
  getReceipts:   (id)        => api.get(`/fees/${id}/receipts`),
  getAllReceipts: ()         => api.get('/fees/receipts/all'),
};

export const classFeesAPI = {
  getAll: ()               => api.get('/classfees'),
  setFee: (cls, feeType, amount) => api.post('/classfees', { class: cls, fee_type: feeType, amount }),
};