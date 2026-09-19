import axios from 'axios';

const EMPLOYEE_URL = 'http://localhost:5001/api/employees';

export const getEmployees = () => axios.get(EMPLOYEE_URL);