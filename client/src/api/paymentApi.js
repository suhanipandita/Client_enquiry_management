import axios from 'axios';

const API_URL = 'http://localhost:5001/api/payments';

export const getPayments = () => axios.get(API_URL);

export const createPayment = (formData) =>
  axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updatePayment = (id, formData) =>
  axios.put(`${API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });