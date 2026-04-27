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
  getAll:     ()              => api.get('/fees'),
  setTotal:   (id, total)     => api.patch(`/fees/${id}/total`, { total_fees: total }),
  collectFee: (id, amount)    => api.post(`/fees/${id}/pay`, { amount }),
  getReceipts:(id)            => api.get(`/fees/${id}/receipts`),
};