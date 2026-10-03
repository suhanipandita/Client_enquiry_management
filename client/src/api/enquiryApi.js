import axios from 'axios';

const API_URL = 'http://localhost:5001/api/enquiries';
const CLIENT_URL = 'http://localhost:5001/api/clients';

export const getClients = () => axios.get(CLIENT_URL);
export const getEnquiries = () => axios.get(API_URL);
export const getEnquiryById = (id) => axios.get(`${API_URL}/${id}`);
export const createEnquiry = (data) => axios.post(API_URL, data);
export const updateEnquiry = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteEnquiry = (id) => axios.delete(`${API_URL}/${id}`);
export const searchEnquiries = (keyword) => axios.get(`${API_URL}/search?keyword=${keyword}`);