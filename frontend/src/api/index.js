import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const getCustomers = async () => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(`${API_URL}/customer/${id}`);
  return response.data;
};

export const generateSummary = async (customerData) => {
  const response = await axios.post(`${API_URL}/summarize`, customerData);
  return response.data;
};
