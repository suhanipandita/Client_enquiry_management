import axios from 'axios';
const API_URL = 'http://localhost:5001/api/quotations';

export const getQuotations = () => axios.get(API_URL);
export const getQuotationById = (id) => axios.get(`${API_URL}/${id}`);
export const createQuotation = (data) => axios.post(API_URL, data);
export const updateQuotation = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const updateQuotationStatus = (id, status) => axios.patch(`${API_URL}/${id}/status`, { status });