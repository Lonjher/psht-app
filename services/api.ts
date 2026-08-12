import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from './authStore';

const api = axios.create({
  baseURL: 'http://10.0.2.2:8000/api', // Ganti dengan IP lokal kamu
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor attach token
api.interceptors.request.use(async (config) => {
  // Ambil dari memori dulu (lebih cepat & andal)
  let token = getAuthToken();

  // Kalau tidak ada, coba dari AsyncStorage
  if (!token) {
    token = await AsyncStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const loginApi = (email: string, password: string) =>
  api.post('/login', { email, password });

export const registerApi = (data: any) => api.post('/register', data);

export const logoutApi = () => api.post('/logout');

export const getProfile = () => api.get('/profile');

export const updateProfile = (data: any) => api.put('/profile', data);

// --- Welcome ---
export const cekAnggota = (nomor_anggota: string) => api.post('/cek-anggota', { nomor_anggota });

// --- Dashboard ---
export const getDashboard = () => api.get('/dashboard');

// --- Pengurus (Admin) ---
export const getPengurus = () => api.get('/pengurus');
export const createPengurus = (data: any) => api.post('/pengurus', data);
export const updatePengurus = (id: number, data: any) => api.put(`/pengurus/${id}`, data);
export const deletePengurus = (id: number) => api.delete(`/pengurus/${id}`);

// --- Users (Anggota) ---
export const getAnggota = (params?: any) => api.get('/users', { params });
export const createAnggota = (data: any) => api.post('/users', data);
export const updateAnggota = (id: number, data: any) => api.put(`/users/${id}`, data);
export const deleteAnggota = (id: number) => api.delete(`/users/${id}`);
export const approveAnggota = (id: number) => api.patch(`/users/${id}/approve`);

// --- Tingkatan ---
export const getTingkatan = () => api.get('/tingkatan');
export const createTingkatan = (data: any) => api.post('/tingkatan', data);
export const updateTingkatan = (id: number, data: any) => api.put(`/tingkatan/${id}`, data);
export const deleteTingkatan = (id: number) => api.delete(`/tingkatan/${id}`);

// --- Kenaikan ---
export const getKenaikan = (params?: any) => api.get('/kenaikan', { params });
export const createKenaikan = (data: any) => api.post('/kenaikan', data);
export const updateKenaikan = (id: number, data: any) => api.put(`/kenaikan/${id}`, data);
export const deleteKenaikan = (id: number) => api.delete(`/kenaikan/${id}`);

// --- Riwayat Anggota ---
export const getRiwayatSaya = () => api.get('/riwayat-kenaikan');

export default api;
