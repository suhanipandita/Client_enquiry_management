import axios from 'axios';

const API_URL = 'http://localhost:5001/api/invoices';

export const getInvoices = () => axios.get(API_URL);
export const getInvoiceById = (id) => axios.get(`${API_URL}/${id}`);
export const createInvoice = (data) => axios.post(API_URL, data);
export const updateInvoice = (id, data) => axios.put(`${API_URL}/${id}`, data);