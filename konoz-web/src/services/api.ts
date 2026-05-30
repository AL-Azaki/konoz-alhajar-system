import axios from 'axios';

const api = axios.create({
  baseURL: 'https://konoz-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default api;